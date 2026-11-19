package app.survival.offline;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Reads the phone's magnetic field sensor (values in microtesla) for the metal detector. Data never leaves the device. */
@CapacitorPlugin(name = "Magnetometer")
public class MagnetometerPlugin extends Plugin implements SensorEventListener {
    private SensorManager manager;
    private Sensor sensor;

    private Sensor sensor() {
        if (manager == null) {
            manager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        }
        if (sensor == null && manager != null) {
            sensor = manager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        }
        return sensor;
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", sensor() != null);
        call.resolve(result);
    }

    @PluginMethod
    public void start(PluginCall call) {
        Sensor s = sensor();
        if (s == null) {
            call.reject("unavailable");
            return;
        }
        manager.unregisterListener(this);
        manager.registerListener(this, s, SensorManager.SENSOR_DELAY_GAME);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (manager != null) {
            manager.unregisterListener(this);
        }
        call.resolve();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        JSObject data = new JSObject();
        data.put("x", (double) event.values[0]);
        data.put("y", (double) event.values[1]);
        data.put("z", (double) event.values[2]);
        notifyListeners("reading", data);
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @Override
    protected void handleOnPause() {
        if (manager != null) {
            manager.unregisterListener(this);
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (manager != null) {
            manager.unregisterListener(this);
        }
    }
}
