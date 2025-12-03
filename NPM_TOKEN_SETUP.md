# NPM Token Setup for GitHub Actions

## Problem
Your npm account uses WebAuthn (passkey/biometric) for 2FA, which doesn't provide 6-digit codes.
GitHub Actions needs an automation token to publish packages.

## Solution: Create Automation Token

### Step 1: Generate New npm Automation Token

1. Go to https://www.npmjs.com/settings/parth181195/tokens
2. Click "Generate New Token"
3. Select **"Automation"** token type
4. Name it: `github-actions-ffmpeg-forge`
5. Set expiration (recommended: 1 year or no expiration for automation)
6. Click "Generate Token"
7. **Copy the token immediately** (you won't see it again!)

### Step 2: Update GitHub Secret

1. Go to https://github.com/parth181195/ffmpeg-forge/settings/secrets/actions
2. Find `NPM_TOKEN` in the list
3. Click "Update"
4. Paste the new automation token
5. Click "Update secret"

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

