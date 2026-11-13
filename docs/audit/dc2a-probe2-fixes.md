# PR 277 — second probe corrections

Reference: h-cond's `ds0401-probe2-last.md`, captured at
`ea11d6a9cf017f286093217e3320d6c023f9bf55`; original measurements and
captures remain in `h-cond/appctx-dossier/captures-ds0401-r2/`.

Main `75844c4c9` was merged before the fixes. The Vue classic/Vapor port and
publish dependency build are retained. Versions align with main’s unreleased packages: Svelte 0.41.0,
Vue 0.41.0-next.2, canvas 0.2.0 and tokens/themes 0.14.0, with dependent
workspace pins updated.

The shared jsdom probe covers architecture and ontology, folded and
unfolded, in 1440 px and 390 px pages (1206 px and 340 px diagram frames),
in both Svelte and Vue. It uses the vendored h-cond goldens and recorded
Noto Sans label widths. All 48 new cases were added before changing the
implementation: 36 failed, reproducing incomplete names, rule contacts and
display scales below 0.45.

- A14: each card's accessible name equals the complete source slot text,
  including detail, with no ellipsis substitution. The assertion compares
  against source presentation text independently of tooltip/description.
  Vue's numbered scene now shares the same card and zone components.
- Rules: label obstacles include the painted header and footer rules, with
  one CSS px of clearance at the minimum scale. Routes retain permission
  to cross rules when leaving their own zone. The jsdom measurement expands
  each rule by its non-scaling stroke and clearance and checks every label,
  including `rel-arch-07` and `rel-ont-16` on mobile unfolded views.
- A13: `cameraFit` had used unrestricted `zoomFit` for both fit/reset and
  `minZoom`. Both now stop at 0.45; overflowing axes scroll. Tokens cannot
  lower this absolute floor. Initial rendering, Fit, keyboard zoom-out and
  reset are checked in each view. V1 remains 72 vertical / 96 horizontal
  layout units, giving screen minima of 32.4 / 43.2 px at the floor.

The merged flow tests explicitly request the initial bundle used by the
fold-isolation case; it no longer depends on routing obstruction to create
that bundle. Numbered flow steps retain the flow planner's carriers.
Goldens were refreshed for complete accessible names, the main flow edge
metadata and the rule-clearance layout changes. Card geometry and anatomy
styles are unchanged.

Mounted geometry and accessible text are measured in jsdom. Font ink and
page scrolling still require h-cond's next browser probe; no browser was
launched for this patch. The regenerated per-view data is in
[dc2a-probe-matrix.json](dc2a-probe-matrix.json).

Per-view results are identical in both hosts:

| Page / view | Scale | Scroll | Min. screen gap V / H | Full accessible cards |
| --- | ---: | --- | ---: | ---: |
| 1440 architecture unfolded | 0.45 | yes | 32.4 / 43.2 | 16/16 |
| 390 architecture unfolded | 0.45 | yes | 32.4 / 43.2 | 16/16 |
| 1440 architecture folded | 0.62 | no | 44.64 / 59.52 | 4/4 |
| 390 architecture folded | 0.45 | yes | 32.4 / 43.2 | 4/4 |
| 1440 ontology unfolded | 0.45 | yes | 32.4 / 43.2 | 14/14 |
| 390 ontology unfolded | 0.45 | yes | 32.4 / 43.2 | 14/14 |
| 1440 ontology folded | 0.62 | no | 44.64 / 59.52 | 5/5 |
| 390 ontology folded | 0.45 | yes | 32.4 / 43.2 | 5/5 |

Validation:

- Diagram-core: 46 files, 669 passed.
- Diagram-canvas: 55 files, 561 passed and 1 skipped; includes cache
  performance, golden scenes and the full tuning grid without changing
  timeout or performance limits.
- Svelte diagrams: 11 files, 478 passed.
- Vue diagrams and shared host probes: 11 files, 814 passed.
- Anatomy contract and rendered anatomy, layering, dependency pin and
  provenance guards, index:check and licensing:check pass (22 publishable
  packages).
- Core, canvas, tokens, Svelte, Vue classic/Vapor and component-index builds
  pass; canvas type checking and git diff --check pass.
