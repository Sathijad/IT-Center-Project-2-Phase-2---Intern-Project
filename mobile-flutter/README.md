# Flutter Mobile App - Phase 2

Employee mobile application for IT Center Leave & Attendance Management.

## Features

- ✅ Leave management
- ✅ Attendance tracking
- ✅ Clock in/out with geolocation
- ✅ Offline-ready architecture
- ✅ Modern UI/UX

## Getting Started

### Prerequisites

- Flutter SDK 3.0+
- Dart 3.0+
- Android Studio / VS Code
- Device or emulator

### Installation

```bash
cd mobile-flutter

# Get dependencies
flutter pub get

# Run app
flutter run

# Run tests
flutter test
```

## Build

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## Project Structure

```
lib/
├── main.dart
├── models/          # Data models
├── services/        # API services
├── providers/       # State management
└── screens/         # UI screens
    ├── auth/
    ├── home/
    ├── leave/
    └── attendance/
```

## License

MIT

