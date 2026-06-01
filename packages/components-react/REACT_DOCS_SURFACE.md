# React Docs Surface Proposal

The docs surface should expose React as a peer implementation of the existing Svelte catalogue, not as a separate design system.

## Goals

- Show every public React export next to the matching Svelte component contract.
- Keep examples copy-pastable with typed props from `@sentropic/design-system-react`.
- Surface behavioral parity status for interactive components: keyboard support, focus handling, controlled props, and a11y wiring.
- Avoid adding React-only design guidance; tokens, anatomy, and theme decisions remain shared.

## Proposed Docs Shape

1. Add a framework switch on component pages with `Svelte` and `React` tabs.
2. Reuse the same component metadata keys already used by the docs app.
3. Add a React example module per component only when the example differs from Svelte syntax.
4. Add a `Behavior` note for interactive components when the React port has explicit jsdom coverage.
5. Keep package install copy aligned with the public package README and release channel.

## Initial Coverage

The first React docs pass should prioritize the components covered by `src/behavior.test.tsx`:

- Tabs
- Accordion
- Modal and Drawer
- Menu, Dropdown, Popover, and OverflowMenu
- Checkbox, Radio, Toggle, and Switch
- Pagination
- Tooltip and Toggletip
- Combobox and MultiSelect
- Toast

## Docs Data Contract

Each React docs entry should provide:

- `component`: public export name.
- `source`: import path from `@sentropic/design-system-react`.
- `example`: a minimal React example with controlled and uncontrolled variants where relevant.
- `behavior`: short machine-readable status such as `covered`, `basic`, or `pending`.
- `test`: optional path to the behavior or catalogue test that protects the example.

## Integration Notes

- The docs app should load React examples lazily so the Svelte docs bundle remains unchanged by default.
- React examples should import package CSS once at the docs preview boundary.
- Cross-framework pages should keep one canonical accessibility checklist and link both implementations to it.
- The compare/fidelity tooling stays theme-oriented and should not be coupled to React docs examples.
