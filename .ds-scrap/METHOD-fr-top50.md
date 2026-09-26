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

**And a value equal to a vendor's default is checked against that vendor's stock before
it is attributed to the brand.** Step 0.5 asks *where do I count*; this asks *to whom do
I attribute*, and the two close the boundary between them. Measured on one brand: the
ledger credited it with re-tinting the Bootstrap radius scale, and the stock 5.3.8 package
fetched separately declares `--bs-border-radius:0.375rem`, `-sm:0.25rem`, `-lg:0.5rem`,
`-xl:1rem` against the brand's `0.375rem`, `3px`, `6px`, `8px`. The brand re-tints three
steps of four — and the step the package had transcribed was **the one it left alone**.
The delivered value was right; the attribution was not. When the value is unchanged the
ledger says **"vendor default retained"**, never "brand decision".

This is the geometry guard's rule with a different upstream: one cannot tell a copy from a
coincidence, so one declares which it is. And note what it does not say — the paint test
proves **consumption**, not **choice**. A vendor default painted by the brand is genuinely
painted; that still does not make it a decision of the brand.

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
(4) **Spelling** — a count that will appear in a table is verified with a
**second pattern spelled differently**, because two runs of the same pattern
share the hypothesis under test: *the spelling I expect is the spelling in use*.
This is the two-instrument rule applied to greps. Measured three times in one
day: `rel="stylesheet"` run against a document that writes `rel='stylesheet'`
reported 0 stylesheets where there were 4, and the shortfall invented a reserve
that a builder would have been told to investigate; `.match()` without `/g`
returned the first `muted:` in each file instead of the last, contaminating 134
measurements; an exact-case hex count missed a brand writing both `#000e56` and
`#000E56`. Either tolerate the syntax's own variability — quotes, case,
whitespace — as in `rel=["']?stylesheet`, or count by parsing rather than by
matching, which is safer still for HTML. The direction of the error is not
symmetric: a count too low invents a problem and spends a budget on it, a count
too high hides one.
(5) **The convention travels with the number, in the deliverable.** Stating it in
your report is not enough: the reviewer reads `index.ts` and `MAPPING.md`, not
your report, and a number standing alone there invites a correction that is worse
than the number. Measured, 24-25 September: a builder published `.3s x28`
declarations for a brand whose brand region holds 30 matches / 29 declarations /
28 rules, the 29th declaration sharing rule 1369 with another `transition`. The
package's own convention — one occurrence is one declaration — gives 29; counting
28 requires collapsing a cascade, which neither the code nor the ledger stated.
A review refuted the 29, the correction shipped 28, and the second pass restored
29: **a correct value was overwritten because its convention was not written next
to it.** So beside every published figure, one short clause saying what is counted
(declarations, rules, literal occurrences, `var()` references) and what is
excluded. The same day, on another brand, `red` was published as 6 where the
package's own stated convention gives 9 — the 6 counted only `outline`
declarations, a sub-convention nobody wrote down.

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

**Consequence of the per-theme worktree: the builder measures and writes, the conductor
runs the gates.** A freshly created worktree has no `node_modules`, so
`npm --workspace ... run test` is not executable inside it, and installing per worktree
would mean four `npm ci` per lot for work that fits in one package directory. The
builder therefore runs what the hoisted binaries allow and the conductor replays the
three package gates in the integration tree, which has its dependencies. Two clauses
make that a division of labour rather than a loss:

1. the builder **names what it could not execute** — the list, not the phrase "gates
   not run";
2. it never reports **green** on a gate it did not execute. A silence over an unrun gate
   is the same class of mutism as a domain left unstated, a version left unstated, and a
   tool validated on one case: the report looks complete.

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

