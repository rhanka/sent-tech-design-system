# Release

Sent Tech Design System publishes three public npm packages from this private workspace root:

- `@sent-tech/tokens`
- `@sent-tech/themes`
- `@sent-tech/components-svelte`

The release model follows Graphify: GitHub Actions verifies the repo, packs the npm artifacts, guards the tag, publishes through npm Trusted Publishing, then installs the published packages back from npm.

## One-Time Npm Setup

Configure npm Trusted Publishing for each package:

- Package: `@sent-tech/tokens`
- Package: `@sent-tech/themes`
- Package: `@sent-tech/components-svelte`
- Repository: `rhanka/sent-tech-design-system`
- Workflow: `.github/workflows/npm-publish.yml`
- Registry: `https://registry.npmjs.org`

The packages are scoped and public. Keep `publishConfig.access = "public"` in each publishable workspace.

Before the first release, confirm the npm `@sent-tech` scope is owned by the publishing account or organization.

## Local Pre-Release Checks

Run from the repository root:

```bash
npm ci
npm run verify
npm run pack:smoke
git diff --check
git status --short --branch
```

`npm run pack:smoke` verifies the three package tarballs and installs them together in a clean temporary project.

## Versioning

The release tag must match every publishable package version.

For `v0.1.0`, these manifests must all contain `"version": "0.1.0"`:

- `packages/tokens/package.json`
- `packages/themes/package.json`
- `packages/components-svelte/package.json`

Internal dependencies must match the same version:

- `@sent-tech/themes` depends on `@sent-tech/tokens`.
- `@sent-tech/components-svelte` depends on `@sent-tech/themes`.

## Publish

Publish by pushing `main`, then creating and pushing a tag:

```bash
git push origin main
git tag v0.1.0
git push origin v0.1.0
```

The workflow publishes in dependency order:

```bash
npm publish --workspace @sent-tech/tokens --access public
npm publish --workspace @sent-tech/themes --access public
npm publish --workspace @sent-tech/components-svelte --access public
```

Do not move a published tag unless the npm publish failed before creating any package version. npm versions are immutable after publication.

## Consuming From Forge

After publication, replace Forge local file dependencies with npm versions:

```bash
npm install \
  @sent-tech/tokens@0.1.0 \
  @sent-tech/themes@0.1.0 \
  @sent-tech/components-svelte@0.1.0
```

Keep `svelte` installed in consuming apps. `@sent-tech/components-svelte` declares Svelte as a peer dependency.

