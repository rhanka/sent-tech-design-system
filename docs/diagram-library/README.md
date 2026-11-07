# Diagram library — ownership and requirement register

## Ownership (owner Decision A = A1, 2026-11-07)

The owner chose option A1 of the h2a decision dossier `diag-lib-20261107` r2
(« A1 · Le design system répond de toute la bibliothèque et tient le registre unique »).
h-cond relayed the decision on 2026-11-07 in these terms:

| Party | Role in the diagram library |
| --- | --- |
| Design system (this repository) | **Accountable for the whole diagram library**: pivot model (`@sentropic/diagram-core`), layout, measurement, routing, folds, zoom viewer, cards and zones, rendering, and the visual and family encoders of the exports. **Keeps the single register of the owner's requirements.** |
| engram | Does the architecture model (profiles, validation, ingestion), the **text format** (codec) and the **export semantics** (semantic mappings, payload framing, end-to-end round-trip gate). |
| h2a (Focus, dossier kits) | **Consumes** the published DS components and **retires** its own layout, routing and zoom engines once the DS ships the scene (lots DC-2/DC-3). |
| `@sentropic/bpmn-canvas` | Remains the BPMN engine (separate repository and session); the DS wraps it in `<st-bpmn-canvas>`. |

Two dossiers (register row DLR-007, 07/11). The owner asked: « Mais toi tu garde la partie skill voir mcp de diagramme (comme sous composant de focus?) etc donc potentiellemt 2 dossiers ? » (h2a `DECISIONS-owner.md`, journal entry 07/11 00:05).
The design-system dossier covers the diagram library: pivot, layout, cards, bijective exports and this register.
The h2a dossier covers the architecture skill, the diagram MCP tools as a Focus sub-component, and the consumption of the DS library.
The DS confirmed this boundary at 00:10; it is written in h2a `archi-skill-dossier/DS-BOUNDARY.md`.

Owner Decision B (2026-11-07, verbatim): « Orientation b2 avec demonstration dans un devision dossier coté design system. Je veux la demode toutes les bijections de toute facon - bpmn draw.io mermaid etc ».
The committed text is strict Mermaid syntax plus annotations, rendered by the DS renderer.
A DS-side decision dossier must demonstrate every bijection on real diagrams.
The demonstration plan lives in `scratchpad/diag-lib/b2-demo-plan.md` (main checkout) until it becomes a spec.

## Single source

[`OWNER-REQUIREMENTS.md`](OWNER-REQUIREMENTS.md) is the **single register** of the owner's requirements for the diagram library.

- Any other list (the #711 requirements file in sentropic, the h2a handoff register, the DS specs §2.1/§17, the BE spec) is an **input** to this register, never a competing source.
- A DS spec, lot or review cites requirements by their `DLR-nnn` id.
- When a source and this register differ, the raw owner source wins and the difference is recorded in the register's conflict table.
- Rows are never deleted or renumbered. A changed requirement gets a new row and the old one is marked `superseded by DLR-xxx`.
