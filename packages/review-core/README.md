# @sentropic/design-system-review-core

Framework-neutral TypeScript core for artifact review mode (SPEC r5, lots DS-1 and DS-2). Zero runtime dependencies.

- **Contract 1:1:** maps directly onto sentropic `packages/comments` (`Comment`, `CommentTarget`, `CommentState` `'open' | 'closed'`, `CommentProvenance`) without inventing wire fields.
- **Adapter seam:** hosts bind `CommentsAdapter` to cluster-mesh HTTP/MCP; `createFixtureCommentsAdapter` is an in-memory port-shaped fixture for tests and demos only (never a production store).
- **View helpers:** authorship fallback (`CollaborationActor` + sponsoring owner + live `runId`), thread grouping (deriving `anchor` from the first chronological row carrying `target.sectionKey`), filters (`all | open | resolved | mine`), unread rules, and `layoutPins`.
- **Anchors (DS-2):** compact `a1:` + base64url(UTF-8 JSON) codec in `sectionKey` with 2048-char cap (quote-context trimming first, then `exact` truncation with `pos` preserved), DOM capture (`createAnchor*`), and re-render-resilient `resolveAnchor`.
- **Status:** public as `@sentropic/design-system-review-core`, published CI-only through `.github/workflows/review-core-publish.yml` on tags `review-core-v<version>` (publish before `svelte-v<version>`).
