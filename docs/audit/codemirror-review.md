# Revue adversariale — package `@sentropic/design-system-codemirror`

Reviewer adversarial (Opus 4.8), lecture seule. Cible : `packages/codemirror/src/{index,theme}.ts`, `theme.test.ts`, `package.json`. Thème CodeMirror basé tokens DS (`EditorView.theme` + `HighlightStyle` via `@lezer/highlight`).

Tokens vérifiés contre `packages/themes/css/sent-tech.css` (720 lignes, sélecteur unique `[data-st-theme="sent-tech"]`). Tags Lezer vérifiés contre `node_modules/@lezer/highlight/dist/index.d.ts`. Tests exécutés : **5/5 passent** (`npx vitest run src`).

## Synthèse sévérité

| Sévérité | Nb |
|---|---|
| Critique | 1 |
| Majeur | 2 |
| Mineur | 4 |
| Info / positif | 3 |

## Top-5 (tableau)

| # | Sujet | Constat | Sévérité | Correction |
|---|---|---|---|---|
| 1 | **Contraste syntaxe (palette data-viz sur texte)** | Le mapping syntaxe réutilise la palette `--st-semantic-data-category1..8` (Tableau-10), conçue pour des **aplats de graphes**, pas du **glyphe de texte fin**. Contrastes WCAG calculés sur `surface-default #ffffff` : cat6 jaune `#EDC948` = **1.61:1** (functions/variableName + `cm-searchMatch`), cat8 rose `#FF9DA7` = **1.98:1** (meta), cat4 teal `#76B7B2` = **2.29:1** (typeName/className), cat2 orange `#F28E2B` = **2.42:1** (**toutes les strings**). cat3 3.68, cat5 3.16, cat7 3.42 < 4.5:1. **Seul cat1 (4.55:1) passe l'AA texte.** 4 catégories échouent même le seuil non-texte 3:1. En pratique le code est illisible (jaune/rose/teal/orange quasi invisibles sur blanc). | **Critique** | Ne pas mapper la syntaxe sur les couleurs data-viz. Introduire un set de tokens dédié `--st-semantic-code-*` (keyword/string/number/comment/…) calibré ≥ 4.5:1 sur `surface-default`, ou au minimum assombrir cat2/cat4/cat6/cat8 pour le rôle texte. Vérifier aussi sur `surface-subtle #f8fafc` (activeLine + gutters), encore pire. |
| 2 | **Flag `{dark}` mensonger — aucune variante dark dans les tokens** | `makeEditorTheme(dark)` passe `{ dark }` à `EditorView.theme` (déclare le thème comme sombre côté CM), mais **toutes** les valeurs restent `var(--st-...)`. Or `sent-tech.css` (idem `forge.css`/`entropic.css`) n'a **qu'un** bloc `[data-st-theme="sent-tech"]` avec des valeurs **codées en clair** (`surface-default #ffffff`, `text-primary #0f172a`) : aucun `prefers-color-scheme`, aucun `[data-theme="dark"]`, aucun `.dark`, aucun override de catégorie. `sentTechCodeMirror({ dark: true })` produit donc un éditeur **fond blanc + texte sombre** mais marqué « dark » : CM applique alors ses heuristiques dark (ex. styles d'autocomplete/scrollbar) sur un fond clair → incohérence visuelle. Le test « dark » ne valide que `length ≥ 2`, jamais le rendu. | **Majeur** | Soit (a) supprimer l'option `dark` tant qu'aucun token dark n'existe dans le DS, soit (b) livrer d'abord un set de tokens dark (`[data-st-theme][data-theme="dark"]`) et faire pointer `var()` dessus. Documenter que le flag ne change que le hint CM, pas les couleurs (actuellement le JSDoc laisse croire l'inverse). |
| 3 | **Les fichiers de test sont publiés dans le package** | `tsconfig.json` a `include: ["src/**/*.ts"]` sans exclusion, donc `tsc` compile `theme.test.ts` → `dist/theme.test.js`, `.d.ts`, `.js.map` (vérifié présents dans `dist/`). `package.json#files: ["dist"]` les embarque tels quels dans le tarball npm. Pollution du package publié + dépendance implicite à `vitest`/`@codemirror/view` dans des fichiers livrés. | **Mineur** | Ajouter `"exclude": ["src/**/*.test.ts"]` au tsconfig (ou un `tsconfig.build.json` dédié au build), et/ou restreindre `files` à `dist/index.*` + `dist/theme.*`. Re-vérifier `npm pack --dry-run`. |
| 4 | **Tags Lezer manquants vs périmètre demandé** | Demandé : `macroName`, `escape`, `link/url`. Constat : `tags.macroName` **non mappé** (existe dans Lezer, utile C/Rust → reste couleur par défaut), `tags.escape` **non mappé** (séquences `\n`, `\u…` dans les strings — non distinguées), `tags.url` **non mappé** (`tags.link` l'est, mais l'URL brute markdown reste neutre). Par ailleurs `attributeValue` est mappé sur cat2 (string) alors que le commentaire d'en-tête liste « string/character/attributeValue » — cohérent, mais la doc mentionne aussi `tagName→cat1` ce qui colore les balises HTML comme des keywords (choix défendable, à valider visuellement). | **Mineur** | Ajouter `{ tag: tags.macroName, color: v.cat6 }`, `{ tag: tags.escape, color: v.cat3 }` (ou cat8), `{ tag: tags.url, color: v.fgSecondary, textDecoration: "underline" }`. |
| 5 | **Sélecteur `&.cm-readonly` inexistant côté CM** | `"&.cm-readonly .cm-content"` : la classe `cm-readonly` **n'est pas émise** par `@codemirror/view` (vérifié : 0 occurrence dans `node_modules/@codemirror/*`). CM gère le read-only via le facet `EditorView.editable`/attribut `contenteditable`, pas une classe. Ce bloc est du **CSS mort** : le fond `bgSubtle` en lecture seule ne s'appliquera jamais. | **Mineur** | Cibler `.cm-content[contenteditable='false']` (ou exposer une classe applicable par l'hôte), ou retirer le bloc pour éviter de fausses garanties. |

## Détails complémentaires (hors top-5)

**Positifs / corrects :**
- **Tokens structurels tous réels** : `--st-font-mono` ✓ (`'SFMono-Regular', Consolas, …`), `--st-semantic-{surface,text,border}-*` ✓, `--st-semantic-action-primary` ✓, `--st-semantic-action-primaryText` ✓ (`#ffffff`), `--st-semantic-text-link` ✓, `--st-radius-{sm,md}` ✓, `--st-spacing-{1,2,3}` ✓, `--st-shadow-medium` ✓, les 8 `--st-semantic-data-category1..8` ✓. **Aucune `var()` inexistante détectée.**
- **Tous les tags Lezer référencés existent** (docComment, lineComment, blockComment, processingInstruction, moduleKeyword, controlKeyword, definitionKeyword, operatorKeyword, derefOperator, attributeValue/Name, propertyName, typeOperator, self, modifier, annotation, strikethrough, angleBracket, content, unit, character, regexp, invalid, heading/strong/emphasis/link, function()/definition()/special()). Bon usage des combinateurs `tags.function(tags.variableName)`, `tags.definition(tags.function(tags.variableName))`.
- **Couverture des sélecteurs CM structurels** quasi complète et avec les bons noms réels : `cm-content`, `cm-gutters`, `cm-cursor/cm-dropCursor`, `cm-selectionBackground` (+ `::selection` natif), `cm-activeLine/cm-activeLineGutter`, `cm-matchingBracket/cm-nonmatchingBracket`, `cm-tooltip(-autocomplete)`, `cm-panels(.cm-panels-top)`, `cm-searchMatch(.cm-searchMatch-selected)`, `cm-foldPlaceholder`, `cm-scroller`, `cm-lineNumbers/cm-foldGutter .cm-gutterElement`. Noms vérifiés contre `@codemirror/view` et `@codemirror/language`.
- **Packaging** : `exports`/`types`/`main` ESM-only cohérents, `sideEffects: false` correct (pas de CSS importé), `peerDependencies` (`@codemirror/{view,state,language} ^6`, `@lezer/highlight ^1`) propres et présents en devDeps. `tsconfig.base` : `module ESNext`, `moduleResolution Bundler`, `declaration` + `declarationMap` → `.d.ts` générés ✓.

**Réserves additionnelles :**
- **Commentaires en italique low-contrast garanti combiné #1+#5** : `cm-activeLine` et `cm-gutters` posent du texte syntaxique sur `surface-subtle #f8fafc`, ce qui dégrade encore tous les ratios du #1. Les comments (`text-secondary` 7.58:1) et punctuation (`text-muted` 4.76:1) restent OK, mais en **italique** la lisibilité du code mono baisse.
- **`cm-searchMatch` sur cat6 (jaune, 1.61:1)** : double peine, le surlignage de recherche est lui-même illisible.
- **Pas de styles scrollbar/`cm-line`/`cm-placeholder`/`cm-gutterElement` actif vide** : acceptable pour un v0.1.0, mais à noter si parité avec les autres packages DS est visée.
- **Tests faibles** : aucun test ne vérifie qu'une couleur résolue correspond à un token, ni le contraste, ni que le flag `dark` change quoi que ce soit. Les assertions se limitent à « tableau non vide » + « éléments DOM montés ». Recommander un test snapshot du spec de thème et un test de présence de `var(--st-…)` réels.

## Retour synthèse

- **Sévérités** : Critique 1, Majeur 2, Mineur 4, Info/positif 3.
- **Top-3** :
  1. **(Critique)** Palette data-viz utilisée pour la syntaxe → contrastes catastrophiques (cat6 1.61:1, cat8 1.98:1, cat4 2.29:1, cat2/strings 2.42:1) ; seul le bleu passe l'AA. Code illisible sur fond blanc. → tokens `--st-semantic-code-*` dédiés.
  2. **(Majeur)** Flag `{dark}` cosmétique/mensonger : aucune variante dark n'existe dans les tokens DS, l'éditeur « dark » reste fond blanc/texte sombre marqué dark. → retirer l'option ou livrer un set dark.
  3. **(Mineur, mais embarrassant)** Les fichiers `theme.test.*` sont compilés et publiés dans le tarball npm. → exclure les tests du build.
