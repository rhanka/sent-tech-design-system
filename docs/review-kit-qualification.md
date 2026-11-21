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

## To execute in the integration lots

FA-D3 owns the dossier kit build, mounting from `reviewRoot` on `st-dossier-ready`, root replacement, and the no-adapter path. H1 owns the Focus Web graph, and H5/FA-H5 own the persistent C2 path. The DS-7 adapter tests exercise an in-memory fixture. The accessibility and client-bundle checks use jsdom.
