# Quick Start: Publish v0.3.9 Now! 🚀

## Two Options to Publish

### ⭐ Option 1: OIDC Trusted Publishing (Recommended - No Token!)

#### Step 1: Configure npm Trusted Publisher (One-time setup)
1. Open: https://www.npmjs.com/package/ffmpeg-forge/access
2. Click "Publishing access" → **"Add a trusted publisher"**
3. Select **"GitHub Actions"**
4. Enter:
   - Repository owner: `parth181195`
   - Repository name: `ffmpeg-forge`
   - Workflow filename: `publish.yml`
5. Click **"Add trusted publisher"**

#### Step 2: Publish via GitHub Actions
1. Open: https://github.com/parth181195/ffmpeg-forge/actions/workflows/publish.yml
2. Click **"Run workflow"** button (top right)
3. Select branch: `main`
4. Click **"Run workflow"**

✅ **Done!** The workflow will publish v0.3.9 with provenance (no token needed)

---

### 🔑 Option 2: Granular Access Token (If OIDC doesn't work)

#### Step 1: Generate Token
1. Open: https://www.npmjs.com/settings/parth181195/tokens
2. Click **"Generate New Token"** → **"Granular Access Token"**
3. Configure:
   - Name: `github-actions-ffmpeg-forge`
   - Expiration: **90 days** (max)
   - Packages: Select `ffmpeg-forge` → Permissions: **Read and write**
   - ✅ Check **"Bypass 2FA requirement"** (under Automation section)
4. Click **"Generate token"**
5. **Copy the token NOW!** (won't be shown again)

#### Step 2: Add Token to GitHub
1. Open: https://github.com/parth181195/ffmpeg-forge/settings/secrets/actions
2. Click **"New repository secret"** (or update existing)
3. Name: `NPM_TOKEN`
4. Value: Paste the token
5. Click **"Add secret"**

#### Step 3: Publish via GitHub Actions
1. Open: https://github.com/parth181195/ffmpeg-forge/actions/workflows/publish.yml
2. Click **"Run workflow"** → Select `main` → Click **"Run workflow"**

✅ **Done!** Token will be used for publishing

---

## ✨ After Publishing

### Verify Publication
```bash
npm view ffmpeg-forge version
# Should show: 0.3.9
```

### Update missbliss Project
```bash
cd /home/parth/WebstormProjects/missbliss
npm install ffmpeg-forge@0.3.9
```

### Restart Services
```bash
# Restart your application to use the new library
pm2 restart all
# or manually restart your services
```

---

## 🎯 Quick Decision Guide

**Choose OIDC if**:
- ✅ You want the most secure option
- ✅ You don't want to manage tokens
- ✅ You're okay with a one-time npm configuration

**Choose Granular Token if**:
- ✅ You need immediate publishing
- ✅ You're okay rotating tokens every 90 days
- ✅ OIDC setup seems complicated

---

## 📝 What You're Publishing

**Version**: 0.3.9  
**Features**:
- 🔄 Rotation metadata support for MOV files
- 📊 `getDetailedVideoMetadata()` method
- 🏷️ Display Matrix side_data parsing
- 📱 iOS device video rotation detection

**Documentation**: All setup guides are in the repository!

---

## ⚡ Next Action

Choose your option above and follow the steps. Both will work perfectly! 🎉

