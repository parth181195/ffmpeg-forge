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

## NPM Token Still Required (For Now)

The workflow still uses `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` because:
- It's needed for the initial authentication with npm registry
- Works alongside OIDC for provenance
- Provides backward compatibility

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

## Migration Path (Future)

To fully adopt OIDC without NPM_TOKEN:
1. Configure npm registry to trust GitHub Actions OIDC
2. Remove `NODE_AUTH_TOKEN` secret
3. Update workflow to rely solely on `--provenance` flag

## References

- [npm Provenance Documentation](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [npm Audit Signatures](https://docs.npmjs.com/cli/v9/commands/npm-audit#signatures)

