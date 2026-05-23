# Cloud Sync Setup

Is app ko iPhone aur laptop dono par same data ke saath chalane ke liye app ko HTTPS par host karna hoga aur Firebase login/sync configure karna hoga.

## Why localhost/file is not enough

- `file://` app install/sync ke liye reliable nahi hota.
- `localhost` sirf usi computer par hota hai. Mobile format ya browser data clear hone par local data chala sakta hai.
- iPhone home-screen install ke liye HTTPS URL best hai.
- Cloud login ke baad same email/password se iPhone aur laptop dono par data load ho jayega.

## Firebase setup

1. Firebase console me new project banao.
2. Authentication me jaakar Email/Password provider enable karo.
3. Firestore Database create karo.
4. Project settings se Web app config me `apiKey` aur `projectId` copy karo.
5. [cloud-config.js](/Users/harshexplorer/Documents/Codex/2026-05-23/create-a-app-for-to-manage/cloud-config.js) me values paste karo:

```js
window.HOSTEL_CLOUD_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  projectId: "YOUR_FIREBASE_PROJECT_ID"
};
```

6. Firestore Rules me ye rule lagao:

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

## Hosting

App folder ko kisi HTTPS host par upload karo:

- Firebase Hosting
- Netlify
- Vercel
- GitHub Pages

GitHub account ban gaya hai to GitHub Pages easiest free hosting option hai. Detailed steps [GITHUB_PAGES_SETUP.md](/Users/harshexplorer/Documents/Codex/2026-05-23/create-a-app-for-to-manage/GITHUB_PAGES_SETUP.md) me hain.

## Install on iPhone

1. iPhone Safari me HTTPS app URL kholo.
2. Share button tap karo.
3. Add to Home Screen tap karo.
4. App icon se open karo.
5. Cloud Login karo.

## Install/use on laptop

1. Same HTTPS URL laptop browser me kholo.
2. Cloud Login karo.
3. Browser menu se Install/Add to Dock/Add to Home Screen option use karo, agar available ho.

## Sync behavior

- Login ke baad cloud data load hota hai.
- Har save ke baad app cloud par data upload karta hai.
- Offline me local data save hota rahega.
- Internet wapas aane par next save/upload se cloud update hoga.
- Export button backup ke liye use karte raho.
