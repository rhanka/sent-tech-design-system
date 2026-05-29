# Skill — Mapper un design system tiers → thème Sentropic

Procédure rodée pour produire un `TenantTheme` Sentropic à partir d'un design
system externe. Distillée des deux premiers mappings réels :
`packages/theme-dsfr` (DSFR) et `packages/theme-carbon` (IBM Carbon).

## Quand l'utiliser

Quand on veut consommer le DS Sentropic mais sous l'identité visuelle d'un DS
tiers (client ou standard public). Sortie : un package
`@sentropic/design-system-theme-<id>` exportant `const <id>Theme: TenantTheme`,
compilable en CSS via `compileTheme` / `compileThemeStyleTag`.

## Contrat cible

`TenantTheme = { id, label, mode: "light"|"dark", tokens: TokenTree }` (voir
`packages/themes/src/schema.ts`). `tokens` doit être **complet** : `compileTheme`
aplatit tout l'arbre et la couche `component` référence `semantic`/`foundation`.

## Recette de correspondance (rôle Sentropic ← source tierce)

| Cible Sentropic | Source tierce typique |
|---|---|
| `semantic.action.primary` + `text.link` + `border.interactive` + `foundation.color.blue.60` | **couleur de marque primaire** (Bleu France `#000091`, Carbon Blue 60 `#0f62fe`) |
| `foundation.color.blue.10/80`, `action.secondary` | teintes claires/foncées de la primaire |
| `foundation.color.slate.0..90` + `surface.{default,raised,subtle,inverse}` + `text.{primary,secondary,muted,inverse}` + `border.{subtle,strong}` | **rampe de gris/neutres** du DS (clair→foncé) |
| `foundation.color.feedback.*` + `semantic.feedback.*` + `semantic.status.*` + `action.danger` | couleurs **système** success/warning/error/info |
| `foundation.color.cyan.*` (slot accent) | famille accent/décorative secondaire (sinon « à confirmer ») |
| `semantic.data.category1..8` | **palette data-vis catégorielle** du DS (Carbon en a une ; DSFR non → proposition « à confirmer ») |
| `foundation.font.sans` (+ `display`), `font.mono` | police(s) de marque (nom seulement — **ne jamais embarquer un binaire à licence restreinte**, ex. Marianne) |
| `foundation.spacing.*` | échelle d'espacement du DS, **px-matchée** clé à clé |
| `foundation.radius.*` | esthétique des coins (DSFR carré → `0` ; sinon valeurs publiées) |

## Branches héritées (non spécifiques à la marque)

- `foundation.z` : ordre de z-index, structurel → **garder la base Sentropic**.
- `component` : **réutiliser tel quel** depuis `@sentropic/design-system-themes`.
  Il câble les rôles composant sur `semantic`/`foundation`, donc il hérite
  automatiquement des valeurs du thème (pattern forge/entropic/dsfr/carbon).

## Règles d'honnêteté (non négociables)

- **Citer les sources publiques** (URLs des tokens) dans `MAPPING.md`.
- **Ne jamais halluciner** une valeur. Si une branche n'est pas tokenisée
  publiquement (souvent `shadow`, `motion`, `radius`, `status`, palette data-vis),
  marquer **« à confirmer »** dans `MAPPING.md` plutôt que d'inventer.
- Pour les paires light/dark (DSFR), prendre le côté correspondant au `mode`.
- **Rien de privé dans git** : pour un DS client (Airbus/Scalian/CGI), les tokens
  source et le package restent hors dépôt (mémoire / chemin gitignoré) ; seuls
  les DS publics (DSFR, Carbon) sont committés.

## Scaffold du package

Miroir de `packages/themes` :
- `package.json` : `@sentropic/design-system-theme-<id>`, `0.1.0`, ESM,
  `publishConfig.access=public`, `repository.directory`, `main`/`types`/`exports`
  → `dist`, `files:["dist"]`, deps `@sentropic/design-system-themes` +
  `-tokens` (versions alignées au repo), devDep `typescript`.
- `tsconfig.json` : copie de `packages/themes/tsconfig.json`.
- `src/index.ts` : `export const <id>Theme: TenantTheme = { id, label, mode, tokens: { foundation, semantic, component } }`.
- `MAPPING.md` : table de correspondance + sources + « à confirmer ».

## Vérification

```bash
npm install            # capte le workspace packages/* neuf
npm run build          # tsc en ordre de deps (tokens → themes → theme-<id>)
node --input-type=module -e "import {compileThemeStyleTag} from '@sentropic/design-system-themes'; import {<id>Theme} from '@sentropic/design-system-theme-<id>'; console.log(compileThemeStyleTag(<id>Theme).length)"
```

## QA de fidélité — OBLIGATOIRE et SYSTÉMATIQUE (gate avant publication)

Un mapping n'est PAS « fait » parce qu'il compile et change les couleurs. Il
est fait quand, **composant par composant**, notre rendu est confronté au **vrai
composant officiel** du DS source et que chaque écart est soit fermé (token),
soit justifié (échappement). Cette passe est un **gate** : pas de publication
tant qu'il reste des écarts non justifiés.

**Procédure (pour CHAQUE composant mappé) :**
1. **Confronter au réel** : afficher notre composant mappé À CÔTÉ du vrai
   composant officiel (CSS+markup d'origine, en iframe isolée). Banc de référence :
   `apps/docs/src/routes/compare/` (notre DS mappé vs DS officiel, par état
   default/hover/focus/disabled, dans la langue native du DS).
2. **Mesurer les écarts** : lire les **styles calculés** des deux côtés (pas les
   variables) — `bg`, bordures **par côté** (top/right/bottom/left), radius,
   police/poids/taille, paddings, hauteur, focus (technique), décoration. Ne
   jamais signer « à l'œil » seul.
3. **Consigner** chaque écart dans la matrice (`docs/ds-theme-anatomy-matrix.md`)
   et dans `MAPPING.md` : propriété, valeur ours vs réel, statut.
4. **Résoudre** : soit **fermer** par token (étendre l'anatomie si la dimension
   manque), soit **justifier** comme échappement gouverné (propriétaire,
   justification, date, critère de retrait).
5. **Gate** : refuser le tag/publish s'il reste un écart **non justifié**.

**Pièges d'anatomie déjà identifiés (à vérifier d'office) :**
- **Style de champ** : DSFR et Carbon rendent les inputs **remplis + bordure
  basse seule** (pas un encadré). Si l'anatomie n'exprime que des bordures
  uniformes, l'input ne peut pas être fidèle → dimension `field.style`
  (`outline` | `filled-underline`) + bordures par côté + `bg` de champ.
- **Focus** : différence de **technique** (outline / box-shadow / inset), pas de
  valeurs (cf. `focus.strategy`).
- **Soulignement de lien** : conditionnel/animé (DSFR) → souvent échappement.
- **Langue** : comparer dans la langue native du DS des deux côtés (sinon faux
  écart de contenu).

## Publication

Gate QA de fidélité **passé** d'abord (ci-dessus). Ensuite, comme le moteur
`skills` : tag `theme-<id>-v<version>` + workflow dédié, ou intégrer au pipeline.
Premier publish d'un package neuf → Trusted Publishing à configurer côté npm
(clé 2FA utilisateur), puis OIDC pur.

## Exemples rodés

- `packages/theme-dsfr/` + `packages/theme-dsfr/MAPPING.md`
- `packages/theme-carbon/` + `packages/theme-carbon/MAPPING.md`
