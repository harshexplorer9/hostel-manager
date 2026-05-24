# Build B M Boys Hostel as an iOS IPA

This web app can be installed on iPhone today as a PWA from Safari:

https://harshexplorer9.github.io/hostel-manager/?v=20

If you specifically need a `.ipa`, iOS requires a native wrapper plus Apple code signing.

## Requirements

- Full Xcode installed from the Mac App Store.
- An Apple ID signed in inside Xcode.
- For long-term install/TestFlight/App Store: Apple Developer Program membership.
- Node.js with `npm`.

## Recommended Wrapper

Use Capacitor to wrap the existing web app in a native iOS shell.

```sh
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "B M Boys Hostel" "com.bmboyshostel.manager" --web-dir .
npx cap add ios
npx cap sync ios
npx cap open ios
```

In Xcode:

1. Select the `App` project.
2. Open `Signing & Capabilities`.
3. Select your Apple Team.
4. Set bundle identifier, for example `com.bmboyshostel.manager`.
5. Connect your iPhone.
6. Click Run to install directly.

## Export IPA

In Xcode:

1. Product > Archive.
2. Distribute App.
3. Choose Development, Ad Hoc, TestFlight, or App Store.
4. Export the `.ipa`.

## Important Notes

- A normal website cannot directly create an installable iOS `.ipa`.
- The `.ipa` must be signed by Apple tools.
- For most personal use, Safari > Share > Add to Home Screen is simpler and free.
- Firebase sync will work from GitHub Pages and from a native wrapper if Firebase Auth domains and Firestore rules are correct.
