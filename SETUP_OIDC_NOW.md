# 🚀 Setup OIDC Trusted Publishing NOW - 5 Minute Guide

## Why OIDC?
- ✅ No tokens to manage or rotate
- ✅ Works perfectly with WebAuthn 2FA
- ✅ Most secure option (industry standard)
- ✅ Automatic provenance attestations
- ✅ Never expires

## 📋 Step-by-Step (5 Minutes)

### Step 1: Configure npm Trusted Publisher

1. **Open**: https://www.npmjs.com/package/ffmpeg-forge/access

2. **Login** to npm (use your WebAuthn/passkey)

3. **Scroll down** to "Publishing access" section

4. **Click**: "Add a trusted publisher" button

5. **Select**: "GitHub Actions" from the provider dropdown

6. **Fill in the form**:
   ```
   Repository owner: parth181195
   Repository name: ffmpeg-forge
   Workflow filename: publish.yml
   Environment name: (leave empty)
   ```

7. **Click**: "Add trusted publisher"

8. **Confirm**: You should see GitHub Actions listed as a trusted publisher

### Step 2: Publish v0.3.9

1. **Open**: https://github.com/parth181195/ffmpeg-forge/actions/workflows/publish.yml

2. **Click**: "Run workflow" button (top right, green button)

3. **Select**: Branch `main`

4. **Click**: "Run workflow" button in the dialog

5. **Wait**: ~2-3 minutes for workflow to complete

6. **Check**: https://www.npmjs.com/package/ffmpeg-forge
   - Should show version 0.3.9
   - Should have provenance badge

### Step 3: Update missbliss

```bash
cd /home/parth/WebstormProjects/missbliss
npm install ffmpeg-forge@0.3.9
```

## ✅ That's It!

No tokens, no secrets, no expiration. Just pure OIDC magic! 🎉

## 🔍 What the Workflow Does

When you trigger it:
1. ✅ Checks out code
2. ✅ Runs type checks
3. ✅ Builds the package
4. ✅ Auto-bumps version if tag exists
5. ✅ Publishes to npm with OIDC (no token!)
6. ✅ Creates Git tag
7. ✅ Creates GitHub release
8. ✅ Builds and deploys documentation

## 🔒 Security Benefits

- **Provenance**: Every package has a signed attestation
- **Transparency**: Build logs are public
- **Verification**: Users can verify the package source
- **No Secrets**: Nothing to leak or steal

## 📱 Works with WebAuthn!

OIDC Trusted Publishing works perfectly with:
- ✅ Passkeys
- ✅ Security keys (YubiKey, etc.)
- ✅ Biometric authentication
- ✅ Any 2FA method

No 6-digit codes needed! 🎊

## 🆘 Troubleshooting

### "Publish failed with 404"
- Make sure you're logged into npm
- Verify the package exists: https://www.npmjs.com/package/ffmpeg-forge
- Check you added trusted publisher correctly

### "Permission denied"
- Verify repository owner and name are correct
- Make sure workflow filename is `publish.yml`
- Check permissions in workflow file (should have `id-token: write`)

### "OIDC token not found"
- Ensure `id-token: write` is in workflow permissions
- Verify trusted publisher is configured on npm
- Check you're running from the correct repository

## 📚 More Information

- Full guide: `PUBLISHING_SETUP_GUIDE.md`
- OIDC details: `.github/NPM_OIDC_SETUP.md`
- Granular token alternative: `NPM_TOKEN_SETUP.md`

---

**Ready?** Go to Step 1 above and let's publish v0.3.9! 🚀

