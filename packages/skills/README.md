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
impeccable-sent-tech <url | file.html | inline-html>
design audit <url | file.html | inline-html>
```

Options :
- `design audit <target>` est le contrat WP8 V1 pour les harness agents.
- `impeccable-sent-tech <target>` reste supporté en rétrocompatibilité.
- `stdin` non supporté ; passer une URL, un fichier existant ou un bloc HTML inline.
- Sortie JSON standard sur `stdout`.
- Résumé court sur `stderr` (counts + top findings).

Code retour :
- `0` quand aucun finding
- `1` quand findings trouvés
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

## Architecture

- Exécution statique par défaut via `jsdom`.
- Règles en TypeScript, compilées en `dist/`.
- Sortie `AuditReport` JSON compatible intégration CI.

## Notes

- Cette version est une première base de parité fonctionnelle ; l’enrichissement de règles (`~10-15` au départ,
  puis ~`30-35`) est géré via WP7/8.
