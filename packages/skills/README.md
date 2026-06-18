# `@sentropic/design-system-skills`

Moteur maison Sent Tech de lint de design-system, versionnée comme workspace npm (`packages/skills`).
L’objectif est d’offrir une vérification déterministe des anti-patterns principaux d’`impeccable`,
avec des règles alignées tokens DS et des erreurs orientées action.

## Installation

```bash
npm install @sentropic/design-system-skills
```

## CLI

```bash
design audit <url | file.html | inline-html>
design check <url | file.html | inline-html> --tech
sentech-design audit <url | file.html | inline-html>
```

Options :
- `design audit <target>` est le contrat WP8 V1 pour les harness agents.
- `design` et `sentech-design` sont les binaires publiés par le package.
- `design check <target> --fail-under <score>` active un gate qualité 0-100. En mode technique, `<target>` peut être un fichier HTML, du HTML inline, une URL ou un dossier de build statique contenant des pages `.html`.
- `design check <target> --human` retourne une revue heuristique déterministe (charge cognitive, structure, signaux a11y) ; ce n'est pas une simulation IA.
- `design init --extract` génère `DESIGN.md` à partir de tokens CSS réels.
- `design build <feature>` génère un squelette Svelte 5 réel ; `--propose`, `--promote` et `--global` sont explicitement expérimentaux et retournent `2`.
- `design polish --motion` et `--essence` sont déterministes ; les passes créatives `--bolder`, `--quieter`, `--spark`, `--charm`, `--lucid` sont agentiques et retournent `2` quand elles sont demandées seules.
- `stdin` non supporté ; passer une URL, un fichier existant ou un bloc HTML inline.
- Sortie JSON standard sur `stdout`.
- Résumé court sur `stderr` (counts + top findings).

Code retour :
- `0` quand aucun finding
- `1` quand findings trouvés
- avec `--fail-under`, `0` quand le score est supérieur ou égal au seuil, `1` sinon
- `2` en cas d’erreur d’exécution

## Audit visuel headless (`audit:visual`)

`design audit` est **statique** (JSDOM, aucun layout calculé) : il ne voit pas les bugs **visuels**.
`design audit:visual` pilote un **Chromium headless réel** (Playwright) sur les pages docs rendues,
calcule les rects/styles in-page et détecte des bugs visuels, avec **screenshots** pour double-challenge.

```bash
# Build docs local (apps/docs/build), buildé automatiquement s'il manque
design audit:visual --pages button,calendar,copy-button --out ./visual-audit-out

# Dossier de build statique explicite, ou URL déjà servie (--pages requis en mode URL)
design audit:visual apps/docs/build --locale fr
design audit:visual https://docs.example.com --pages button --fail-under 80
```

Prérequis : `playwright-core` (devDependency, chargée dynamiquement) **et** un Chrome/Chromium système. `playwright-core` ne télécharge aucun navigateur — l'audit utilise le Chrome système (`google-chrome`/`chromium`), auto-détecté :

```bash
# Chrome/Chromium déjà présent sur la plupart des postes et runners CI.
# Sinon : apt-get install -y chromium  (ou installer Google Chrome)
```

Options : `--out <dir>` (défaut `./visual-audit-out`), `--locale <fr|en>` (défaut `fr`),
`--pages <glob>` (slugs séparés par des virgules, ex. `button,chart-*`), `--headful` (debug),
`--fail-under <score>`. Headless par défaut.

Heuristiques (déterministes, exécutées in-page) :
- `visual-text-overlap` — paires de textes lisibles qui se chevauchent.
- `visual-i18n-leak` — chaîne d'UI anglaise visible sur une page FR (ex. `Submit`, `Copied`) ; le code
  documenté (`<code>`/API tables), le chrome docs et la prose longue sont exclus ; une passe
  d'interaction clique les boutons « copier » pour révéler le feedback (`copiedLabel`).
- `visual-control-incoherence` / `visual-control-misaligned` — hauteurs/baselines de contrôles incohérentes dans un groupe.
- `visual-grid-broken` — cellules de grille superposées (ex. Calendar).
- `visual-overflow` / `visual-clipping` — débordement de page ou contenu coupé (overflow caché).

La visibilité réelle est testée via `Element.checkVisibility()` (gère `content-visibility`, ancêtres
masqués comme un `<details>` replié), et l'audit est cadré au contenu composant (`.docs-page`) afin de
ne pas signaler le chrome docs (la sidebar liste légitimement des noms de composants anglais).

