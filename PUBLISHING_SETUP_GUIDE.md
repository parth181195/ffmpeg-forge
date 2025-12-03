# Publishing Setup Guide - Modern npm Authentication

## ⚠️ Important: Classic Tokens Deprecated
- Classic tokens sunset on **December 9, 2025**
- Must migrate to Granular Access Tokens or OIDC Trusted Publishing

## 🎯 Recommended: OIDC Trusted Publishing (Option 1)

**Benefits**: No secrets, no token rotation, automatic provenance, works with WebAuthn

### Step-by-Step Setup

#### 1. Configure Trusted Publisher on npm

1. Go to https://www.npmjs.com/package/ffmpeg-forge/access
2. Scroll to **"Publishing access"** section
3. Click **"Add a trusted publisher"**
4. Select **"GitHub Actions"**
5. Fill in the form:
   ```
   Repository owner: parth181195
   Repository name: ffmpeg-forge
   Workflow name: publish.yml
   Environment name: (leave empty)
   ```
6. Click **"Add trusted publisher"**

#### 2. Verify Workflow Configuration

Your workflows already have the required permissions:
```yaml
permissions:
  id-token: write  # Required for OIDC
  contents: write
```

#### 3. Test Publishing

Go to https://github.com/parth181195/ffmpeg-forge/actions/workflows/publish.yml
- Click **"Run workflow"**
- Select `main` branch  
- Click **"Run workflow"** button

The workflow will:
- ✅ Authenticate via OIDC (no token needed!)
- ✅ Publish with automatic provenance
- ✅ Create signed attestations

#### 4. Optional: Remove NPM_TOKEN Secret

Once OIDC is working, you can remove the `NPM_TOKEN` secret:
- Go to https://github.com/parth181195/ffmpeg-forge/settings/secrets/actions
- Delete `NPM_TOKEN` (if it exists)

## 🔑 Alternative: Granular Access Token (Option 2)

Use this if you can't use OIDC Trusted Publishing yet.

### Step-by-Step Setup

#### 1. Generate Granular Access Token

1. Go to https://www.npmjs.com/settings/parth181195/tokens
2. Click **"Generate New Token"** → **"Granular Access Token"**
3. Configure the token:

   **Basic Information**:
   - Token name: `github-actions-ffmpeg-forge`
   - Expiration: 90 days (maximum allowed)
   
   **Packages and scopes**:
   - Permissions: Select specific packages
   - Package: `ffmpeg-forge`
   - Permissions: ✅ **Read and write**
   
   **Organizations**: 
   - None (unless using scoped packages)
   
   **Automation**:
   - ✅ Enable **"Bypass 2FA requirement"** (required for GitHub Actions)

4. Click **"Generate Token"**
5. **Copy the token immediately** (shown only once!)

#### 2. Update GitHub Secret

1. Go to https://github.com/parth181195/ffmpeg-forge/settings/secrets/actions
2. Click **"New repository secret"** (or update existing `NPM_TOKEN`)
3. Name: `NPM_TOKEN`
4. Value: Paste the granular token
5. Click **"Add secret"** or **"Update secret"**

#### 3. Test Publishing

Go to https://github.com/parth181195/ffmpeg-forge/actions/workflows/publish.yml
- Click **"Run workflow"**
- Workflow will use the granular token

**Important**: Set a calendar reminder to regenerate the token before it expires (90 days).

## 📊 Comparison

| Feature | OIDC Trusted Publishing | Granular Access Token |
|---------|------------------------|----------------------|
| Security | ★★★★★ Most Secure | ★★★★☆ Secure |
| Expiration | Never | 90 days max |
| Rotation Needed | No | Yes, every 90 days |
| Setup Complexity | Medium | Easy |
| Works with WebAuthn | ✅ Yes | ✅ Yes (with bypass) |
| Provenance | ✅ Automatic | ✅ With --provenance flag |
| Secrets Management | ✅ None needed | ❌ Secret required |

## 🚀 Publishing ffmpeg-forge@0.3.9

Once authentication is set up:

### Option A: Manual Workflow Trigger
1. Go to https://github.com/parth181195/ffmpeg-forge/actions/workflows/publish.yml
2. Click "Run workflow" → Select `main` → Click "Run workflow"

### Option B: Push to Main
Any push to `main` will trigger the auto-publish workflow.

## ✅ Verification

After publishing, verify:

```bash
# Check version
npm view ffmpeg-forge version
# Should show: 0.3.9

# Check provenance
npm view ffmpeg-forge --json | grep attestations
# Should show provenance data

# Install and verify
npm install ffmpeg-forge@0.3.9
npm audit signatures
# Should show: "1 package has verified provenance attestations"
```

## 📚 References

- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers)
- [npm Granular Access Tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens)
- [GitHub OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Classic Token Sunset](https://github.blog/changelog/2024-10-24-support-for-npm-classic-tokens-to-be-sunset-starting-2025-01-01/)

## 🎯 Recommendation

**Use OIDC Trusted Publishing** - It's the future of secure package publishing and eliminates token management entirely!

