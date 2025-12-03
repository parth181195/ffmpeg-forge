# NPM Authentication Setup for GitHub Actions

## Important: Classic Tokens Deprecated
- ❌ Classic tokens are sunset (creation disabled Nov 5, 2025)
- ❌ All classic tokens will be revoked Dec 9, 2025
- ✅ Must use Granular Access Tokens or OIDC Trusted Publishing

## Recommended: Option 1 - OIDC Trusted Publishing (No Tokens!)

This is the most secure method - no long-lived secrets needed!

### Step 1: Configure npm Trusted Publisher

1. Go to https://www.npmjs.com/package/ffmpeg-forge/access
2. Click "Publishing access" → "Add a trusted publisher"
3. Select **"GitHub Actions"**
4. Fill in:
   - **Repository owner**: `parth181195`
   - **Repository name**: `ffmpeg-forge`
   - **Workflow**: `publish.yml` (or `main.yml`)
   - **Environment**: leave empty (optional)
5. Click "Add trusted publisher"

### Step 2: Remove NPM_TOKEN Secret (Optional)

Once OIDC is configured, you can remove the `NPM_TOKEN` secret from GitHub.

### Step 3: Update Workflow

The workflow already has `id-token: write` permission and uses `--provenance` flag, so it's ready!

## Alternative: Option 2 - Granular Access Token

If you can't use OIDC trusted publishing:

### Step 1: Generate Granular Access Token

1. Go to https://www.npmjs.com/settings/parth181195/tokens
2. Click "Generate New Token" → **"Granular Access Token"**
3. Configure:
   - **Token name**: `github-actions-ffmpeg-forge`
   - **Expiration**: 90 days (maximum allowed)
   - **Packages and scopes**: 
     - Select specific packages: `ffmpeg-forge`
     - Permissions: **Read and write**
   - **Organizations**: None (unless needed)
   - **IP ranges**: None (GitHub Actions IPs change)
   - ⚠️ **Important**: Enable "Bypass 2FA" option for automation
4. Click "Generate token"
5. **Copy the token immediately**

### Step 2: Update GitHub Secret

1. Go to https://github.com/parth181195/ffmpeg-forge/settings/secrets/actions
2. Update `NPM_TOKEN` with the new granular token
3. Click "Update secret"

**Note**: Granular tokens expire after 90 days maximum, so you'll need to regenerate regularly.

### Step 3: Trigger Publishing

Option A - **Push a small change**:
```bash
cd /home/parth/WebstormProjects/node-ffmpeg-ts
echo "" >> README.md
git add README.md
git commit -m "chore: trigger publish workflow"
git push
```

Option B - **Manually trigger workflow**:
1. Go to https://github.com/parth181195/ffmpeg-forge/actions
2. Click "Build, Publish & Deploy" workflow
3. Click "Run workflow" button
4. Select `main` branch
5. Click "Run workflow"

### Step 4: Monitor Workflow

Watch the workflow run at:
https://github.com/parth181195/ffmpeg-forge/actions

The workflow will automatically:
- ✅ Build the package
- ✅ Publish to npm with provenance
- ✅ Create Git tag (v0.3.9)
- ✅ Create GitHub release
- ✅ Deploy documentation

## Alternative: GitHub Fine-Grained Token

If automation tokens don't work, you can use npm's granular access tokens:

1. Go to https://www.npmjs.com/settings/parth181195/tokens
2. Click "Generate New Token" → "Granular Access Token"
3. Set permissions:
   - Packages: Read and write
   - Organizations: None (unless scoped)
4. Select packages: `ffmpeg-forge`
5. Set expiration and generate
6. Update GitHub secret with this token

## WebAuthn + npm Automation Tokens

- ✅ Automation tokens work with WebAuthn 2FA
- ✅ They bypass 2FA for CI/CD purposes
- ✅ They're designed for this exact use case
- ⚠️ Keep them secure (never commit to code)

## After Token is Updated

The next push to `main` will automatically publish v0.3.9 with provenance! 🎉

