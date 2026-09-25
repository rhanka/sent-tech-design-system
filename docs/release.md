# Release

Sent Tech Design System publishes seventeen public npm packages from this private workspace root:

- `@sentropic/design-system-tokens`
- `@sentropic/design-system-themes`
- `@sentropic/design-system-svelte`
- `@sentropic/design-system-skills`
- `@sentropic/design-system-react`
- `@sentropic/design-system-vue`
- `@sentropic/design-system-angular`
- `@sentropic/design-system-theme-canada`
- `@sentropic/design-system-theme-dsfr`
- `@sentropic/design-system-theme-quebec`
- `@sentropic/design-system-codemirror`
- `@sentropic/graph` (tag `graph-v<version>`)
- `@sentropic/dataviz-core`, `@sentropic/dataviz-svelte`, `@sentropic/dataviz-react`, `@sentropic/dataviz-vue`, `@sentropic/dataviz-angular` (tag `dataviz-v<version>`, lockstep)

The release model follows Graphify: GitHub Actions verifies the repo, packs the npm artifacts, guards the tag, publishes through npm Trusted Publishing, waits until npm registry propagation is visible, then installs the published packages back from npm.

## One-Time Npm Setup

Configure npm Trusted Publishing for each package:

- Package: `@sentropic/design-system-tokens`
- Package: `@sentropic/design-system-themes`
- Package: `@sentropic/design-system-svelte`
- Package: `@sentropic/design-system-skills`
- Repository: `rhanka/sent-tech-design-system`
- Workflow: `.github/workflows/npm-publish.yml`
- Registry: `https://registry.npmjs.org`

Plus, for the graph/dataviz families:

- Package: `@sentropic/graph`
- Repository: `rhanka/sent-tech-design-system`
- Workflow: `.github/workflows/graph-publish.yml`
- Registry: `https://registry.npmjs.org`

- Package: `@sentropic/dataviz-core`
- Package: `@sentropic/dataviz-svelte`
- Package: `@sentropic/dataviz-react`
- Package: `@sentropic/dataviz-vue`
- Package: `@sentropic/dataviz-angular`
- Repository: `rhanka/sent-tech-design-system`
- Workflow: `.github/workflows/dataviz-publish.yml`
- Registry: `https://registry.npmjs.org`

The packages are scoped and public. Keep `publishConfig.access = "public"` in each publishable workspace.

Before the first release, confirm the npm `@sentropic` scope is owned by the publishing account or organization.

## Owner Prerequisites Before the First Graph/Dataviz Tag

Nothing below is automated; the owner performs each step once, before pushing `graph-v*` or `dataviz-v*` for the first time:

1. Confirm on npm that the DS versions the adapters depend on exist: `design-system-svelte@0.35.0`, `design-system-react@0.37.0`, `design-system-vue@0.37.0`, `design-system-angular@0.37.1`, `design-system-themes@0.11.0`.
2. For `graph`, `dataviz-core`, `-svelte`, `-react` and `-vue`: declare the DS repository and the publishing workflow as a trusted publisher on npmjs.com.
3. For `dataviz-angular` (never published): bootstrap with a temporary token following the checklist below, then declare the trusted publisher and revoke the token.
4. On the `rhanka/dataviz` side: remove the trusted publisher of the `rhanka/dataviz` repository and freeze its `v*` tags **before** the first DS tag (otherwise a source-side `v0.5.0` would permanently pin 0.5.0 on npm). On the graphify side, publication is manual (`PUBLISHING.md`); stop it by discipline once the DS publishes `graph`.

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

`npm run pack:smoke` verifies thirteen package tarballs (the seven design-system ports, `graph` and the five `dataviz-*`) and installs them together in a clean temporary project.
Release commits must include the current portable `.graphify` artifacts: `graph.json`, `graph.html`, `GRAPH_REPORT.md`, `manifest.json`, `cost.json`, and `.graphify_runtime.json`. Do not commit local lifecycle files such as `.graphify/cache/`, `.graphify/branch.json`, `.graphify/worktree.json`, or `.graphify/needs_update`.

## Licensing Gate

`npm run licensing:check` is a release blocker, not a report. For **every** workspace whose manifest is not `private: true` it requires, and fails without:

- a non-placeholder `license` field in the manifest;
- a `LICENSE` file at the package root;
- a `LICENSE.THIRD-PARTY.md` at the package root, matching what `scripts/generate-third-party-notices.mjs` re-derives from `package-lock.json` and the installed upstreams;
- both files actually present in the tarball, measured with `npm pack --dry-run --json` rather than assumed.

It runs in three places, so no release path skips it:

- the `licensing` job in `.github/workflows/verify.yml`, unsharded, on every PR;
- the head of `npm run pack:smoke`, over all publishable packages whatever `--workspaces` selects;
- `npm run verify`.

