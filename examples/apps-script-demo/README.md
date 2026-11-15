# Apps Script demo — generic decision dossier (neutral theme)

A generic demo of the Sentropic design system served as a Google Apps Script web
app. The build produces **one self-contained offline HTML page**: script, styles,
font and data are inlined, and the page makes no network request.

All content is made up for the demo (generic names and sample figures only).

## What the page shows

- **Dossier view** — title band, prose sections, a set of three option cards, a
  diagram (`generic@2` document with nested foldable containers, nodes and
  labelled links, rendered by `DiagramSceneFigure`) and a bar chart.
- **Evaluation view** — a criteria table, a line chart and next steps. This view
  has no diagram.
- Neutral default theme (`sent-tech`), light and dark: the page follows
  `prefers-color-scheme`, and the "Theme" button cycles Auto → Light → Dark.
- Fluid layout down to phone width: under 30rem the diagram caption sits above its
  zoom controls, and the charts draw at the width of their container so that
  their text is not scaled down.
- The diagram opens at the most detailed fold state that its figure frames whole
  (see "Diagram framing" below). On a phone no state fits: it opens with the
  three stages folded, so the structure and its links are there, and scrolls in
  its frame. The framing follows a change of width.

## Packages (published on npm, pinned)

| Package | Version |
| --- | --- |
| `@sentropic/design-system-svelte` | 0.41.3 |
| `@sentropic/design-system-themes` | 0.14.0 |
| `@sentropic/diagram-canvas` | 0.2.3 |
| `@sentropic/diagram-core` | 0.2.0 |

Every direct dependency, build tools included, is declared with an exact version
in `package.json` and locked by `package-lock.json` (`svelte` 5.57.3,
`vite` 8.3.8, `@fontsource-variable/inter` 5.3.0, …).

Svelte components are compiled at build time; the page ships no runtime compiler.
The Inter variable font (latin subset, SIL Open Font License 1.1, from
`@fontsource-variable/inter`) is inlined as a `data:` URI.

## Licences and third-party notices

The example itself is MIT (`LICENSE`). `gas/demo.html` is a redistributed copy of
what it inlines, so the notices travel with it:

- `gas/THIRD-PARTY-NOTICES.md` — inventory (package, version, licence) and the
  full licence texts, re-read from the installed packages: Inter (SIL OFL 1.1,
  with its copyright notice), Svelte (MIT), the Lucide icons (ISC, with the
  Feather MIT notice), `clsx` (MIT) and the `@sentropic/*` packages (MIT, with
  their own third-party notices).
- the same text is embedded as a comment at the top of `gas/demo.html`, which is
  the only file of the three that Apps Script serves.

The inventory is measured by the build: it is the set of packages that own
rendered code in the script bundle, plus the font and the two packages of the
theme (`@sentropic/design-system-themes`, and `@sentropic/design-system-tokens`
which holds the token values it assembles). Both
files are rewritten by `npm run build`. From the repository root,
`npm run licensing:check` verifies them without installing the example
(`scripts/verify-example-licensing.mjs`) and `npm run notices:generate`
rebuilds them when the example is installed.

## Layout

```
examples/apps-script-demo/
  src/            page sources (Svelte + TypeScript + CSS, generic data)
  scripts/        build.ts, self-check.ts, smoke-ssr.ts, their helpers and tests
                  (Node/TypeScript only), and browser-check.mjs (GitHub CI only)
  gas/            Apps Script project, ready for clasp
    appsscript.json   web app manifest (V8, access DOMAIN, executeAs USER_ACCESSING,
                      no OAuth scope)
    Code.gs           doGet() -> HtmlService.createHtmlOutputFromFile('demo')
    demo.html         the built page (copy of dist/demo.html)
    THIRD-PARTY-NOTICES.md   notices of what demo.html embeds (not pushed by clasp)
  LICENSE             MIT
  size-report.json    sizes of the last build, in bytes
```

## Build and check

Requires Node 22 or later. Run every command from this folder; the example is a
standalone project and is not part of the repository workspaces.

