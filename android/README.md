# FTP M3U Generator Android App

This directory contains the Android implementation of the FTP M3U Generator app.

## Structure

- `app/`: The main Android application code
  - `src/main/java/com/m3ugenerator/app/`: Java source files
    - `MainActivity.java`: Main entry point for the Android app
    - `plugins/`: Custom Capacitor plugins
      - `FileSystemPlugin.java`: Native file system access for saving playlists
      - `BackButtonPlugin.java`: Custom back button handling
  - `src/main/res/`: Android resources (layouts, icons, strings, etc.)
  - `src/main/assets/`: Web assets (synchronized from the web build)
  - `src/main/AndroidManifest.xml`: App permissions and configuration

## Plugins

### FileSystemPlugin

This plugin allows the app to save M3U playlist files to the device's storage. Features:

- Save text files directly to Downloads folder
- Handles Android permissions automatically
- Provides detailed error messages

### BackButtonPlugin

This plugin handles the Android hardware back button:

- Allows navigation in the app
- Provides a proper exit functionality
- Ensures a native Android user experience

## Building

See the main project's `ANDROID_BUILD_GUIDE.md` for complete build instructions.

## Required Permissions

- `INTERNET`: For FTP connections
- `READ_EXTERNAL_STORAGE`: For reading files
- `WRITE_EXTERNAL_STORAGE`: For saving playlists
- `MANAGE_EXTERNAL_STORAGE`: For Android 11+ compatibility

## Troubleshooting

If you encounter issues:

1. Check that you have the latest Android Studio
2. Verify SDK versions in `build.gradle`
3. Make sure all required permissions are granted
4. Check logcat for detailed error messages