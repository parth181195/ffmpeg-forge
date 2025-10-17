# GitHub Actions Workflows

## Workflows

### 1. `test.yml` - Continuous Integration
- Runs on every push and PR
- Tests on multiple OS (Ubuntu, macOS) and Node.js versions (18, 20, 22)
- Runs linter and tests
- Generates coverage reports

### 2. `publish.yml` - npm Publishing
- Triggers on commits with "release:" in message
- Can also be manually triggered
- Runs tests before publishing
- Publishes to npm automatically
- Creates GitHub release

### 3. `docs.yml` - Documentation Deployment
- Deploys VitePress docs to GitHub Pages
- Triggers on changes to docs/ or README.md
- Accessible at: https://parth181195.github.io/ffmpeg-forge

## Setup Required

### For npm Publishing:
1. Create npm access token: https://www.npmjs.com/settings/tokens
2. Add as GitHub secret: `NPM_TOKEN`
   - Go to: Settings → Secrets → Actions → New repository secret

### For GitHub Pages:
1. Go to: Settings → Pages
2. Source: GitHub Actions
3. That's it! Docs will deploy automatically

## Usage

### Publish to npm:
```bash
# Commit with "release:" prefix
git commit -m "release: v0.1.0"
git push

# Or manually trigger from GitHub Actions tab
```

### Deploy docs:
```bash
# Just push changes to docs/
git add docs/
git commit -m "docs: update guide"
git push
# Automatically deploys to GitHub Pages
```

### Run tests:
Automatically runs on every push and PR
