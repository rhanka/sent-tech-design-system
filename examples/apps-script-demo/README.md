# Apps Script demo — generic decision dossier (neutral theme)

A generic demo of the Sentropic design system served as a Google Apps Script web
app. The build produces **one self-contained offline HTML page**: script, styles,
font and data are inlined, and the page makes no network request.

All content is made up for the demo (generic names and sample figures only).

## What the page shows

- **Dossier view** — title band, prose sections, a set of three option cards, a
  diagram (`generic@1` document with nested containers, nodes and labelled links,
  rendered by `DiagramSceneFigure`) and a bar chart.
- **Evaluation view** — a criteria table, a line chart and next steps. This view
  has no diagram.
- Neutral default theme (`sent-tech`), light and dark: the page follows
  `prefers-color-scheme`, and the "Theme" button cycles Auto → Light → Dark.
- Fluid layout down to phone width.

## Packages (published on npm, pinned)

| Package | Version |
| --- | --- |
| `@sentropic/design-system-svelte` | 0.41.2 |
| `@sentropic/diagram-canvas` | 0.2.2 |
| `@sentropic/diagram-core` | 0.2.0 |

Svelte components are compiled at build time; the page ships no runtime compiler.
The Inter variable font (latin subset, SIL Open Font License 1.1, from
`@fontsource-variable/inter`) is inlined as a `data:` URI.

## Layout

```
examples/apps-script-demo/
  src/            page sources (Svelte + TypeScript + CSS, generic data)
  scripts/        build.ts, self-check.ts, smoke-ssr.ts (Node/TypeScript only)
  gas/            Apps Script project, ready for clasp
    appsscript.json   web app manifest (V8, access DOMAIN, executeAs USER_ACCESSING)
    Code.gs           doGet() -> HtmlService.createHtmlOutputFromFile('demo')
    demo.html         the built page (copy of dist/demo.html)
  size-report.json    sizes of the last build, in bytes
```

## Build and check

Requires Node 22 or later. Run every command from this folder; the example is a
standalone project and is not part of the repository workspaces.

```sh
npm ci
npm run build    # writes dist/demo.html, gas/demo.html and size-report.json
npm run check    # self-check of the built page
npm run smoke    # server render (no browser) of the page content
npm run demo     # the three steps above, in order
```

### Self-check (`npm run check`)

Fails (non-zero exit) unless the built page has:

- 0 `src` / `href` attribute, 0 `<link>`, 0 `<iframe>`/`<object>`/`<embed>`,
  0 external `url()` and 0 `@import` in CSS;
- 0 `fetch(`, `XMLHttpRequest`, dynamic `import()`, `WebSocket`, `EventSource`,
  `sendBeacon`, `importScripts`, worker;
- no `eval(`, no `new Function`, no string timer;
- exactly one inline `<script>`, the `<base target="_top">` element, the inlined
  font, and `gas/demo.html` identical to `dist/demo.html`.

The page therefore runs under a `connect-src 'none'` policy.

### Size report (last build, bytes)

| Part | Bytes |
| --- | ---: |
| HTML page (total) | 648 641 |
| JS bundle | 466 662 |
| CSS (total) | 181 607 |
| — inlined font | 64 584 |
| — theme variables (light + dark) | 66 119 |
| — components and page | 50 902 |

`size-report.json` holds the same figures and is rewritten by each build.

## Deploy with clasp

The repository never pushes to Apps Script. The owner of the Apps Script project
runs these steps.

1. Install clasp and sign in (opens a browser for the Google account):

   ```sh
   npm install -g @google/clasp
   clasp login
   ```

   The Apps Script API must be enabled for the account:
   <https://script.google.com/home/usersettings>.

2. Build the page, then create the Apps Script project from the `gas` folder:

   ```sh
   npm run demo
   cd gas
   clasp create --type webapp --title "Design system demo" --rootDir .
   ```

   `clasp create` writes `.clasp.json` (the script id) in `gas/`. That file is
   git-ignored: it belongs to one Apps Script project. If clasp replaces
   `appsscript.json` with its own default, restore it with
   `git checkout -- appsscript.json` before pushing.

   To reuse an existing project instead: `clasp clone <scriptId> --rootDir .`,
   then restore the three files of this folder with `git checkout -- .`.

3. Push the three files (`appsscript.json`, `Code.gs`, `demo.html`):

   ```sh
   clasp push
   ```

4. Create a web app deployment and open it:

   ```sh
   clasp deploy --description "Design system demo"
   clasp open --webapp
   ```

   The manifest sets `access: DOMAIN` (any signed-in user of the Workspace
   domain) and `executeAs: USER_ACCESSING`. The script reads no user data and
   declares no OAuth scope.

To publish a new build: `npm run demo`, then `clasp push` and
`clasp deploy --deploymentId <id>` from `gas/`.

## Notes

- `Code.gs` declares the viewport with `addMetaTag`: Apps Script ignores the
  `<meta>` tags of the served file.
- The colour mode is kept in memory only; the page uses no storage.
- Not verified here: the page has not been opened in a browser nor deployed as
  part of this change. The checks above are static (self-check) and server-side
  (render of the page content).
- The theme variables are compiled from the published tokens by `scripts/build.ts`
  rather than taken from `@sentropic/design-system-themes/css/sent-tech.css`
  (0.14.0): in that file the automatic dark block has a `color-scheme`
  declaration outside any rule, which strict CSS parsers refuse.
