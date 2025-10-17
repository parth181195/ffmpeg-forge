# GitHub Actions Workflows

## main.yml - Unified Build, Publish & Deploy

**Trigger:** Push to `main` branch or manual dispatch

**What it does:**
1. **Build & Validate**
   - Type checking
   - Package build

2. **Auto-Version Bump**
   - Checks if current version in `package.json` already has a Git tag
   - If tag exists: Auto-bumps patch version (e.g., 0.3.1 → 0.3.2)
   - Updates `CHANGELOG.md` automatically
   - Commits with `[skip ci]` to avoid infinite loops

3. **Publish to npm**
   - Publishes new version to npm registry
   - Creates Git tag
   - Creates GitHub release

4. **Deploy Documentation**
   - Builds VitePress documentation (version auto-synced from package.json)
   - Deploys to GitHub Pages

### Simplified Release Process

**Just push to main!** 🎉

The workflow automatically:
1. Detects if the current version is already released
2. Bumps to next patch version (0.3.1 → 0.3.2)
3. Updates CHANGELOG.md
4. Publishes to npm
5. Creates Git tag and GitHub release
6. Deploys updated docs

### Manual Version Bump (Optional)

If you want to bump minor or major versions manually:

1. **Update version in package.json:**
   ```json
   "version": "0.4.0"  // or "1.0.0" for major
   ```

2. **Update CHANGELOG.md:**
   Add release notes for the new version

3. **Commit and push:**
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to 0.4.0"
   git push
   ```

The workflow will detect it's a new version and publish it!

### Documentation Version

The docs site version is now **automatically synced** from `package.json`. No manual update needed!

Location: `docs/.vitepress/config.mts`
```typescript
import pkg from '../../package.json';
// ...
text: `v${pkg.version}`  // Auto-syncs!
```

### Manual Trigger

You can manually trigger the workflow from GitHub:
1. Go to **Actions** tab
2. Select **Build, Publish & Deploy**
3. Click **Run workflow**
4. Select branch: `main`
5. Click **Run workflow** button

### Requirements

**GitHub Secrets:**
- `NPM_TOKEN` - npm authentication token for publishing
- `GITHUB_TOKEN` - Automatically provided by GitHub

**GitHub Pages:**
- Must be enabled in repository settings
- Source: GitHub Actions

### Preventing Infinite Loops

The auto-version bump commits with `[skip ci]` to prevent the workflow from triggering itself again.