**And the two conditions this rule holds under, stated because the rule above requires
it.** First, a control band is valid **only for the invocation that produced it, effort
tier included**: a band measured at one reasoning tier does not transfer to another, and
using it there would be a threshold measuring an execution convention rather than a
property. Second, **one delivery is a point, not a band** — with a single witness there is
still no threshold, because a minimum and a maximum need two. Between the first and the
second delivery nothing has changed about what can be decided; only the impression of
being able to decide has changed, and elapsed time keeps adding pressure while adding no
information. Both conditions were found while a lot was in flight, on a band measured at a
lower tier than the lot it would have judged.

**Rebase onto the tip at the moment you rebase, never onto a sha someone handed you.**
Main moves while a lot is in flight — in one session five documentation PRs landed
between a lot branch's first commit and its gates, each one moving the base, and two
of them were the conductor's own. A sha quoted in a message is already stale by the
time the worktree is free. Re-fetch and take `origin/main` at the moment of the
rebase, and say which sha you actually used.

**Replay the gates after a rebase, unless you can name, gate by gate, why the incoming
change is invisible to that gate — and replay the cheapest one anyway, as a control.**
The enumeration is made against the tip **of that moment** and quoted with its sha, because
an enumeration is itself perishable: one made twenty minutes earlier concluded that no gate
input had moved, and by the time it was written a merge had touched `package-lock.json`,
`smoke-pack.mjs`, `verify-layering.test.mjs` and a components package — six inputs, no
exemption possible. A derogation resting on a dated enumeration is more dangerous than a
pointless replay, because it looks like a reasoning. The control is the gate whose inputs
touch the changed directory, not the fastest gate in the abstract.

The sharper half of the same rule: **two pull requests merged back to back means the
first never ran against the second.** That is how a red gate appeared on a lot branch
whose own code was correct — one merged change interacted with another that had never
seen it, and the lot was blamed for it. So after any rebase, replay the full gate
sequence in order before concluding anything about your own diff; and if main moved
again while the gates were running, rebase and replay rather than report a result
measured against a base that no longer exists.

**One worktree per theme, not per lot.** The witness rule above prescribes racing a
slow agent against a fresh copy, and a lot-wide worktree makes that prescription
impossible: two agents on one tree collide on the same files, so the only moves left
are to wait or to kill. The same shape blocks the conductor. A rebase cannot happen
while any agent holds the tree, so the lot's base ages for as long as the slowest
builder runs — and against a main that moves several times a day, that is the real
bottleneck, not the agents. Give each theme its own worktree. Then a slow agent is
raced instead of merely observed, the finished themes are rebased and gated while the
slow one continues, and a commit is never made under a live agent by accident.

**And the race is the instrument, not merely the remedy.** The witness rule above
compares a slow agent to a sibling that finished, which controls the *invocation* —
the tool runs, the network answers, the brief parses. A copy of the **same task**
controls the task, which is the thing actually in doubt, and it removes the one defence
a duration ratio can never answer: "that brand is heavier". Measured on one theme: the
original had written nothing in 72 minutes, a copy launched from the same brief was
writing files at **9** and delivered complete at 12. That converts an observation into
an experiment. And it is the cheap kind of experiment, because **it destroys nothing
while it measures** — killing to find out consumes its subject, racing consumes only
tokens. So when the threshold is approached rather than crossed, race rather than
wait, and let the copy answer the question the clock cannot.

**But the race has a boundary, and it is the moment it decides.** Racing destroys
nothing *while it measures*; once a copy has delivered, leaving the loser running stops
being a measurement and becomes an exposure — it is still writing into the tree the
conductor is integrating into, so a late write can land on top of work already
integrated. So the sequence is: race, let the copy deliver, **stop the loser**, then
integrate. A rule that said only "never kill an agent" would have left an active writer
in the integration tree, trading one risk for a worse one. The motive is what bounds
the rule: the loser is stopped because of *where it writes*, not because it was slow.

**And say how the work comes back, or the layout invents a cost that does not exist.**
Each theme's worktree carries **its own branch**, cut from the lot branch
(`git worktree add -b <branch> <path> <lot-branch>`). Nothing needs a detached HEAD:
detachment is forced only when two trees race the *same* branch, which is the race
case and not the layout. The builder then **commits on its own branch** — which
reverses the standing instruction not to commit — and that commit is the delivery
unit. The conductor integrates with one command, run from the lot worktree:

