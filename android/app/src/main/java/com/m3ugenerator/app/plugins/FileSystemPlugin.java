package com.m3ugenerator.app.plugins;

import android.content.Context;
import android.os.Environment;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;

@CapacitorPlugin(name = "FileSystem")
public class FileSystemPlugin extends Plugin {
    private static final String TAG = "FileSystemPlugin";
    
    @PluginMethod
    public void saveFile(PluginCall call) {
        String content = call.getString("content");
        String fileName = call.getString("fileName");
        String directory = call.getString("directory", "Downloads");
        
        if (content == null || fileName == null) {
            call.reject("Content and fileName are required");
            return;
        }
        
        try {
            File storageDir;
            if ("Downloads".equals(directory)) {
                storageDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            } else {
                // Default to app's internal files directory if directory is not recognized
                Context context = getContext();
                storageDir = context.getFilesDir();
            }
            
            if (!storageDir.exists()) {
                storageDir.mkdirs();
            }
            
            File outputFile = new File(storageDir, fileName);
            
            FileOutputStream fos = new FileOutputStream(outputFile);
            OutputStreamWriter writer = new OutputStreamWriter(fos);
            writer.write(content);
            writer.close();
            fos.close();
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("path", outputFile.getAbsolutePath());
            call.resolve(ret);
            
        } catch (IOException e) {
            Log.e(TAG, "Error saving file", e);
            call.reject("Error saving file: " + e.getMessage());
        }
    }
}