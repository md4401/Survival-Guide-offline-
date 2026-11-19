package app.survival.offline;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.os.Bundle;
import androidx.core.content.pm.PackageInfoCompat;
import com.getcapacitor.BridgeActivity;
import java.io.File;

public class MainActivity extends BridgeActivity {
    // Keys written by the web app (Capacitor Preferences plugin, file "CapacitorStorage").
    private static final String STORE = "CapacitorStorage";
    private static final String WEB_PREFS = "CapWebViewSettings"; // Capacitor's own file
    private static final String CAP_SERVER_PATH = "serverBasePath";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MagnetometerPlugin.class);
        applyLiveUpdate();
        super.onCreate(savedInstanceState);
    }

    /**
     * Live updates of the web part of the app (no reinstall).
     * liveState: "staged" = downloaded and verified, "trying" = started once, waiting for the app to confirm it runs, "ok" = confirmed.
     * If a bundle was started but never confirmed (it crashed or showed nothing), the next launch drops it and uses the bundled app again.
     * A bundle is ignored when it was made for another installed APK version.
     */
    private void applyLiveUpdate() {
        try {
            SharedPreferences store = getSharedPreferences(STORE, Context.MODE_PRIVATE);
            SharedPreferences web = getSharedPreferences(WEB_PREFS, Context.MODE_PRIVATE);
            String state = store.getString("liveState", "none");
            String path = store.getString("livePath", "");
            String apk = store.getString("liveApk", "");
            PackageInfo info = getPackageManager().getPackageInfo(getPackageName(), 0);
            String current = Long.toString(PackageInfoCompat.getLongVersionCode(info));

            if ("trying".equals(state)) {
                // The last start with this bundle never confirmed: roll back and remember it was bad.
                store.edit().putString("liveState", "none").putString("liveBad", store.getString("liveVersion", "")).putString("livePath", "").apply();
                web.edit().putString(CAP_SERVER_PATH, "").apply();
                return;
            }
            boolean usable = !path.isEmpty() && new File(path).exists() && current.equals(apk);
            if (usable && ("staged".equals(state) || "ok".equals(state))) {
                web.edit().putString(CAP_SERVER_PATH, path).apply();
                if ("staged".equals(state)) store.edit().putString("liveState", "trying").apply();
            } else {
                web.edit().putString(CAP_SERVER_PATH, "").apply();
                if (!"none".equals(state)) store.edit().putString("liveState", "none").apply();
            }
        } catch (Exception ignored) {
            // Never block the app from starting because of the update logic.
        }
    }
}