The second of those is the one that covers a release, and it covers a release only if **every** publish workflow runs it. Measured on the eleven `*-publish.yml` workflows: each has a `verify` job whose last step is `npm run pack:smoke`, and each `publish` job reaches that job through `needs: release-guard` → `needs: verify`.

That was not true before: `skills-publish.yml` and `themes-publish.yml` ran neither `pack:smoke`, nor `licensing:check`, nor `npm run verify` — they built and tested their own workspace and nothing else. Being tag-triggered, they do not run the `licensing` job in `verify.yml` either. So `@sentropic/design-system-skills` (45 packages in its transitive closure, 8 licence families) and `@sentropic/design-system-theme-dsfr` (a transcription of a state design system, whose shipped notices must carry its upstream attribution) were the two packages that could reach npm with no licensing gate at all. Both workflows now run the same `npm run build` + `npm run pack:smoke` pair as the other nine.

Adding a publishable package, adding or bumping a runtime dependency, or changing the inlined icon path data all change what must be disclosed. Run `npm run notices:generate` in the same change; the gate fails on stale notices. Policy, open questions, and everything the generator cannot derive live in `THIRD-PARTY-NOTICES.md` at the repository root — that file is documentation only and ships in nothing, by design.

## Versioning

The release tag must match every publishable package version.

For `v0.7.0`, these manifests must all contain `"version": "0.7.0"`:

- `packages/tokens/package.json`
- `packages/themes/package.json`
- `packages/components-svelte/package.json`
- `packages/skills/package.json`

Internal dependencies must match the same version:

- `@sentropic/design-system-themes` depends on `@sentropic/design-system-tokens`.
- `@sentropic/design-system-svelte` depends on `@sentropic/design-system-themes`.

The graph and dataviz families follow the same rule on their own tags. `graph` has its own line: for `graph-v0.3.0`, `packages/graph/package.json` must contain `"version": "0.3.0"`. The five `dataviz-*` move in lockstep: for `dataviz-v0.5.0`, all five manifests must contain `"version": "0.5.0"`, and every internal `@sentropic/dataviz-*` dependency between them must be the exact same version. The existing DS packages keep their own lines.

## Publish

The first publication used a temporary bootstrap token because npm Trusted Publishing can only be configured after each package exists.

Bootstrap checklist, only needed if a package has never been published:

1. Create a temporary npm granular access token with read/write access to the `@sentropic` scope.
2. Store it as the GitHub repository secret `NPM_TOKEN`.
3. Push the release tag.
4. Configure Trusted Publishing on the created packages.
5. Delete the `NPM_TOKEN` repository secret and revoke or let the temporary npm token expire.

For normal releases, Trusted Publishing handles `npm publish` through OIDC. The workflow must keep `permissions.id-token = "write"` on the publish job and must not require an npm token secret. A bootstrap step guarded by `if: ${{ env.NPM_TOKEN != '' }}` does not make the token required — with no secret set, the step is skipped and the publish is pure OIDC. `scripts/verify-workflow-invariants.test.mjs` enforces that reading: a token reference in a `*-publish.yml` is accepted only when it is conditioned that way, named in a bootstrap comment, and declared in that guard's `DECLARED_TOKEN_BOOTSTRAPS` with the condition for removing it.

### Names that have never been published

Measured on 2026-09-25 against the registry (`npm view <name> version` for each of the 18 publishable workspaces):

| Package | Repository version | Registry | Path to the first publish |
|---|---|---|---|
| `@sentropic/dataviz-angular` | 0.5.0 | E404 | bootstrap in `dataviz-publish.yml` |
| `@sentropic/design-system-theme-latex` | 0.1.0 | E404 | bootstrap in `latex-publish.yml` |
| `@sentropic/design-system-theme-quebec` | 0.1.0 | E404 | bootstrap in `quebec-publish.yml` |

For these three, the bootstrap checklist above is the only order that works: the trusted publisher cannot be declared first, because npm has no package page to declare it on. The seven names whose registry version is behind the repository (`design-system-angular`, `dataviz-core`, `dataviz-react`, `dataviz-svelte`, `dataviz-vue`, `graph`, `design-system-skills`) exist on npm and need nothing but their tag, with the trusted publisher declared.

### The eight whose version number is already taken

The remaining eight workspaces carry a version that npm already holds, so the tag for that version would be refused — and their content is not the published content. Measured on 2026-09-25: the publish timestamp comes from `npm view <name> time`, and the drift is `git log --since=<that timestamp> origin/main -- packages/<dir>/src packages/<dir>/package.json`.

