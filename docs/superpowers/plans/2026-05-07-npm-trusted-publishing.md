# Sent Tech Npm Trusted Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the Sent Tech design system packages publicly on npm with the same Trusted Publishing release pattern used by Graphify.

**Architecture:** Keep the repository root private and publish only the three package workspaces. Release is tag-driven: CI verifies, smokes the packed artifacts, guards that `vX.Y.Z` matches every publishable package version, then publishes to npm in dependency order.

**Tech Stack:** npm workspaces, GitHub Actions, npm Trusted Publishing, Svelte package output, TypeScript package output.

---

### Task 1: Package Publication Metadata

**Files:**
- Modify: `packages/tokens/package.json`
- Modify: `packages/themes/package.json`
- Modify: `packages/components-svelte/package.json`

- [ ] Add `"publishConfig": { "access": "public" }` to all publishable scoped packages.
- [ ] Add `"files": ["dist"]` to `@sent-tech/tokens`.
- [ ] Move `svelte` to `peerDependencies` for `@sent-tech/components-svelte`; keep it as a package dev dependency for tests and packaging.
- [ ] Keep `@sent-tech/themes` publishing `dist` and `css`.
- [ ] Keep `@sent-tech/components-svelte` publishing `dist`.
- [ ] Run `node --check` only on scripts touched later; package JSON is validated by `npm run build`.

### Task 2: Workspace Pack Smoke Test

**Files:**
- Create: `scripts/smoke-pack.mjs`
- Modify: `package.json`

- [ ] Add a root script named `pack:smoke` that runs `node scripts/smoke-pack.mjs`.
- [ ] The smoke script must run from the repo root, create a temporary directory, and call `npm pack --workspace <pkg> --pack-destination <tmp>`.
- [ ] The script must verify tarballs for:
  - `@sent-tech/tokens`: `dist/index.js`, `dist/index.d.ts`.
  - `@sent-tech/themes`: `dist/index.js`, `dist/index.d.ts`, `css/sent-tech.css`, `css/forge.css`, `css/entropic.css`.
  - `@sent-tech/components-svelte`: `dist/index.js`, `dist/index.d.ts`.
- [ ] The script must install all produced tarballs together in a clean temp package and verify ESM imports for all three package names.
- [ ] Run `npm run build && npm run pack:smoke`.

### Task 3: GitHub Actions Release Workflow

**Files:**
- Create: `.github/workflows/npm-publish.yml`

- [ ] Add CI triggers for `push` to `main`, `pull_request` to `main`, and tags `v*`.
- [ ] Add a `verify` job on Node 22 that runs `npm ci`, `npm run verify`, and `npm run pack:smoke`.
- [ ] Add a `release-guard` job for tags that checks the tag commit is merged into the default branch.
- [ ] Add a version guard that requires every package under `packages/*` to match `${GITHUB_REF_NAME#v}`.
- [ ] Add a `publish` job with `id-token: write`, Node 24, npm upgrade, build, and:

```bash
npm publish --workspace @sent-tech/tokens --access public
npm publish --workspace @sent-tech/themes --access public
npm publish --workspace @sent-tech/components-svelte --access public
```

- [ ] Add a post-publish check that installs the tagged version of all three packages from npm and imports them.

### Task 4: Release Documentation

**Files:**
- Create: `docs/release.md`
- Modify: `README.md`

- [ ] Document the one-time npm Trusted Publishing setup for the three package names.
- [ ] Document local pre-release checks.
- [ ] Document the tag-driven release commands.
- [ ] Add a short release link from `README.md`.

### Task 5: Verification, Commit, Push

**Files:**
- All files changed by Tasks 1-4.

- [ ] Run `npm run verify`.
- [ ] Run `npm run pack:smoke`.
- [ ] Run `node --check scripts/smoke-pack.mjs`.
- [ ] Run `git diff --check`.
- [ ] Commit atomically.
- [ ] Push `main`.
