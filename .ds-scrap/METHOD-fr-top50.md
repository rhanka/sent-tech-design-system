# METHOD — Top-50 France brand themes + LaTeX (builder method)

Scope: 22 builder agents, each delivering ONE package `packages/theme-<id>/`.
This file is self-contained: a builder who reads only this file must be able
to deliver a conforming theme without asking questions. Language for
everything produced in the repo (docs, code, comments): English. The
derived-value marker `à confirmer` is a literal flag and is kept as-is.

Verified against `main` at `0592bd9e` on 2026-09-24. Reference template:
`packages/theme-schneider-electric/` (newest, cleanest). Provenance models:
`packages/theme-hermes/MAPPING.md`, `packages/theme-renault/MAPPING.md`.
Publishable model: `packages/theme-canada/`.

---

## 1. Scope rule

The builder creates ONLY `packages/theme-<id>/` — the five files listed in
section 4. It touches NO shared file, NO other package, NOTHING under `apps/`,
and NOT the lockfile.

Docs registration is a **serial conductor act**, not a builder act — reduced,
for this programme, to exactly three items (it used to be five under the old
recipe):

| Act | Who | When |
|---|---|---|
| `npm install`, then commit of `package-lock.json` alone | conductor | once per lot, after the lot's packages land |
| dependency entry in `apps/docs/package.json` | conductor | once per lot |
| `Chrome<Brand>.svelte` + `+layout.svelte` wiring (`useCustomChrome` and the render branch) + update of the `apps/docs/src/lib/header-contract.test.ts` literal | conductor | **second wave**, outside this package programme |
| a single fully-determined value inside a package, after review — see the three conditions below | conductor | exceptionally, post-review |

**The fourth act is bounded, because "conductor act" is a category that widens on
its own if nobody bounds it.** The conductor may apply a change inside a builder's
package only when all three conditions hold together:

1. It is **entirely determined** by a measurement already made and verifiable by a
   third party — not by the conductor's own reading of the brand.
2. It is **one value or one line**.
3. It is **declared and put up for challenge** in the next pass, by name, so a
   reviewer is asked to contest it rather than to discover it.

The case that set the boundary: a text role shipped at 1.92:1, failing both the
4.5:1 running-text floor and the 3:1 line floor, routed under section 9 to the
brand's other measured text grey at 3.95:1 — one hex, measured twice before the
conductor touched it, declared and contested in the following pass. Delegating one
line there would have cost 50 000 to 100 000 tokens.

The moment a judgement about the brand is required — which colour *represents* the
brand, which scope to retain, which rule is the real one — it goes to a builder
whatever the cost. Choosing a primary would never pass the three conditions; routing
a failing role to an already-measured neighbour does.

Without the lockfile entry `npm ci` fails: `package-lock.json` carries one
entry per theme package, and every workflow in `.github/workflows` installs
with `npm ci`. The model for that act is the dedicated commit
`139690f6 chore(lock): enregistrer les 5 packages thèmes Paris lot 4 dans le
lockfile`, which touches only `package-lock.json`.

Everything else about registration is **automatic** and stays automatic:
`apps/docs/src/lib/theme-catalog.ts` discovers every
`packages/theme-*/src/index.ts` through `import.meta.glob`; `url-state.ts`
derives its valid ids (`VALID_THEME_IDS`) from that catalogue; privacy is a
whitelist (`PUBLIC_THEME_IDS`) so a new theme is private by construction;
`dist/` is built by `scripts/ensure-theme-dists.mjs` (workspace-graph
auto-discovery, content-hash rebuilds — no script edit when a theme is
added); and `scripts/smoke-pack.mjs` only packs and deep-import-checks
publishable packages, so a new `private: true` brand theme enters no pack
selection (the licensing gate, `scripts/verify-publishable-licensing.mjs`,
likewise applies only to non-`private` workspaces).

The scope rule therefore stays as **merge hygiene**: with 22 builders working
in parallel, a shared-file edit is a merge conflict and a defect. The review
protocol (section 12) rejects any diff outside `packages/theme-<id>/`.

## 2. Token measurement procedure

Deterministic order. Never skip a step, never reorder.

**Step 0 — Fetch without a browser.** Retrieve the brand's public CSS with
the native binaries already present (`curl`, `grep`, `sed` — no Python, no
script or image; one-line Node commands per section 9 and present native
binaries are allowed; see section 10). Some hosts block bare
requests, and a browser user-agent alone is often not enough. A CDN front such
as Akamai can answer `403 Access Denied` (body: `errors.edgesuite.net`)
**specifically to a browser user-agent sent without the rest of a browser's
headers** — measured on one brand: the bare `curl/8.x` request returned 200, the
same request with only `-A '…Chrome…'` returned 403, and the full header set
returned 200 again. So the prescribed workaround is what triggers the block, and
an executor that keeps retrying with only a UA loops on 403 for ever. Two
builders were lost that way before the cause was found. Do not assume the
direction: probe the three forms (bare, UA-only, full) and record which ones
answer — **three repetitions of each**, because one of them answered once and
failed after, and a single sample would have made it look like the discriminant.

**`Referer` is the header most often missing from a "full" set, and it is often the
one that decides.** A survey of fourteen brands classed three as unreachable behind
a CDN; the probe's header set had every field except `Referer`, and with it two of
the three answer 200. Only one was genuinely hard. Isolate the discriminant **by
difference** — add one header at a time to the failing form — rather than concluding
from a set that either works or does not. When a host refuses, send
the full browser header set: `User-Agent`, `Accept`, `Accept-Language`,
`Accept-Encoding: gzip, deflate, br` with `--compressed`, `Referer`,
`Sec-Fetch-Dest`/`-Mode`/`-Site`, `Upgrade-Insecure-Requests`; stylesheets
often need the `Referer` even when the page did not. If a brand needed this,
record how it was reached in a `## Upstream access` section of `MAPPING.md`, for
whoever measures that brand next. Extract the custom
property declarations (`--*`) and read their values. Record, per value: the
hex, the declaring variable name, and the file/URL it came from.

