# Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic version bumping and changelog generation.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

## Breaking Changes

Add `BREAKING CHANGE:` in the footer to indicate a breaking change:

```
feat!: add new API

BREAKING CHANGE: The old API has been removed
```

## Examples

### Feature
```
feat: add event-based conversion API

Add ConversionResult interface with events, promise, cancel, and getProgress methods.
This provides fluent-ffmpeg style per-conversion event handling.
```

### Bug Fix
```
fix: resolve VitePress dead links

Update internal links in VitePress markdown files to correctly point to existing documentation.
```

### Breaking Change
```
feat!: replace callback API with event-based API

BREAKING CHANGE: The convert() method now returns ConversionResult instead of Promise<void>.
Use convertWithCallbacks() for the old callback-based API.
```

### Documentation
```
docs: add event-based conversion example

Add comprehensive example showing per-conversion event handling similar to fluent-ffmpeg.
```

### Chore
```
chore: update dependencies

Update TypeScript to v5.0 and VitePress to v1.6.4
```

## Version Bumping

- **feat**: Minor version bump (0.1.0 → 0.2.0)
- **fix**: Patch version bump (0.1.0 → 0.1.1)
- **BREAKING CHANGE**: Major version bump (0.1.0 → 1.0.0)
- **docs**, **style**, **refactor**, **perf**, **test**, **chore**: No version bump (unless they contain BREAKING CHANGE)

## Automatic Release

When you push commits with conventional commit messages to the `main` branch:

1. **semantic-release** analyzes the commits
2. Determines the next version number
3. Updates `package.json` and `CHANGELOG.md`
4. Publishes to npm
5. Creates a GitHub release
6. Pushes the changes back to the repository

## Manual Release

For manual releases, use workflow dispatch:

1. Go to Actions → Release
2. Click "Run workflow"
3. Select branch and click "Run workflow"

This will trigger semantic-release manually.
