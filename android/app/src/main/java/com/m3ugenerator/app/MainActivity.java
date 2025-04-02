package com.m3ugenerator.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.m3ugenerator.app.plugins.FileSystemPlugin;
import com.m3ugenerator.app.plugins.BackButtonPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register plugins
        registerPlugin(FileSystemPlugin.class);
        registerPlugin(BackButtonPlugin.class);
    }
}
