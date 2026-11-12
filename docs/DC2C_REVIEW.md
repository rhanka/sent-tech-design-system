# DC-2c.1 design-verification reconciliation

Target: feat/dc2c-numbered-flows, based on d9a04d2e. Author host: codex;
exact author model and effort are unavailable in the session metadata.

Two independent reviewers examined the core/type/selection design and the
engine/host/accessibility design in two passes. These were read-only design
reviews. A harness h2a consensus review has status `selection-failed`: the h2a
MCP launch tool is unavailable and exact author metadata cannot be attested.
No h2a consensus verdict is claimed.

| Pass | Finding | Resolution / regression |
|---|---|---|
| 1 | Literal relation readers bypass inherited constraints | Base/schema readers in validation, folds, graphs and visibility; core refinement tests |
| 1 | Frozen presentation adapter still reads containment literally | Resolve relation types at its boundary; preserve both pinned adapter files; refinement-review test |
| 1 | Flow semantics could be silently omitted after generic validation | Measured and compatibility layouts run validateFlows |
| 1 | Self-steps route despite the scope excluding loops | Equal visible ends become internal before docking; flows/review tests |
| 1 | Mark placement can precede a later text-label route change | Flow routes settle before marks; flow labels use reserved occupancy and cannot reroute afterward |
| 1 | Bundling can lose summaries or occurrence identities | Group projected owner occurrences, analyze all projected summaries before suppression; summary tests |
| 2 | Node buttons hidden with visibility are not keyboard-focusable | Tokenized opacity, reveal on focus-visible; CSS and host assertions |
| 2 | Controlled node activation reports proposed highlight | Preserve displayed controlled selection before deriving callback; shared controlled-node case |
| 2 | Bundle carrier text label survives suppression | Skip all bundle text labels, including carrier measurement; flow-review test |
| 2 | No-flow hidden relations lose retained waypoints | Strip only suppressed flow routes; no-flow geometry regression and original DOM snapshot |
| 2 | Stale hover/focus survives scene repair | Always repair transients; shared removed-hover and focus-removal cases |
| 2 | Pan suppression eats the next keyboard activation | Capture and suppress pointer clicks, retain zero-detail keyboard clicks; shared pan cases |
| 2 | Badge-less/controlled selection does not scroll | Use route bounds fallback and react to selection identity; host budget and selection cases |
| 2 | Selected child node is cleared by folding | Shared entity-to-visible-box map retains logical selection; flow-review test |
| 2 | Ordinary links bypass inherited relation filters | Filter drawing and scene edges consistently; mixed filtered-view regression |
| 2 | Retained authored scenarios still render | Refuse authored scenario occurrences; flow-review test |

Astra3 was read when it appeared. Both blocking findings are addressed:
selected internal relation identity survives on its box, including same-box
hover/focus, and equal visible endpoints produce no route/arrow/badge. The
single-occurrence prerequisite is enforced; absent/filtered view steps are
excluded from navigation. Omitted kind, metadata-only scenarios, multiple
starts and first-post-gateway numbering are covered in fixtures/docs. Its
collection and pulse-completion corrections remain explicitly assigned to
DC-2c.2, which is outside this implementation.
