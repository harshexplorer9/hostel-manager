# Hostel Manager on iPhone

This app is now configured as an iOS-friendly Progressive Web App.

To install it on an iPhone:

1. Open the app URL in Safari.
2. Tap the Share button.
3. Tap Add to Home Screen.
4. Open Hostel Manager from the new home-screen icon.

Notes:

- Data is stored on the device in the browser using localStorage.
- Use Cloud Login to sync data across iPhone and laptop after Firebase is configured.
- Use Export regularly to keep a backup JSON file, especially before changing cloud settings.
- The app can load offline after it has been opened once.
- For App Store distribution, the same interface can be wrapped later in a native shell using Xcode, Capacitor, or a SwiftUI WebView.

## Cloud Login Setup

This app includes Firebase-ready login and sync.

1. Create a Firebase project.
2. Enable Authentication with Email/Password login.
3. Create a Firestore database.
4. Copy your Firebase `apiKey` and `projectId`.
5. Paste them into `cloud-config.js`.
6. Host this folder on an HTTPS domain, then open that URL in Safari.
7. Use Cloud Login in the app, then Add to Home Screen.

Suggested Firestore rule for personal use:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Important:

- `file://` and temporary localhost are not suitable for iPhone install and sync.
- iOS home-screen apps should be opened from an HTTPS URL.
- The same login on iPhone and laptop will load the same cloud data.
