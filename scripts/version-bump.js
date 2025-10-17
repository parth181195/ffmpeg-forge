#!/usr/bin/env node

/**
 * Manual version bump script
 * Alternative to semantic-release for manual version control
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

function updateVersion(type) {
  try {
    // Update package.json version
    execSync(`npm version ${type} --no-git-tag-version`, { stdio: 'inherit' });
    
    const newVersion = getCurrentVersion();
    console.log(`✅ Version updated to ${newVersion}`);
    
    // Update CHANGELOG.md
    updateChangelog(newVersion, type);
    
    console.log(`\n📝 Next steps:`);
    console.log(`1. Review the changes:`);
    console.log(`   git diff`);
    console.log(`2. Commit the changes:`);
    console.log(`   git add -A && git commit -m "chore: bump version to ${newVersion}"`);
    console.log(`3. Push to trigger release:`);
    console.log(`   git push`);
    
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

function updateChangelog(version, type) {
  const date = new Date().toISOString().split('T')[0];
  const changelogEntry = `## [${version}] - ${date}

### ${type === 'patch' ? 'Bug Fixes' : type === 'minor' ? 'Features' : 'Breaking Changes'}
- Manual version bump

`;

  let changelog = '';
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  }

  // Insert new entry after the header
  const lines = changelog.split('\n');
  const headerEndIndex = lines.findIndex(line => line.startsWith('## ['));
  
  if (headerEndIndex === -1) {
    // No existing changelog, create new one
    changelog = `# Changelog

All notable changes to this project will be documented in this file.

${changelogEntry}`;
  } else {
    // Insert after header
    lines.splice(headerEndIndex, 0, changelogEntry);
    changelog = lines.join('\n');
  }

  fs.writeFileSync(changelogPath, changelog);
  console.log(`📝 Updated CHANGELOG.md`);
}

function showHelp() {
  console.log(`
📦 Manual Version Bump Script

Usage:
  npm run version:patch    # 0.1.0 → 0.1.1 (bug fixes)
  npm run version:minor    # 0.1.0 → 0.2.0 (new features)
  npm run version:major    # 0.1.0 → 1.0.0 (breaking changes)

Current version: ${getCurrentVersion()}

This script will:
1. Update package.json version
2. Update CHANGELOG.md
3. Show you the next steps to commit and push

For automatic releases, use semantic-release with conventional commits.
`);
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'patch':
    updateVersion('patch');
    break;
  case 'minor':
    updateVersion('minor');
    break;
  case 'major':
    updateVersion('major');
    break;
  default:
    showHelp();
    break;
}
