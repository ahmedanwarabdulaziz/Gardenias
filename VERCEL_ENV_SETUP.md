# Vercel Environment Variables Setup Guide

## 🔐 Required Environment Variables

Since your app is deployed on Vercel, you need to configure environment variables for production. Here's what you need to set:

## 📋 Quick Checklist

✅ Firebase Configuration (6 variables)  
✅ Cloudflare Configuration (2 variables)  
✅ Optional: Build Version

---

## 🚀 How to Add Environment Variables in Vercel

### Step 1: Access Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **Gardenias** (or your project name)

### Step 2: Navigate to Environment Variables
1. Click on **Settings** (top menu)
2. Click on **Environment Variables** (left sidebar)

### Step 3: Add Variables
Click **Add New** and add each variable one by one:

---

## 🔥 Firebase Variables (Required)

These are needed for Firebase to work in production:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBk2XbTx796D8_fBk3PoC30kvFH-NlaGLw` | Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `gardenias-522c7.firebaseapp.com` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `gardenias-522c7` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `gardenias-522c7.firebasestorage.app` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `529552820037` | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:529552820037:web:86c37b3cae2e34c1bc602c` | Firebase App ID |

**Note**: The `NEXT_PUBLIC_` prefix is important! It makes these variables available in the browser.

---

## ☁️ Cloudflare Variables (Required for Image Uploads)

If you're using Cloudflare for image storage:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID` | `Pn5aH9t_IMjyKLkdUjS2aW7RxAMbrOPpcWqtLfGx` | Cloudflare Account ID |
| `CLOUDFLARE_API_TOKEN` | `Pn5aH9t_IMjyKLkdUjS2aW7RxAMbrOPpcWqtLfGx` | Cloudflare API Token (keep secret) |

**Important**: `CLOUDFLARE_API_TOKEN` should NOT have `NEXT_PUBLIC_` prefix (server-side only)

---

## ⚙️ Environment Selection

When adding variables, you can choose:

- ✅ **Production** - Live site (gardenias-healthcare.net)
- ✅ **Preview** - Preview deployments (pull requests, branches)
- ✅ **Development** - Local development (optional)

**Recommendation**: Select all three for consistency.

---

## 🔄 After Adding Variables

1. **Redeploy**: Vercel will automatically trigger a new deployment
   - OR manually: Go to **Deployments** → Click **⋯** → **Redeploy**

2. **Verify**: Check that your app works correctly
   - Test Firebase connection
   - Test image uploads (if using Cloudflare)

---

## ⚠️ Important Notes

### Current Status
Your code currently has **hardcoded values** in:
- `lib/firebase.ts` - Firebase config
- `lib/cloudflare.ts` - Cloudflare config

### What This Means
- ✅ **Current**: App works because values are hardcoded
- ⚠️ **Risk**: Values are exposed in your code (not ideal for security)
- ✅ **Solution**: Move to environment variables (recommended)

### Do You NEED to Add Variables?
**Short answer: NO, if your app is already working.**

**However**, it's **best practice** to:
1. Move sensitive values to environment variables
2. Keep API tokens secret (especially Cloudflare API token)
3. Make it easier to change settings without code changes

---

## 🛠️ Optional: Update Code to Use Environment Variables

If you want to properly use environment variables, we can update:
- `lib/firebase.ts` - Read from `process.env.NEXT_PUBLIC_FIREBASE_*`
- `lib/cloudflare.ts` - Read from `process.env.CLOUDFLARE_*`

This is optional but recommended for security.

---

## 📝 Quick Copy-Paste for Vercel

### Firebase (All Environments)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBk2XbTx796D8_fBk3PoC30kvFH-NlaGLw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gardenias-522c7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gardenias-522c7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gardenias-522c7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=529552820037
NEXT_PUBLIC_FIREBASE_APP_ID=1:529552820037:web:86c37b3cae2e34c1bc602c
```

### Cloudflare (All Environments)
```
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=Pn5aH9t_IMjyKLkdUjS2aW7RxAMbrOPpcWqtLfGx
CLOUDFLARE_API_TOKEN=Pn5aH9t_IMjyKLkdUjS2aW7RxAMbrOPpcWqtLfGx
```

---

## 🎯 Summary

**Required for Production:**
- ✅ Firebase variables (if you want to move from hardcoded)
- ✅ Cloudflare variables (if using image uploads)

**Current Status:**
- ✅ Your app works without these (values are hardcoded)
- ✅ Adding them is optional but recommended
- ✅ They won't break anything if you add them

**Next Steps:**
1. Decide if you want to migrate to environment variables
2. If yes, add them to Vercel
3. We can update the code to use them (optional)

---

## ❓ Questions?

- **"Do I need to add these?"** → No, your app works. It's optional for better security.
- **"Will it break if I add them?"** → No, they'll just be available. Code still uses hardcoded values until we update it.
- **"Should I add them?"** → Yes, if you want better security practices and flexibility.


