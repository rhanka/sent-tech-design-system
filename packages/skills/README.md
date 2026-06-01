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

## API programmatique

```ts
import { audit } from "@sentropic/design-system-skills";

const report = await audit({
  kind: "file",
  value: "/abs/path/to/page.html"
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

## Architecture

- Exécution statique par défaut via `jsdom`.
- Règles en TypeScript, compilées en `dist/`.
- Sortie `AuditReport` JSON compatible intégration CI.

## Notes

- Cette version expose 25 règles déterministes, chacune reliée à un principe `design` et à un finding WP7.
  L’enrichissement vers ~`30-35` règles reste géré via WP7/8.
