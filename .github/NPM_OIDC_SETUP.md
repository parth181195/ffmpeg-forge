# NPM OIDC (OpenID Connect) Setup

## Overview

This repository uses npm's provenance feature with OIDC for secure, keyless publishing. This provides:
- **Provenance attestations** - Cryptographic proof of where and how packages were built
- **No long-lived tokens** - Uses short-lived OIDC tokens instead of `NPM_TOKEN`
- **Transparency** - Users can verify the build provenance of published packages

## Current Configuration

### GitHub Actions Permissions
```yaml
permissions:
  contents: write      # For creating releases and pushing version bumps
  pages: write        # For deploying documentation
  id-token: write     # Required for OIDC token generation
```

### Publishing Command
```bash
npm publish --provenance --access public
```

The `--provenance` flag:
- Generates attestations linking the package to the source repository
- Uses OIDC tokens (via `id-token: write` permission)
- Provides transparency about the build environment

## How It Works

1. **OIDC Token Generation**: GitHub Actions generates a short-lived OIDC token
2. **npm Authentication**: The token is exchanged with npm for publishing access
3. **Provenance Creation**: npm creates a signed attestation linking:
   - Package version
   - Source repository
   - Commit SHA
   - Build workflow

4. **Public Verification**: Anyone can verify the package provenance:
   ```bash
   npm audit signatures
   ```

## Authentication Methods

### Recommended: OIDC Trusted Publishing (No Token Required!)

As of November 2025, npm supports **Trusted Publishing** with OIDC:
- ✅ No long-lived secrets needed
- ✅ Automatic provenance generation
- ✅ Direct authentication via GitHub Actions
- ✅ Most secure option

**Setup**: Configure trusted publisher at https://www.npmjs.com/package/ffmpeg-forge/access

Once configured, the workflow can publish without `NPM_TOKEN` secret!

### Alternative: Granular Access Token

If OIDC Trusted Publishing isn't set up, a granular access token can be used:
- ⚠️ Classic tokens are deprecated (sunset Dec 9, 2025)
- ✅ Granular tokens have fine-grained permissions
- ⚠️ Maximum 90-day expiration
- ✅ Can bypass 2FA for automation

**Setup**: See `NPM_TOKEN_SETUP.md` for detailed instructions

## Benefits

### For Package Consumers
- ✅ Verify packages were built from official source
- ✅ Detect supply chain attacks
- ✅ View build environment details

### For Maintainers
- ✅ No long-lived secrets in GitHub
- ✅ Automatic attestation generation
- ✅ Improved security posture

## Verification

After publishing, users can verify provenance:

```bash
# Install the package
npm install ffmpeg-forge

# Verify signatures and provenance
npm audit signatures
```

## Migration to OIDC Trusted Publishing

### Current State (Dec 2025)
npm now fully supports OIDC Trusted Publishing!

### Migration Steps:

1. **Configure Trusted Publisher on npm**:
   - Go to https://www.npmjs.com/package/ffmpeg-forge/access
   - Add GitHub Actions as trusted publisher
   - Specify repository: `parth181195/ffmpeg-forge`
   - Specify workflow: `publish.yml` (or `main.yml`)

2. **Test Without Token** (Optional):
   - Temporarily remove `NPM_TOKEN` secret from GitHub
   - Trigger workflow
   - npm will authenticate via OIDC

3. **Keep Token as Fallback** (Recommended):
   - Keep `NPM_TOKEN` secret configured
   - Workflow will try OIDC first, fall back to token
   - Provides redundancy

### Benefits of OIDC Trusted Publishing:
- 🔒 No long-lived secrets to rotate
- 🔐 Stronger security guarantees
- ⚡ Automatic provenance (no extra flags needed)
- 🎯 Per-package configuration
- ✅ Works with WebAuthn 2FA

## References

- [npm Provenance Documentation](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [npm Audit Signatures](https://docs.npmjs.com/cli/v9/commands/npm-audit#signatures)

