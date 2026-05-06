# Data Navigation Catalog Design

Date: 2026-05-06

## Decision

Continue Component Catalog V1 with data and navigation primitives:

- `Table`
- `Tabs`
- `Pagination`
- `Breadcrumb`
- `SideNav`

This follows the completed Form + Overlay slice and targets dashboard, admin, Graphify, Forge and Entropic screens.

## Goals

- Provide stable, data-driven APIs that are simple to consume from product views.
- Keep all styling token-driven for white-label and external design-system adapters.
- Avoid product-specific behaviors such as server sorting, filters, routing adapters, or data fetching.
- Document every component with bilingual examples and token references.

## API Principles

- `Table` receives `columns` and `rows`; it renders accessible table semantics only.
- `Tabs` receives `items`; it owns simple local active-tab state and exposes `onchange`.
- `Pagination` receives `page` and `pageCount`; it renders explicit page buttons and `onpagechange`.
- `Breadcrumb` receives ordered `items`; current page uses `aria-current="page"`.
- `SideNav` receives ordered `items`; active link uses `aria-current="page"`.

## Token Groups

Add component token groups:

- `dataTable`
- `tabs`
- `pagination`
- `breadcrumb`
- `sideNav`

These are component-level aliases over semantic tokens and can be remapped by tenant themes or Airbus-like adapters.

## Quality

- Use TDD before implementation.
- Component tests must cover roles, labels, current/selected states and core rendering.
- `npm run verify` must pass before completion.

## Status

- Fait: Form + Overlay slice complete.
- Reste a faire: Data / Navigation slice 100%.
- Attendus: no decision needed; user approved continuing with the recommended next slice.
