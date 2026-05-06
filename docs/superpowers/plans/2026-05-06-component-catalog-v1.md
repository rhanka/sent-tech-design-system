# Component Catalog V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first stable form component catalog slice for Sent Tech Design System.

**Architecture:** Extend existing token/component/docs packages. Components remain Svelte 5 primitives styled only through Sent Tech CSS variables and native HTML attributes.

**Tech Stack:** npm workspaces, TypeScript, Svelte 5, Testing Library Svelte, Vitest, SvelteKit docs.

---

## Task 1: Form Token Contract

**Files:**
- Modify: `packages/tokens/src/component.ts`
- Modify: `packages/tokens/src/css.test.ts`

- [ ] Add `field`, `control`, and `selection` token groups.
- [ ] Add a token test proving the form groups exist.
- [ ] Run `npm --workspace packages/tokens test`.
- [ ] Commit `feat(tokens): add form control tokens`.

## Task 2: Form Components

**Files:**
- Create: `packages/components-svelte/src/lib/Input.svelte`
- Create: `packages/components-svelte/src/lib/Textarea.svelte`
- Create: `packages/components-svelte/src/lib/Select.svelte`
- Create: `packages/components-svelte/src/lib/Checkbox.svelte`
- Create: `packages/components-svelte/src/lib/Radio.svelte`
- Create: `packages/components-svelte/src/lib/Switch.svelte`
- Modify: `packages/components-svelte/src/lib/index.ts`
- Create: `packages/components-svelte/src/FormControls.test.ts`

- [ ] Write failing tests for accessible labels, invalid state, disabled state and switch role.
- [ ] Implement minimal Svelte 5 components with native attribute passthrough.
- [ ] Run `npm --workspace packages/components-svelte test`.
- [ ] Run `npm --workspace packages/components-svelte run check`.
- [ ] Run `npm --workspace packages/components-svelte run build`.
- [ ] Commit `feat(svelte): add form controls`.

## Task 3: Docs Page

**Files:**
- Modify: `apps/docs/src/lib/i18n.ts`
- Modify: `apps/docs/src/routes/+layout.svelte`
- Create: `apps/docs/src/routes/components/forms/+page.svelte`

- [ ] Add bilingual copy for Forms.
- [ ] Add a docs nav link.
- [ ] Add live examples, API summary and token list using the real components.
- [ ] Run `npm run docs:build`.
- [ ] Run `npm --workspace apps/docs run check`.
- [ ] Commit `feat(docs): document form controls`.

## Task 4: Final Verification

**Files:**
- Modify: `docs/superpowers/reports/foundation-v1-verification.md`

- [ ] Run `npm run verify`.
- [ ] Smoke check `/components/forms` locally if a docs server is running.
- [ ] Update status/report with results.
- [ ] Commit `test: verify component catalog v1 slice`.
- [ ] Push `main`.
