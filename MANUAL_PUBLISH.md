# Manual Publish Instructions

## Issue
The GitHub Actions npm token has expired. You need to publish manually.

## Steps to Publish v0.3.9

### 1. Ensure you're logged in to npm
```bash
cd /home/parth/WebstormProjects/node-ffmpeg-ts
npm whoami
# Should show: parth181195
```

### 2. Publish (Local Machine)

**Important**: The `--provenance` flag only works in GitHub Actions with OIDC.  
For local publishing, use:

```bash
npm publish --access public --otp=YOUR_6_DIGIT_CODE
```

Replace `YOUR_6_DIGIT_CODE` with the code from your authenticator app.

**Note**: Provenance attestations will only be available when published via GitHub Actions.

### 3. Verify publication
```bash
npm view ffmpeg-forge version
# Should show: 0.3.9
```

### 4. Update GitHub Secret (For Future Automated Publishes)

To fix the expired token for GitHub Actions:

1. Go to https://www.npmjs.com/
2. Click your profile → Access Tokens
3. Generate a new **Automation** token (Classic Token or Granular Token with publish permissions)
4. Go to https://github.com/parth181195/ffmpeg-forge/settings/secrets/actions
5. Update the `NPM_TOKEN` secret with the new token

### 5. Update missbliss project
```bash
cd /home/parth/WebstormProjects/missbliss
npm install ffmpeg-forge@0.3.9
```

## Alternative: Let GitHub Actions Publish

If you want GitHub Actions to handle it:
1. Update the NPM_TOKEN secret (see step 4 above)
2. Push a small change or trigger the workflow manually
3. The workflow will auto-publish on the next run

## Current Status
- ✅ Code committed and pushed to GitHub
- ✅ Version bumped to 0.3.9
- ✅ Tests passing (90/90)
- ✅ Build complete
- ⏳ Waiting for npm publish