**Step 0.2 — Read the brand's `rem` root BEFORE transcribing any length.**
Grep the stylesheet for `html{` and for `font-size` on `html` or `:root`. A
site serving `html{font-size:62.5%}` has a 10px root, so its `.8rem` is **8px**,
not 12.8px — and this theme's own output is read at a 16px root, so a verbatim
`0.8rem` ships 1.6× too round. The 62.5% trick is common; assuming 16px is the
error. Record the root in `MAPPING.md` and convert **every** length you
transcribe: radii, paddings, heights, outline widths, font sizes. This has
already been caught once, in a package that converted its borders and its font
sizes correctly and let only `radius` through — so convert the whole block, not
the value you happen to be looking at.

**Step 0.3 — Note how many hosts the brand serves, and whether they agree.**
When a brand serves a corporate site and an application (or `.com` and a
country domain), fetch both and compare the same selectors. They may not
declare the same value: one brand was found serving `#008d7f` for
`.bg-primary` on its application and `#00685e` on its corporate site. That
disagreement is a measured fact. Record it, name the file each cited value
comes from — per-file counts, not a union total — and declare which host wins
and why.

**Step 1 — Raw measured palette first.** Declare
`const <id>Color = { … }` at the top of `src/index.ts`, grouped by family
(brand, accent, grey scale, system). Each entry carries a `//` comment citing
its real source variable or source document (section 6).

**Step 2 — `foundation`.** Map the raw palette onto `foundation.color`
(`blue{10,60,80}`, `cyan{10,50,70}`, `slate{0,10,20,60,80,90}`,
`feedback{success,warning,error,info}`), then write the scalars — **always
all present, never omitted**: `font{sans,display,mono}`,
`spacing{0,1,2,3,4,6,8,12,16}`, `radius{none,sm,md,lg,pill}`,
`shadow{subtle,medium,floating}`, `motion{fast,normal,slow,easing}`,
`z{header,toast,overlay,modal,chat}` (full inventory read in
`packages/tokens/src/foundation.ts` — re-read that file, never copy these
keys from memory). Then the anatomy primitives (`borderWidth`,
`borderStyle`, `density`, `typography{control,field,label,link}`,
`disabledOpacity`, `transition`, `cursor`, `iconSize`, `focus`, `field`):
override only what differs from the Sent Tech base; the rest falls back.
Then the **12 component overrides — always all present**, as in both
reference packages (`packages/theme-schneider-electric/src/index.ts`,
`packages/theme-renault/src/index.ts`): `card`, `buttonSecondary`, `tabs`,
`pagination`, `breadcrumb`, `alert`, `accordion`, `tag`, `badge`, `choice`,
`search`, `toggle`. A value identical to the base is rewritten, not omitted
(a missing key passes the whole gate — section 12).

**Step 3 — `semantic`.** Map every mandatory role: `surface{default,subtle,
raised,inverse,overlay}`, `text{primary,secondary,muted,inverse,link}`,
`border{subtle,strong,interactive}`,
`action{primary,primaryHover,primaryText,secondary,secondaryHover,
secondaryText,danger}`, `feedback{success,warning,error,info}`,
`status{pending,processing,completed,failed}`, `data{category1..8}`.

**Step 4 — `component = createComponent(semantic, foundation)`.** Always.
Never hand-written (section 10).

**Step 0.5 — Separate brand-owned rules from third-party blocks, BEFORE
counting anything.** A brand stylesheet is mostly not the brand: it carries
consent banners (`#__tealium*`, OneTrust, Didomi), carousels (`.swiper-*`,
`.slick-*`), CMS defaults, and library resets. Classify every declaration
first, by the namespace its selector belongs to: does the selector name the
site's own components, or a vendor widget? Then discard the vendor blocks as
ORIGINS. They may still be reported as context.

