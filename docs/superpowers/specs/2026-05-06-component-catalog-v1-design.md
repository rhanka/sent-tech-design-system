# Component Catalog V1 Design

Date: 2026-05-06

## Decision

Build the catalog in two slices:

- Slice A, recommended and approved: form controls first, because Forge and Entropic need stable input surfaces before broader product migration.
- Slice B, next: overlays and feedback (`Modal`, `Tooltip`, `Toast`) after forms are verified.
- Later: data/navigation components after field APIs and validation tokens are stable.

## Goals

- Add stable Svelte 5 form primitives: `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, and `Switch`.
- Keep components white-labelable by consuming only semantic and component CSS variables.
- Add docs pages that use the real components and expose API/tokens in French and English.
- Preserve the Foundation V1 package model: framework-agnostic tokens/themes, Svelte components, SvelteKit docs.

## Component API Principles

- Components accept native HTML attributes through `...rest`.
- Styling state is controlled through props only when native attributes are insufficient.
- Public class names use the `st-` prefix and map to component tokens.
- No product-specific behavior is embedded in the components.

## Tokens

Add component token groups for:

- `field`: label, help text, error text, gap and width.
- `control`: background, border, text, placeholder, focus ring, disabled, invalid, radius and height.
- `selection`: checkbox/radio/switch checked and track colors.

These groups make Airbus-like and tenant adapters possible without forking component APIs.

## Quality

- Use TDD for each component group.
- `svelte-check`, package build, docs build and root `verify` must pass before final status.
- Every stable component added in this slice must have at least one behavior test and one docs example.

## Status

- Fait: Option A selected as the next working slice.
- Reste a faire: Slice A implementation 100%.
- Attendus: no decision needed for Slice A; next decision after Slice A is whether to start overlays or data/navigation.
