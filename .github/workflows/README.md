# GitHub Actions Workflows

## main.yml - Unified Build, Publish & Deploy

**Trigger:** Push to `main` branch or manual dispatch

**What it does:**
1. **Build & Validate**
   - Type checking
   - Package build

2. **Publish to npm** (only if version in `package.json` changed)
   - Publishes package to npm registry
   - Creates Git tag
   - Creates GitHub release

3. **Deploy Documentation**
   - Builds VitePress documentation
   - Deploys to GitHub Pages

### How to Release a New Version

1. **Update version:**
   ```bash
   npm run version:patch  # For bug fixes (0.1.0 -> 0.1.1)
   npm run version:minor  # For new features (0.1.0 -> 0.2.0)
   npm run version:major  # For breaking changes (0.1.0 -> 1.0.0)
   ```

2. **Review and commit:**
   ```bash
   git add -A
   git commit -m "chore: bump version to X.X.X"
   ```

3. **Push to trigger workflow:**
   ```bash
   git push
   ```

The workflow will automatically:
- Detect the version change
- Publish to npm
- Create a Git tag
- Create a GitHub release
- Deploy updated documentation

### Manual Trigger

You can also manually trigger the workflow from GitHub:
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