Sortie : un screenshot pleine page par page dans `--out`, un rapport `visual-audit-report.json`
(findings par page : `severity`, sélecteur, message FR), un résumé console (score, `--fail-under`).
Code retour comme les autres commandes (`0`/`1`, ou seuil `--fail-under`, `2` en cas d'erreur).

## API programmatique

```ts
import { audit, visualAudit } from "@sentropic/design-system-skills";

const report = await audit({
  kind: "file",
  value: "/abs/path/to/page.html"
});

// Audit visuel headless (nécessite playwright-core + un Chrome système)
const visual = await visualAudit({
  siteDir: "/abs/path/to/apps/docs/build",
  outDir: "./visual-audit-out",
  locale: "fr",
  pages: ["button", "calendar"],
  headful: false
});
```

Ou `kind: "url"` / `kind: "html"` pour un bloc HTML brut.

## Règles par défaut (actuelles)

- `no-bare-hex` — interdit les hexadécimales de couleur en source inline/style.
- `no-em-dash` — interdit les em dashes (`—`) / doubles tirets (`--`) dans la copy.
- `side-tab-on-rounded` — bloque `border-left` notable + radius non nul dans la même surface.
- `single-font` — alerte quand une seule famille typographique principale est utilisée.
- `line-length-cap` — signale les blocs de texte denses sans borne de largeur explicite.
- `touch-target-44` — cible minimale interactive `<44px` sur éléments interactifs en inline style.
- `heading-hierarchy` — signale les sauts de niveaux de titres qui cassent la structure de page.
- `underline-hardcoded-border` — signale les bordures inférieures hardcodées qui contournent les tokens.
- `cramped-padding` — signale les surfaces de contenu avec padding non tokenisé inférieur à 8px.
- `motion-subtle` — exige motion tokenisée et garde `prefers-reduced-motion`.
- `padding-scale-token` — signale `padding`/`margin`/`gap` hors grille 4px lorsqu'ils ne sont pas tokenisés.
- `rail-vs-radius-consistency` — évite de mélanger identité de rail latéral et surface arrondie.
- `grid-variance` — détecte les grilles de cartes répétitives sans variance ni token de layout.
- `contrast-token-pair` — calcule les paires texte/fond hex et signale les contrastes insuffisants.
- `typography-scale-token` — signale `font-size`/`line-height` hors échelle lorsqu'ils ne sont pas tokenisés.
- `no-pure-black-white` — signale `#000`/`#fff` et équivalents bruts sur les propriétés de couleur.
- `raw-color-value` — signale les fonctions couleur locales (`rgb`, `hsl`, `oklch`, etc.) hors tokens.
- `font-family-token` — exige que les familles typographiques produit passent par des tokens Sent Tech.
- `display-body-font-pair` — détecte la même famille pour les rôles display et body.
- `line-length-max-width` — signale les bornes de lecture trop larges même avec `max-width`.
- `h1-inline-badge` — signale les badges/tags placés dans un titre H1.
- `status-indicator-label` — signale les indicateurs de statut sans libellé explicite.
- `redundant-url-label` — signale les liens dont le texte répète l'URL brute.
- `auto-fit-card-grid` — détecte les grilles auto-fit de cartes répétitives hors token de layout.
- `focus-visible-ring` — signale la suppression d'outline sans focus-visible tokenisé.
- `viewport-zoom` — signale les métas viewport bloquant/réduisant excessivement le zoom page.
- `navsystem-one-primary-action` — signale plus d'une action primaire explicite dans une même surface NavSystem.
- `navsystem-no-interactive-in-option` — signale un contrôle interactif imbriqué dans une option/listbox.
- `navsystem-color-state-only` — signale un marqueur couleur/état sans libellé d'état explicite.
- `navsystem-depth-hierarchy` — signale une profondeur rail/drawer/panel/menu au-delà du contrat statique.
- `navsystem-search-fill-affordance` — signale une recherche de drawer/panel sans affordance de remplissage explicite.

## Architecture

- Exécution statique par défaut via `jsdom`.
- Règles en TypeScript, compilées en `dist/`.
- Sortie `AuditReport` JSON compatible intégration CI.

## Notes

- Cette version expose 32 règles déterministes, chacune reliée à un principe `design` et à un finding WP7/WP23.
  L’enrichissement vers ~`30-35` règles reste géré via WP7/8.
