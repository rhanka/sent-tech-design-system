# SOP — Cloning a company theme (build agent brief)

> Version note: verified 2026-09-24 against `main` at `0592bd9e`.
> What changed since the previous revision: docs registration is stated as
> the serial conductor act it is (lockfile entry, docs dependency entry,
> second-wave chrome wiring — no builder step remains); the catalogue
> invariants the builder must not break are named; the MAPPING.md
> derived-values section has exactly one form (`##`); the gate is run by
> the builder itself (installing stays with the conductor). Token layers,
> fidelity levers, and MAPPING.md format are otherwise unchanged.

You build **one** package `packages/theme-<id>/` that faithfully clones a
real brand's design. Method = **"anatomy clone"**: every token value is
**measured from the brand's official CSS/tokens**, and its source is
documented in `MAPPING.md`. Any unsourced value is flagged `à confirmer`
(inline `// à confirmer` + dedicated MAPPING section).

## Golden scope rule
- You create **ONLY** the `packages/theme-<id>/` folder. **TOUCH NO shared
  file** (`apps/docs/**`, `packages/themes`, `packages/tokens`,
  `url-state.ts`, `header-contract.test.ts`, lockfile). There is no docs
  registration step left for you to do: `apps/docs/src/lib/theme-catalog.ts`
  auto-discovers every `packages/theme-*/src/index.ts` via
  `import.meta.glob`, `url-state.ts` derives its valid ids from that
  catalogue, and privacy is a whitelist (`PUBLIC_THEME_IDS` = canada,
  dsfr, quebec, sent-tech) so a new theme is private by construction.
  What remains is a serial CONDUCTOR act, done once per lot to avoid merge
  conflicts: the `package-lock.json` entry, the `apps/docs/package.json`
  dependency entry and — in a second wave, outside the package programme —
  the `Chrome<Brand>.svelte` component, its `+layout.svelte` wiring
  (`useCustomChrome` and the render branch) and the
  `header-contract.test.ts` literal update. Three catalogue invariants are
  asserted by shared `apps/docs` tests, outside your gate, so never break
  them: `id` is exactly the `<id>` of your folder, your exported constant
  ends in `Theme`, your entry file is `src/index.ts`.
  The rule stays because 22 builders work in parallel — a shared-file edit
  is a merge conflict, and a defect.
- Your deliverable is "green" when you have run, yourself,
  `npm --workspace packages/theme-<id> run test && run check && run build`
  (`vitest` and `tsc` are present, hoisted at the repository root). You
  never install dependencies — that is the conductor's act.

## Template = theme-schneider-electric
Copy `packages/theme-schneider-electric/` as the base (newest, cleanest
reference), then adapt. Read `packages/theme-hermes/MAPPING.md` and
`packages/theme-renault/MAPPING.md` for provenance models.
`packages/theme-canada/` and `packages/theme-quebec/` are the valid,
publishable configuration references (they carry a licence + `LICENSE`
files — do NOT copy those into a private brand clone). See also
`packages/theme-dsfr/src/index.ts`
for the richest anatomy block (field filled-underline, focus outline,
component overrides).

## Files to create
Five files — a prescription of this programme, not a description of the
repository (15 of the 126 existing theme packages carry no `MAPPING.md`;
you still deliver one).
| File | What |
|---|---|
| `package.json` | Copy the template's. Change `name`→`@sentropic/design-system-theme-<id>`, `description`, `repository.directory`→`packages/theme-<id>`. **Keep `version:"0.1.0"` and `"private": true`** (never a licence field on a brand clone). **Exact pins**: `dependencies` `@sentropic/design-system-themes` and `-tokens` at `"0.11.0"`; `devDependencies` `typescript:"^5.9.3"`. Scripts: `build:"tsc -p tsconfig.json"`, `check:"tsc -p tsconfig.json --noEmit"`, `test:"vitest run src"`. |
| `tsconfig.json` | Copy the template's **identically** (no changes). |
| `src/index.ts` | The theme. Measured raw palette → `foundation` → `semantic` → `export const <camelId>Theme: TenantTheme`. |
| `src/index.test.ts` | The gate (3 `it()`). Copy the template's, replace the imported symbol, the `describe` name, `id`, `label`, the `--st-field-style` value, and every measured hex and font name. |
| `MAPPING.md` | Provenance: sources (URLs), colour→role table, `à confirmer` section, typography, anatomical signatures. |

Do NOT create `dist/`, `README.md`, `LICENSE` files, or tsconfig
`references`. npm workspaces auto-discover `packages/*`; `dist/` is built
incrementally by `scripts/ensure-theme-dists.mjs` (no script edit needed).

## Token layers (`tokens` = `{ foundation, semantic, component }`)
- `component` is **ALWAYS** `createComponent(semantic, foundation)` —
  **never hand-written**. The single precedent is a thin wrapper that calls
  `createComponent` and then overrides one leaf (airbus
  `createAirbusComponent`, adding `field.maxWidth` in
  `packages/theme-airbus/src/index.ts`): named here as a
  non-reconductible precedent, not a pattern to copy.
