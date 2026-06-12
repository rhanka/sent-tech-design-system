# Audit de parité tri-framework — thème Gouvernement du Québec (SDG)

Vérification que le thème `@sentropic/design-system-theme-quebec` v0.1.0 s'applique
**à l'identique en Svelte, React et Vue** et qu'il n'introduit aucune divergence
de token entre frameworks.

## Verdict

**Le thème Québec est parité-propre. 0 divergence de token entre Svelte, React et Vue.**

`--st-semantic-action-primary` vaut **`#095797`** (bleu PIV SDG) dans les trois
frameworks. L'injection est structurellement garantie : les CSS vars du thème sont
émises **une seule fois sur `:root`**, indépendamment du framework rendu — le
sélecteur de framework (`data-st-framework`) ne touche pas aux CSS vars du thème.

## Tableau de parité

| Token | Valeur compilée | Svelte | React | Vue |
|---|---|:---:|:---:|:---:|
| `--st-semantic-action-primary` | `#095797` | ✅ | ✅ | ✅ |
| `--st-semantic-action-primaryHover` | `#19406C` | ✅ | ✅ | ✅ |
| `--st-semantic-surface-inverse` | `#223654` | ✅ | ✅ | ✅ |
| `--st-semantic-action-danger` | `#cb381f` | ✅ | ✅ | ✅ |
| `--st-semantic-text-primary` | `#1c2025` | ✅ | ✅ | ✅ |
| `--st-semantic-text-link` | `#095797` | ✅ | ✅ | ✅ |
| `--st-semantic-border-interactive` | `#095797` | ✅ | ✅ | ✅ |
| `--st-field-style` | `outline` | ✅ | ✅ | ✅ |
| Police (font-sans) | `'Open Sans', system-ui, …` | ✅ | ✅ | ✅ |

*La colonne « Svelte / React / Vue » est structurelle (voir Méthode §3) : les
variables proviennent d'une source unique, pas d'une mesure par framework.*

## Méthode

### 1. Compilation du token (`compileTheme`)

Script Node (`/tmp/check-quebec-theme.mjs`) qui importe le package compilé :

```
@sentropic/design-system-theme-quebec/dist/index.js
@sentropic/design-system-themes/dist/index.js
```

Appel : `compileTheme(quebecTheme)` → CSS émis sous `[data-st-theme="quebec"]`.

**Résultats confirmés :**
- `--st-semantic-action-primary: #095797;` ✅
- `--st-semantic-surface-inverse: #223654;` ✅
- `--st-semantic-action-danger: #cb381f;` ✅
- `--st-semantic-text-primary: #1c2025;` ✅
- `--st-semantic-action-primaryHover: #19406C;` ✅
- Police `Open Sans` présente ✅

### 2. Analyse du layout docs (`apps/docs/src/routes/+layout.svelte`)

L'effet qui injecte le thème actif (lignes 165-176) :

```ts
$effect(() => {
  const STYLE_ID = "st-docs-active-theme";
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = compileThemeModes(activeTheme, { selector: ":root" });
  document.documentElement.setAttribute("data-st-theme", activeThemeId);
  localStorage.setItem(THEME_STORAGE_KEY, activeThemeId);
});
```

Cet effet est **indépendant du sélecteur de framework**. Le sélecteur de framework
(lignes 178-180) écrit uniquement `data-st-framework` sur `<html>` :

```ts
$effect(() => {
  framework.value;  // dépendance explicite
  framework.persist();  // → setAttribute("data-st-framework", value)
});
```

**Les deux effets sont découplés** : changer de Svelte → React → Vue ne retouche
pas le `<style>` portant les CSS vars du thème.

### 3. Confirmation dans le bundle docs (`apps/docs/build`)

Le JS compilé (`0.D3SG96Oi.js`) confirme le même découplage :

```js
// THEMES array contient vr (= quebecTheme) :
K = [ja, Wt, Ot, Nt, hr, vr]  // senttech, dsfr, carbon, airbus, canada, quebec

// Effet thème → écrit sur :root (indépendant du framework) :
textContent = et(e(He), { selector: ":root" })
document.documentElement.setAttribute("data-st-theme", e(q))

// Effet framework → écrit uniquement data-st-framework :
Re.value, Re.persist()  // → setAttribute("data-st-framework", …)
```

Le build statique des docs contient également `#095797` dans le bundle JS
(3 occurrences : palette `quebecColor.blue.piv`, token sémantique `action.info`,
et chevron SVG du `<select>`), confirmant que le thème est embarqué tel quel.

### 4. Test vitest de référence

`packages/theme-quebec/src/index.test.ts` — suite `"emits SDG brand colours and
fonts in the compiled variables"` — asserte explicitement :

```ts
expect(css).toContain("--st-semantic-action-primary: #095797;");
expect(css).toContain("--st-semantic-surface-inverse: #223654;");
expect(css).toContain("--st-semantic-action-danger: #cb381f;");
```

Ce test fait partie du CI du package : une régression de token serait détectée
avant publication.

## Note — token unique, injection framework-agnostique

Le design system Sentropic applique les thèmes **exclusivement via des variables
CSS sur `:root`**. Les composants Svelte, React et Vue lisent tous les mêmes
variables (`var(--st-*)`) sans connaissance du framework hôte. Il n'existe donc
**structurellement aucun vecteur de divergence inter-framework** pour les tokens
de thème : la parité est une propriété de l'architecture, non une coïncidence
empirique.

L'attribut `data-st-framework` (Svelte / React / Vue) ne pilote aucune variable
CSS de thème ; il ne sert qu'au rendu conditionnel de l'île correcte dans
`TabbedExample.svelte`. Les CSS vars du thème actif restent fixes quel que soit
l'onglet de framework sélectionné.

## Périmètre

- Package audité : `@sentropic/design-system-theme-quebec` v0.1.0
- Compilation vérifiée sur : `@sentropic/design-system-themes` v0.11.0
- Build docs vérifié : `apps/docs/build` (build statique pré-compilé)
- Date de l'audit : 2026-06-11
- Tokens-clés contrôlés : 9 (voir tableau)
- Divergences inter-framework : **0**
