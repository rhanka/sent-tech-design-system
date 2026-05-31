# Compare Mode — Lot 1 (Socle de vérité partagée) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Établir une source unique (manifeste + thèmes de référence) et un registre de gaps versionné avec identité stable, consommés par l'oracle et la doc, sans toucher au rendu des pages composant.

**Architecture:** Trois modules ESM `.mjs` dans `apps/docs/src/lib/compare/` (importables par Vite ET par l'oracle Node) : `manifest.mjs` (sélecteurs + markup officiel par `theme→scenario`), `reference-themes.mjs` (CDN pinés + polices), `registry.mjs` (fonctions pures : `gapKey`/`manifestHash`/`mergeRegistry`/`deriveStatus`). L'oracle `tools/compare/fidelity.mjs` consomme le manifeste, localise les iframes par attribut `data-compare-*` (corrige le bug `--component`), et écrit `compare-gaps.json` par **merge** (jamais d'écrasement du triage humain).

**Tech Stack:** Node ESM (`.mjs`), Svelte 5 / SvelteKit (apps/docs), Vitest (`vitest run src`), puppeteer-core + Chrome système.

**Spec:** `docs/superpowers/specs/2026-05-30-compare-mode-design.md` (corrections C1–C10).

---

## Corrections post-relecture (Opus 4.8 — verdict « à ajuster avant dev », 0 bloquant)

Cœur vérifié empiriquement (registry.mjs 12 tests verts, import croisé ESM OK, svelte-check OK, dérivation manifeste fidèle, invariant C5 satisfait). À intégrer :

- **M1 (majeur — finir C8) :** la page `/compare` garde des CDN **non épinglés** (`+page.svelte:149-152`) ; l'oracle mesure ces iframes → le seed `compare-gaps.json` serait produit sur du CSS `latest` flottant et `reference-themes.mjs` resterait orphelin. **Fix : dans Task 5, migrer `refDoc()` de la page (`CDN`/`FONT_LINKS`/`BRAND_FONT`, lignes 149-195/288-297) pour importer depuis `reference-themes.mjs`** (mêmes valeurs, mais épinglées). Rend `reference-themes.mjs` vivant et le seed reproductible. *(La fonte Marianne « notre côté » `MARIANNE_CDN` reste inchangée — c'est notre rendu, pas la référence.)*
- **Mi1 :** `.cmp-row` est à `+page.svelte:339` (l'élément `{#each … as entry}`), **pas 411** (411 = `.cmp-cell--ref` à l'intérieur). Les `data-compare-*` vont sur la ligne 339.
- **Mi2 :** la variable de boucle est `entry` → utiliser `entry.key` (pas `e.key`). `theme.id` est correct.
- **Mi3 :** `npm … run test -- registry` ne filtre PAS (le script a `src` codé en dur → lance les 3 fichiers). Inoffensif. Pour cibler un fichier : `npm --workspace apps/docs exec -- vitest run src/lib/compare/registry`. Sinon accepter que toute la suite `apps/docs` tourne.
- **Mi4 (finir C8) :** `opts.anatomyVersion/dsVersion/themeVersion` n'existent pas → stamps `null`. **Fix : lire les vraies versions** depuis `apps/docs/package.json` (`dependencies["@sentropic/design-system-themes"]` et `…-theme-{dsfr,carbon}`, comme la page l.55-57) et `ANATOMY_VERSION` depuis le paquet themes ; passer ces valeurs au `stamp` de `mergeRegistry`.
- **Mi5 :** dans les snippets de vérif, remplacer `node -e "…require('./….json')…"` par `JSON.parse(fs.readFileSync(...))` (repo `type:module`).
- **Mi6 (invariant pour l'auteur du manifeste) :** `OUR_SELECTOR` est theme-indépendant → pour chaque clé partagée, `ourSelector` DOIT être identique en `dsfr` et `carbon` (la dérivation Task 4 prend `dsfr ?? carbon`). Vrai pour la migration 1:1.

Notes non bloquantes : le test de parité Task 3 ne compare pas au `REF` réel de la page (ne détecte pas un drift jusqu'à la migration page en Lot 2) ; `regressed` couvre aussi les auto-fix oracle (à raffiner si besoin de distinguer le triage humain).

---

### Task 1: Helpers de registre — fonctions pures (`registry.mjs`)

C'est le cœur du Lot 1 (corrections C1 identité + C5 merge). Pur, sans dépendance, testé en premier.

**Files:**
- Create: `apps/docs/src/lib/compare/registry.mjs`
- Test: `apps/docs/src/lib/compare/registry.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/docs/src/lib/compare/registry.test.ts
import { describe, it, expect } from "vitest";
import { gapKey, manifestHash, mergeRegistry, deriveStatus } from "./registry.mjs";

describe("gapKey", () => {
  it("joins identity dimensions deterministically", () => {
    const k = gapKey({ theme: "dsfr", component: "Button", scenario: "disabled", state: "disabled", property: "background-color" });
    expect(k).toBe("dsfr/Button/disabled/disabled/background-color");
  });
});

describe("manifestHash", () => {
  const base = { dsfr: { Button: { component: "Button", scenario: "primary", state: "rest", ourSelector: ".st-button", refSelector: ".fr-btn", refMarkup: "<button>" } } };
  it("is stable for identical input", () => {
    expect(manifestHash(base)).toBe(manifestHash(structuredClone(base)));
  });
  it("changes when a selector changes", () => {
    const altered = structuredClone(base);
    altered.dsfr.Button.refSelector = ".fr-btn--secondary";
    expect(manifestHash(altered)).not.toBe(manifestHash(base));
  });
  it("is order-independent across theme/key insertion order", () => {
    const a = { dsfr: { A: { component: "A", scenario: "s", state: "rest", ourSelector: ".a", refSelector: ".ra", refMarkup: "x" }, B: { component: "B", scenario: "s", state: "rest", ourSelector: ".b", refSelector: ".rb", refMarkup: "y" } } };
    const b = { dsfr: { B: a.dsfr.B, A: a.dsfr.A } };
    expect(manifestHash(a)).toBe(manifestHash(b));
  });
});

describe("mergeRegistry", () => {
  const stamp = { manifestHash: "h1", generatedAt: "2026-05-30T00:00:00Z", anatomyVersion: "1.5.0", dsVersion: "^0.10.2", themeVersion: "^0.2.2" };
  const gap = { theme: "dsfr", component: "Button", scenario: "disabled", state: "disabled", property: "background-color", ours: "rgb(0,0,145)", ref: "rgb(229,229,229)", delta: "≠" };
  const key = gapKey(gap);

  it("creates a new oracle entry as open", () => {
    const out = mergeRegistry(null, [gap], stamp);
    expect(out.entries[key]).toMatchObject({ status: "open", source: "oracle", ours: "rgb(0,0,145)", lastSeen: stamp.generatedAt });
  });

  it("preserves human status and note on re-measure", () => {
    const existing = { version: 1, entries: { [key]: { ...gap, status: "escape", note: "DSFR n'expose pas ce token", source: "manual" } } };
    const out = mergeRegistry(existing, [gap], stamp);
    expect(out.entries[key].status).toBe("escape");
    expect(out.entries[key].note).toBe("DSFR n'expose pas ce token");
    expect(out.entries[key].ours).toBe("rgb(0,0,145)"); // measurement refreshed
    expect(out.entries[key].lastSeen).toBe(stamp.generatedAt);
  });

  it("marks a previously-open oracle gap fixed when no longer measured", () => {
    const existing = { version: 1, entries: { [key]: { ...gap, status: "open", source: "oracle" } } };
    const out = mergeRegistry(existing, [], stamp);
    expect(out.entries[key].status).toBe("fixed");
  });

  it("flags regressed when a human-fixed gap reappears", () => {
    const existing = { version: 1, entries: { [key]: { ...gap, status: "fixed", source: "oracle" } } };
    const out = mergeRegistry(existing, [gap], stamp);
    expect(out.entries[key].status).toBe("fixed"); // human intent kept
    expect(out.entries[key].regressed).toBe(true);
  });

  it("leaves untouched manual entries the oracle never measures", () => {
    const manualKey = gapKey({ theme: "dsfr", component: "Header", scenario: "auth", state: "rest", property: "layout" });
    const existing = { version: 1, entries: { [manualKey]: { theme: "dsfr", component: "Header", scenario: "auth", state: "rest", property: "layout", status: "escape", source: "manual", note: "impossible" } } };
    const out = mergeRegistry(existing, [gap], stamp);
    expect(out.entries[manualKey].status).toBe("escape");
    expect(out.entries[manualKey].source).toBe("manual");
  });
});

describe("deriveStatus", () => {
  it("returns stale when the manifest hash no longer matches", () => {
    expect(deriveStatus({ status: "open", manifestHash: "old" }, "new")).toBe("stale");
  });
  it("returns regressed when the regressed flag is set", () => {
    expect(deriveStatus({ status: "fixed", regressed: true, manifestHash: "h1" }, "h1")).toBe("regressed");
  });
  it("passes the human status through otherwise", () => {
    expect(deriveStatus({ status: "escape", manifestHash: "h1" }, "h1")).toBe("escape");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm --workspace apps/docs run test -- registry`
Expected: FAIL — `Cannot find module './registry.mjs'`.

- [ ] **Step 3: Implement `registry.mjs`**

```js
// apps/docs/src/lib/compare/registry.mjs
// Pure, dependency-free helpers shared by the docs app (Vite) AND the oracle
// (tools/compare/fidelity.mjs, plain Node ESM). NO imports — keep it portable.

/** Stable gap identity: theme/component/scenario/state/property. */
export function gapKey({ theme, component, scenario, state, property }) {
  return [theme, component, scenario, state, property].join("/");
}

/** FNV-1a 32-bit hash → 8 hex chars. Deterministic, dependency-free. */
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Order-independent hash of the manifest's identity + selectors + markup. */
export function manifestHash(manifest) {
  const parts = [];
  for (const theme of Object.keys(manifest).sort()) {
    for (const key of Object.keys(manifest[theme]).sort()) {
      const m = manifest[theme][key];
      parts.push(
        `${theme}/${key}|${m.component}|${m.scenario}|${m.state}|` +
          `${m.ourSelector}|${m.refSelector}|${m.refMarkup}`
      );
    }
  }
  return fnv1a(parts.join("\n"));
}

/**
 * Merge fresh oracle measurements into an existing registry WITHOUT destroying
 * human triage. Oracle owns ours/ref/delta/lastSeen/manifestHash and the
 * existence of source:oracle entries. Humans own status/note (+ manual entries).
 *
 * @param {object|null} existing  prior registry ({version, entries:{}}) or null
 * @param {Array} oracleGaps      [{theme,component,scenario,state,property,ours,ref,delta}]
 * @param {object} stamp          {manifestHash, generatedAt, anatomyVersion, dsVersion, themeVersion}
 */
export function mergeRegistry(existing, oracleGaps, stamp) {
  const next = {};
  for (const [key, e] of Object.entries(existing?.entries ?? {})) {
    next[key] = { ...e };
  }

  const seen = new Set();
  for (const g of oracleGaps) {
    const key = gapKey(g);
    seen.add(key);
    const prior = next[key];
    if (prior) {
      next[key] = {
        ...prior,
        ours: g.ours,
        ref: g.ref,
        delta: g.delta,
        lastSeen: stamp.generatedAt,
        manifestHash: stamp.manifestHash,
        regressed: prior.status === "fixed",
      };
    } else {
      next[key] = {
        theme: g.theme,
        component: g.component,
        scenario: g.scenario,
        state: g.state,
        property: g.property,
        ours: g.ours,
        ref: g.ref,
        delta: g.delta,
        status: "open",
        source: "oracle",
        lastSeen: stamp.generatedAt,
        manifestHash: stamp.manifestHash,
      };
    }
  }

  // Oracle-sourced gaps not seen this run = closed → fixed (keep history).
  for (const e of Object.values(next)) {
    if (e.source === "oracle" && !seen.has(gapKey(e))) {
      if (e.status === "open") {
        e.status = "fixed";
        e.lastSeen = stamp.generatedAt;
        e.manifestHash = stamp.manifestHash;
      }
      e.regressed = false;
    }
  }

  return {
    version: 1,
    generatedAt: stamp.generatedAt,
    manifestHash: stamp.manifestHash,
    anatomyVersion: stamp.anatomyVersion,
    dsVersion: stamp.dsVersion,
    themeVersion: stamp.themeVersion,
    entries: next,
  };
}

/** Display status layered on the human status: stale > regressed > status. */
export function deriveStatus(entry, currentManifestHash) {
  if (entry.manifestHash && currentManifestHash && entry.manifestHash !== currentManifestHash) {
    return "stale";
  }
  if (entry.regressed) return "regressed";
  return entry.status;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm --workspace apps/docs run test -- registry`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/lib/compare/registry.mjs apps/docs/src/lib/compare/registry.test.ts
git commit -m "feat(compare): registry helpers (gapKey/manifestHash/mergeRegistry/deriveStatus)"
```

---

### Task 2: Thèmes de référence docs-local (`reference-themes.mjs`)

Correction C2 (sort la donnée référence du paquet npm) + C8 (CDN pinés).

**Files:**
- Create: `apps/docs/src/lib/compare/reference-themes.mjs`
- Create: `apps/docs/src/lib/compare/reference-themes.d.ts`
- Test: `apps/docs/src/lib/compare/reference-themes.test.ts`

- [ ] **Step 1: Résoudre les versions CDN à pin**

Run:
```bash
npm view @gouvfr/dsfr version
npm view carbon-components version
```
Expected: deux chaînes de version (ex. `1.13.0` et `10.58.x`). **Note-les** — elles remplacent `latest` implicite dans les URLs.

- [ ] **Step 2: Write the failing test**

```ts
// apps/docs/src/lib/compare/reference-themes.test.ts
import { describe, it, expect } from "vitest";
import { REFERENCE_THEMES } from "./reference-themes.mjs";

describe("REFERENCE_THEMES", () => {
  it("covers the two import themes", () => {
    expect(Object.keys(REFERENCE_THEMES).sort()).toEqual(["carbon", "dsfr"]);
  });
  it("pins every CDN URL to a version (no floating latest)", () => {
    for (const t of Object.values(REFERENCE_THEMES)) {
      expect(t.cssUrl).toMatch(/@\d/); // contains @<version>
      expect(t.cssUrl).not.toMatch(/\/npm\/(@gouvfr\/dsfr|carbon-components)\//); // unversioned form forbidden
    }
  });
  it("exposes label + brandFont", () => {
    for (const t of Object.values(REFERENCE_THEMES)) {
      expect(typeof t.label).toBe("string");
      expect(typeof t.brandFont).toBe("string");
    }
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm --workspace apps/docs run test -- reference-themes`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement (substitue `<DSFR_VERSION>`/`<CARBON_VERSION>` par les versions du Step 1)**

```js
// apps/docs/src/lib/compare/reference-themes.mjs
// Docs-local reference registry. Presence of an entry = "import theme" → enables
// (client-side) the Compare button + the "gaps" nav item. NOT part of the
// published npm API (correction C2). CDN URLs are pinned for reproducibility (C8).

const DSFR_CDN = "https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@<DSFR_VERSION>/dist";
const CARBON_CDN = "https://cdn.jsdelivr.net/npm/carbon-components@<CARBON_VERSION>";

export const REFERENCE_THEMES = {
  dsfr: {
    label: "Système de Design de l'État (DSFR)",
    cssUrl: `${DSFR_CDN}/dsfr.min.css`,
    fontLinks:
      `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` +
      `<link rel="stylesheet" href="${DSFR_CDN}/utility/utility.min.css">`,
    brandFont: "Marianne, system-ui, sans-serif",
    lang: "fr",
  },
  carbon: {
    label: "Carbon Design System (IBM)",
    cssUrl: `${CARBON_CDN}/css/carbon-components.min.css`,
    fontLinks: "",
    brandFont: "'IBM Plex Sans', system-ui, sans-serif",
    lang: "en",
  },
};
```

```ts
// apps/docs/src/lib/compare/reference-themes.d.ts
export interface ReferenceTheme {
  label: string;
  cssUrl: string;
  fontLinks: string;
  brandFont: string;
  lang: "fr" | "en";
}
export declare const REFERENCE_THEMES: Record<string, ReferenceTheme>;
```

- [ ] **Step 5: Run to verify it passes**

Run: `npm --workspace apps/docs run test -- reference-themes`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src/lib/compare/reference-themes.mjs apps/docs/src/lib/compare/reference-themes.d.ts apps/docs/src/lib/compare/reference-themes.test.ts
git commit -m "feat(compare): docs-local reference-themes registry with pinned CDNs"
```

---

### Task 3: Manifeste unique (`manifest.mjs`) + test de parité

Correction C1/C9 (modèle component/scenario/state). Migration **1:1** des 22 clés de banc existantes — aucune nouvelle couverture. Les clés d'état deviennent des scénarios explicites du composant parent.

**Files:**
- Create: `apps/docs/src/lib/compare/manifest.mjs`
- Create: `apps/docs/src/lib/compare/manifest.d.ts`
- Test: `apps/docs/src/lib/compare/manifest.test.ts`
- Source de migration (lire, ne pas modifier ici) : `tools/compare/fidelity.mjs:50-200` (`COMPONENTS`, `COMPONENT_THEMES`, `OUR_SELECTOR`, `REF_SELECTOR`, `REF_SELECTOR_NOTE`) et `apps/docs/src/routes/compare/+page.svelte:240-286` (`REF`).

- [ ] **Step 1: Write the failing parity test**

```ts
// apps/docs/src/lib/compare/manifest.test.ts
import { describe, it, expect } from "vitest";
import { COMPARE_MANIFEST } from "./manifest.mjs";

// The 22 bench keys that MUST migrate, with their theme coverage.
// (mirrors fidelity.mjs COMPONENTS + COMPONENT_THEMES; Carbon lacks Badge/Quote/Highlight)
const EXPECTED = {
  dsfr: ["Button", "ButtonDisabled", "Input", "InputError", "InputDisabled", "Textarea", "Select", "Search", "Link", "Checkbox", "Radio", "Toggle", "Tag", "Badge", "Alert", "Accordion", "Breadcrumb", "Pagination", "Card", "Tabs", "Quote", "Highlight"],
  carbon: ["Button", "ButtonDisabled", "Input", "InputError", "InputDisabled", "Textarea", "Select", "Search", "Link", "Checkbox", "Radio", "Toggle", "Tag", "Alert", "Accordion", "Breadcrumb", "Pagination", "Card", "Tabs"],
};

describe("COMPARE_MANIFEST parity with the legacy bench", () => {
  it("covers exactly the expected keys per theme", () => {
    expect(Object.keys(COMPARE_MANIFEST.dsfr).sort()).toEqual([...EXPECTED.dsfr].sort());
    expect(Object.keys(COMPARE_MANIFEST.carbon).sort()).toEqual([...EXPECTED.carbon].sort());
  });
  it("every entry has non-empty selectors, markup, and an explicit identity", () => {
    for (const theme of Object.keys(COMPARE_MANIFEST)) {
      for (const [key, m] of Object.entries(COMPARE_MANIFEST[theme])) {
        expect(m.ourSelector, `${theme}/${key} ourSelector`).toBeTruthy();
        expect(m.refSelector, `${theme}/${key} refSelector`).toBeTruthy();
        expect(m.refMarkup, `${theme}/${key} refMarkup`).toBeTruthy();
        expect(m.component, `${theme}/${key} component`).toBeTruthy();
        expect(m.scenario, `${theme}/${key} scenario`).toBeTruthy();
        expect(["rest", "focus", "disabled", "error", "selected"]).toContain(m.state);
      }
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm --workspace apps/docs run test -- manifest`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `manifest.mjs` — migrate ALL keys**

Règle de migration appliquée à chaque clé :
- `component` = composant parent (`ButtonDisabled`→`Button`, `InputError`/`InputDisabled`→`Input`).
- `scenario` = identifiant lisible (`Button`→`primary`, `ButtonDisabled`→`disabled`, `InputError`→`error`, `InputDisabled`→`disabled`, sinon `default`).
- `state` ∈ `rest|focus|disabled|error|selected` (`*Disabled`→`disabled`, `*Error`→`error`, `Tabs`/`Pagination` active→`selected`, sinon `rest`).
- `ourSelector` = valeur `OUR_SELECTOR[key]`. `refSelector` = `REF_SELECTOR[theme][key]`. `refMarkup` = `REF[theme][key]`. `lang` = `dsfr?"fr":"en"`. `note` = `REF_SELECTOR_NOTE[theme]?.[key]` si présent.

Squelette + entrées représentatives (compléter les 22×themes sur ce patron, en recopiant les valeurs exactes des fichiers source) :

```js
// apps/docs/src/lib/compare/manifest.mjs
// Single source of truth for the compare bench + oracle: theme → key →
// {component, scenario, state, ourSelector, refSelector, refMarkup, lang, note?}.
// Replaces the duplicated maps in fidelity.mjs and the REF object in
// compare/+page.svelte (correction C6 — kills the row-index `--component` bug).

export const COMPARE_MANIFEST = {
  dsfr: {
    Button: {
      component: "Button", scenario: "primary", state: "rest",
      ourSelector: ".st-button", refSelector: ".fr-btn", lang: "fr",
      refMarkup: `<button class="fr-btn">Primaire</button> <button class="fr-btn fr-btn--secondary">Secondaire</button>`,
    },
    ButtonDisabled: {
      component: "Button", scenario: "disabled", state: "disabled",
      ourSelector: ".st-button:disabled", refSelector: ".fr-btn:disabled", lang: "fr",
      refMarkup: `<button class="fr-btn" disabled>Désactivé</button>`,
    },
    InputError: {
      component: "Input", scenario: "error", state: "error",
      ourSelector: `.st-control[aria-invalid="true"]`, refSelector: ".fr-input--error", lang: "fr",
      refMarkup: `<div class="fr-input-group fr-input-group--error">…</div>`, // recopier REF.dsfr.InputError verbatim
    },
    Toggle: {
      component: "Toggle", scenario: "default", state: "rest",
      ourSelector: ".st-toggle__track", refSelector: ".fr-toggle__label", lang: "fr",
      refMarkup: `<div class="fr-toggle">…</div>`, // recopier REF.dsfr.Toggle verbatim
      note: "L'interrupteur DSFR est dessiné en ::before/::after sur le label. On compare le label (.fr-toggle__label) — typo/couleur comparables.",
    },
    // … Input, InputDisabled, Textarea, Select, Search, Link, Checkbox, Radio,
    //    Tag, Badge, Alert, Accordion, Breadcrumb, Pagination, Card, Tabs, Quote,
    //    Highlight — même patron, valeurs recopiées de OUR_SELECTOR/REF_SELECTOR/
    //    REF/REF_SELECTOR_NOTE.
  },
  carbon: {
    Button: {
      component: "Button", scenario: "primary", state: "rest",
      ourSelector: ".st-button", refSelector: ".bx--btn--primary", lang: "en",
      refMarkup: `<button class="bx--btn bx--btn--primary">Primary</button> <button class="bx--btn bx--btn--secondary">Secondary</button>`,
    },
    Tabs: {
      component: "Tabs", scenario: "selected", state: "selected",
      ourSelector: `.st-tabs__tab[aria-selected="true"]`,
      refSelector: ".bx--tabs__nav-item--selected .bx--tabs__nav-link", lang: "en",
      refMarkup: `<nav class="bx--tabs">…</nav>`, // recopier REF.carbon.Tabs verbatim
      note: "Spec selector .bx--tabs__nav-item--selected is the <li> wrapper (0×0). Measuring the inner .bx--tabs__nav-link.",
    },
    // … toutes les autres clés Carbon (PAS de Badge/Quote/Highlight).
  },
};
```

```ts
// apps/docs/src/lib/compare/manifest.d.ts
export type CompareState = "rest" | "focus" | "disabled" | "error" | "selected";
export interface CompareEntry {
  component: string;
  scenario: string;
  state: CompareState;
  ourSelector: string;
  refSelector: string;
  refMarkup: string;
  lang: "fr" | "en";
  note?: string;
}
export declare const COMPARE_MANIFEST: Record<string, Record<string, CompareEntry>>;
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm --workspace apps/docs run test -- manifest`
Expected: PASS (parity green → migration complète).

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/lib/compare/manifest.mjs apps/docs/src/lib/compare/manifest.d.ts apps/docs/src/lib/compare/manifest.test.ts
git commit -m "feat(compare): single source manifest (theme/component/scenario/state)"
```

---

### Task 4: L'oracle consomme le manifeste (fin de la duplication)

**Files:**
- Modify: `tools/compare/fidelity.mjs:50-200` (remplacer les maps internes par des dérivés du manifeste) et `:642-701` (boucle de mesure).

- [ ] **Step 1: Importer le manifeste et en dériver les maps**

Remplacer le bloc `const COMPONENTS = [...]` … `const REF_SELECTOR_NOTE = {...}` (`fidelity.mjs:50-200`) par :

```js
import { COMPARE_MANIFEST } from "../../apps/docs/src/lib/compare/manifest.mjs";

// Bench catalogue derived from the single manifest (no duplication).
const COMPONENTS = Array.from(
  new Set(Object.values(COMPARE_MANIFEST).flatMap((t) => Object.keys(t)))
);
const COMPONENT_THEMES = {}; // key → [themes that have it]
for (const theme of Object.keys(COMPARE_MANIFEST)) {
  for (const key of Object.keys(COMPARE_MANIFEST[theme])) {
    (COMPONENT_THEMES[key] ??= []).push(theme);
  }
}
const OUR_SELECTOR = Object.fromEntries(
  COMPONENTS.map((k) => {
    const entry = COMPARE_MANIFEST.dsfr?.[k] ?? COMPARE_MANIFEST.carbon?.[k];
    return [k, entry.ourSelector];
  })
);
const REF_SELECTOR = Object.fromEntries(
  Object.entries(COMPARE_MANIFEST).map(([theme, keys]) => [
    theme,
    Object.fromEntries(Object.entries(keys).map(([k, m]) => [k, m.refSelector])),
  ])
);
const REF_SELECTOR_NOTE = Object.fromEntries(
  Object.entries(COMPARE_MANIFEST).map(([theme, keys]) => [
    theme,
    Object.fromEntries(
      Object.entries(keys).filter(([, m]) => m.note).map(([k, m]) => [k, m.note])
    ),
  ])
);
```

NB : `componentsForTheme` (`fidelity.mjs:215`) doit déjà filtrer via `COMPONENT_THEMES` — vérifier qu'il lit bien la map dérivée (pas de changement de signature).

- [ ] **Step 2: Build the docs app (le manifeste doit compiler côté Vite aussi)**

Run: `npm --workspace apps/docs run check`
Expected: PASS (svelte-check vert ; le `.mjs` + `.d.ts` typent proprement).

- [ ] **Step 3: Run the oracle and confirm report parity**

Run: `cd /home/antoinefa/src/sent-tech-design-system && npm run docs:build && node tools/compare/fidelity.mjs`
Expected: rapport écrit ; **fidélité globale et couverture inchangées** vs l'avant-refactor (≈92 %, mêmes paires). Aucun warning « our element not found » nouveau.

- [ ] **Step 4: Commit**

```bash
git add tools/compare/fidelity.mjs
git commit -m "refactor(compare): oracle consumes the single manifest (ends map duplication)"
```

---

### Task 5: Sélection d'iframe par `data-compare-*` (corrige le bug `--component`)

Correction C6. Le bug : `rowIdx = themeComponents.indexOf(component)` puis iframe par position (`fidelity.mjs:674` + `locateRefFrame:712-734`).

**Files:**
- Modify: `apps/docs/src/routes/compare/+page.svelte` (lignes de rendu des `.cmp-row` ~411-420) — ajouter les attributs `data-compare-*`.
- Modify: `tools/compare/fidelity.mjs:671-734` (localiser par attribut, pas par index).

- [ ] **Step 1: Émettre les attributs sur chaque ligne du banc**

Sur l'élément `.cmp-row` (autour de `+page.svelte:411`), ajouter — en utilisant la clé d'entrée `e.key` et le thème de la colonne :

```svelte
<div class="cmp-row" data-compare-theme={theme.id} data-compare-component={e.key} data-compare-scenario={e.key}>
```

(En Lot 1, `scenario` = la clé de banc, cohérent avec la migration 1:1 du manifeste. La cellule de référence reste `.cmp-cell--ref iframe.cmp-frame` à l'intérieur de la ligne.)

- [ ] **Step 2: Localiser l'iframe par attribut dans l'oracle**

Remplacer `locateRefFrame(page, scope, idx)` et son appel par une version par sélecteur d'attribut. Dans `run()` (`fidelity.mjs:671-675`), remplacer :

```js
const rowIdx = themeComponents.indexOf(component);
const frame = await locateRefFrame(page, scope, rowIdx);
```

par :

```js
const frame = await locateRefFrame(page, theme, component);
```

et réécrire la fonction (`fidelity.mjs:712-734`) :

```js
/** Find the contentFrame of the ref iframe in the row tagged for (theme, component). */
async function locateRefFrame(page, theme, component) {
  const handle = await page.evaluateHandle(
    (t, c) => {
      const row = document.querySelector(
        `.cmp-row[data-compare-theme="${t}"][data-compare-component="${c}"]`
      );
      return row ? row.querySelector(".cmp-cell--ref iframe.cmp-frame") : null;
    },
    theme,
    component
  );
  const el = handle.asElement();
  if (!el) {
    await handle.dispose();
    return null;
  }
  const frame = await el.contentFrame();
  await handle.dispose();
  return frame;
}
```

- [ ] **Step 3: Prove the `--component` bug is fixed**

Run: `npm run docs:build && node tools/compare/fidelity.mjs --component Toggle --json`
Expected: la sortie JSON ne contient QUE des paires `Toggle` et la **référence mesurée est bien un `.fr-toggle__label` / `.bx--toggle__switch`** (avant le fix : l'iframe `rows[0]` = Button était mesurée → diff faux). Vérifier `components[].refSelector` = le sélecteur Toggle, pas Button.

- [ ] **Step 4: Full run still green**

Run: `node tools/compare/fidelity.mjs`
Expected: fidélité/couverture inchangées vs Task 4.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/routes/compare/+page.svelte tools/compare/fidelity.mjs
git commit -m "fix(compare): locate ref iframe by data-compare-* (fixes --component indexing bug)"
```

---

### Task 6: L'oracle écrit `compare-gaps.json` par merge

Correction C5/C8. `last-report.json` reste inchangé ; on **ajoute** la production du registre.

**Files:**
- Modify: `tools/compare/fidelity.mjs` (imports en tête + `main()` ~992-1003).

- [ ] **Step 1: Importer les helpers + le manifeste pour le stamp**

En tête de `fidelity.mjs` (à côté de l'import manifeste de Task 4) :

```js
import { readFile } from "node:fs/promises";
import { gapKey, manifestHash, mergeRegistry } from "../../apps/docs/src/lib/compare/registry.mjs";
```

(`writeFile`/`mkdir`/`join`/`dirname` sont déjà importés.)

- [ ] **Step 2: Construire les gaps oracle + merger + écrire, dans `main()`**

Après `const json = buildJson(raw, report, opts);` (`fidelity.mjs:996`), avant l'écriture des fichiers, ajouter :

```js
// Build the gap list from the scored rows (≠ and ~ are gaps; = is parity).
const REGISTRY_PATH = join(
  REPO_ROOT, "apps", "docs", "src", "lib", "compare", "compare-gaps.json"
);
const generatedAt = new Date().toISOString();
const oracleGaps = [];
for (const c of json.components) {
  const m = COMPARE_MANIFEST[c.theme]?.[c.component];
  if (!m) continue; // safety: only manifested pairs
  for (const r of c.rows) {
    if (r.status === "=") continue;
    oracleGaps.push({
      theme: c.theme,
      component: m.component,
      scenario: m.scenario,
      state: m.state,
      property: r.prop,
      ours: r.ours,
      ref: r.ref,
      delta: r.delta,
    });
  }
}
let existing = null;
try {
  existing = JSON.parse(await readFile(REGISTRY_PATH, "utf8"));
} catch {
  existing = null; // first seed
}
const registry = mergeRegistry(existing, oracleGaps, {
  manifestHash: manifestHash(COMPARE_MANIFEST),
  generatedAt,
  anatomyVersion: opts.anatomyVersion ?? null,
  dsVersion: opts.dsVersion ?? null,
  themeVersion: opts.themeVersion ?? null,
});
```

Puis, à côté de l'écriture de `last-report.json` (`fidelity.mjs:1003`), ajouter :

```js
await mkdir(dirname(REGISTRY_PATH), { recursive: true });
await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n", "utf8");
```

et compléter le log de fin (`fidelity.mjs:1008-1010`) avec :

```js
console.log(`  - ${REGISTRY_PATH} (${Object.keys(registry.entries).length} entrées)`);
```

- [ ] **Step 3: Run twice — idempotence + triage preservation**

```bash
npm run docs:build
node tools/compare/fidelity.mjs                                   # seed
# triage manuel simulé : passe une entrée en escape + note
node -e "const f='apps/docs/src/lib/compare/compare-gaps.json';const r=require('./'+f);const k=Object.keys(r.entries)[0];r.entries[k].status='escape';r.entries[k].note='test triage';r.entries[k].source='manual';require('fs').writeFileSync(f,JSON.stringify(r,null,2)+'\n')"
node tools/compare/fidelity.mjs                                   # re-run
node -e "const r=require('./apps/docs/src/lib/compare/compare-gaps.json');const k=Object.keys(r.entries)[0];if(r.entries[k].status!=='escape'||r.entries[k].note!=='test triage'){console.error('TRIAGE LOST');process.exit(1)}console.log('triage preserved OK')"
```
Expected: `triage preserved OK` (le merge n'écrase pas le triage humain — invariant C5).

- [ ] **Step 4: Verify**

Run: `npm run verify`
Expected: PASS (check + test + pack:smoke). Les nouveaux tests vitest passent ; rien de cassé.

- [ ] **Step 5: Commit**

```bash
git add tools/compare/fidelity.mjs
git commit -m "feat(compare): oracle writes compare-gaps.json by merge (preserves human triage)"
```

---

### Task 7: Seed initial du registre + push

**Files:**
- Create (généré) : `apps/docs/src/lib/compare/compare-gaps.json`

- [ ] **Step 1: Régénérer un registre propre depuis un run neuf**

```bash
rm -f apps/docs/src/lib/compare/compare-gaps.json
npm run docs:build
node tools/compare/fidelity.mjs
```
Expected: `compare-gaps.json` créé, toutes les entrées `source:oracle`, `status:open`, `manifestHash` renseigné.

- [ ] **Step 2: Sanity-check du JSON**

Run: `node -e "const r=require('./apps/docs/src/lib/compare/compare-gaps.json');console.log('entries',Object.keys(r.entries).length,'hash',r.manifestHash);console.log('sample',Object.keys(r.entries).slice(0,3))"`
Expected: nombre d'entrées > 0, `manifestHash` non vide, clés de la forme `theme/component/scenario/state/property`.

- [ ] **Step 3: Commit + push**

```bash
git add apps/docs/src/lib/compare/compare-gaps.json
git commit -m "chore(compare): seed initial compare-gaps registry from oracle run"
git pull --rebase && git push
```

---

## Self-Review

**1. Spec coverage** (corrections C1–C10) :
- C1 identité stable → Task 1 (`gapKey`) + Task 3 (component/scenario/state) ✔
- C2 sortie API npm → Task 2 (`reference-themes` docs-local) ✔
- C3 client-only + deep-link → **Lot 2** (hors de ce plan ; pas de UI compare ici) ✔ (documenté hors-périmètre Lot 1)
- C4 aucune mesure client → **Lot 2** (l'oracle reste seul juge ; Lot 1 ne touche pas l'UI) ✔
- C5 merge sans écrasement → Task 1 (`mergeRegistry`) + Task 6 (Step 3 prouve la préservation) ✔
- C6 sélection `data-compare-*` → Task 5 ✔
- C7 write-back durci → **Lot 3** (hors-périmètre Lot 1) ✔
- C8 CDN pinés + stamps → Task 2 (pin) + Task 6 (stamp manifestHash/versions) ✔
- C9 modèle scénario/état → Task 3 ✔
- C10 emplacement registre → Task 6 (`apps/docs/src/lib/compare/`) ✔

**2. Placeholder scan** : les seuls `…` sont dans `manifest.mjs` (Task 3) où la règle de migration + le patron + le test de parité **forcent** la complétion des 22×themes (le test échoue tant qu'une clé manque). `<DSFR_VERSION>`/`<CARBON_VERSION>` sont résolus par une commande concrète (Task 2 Step 1). Pas d'autre placeholder.

**3. Type consistency** : `gapKey` prend `{theme,component,scenario,state,property}` — mêmes noms dans `mergeRegistry`, l'oracle (Task 6), et le test. `mergeRegistry(existing, oracleGaps, stamp)` — signature identique partout. `COMPARE_MANIFEST[theme][key]` → `{component,scenario,state,ourSelector,refSelector,refMarkup,lang,note?}` cohérent entre `manifest.d.ts`, la dérivation oracle (Task 4) et le stamp (Task 6).

**Limite assumée (Lot 1)** : la sélection `data-compare-scenario` = clé de banc (migration 1:1) ; les scénarios multiples par composant arrivent en Lot 3. L'oracle écrit le registre mais aucune UI ne le lit encore — c'est voulu (socle testable seul).