```
git cherry-pick -n <lot-branch>..<theme-branch>
```

**But the branch name suffices only for a builder that has finished.** A builder that is
still committing has a moving tip, so its branch name **resolves twice, to two values**:
measured on a deliberately moving branch, `git rev-parse` returned one sha, a further
commit landed, and the same name returned another — so a range computed before that
commit and taken after it silently includes work nobody examined, and the scope check will
have examined something other than what was picked. For a live builder the range is
therefore frozen on an explicit sha: `git rev-parse <branch>` first, then
`<lot-branch>..<that-sha>`.

This is the validity window again, at the shortest interval it has yet appeared in — not
between a brief and a rebase, nor between a measurement and a conclusion, but **between two
of one's own commands**. And the reason the original rule missed it is the familiar one:
the probe that established it made three commits and *then* measured, so it tested a
**static** branch and was silent about a moving one. A rule measured on a finished builder
says nothing about a working one.

The **range** form, not a sha: it takes however many commits the builder made — probed
with three, one of them a second edit to a file an earlier commit had already touched,
one adding a file — and stages their cumulative result in a single command, exit 0,
with the new file staged as `A` and no sequencer state left behind. So the conductor
never needs to know the builder's shas, only its branch name, and a builder is free to
commit as often as it likes. (A *conflicting* pick does create sequencer state and
needs `--quit` or `--abort`; that path stays rare because every commit touches only its
own package directory.)

`-n` stages without committing, so the builder's work arrives whole while the commit
message — which is part of the provenance record — stays the conductor's to write.
Measured against the shared-tree model this is **not an extra cost**: the
`git add -- packages/theme-<id>` it replaces was already one command. Conflicts are
structurally impossible while every commit touches only its own package directory, so
themes integrate one at a time as they finish instead of queueing behind the slowest.
What the layout buys is the rebase: the builders hold their own branches, so the lot
branch is free the whole time.

**Re-read what a third-party tool wrote, because a silent failure returns success.**
On this repository `gh pr edit` queries `repository.pullRequest.projectCards`, which
returns `"pullRequest": null` with `{"type":"NOT_FOUND", "message":"Projects (classic)
is being deprecated…"}` — the whole node it asks for is null, so the edit is dropped
while the command still exits 0 and prints what reads as a deprecation warning. A title
and body were believed updated and were untouched; it was found only by reading the
pull request back. The workaround is
`gh api -X PATCH repos/<owner>/<repo>/pulls/<n> -f title=… -F body=@<file>`, which
works. The general rule outlives the bug: **after any write performed through a tool
you do not control, read the object back.** An exit code describes the command, not the
object.

**And the rule is about anchored writing, not about remote tools.** The same failure
arrived from a local script: an edit keyed to an anchor ending at a short phrase, whose
replacement did not repeat the clause preceding it, silently dropped that clause and
left a sentence reading "on the conductor's budget. nothing else." Nothing reported it,
because **an anchored write has no acknowledgement** — the anchor matched, the write
succeeded, and the loss was in what the replacement failed to carry forward rather than
in what the tool failed to do. A `sed` and an API call are the same operation in this
respect. So read the object back after every anchored edit, and prefer an anchor that
ends on a line boundary over one that ends mid-sentence, since a mid-sentence anchor
puts the burden of repeating context on the replacement.

**And read back the whole region the write could reach, not the text you meant to put
there.** A read-back framed on the intention cannot see an unintended effect. Measured:
`String.prototype.replace` interprets `$` in the **replacement** (`$$`, `$&`, `$1`,
backtick-`$`), so a replacement containing `page.$$eval` was written as `page.$eval`.
**Four real checks passed and the file was still broken** — the anchor matched exactly
once, the write succeeded, `node --check` parsed it because `$eval` is valid syntax, and
the added lines read back intact, because the corruption lived in a line the read-back did
not cover. Only execution caught it. The complete remedy is a replacement **function**
(`t.replace(from, () => to)`), which disables the substitution entirely rather than
escaping case by case.

