# Facebook App Setup Guide

## Quick Start: Get Your App ID in 5 Minutes

### Step 1: Create Facebook App

1. **Go to Facebook Developers Console**
   - URL: https://developers.facebook.com/apps/
   - Log in with your Facebook account

2. **Click "Create App"**
   - Green button in top right corner

3. **Select App Type**
   - Choose: **"Business"**
   - Click "Next"

4. **Fill in App Details**
   - **App Name**: `Marketplace Bulk Master` (or your preferred name)
   - **App Contact Email**: Your email address
   - Click "Create App"

5. **Complete Security Check**
   - Facebook may ask you to verify your identity

---

### Step 2: Add Facebook Login Product

1. **From App Dashboard**
   - Find **"Facebook Login"**
   - Click "Set Up"

2. **Configure OAuth Settings**
   - Go to: **Settings → Basic** (left sidebar)
   - Find your **App ID** (copy this!)
   - Add **App Domains**: `swipswaps.github.io`

3. **Set Valid OAuth Redirect URIs**
   - Go to: **Facebook Login → Settings**
   - Add: `https://swipswaps.github.io/Marketplace-Bulk-Master-FB/auth/callback`
   - Click "Save Changes"

---

### Step 3: Get Your App ID

Your **App ID** is in **Settings → Basic** (looks like: `1234567890123456`)

---

### Step 4: Configure .env.local

Create `.env.local` in project root:

```env
VITE_FACEBOOK_APP_ID=1234567890123456
VITE_FACEBOOK_API_VERSION=v24.0
```

⚠️ **Replace `1234567890123456` with YOUR actual App ID!**

---

### Step 5: Restart Dev Server

```bash
npm run dev
```

Done! The app will now connect to Facebook.