**A vendor block can live INSIDE a brand file.** Do not assume the split is
per-file. One brand ships `clientlib-site.min.css`, its own stylesheet, whose
first 403 lines are an embedded Bootstrap 4/5 compatibility shim — that is where
its `#428bca`, `#e9ecef`, `#ced4da` and its `a{text-decoration:none}` live.
Find the boundary between the vendor region and the brand region, name it in
`MAPPING.md` (that brand's boundary is the rule `html *{scrollbar-width:none}`),
and compute every count on the brand region alone.

**A de-bannerized vendor block is invisible to keyword search.** Minification strips
comments, so the licence banner naming the library is gone while its rules remain.
On one brand, 82 rules of a `normalize.css` reset sit at expanded lines 5545-5626
and `grep normalize` over the sheet legitimately returns **0** — the classification
that reported no reset was measured, and wrong. The same sheet carries an unnamed
payment-vendor region of roughly 155 rules. So do not classify by vendor name alone:
**search by structure.** A vendor reset is a contiguous run of namespace-free base
rules on bare element selectors (`html`, `body`, `h1`, `abbr[title]`, `pre`,
`code`, `sub`, `sup`, `[type=checkbox]`) carrying no class from the brand's own
namespace, usually near the top of the sheet. Report such a region by its line span
and by what its selectors are, not by the name you could not find.

A hex that appears **only** in vendor blocks is not a brand colour, however
frequent it is, and giving it a brand role is a provenance defect — the most
serious one possible here, because it dresses a consent-banner grey as a
brand hairline. Counting before classifying inverts the whole procedure:
frequency then measures how much boilerplate a bundle carries.

Consequence to accept rather than work around: **some brands declare no
colour at all in their own rules.** Their visible black is the user-agent
default, not a published value. That is a legitimate measured finding, and
the answer is to record it and mark the palette **derived**, never to promote
a vendor hex to brand status to make the theme look measured. A theme whose
raw palette is largely `à confirmer` with the absence documented is
conforming; one that cites `#__tealiumGDPRecModal` as a brand source is not.

**Tie-break when several hex candidates exist for one role**, applied only to
what survived Step 0.5: (1) occurrence
frequency wins — one occurrence is one declaration of that hex (a `--*`
custom-property declaration, or a property value containing the hex, case
normalised), counted over the union of the brand's official stylesheets
linked from its homepage; record per-file counts in `MAPPING.md`. When the
site serves several stylesheets, all of them count, and every cited value
names the file it came from. (2) Then the role declared by the variable
name (a `--brand-action-*` beats an anonymous grey). (3) If still tied, a
hex declared as a custom property (`--*`) beats one used only inline in a
rule; if still tied, the higher-ranked source in section 3 wins. Note the
choice in `MAPPING.md`. A value with no source in
section 3(a)–(d) is **derived**: mark it `à confirmer` inline AND list it in
the `MAPPING.md` section of the same name.

**State the counting convention, and state the region.** Two counts of the same hex
differ legitimately, so a number without its convention is not a measurement.
(1) **Region** — Step 0.5 prescribes the brand region, and a whole-file count is a
different figure: on one brand the published totals were 354 / 102 / 19 against
325 / 88 / 3 on the brand region alone. No decision flipped there, but the number
published was not the number prescribed. Say which region you counted.
(2) **Form** — decide and declare whether you count the short form (`#666` and
`#666666` are one colour and two strings; one brand writes `#666` 49 times and
`#666666` never), the 8-digit alpha form (`#254f9a14`, `#254f9a1f`, `#254f9a29` are
one brand's primary painted as a shadow tint, and an exact-6-digit count reports
that colour as unpainted), and the `rgb()` / `rgba()` equivalents. Restricting the
count to exact 6-digit matches is a valid convention; leaving it unstated is not.
(3) **Expansion** — if you transcribe `#666` as `#666666`, say so: a reviewer
grepping your value finds zero occurrences and reads a fabrication.

## 3. Allowed sources, ranked

(a) A public tokenised design system published by the brand, when one
exists. Real example: Schneider Electric publishes "Quartz"
(`quartz.se.com`, GitHub org `quartzds`; brand typeface token
`--qds-font-family-brand` = Nunito).

(b) The custom CSS properties of the brand's official site stylesheet.

**A declared token is not automatically a used one — measure consumption, not
declaration.** One brand declares its two best-known colours as
`--ds-color-brand-primary` and `--ds-color-brand-secondary`, and references
**neither anywhere**: zero `var()` across 2551 declarations. Promoting either to
`action.primary` would have shipped a colour that interface never paints. The
operative blue was a different token, with 162 occurrences and 11 `var()`.

This inverts the usual intuition, which is what makes it dangerous: a token named
`brand-primary` looks like the most authoritative source obtainable — more
authoritative than a hex found in a rule. It is the opposite when nothing consumes
it. So for every hex promoted from a named token, **count its `var()` references
and record the count**. A token with zero consumption cannot carry a Sentropic role
unless the gap is documented; keep it in the raw palette for provenance, with no
role, and say why.

**But `var()` alone is the wrong test, and reading it as the test rejects correct
palettes.** On the next brand measured after this rule was written, 21 of the 23
brand tokens cited as sources had **zero** `var()` references — and the palette was
right, because that brand paints literal hexes in its own rules: its primary blue
has zero `var()` as `--primary-color` and **325** occurrences in the brand region.
The question is not "is this token read through a variable" but **"is this colour
painted at all"**. A colour is operative when it is consumed by `var()` **or** when
it appears literally in brand rules. The defect is **zero of both** — which is
exactly what the two failing tokens on that brand were: one occurrence each in
821 KB, their own declaration, nothing else.

So record **two numbers** for every promoted hex: its `var()` references, and its
literal occurrences in the brand region. Neither number alone decides; their sum
being zero does. The failure this catches is the worst available, because it lands
by preference on the most authoritative-looking token: on that brand it had taken
`semantic.text.primary`, the most visible role a theme has, and the regression test
had locked the error in.

Corollary worth measuring when the two numbers disagree: a brand may paint a token
family it never declares in any linked stylesheet, readable only through the
fallbacks of its own `var()` calls (`var(--blue-500-brand,#003883)`, 60
occurrences). That family is evidence — on that brand it corroborated the whole
delivered palette except the two unpainted values. Record it as such.

(c) A brand charter published as a PDF by the brand.

(d) The font name as declared by the official stylesheet (names only —
section 10).

**Not sources:** a brand-colour aggregator (usable only as a cross-check,
never as the origin of a value — cf. Renault, whose yellow is taken from
`brand.renault.com` and only mirrored by aggregators), a screenshot, an
"inspired-by" palette, the model's memory.

**And not a source, however it is counted: a declaration from a third-party
block inside the brand's own stylesheet** — consent banner, carousel, CMS
default, library reset (Step 0.5). Excluding one vendor hex while keeping
another from the same block is the internal contradiction to watch for: if a
consent-banner green is excluded, the consent-banner grey from the same block
is excluded too.

Any value not from (a)–(d) is derived and must be flagged (section 6).

## 4. Package template

Five files — a **prescription of this programme**, not a description of the
repository (15 of the 126 existing theme packages carry no `MAPPING.md`;
the builder still delivers one). Copy the reference package and adapt only
what is listed as changing.

| File | Changes | Does NOT change |
|---|---|---|
| `package.json` | `name` → `@sentropic/design-system-theme-<id>`; `description`; `repository.directory` → `packages/theme-<id>` | `version: "0.1.0"`; exact pins `dependencies`: `@sentropic/design-system-themes: "0.11.0"` and `@sentropic/design-system-tokens: "0.11.0"` (read in existing packages on 2026-09-24 — do not reuse a version from memory); `devDependencies`: `typescript: "^5.9.3"`; scripts `build: "tsc -p tsconfig.json"`, `check: "tsc -p tsconfig.json --noEmit"`, `test: "vitest run src"`; `main`, `types`, `exports`, `files: ["dist"]`, `type: "module"`, `repository.type/url` |
| `tsconfig.json` | Nothing — byte-identical copy (`extends: "../../tsconfig.base.json"`, `rootDir: "src"`, `outDir: "dist"`, `include: ["src/**/*.ts"]`) | — |
| `src/index.ts` | The theme (sections 2, 6, 8) | Import shape (`createComponent` + `TenantTheme` type from `@sentropic/design-system-themes`); raw palette → `foundation` → `semantic` → `export const <camelId>Theme: TenantTheme = { id, label, mode: "light", tokens: { foundation, semantic, component: createComponent(semantic, foundation) } }` + `export default` |
| `src/index.test.ts` | The imported theme symbol, the `describe` name, `id`, `label`, the `--st-field-style` value, and every measured hex and font name (section 7) | The three tests and what they assert |
| `MAPPING.md` | All content (section 5) | The section order and the mandatory derived-values section |

Catalogue invariants — asserted OUTSIDE the package gate, by shared
`apps/docs` tests, so a deviation is invisible to the builder and breaks
the docs build: `id` is exactly the `<id>` of `packages/theme-<id>/`; the
exported constant's name ends in `Theme`; the entry file is `src/index.ts`.
This is imposed by `apps/docs/src/lib/theme-catalog.ts` (the
`import.meta.glob` over `packages/theme-*/src/index.ts`, the
`name.endsWith("Theme")` filter, and the
`theme.id === path.split("/theme-")[1].split("/")[0]` filter) and asserted
by `apps/docs/src/lib/theme-catalog.test.ts` (catalogue ids equal the
`packages/theme-*` directories).

`"private": true` is mandatory for every brand theme. Motive (from
`scripts/verify-publishable-licensing.mjs`): the licensing gate applies to
every workspace whose manifest is NOT `private: true`, and the repository
root deliberately carries no licence because the tree holds measured clones
of private brands that are not ours to relicense. Declaring a licence on a
brand clone would mislead licence detection and SBOM tooling. (The only
exception in this programme is `theme-latex` — section 14.)

Do NOT create `dist/`, `README.md`, `LICENSE`, `LICENSE.THIRD-PARTY.md`, or
`references` in the tsconfig. npm workspaces auto-discover `packages/*`;
`dist/` is built incrementally by `scripts/ensure-theme-dists.mjs`
(content-hash based, auto-discovering — no script edit needed when a theme
is added).

## 5. `MAPPING.md` template

Literal shape, deduced from the Schneider, Hermès and Renault mappings
(the newest practice — not a theoretical shape). Keep the sections in this
order:

```markdown
# <Brand> → Sentropic mapping

This package maps the **public** <brand design / design system> onto the
Sentropic token structure (`TenantTheme`). Method = **measured-clone**:
<brand fact: which value is measured, where from>. Only public values and
font *names* are referenced — no font binaries. Derived/unmeasured values
are flagged `à confirmer`.

> Key measured fact (optional box, used when the headline fact is
> surprising — e.g. Hermès chrome has zero orange in its CSS; Renault
> Yellow fails AA as text but passes as a fill): state it here so no
> reader misreads the table.

## Sources
- <what it provides> — <URL> (<which value comes from it>)

## Colour mapping

| Sentropic role | <Brand> source | Value |
|---|---|---|
| `action.primary` / … | <real token name, CSS declaration, or "derived …"> | `#hex` (or `#hex` *(à confirmer)*) |

## À confirmer (derived or no published brand token)
- **<what>** (`#hex`, …) — <why derived, what it is a coherent stand-in for>.

## Typography
- **<usage>** (`font.sans`, …): **'<Name>'** — <where the name is declared>. We reference the font *name* only.
- **Monospace** (`font.mono`): system stack.
- Links: <colour>, <underline behaviour at rest / on hover>.

## Signatures anatomiques
- **Fields**: `field.style = "…"`.
- **Radius**: … **Focus**: … **Buttons**: … **Tabs**: …
  **Pagination**: … (chevron redraw colour, density — section 8).

## Asset officiel
- <Brand> logo = <what it is>. Use the official SVG/PNG from the brand
  assets — **do not redraw the logo by hand**. This package references
  only font *names* and public colour values, never logo artwork or font
  binaries.
```

Rules for the table: the "source" column names a real token, a real CSS
declaration (`body{background-color:…}`), or says "derived …" — never a
vague description. There is exactly ONE table shape (role / source / value,
derived hexes followed by `*(à confirmer)*`) and ONE derived-values heading
(`## À confirmer …`): the Hermès `Status`-column variant and the `###`
heading seen in one reference mapping are prior variances, not accepted
alternatives — two packages are equivalent only in the single form. The
derived-values section is **mandatory even when empty** — in that case it
says so explicitly
(`None — every value above is measured from the listed sources.`). The
`## Signatures anatomiques` section is a NEW prescription of this
programme (only 87 of the 111 existing `MAPPING.md` carry it): every
delivered mapping includes it.

## 6. Provenance rule

Every `//` comment in `index.ts` cites a real source variable or a real
source document; every derived value carries the `à confirmer` marker and
appears in the corresponding `MAPPING.md` section. A comment that describes
a value without naming its source is a defect to fix, not an acceptable
approximation. Cross-checks against aggregators are named as cross-checks,
never as origins.

## 7. Test gate

Three tests in `src/index.test.ts`. What each asserts (reference:
`theme-schneider-electric`) —

1. **Identity + contract.** `toMatchObject({ id, label, mode })`, then on
   `compileTheme(theme)`: contains `[data-st-theme="<id>"]`,
   `--st-component-control-hoverBackground:`,
   `--st-component-control-hoverBorder:`,
   `--st-component-selection-switchTrackChecked`, and
   `--st-field-style: <style>;` (the measured style, `outline` or
   `filled-underline`).
2. **Anatomy.** `component.control` matches `{ background, hoverBackground }`
   (measured hexes); `component.control.anatomy?.field` matches `{ style,
   fillBg }`; `component.tabs` matches `{ activeText }`.
3. **Compiled brand variables.** `--st-semantic-action-primary: <hex>;`,
   `--st-semantic-text-primary: <hex>;`,
   `--st-semantic-action-danger: <hex>;`,
   `--st-semantic-surface-inverse: <hex>;` (all four WITH their hex, as in
   all three reference tests), plus every font family name present in the
   output.

The hardcoded hexes and font names in the test are the **regression lock**:
they pin the measured values, so any later edit that shifts a colour or a
typeface fails loudly. Put the measured values in — the test only locks
what the builder writes.

Commands, per package:

```
npm --workspace packages/theme-<id> run test    # vitest run src — 3 tests
npm --workspace packages/theme-<id> run check   # tsc --noEmit
npm --workspace packages/theme-<id> run build   # tsc -> dist (the docs need it)
```

Green = all three pass. The builder runs the three commands itself
(`vitest` and `tsc` are present, hoisted at the repository root). What the
builder never does is install dependencies: the full installation is the
conductor's act, done once per lot (section 1).

**A gate failure in a fresh worktree is environmental until proven otherwise, and
the proof is to replay in full order — not to read the diff.** The order matters:
`npm ci`, then `build`, then `check`, `test`, `licensing:check`, `pack:smoke`. Run
out of order and `pack:smoke` fails on an unbuilt package, `packages/themes` fails
to resolve the tokens package, and the licensing gate fails on a missing
`node_modules` — three failures that look like regressions and are not. This was
misread twice by the conductor and once elsewhere in the same day, each time by
suspecting the code first. Check the environment first; it costs one command.

**And a slow delegated agent is not judged alone — it is judged against a comparable
agent that has finished.** The tempting signals are useless on their own. CPU time is
near zero for an agent waiting on a network, so low CPU proves nothing; an agent that
buffers its report writes zero bytes until it finishes, so an empty output file proves
nothing; and an empty tmux pane proves only that stdout was redirected. What decides
is a **control**: launch a lot's agents with the same invocation, and when one returns
normally, compare the others against it. On one lot the three fix agents had written
the same two stderr lines byte for byte, and one of the three had already delivered —
at which point the remaining two could not be distinguished from it by any available
signal, and killing them would have destroyed work. The earlier form of this rule was
"check the working directory before killing", which prevents a killing; the control
form decides. When no comparable agent has finished yet, there is no control and the
answer is to wait or to relaunch a copy alongside, never to conclude from the absence
of a signal.

**What a repository guard is for — measured, not assumed.** The first lot reviewed
with all three guards present cost **more** per review than the lot before it
(210 501 against 178 142 tokens, +18.2 %), and **none of its fifteen blocking defects
fell in a class any guard covered**. Part of that gap is the brands being harder; the
zero-of-fifteen is not. So do not write a guard expecting to shorten a review — that
expectation has been measured and refuted. Write one for the two jobs it demonstrably
does:

1. **Freeze what is already correct.** A guard earns its place by making a
   regression impossible on packages that pass today, not by finding what a careful
   reader would have found anyway.
2. **Catch the shared acts nobody reviews.** The lockfile entry, the docs manifest
   dependency, the registration literals: a cross-review reads one package's diff and
   is structurally blind to them. `verify-theme-registration` caught four missing
   lockfile entries on the conductor's own work, before commit, outside any review
   budget. That is the shape of a guard that pays.

A guard that would only restate what the review protocol already asks a reviewer to
judge is not worth its false positives — and **a false positive is worse than a
missed defect**, because it spends a reviewer's budget and teaches everyone to
discount the guard.

## 8. Fidelity levers

1. **`field.style`: `outline` vs `filled-underline`.** Decide from the
   brand's input declarations, never by taste:
   - filled (grey, non-surface-default) `background` → `filled-underline`
     (the fill decides first): `fillBg` is the fill, `underlineColor` /
     `underlineWidth` carry the bottom stroke, `underlineMode` carries its
     technique (`"border"` for a `border-bottom` declaration, `"shadow"`
     for an inset `box-shadow` — DSFR draws its bottom rule as a
     box-shadow inset with `border-bottom: none`).
   - surface/white fill + four equal side borders → `outline`.
   - surface/white fill + bottom-only stroke → `filled-underline` with
     `fillBg` = `surface.default`.
   - mixed case (four side borders PLUS a thicker `border-bottom`) with a
     non-filled background → `outline`; record the bottom emphasis in
     `MAPPING.md` (no primitive carries it).
   Redraw the native `<select>` chevron as a data-URI SVG carrying the brand hex,
   with `selectAppearance: "none"` and a matching `selectPaddingRight`
   gutter (reference: Schneider draws it in Life Green `#3DCD58` with a
   `2.5rem` gutter; Renault in anthracite, monochrome by brand).
2. **`focus.strategy`: `outline | ring | inset | double`** + `width` /
   `offset` / `color`. Encode the real *technique*: an `outline`
   declaration → `outline`; a `box-shadow` ring → `ring`; an inset shadow
   → `inset`; an outline-plus-shadow combo → `double`. Never just the
   colour. (Measured examples: Hermès `outline: 2px solid #000` +
   `outline-offset: 3px`; Canada 3px outline in focus blue.)
   **Find the LAST rule, not the first.** One brand declares `outline:0` on its
   inputs and selects, and the sheet reads like a brand that removed focus
   altogether. Four later rules publish `outline:auto` / `outline:solid` — one of
   them `form textarea:focus{outline:auto}`, *less* scoped than the rule it follows
   and at equal specificity, so it wins. That theme shipped the right strategy with
   a false justification ("the brand draws no focus outline or ring"), and the
   justification is the provenance defect. Same mechanism, same brand, for
   typography: a family rule declares `line-height:1.25` on every button class and
   two later rules at equal specificity redeclare `.9` on the same selectors as
   exact members, so the effective value is `0.9`.
   After finding the rule that declares a value, **search the rest of the sheet for
   later rules carrying the same selector as an exact member**, and take the last
   one at equal-or-higher specificity. A first match is a candidate, not a
   measurement. This is reading the cascade, not measuring a rendering (section 10
   forbids the latter) — say which you did when you report it.
3. **`density` without a browser.** Never measure pixels from a rendering:
   read the `height` and `padding` declarations in the brand CSS when they
   exist and transcribe them into `controlHeight` / `paddingBlock` /
   `paddingInline`. When the brand publishes no usable geometry (both
   reference packages are in this case — their `controlHeight`
   `2rem/2.5rem/3rem` and `iconSize` `1rem/1.125rem/1.25rem` are the Sent
   Tech base values), reuse the base values explicitly and mark the block
   `à confirmer`. State in `MAPPING.md` which of the two paths was taken.

   **You may not take the "nothing published" path without showing what you
   looked for.** Both lot 2 packages that claimed the brand publishes no usable
   control geometry were wrong: one declares `min-height:4.8rem` and a `sm`
   variant, the other `height:52px` plus `form-control-sm`/`-lg` paddings. Grep
   the brand's own control selectors (its button, its input, its select) for
   `height`, `min-height` and `padding`, and **quote the result in
   `MAPPING.md`** — the declarations you found, or the greps that came back
   empty. "Not published" is a claim, and it needs evidence like any other.

   **Scope is part of the measurement.** A rule scoped to one component is not
   the site-wide value. One package took its `focus.color` from a rule scoped to
   the breadcrumb (two occurrences of a grey) while the brand's own blue covers
   every form control (twenty-three occurrences); another read
   `field.style` off a search widget while the brand's general form control is a
   boxed field with four equal borders. Prefer the **least-scoped** brand rule,
   count occurrences across selectors rather than within one block, and record
   the scope of what you chose next to the value.

   **Third path, the one that actually happens: copying the reference
   package.** Only `controlHeight` and `iconSize` match the base. The rest of
   `density` (`paddingInline`, `paddingBlock`, `gap`, the extra `fontSize`
   key), and `shadow.medium`/`shadow.floating`, `motion.easing`,
   `disabledOpacity` and `transition`, differ from the base in both reference
   packages — those are another brand's measured geometry. Copying them is
   allowed, and it is NOT "reusing the Sentropic base": say
   "aligned with the reference theme package's geometry" and mark it
   `à confirmer`. Claiming the base while shipping the reference package's
   values is a false provenance statement, and it has already been caught
   twice. Check the claim against `packages/tokens/src/foundation.ts` before
   writing it.

   **The same label is required for `typography` and for the 12 component
   overrides.** Packages have applied it correctly to `density`, the shadows,
   the easing, `disabledOpacity` and `transition`, then stopped — shipping
   `typography.control`, `alert`, `search`, `tabs` and `pagination` geometry
   straight from the reference package with no label, no marker and no mapping
   row. One of them shipped `typography.control.lineHeight: 1.5` while the
   brand's own button declares `line-height:1.25`, and a label size of `1rem`
   against a measured `1.4rem` at a 62.5% root. Either transcribe what the brand
   publishes, or carry the label and the marker — and check first whether the
   brand has already answered the question.

## 9. Accessibility floor

Deterministic rule. Thresholds (WCAG 2.x): **4.5:1** for running text
(including `text.link`); **3:1** for large text (at least 24px, or at
least 19px bold) and for non-text elements including the focus indicator
(WCAG 1.4.11) — so `border.interactive` and `focus.color` are held to
**3:1**, not 4.5:1: they are lines, not text.

Computation: relative luminance per channel
`s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4`, then
`L = 0.2126·R + 0.7152·G + 0.0722·B`, then
`ratio = (Llighter + 0.05) / (Ldarker + 0.05)`. Reference implementation:
`luminance` and `contrastRatio` in
`packages/skills/src/rules/contrastTokenPairRule.ts` (not exported by that
package — hence the one-line command below, which is allowed: a one-line
Node computation is not the measurement tool forbidden in section 10):

```
node -e 'const L=h=>{const c=h.replace("#","");const f=c.length===3?c.split("").map(x=>x+x).join(""):c;const n=parseInt(f,16);const ch=v=>{const s=((n>>v)&255)/255;return s<=0.03928?s/12.92:((s+0.055)/1.055)**2.4};return 0.2126*ch(16)+0.7152*ch(8)+0.0722*ch(0)};const r=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};console.log(r(process.argv[1],process.argv[2]).toFixed(2))' '#1e7e34' '#ffffff'
```

prints `5.14` — the ratio of the deep green `#1e7e34` on white, which
passes 4.5:1.

Stop rule for a DERIVED value that fails its threshold: convert to HSL,
keep H and S, subtract 0.05 from L per step, convert back to hex (nearest,
lowercase), recompute the ratio against `surface.default` after each step,
and keep the FIRST hex that reaches the threshold. Two builders following
this rule obtain the same hex.

**Record the chain, or the rule is unverifiable.** In `MAPPING.md`, every
value produced this way carries: the starting measured hex and its ratio, the
number of steps taken, and the resulting hex with its ratio. Without the
starting hex a reviewer cannot replay the chain, and "first passing value"
becomes an unfalsifiable claim. Two failures already caught: a package that
took the fourth step when the third already passed, and announced a ratio
matching no step at all; and a package whose greys pass their thresholds but
whose chain cannot be replayed because no starting value was recorded. Stop at
the FIRST pass — an extra step is a defect, not extra safety.

**`semantic.surface.overlay` is the key most often shipped without
provenance** — all three reviewed packages missed it. It is a colour like any
other: either the brand publishes a modal backdrop (look for
`.modal-overlay`, `.backdrop`, `.c-modal` and their `background-color`) and
you transcribe it, or it is derived, flagged `à confirmer` inline, and given
its own `MAPPING.md` row. A comment such as "brand near-black tint" names no
source and is a defect under section 6.

Brand colours in brand roles (fill, accent) are never altered: the brand
hex stays, with readable text on top (dark `#0a160d` on Schneider Life
Green, 8.89:1; black on Renault Yellow, 15.23:1). Only a text or line role
that fails its threshold is routed to a readable neutral: Renault routes
`text.link`, `border.interactive` and `focus.color` to anthracite
`#191c1f` (17.11:1 on white). Schneider routes `action.primary`,
`border.interactive` AND `focus.color` all three to `#3DCD58`
(`packages/theme-schneider-electric/MAPPING.md`, `src/index.ts`): that
triple routing fails even the 3:1 line threshold (`#3DCD58` on white is
2.09:1) and predates this rule — it is a non-reconductible precedent,
named as such.

## 10. Forbidden (closed list)

No Python, and no script or image either; one-line Node commands
(section 9) and already-present native binaries (`curl`, `grep`, `sed`)
are allowed. No font binary, only names. No
hardcoded colour outside the tokens. No inline `style=` attribute. No new
flag on the `TenantTheme` type (the `thirdParty` flag broke pinned
consumers' typecheck in the past — rejected precedent). No hand-written
`component`. No shared file touched. No invented value: unmeasured means
`à confirmer`, never silent.

## 11. Per-theme deliverable

The five files, all gate-green, plus a short summary: id, label, primary
hex, font, `field.style` value, `focus.strategy` value, source URLs, and
the derived-values list. No report file, no notes, no draft left in the
repo — the summary is the handoff message.

## 12. Review protocol

Cross-review is an adversarial pass by an agent other than the builder,
cold: it re-reads the diff without justifying it.

**Do not redo what the repository guards already do — and do not trust their
silence.** `verify-theme-shape`,
`verify-theme-registration` and `verify-theme-invariants` run under `npm test` and
mechanically cover the id against the folder name, missing token leaves against the
base, hexes with no mapping row, unpinned font families, reference geometry claimed
as the base, the contrast floors, and the private/unlicensed/pinned shape. Run
`node --test scripts/verify-theme-*.test.mjs` once, report the result, and spend the
rest of the budget on what no script can judge: whether a hex comes from a brand
rule or a vendor block, whether a rule is scoped to one component, whether "the
brand publishes no X" is true, whether a cited selector declares the property it is
cited for, and whether a promoted token is actually consumed. Those five produced
almost every blocking finding.

**The guards are a floor, not a ceiling, and the floor is lower than the summary
above suggests.** Measured on the first lot that ran with all three present: the
geometry guard watches only `easing` and `disabledOpacity`, and accepts the borrow
label anywhere in the file rather than on the borrowed value; the mapping-row guard
reads only 6-digit hexes and `rgb()` / `rgba()`, so a borrowed unitless number or a
bare length escapes it. Neither could see a `card.borderWidth` and a
`card.lineHeight` copied character for character from the reference package with no
marker and no mapping row, nor a `transition.property` set belonging to neither the
base nor the reference and carrying no comment. Of the fifteen blocking defects the
four reviews of that lot returned, **zero fell in a class any guard covers** — and
two reviewers had to spend budget instructing the guards themselves. A green guard
run licenses nothing: report it in one line and keep reading.

**And a red guard run is not yours to instruct either.** A reviewer who believes a
guard is wrong says so in **one line** — which guard, which theme, what it printed —
and moves on. It does not build the counter-measure, it does not prove the guard at
fault, it does not map the guard's blind spots. Two of the four reviews that produced
the measurement above spent budget doing exactly that, one to prove a guard wrong and
one to establish that a failure could not touch its own package, and neither line of
work was a finding about the theme under review. Guard disputes are the conductor's
to settle, on the conductor's budget. Your budget buys the five judgements above and
nothing else.

Verifiable checklist — fail the theme on any miss:

- Every hex in `index.test.ts` is found in `index.ts`, and every font family
  present in the compiled output is pinned by the test — not just the display
  face. Compile the theme and list the families rather than trusting the test.
- Every hex in `index.ts` has a row in `MAPPING.md`, including the `rgb()`
  values (`surface.overlay` is the one that escapes).
- **Every "the brand publishes no X" claim is checked against the LAST matching
  rule, not the first** (section 8, lever 2). Three of the four themes in one lot
  carried such a claim; two were false, and both times the contradicting rule was
  later in the same sheet. Grep the property, not the phrase.
- **For every hex presented as measured, the cited occurrence is a
  brand-owned rule.** Fetch the stylesheet and look at the block the selector
  belongs to: a consent banner, a carousel, a CMS default or a library reset
  is not the brand (section 2, Step 0.5). A hex living only in vendor blocks
  and given a brand role is a blocking provenance defect.

**Verifying a guard before shipping it.** A guard is delivered only after its own
defect has been reintroduced and seen to turn it red, then restored byte-identically.
That is necessary and not sufficient: mutation proves a guard reacts to the fault its
author imagined. Three properties are required, and the third matters most, because
its absence is what cost two review budgets:

1. It fails when its defect is reintroduced.
2. It is not vacuous — it must be shown to evaluate something, since a guard can be
   green because no package exercises the branch it asserts on. One shipped contrast
   guard was green for exactly that reason.
3. **It runs against a lot it did not help write.** A guard's first encounter with
   correct-but-unknown code is part of its verification, not a later event. A guard
   green on main proves nothing about a package main does not contain: one guard was
   green on main and flagged four correct themes on the branch that motivated it.

A harness that reports `SKIP` on any of the three has abstained, and abstention is a
failure, not a neutral result.
- **The cited selector really declares the cited property.** Grep the
  stylesheet for the selector and confirm it carries that variable or that
  value. Naming a neighbouring selector, or the block that consumes a variable
  instead of the one that declares it, defeats the whole point of the
  provenance rule.
- **Every derived value carries BOTH the inline `à confirmer` marker and its
  `MAPPING.md` row.** Listing it in the section while the code stays silent is
  half the rule; count the inline markers against the reference packages if the
  total looks low.
- **Replay every stop-rule chain** from the recorded starting hex, and confirm
  the value is the first passing step, not a later one, and that the announced
  ratio matches.
- `foundation` and `semantic` are compared key by key against
  `packages/tokens/src/foundation.ts` and
  `packages/tokens/src/semantic.ts`: every scalar sub-key and every one of
  the 12 component overrides is present. Neither `tsc --noEmit` nor the
  three tests detect a missing key — `TenantTheme.tokens` is typed
  `TokenTree`, a plain index signature (`packages/themes/src/schema.ts`,
  `packages/tokens/src/foundation.ts`) — so a forgotten key passes the
  whole gate. This comparison is the only net for it.
- Every source URL responds and contains the cited value. On HTTP 403 (or
  any block already anticipated in section 2), retry with a browser
  user-agent and a referer; if the page still blocks or its content has
  changed since the measurement, keep the original measurement (hex, URL,
  date), mark the URL `unverified, <date>, HTTP <code>`, and fall back to
  a dated archived copy of the brand's own page, named with its capture
  date. If no archived copy shows the value, the value is derived
  (`à confirmer`).
- `component` is the `createComponent` call, not hand-written.
- The package is `private` (brand themes; LaTeX excepted — section 14).
- The gate is green (test + check + build).
- No shared file was touched (`git status` shows only
  `packages/theme-<id>/`).

## 13. Target list

CAC 40 composition valid since Monday 2026-09-21 (annual review announced
2026-09-10, implemented after the close of Friday 2026-09-18: no
composition change; three consecutive reviews without change — March,
June and September 2026). ISIN and tickers taken 2026-09-24 from Euronext Paris
data. Ranks and market capitalisations: companiesmarketcap France page,
fetched 2026-09-24, in USD billions. Capitalisations are a selection
criterion, not theme data.
No identifier below collides with the 126 existing `packages/theme-*`
(checked 2026-09-24).

The programme covers 50 companies: the 40 CAC 40 members plus the next 10
French market capitalisations outside the index. Of these 50, 28 are
already implemented as theme packages, leaving 22 to build: the 12 CAC
members below plus the 10 next-caps below that.

Unimplemented CAC 40 members (12):

| id | Company | Ticker / ISIN | Token source to prefer |
|---|---|---|---|
| `essilorluxottica` | EssilorLuxottica SA | EL / FR0000121667 | essilorluxottica.com |
| `arcelormittal` | ArcelorMittal S.A. | MT / LU1598757687 | corporate.arcelormittal.com |
| `stmicroelectronics` | STMicroelectronics N.V. | STMPA / NL0000226223 | st.com |
| `legrand` | Legrand SA | LR / FR0010307819 | legrandgroup.com |
| `michelin` | Cie Générale des Éts Michelin SCA | ML / FR001400AJ45 | michelin.com |
| `euronext` | Euronext N.V. | ENX / NL0006294274 | euronext.com |
| `stellantis` | Stellantis N.V. | STLAP / NL00150001Q9 | stellantis.com |
| `unibail-rodamco-westfield` | Unibail-Rodamco-Westfield SE | URW / FR0013326246 | urw.com |
| `eurofins` | Eurofins Scientific SE | ERF / FR0014000MR3 | eurofins.com |
| `bureau-veritas` | Bureau Veritas SA | BVI / FR0006174348 | bureauveritas.com |
| `carrefour` | Carrefour SA | CA / FR0000120172 | carrefour.com |
| `eiffage` | Eiffage SA | FGR / FR0000130452 | eiffage.com |

Next French capitalisations outside the CAC 40, completing the top 50 (10):

| id | Company | Rank | Market cap (USD bn) | Token source to prefer |
|---|---|---|---|---|
| `christian-dior` | Christian Dior SE | 11 | 87.92 | dior.com, dior-finance.com |
| `dassault-aviation` | Dassault Aviation SA | 27 | 25.58 | dassault-aviation.com |
| `amundi` | Amundi SA | 28 | 20.72 | amundi.com |
| `ipsen` | Ipsen SA | 33 | 14.00 | ipsen.com |
| `aeroports-de-paris` | Aéroports de Paris (Groupe ADP) | 36 | 12.16 | parisaeroport.fr, adp.fr |
| `rexel` | Rexel SA | 37 | 12.12 | rexel.com |
| `klepierre` | Klépierre SA | 38 | 11.82 | klepierre.com |
| `bollore` | Bolloré SE | 41 | 11.57 | bollore.com |
| `getlink` | Getlink SE | 42 | 11.45 | getlinkgroup.com |
| `biomerieux` | bioMérieux SA | 43 | 10.33 | biomerieux.com |

Ranks skip (11, 27, 28, 33, 36, 37, 38, 41, 42, 43) because this table
lists only companies OUTSIDE the CAC 40: every skipped rank is a CAC 40
member — either already delivered as a theme package, or listed in the CAC
table above (ranks 12, 20, 26, 32, 34, 35 and 40: EssilorLuxottica,
Legrand, Michelin, Unibail-Rodamco-Westfield, Bureau Veritas, Carrefour,
Eiffage).

Plus `latex` — specified separately, see section 14.

## 14. The LaTeX case — specify, do not build here

`theme-latex` is the only package in this programme that will be
**published on npm** — and it stays **private in the docs selector**
behind Ctrl+Shift+X, like any other theme. Publishing on npm and appearing
on the public site are two distinct things.

**Admitted primary sources:** the LaTeX project (`latex-project.org`),
CTAN (`ctan.org`), the `article` and `book` classes (their `classes.dtx`
source), the Computer Modern and Latin Modern families (GUST metrics, the
`lm` package on CTAN), the Tufte-LaTeX tradition (the `tufte-latex`
package on CTAN), and the Overleaf reference rendering.

**What is measured, and where:** lengths from `article.cls` and `book.cls`
(`\parindent`, `\textwidth`, `\baselineskip`, rule thicknesses); font
names (`Latin Modern Roman`, `Latin Modern Sans`, `Latin Modern Mono`);
`hyperref` link colours.

**Package difference** (compare `packages/theme-canada/`, already in this
configuration: `license: "MIT"`, `publishConfig.access: "public"`, no
`private` field, plus `LICENSE` and `LICENSE.THIRD-PARTY.md` at the
package root): `private` is removed, `publishConfig.access: "public"` is
added, a `license` field is declared (LaTeX Project material under the
LaTeX Project Public License, Latin Modern under the GUST Font License),
a `LICENSE` file is present and `LICENSE.THIRD-PARTY.md` is filled in
(regenerate with `npm run notices:generate`).

Taking it out of the whitelist would be a NAMED conductor act, requiring
the owner's agreement and edits to exactly three files:
`apps/docs/src/lib/theme-catalog.ts` (`PUBLIC_THEME_IDS`),
`apps/docs/src/app.html` (`PUBLIC_BOOT_THEMES`, whose equality with the
public list is asserted in `header-contract.test.ts`), and
`apps/docs/src/lib/theme-catalog.test.ts`. This is a gate, not a builder
option: the builder never touches it.

`npm run notices:generate` re-derives the notices from `package-lock.json`
and the INSTALLED upstreams, so regenerating `LICENSE.THIRD-PARTY.md`
requires the full dependency installation: it is a **conductor act** after
installation. The latex builder delivers `LICENSE` and the `package.json`
and reports the regeneration as not run. (This is consistent with section
7: the builder runs the three package commands — it never installs.)

This package must pass `scripts/verify-publishable-licensing.mjs`, which
asserts exactly the following for every non-`private` workspace (read
2026-09-24 — the LaTeX builder re-reads the script before delivering):

1. The `license` field is declared, non-empty after whitespace
   normalisation, not `UNLICENSED` (case-insensitive), and not of the
   deferred `SEE LICENSE IN <file>` form (matched as a prefix,
   case-insensitive, `licence`/`license` spellings, collapsed
   whitespace — any filename spelling counts as the same non-answer).
2. A `LICENSE` file exists at the package root and is at least **300
   bytes** (below that it is a placeholder, not a licence text; the
   shortest real OSI text in common use, ISC, is ~750 bytes).
3. `LICENSE.THIRD-PARTY.md` exists at the package root.
4. The notices are current: re-derived from `package-lock.json` and the
   installed upstreams, they must match what is committed byte for byte
   (adding, bumping or dropping a dependency without regenerating
   fails).
5. BOTH files are really inside the tarball npm would publish — measured
   with `npm pack --dry-run --json`, not assumed.
6. If no publishable workspace existed at all, the gate fails rather
   than passing vacuously.