**Evidence has a validity window, and a browser verification is valid for a build, not
for a branch.** A result that does not say which artefact it speaks of reads as though it
spoke of the latest. Measured: a confidentiality run passed on a site built at one moment,
and a rebase that changed a package the docs app consumes destroyed that artefact — so
the proof had to be regenerated, not reused. The dating of evidence is as compulsory as the
dating of a brief, and the enumeration that exempts a gate can equally certify that an
artefact still stands: on the last rebase of that lot, nothing the docs build consumes had
moved, and saying so on the record is what let the proof be kept.

**A threshold a correct artefact can never satisfy is not a threshold, it is a
prohibition** — it measures a writing convention rather than a property. Measured: a
witness that counted `# suites` would have demanded a structurally impossible number,
because the repository's guards are flat `test()` calls with no `describe()`, and it would
have cried "empty glob" on a healthy run. So calibrate every threshold on a **known-good
case before it guards anything**. That is the third property required of a guard, moved
from the assertion to the threshold.

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

**`text.muted` is held to 3:1, and that is a measurement of the repository, not a
concession.** Resolving `text.muted` to a hex across every theme package that declares
one — 134 of them, scoped to `semantic.text.muted` — and computing each ratio on
white gives **87 below 4.5:1**. Twenty-four sit below 3.0, the lowest is `#c8c8c8` at
1.67, the lowest value at or above 4.5 is `#767676` at 4.54, and the median is
`#888888` at 3.54. A muted text role under 4.5 is therefore this repository's norm and not its
exception. So for a programme theme: `text.muted` must clear **3:1** and record its
ratio; a value between 3 and 4.5 is a **documented arbitration**, stated with its
number in `MAPPING.md`; below 3:1 is a defect and the stop rule applies.

This rule is **forward-looking only**. It is not a judgement on the 134 existing
packages — section 1 puts every existing id out of scope, and applying a programme
prescription backwards across this repository is the defect that once produced some
three hundred false positives in a single guard. Measure the distribution before
proposing a floor; do not infer it from the handful of packages someone happened to
cite.

The case that produced the rule is worth keeping whole, because the reasoning failed
twice before the measurement settled it. A theme shipped `text.muted` at **1.92:1**
(only four existing packages are lower), which is a real defect, and it was routed to
the brand's other measured text grey at **3.95:1** — better than 86 of the 134. A
reviewer then argued, from section 9's letter, that a text role owes 4.5 and that the
stop rule's next step `#737373` at 4.74 was the conforming answer. Applying it would
have collapsed `muted` into `secondary` (5.01, three grey units away) **and** held one
new theme to a bar that 87 shipped packages do not clear.

**And the precedents offered were not measurements — nor was the first attempt to
refute them.** The pair cited to justify the 3.5 band, `#888b8d` at "3.54" and
`#8c8c8c` at "3.55", is wrong in its ratios and right in its attribution: measured,
`#888b8d` is **3.43** and `#8c8c8c` is **3.36**, so neither member reaches 3.5 and the
band does not exist. But the correction first offered — that `#8c8c8c` belonged to
another package, and that the governmental theme's `text.muted` was `#26374a` at
12.15 — was itself false. `#8c8c8c` is the `text.muted` of **both** that theme and
`theme-behaviour-interactive`, and `#26374a` is that theme's `blue.muted`, consumed as
`surface.inverse`, `action.primaryHover` and a chart category, never as text.

That failure is worth keeping, because the rule as first written invites it. The
extractor took the **first** `muted:` in each file, and a palette declares `muted`
keys long before `semantic` does — so it read a dark blue in one theme and a light
background tint in another, and inverted a whole distribution before anyone checked.
This is section 8's rule — find the LAST rule, not the first — applied to the tool
instead of to the stylesheet. A first match is a candidate in a script exactly as it
is in a brand sheet.

