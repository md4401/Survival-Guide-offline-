package app.survival.offline;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.os.Build;
import android.os.ParcelUuid;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Bluetooth LE byte pipe for the offline mesh. Every phone advertises one GATT service and also scans for it.
 * Two phones that see each other link up; bytes written by one side are delivered to the other. Framing, signing,
 * encryption and relaying are done in the web layer. Nothing leaves the device except to nearby phones running this app.
 * Not verified on real hardware yet.
 */
@SuppressLint("MissingPermission")
@CapacitorPlugin(
    name = "Ble",
    permissions = {
        @Permission(alias = "ble31", strings = { Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_ADVERTISE, Manifest.permission.BLUETOOTH_CONNECT }),
        @Permission(alias = "ble30", strings = { Manifest.permission.ACCESS_FINE_LOCATION })
    }
)
public class BlePlugin extends Plugin {
    static final UUID SERVICE = UUID.fromString("5d1f0a10-7c3e-4b7a-9d0e-5a6f2b1c0001");
    static final UUID CHAR = UUID.fromString("5d1f0a10-7c3e-4b7a-9d0e-5a6f2b1c0002");
    static final UUID CCCD = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    static final int MAX_CLIENTS = 4;

    /** Serialised outgoing queue: one write or notification in flight at a time. */
    abstract static class Out {
        final ArrayDeque<byte[]> q = new ArrayDeque<>();
        boolean busy;
        abstract boolean write(byte[] b);
        synchronized void add(byte[] b) {
            if (q.size() < 400) q.add(b);
            pump();
        }
        synchronized void pump() {
            while (!busy && !q.isEmpty()) {
                busy = write(q.poll());
            }
        }
        synchronized void done() {
            busy = false;
            pump();
        }
    }

    private BluetoothAdapter adapter;
    private BluetoothGattServer server;
    private BluetoothGattCharacteristic characteristic;
    private BluetoothLeAdvertiser advertiser;
    private BluetoothLeScanner scanner;
    private final Map<String, BluetoothGatt> clients = Collections.synchronizedMap(new HashMap<>());
    private final Map<String, Out> clientOut = Collections.synchronizedMap(new HashMap<>());
    private final List<String> pending = Collections.synchronizedList(new ArrayList<>());
    private final Map<String, BluetoothDevice> subscribers = Collections.synchronizedMap(new HashMap<>());
    private final Map<String, Out> subOut = Collections.synchronizedMap(new HashMap<>());
    private boolean running;

    private String alias() {
        return Build.VERSION.SDK_INT >= 31 ? "ble31" : "ble30";
    }

    private BluetoothAdapter adapter() {
        if (adapter == null) {
            BluetoothManager m = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
            if (m != null) adapter = m.getAdapter();
        }
        return adapter;
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject r = new JSObject();
        BluetoothAdapter a = adapter();
        r.put("available", a != null && getContext().getPackageManager().hasSystemFeature("android.hardware.bluetooth_le"));
        r.put("enabled", a != null && a.isEnabled());
        call.resolve(r);
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (getPermissionState(alias()) != PermissionState.GRANTED) {
            requestPermissionForAlias(alias(), call, "permResult");
            return;
        }
        begin(call);
    }

    @PermissionCallback
    private void permResult(PluginCall call) {
        if (getPermissionState(alias()) == PermissionState.GRANTED) begin(call);
        else call.reject("denied");
    }

