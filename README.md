# Sent Tech Design System

Design system Svelte pour les produits Sent Tech, avec support marque blanche, thèmes runtime par tenant, export CSS build-time et documentation bilingue FR/EN.

## Global governance contract

Sentropic, h2a, Engram and Design System share a federated governance contract. Each consequential act has one accountable owner under an explicit mandate; each repository retains its code, release and data authorities.

Design System owns the rendering and interaction frame: reusable UI components, themes, canvas templates, diagram layout/rendering and the Focus dossier renderer. It publishes the generic `@sentropic/diagram-core` executor and owns annotate presentation. Its accountable capability is **C09** canvas composition, with contributions to **C03** decision presentation, **C07** diagrams and **C11** annotated feedback. Principal clauses: **C-01, C-04, C-05, C-15 and C-16**.

**Owner decisions — 2026-10-19:** **G1**, a federated contract per act; **G2**, profiles/schemas/fixtures/migrations at Engram and the generic executor/layout/rendering at Design System; **G3**, annotate presentation at Design System and the single annotation model at Sentropic. Design System receives opaque anchors and emits proposals; Sentropic resolves and persists them. Diagram anchors reference Engram profiles. **H1** requires both subdomain and separate-domain artifact hosting for each Sentropic app.

The capability map C01–C14 remains provisional pending the owner's map. Accepted governance decisions and source, publication, installation and runtime qualification are separate evidence states.

[Read the contract and rebuild instructions](https://github.com/rhanka/sentropic/blob/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/README.md) · [Decision register and owner evidence](https://github.com/rhanka/sentropic/blob/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/decisions.md) · [Study: clauses, capabilities and migration](https://github.com/rhanka/sentropic/blob/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/study.md) · [Interactive dossier — download and open locally](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/governance-r10-portable.html)

The overview is collapsed. Expand any frame below for its static detail; the interactive dossier also supports French/English and individual frame controls. The images use the same precomputed geometry and support light/dark themes.

![Global governance — collapsed overview](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/overview-en.svg)

<details>
<summary>h2a — Organisation and decision-making</summary>

![h2a — Organisation and decision-making](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/frame-h2a-en.svg)

</details>

<details>
<summary>Access surfaces — CLI, Cowork, cloud and AI providers</summary>

![Access surfaces — CLI, Cowork, cloud and AI providers](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/frame-surfaces-en.svg)

</details>

<details>
<summary>Sentropic — Shared services</summary>

![Sentropic — Shared services](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/frame-cluster-mesh-en.svg)

</details>

<details>
<summary>Sentropic — Catalogues</summary>

![Sentropic — Catalogues](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/frame-cm-catalog-en.svg)

</details>

<details>
<summary>Sentropic — MCP providers and tools</summary>

![Sentropic — MCP providers and tools](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/frame-cat-mcp-en.svg)

</details>

<details>
<summary>Sentropic — Security and observability</summary>

![Sentropic — Security and observability](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/frame-cm-security-en.svg)

</details>

<details>
<summary>Sentropic — Model and artifact storage</summary>

![Sentropic — Model and artifact storage](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/frame-cm-storage-en.svg)

</details>

<details>
<summary>Sentropic — Integration</summary>

![Sentropic — Integration](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/frame-cm-cluster-en.svg)

</details>

<details>
<summary>Engram — Knowledge and ontologies</summary>

![Engram — Knowledge and ontologies](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/frame-engram-en.svg)

</details>

<details>
<summary>Design System — Rendering and interaction</summary>

![Design System — Rendering and interaction](https://raw.githubusercontent.com/rhanka/sentropic/4219362ec13c7c850455ea9e639313106fb140bf/docs/governance/images/frame-design-system-en.svg)

</details>

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
