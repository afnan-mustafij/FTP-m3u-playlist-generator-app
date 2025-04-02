#!/bin/bash

# Set up variables
MOBILE_INDEX="client/mobile-index.html"
MAIN_INDEX="client/index.html"
BACKUP_INDEX="client/index.html.bak"
MOBILE_MAIN="client/src/mobile-main.tsx"
VITE_CONFIG="vite.config.ts"
VITE_MOBILE_CONFIG="vite.capacitor.config.ts"
VITE_BACKUP="vite.config.ts.bak"

# Backup original files
cp "$MAIN_INDEX" "$BACKUP_INDEX"
cp "$VITE_CONFIG" "$VITE_BACKUP"

# Replace with mobile versions
cp "$MOBILE_INDEX" "$MAIN_INDEX"
cp "$VITE_MOBILE_CONFIG" "$VITE_CONFIG"

# Build the project
echo "Building the project with mobile configurations..."
npm run build

# Restore original files
mv "$BACKUP_INDEX" "$MAIN_INDEX"
mv "$VITE_BACKUP" "$VITE_CONFIG"

# Initialize Capacitor if not already initialized
if [ ! -d "android" ]; then
  echo "Initializing Capacitor and adding Android platform..."
  npx cap init "FTP M3U Generator" "com.m3ugenerator.app"
  npx cap add android
fi

# Make sure capacitor config exists
if [ ! -f "capacitor.config.ts" ]; then
  echo "Creating capacitor.config.ts..."
  cat > capacitor.config.ts << EOF
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.m3ugenerator.app',
  appName: 'FTP M3U Generator',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
EOF
fi

# Sync the web build with Capacitor
echo "Syncing web build with Capacitor..."
npx cap sync android

# Create a native build script
ANDROID_BUILD_SCRIPT="android/build-apk.sh"
if [ ! -f "$ANDROID_BUILD_SCRIPT" ]; then
  echo "Creating Android build script..."
  mkdir -p android
  cat > "$ANDROID_BUILD_SCRIPT" << EOF
#!/bin/bash
cd \$(dirname \$0)
./gradlew assembleDebug
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
  cp app/build/outputs/apk/debug/app-debug.apk ../ftp-m3u-generator.apk
  echo "APK built successfully at: ../ftp-m3u-generator.apk"
else
  echo "APK build failed or file not found."
fi
EOF
  chmod +x "$ANDROID_BUILD_SCRIPT"
fi

echo "Android project set up completed."
echo ""
echo "To build the APK, you need to run the native Android build:"
echo "1. Set up Android SDK and build tools on your local machine"
echo "2. Download this project and run the android/build-apk.sh script"
echo ""
echo "Alternatively, you can open the android folder in Android Studio and build from there."