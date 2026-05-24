# `@sentropic/design-system-impeccable`

Moteur maison Sent Tech de lint de design-system, versionnée comme workspace npm (`packages/impeccable`).
L’objectif est d’offrir une vérification déterministe des anti-patterns principaux d’`impeccable`,
avec des règles alignées tokens DS et des erreurs orientées action.

## Installation

```bash
npm install @sentropic/design-system-impeccable
```

## CLI

```bash
impeccable-sent-tech <url | file.html | inline-html>
```

Options :
- `stdin` non supporté ; passer une URL, un fichier existant ou un bloc HTML inline.
- Sortie JSON standard sur `stdout`.
- Résumé court sur `stderr` (counts + top findings).

Code retour :
- `0` quand aucun finding
- `1` quand findings trouvés
- `2` en cas d’erreur d’exécution

## API programmatique

```ts
import { audit } from "@sentropic/design-system-impeccable";

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

## Architecture

- Exécution statique par défaut via `jsdom`.
- Règles en TypeScript, compilées en `dist/`.
- Sortie `AuditReport` JSON compatible intégration CI.

## Notes

- Cette version est une première base de parité fonctionnelle ; l’enrichissement de règles (`~10-15` au départ,
  puis ~`30-35`) est géré via WP7/8.
