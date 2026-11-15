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
- Fluid layout down to phone width: under 30rem the diagram caption sits above its
  zoom controls, and the charts draw at the width of their container so that
  their text is not scaled down.

## Packages (published on npm, pinned)

| Package | Version |
| --- | --- |
| `@sentropic/design-system-svelte` | 0.41.2 |
| `@sentropic/design-system-themes` | 0.14.0 |
| `@sentropic/diagram-canvas` | 0.2.2 |
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
rendered code in the script bundle, plus the font and the theme tokens. Both
files are rewritten by `npm run build`. From the repository root,
`npm run licensing:check` verifies them without installing the example
(`scripts/verify-example-licensing.mjs`) and `npm run notices:generate`
rebuilds them when the example is installed.

## Layout

```
examples/apps-script-demo/
  src/            page sources (Svelte + TypeScript + CSS, generic data)
  scripts/        build.ts, self-check.ts, smoke-ssr.ts and their helpers and
                  tests (Node/TypeScript only)
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
npm test             # fixtures the self-check must reject, contrast of the success tag
npm run build:fresh  # builds into dist/ only, leaving the committed outputs untouched
npm run ci           # typecheck, test, build:fresh, check, smoke
```

`npm run ci` is what the `Apps Script demo` workflow runs
(`.github/workflows/apps-script-demo.yml`). Because `build:fresh` does not write
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
  template, set with `setAttribute` or assigned as a property; no `<link>`,
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

### Server render (`npm run smoke`)

Renders the page once per tab (`Dossier`, `Evaluation`) and counts what each view
must contain and must not contain. The server bundle is written under `dist/ssr`
for the import and removed afterwards.

### Size report (last build, bytes)

| Part | Bytes |
| --- | ---: |
| HTML page (total) | 678 929 |
| JS bundle | 467 627 |
| CSS (total) | 182 064 |
| — inlined font | 64 647 |
| — theme variables (light + dark) | 66 119 |
| — components and page | 51 296 |
| Third-party notices comment | 28 866 |

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
   clasp create --type webapp --title "Design system demo — decision dossier" --rootDir .
   ```

   `clasp create` writes `.clasp.json` (the script id) in `gas/`. That file is
   git-ignored: it belongs to one Apps Script project. If clasp replaces
   `appsscript.json` with its own default, restore it with
   `git checkout -- appsscript.json` before pushing.

   To reuse an existing project instead: `clasp clone <scriptId> --rootDir .`,
   then restore the three files of this folder with `git checkout -- .`.

3. Push the three files (`appsscript.json`, `Code.gs`, `demo.html`; clasp does
   not push `THIRD-PARTY-NOTICES.md`, whose text is inside `demo.html`):

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
   the manifest declares an explicit empty scope list (`"oauthScopes": []`).

To publish a new build: `npm run demo`, then `clasp push` and
`clasp deploy --deploymentId <id>` from `gas/`.

## Notes

- `Code.gs` declares the viewport with `addMetaTag`: Apps Script ignores the
  `<meta>` tags of the served file.
- The page title is the same in `Code.gs` (`setTitle`, the one Apps Script shows)
  and in the `<title>` of the page.
- The colour mode is kept in memory only; the page uses no storage.
- Success tag: in `@sentropic/design-system-svelte` 0.41.2 the success tone is
  drawn as `feedback-success` text on a 14 % tint mixed into a literal `white`
  (2.82:1 in light, 2.20:1 in dark, computed from the theme tokens). `src/page.css`
  redraws it with semantic tokens only — `text-primary` on a tint mixed into
  `surface-raised` — which gives 14.94:1 in light and 12.11:1 in dark
  (`scripts/contrast.test.ts`). The override can go once the component is fixed.
- Not verified here: the page has not been opened in a browser nor deployed as
  part of this change. The checks above are static (self-check), computed from
  the tokens (contrast) and server-side (render of each tab). The phone-width
  layout and the rendering inside the Apps Script frame are therefore unverified
  visually.
- The theme variables are compiled from the published tokens by `scripts/theme.ts`
  rather than taken from `@sentropic/design-system-themes/css/sent-tech.css`
  (0.14.0): in that file the automatic dark block has a `color-scheme`
  declaration outside any rule, which strict CSS parsers refuse.
