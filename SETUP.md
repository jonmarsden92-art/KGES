# KG Resource Planner — Firebase Setup Guide

## What you get
- Real-time multi-user sync (Firestore)
- Secure file uploads (Firebase Storage)
- Email/password login with admin roles (Firebase Auth)
- Firestore security rules that enforce read/write permissions

---

## Step 1 — Create your Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it (e.g. `kg-resource-planner`)
3. Disable Google Analytics if you don't need it → **Create project**

---

## Step 2 — Enable the services you need

In the Firebase Console sidebar:

### Authentication
- Build → Authentication → Get started
- Sign-in method tab → **Email/Password** → Enable → Save

### Firestore Database
- Build → Firestore Database → Create database
- Choose **Production mode** (we'll upload rules in Step 5)
- Pick the `europe-west2` (London) region → Enable

### Storage
- Build → Storage → Get started
- Production mode → choose same region → Done

---

## Step 3 — Get your config keys

- Project Settings (gear icon) → Your apps → Web (`</>`)
- Register app (name it `kg-resource-web`)
- Copy the `firebaseConfig` object

Paste it into `firebaseConfig.js`:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123...",
};
```

---

## Step 4 — Install dependencies

```bash
npm install firebase
```

Your `package.json` will need at minimum:
```json
{
  "dependencies": {
    "firebase": "^10.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

---

## Step 5 — Upload security rules

### Firestore rules
- Firebase Console → Firestore → Rules tab
- Paste the contents of `firestore.rules` → Publish

### Storage rules
- Firebase Console → Storage → Rules tab
- Paste the contents of `storage.rules` → Publish

---

## Step 6 — Seed the database with sample data

This writes the 20 engineers and 8 sample jobs to Firestore.

```bash
# Install Admin SDK (only needed for seeding)
npm install firebase-admin

# Download your service account key:
# Firebase Console → Project Settings → Service Accounts
# → Generate new private key → save as serviceAccountKey.json
# (Keep this file secret — add it to .gitignore)

node seedFirestore.js
```

You should see:
```
Seeding engineers...
  ✓ James Thornton → abc123
  ✓ Sarah Mitchell → def456
  ...
Seeding jobs...
  ✓ Commercial HVAC Overhaul
  ...
Seed complete.
```

---

## Step 7 — Grant admin role to your account

You need to run this once to make yourself (or any user) an admin.
First create a Firebase Auth user in the console:
- Authentication → Users → Add user

Then run this Node script (replace the email):

```js
// grantAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

admin.auth().getUserByEmail("youremail@company.com").then(user => {
  return admin.auth().setCustomUserClaims(user.uid, { admin: true });
}).then(() => {
  console.log("Admin granted. User must sign out and back in.");
  process.exit(0);
});
```

```bash
node grantAdmin.js
```

Non-admin users can sign in and view all data but cannot create, edit, or delete anything.

---

## Step 8 — Wire the app together

Replace the `App.jsx` in your `src/` folder with `App.firebase.jsx`.

Your `src/` folder structure should look like:

```
src/
├── App.jsx                    ← replace with App.firebase.jsx content
├── firebaseConfig.js
├── hooks/
│   ├── useAuth.js
│   ├── useEngineers.js
│   ├── useJobs.js
│   └── useReports.js
└── components/
    ├── LoginScreen.jsx
    └── (all other components from the original file)
```

---

## Step 9 — Run the app

```bash
npm run dev       # Vite
# or
npm start         # Create React App
```

---

## Adding new users

1. Firebase Console → Authentication → Add user (set email + temp password)
2. Share credentials with the user — they can reset their password on first login
3. For admin access, run `grantAdmin.js` with their email

---

## Deploying to production (GitHub Pages / Firebase Hosting)

The repo already has a `.github/workflows/deploy.yml`. For Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set public directory to: dist  (or build for CRA)
# Configure as single-page app: Yes
firebase deploy
```

Add your Firebase config as GitHub Secrets and reference them in the workflow for CI/CD.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Missing or insufficient permissions" | Check Firestore rules are published; check user is signed in |
| Files not uploading | Check Storage rules are published; check file size < 20MB |
| Admin buttons not showing | Sign out and back in after running `grantAdmin.js` — token cache refreshes on login |
| Seeder fails | Make sure `serviceAccountKey.json` is in the same folder as `seedFirestore.js` |
| Real-time not updating | Check browser console for Firestore listener errors; check internet connection |