- `semantic` (all keys mandatory): `surface{default,subtle,raised,inverse,overlay}`, `text{primary,secondary,muted,inverse,link}`, `border{subtle,strong,interactive}`, `action{primary,primaryHover,primaryText,secondary,secondaryHover,secondaryText,danger}`, `feedback{success,warning,error,info}`, `status{pending,processing,completed,failed}`, `data{category1..8}`.
- `foundation` scalars always present: `color{blue{10,60,80},cyan{10,50,70},slate{0,10,20,60,80,90},feedback{...}}`, `font{sans,display,mono}` (**font names only, never a binary**), `spacing{0,1,2,3,4,6,8,12,16}`, `radius{none,sm,md,lg,pill}`, `shadow{subtle,medium,floating}`, `motion{fast,normal,slow,easing}`, `z{header,toast,overlay,modal,chat}`.
- `foundation` anatomy (override **only what differs** from the base; the rest falls back to Sent Tech): `borderWidth`, `borderStyle`, `density{sm,md,lg}`, `typography{control,field,label,link}`, `disabledOpacity`, `transition`, `cursor`, `iconSize`, **`focus`**, **`field`**, then the 12 component overrides, **always all present** — `card`, `buttonSecondary`, `tabs`, `pagination`, `breadcrumb`, `alert`, `accordion`, `tag`, `badge`, `choice`, `search`, `toggle` (a value identical to the base is rewritten, not omitted; a missing key passes the whole gate — METHOD section 12).

## The 3 biggest fidelity levers
1. **`field.style`**: `"outline"` (surface/white fill + four equal side borders) **vs** `"filled-underline"` (grey fill + bottom rule; `underlineMode:"shadow"|"border"`, `fillBg`, `radiusTop/Bottom`). The fill decides first: a filled grey background means `"filled-underline"` even with side borders; a mixed full-border-plus-thicker-bottom on a non-filled background stays `"outline"` (record it in MAPPING.md). Measure the real input. Redraw the native `<select>` chevron via `selectChevron` (data-URI SVG with the brand hex) + `selectAppearance:"none"` + `selectPaddingRight`.
2. **`focus.strategy`**: `"outline"|"ring"|"inset"|"double"` + `width`/`offset`/`color`. Encode the real *technique*, not just the colour.
3. **`density`**: read the `height` and `padding` declarations in the brand CSS when they exist; otherwise reuse the base values explicitly (`controlHeight` 2rem/2.5rem/3rem, `iconSize` 1rem/1.125rem/1.25rem — as both reference packages do) and mark `à confirmer`.

## Measurement method (order)
1. Raw palette → `const <id>Color = {...}` with the **source variable** in comments (`--brand-...`). Group by family (brand, accent, grey scale, system).
2. Map onto `foundation.color` + `semantic`. No equivalent (e.g. no cyan) → closest family, **marked** `à confirmer`.
3. Typography: font names for headings+body (+mono). Fill `font.*` + the 4 `typography.*`.
4. Density: measured button & input `height`/`padding` declarations → `density.{sm,md,lg}`; no usable geometry → base values, marked `à confirmer`.
5. Measured radii (square vs rounded). 6. `borderWidth/Style`. 7. `focus`. 8. `field`. 9. All 12 measured component overrides.

Tie-break for one role with several hex candidates: (1) declaration count across the brand's official stylesheets; (2) role declared by the variable name; (3) a custom-property (`--*`) declaration beats an inline use, then the higher-ranked source below. Record per-file counts in MAPPING.md.

Allowed sources, ranked: (a) a public tokenised design system published by the brand (e.g. Schneider "Quartz"); (b) the official site's stylesheet custom properties; (c) a brand charter PDF published by the brand; (d) the font name as declared by the official stylesheet. NOT sources: colour aggregators (cross-check only), screenshots, "inspired-by" palettes, model memory. No Python, no script or image — one-line Node commands (METHOD section 9) or already-present native binaries only.

## Gate (commands)
```
npm --workspace packages/theme-<id> run test    # vitest run src — 3 tests
npm --workspace packages/theme-<id> run check   # tsc --noEmit
npm --workspace packages/theme-<id> run build   # tsc -> dist (the docs need it)
```
Run the three commands yourself; installing is the conductor's act.
`index.test.ts` (3 `it`): (1) identity `toMatchObject({id,label,mode})` + `compileTheme` contains `[data-st-theme="<id>"]`, `--st-component-control-hoverBackground:`, `--st-field-style: <style>;`; (2) anatomy `component.control toMatchObject({background,hoverBackground})` (your hexes), `component.tabs.activeText`; (3) compiled vars: `--st-semantic-action-primary: <hex>;`, `--st-semantic-text-primary: <hex>;`, `--st-semantic-action-danger: <hex>;`, `--st-semantic-surface-inverse: <hex>;` (all four WITH their hex), + each font name present. **These hexes/fonts are the regression lock — put your measured values in.**

## MAPPING.md (schneider/hermes/renault format)
Title + scope note (public tokens + font names only) → `## Sources` (URLs) → `## Colour mapping` (role→source-token→hex table, single shape) → `## À confirmer` (every derived/unmeasured value; mandatory even when empty, saying so) → `## Typography` → `## Signatures anatomiques` (field, radius, focus, buttons, tabs, pagination, chevron, density — a new prescription of this programme) → `## Asset officiel` (logo path, "do not redraw").

## QA (before handing off)
- Re-read `index.ts` against `MAPPING.md`: every `// comment` = a real source variable; every derived value is in `à confirmer`.
- Contrast (METHOD section 9 is the deterministic rule): 4.5:1 running text (`text.link` included), 3:1 lines and focus (`border.interactive`, `focus.color`); a derived value that fails is darkened in HSL 5% steps — never alter the brand colour in its brand role.
- Confirm the green gate (3 tests + check + build) run by you.
Hand off a summary: id, label, primary hex, font, field.style, focus.strategy, sources, and the `à confirmer` list.