```sh
npm ci
npm run build        # writes dist/, gas/demo.html, gas/THIRD-PARTY-NOTICES.md, size-report.json
npm run check        # self-check: dist/ against the committed outputs
npm run smoke        # server render (no browser) of each tab
npm run demo         # the three steps above, in order

npm run typecheck    # tsc and svelte-check
npm test             # fixtures the self-check must reject, contrast of the success tag,
                     # framing of the diagram at every width (layout engine, no browser)
npm run build:fresh  # builds into dist/ only, leaving the committed outputs untouched
npm run ci           # typecheck, test, build:fresh, check, smoke
```

`npm run ci` is what the `Apps Script demo` workflow runs
(`.github/workflows/apps-script-demo.yml`), followed by the browser check
described below. Because `build:fresh` does not write
`gas/`, the self-check then compares a fresh build with the committed
`gas/demo.html`: a change to `src/` without the rebuilt page fails.

### Self-check (`npm run check`)

Fails (non-zero exit) unless the built page passes every rule below. The page
builds its DOM from the inline script, so the rules scan the whole document
(markup, styles and script), not the static markup alone.

- the notices comment at the top is exactly `gas/THIRD-PARTY-NOTICES.md`, which
  holds the OFL 1.1, MIT and ISC texts; there is no other HTML comment;
- no absolute URL other than an allowlist of inert constants (XML namespaces,
  the JSON Schema dialect identifier, the documentation URLs in Svelte error
  messages), and no protocol-relative URL;
- no `src` / `href` / `srcset` / `srcdoc` / `poster` / `formaction` /
  `xlink:href` with a value other than a `#fragment`, whether written in a
  template, set with `setAttribute` or assigned as a property; none of these
  names passed to a helper call or used as an object key either, which is what
  Svelte 5 compiles `<img src={value}>` and spread attributes to
  (`set_attribute(node, "src", value)`, minified to `Z(e,\`src\`,v)`); no `<link>`,
  `<iframe>`, `<object>`, `<embed>`, `<form>`, `<meta http-equiv>`; no external
  `url()`, no `@import`;
- no `fetch(`, `XMLHttpRequest`, dynamic `import()`, `WebSocket`, `EventSource`,
  `WebTransport`, `RTCPeerConnection`, `sendBeacon`, `importScripts`, worker or
  service worker; no `window.open`, no `location` change;
- no `eval(`, no `new Function`, no string timer;
- no `localStorage`, `sessionStorage`, `indexedDB`, cookie;
- exactly one inline `<script>`, the `<base target="_top">` element, the inlined
  font;
- `dist/demo.html`, the notices and the size report are byte-identical to the
  committed `gas/demo.html`, `gas/THIRD-PARTY-NOTICES.md` and `size-report.json`.

The rules are a pure function (`scripts/verify-html.ts`).
`scripts/self-check.test.ts` plants each violation in a passing fixture and
requires the matching rule to fail; it also runs the rules on the committed page.

The page therefore runs under a `connect-src 'none'` policy.

Out of scope of a static check: an attribute name or a URL assembled at run time
from fragments (`"s" + "rc"`). The run-time side is covered by the browser check,
which refuses any request that is not `file:` or `data:`.

### Diagram framing (`npm test`, then the browser check)

`DiagramSceneFigure` frames a drawing down to its readable scale (0.45, where an
edge label is about 8 CSS px) and scrolls past it; it has no smaller zoom. The
unfolded sample scene is 2248 × 1110 scene units, which a figure narrower than
about 1045 px cannot frame. The page therefore declares three fold states
(`diagramFoldLevels` in `src/data.ts`) and opens the most detailed one that the
figure frames whole, computed with the layout engine the figure uses
(`src/diagram-fit.ts`):

| Fold state | Scene units | Opens from a figure width of |
| --- | --- | ---: |
| everything unfolded | 2248 × 1110 | 1045 px |
| Storage folded | 1688 × 838 | 785 px |
| Ingestion, Processing and Storage folded | 1060 × 624 | 518 px, and below it (scrolls) |

(In a window too short for a state — under about 610 px for the first one — the
next state is used.)

**Phone.** A card is 460 × 200 scene units and the frame of the figure is 16:9,
so under 518 px the figure frames one card and nothing more. The page does not
open on one folded card: it opens the last state, which keeps the client, the
three stages and their links on the drawing, at the readable scale. The figure
then scrolls from its start, where the `Client app` card and the start of the
first stage are in view. Folding `Request path` by hand gives the one-card view.