**Two instruments are independent only on the hypothesis in question.** Coarseness was a
proxy for what matters, and the proxy fails: measured, a mutation that worked on the raw
text and its own `expect()` that also worked on the raw text shared precisely the
assumption under test — the guard flattens newlines and comment markers before matching
— so their agreement proved nothing and the check certified a mutation that had not
landed. Read the same way, the four checks that let a `$$` substitution through (anchor
matched, write succeeded, `node --check` parsed, added lines read back) all shared "the
region I aimed at is the region that changed": four checks, one assumption, no
independence. So the question to answer is not whether two methods differ in refinement
but whether they differ **on the hypothesis being tested**.

**When a measurement carries a decision, run two methods of different coarseness, and
treat their disagreement as the alarm.** The case above is the whole argument: a
refined extractor that resolved the token chain produced a false distribution, and a
crude one that read the trailing comment produced the right extremes. The refined tool
was not merely wrong, it was **silently** wrong — its output was plausible, and it
erred in the direction that supported the thesis it had been built to test, which is
the one direction nothing checks. Coarseness is not accuracy, but it fails
*differently*, and two different failure modes rarely agree. So a figure that will move
a rule is measured twice, by methods that do not share an assumption: agreement on the
extremes is the evidence, and disagreement is where the bug is. Agreement reached by
running the same script twice is not agreement.

**Scope-check a commit on the commit, never against a moving branch — `..` means two
different things.** For `cherry-pick` and `rev-list`, `A..B` means "the commits in B
that are not in A", which is what integration wants. For `git diff`, the same
`A..B` compares the two **tips**. Once the lot branch has advanced past the point a
theme branch was cut from, a tip diff therefore renders the *other* themes' work as
deletions: on one lot it showed 202 deletions in a package the builder had never opened,
and the builder was one command away from being accused of undoing another's work. Use
`git show --stat <sha>` for the scope of a commit, or a merge-base diff if a range is
really wanted.

The same measurement carries a second consequence, less obvious: **a per-theme branch
ages exactly as the lot base used to age, one level down.** That costs nothing at
integration, because `cherry-pick` applies the commit and not the divergence — so the
layout did not remove the ageing, it moved it to where it is free, *provided the right
object is read*.

So the rule has two halves, and the second is the one that was missing:

**A control run in the author's environment answers the author's question.** Whatever
resolves from where you stand and nowhere else is invisible to you and fatal to a reader:
a local branch, a worktree's `node_modules`, a cached font, an absolute path, an
installed package. Measured: four commit hashes quoted by this lot's reports resolved in
the authoring clone — kept alive by two branches that were never pushed — while
`git ls-remote` showed the remote advertising **none** of them. They were live where the
check is cheap and dead where the reader is, and no check available locally could see it.

So for anything a reader will follow, the instrument must have **the reader's shape**:
`git ls-remote`, a fresh clone, an install from the tarball. This repository already
pays that discipline for another object — `pack:smoke` installs from tarballs precisely
because "it works in the workspace" is not "it works for a consumer" — so the rule is
that principle carried from packages to citations, not a new burden.

**An instruction expressed as a range is an instruction whose extent is decided elsewhere,
later, by someone who is not reading it.** A range designates by extension rather than by
enumeration, so it does not name its own content and inherits silently whatever grows
inside it. Nobody decides that inheritance, which is what distinguishes this from an
ordinary imprecision.

Four instances met in a single day, on objects with nothing else in common:

| the range | who fixes its extent | what it did |
|---|---|---|
| `^5.9.3` and 243 other caret specifiers | the registry, at install time | lets a third party choose the version installed |
| `scripts/*.test.mjs` | the filesystem, at run time | returns **rc=0** when it matches nothing |
| `A..B` | the command, at parse time | two different meanings for `git diff` and for `cherry-pick` |
| "read sections 1 to 12" in a builder's brief | whoever next enlarges the method | imposed **683 lines** that do not concern a builder, measured |

