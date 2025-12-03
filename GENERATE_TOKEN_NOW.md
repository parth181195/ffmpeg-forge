# Generate Granular Access Token - Quick Guide

## Why We Need This
- OIDC Trusted Publishing alone doesn't work yet (npm still requires auth)
- Granular Access Tokens work with WebAuthn (no 6-digit code needed!)
- This token will enable automated publishing

## 🚀 Step-by-Step (3 Minutes)

### Step 1: Generate Token

1. **Open**: https://www.npmjs.com/settings/parth181195/tokens

2. **Click**: "Generate New Token" button

3. **Select**: "Granular Access Token"

4. **Fill in the form**:

   **Token name**:
   ```
   github-actions-ffmpeg-forge
   ```

   **Expiration**:
   ```
   90 days (maximum allowed)
   ```

   **Packages and scopes**:
   - Click "Select packages"
   - Find and select: `ffmpeg-forge`
   - Set permissions: **Read and write**

   **Bypass 2FA** (IMPORTANT!):
   - ✅ Check the box: "Automation: Bypass 2FA requirement for this token"
   - (This is under the packages section)

5. **Click**: "Generate Token"

6. **Copy the token** immediately (it won't be shown again!)

### Step 2: Add Token to GitHub

1. **Open**: https://github.com/parth181195/ffmpeg-forge/settings/secrets/actions

2. **Click**: "New repository secret" button

3. **Fill in**:
   - Name: `NPM_TOKEN`
   - Secret: (paste the token you copied)

4. **Click**: "Add secret"

### Step 3: Trigger Publish

The workflow will automatically run from the last push, OR you can:

1. **Open**: https://github.com/parth181195/ffmpeg-forge/actions/workflows/publish.yml

2. **Click**: "Run workflow" → Select `main` → Click "Run workflow"

## ✅ What Will Happen

The workflow will:
1. Build the package
2. Publish to npm using the Granular Access Token
3. Generate provenance attestations
4. Create v0.3.9 release
5. Deploy documentation

## ⏰ Token Expiration

- Granular tokens expire after 90 days
- Set a calendar reminder for ~85 days from now
- You'll need to regenerate and update the secret

## 🔒 Security

- Token is scoped only to `ffmpeg-forge` package
- Can only read and write that specific package
- Bypasses 2FA for automation (safe for GitHub Actions)
- More secure than classic tokens

---

**Ready?** Follow steps 1-3 above to publish v0.3.9! 🚀

