# Android Build Guide for FTP M3U Generator

This document explains how to build the Android APK version of the FTP M3U Generator application.

## Prerequisites

- Android Studio installed on your development machine
- JDK 11 or newer
- Node.js and npm installed
- Basic familiarity with Android development

## Preparing the Build

1. Clone or download this project to your local machine.
2. Install dependencies:
   ```
   npm install
   ```
3. Run the build preparation script:
   ```
   ./build-apk.sh
   ```
   This script will:
   - Build the web application
   - Copy the build files to the Android assets directory
   - Sync the Capacitor configuration

## Building the APK

Once the preparation is complete, you need to use Android Studio to build the final APK:

1. Open Android Studio
2. Select "Open an existing Android Studio project"
3. Navigate to and select the `android` folder in this project
4. Wait for Gradle to sync and index the project
5. Select `Build > Build Bundle(s) / APK(s) > Build APK(s)`
6. The APK will be generated in `android/app/build/outputs/apk/debug/`

## Installing on a Device

You can install the APK on your Android device using one of these methods:

1. **Direct from Android Studio:**
   - Connect your Android device to your computer via USB
   - Enable USB debugging on your device
   - Select `Run > Run 'app'` in Android Studio

2. **Manual installation:**
   - Copy the APK file to your Android device
   - On your device, navigate to the APK file and tap to install
   - You may need to enable "Install from unknown sources" in your device settings

## Required Permissions

The app requires the following permissions:

- `INTERNET`: To connect to FTP servers
- `READ_EXTERNAL_STORAGE`: To read media files
- `WRITE_EXTERNAL_STORAGE`: To save generated M3U playlists

## Features

The Android version includes:

- Native file system access for saving playlists directly to your device
- Physical back button support for proper Android navigation
- Splash screen and app icon
- Full functionality of the web app in a native container

## Troubleshooting

- **Build Failures**: Make sure you have the latest Android Studio and all SDK components updated
- **Runtime Crashes**: Check the logs using `adb logcat` while running the app
- **Permission Issues**: Ensure the app has been granted all required permissions in Android settings