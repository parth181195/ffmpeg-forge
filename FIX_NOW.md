# 🔧 Fix Publishing - Do This NOW

## The Problem
The `NPM_TOKEN` secret in GitHub is missing or expired.

## The Solution (5 Minutes)

### Part 1: Generate Granular Access Token (2 min)

**Step 1**: Open https://www.npmjs.com/settings/parth181195/tokens

**Step 2**: Click the green **"Generate New Token"** button

**Step 3**: Click **"Granular Access Token"** (NOT Classic)

**Step 4**: Fill in the form:

```
┌─────────────────────────────────────────┐
│ Token name:                             │
│ github-actions-ffmpeg-forge             │
├─────────────────────────────────────────┤
│ Expiration: 90 days (maximum)           │
├─────────────────────────────────────────┤
│ Packages and scopes:                    │
│ ☑ Select specific packages              │
│                                          │
│ Package name: ffmpeg-forge              │
│ Permissions: ☑ Read and write           │
├─────────────────────────────────────────┤
│ Automation:                              │
│ ☑ Bypass 2FA requirement                │
│   (CHECK THIS BOX - VERY IMPORTANT!)    │
└─────────────────────────────────────────┘
```

**Step 5**: Click **"Generate token"** button at the bottom

**Step 6**: **COPY THE TOKEN** (green text, shown only once!)
- It looks like: `npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Copy it to your clipboard NOW

---

### Part 2: Add Token to GitHub (1 min)

**Step 1**: Open https://github.com/parth181195/ffmpeg-forge/settings/secrets/actions

**Step 2**: Look for `NPM_TOKEN` in the list
- If it exists: Click "Update"
- If not: Click "New repository secret"

**Step 3**: Fill in:
```
Name: NPM_TOKEN
Secret: (paste the token you copied)
```

**Step 4**: Click **"Add secret"** or **"Update secret"**

---

### Part 3: Trigger Publish (1 min)

**Option A - Automatic** (Recommended):
The last push will automatically trigger publishing. Just wait ~2 minutes and check:
https://github.com/parth181195/ffmpeg-forge/actions

**Option B - Manual**:
1. Open: https://github.com/parth181195/ffmpeg-forge/actions/workflows/publish.yml
2. Click **"Run workflow"**
3. Select `main`
4. Click **"Run workflow"**

---

## ✅ Success Looks Like:

After ~3 minutes, you should see:
- ✅ Green checkmark on workflow
- ✅ Package published: https://www.npmjs.com/package/ffmpeg-forge
- ✅ Version 0.3.9 available
- ✅ GitHub release created

Then run:
```bash
cd /home/parth/WebstormProjects/missbliss
npm install ffmpeg-forge@0.3.9
```

---

## 🆘 Troubleshooting

**"Can't find bypass 2FA checkbox"**:
- It's in the Automation section when you select a package
- Make sure you selected "Granular Access Token" not "Classic"

**"Token not working"**:
- Make sure you copied the ENTIRE token (starts with `npm_`)
- Check you selected "Read and write" permissions
- Verify bypass 2FA is checked

---

**Current Status**: Waiting for you to complete Parts 1 & 2 above! 👆