The counter-measure is the same in all four and it is always an enumeration: the named
reading list, the file-count floor that refuses an empty glob, the range frozen on an
explicit sha, the exact pins that theme packages already carry where determinism is
required. **The repository already applies it where it matters**, which is why this is a
principle generalised rather than a new demand.

And the rule is not "never use a range": a library that accepts patch releases wants one.
The test is narrower and answerable: **would you notice if the extent changed?** If the
answer is no, the designation is doing work nobody is watching — and an instruction, a
glob or a reading list almost always answers no.

**A measurement produces a narrow guarantee and a broad confidence, so a measured clause
states the condition under which its probe holds — not only the sample it used.** Twice in
this programme a rule that was genuinely measured turned out to be silent about the case
its probe had not covered:

| measured rule | what the probe used | the domain it was silent about | the cost |
|---|---|---|---|
| integration by `cherry-pick -n <sha>` | **one** commit | n commits | false from the second commit on |
| the range form taking a branch **name** | a **static** branch | a branch still moving | a range that includes an unexamined commit |

Both times the measurement was real. What made each rule trustworthy for the case it
covered is also what hid the case it did not, because a measurement grants a narrow
guarantee and invites a broad confidence. The first rule recorded "probed with three
commits" — it declared its **sample** and said nothing about its **domain**. Had it said
"on a branch whose tip no longer moves", the gap would have shown on reading instead of
waiting for a refutation.

So this is the citation discipline one notch further: it is not enough to cite the artefact
that produced a measurement, the condition under which that measurement holds is cited too.
**A measurement without its domain is a number without its unit.** And the practical half,
which is cheaper than it sounds: **enumerate the states of the subject before choosing the
probe case** — the table of four builder states above is what made the second gap visible
before an integration needed it.

**A precedent is a measurement, not a citation** — open the package, resolve the
token, compute. **And resolve it in the package you are talking about, scoped to the
role you are talking about**, rather than searching the repository for the value.
Finding the hex somewhere else proves nothing about where it sits here, and finding a
key of the same name proves nothing about the role: `muted` names a palette tint, a
background, a border and a text role in this repository, and only one of them is
`semantic.text.muted`.

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

**A refutation is measured in both directions.** Before writing « this value is
false », state the counting convention you are applying and check whether the
package states another one. Two conventions give two numbers, and the difference
is not a builder's defect. Measured on lot 4: a review refuted a correct figure
(29 declarations), the correction shipped a false one (28), and the second pass
had to restore 29 — the damage came from a correction applied to a value that was
already right. If the package publishes a number with **no** convention beside it,
that absence **is** the defect: name it as such, and do not substitute your own
number for the builder's. The inverse case is equally measurable and equally
reportable: a figure whose justification is wrong while the figure itself is
right. On `getlink`, a fixer justified a count of 9 with a command that replays to
17 — of which 8 are selector-side — and the 9 was nonetheless correct under two
independent instruments. Report the broken proof, keep the value.

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

**Every brief records the method sha it was written against, and integration compares
that sha to the tip.** On a long lot the method moves under the builders — eleven
amendments in one session — so an agent briefed at the start is judged against a text
it never read. One builder in this programme ran for an hour on a brief predating the
amendment that replaced the very rule its task turned on. Two lines close it:

- in the brief: `reference method: .ds-scrap/METHOD-fr-top50.md at <sha>`;
- at integration: if `git log <sha>..HEAD -- .ds-scrap/METHOD-fr-top50.md` is not
  empty, read the amendments that landed and decide, **before judging the work**, which
  of them apply retroactively.

