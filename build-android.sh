#!/bin/bash

# First build the web application
npm run build

# Initialize Capacitor if not already initialized
if [ ! -d "android" ]; then
  echo "Initializing Capacitor and adding Android platform..."
  npx cap init "FTP M3U Generator" "com.m3ugenerator.app"
  npx cap add android
fi

# Sync the web build with Capacitor
echo "Syncing web build with Capacitor..."
npx cap sync android

echo "Android project is ready."
echo "To build the APK, you would normally run the following steps:"
echo "1. npx cap open android"
echo "2. In Android Studio, select Build > Build Bundle(s) / APK(s) > Build APK(s)"

# Automated build using gradle (if Android Studio is not available)
echo "Attempting to build APK directly..."
cd android
./gradlew assembleDebug

# Copy the generated APK to the root directory
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
  cp app/build/outputs/apk/debug/app-debug.apk ../ftp-m3u-generator.apk
  echo "APK built successfully at: ftp-m3u-generator.apk"
else
  echo "APK build failed or file not found."
fi