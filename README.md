# FTP M3U Generator

A cross-platform application for connecting to FTP servers and generating M3U playlists for media files. This project includes a web interface and an Android app version.

![FTP M3U Generator](android/app/src/main/ic_launcher-playstore.png)

## Features

- Connect to FTP servers with optional authentication
- Search for media files across directories
- Generate M3U playlists with customizable options
- Organize media by seasons and episodes
- Save and manage multiple FTP servers
- Save playlists directly to your device (Android version)
- Mobile-optimized interface

## Web App

The web app version can be run directly in your browser:

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Navigate to the URL shown in your console

## Android App

The Android version provides native capabilities:

- Native file system access for saving playlists
- Hardware back button support
- Standard Android navigation patterns

### Building the Android APK

See [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md) for detailed instructions on building the Android app.

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Express.js, FTP client library
- **Android**: Capacitor, Custom native plugins
- **Build Tools**: Vite, Gradle (Android)

## Project Structure

- `/client` - Web frontend
- `/server` - Backend services
- `/shared` - Shared types and schemas
- `/android` - Android app code
  - Custom plugins for file system access
  - Custom back button handling
  - Android resources and configuration

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

This project was converted from an original Python script for FTP M3U generation.