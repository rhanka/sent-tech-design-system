# Sent Tech Design System

Design system Svelte pour les produits Sent Tech, avec support marque blanche, thèmes runtime par tenant, export CSS build-time et documentation bilingue FR/EN.

## Packages

- `@sentropic/design-system-tokens`: tokens foundation, semantic et component.
- `@sentropic/design-system-themes`: thèmes Sent Tech, Forge, Entropic et white-label.
- `@sentropic/design-system-svelte`: composants Svelte stylés par tokens.
- `apps/docs`: documentation interactive type Carbon.

## Development

```bash
npm install
npm run check
npm test
npm run docs:dev
```

Pour lancer la showcase des primitives de formulaire :

```bash
npm run showcase
```

Puis ouvrez `http://localhost:5173/components/forms`.

## Release

Public npm release is tag-driven through GitHub Actions Trusted Publishing. See [docs/release.md](docs/release.md).

## Public Safety

Ce repo est destiné à être public. Ne pas y publier de secrets, extraits de code propriétaire, URLs internes privées ou détails client non validés.
