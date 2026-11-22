# @sentropic/design-system-review-core

Framework-neutral TypeScript core for artifact review mode (lots DS-1 and DS-2). Zero runtime dependencies.

- **Contract 1:1:** maps directly onto sentropic `packages/comments` (`Comment`, `CommentTarget`, `CommentState` `'open' | 'closed'`, `CommentProvenance`) without inventing wire fields.
- **Adapter seam:** hosts bind `CommentsAdapter` to cluster-mesh HTTP/MCP; `createFixtureCommentsAdapter` is an in-memory port-shaped fixture for tests and demos only (never a production store).
- **View helpers:** authorship fallback (`CollaborationActor` + sponsoring owner + live `runId`), thread grouping (deriving `anchor` from the first chronological row carrying `target.sectionKey`), filters (`all | open | resolved | mine`), unread rules, and `layoutPins`.
- **Anchors (DS-2):** compact `a1:` + base64url(UTF-8 JSON) codec in `sectionKey` with 2048-char cap (quote-context trimming first, then `exact` truncation with `pos` preserved), DOM capture (`createAnchor*`), and re-render-resilient `resolveAnchor`.
- **Status:** public as `@sentropic/design-system-review-core`, published CI-only through `.github/workflows/review-core-publish.yml` on tags `review-core-v<version>` (publish before `svelte-v<version>`).

## Mounting the Svelte review layer

Import `CommentLayer` and `ReviewModeToggle` from `@sentropic/design-system-svelte`. The same entry exports `ThreadPanel`, `OrphanList`, `CommentThread`, `CommentPin`, `CommentComposer`, `CommentAuthorship`, and their prop types. `CommentLayerProps` and `CommentLayerCreatePayload` describe the host binding.

- Give `CommentLayer` the live artifact `rootEl`, `mode`, `target` (`kind` and `id`), `artifactVersion`, flat `comments`, and `currentUser`. The root contains the document header and blocks, each with its stable `data-anchor-id`. Supply the current document digest as `artifactVersion`. When the host has an adapter, mount the layer in the same DOM tree as the artifact.
- Bind `onCreate` to `adapter.create`, adding the host's workspace ID as `tenant`. On reply, send the same target and thread `sectionKey` with `threadId`. Use `threadId` for state and assignment, with `open` and `closed` for state and `null` for unassign. Use row `id` for edits and deletes. Feed updated `ReviewComment[]` back into the layer.
- `ThreadPanel` uses a non-modal `<aside>` at 48 rem and above, and a modal bottom `Drawer` below 48 rem. `CommentAuthorship` exposes the agent and sponsor icons through one named image role.
- Install exact `@sentropic/design-system-review-core@0.1.1` directly for B5. Until the Svelte pin moves, alias only the exact core package specifier to the export resolved from the host, deduplicate the core, and bundle the component and core through `ssr.noExternal` in Vite SSR. The isolated package test under `scripts/fixtures/review-consumer` shows this resolution with the published Svelte tarball.

The test fixture uses the ten `CommentStore` verbs. `create` and `reply` project onto `add`, `list` onto `listByTarget`, `threadSummaries` onto `listThreadSummaries`, and `remove` onto `delete`. `edit`, `setState`, and `assign` keep their corresponding verbs. `get`, `listThread`, and `editThread` are store helpers. `subscribe` and `onCommentCreated` belong to the host adapter. The default fixture omits `reanchor`.