**Change of width and fold by hand.** What the figure (0.41.3) does on its own:
while its camera is at the fit it follows its own size and, after a fold, reads
the drawing once the transition has ended and frames it; a camera the reader has
zoomed is only clamped to the new range. What the page adds: when the width of
the figure or the fold state it picks changes (window resize, phone rotation,
split screen), it calls `fitToFrame()` on the figure, the action of the Fit
button, so a new width is framed even after a zoom. A fold by hand is left to
the figure, so it keeps a zoom the reader chose; Fit frames it again. Unfolding
a container by hand beyond what fits is allowed: the drawing then scrolls and
Fit returns to the readable scale. A manual fold state is kept until a change of
width moves the page to another state. A change of window height alone (the
address bar of a mobile browser) can move the page to another state; it does not
reset the camera otherwise.

The scene uses the `generic@2` profile: under `generic@1` a container has no
fold group, so folding it draws a card while its members stay on the drawing.

`scripts/diagram-fit.test.ts` runs the real layout engine without a browser: at
every figure width from 240 to 1600 px and five window heights, the state picked
must be framed without panning, with the margin kept for font metrics, or be the
last state where none can be framed; every state must keep the client, the three
stages and at least three links; folding must hide the members; and two negative
witnesses (the unfolded scene on a phone width, the `generic@1` profile) must
fail to frame or fold.

### Browser check (GitHub CI only)

`scripts/browser-check.mjs` opens the built `dist/demo.html` in Chrome for
Testing with `puppeteer-core`, at 320 × 640, 768 × 1024 and 1280 × 900, in
light and in dark. It refuses to run outside GitHub Actions; never run it
locally. It requires:

- the expected fold state when the page opens (five boxes at 320 and 768 px,
  eleven at 1280 px), no horizontal overflow of the page, no console error or
  warning, and no request other than `file:` or `data:`;
- at 768 and 1280 px, before and after a click on "Fit": every box and every
  edge label inside the figure viewport and no scroll overflow in it;
- at 320 px: the readable scale, the drawing scrolled to its start, the
  `Client app` card in view with a stage beside it; then `Request path` folded
  by hand is framed whole, and unfolding it gives back the opening extent;
- links painted: one connector per link, with a length; at points sampled along
  each connector, outside the cards and labels, the top-most element is the
  connector itself (hit testing follows the paint order, so a container surface
  drawn above a link fails here);
- one page through a change of width (1280 → 320 → 768 → 1280, after a zoom in):
  at each width the fold state, zoom and scroll extent of a fresh load at that
  width; then `Storage` folded by hand at 1280 px is framed whole.

### Server render (`npm run smoke`)

Renders the page once per tab (`Dossier`, `Evaluation`) and counts what each view
must contain and must not contain. For the diagram it also requires one
connector path, with at least two distinct points, for every link relation of
the document, no connector without a relation, and the connector layer placed
in the markup after every expanded container frame and before every card (the
figure paints in document order). The server bundle is written under `dist/ssr`
for the import and removed afterwards.

### Size report (last build, bytes)

| Part | Bytes |
| --- | ---: |
| HTML page (total) | 687 079 |
| JS bundle | 473 004 |
| CSS (total) | 182 064 |
| — inlined font | 64 647 |
| — theme variables (light + dark) | 66 119 |
| — components and page | 51 296 |
| Third-party notices comment | 31 639 |

`size-report.json` holds the same figures and is rewritten by each build.

## Deploy with clasp

The repository never pushes to Apps Script. The owner of the Apps Script project
runs these steps.

1. Install clasp and sign in (opens a browser for the Google account):

   ```sh
   npm install -g @google/clasp@3.4.1
   clasp login
   ```

   The commands below are written for clasp 3.4.1 (command names and options
   read from `clasp <command> --help` of that version; clasp 2 uses other
   names). Without a global install, prefix each one with
   `npx --yes @google/clasp@3.4.1` instead of `clasp`.

   The Apps Script API must be enabled for the account:
   <https://script.google.com/home/usersettings>.

   The committed manifest sets `"access": "DOMAIN"`, which needs a **Google
   Workspace account**: a consumer account (`@gmail.com`) has no domain and
   cannot create that deployment. See "Access" below for the alternative.

