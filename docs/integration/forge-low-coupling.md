# Forge Low-Coupling Design System Integration

Status: recommended first integration step.

## Goal

Validate Sent Tech design tokens in `sentech-forge` without replacing Forge components yet.

## Import Options

### Option A: Vendor-copy CSS, recommended for the first Forge commit

Copy this file into Forge:

```txt
../sent-tech-design-system/packages/themes/css/forge.css
```

Suggested target:

```txt
src/lib/styles/sent-tech-forge-theme.css
```

Then import it once in the Forge app shell or global CSS entry.

This is the lowest-coupling path: Forge does not depend on unpublished npm packages yet.

### Option B: Local package import

Install or link `@sentropic/themes`, then import the Forge theme CSS once in the Forge app shell:

```ts
import "@sentropic/themes/css/forge.css";
```

## Scope Attribute

Set the theme scope on the Forge root:

```svelte
<div data-st-theme="forge">
  <slot />
</div>
```

If the root is not Svelte, put `data-st-theme="forge"` on the top-level app container or `document.documentElement`.

## Compatibility Bridge

For the first pass, do not replace Forge components. Map existing Forge CSS variables or local component styles to Sent Tech variables only where the mapping is obvious:

```css
.forge-screen {
  color: var(--st-semantic-text-primary);
  background: var(--st-semantic-surface-default);
}
```

## What To Validate

- Global surface and text colors.
- Primary action color.
- Border and focus colors.
- Form field spacing and density.
- Table and navigation contrast.

## What Not To Do Yet

- Do not replace Forge components with DS components in this step.
- Do not publish a stable npm dependency solely for this first pass.
- Do not introduce product-specific tokens in the design system.

## Next Step

After the CSS-only pass, choose one Forge screen for the component pilot and replace a small set of primitives with `@sentropic/components-svelte`.
