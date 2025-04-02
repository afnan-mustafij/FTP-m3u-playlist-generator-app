#!/bin/bash

# Exit on error
set -e

echo "=== Building Android APK ==="
echo "This script will prepare the application for APK building"
echo "Note: The final APK needs to be built on a machine with Android Studio"

# 1. Build the web application
echo "1. Building web application..."
npm run build

# 2. Copy the build to Android assets directory
echo "2. Copying build to Android assets directory..."
mkdir -p android/app/src/main/assets/public
cp -r build/* android/app/src/main/assets/public/

# 3. Sync capacitor config
echo "3. Syncing Capacitor configuration..."
npx cap sync android

echo "=== Build preparation complete ==="
echo ""
echo "To generate the final APK:"
echo "1. Download this project directory"
echo "2. Open the 'android' folder in Android Studio"
echo "3. Select Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo "4. Find the generated APK in android/app/build/outputs/apk/debug/"
echo ""
echo "Note: You may need to configure gradle properties for your specific environment"