2. Build the page, then create the Apps Script project from the `gas` folder:

   ```sh
   npm run demo
   cd gas
   clasp create-script --type webapp --title "Design system demo — decision dossier" --rootDir .
   ```

   `clasp create-script` writes `.clasp.json` (the script id) in `gas/`. That file is
   git-ignored: it belongs to one Apps Script project. If clasp replaces
   `appsscript.json` with its own default, restore it with
   `git checkout -- appsscript.json` before pushing.

   To reuse an existing project instead: `clasp clone-script <scriptId> --rootDir .`,
   then restore the three files of this folder with `git checkout -- .`.

3. Push the three files (`appsscript.json`, `Code.gs`, `demo.html`; clasp does
   not push `THIRD-PARTY-NOTICES.md`, whose text is inside `demo.html`):

   ```sh
   clasp push
   ```

4. Create a web app deployment and open it:

   ```sh
   clasp create-deployment --description "Design system demo"
   clasp open-web-app <deploymentId>
   ```

   `create-deployment` prints the deployment id; `clasp list-deployments` lists
   them again.

To publish a new build: `npm run demo`, then `clasp push` and
`clasp update-deployment <deploymentId>` from `gas/`.

### Access

The manifest sets `executeAs: USER_ACCESSING` and `access: DOMAIN`. The script
reads no user data and declares an explicit empty scope list
(`"oauthScopes": []`).

| `webapp.access` | Who can open the web app | Account that can deploy it |
| --- | --- | --- |
| `DOMAIN` (committed default) | any signed-in user of the deployer's Workspace domain | Google Workspace only |
| `MYSELF` | the deployer only | Workspace or consumer |
| `ANYONE` | any signed-in Google account | Workspace or consumer (a Workspace administrator can forbid it) |

`DOMAIN` stays the default. From a consumer account, or for a private test,
change the value in `gas/appsscript.json` **before** `clasp push`: `"MYSELF"`
for a test by the deployer alone, `"ANYONE"` to share with any signed-in Google
account (with `USER_ACCESSING` the visitor signs in; the page shows sample data
only). Widening the audience is a decision of the owner of the Apps Script
project; keep that change local and do not commit it.

## Notes

- `Code.gs` declares the viewport with `addMetaTag`: Apps Script ignores the
  `<meta>` tags of the served file.
- The page title is the same in `Code.gs` (`setTitle`, the one Apps Script shows)
  and in the `<title>` of the page.
- The colour mode is kept in memory only; the page uses no storage.
- Success tag: in `@sentropic/design-system-svelte` 0.41.3 the success tone is
  drawn as `feedback-success` text on a 14 % tint mixed into a literal `white`
  (2.82:1 in light, 2.20:1 in dark, computed from the theme tokens). `src/page.css`
  redraws it with semantic tokens only — `text-primary` on a tint mixed into
  `surface-raised` — which gives 14.94:1 in light and 12.11:1 in dark
  (`scripts/contrast.test.ts`). The override can go once the component is fixed.
- Not verified here: the page has not been deployed as part of this change, so
  the rendering inside the Apps Script frame (sandbox iframe, colour-scheme
  propagation) and the clasp commands against a real project are unverified.
  The page is opened in a browser by the CI browser check only, which asserts
  geometry, console and requests; nobody compared screenshots.
- Links and container surfaces: up to `@sentropic/design-system-svelte` 0.41.2 the
  figure painted the links before every box, so the opaque surface of an
  expanded container hid each link routed inside it. 0.41.3 (with
  `@sentropic/diagram-canvas` 0.2.3) paints the expanded container frames first,
  then the links, then the cards. The example pins those versions and carries no
  override; the server render check and the browser check both fail if a link is
  missing or covered.
- Diagram edge labels in dark mode: `@sentropic/design-system-tokens` 0.14.0
  (compiled through `@sentropic/design-system-themes` 0.14.0) defines
  `diagramScene.labelSurface` (`#ffffff`), `labelBorder` (`#cbd5e1`),
  `labelText` (`#172033`) and `edgeStroke` (`#64748b`) as literals with no dark
  value, so in dark mode each edge label is a white chip on the dark scene. The
  text contrast is high (about 16:1); the defect is the missing dark adaptation.
  It is an upstream issue and is not patched here.
- The theme variables are compiled from the published tokens by `scripts/theme.ts`
  rather than taken from `@sentropic/design-system-themes/css/sent-tech.css`
  (0.14.0): in that file the automatic dark block has a `color-scheme`
  declaration outside any rule, which strict CSS parsers refuse.
