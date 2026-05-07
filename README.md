# Sent Tech Design System

Design system Svelte pour les produits Sent Tech, avec support marque blanche, thèmes runtime par tenant, export CSS build-time et documentation bilingue FR/EN.

## Packages

- `@sent-tech/tokens`: tokens foundation, semantic et component.
- `@sent-tech/themes`: thèmes Sent Tech, Forge, Entropic et white-label.
- `@sent-tech/components-svelte`: composants Svelte stylés par tokens.
- `apps/docs`: documentation interactive type Carbon.

## Development

```bash
npm install
npm run check
npm test
npm run docs:dev
```

## Release

Public npm release is tag-driven through GitHub Actions Trusted Publishing. See [docs/release.md](docs/release.md).

## Public Safety

Ce repo est destiné à être public. Ne pas y publier de secrets, extraits de code propriétaire, URLs internes privées ou détails client non validés.
