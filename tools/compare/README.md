# `tools/compare` — CLI de fidélité pixel-perfect par bord

Mesure et **diffe bord par bord** NOS composants mappés (`@sentropic/design-system-svelte`
sous un thème importé) contre les **vrais composants officiels** DSFR / Carbon, à
partir de la page de banc `apps/docs/src/routes/compare/`.

Chaque côté est mesuré via **styles calculés réels** (computed styles) dans Chrome
headless ; aucune valeur n'est inventée. Le côté officiel est rendu dans une
`<iframe srcdoc>` qui charge le CSS officiel depuis le CDN (réseau requis).

## Prérequis

- **Chrome système** présent à `/usr/bin/google-chrome` (piloté par
  `puppeteer-core` — aucun navigateur n'est téléchargé).
- **Réseau** ouvert vers `cdn.jsdelivr.net` (CSS officiel DSFR/Carbon).
- Le **build docs statique** (`apps/docs/build/compare.html`). S'il est absent,
  la CLI bascule sur le serveur dev `vite`. Pour (re)générer le build :

  ```bash
  npm run --workspace apps/docs build
  ```

La CLI démarre elle-même un serveur HTTP statique sur **le port 4322**
(jamais 5173), sert `apps/docs/build`, mesure, puis arrête le serveur.

Le port peut être forcé via `--port` (ou `FIDELITY_PORT`), et la CLI retombe
automatiquement sur un port éphémère si le port choisi est déjà occupé / interdit.

## Usage

```bash
# Tout (les 2 thèmes × 7 composants)
node tools/compare/fidelity.mjs --port 4322

# Laisser la CLI choisir un port disponible (fallback recommandé en environnement verrouillé)
node tools/compare/fidelity.mjs --port 0

# Filtrer
node tools/compare/fidelity.mjs --theme dsfr
node tools/compare/fidelity.mjs --theme carbon --component Button

# Dater le rapport (sinon placeholder, jamais Date.now dans le rendu)
node tools/compare/fidelity.mjs --date 2026-05-28

# Dump JSON brut sur stdout
node tools/compare/fidelity.mjs --json

# Gate CI optionnel : code retour 1 si fidélité globale < seuil
node tools/compare/fidelity.mjs --fail-under 70
```

Options : `--theme dsfr|carbon`, `--component Button|Input|Textarea|Select|Link|Card|Tabs`,
`--host <hostname>`, `--port <number>`, `--json`, `--date YYYY-MM-DD`,
`--fail-under <pct>`, `--keep-server` (debug), `--help`.

Code retour **0** par défaut (c'est un rapport). `--fail-under` est le seul cas de
sortie non nulle.

## Métriques (par élément, NOUS + RÉFÉRENCE)

Par **bord / coin / côté**, séparément :

- bordure top/right/bottom/left : `width`, `style`, `color` (rgb normalisé)
- `border-radius` aux 4 coins (topLeft, topRight, bottomRight, bottomLeft)
- `padding` top/right/bottom/left
- boîte : `width`, `height` (`getBoundingClientRect`)
- typo : `font-family` (1er token), `font-size`, `font-weight`, `line-height`,
  `letter-spacing`, `text-transform`, `text-decoration-line`
- couleurs : `background-color`, `color`
- focus : `el.focus()` puis `outline-width/style/color`, `outline-offset`,
  `box-shadow` (focus rendu ensuite).

## Diff & statuts

Comparaison **NOS valeurs vs RÉFÉRENCE**. Couleurs normalisées en `rgb(r,g,b)`.

| Statut | Sens |
|---|---|
| `=` | identique |
| `~` | proche, dans la tolérance (**±1px** longueurs ; **distance RGB ≤ 12** couleurs) |
| `≠` | écart net |

Fidélité = % de propriétés `=` + `~`.

Affinages d'honnêteté du diff (pour ne mesurer que la fidélité **visible**) :
- Un bord **invisible des deux côtés** (largeur 0 **ou** couleur totalement
  transparente) → `style`/`color` traités `=` (ex. notre « 1px transparent » vs
  DSFR « 0px none », visuellement identiques).
- Si la boîte de la référence **s'effondre à 0** alors qu'elle est stylée (markup
  Carbon `<li>` d'onglets), `box width/height` sont exclus du diff (pas de faux `≠`).

## Sorties

- `docs/compare-fidelity-report.md` — rapport humain : par thème → par composant →
  tableau « Propriété/Bord | Nous | Référence officielle | Δ/statut », score de
  fidélité par composant + récap global (écarts nets restants). En-tête : date,
  navigateur/version, tolérances, URL mesurée.
- `tools/compare/last-report.json` — données brutes structurées (réusage CI),
  avec les mesures `raw.ours` / `raw.ref` de chaque côté.

## Véracité du rendu

Avant de produire le rapport, la CLI **vérifie que les mesures sont réelles** :
boîtes non nulles, référence réellement stylée (le CSS CDN a chargé — padding /
bordure / typo distinctifs présents). Elle **réessaie** (jusqu'à ~12 s par
référence) tant que le CSS officiel n'est pas appliqué, et **signale** dans le
rapport (section « Avertissements ») toute référence non stylée plutôt que de
produire un faux « identique ».
