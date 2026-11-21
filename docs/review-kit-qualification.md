# DS-7 review package qualification

## Delivered before DS-7

DS-1 to DS-5 and the original smoke-pack registration are present at the build base `5dc58e07fb07bfb445664e797a9d5950d56ec708`. The B5 fix shipped in `review-core` 0.1.1 at `4e02910aac9626ea2b84190f69e5777e3b6b120a`. The core capture and resolution implementation and the Svelte pin are preserved. [B5 release PR](https://github.com/rhanka/sent-tech-design-system/pull/319)

## Replayed in DS-7

| Command | Result |
| --- | --- |
| `rtk npm run test --workspace packages/review-core` | 53 passed, including the B5 regression cases and the C2 fixture tests. The new fixture tests first caught a reply accepted for a different target and the missing port helpers. |
| `rtk npm run check --workspace packages/review-core` | Passed. |
| `rtk npm exec --workspace packages/components-svelte -- vitest run src/lib/CommentLayer.anchor-aid.test.ts src/CommentLayer.test.ts src/ReviewComponentsDs3.test.ts src/ReviewPanelDs5.test.ts` | 32 passed in jsdom. Keyboard focus and Escape, two icons within one named image role, non-modal aside and modal bottom Drawer, and the breakpoint change handling. |
| `rtk npm run check --workspace packages/components-svelte` | Passed with 26 warnings and zero errors in the workspace project, and zero warnings or errors in the parity project. |
| `rtk node scripts/smoke-pack.mjs --workspaces=@sentropic/design-system-review-core,@sentropic/design-system-svelte` and the corresponding core/Vue selection | Both passed. Separate Svelte-only and Vue-only selections also passed and packed core through their respective closures. |
| `rtk node scripts/test-review-consumer.mjs` | The published Svelte layer first lost the enclosing `aid` with its nested core 0.1.0. The exact alias to direct core 0.1.1 passed. Both emitted Vite graphs resolve `CommentLayer` to the direct core. The SSR bundle rendered, and the client bundle ran the `focus-test` header and A/B/C fixture in jsdom. |

The consumer checks the registry metadata, computes SHA-512 from the archives, and checks the installed lockfile. It uses these published packages.

| Package | Registry source | Archive integrity |
| --- | --- | --- |
| `@sentropic/design-system-review-core@0.1.1` | `4e02910aac9626ea2b84190f69e5777e3b6b120a` | `sha512-xYtYGLZ097IzeShk0+J1Q27qJWHYPNTaui+ZPHNTif7bTxLFePly6RCjmr3BGxWPCwz7NNwf/GRqEp1S40Spiw==` |
| `@sentropic/design-system-svelte@0.43.0` | `d2312d6f5293892fec748d3529b6c03d4426c13a` | `sha512-23Me3nVhtkv6/ojuCYPVvsxfbFUPpD+4WnCvW9cuO+07w5yWvQoPxf8kjL8Q5lLjKG8MKucpjxHHbSxDcHqOag==` |

The candidate Svelte 0.43.1 was available for local smoke-pack. The registry lookup for 0.43.1 returned 404 during the run. The isolated host retains its lockfile and both module graphs under `.vite/review-consumer/host-*`. Local smoke-pack ran with `TMPDIR`, `XDG_RUNTIME_DIR`, and `npm_config_cache` inside `.vite/ds-7`.

## Round 1 corrections

| Regression | Red run | Green run |
| --- | --- | --- |
| Tenant isolation | A shared workspace allowed cross-tenant `get` and `edit`. | All store reads and the six mutations addressing an existing row or thread respect tenant and workspace scope. The UI fixture can bind a `tenantId` alongside its workspace argument. |
| Thread status | An open query returned the reply to a closed thread as its own summary. | The closed summary carries both messages. Row-level status filtering still returns individual open rows. |
| Create and reply | Create appended when given a thread ID. Reply created a root when the ID was omitted. | Create mints a root. Reply requires an existing thread in scope. |
| Mutation confirmation | Removing the confirmation call let both adapter promises resolve before the read. | A blocked `listThread` holds each promise pending and returns the updated row after release. |
| Capture | Suppressing the table-cell write passed the original consumer and failed the new row-count assertion. | Every element and text capture verifies a new row ID, the submitted body, and the decoded anchor. |
| Package exports | Removing `ReviewModeToggle` from the candidate JavaScript barrel failed the Vite import. Removing `ReviewModeToggleProps` from the installed declarations failed TypeScript. | The installed package checks import and type-check `CommentAuthorship`, `CommentComposer`, `CommentLayer`, `CommentPin`, `CommentThread`, `OrphanList`, `ReviewModeToggle`, and `ThreadPanel`. |
| CI lane | The workflow guard failed on the missing `TMPDIR` binding. | `Verify` creates the runtime, temporary and npm cache directories under `.vite/pack-smoke` before running smoke-pack. |

Round 1 replayed `rtk npm run test --workspace packages/review-core` (60 tests), both package type checks, the four targeted Svelte files above (32 tests), `rtk node --test scripts/verify-workflow-invariants.test.mjs` (23 tests), the core/Svelte and core/Vue smoke-pack selections, and `rtk node scripts/test-review-consumer.mjs` against the same published archives. The published consumer checks both Vite graphs and uses its own installed TypeScript to verify the public props.

The candidate `review-core` archive still identifies as 0.1.1. It was packed from the updated fixture source at `b2954e161` with integrity `sha512-XHYJLCgJnhaJkxC4T/o10tHhX8lyZi5v2p6bnzsqhV4q2PyLZVhkNRE67cH89MpIqpE6VqhselRpEEUGj8tXUA==`. Release the fixture corrections as `review-core` 0.1.2 in the release PR. The Svelte 0.43.1 candidate retains archive integrity `sha512-D/iHwKU4Mqgwj44JUJRIgW3j1E/62IR2efVD7Uj8aRu9S+sQxusn0vDmywPKx0D4cv4nGSbWc8t3D64MUhZE2Q==`.

## Round 2 corrections

| Regression | Red run | Green run |
| --- | --- | --- |
| Live session scope | Reusing a tool-call ID replaced the visible agent and run across tenants and workspaces. | Agent writes and explicit registrations use the same tenant, workspace and tool-call key as reads. |
| Thread summary | An anchored reply supplied the assignee and anchor for an unanchored root. | The summary uses the root target and assignee. A root without an assignee stays unassigned, while the C2 reference can fall back to a reply. |
| Record queries | Both list verbs missed records when the query omitted `recordType`. | Kind and ID select the records. Section and status filters still apply, and rows retain their record type. |
| Timestamp ties | Locale sorting placed a reply before the root at the same timestamp. | ID comparison uses the C2 ordering. |

The parity suite replays all ten port verbs against `@sentropic/comments@0.3.2`, locked as a development dependency with integrity `sha512-GAV+M49yK/J1DiaDBcwjZ5UpZsJpnFQ8MCfJlacSVc1uYS5CnMNZz9h1IEAgJNIbDmaPUyAz2ZB3TKuEYLslQQ==`. npm provenance identifies source commit `75bc6d28d1d5f0fc2b29d1e2ad3be955780aee39`. The reference store and its port, types and event modules are identical at the pinned C2 commit `13490b16b9ac717d5abf5c5128146a536aa80f66`. The tests compare raw port results, scope failures, and the persisted row projection after host-side normalization, anchor inheritance and provenance handling.

Round 2 passed all 71 review-core tests, including nine parity cases, the review-core type check, and all 23 workflow invariant tests. The isolated published consumer passed against the archives above.

## To execute in the integration lots

FA-D3 owns the dossier kit build, mounting from `reviewRoot` on `st-dossier-ready`, root replacement, and the no-adapter path. H1 owns the Focus Web graph, and H5/FA-H5 own the persistent C2 path. The DS-7 adapter tests exercise an in-memory fixture. The accessibility and client-bundle checks use jsdom.