| Package | Version (local = registry) | Published | Commits since, touching src or manifest | What drifted |
|---|---|---|---|---|
| `design-system-tokens` | 0.11.0 | 2026-06-06 | 11 | additive tokens (Badge circle, Collapsible trailing snippet, SelectableRow caption, link-hover geometry, card-hover background, icon stroke/colour), a lollipop overflow fix, licensing notices |
| `design-system-themes` | 0.11.0 | 2026-06-06 | 6 | functional dark mode at theme level, icon tokens, size→font scale, licensing notices |
| `design-system-theme-dsfr` | 0.2.2 | 2026-05-31 | 12 | phase-2 anatomy tokens (switch/toggle, card hover, link hover), usage-terms chronology, licensing notices |
| `design-system-theme-canada` | 0.1.0 | 2026-06-11 | 3 | licensing only (upstream attribution, third-party notices) |
| `design-system-svelte` | 0.35.0 | 2026-08-16 | 6 | the `ForceGraph` layout delegation to `@sentropic/graph/processing` (#113), PriorityMatrix, Icon cascade layer, licensing notices |
| `design-system-react` | 0.37.0 | 2026-08-16 | 5 | PriorityMatrix, Icon cascade layer and token-driven stroke, licensing notices |
| `design-system-vue` | 0.37.0 | 2026-08-16 | 5 | same set as react |
| `design-system-codemirror` | 0.1.0 | 2026-06-05 | 3 | licensing notices, dev-dependency bumps |

Measured consequence: **no publishable workspace currently matches its published counterpart** — three names do not exist, seven are behind, eight have a number that is taken.

### Why this state is not fixed by bumping all eight at once

Commit `7c731257` records the failure that produces: base packages were bumped ahead of their tags, and the publish smoke test broke with `No matching version theme-carbon@0.2.3`, because dependents had those versions in `dependencies` at runtime. Every dependent still pins the **published** base version exactly (`@sentropic/design-system-tokens` and `-themes` at `0.11.0` in `themes`, `theme-dsfr`, `theme-canada` and the four component packages). So a bump only becomes safe for the dependents once the base version it names exists on npm, and the train has to run one step at a time:

1. `graph` 0.3.0 — exists on npm at 0.2.0, needs only its tag. It gates `design-system-svelte`, whose manifest pins `@sentropic/graph: 0.3.0`: publishing svelte first would ship a dependency npm cannot resolve.
2. `design-system-tokens`, then `design-system-themes` — bump, tag, publish; only then move the pins in the packages that name them.
3. `design-system-theme-dsfr` and `-theme-canada` — bump after their base pins move; `-theme-quebec` and `-theme-latex` take the bootstrap path above instead, being first publishes.
4. `design-system-svelte`, `-react`, `-vue` — bump after step 2 is on npm (svelte also needs step 1); `design-system-angular` is already at 0.37.1 and needs only its tag.
5. `dataviz-core`, `-svelte`, `-react`, `-vue` — already at 0.5.0, tags pending; `dataviz-angular` is a first publish, bootstrap path.
6. `design-system-skills` (0.3.2, tag pending) and `design-system-codemirror` (bump then tag).

Each step is: bump that package only → tag → let its workflow publish → then move the pins that name it. That is the order the commit above was written to protect.

Publish by pushing `main`, then creating and pushing a tag:

```bash
git push origin main
git tag v0.7.0
git push origin v0.7.0
```

The workflow publishes in dependency order:

```bash
npm publish --workspace @sentropic/design-system-tokens --access public
npm publish --workspace @sentropic/design-system-themes --access public
npm publish --workspace @sentropic/design-system-svelte --access public
npm publish --workspace @sentropic/design-system-skills --access public
```

Publish the graph family by pushing the `graph-v<version>` tag:

```bash
git push origin main
git tag graph-v0.3.0
git push origin graph-v0.3.0
```

Publish the dataviz family by pushing the `dataviz-v<version>` tag. The workflow publishes in dependency order — `core` first, then `svelte`, `react`, `vue`, `angular`:

```bash
git push origin main
git tag dataviz-v0.5.0
git push origin dataviz-v0.5.0
```

```bash
npm publish --workspace @sentropic/dataviz-core --access public
npm publish --workspace @sentropic/dataviz-svelte --access public
npm publish --workspace @sentropic/dataviz-react --access public
npm publish --workspace @sentropic/dataviz-vue --access public
npm publish --workspace @sentropic/dataviz-angular --access public
```

Do not move a published tag unless the npm publish failed before creating any package version. npm versions are immutable after publication.

## Consuming From Forge

After publication, replace Forge local file dependencies with npm versions:

```bash
npm install \
  @sentropic/design-system-tokens@0.7.0 \
  @sentropic/design-system-themes@0.7.0 \
  @sentropic/design-system-svelte@0.7.0 \
  @sentropic/design-system-skills@0.7.0
```

Keep `svelte` installed in consuming apps. `@sentropic/design-system-svelte` declares Svelte as a peer dependency.
