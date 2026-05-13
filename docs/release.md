# Release

Sent Tech Design System publishes three public npm packages from this private workspace root:

- `@sent-tech/tokens`
- `@sent-tech/themes`
- `@sent-tech/components-svelte`

The release model follows Graphify: GitHub Actions verifies the repo, packs the npm artifacts, guards the tag, publishes through npm Trusted Publishing, waits until npm registry propagation is visible, then installs the published packages back from npm.

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

Each package manifest must keep its `repository.url` pointed at `git+https://github.com/rhanka/sent-tech-design-system.git`; npm uses that metadata when validating GitHub trusted publishing.

## Local Pre-Release Checks

Run from the repository root:

```bash
npm ci
npm run verify
npm run pack:smoke
graphify portable-check .graphify
git diff --check
git status --short --branch
```

`npm run pack:smoke` verifies the three package tarballs and installs them together in a clean temporary project.
Release commits must include the current portable `.graphify` artifacts: `graph.json`, `graph.html`, `GRAPH_REPORT.md`, `manifest.json`, `cost.json`, and `.graphify_runtime.json`. Do not commit local lifecycle files such as `.graphify/cache/`, `.graphify/branch.json`, `.graphify/worktree.json`, or `.graphify/needs_update`.

## Versioning

The release tag must match every publishable package version.

For `v0.2.0`, these manifests must all contain `"version": "0.2.0"`:

- `packages/tokens/package.json`
- `packages/themes/package.json`
- `packages/components-svelte/package.json`

Internal dependencies must match the same version:

- `@sent-tech/themes` depends on `@sent-tech/tokens`.
- `@sent-tech/components-svelte` depends on `@sent-tech/themes`.

## Publish

The first publication used a temporary bootstrap token because npm Trusted Publishing can only be configured after each package exists.

Bootstrap checklist, only needed if a package has never been published:

1. Create a temporary npm granular access token with read/write access to the `@sent-tech` scope.
2. Store it as the GitHub repository secret `NPM_TOKEN`.
3. Push the release tag.
4. Configure Trusted Publishing on the created packages.
5. Delete the `NPM_TOKEN` repository secret and revoke or let the temporary npm token expire.

For normal releases, Trusted Publishing handles `npm publish` through OIDC. The workflow must keep `permissions.id-token = "write"` on the publish job and must not require an npm token secret.

Publish by pushing `main`, then creating and pushing a tag:

```bash
git push origin main
git tag v0.2.0
git push origin v0.2.0
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
  @sent-tech/tokens@0.2.0 \
  @sent-tech/themes@0.2.0 \
  @sent-tech/components-svelte@0.2.0
```

Keep `svelte` installed in consuming apps. `@sent-tech/components-svelte` declares Svelte as a peer dependency.
