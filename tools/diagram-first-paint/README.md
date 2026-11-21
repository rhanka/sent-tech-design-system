# Diagram first paint

`verify.yml` runs `node tools/diagram-first-paint/browser.mjs` in GitHub Actions
with Chrome for Testing and `puppeteer-core`, matching the graph golden setup.
The runner refuses execution outside GitHub CI. Never run it locally.

The 52 cases (`2 frameworks × 2 viewports × cases.length` from `scenes.js`) mount
the actual Svelte and Vue `DiagramSceneFigure` sources with the production theme:
architecture and ontology h-cond fixtures, each folded and unfolded, an ERD-style
ontology whose class cards sit in two nested zones (with and without a route
leaving the inner zone), three generic cards (v1 frozen and v2 compact 352×154),
numbered flows with and without bundles, and three r7 reference scenes
(`r7-connectors`, `r7-connectors-folded`, `r7-nested-styles`) exercising rounded
elbows, link stroke widths, right-anchored link legends, and live fold/unfold
legend updates, at 1440×900 and 390×844. They
use browser font measurement and stable animation frames without interaction
before the initial snapshot. The only interaction afterwards is the actual Ajuster button.

Assertions read DOM scroll dimensions, text ranges, label rectangles,
transformed connector segments (including stroke), and the numeric world
transform. The clearance is the computed `diagramScene.labelPadding` token scaled into screen
pixels. Display scale must reach 0.45. The unclamped fit is derived from the DOM
extent and world scale; when feasible at 0.45, the viewport must have no scroll
overflow. Otherwise, only overflowing axes may scroll, starting at the origin,
and all drawing content must remain reachable within the usable viewport,
excluding scrollbar thickness. Chrome's default `--hide-scrollbars` is removed;
horizontal overflow must display a classic scrollbar. The outer frame must never overflow.
Every visible relation must have a rendered connector that touches both boxes
it joins and is painted for at least half its length: opaque surfaces count as
hiding it only when they follow the connector layer in document order, so a
zone frame painted over its own relations fails the gate, as does a label
without a connector. On three-cards, every card must centre its single-line
`First paint` body ink horizontally in the frozen body box (centre-x 232 card
px) and drop the block by half the spare space (ink top at or below 104 card
px — never top-aligned). Labels must clear every painted connector segment; portions hidden behind
opaque card and zone surfaces are excluded. Initial camera and scroll
state must equal those after Ajuster exactly; transform components may
differ by at most 1e-3 and other numeric geometry by at most 1/64 CSS px. No case skips or falls back to a
synthetic DOM. Failure artifacts include untouched initial screenshots, failure
screenshots and measured JSON with browser errors.

The browser job is an explicit dependency of Verify's workspace shards and runs
on every Verify event, including diagram packages and their shared dependencies.
Repository branch-protection settings are managed separately from workflow YAML.

Local validation uses numeric unit checks and static compilation:

```sh
node --test scripts/diagram-first-paint-geometry.test.mjs
node --check tools/diagram-first-paint/browser.mjs
node --check tools/diagram-first-paint/build.mjs
node tools/diagram-first-paint/build.mjs /tmp/diagram-first-paint-static
```

The last command compiles the harness with Vite without importing or starting a
browser. It requires built diagram/theme dependencies.
