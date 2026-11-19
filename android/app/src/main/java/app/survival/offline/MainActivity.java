package app.survival.offline;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MagnetometerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
