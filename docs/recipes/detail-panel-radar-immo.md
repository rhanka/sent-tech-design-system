# DetailPanel recipe - Radar Immo development inspector

This recipe defines how Radar Immo can build the "Outil de developpement" inspector without introducing a new DS primitive.

## Composition

Use the existing NavSystem primitives:

- `ContextPanel` for the inspection surface.
- `UtilityPanel` for tool output, assistant output or diagnostics.
- Host AppShell/NavShell rail and drawer primitives for placement, resizing and collapse behavior.

Do not import a `DetailPanel` component for WP23. The recipe is an adoption pattern.

## Anatomy

Required regions:

- Header: inspected entity label, entity type, close/collapse action.
- Summary: stable key/value facts such as address, lot id, zoning, owner, status.
- Primary action zone: a single primary action for the current object.
- Detail sections: grouped fields, diagnostics, links and history.
- Utility slot: optional tool/chat output, collapsible at the top or bottom.
- State surface: empty, loading, error and stale data treatments.

## Layout modes

Right panel:

- Default for a workspace canvas.
- Keeps the map/table/canvas visible while inspection changes.

Left panel:

- Allowed when the main workflow is right-biased or the host already reserves the right side for another tool.

Drawer:

- Use on constrained widths or when the inspector is secondary to a search workflow.
- If the host supports resizing, expose a min width and preferred width but keep the recipe independent from the resize implementation.

Accordion utility:

- Tool/chat output can collapse above or below the detail sections.
- Start collapsed on mobile and when the user has not invoked a tool.

## State contracts

Empty:

- Explain what to select and show one low-emphasis affordance.

Loading:

- Skeleton only in the summary and current section; keep header stable if the selected object is known.

Error:

- Preserve selected object context; show retry and diagnostics.

Stale:

- Keep read-only data visible; show a timestamp and refresh action.

## Do

- Keep one primary action per inspector surface.
- Put destructive or bulk actions in a secondary menu.
- Use semantic status labels; never rely on color alone.
- Keep search/filter inputs full width when they are the main command in the drawer or panel.
- Keep tool/chat content collapsible and visibly separate from entity facts.

## Do not

- Do not ship a new `DetailPanel` primitive until two clients need the same stable API.
- Do not hide multiple primary actions inside a toolbar.
- Do not nest a button, link or menu inside an option row.
- Do not make the inspector cover the whole workspace on desktop unless the host explicitly chooses drawer mode.
- Do not treat chat as a mandatory region for all DetailPanel adopters.
