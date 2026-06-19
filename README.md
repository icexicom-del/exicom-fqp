# Exicom EV FQP Manager — EVSE EPC Project

Firebase config is pre-configured for project: evse-epc

## Before deploying — 3 quick Firebase steps (done once)

### 1. Enable Google Sign-In
Firebase Console → Authentication → Get started → Google → Enable → Add your email → Save

### 2. Create Firestore Database  
Firebase Console → Firestore Database → Create database → Production mode → asia-south1 → Done
Then: Rules tab → paste this → Publish:
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} { allow read, write: if request.auth != null; }
    }
  }

### 3. Enable Storage
Firebase Console → Storage → Get started → Next → Done
Then: Rules tab → paste this → Publish:
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} { allow read, write: if request.auth != null; }
    }
  }

## Deploy to Vercel (no terminal needed)

1. Go to github.com → sign in (or create free account)
2. Click "+" → "New repository" → name it "exicom-fqp" → Create repository
3. Click "uploading an existing file" → drag the entire unzipped exicom-fqp folder → Commit changes
4. Go to vercel.com → Continue with GitHub
5. Click "Add New Project" → Import "exicom-fqp" repo → click Deploy
6. Done! You get a URL like https://exicom-fqp.vercel.app

## Mobile install (field team)
Open the Vercel URL on any phone → browser menu → "Add to Home Screen" → works like an app
