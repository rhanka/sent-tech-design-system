# SOP — Cloner un thème de société (build agent brief)

Tu construis **un** package `packages/theme-<id>/` qui clone fidèlement le design d'une marque réelle. Méthode = **"anatomy clone"** : chaque valeur de token est **mesurée sur le CSS/les tokens officiels** de la marque, et sa source est documentée dans `MAPPING.md`. Toute valeur non sourcée est marquée `à confirmer` (inline `// à confirmer` + section dédiée du MAPPING).

## Règle d'or de périmètre
- Tu crées **UNIQUEMENT** le dossier `packages/theme-<id>/`. **NE TOUCHE À AUCUN fichier partagé** (`apps/docs/**`, `packages/themes`, `packages/tokens`, `url-state.ts`, `header-contract.test.ts`, lockfile). L'enregistrement dans les docs est fait **séparément** par l'orchestrateur (ds-scrap) en série, pour éviter les conflits de merge.
- Ton livrable est "vert" quand `npm --workspace packages/theme-<id> run test && run check && run build` passent.

## Template = theme-canada
Copie `packages/theme-canada/` comme base byte-for-byte, puis adapte. Lis aussi `packages/theme-quebec/` pour un 2e exemple, et `packages/theme-dsfr/src/index.ts` pour le bloc anatomy le plus riche (field filled-underline, focus outline, overrides composants).

## Fichiers à créer
| Fichier | Quoi |
|---|---|
| `package.json` | Copie celui de canada. Change `name`→`@sentropic/design-system-theme-<id>`, `description`, `repository.directory`→`packages/theme-<id>`. **Garde `version:"0.1.0"`**. **Pins exacts** : `dependencies` `@sentropic/design-system-themes` et `-tokens` à `"0.11.0"` ; `devDependencies` `typescript:"^5.9.3"`. Scripts: `build:"tsc -p tsconfig.json"`, `check:"tsc -p tsconfig.json --noEmit"`, `test:"vitest run src"`. |
| `tsconfig.json` | Copie celui de canada **à l'identique** (aucun changement). |
| `src/index.ts` | Le thème. Palette brute mesurée → `foundation` → `semantic` → `export const <id>Theme: TenantTheme`. |
| `src/index.test.ts` | Le gate (3 `it()`). Copie celui de canada, remplace les hex/fonts par tes valeurs mesurées. |
| `MAPPING.md` | Provenance : sources (URLs), table couleur→rôle, section `à confirmer`, typo, signatures anatomiques. |

NE crée PAS `dist/`, `README.md`, ni de `references` tsconfig. Les workspaces npm auto-découvrent `packages/*`.

## Couches de tokens (`tokens` = `{ foundation, semantic, component }`)
- `component` est **TOUJOURS** `createComponent(semantic, foundation)` — **jamais écrit à la main** (sauf escape hatch type airbus pour 1 leaf). C'est la règle non-négociable.
- `semantic` (toutes les clés obligatoires) : `surface{default,subtle,raised,inverse,overlay}`, `text{primary,secondary,muted,inverse,link}`, `border{subtle,strong,interactive}`, `action{primary,primaryHover,primaryText,secondary,secondaryHover,secondaryText,danger}`, `feedback{success,warning,error,info}`, `status{pending,processing,completed,failed}`, `data{category1..8}`.
- `foundation` scalaires toujours présents : `color{blue{10,60,80},cyan{10,50,70},slate{0,10,20,60,80,90},feedback{...}}`, `font{sans,display,mono}` (**noms de police uniquement, jamais de binaire**), `spacing{0,1,2,3,4,6,8,12,16}`, `radius{none,sm,md,lg,pill}`, `shadow{subtle,medium,floating}`, `motion{fast,normal,slow,easing}`, `z{header,toast,overlay,modal,chat}`.
- `foundation` anatomy (override **seulement ce qui diffère** de la base ; le reste retombe sur Sent Tech) : `borderWidth`, `borderStyle`, `density{sm,md,lg}`, `typography{control,field,label,link}`, `disabledOpacity`, `transition`, `cursor`, `iconSize`, **`focus`**, **`field`**, puis selon la marque `card`, `buttonSecondary`, `tabs`, `pagination`, `breadcrumb`, `alert`, `accordion`, `tag`, `badge`, `choice`, `search`, `toggle`.

## Les 2 plus gros leviers de fidélité
1. **`field.style`** : `"outline"` (boîte : fill blanc, bordure 1px, radius) **vs** `"filled-underline"` (fond gris + filet bas ; `underlineMode:"shadow"|"border"`, `fillBg`, `radiusTop/Bottom`). Mesure le vrai input. Redessine le chevron natif du `<select>` via `selectChevron` (data-URI SVG avec le hex de marque) + `selectAppearance:"none"` + `selectPaddingRight`.
2. **`focus.strategy`** : `"outline"|"ring"|"inset"|"double"` + `width`/`offset`/`color`. Encode la vraie *technique*, pas que la couleur.

## Méthode de mesure (ordre)
1. Palette brute → `const <id>Color = {...}` avec en commentaire la **variable source** (`--brand-...`). Groupe par famille (brand, accent, grey scale, system).
2. Mappe sur `foundation.color` + `semantic`. Pas d'équivalent (ex. pas de cyan) → famille la plus proche, **noté** `à confirmer`.
3. Typo : noms de police pour titres+corps (+mono). Renseigne `font.*` + les 4 `typography.*`.
4. Densité : hauteurs/paddings boutons & inputs mesurés → `density.{sm,md,lg}`.
5. Radii mesurés (carré vs arrondi). 6. `borderWidth/Style`. 7. `focus`. 8. `field`. 9. Overrides composants mesurés.

## Gate (commandes)
```
npm --workspace packages/theme-<id> run test    # vitest run src — 3 tests
npm --workspace packages/theme-<id> run check   # tsc --noEmit
npm --workspace packages/theme-<id> run build   # tsc -> dist (les docs en ont besoin)
```
`index.test.ts` (3 `it`) : (1) identité `toMatchObject({id,label,mode})` + `compileTheme` contient `[data-st-theme="<id>"]`, `--st-component-control-hoverBackground:`, `--st-field-style: <style>;` ; (2) anatomy `component.control toMatchObject({background,hoverBackground})` (tes hex), `component.tabs.activeText` ; (3) vars compilées : `--st-semantic-action-primary: <hex>;`, `--st-semantic-text-primary: <hex>;`, `--st-semantic-action-danger:`, `--st-semantic-surface-inverse:`, + chaque nom de police présent. **Ces hex/fonts sont le verrou de régression — mets tes valeurs mesurées.**

## MAPPING.md (format canada/québec)
Titre + note de scope (tokens publics + noms de police seulement, licence si pertinent) → `## Sources` (URLs) → `## Colour mapping` (table rôle→token source→hex) → `### À confirmer` (toute valeur dérivée/non mesurée) → `## Typography` → `## Signatures anatomiques` (field, radius, focus, boutons, tabs, pagination, chevron, densité) → `## Asset officiel` (chemin du logo, "ne pas redessiner").

## QA (avant de rendre)
- Relis `index.ts` contre `MAPPING.md` : chaque `// commentaire` = une vraie variable source ; tout dérivé est dans `à confirmer`.
- WCAG AA sur blanc si tu assombris un `feedback.warning`.
- Confirme le gate vert (3 tests + check + build).
Rends un résumé : id, label, primary hex, font, field.style, focus.strategy, sources, et la liste `à confirmer`.