    private void begin(PluginCall call) {
        BluetoothAdapter a = adapter();
        if (a == null || !a.isEnabled()) {
            call.reject("off");
            return;
        }
        stopAll();
        running = true;
        BluetoothManager m = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        server = m.openGattServer(getContext(), serverCb);
        if (server == null) {
            running = false;
            call.reject("unavailable");
            return;
        }
        characteristic = new BluetoothGattCharacteristic(
            CHAR,
            BluetoothGattCharacteristic.PROPERTY_WRITE | BluetoothGattCharacteristic.PROPERTY_NOTIFY,
            BluetoothGattCharacteristic.PERMISSION_WRITE
        );
        characteristic.addDescriptor(new BluetoothGattDescriptor(CCCD, BluetoothGattDescriptor.PERMISSION_READ | BluetoothGattDescriptor.PERMISSION_WRITE));
        BluetoothGattService svc = new BluetoothGattService(SERVICE, BluetoothGattService.SERVICE_TYPE_PRIMARY);
        svc.addCharacteristic(characteristic);
        server.addService(svc);

        advertiser = a.getBluetoothLeAdvertiser();
        if (advertiser != null) {
            AdvertiseSettings s = new AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setConnectable(true)
                .setTimeout(0)
                .build();
            AdvertiseData d = new AdvertiseData.Builder().setIncludeDeviceName(false).addServiceUuid(new ParcelUuid(SERVICE)).build();
            advertiser.startAdvertising(s, d, advCb);
        }
        scanner = a.getBluetoothLeScanner();
        if (scanner != null) {
            List<ScanFilter> f = new ArrayList<>();
            f.add(new ScanFilter.Builder().setServiceUuid(new ParcelUuid(SERVICE)).build());
            scanner.startScan(f, new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build(), scanCb);
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        stopAll();
        call.resolve();
    }

    private void stopAll() {
        running = false;
        try { if (scanner != null) scanner.stopScan(scanCb); } catch (Exception e) { /* already stopped */ }
        try { if (advertiser != null) advertiser.stopAdvertising(advCb); } catch (Exception e) { /* already stopped */ }
        synchronized (clients) {
            for (BluetoothGatt g : clients.values()) {
                try { g.close(); } catch (Exception e) { /* ignore */ }
            }
            clients.clear();
        }
        clientOut.clear();
        pending.clear();
        subscribers.clear();
        subOut.clear();
        try { if (server != null) server.close(); } catch (Exception e) { /* ignore */ }
        server = null;
        scanner = null;
        advertiser = null;
    }

    @Override
    protected void handleOnDestroy() {
        stopAll();
    }

    @PluginMethod
    public void send(PluginCall call) {
        String id = call.getString("id");
        String data = call.getString("data");
        if (id == null || data == null) {
            call.reject("args");
            return;
        }
        byte[] b = Base64.decode(data, Base64.NO_WRAP);
        Out o = clientOut.get(id);
        if (o == null) o = subOut.get(id);
        if (o == null) {
            call.reject("nopeer");
            return;
        }
        o.add(b);
        call.resolve();
    }

    private void emitPeer(String id, boolean connected) {
        JSObject o = new JSObject();
        o.put("id", id);
        o.put("connected", connected);
        notifyListeners("peer", o);
    }

    private void emitData(String id, byte[] value) {
        JSObject o = new JSObject();
        o.put("id", id);
        o.put("data", Base64.encodeToString(value, Base64.NO_WRAP));
        notifyListeners("data", o);
    }

    private final AdvertiseCallback advCb = new AdvertiseCallback() {};

    private final ScanCallback scanCb = new ScanCallback() {
        @Override
        public void onScanResult(int type, ScanResult r) {
            if (!running) return;
            final BluetoothDevice dev = r.getDevice();
            final String id = dev.getAddress();
            if (clients.containsKey(id) || pending.contains(id) || subscribers.containsKey(id)) return;
            if (clients.size() + pending.size() >= MAX_CLIENTS) return;
            pending.add(id);
            dev.connectGatt(getContext(), false, clientCb, BluetoothDevice.TRANSPORT_LE);
        }
    };

    private final BluetoothGattCallback clientCb = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt g, int status, int state) {
            final String id = g.getDevice().getAddress();
            if (state == BluetoothProfile.STATE_CONNECTED && status == BluetoothGatt.GATT_SUCCESS) {
                g.requestMtu(185);
            } else {
                boolean was = clients.remove(id) != null;
                pending.remove(id);
                clientOut.remove(id);
                try { g.close(); } catch (Exception e) { /* ignore */ }
                if (was) emitPeer(id, false);
            }
        }

        @Override
        public void onMtuChanged(BluetoothGatt g, int mtu, int status) {
            g.discoverServices();
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt g, int status) {
            BluetoothGattService s = g.getService(SERVICE);
            BluetoothGattCharacteristic c = s == null ? null : s.getCharacteristic(CHAR);
            if (c == null) {
                g.disconnect();
                return;
            }
            g.setCharacteristicNotification(c, true);
            BluetoothGattDescriptor d = c.getDescriptor(CCCD);
            if (d == null) {
                g.disconnect();
                return;
            }
            d.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
            g.writeDescriptor(d);
        }

        @Override
        public void onDescriptorWrite(BluetoothGatt g, BluetoothGattDescriptor d, int status) {
            final String id = g.getDevice().getAddress();
            final BluetoothGattCharacteristic c = d.getCharacteristic();
            pending.remove(id);
            if (status != BluetoothGatt.GATT_SUCCESS) {
                g.disconnect();
                return;
            }
            clients.put(id, g);
            clientOut.put(id, new Out() {
                @Override
                boolean write(byte[] b) {
                    c.setValue(b);
                    c.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
                    return g.writeCharacteristic(c);
                }
            });
            emitPeer(id, true);
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt g, BluetoothGattCharacteristic c, int status) {
            Out o = clientOut.get(g.getDevice().getAddress());
            if (o != null) o.done();
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c) {
            byte[] v = c.getValue();
            if (v != null) emitData(g.getDevice().getAddress(), v);
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c, byte[] value) {
            emitData(g.getDevice().getAddress(), value);
        }
    };

    private final BluetoothGattServerCallback serverCb = new BluetoothGattServerCallback() {
        @Override
        public void onConnectionStateChange(BluetoothDevice dev, int status, int state) {
            if (state != BluetoothProfile.STATE_CONNECTED) {
                String id = dev.getAddress();
                boolean was = subscribers.remove(id) != null;
                subOut.remove(id);
                if (was) emitPeer(id, false);
            }
        }

        @Override
        public void onCharacteristicWriteRequest(BluetoothDevice dev, int req, BluetoothGattCharacteristic c, boolean prep, boolean resp, int off, byte[] value) {
            if (resp && server != null) server.sendResponse(dev, req, BluetoothGatt.GATT_SUCCESS, off, value);
            if (value != null) emitData(dev.getAddress(), value);
        }

        @Override
        public void onDescriptorWriteRequest(BluetoothDevice dev, int req, BluetoothGattDescriptor d, boolean prep, boolean resp, int off, byte[] value) {
            if (resp && server != null) server.sendResponse(dev, req, BluetoothGatt.GATT_SUCCESS, off, value);
            final String id = dev.getAddress();
            if (!subscribers.containsKey(id)) {
                subscribers.put(id, dev);
                subOut.put(id, new Out() {
                    @Override
                    boolean write(byte[] b) {
                        if (server == null || characteristic == null) return false;
                        characteristic.setValue(b);
                        return server.notifyCharacteristicChanged(dev, characteristic, false);
                    }
                });
                emitPeer(id, true);
            }
        }

        @Override
        public void onNotificationSent(BluetoothDevice dev, int status) {
            Out o = subOut.get(dev.getAddress());
            if (o != null) o.done();
        }
    };
}
