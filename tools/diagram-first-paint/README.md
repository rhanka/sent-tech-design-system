# Diagram first paint

`verify.yml` runs `node tools/diagram-first-paint/browser.mjs` in GitHub Actions
with Chrome for Testing and `puppeteer-core`, matching the graph golden setup.
The runner refuses execution outside GitHub CI. Never run it locally.

The 20 cases mount the actual Svelte and Vue `DiagramSceneFigure` sources with
the production theme: architecture and ontology h-cond fixtures, each folded
and unfolded, plus three generic cards, at 1440×900 and 390×844. They use browser
font measurement and stable animation frames without interaction before the
initial snapshot. The only interaction afterwards is the actual Ajuster button.

Assertions read DOM scroll dimensions, text ranges, label rectangles, painted
connector bounding boxes (including stroke), and the world transform. The
clearance is the computed `diagramScene.labelPadding` token scaled into screen
pixels. Display scale must reach 0.45; when fit reaches 0.45, both the frame and
viewport must have no scroll overflow. Labels must stay inside the viewport and
clear every connector bounding box. Initial camera, transforms, geometry and
scroll state must equal those after Ajuster. No case skips or falls back to a
synthetic DOM. Failure artifacts include untouched initial screenshots, failure
screenshots and measured JSON with browser errors.

The browser job is an explicit dependency of Verify's workspace shards and runs
on every Verify event, including diagram packages and their shared dependencies.
Repository branch-protection settings are managed separately from workflow YAML.

Local validation is static only:

```sh
node --check tools/diagram-first-paint/browser.mjs
node --check tools/diagram-first-paint/build.mjs
node tools/diagram-first-paint/build.mjs /tmp/diagram-first-paint-static
```

The last command compiles the harness with Vite without importing or starting a
browser. It requires built diagram/theme dependencies.
