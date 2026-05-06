# Data Navigation Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add stable data and navigation primitives to the Sent Tech component catalog.

**Architecture:** Extend the existing tokens, Svelte component package and SvelteKit docs. Components are data-driven, token-styled and product-neutral.

**Tech Stack:** npm workspaces, TypeScript, Svelte 5, Testing Library Svelte, Vitest, SvelteKit docs.

---

## Task 1: Data Navigation Token Contract

**Files:**
- Modify: `packages/tokens/src/component.ts`
- Modify: `packages/tokens/src/css.test.ts`

- [ ] Write a failing token test for `dataTable`, `tabs`, `pagination`, `breadcrumb`, `sideNav`.
- [ ] Add the token groups.
- [ ] Run `npm --workspace packages/tokens test`.
- [ ] Run `npm --workspace packages/tokens run check`.
- [ ] Commit `feat(tokens): add data navigation tokens`.

## Task 2: Data Navigation Components

**Files:**
- Create: `packages/components-svelte/src/lib/Table.svelte`
- Create: `packages/components-svelte/src/lib/Tabs.svelte`
- Create: `packages/components-svelte/src/lib/Pagination.svelte`
- Create: `packages/components-svelte/src/lib/Breadcrumb.svelte`
- Create: `packages/components-svelte/src/lib/SideNav.svelte`
- Create: `packages/components-svelte/src/DataNavigation.test.ts`
- Modify: `packages/components-svelte/src/lib/index.ts`

- [ ] Write failing behavior tests.
- [ ] Implement minimal Svelte 5 components.
- [ ] Run `npm --workspace packages/components-svelte test`.
- [ ] Run `npm --workspace packages/components-svelte run check`.
- [ ] Run `npm --workspace packages/components-svelte run build`.
- [ ] Commit `feat(svelte): add data navigation components`.

## Task 3: Data Navigation Docs

**Files:**
- Modify: `apps/docs/src/lib/i18n.ts`
- Modify: `apps/docs/src/routes/+layout.svelte`
- Modify: `apps/docs/src/routes/+page.svelte`
- Create: `apps/docs/src/routes/components/data-navigation/+page.svelte`

- [ ] Add bilingual copy.
- [ ] Add navigation link.
- [ ] Add examples using real components.
- [ ] Add API and token tables.
- [ ] Run `npm run docs:build`.
- [ ] Run `npm --workspace apps/docs run check`.
- [ ] Commit `feat(docs): document data navigation components`.

## Task 4: Verification

**Files:**
- Create: `docs/superpowers/reports/component-catalog-v1-data-navigation.md`

- [ ] Run `npm run verify`.
- [ ] Smoke check `/components/data-navigation` locally if docs server is running.
- [ ] Write status report.
- [ ] Commit `test: verify data navigation catalog slice`.
- [ ] Push `main`.