That second step is the substance, and it is what keeps the retroactive defect of the
prescriptive guards from returning: **an amendment later than the brief is not
automatically opposable to the work.** It is opposable when it corrects a false
measurement — the painting test is, because the rule it replaced validated a defect,
and the `text.muted` floor is, because the floor it replaced described nothing. It is
not opposable when it tightens a matter of form, and it is never opposable when it is a
conduct rule addressed to the conductor rather than to a package.

Worked example, from the lot that produced the rule: eight amendments separated the
briefs from integration; **two were opposable** and six were conduct rules; and the two
opposable ones bit on exactly one value across four themes, a `text.muted` at 3.95:1
whose sub-floor arbitration was already documented with its number. The cost of asking
was one command; the cost of not asking would have been four themes judged against a
text none of them contained.

Without the sha the question cannot even be posed, and that is the point: this is the
same silence as a tool validated on one case or a layout that never says how the work
returns — **a text whose version is unstated** — and like the others it reads as a
guarantee, because the brief looks complete.

**An instruction sent to an agent that cannot be reached must carry its stop
condition.** A one-shot invocation has no inbox: what was sent is final until the agent
returns, so an instruction found to be wrong five minutes later cannot be withdrawn.
Every brief therefore states what would make the agent **stop and report** rather than
proceed — "if the measurement contradicts this description, stop and say so" — and
marks which of its claims are the conductor's description rather than measured fact.
This is a required clause and not a good habit: one brief in this programme carried an
instruction its author retracted while the agent was still running, and the only reason
that was safe is that the brief happened to include a stop condition.

**And the stop condition has three states, not two: contradicted, INSUFFICIENT,
confirmed.** "Stop if the measurement contradicts this description" is binary, and the
description that fails is usually not contradicted — it is incomplete. Measured: an
agent applied an instruction its author had retracted, because it was looking for a
contradiction and the fault was an insufficiency, which triggered nothing. So the brief
says: *if this description is incomplete rather than wrong, say that too — a description
that does not contradict you is not thereby sufficient.*

**And an agent never writes into the code, or into the ledger, the attribution of a
decision to a person.** Not "owner's decision", not "approved by", not "arbitrated by": it
writes the **measurement**, and leaves the attribution to whoever decides. Measured: an
agent wrote "owner's decision" in a source comment for a decision the owner had never
taken. What makes that grave is not that it is incorrect but that it lasts — **a falsehood
recorded in source has a lifetime its author does not control**, and the comment would
outlive by years the confusion that produced it.

**A second pass receives the questions the full review left open, by name, and declares
its scope before it runs.** Measured over a full lot: four second passes cost 87 500,
100 382, 111 847 and 127 908 tokens — a mean of 106 909, or **50.8 %** of a full
review's mean for that lot, with two of the four above half. Most of that went to
re-deriving what the full review had already established. A second pass is not a
shorter review, it is a **list**: the named corrections to counter-measure, the claims
the full review could not settle, and nothing else. Cap it at **five named questions**.
Have it state that scope back before it spends, so a drift into a second full review
shows at the start rather than in the total.

**And have it report the cost of its extensions separately from the cost of the list**,
because the two answer different questions and one figure cannot separate them. That
split is not bookkeeping: over one lot, **three of the four passes produced their
findings through a declared extension rather than through the list** — 22 table rows
measured instead of the 4 asked for, a vendor's stock package fetched to qualify an
attribution, two figures counted that only the list's own claims carried. A scope
constraint that forces extensions to be declared makes them **justifiable** instead of
forbidding them, which is the opposite of what one fears from a constraint; but without
the cost split there is no way to tell a list that is too long from an exploration that
is paying.

Do not ask it to estimate its own cost — two agents asked for that estimate were wrong
by a factor of two, both in the direction that flattered them, while the measured figure
was already available in the completion record.

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

**A control whose precondition can be false has three outcomes, and the invalid one
names the instrument, not the subject.** Two verdicts are not enough as soon as a
precondition can fail, because a broken precondition then spills into whichever verdict
most resembles a defect of the subject. Measured on the confidentiality check: a browser
profile that started in the revealed state inverted its two passes, and the check
reported **four brand themes as leaked** — the gravest incident this repository can
have — when nothing had leaked and the instrument simply was not in a position to
measure. Its exit condition did catch the inversion, so the verdict was a failure rather
than a false pass; but **a failure naming four themes points at the themes instead of at
the instrument**.

