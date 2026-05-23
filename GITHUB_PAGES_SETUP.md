# GitHub Pages Setup

Ab jab GitHub account ban gaya hai, aap is app ko free HTTPS link par host kar sakte ho. Isse iPhone me app install karna possible ho jayega.

## Step 1: New repository banao

1. GitHub me login karo.
2. New repository banao.
3. Repository name kuch simple rakho, jaise `hostel-manager`.
4. Public repository choose karna easiest rahega.

## Step 2: Files upload karo

Repository me ye saari files/folders upload karo:

- `index.html`
- `styles.css`
- `app.js`
- `cloud-config.js`
- `manifest.webmanifest`
- `service-worker.js`
- `.nojekyll`
- `icons` folder
- `CLOUD_SETUP.md`
- `IOS_APP_README.md`

## Step 3: GitHub Pages enable karo

1. Repository me Settings open karo.
2. Pages section open karo.
3. Source me `Deploy from a branch` select karo.
4. Branch me `main` select karo.
5. Folder me `/root` select karo.
6. Save karo.

Kuch time baad GitHub aapko ek link dega:

```txt
https://YOUR_USERNAME.github.io/hostel-manager/
```

Isi link ko iPhone Safari me open karna hai.

## Step 4: iPhone me install karo

1. iPhone Safari me GitHub Pages link open karo.
2. Share button tap karo.
3. Add to Home Screen tap karo.
4. Hostel Manager icon se app open karo.

## Step 5: Login and sync

GitHub Pages sirf app ko host karta hai. Data sync ke liye Firebase setup zaroori hai.

1. Firebase setup karo.
2. `cloud-config.js` me `apiKey` aur `projectId` paste karo.
3. Updated `cloud-config.js` GitHub par upload/commit karo.
4. App open karo aur Cloud Login use karo.

Same Cloud Login iPhone aur laptop dono par use karne se data sync hoga.

## Important

- `localhost` mobile ke liye permanent nahi hota.
- `file://` iPhone install ke liye proper option nahi hai.
- GitHub Pages HTTPS link app install ke liye good hai.
- Firebase login data ko cloud me safe rakhega.
