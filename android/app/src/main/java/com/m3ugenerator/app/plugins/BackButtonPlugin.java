package com.m3ugenerator.app.plugins;

import android.app.Activity;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BackButton")
public class BackButtonPlugin extends Plugin {
    private static final String TAG = "BackButtonPlugin";
    
    @PluginMethod
    public void exitApp(PluginCall call) {
        try {
            Activity activity = getActivity();
            if (activity != null) {
                activity.finish();
                
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } else {
                Log.e(TAG, "Activity is null");
                call.reject("Activity not available");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error exiting app", e);
            call.reject("Error exiting app: " + e.getMessage());
        }
    }
}