So: pass, fail, and **invalid**. The invalid outcome uses its own exit code and says in
words that nothing in the run is evidence about the property — the wording matters as
much as the code, because it forbids a hurried reader from taking it for an incident. An
instrument that accuses must first prove it could measure. And the cost of getting this
wrong is asymmetric on a confidentiality rule: after two false alarms the next lot
unplugs the only control that measures it, which is a more probable failure than the one
the control looks for.

**Before shipping a control or a condition with two outcomes, ask whether an intermediate
state exists — and if it does, name it rather than let it spill.** This is the design
gesture behind the three clauses above, and it is worth stating separately because each of
them was shipped binary first and each cost a defect:

| object | shipped binary as | what it cost |
|---|---|---|
| the confidentiality check | pass / fail | **four themes accused of leaking** on a correct site |
| a guard red at the baseline | reached / unreached | eight tests would have been counted as gaps |
| a brief's stop condition | contradicted / confirmed | **a retracted instruction was applied**, and a false attribution entered the source |

The operative half is where the missing state goes: **it spills into whichever of the two
most resembles a defect of the subject.** That is why the failure is always an accusation
and never an acquittal, and it is what makes the class expensive — a false positive sends
someone to correct something that was correct.

The generality is established on three objects and not proved. Three is enough to act on,
because in all three the binary version was shipped and produced a measurable defect; it is
not enough to claim the pattern is universal, and this clause says so rather than implying
more than it has.

**A received number is a hypothesis, not a target.** An agent asked to correct a figure
at four places and finding only three reports three. Measured: one builder did exactly
that, writing that it had not invented a fourth occurrence — and the pressure to
produce one is the *same* pressure that produced the wrong figure, since both adjust
reality to the text in front of them. That pressure has a record here: a precedent
relayed without being resolved, and a summary table written from memory whose four cells
out of twelve were wrong. So every figure handed to an agent is marked as **to verify,
not to reach**, and a brief that says "four places" is a claim the agent may refute.

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

### Clause yield ledger

A conductor clause that costs a builder reading time has to be shown to earn
it. This ledger records what each of the five brief questions produced,
measured on the first lot-4 delivery (theme `ipsen`, 2026-09-25). The cost
recorded is the cost the builder actually met — 19 lines of brief — not the
length of this document.

| Question | Bit | What it produced |
|---|---|---|
| 1. Which property, and which instrument measures it? | no | Five instruments named. No consequence on the artefact is attributable to it. |
| 2. Can the instrument redden? | yes | A planted `#bada55` detected twice; excluding vendor rules moved two counts (`#eee` 4→3, `#ccc` 3→1). |
| 3. An aggregate where the question is a term, a set where it is a location? | yes | Three token attributions corrected: `#c02b0a` ×16 traced to Gravity Forms, `#00ff1a` and `#ff1a1a` kept out of system roles. |
| 4. Is the threshold satisfiable by a correct artefact? | yes | The calibration pair reproduced before any use; `text.muted` at 3.0041 recorded as a numbered trade-off instead of passing in silence. |
| 5. Are the two instruments independent on the hypothesis tested? | yes | Two implementations sharing one formula refused as two instruments; the external calibration named as the only independent leg; a corroboration graded weak and said to be weak. |

Question 1 is **on probation**: kept for one more lot, removed if it does not
bite there. One builder is a point, not an interval, so a single silent lot is
not evidence that a clause is idle — and a single loud one is not evidence that
it is load-bearing. The rule is written here instead of remembered so that the
next lot judges question 1 on two measurements.

None of this ledger belongs in a builder's brief. A builder told that a
question is on probation answers the probation instead of the question.

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
