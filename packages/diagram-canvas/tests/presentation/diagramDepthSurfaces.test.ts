import { describe, expect, it } from "vitest";
import {
  defaultCardMeasure,
  layoutZone,
  normalizeZoneDepth,
  projectCardProps,
  projectZoneProps,
  zoneDepthSurface,
  type DiagramCardProps,
} from "../../src/presentation/diagramCardModel.js";

/**
 * DE-1 owner addendum 1 — alternating zone backgrounds by nesting depth.
 * One engine rule (depth parity, selectable start parity), two surface
 * tokens per theme (surface-1 / surface-2, see the tokens suite), card
 * semantic tints unchanged, and an informational diagnostic when a white
 * leaf card sits on a same-colour zone.
 */
describe("diagram depth surfaces (DE-1 addendum 1)", () => {
  it("should alternate surface1/surface2 by depth parity with a selectable start", () => {
    expect(zoneDepthSurface(undefined)).toBe("surface1");
    expect(zoneDepthSurface(0)).toBe("surface1");
    expect(zoneDepthSurface(1)).toBe("surface2");
    expect(zoneDepthSurface(2)).toBe("surface1");
    expect(zoneDepthSurface(3)).toBe("surface2");
    // Selectable start parity flips which parity the top level takes.
    expect(zoneDepthSurface(0, 1)).toBe("surface2");
    expect(zoneDepthSurface(1, 1)).toBe("surface1");
    expect(zoneDepthSurface(2, 1)).toBe("surface2");
    // Depth normalises: negatives clamp, fractions floor, gaps stay top.
    expect(normalizeZoneDepth(undefined)).toBe(0);
    expect(normalizeZoneDepth(-2)).toBe(0);
    expect(normalizeZoneDepth(1.9)).toBe(1);
    expect(normalizeZoneDepth(Number.NaN)).toBe(0);
    expect(zoneDepthSurface(-1)).toBe("surface1");
  });

  it("should resolve the depth surface on the expanded frame", () => {
    const base = { entityId: "zone", title: "Zone", collapsed: false, width: 600 };
    const top = layoutZone({ ...base }, defaultCardMeasure);
    expect(top.collapsed).toBe(false);
    // No depth pins: the layout keeps its exact v1 shape (absent keys read
    // as the depth-0 / surface1 defaults downstream).
    expect(top.depth).toBeUndefined();
    expect(top.surface).toBeUndefined();
    expect(top.depth ?? 0).toBe(0);
    expect(top.surface ?? "surface1").toBe("surface1");
    const nested = layoutZone({ ...base, depth: 1 }, defaultCardMeasure);
    expect(nested.depth).toBe(1);
    expect(nested.surface).toBe("surface2");
    const flipped = layoutZone({ ...base, depth: 1, depthParityStart: 1 }, defaultCardMeasure);
    expect(flipped.surface).toBe("surface1");
  });

  it("should keep the depth surface across fold and unfold", () => {
    const folded = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: true, toggleLabel: "Toggle", depth: 1 },
      defaultCardMeasure,
    );
    expect(folded.collapsed).toBe(true);
    expect(folded.depth).toBe(1);
    expect(folded.surface).toBe("surface2");
    const unfolded = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: false, width: 600, toggleLabel: "Toggle", depth: 1 },
      defaultCardMeasure,
    );
    expect(unfolded.collapsed).toBe(false);
    expect(unfolded.surface).toBe(folded.surface);
  });

  it("should paint the folded card with the zone depth surface", () => {
    const folded = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: true, toggleLabel: "Toggle", depth: 2 },
      defaultCardMeasure,
    );
    expect(folded.surface).toBe("surface1");
    expect(folded.card).toBeDefined();
  });

  it("should pass the presentation depth pins through projectZoneProps", () => {
    const pinned = projectZoneProps(
      { form: "container", text: { title: "Z" }, depth: 2, depthParityStart: 1 },
      { entityId: "occurrence:e.1", collapsed: false },
    );
    expect(pinned.kind).toBe("zone");
    if (pinned.kind !== "zone") return;
    expect(pinned.props.depth).toBe(2);
    expect(pinned.props.depthParityStart).toBe(1);
    const layout = layoutZone({ ...pinned.props, width: 600 }, defaultCardMeasure);
    expect(layout.surface).toBe("surface2");
    const fallback = projectZoneProps(
      { form: "container", text: { title: "Z" } },
      { entityId: "occurrence:e.2", collapsed: true, depth: 1 },
    );
    expect(fallback.kind).toBe("zone");
    if (fallback.kind !== "zone") return;
    expect(fallback.props.depth).toBe(1);
    const plain = projectZoneProps(
      { form: "container", text: { title: "Z" } },
      { entityId: "occurrence:e.3", collapsed: true },
    );
    expect(plain.kind).toBe("zone");
    if (plain.kind !== "zone") return;
    expect(plain.props.depth).toBeUndefined();
    expect(layoutZone(plain.props, defaultCardMeasure).surface ?? "surface1").toBe("surface1");
  });

  it("should never set a depth surface on leaf cards", () => {
    const card = projectCardProps(
      { form: "card", text: { title: "T" } },
      { entityId: "occurrence:e.1" },
    );
    expect(card.kind).toBe("card");
    if (card.kind !== "card") return;
    expect("surface" in card.props ? card.props.surface : undefined).toBeUndefined();
  });

  it("should flag a white leaf card on a same-colour zone only when opted in", () => {
    const leaf: DiagramCardProps = { entityId: "card", title: "C", body: [] };
    const children = [{ kind: "card", x: 0, y: 0, card: leaf }] as const;
    const whiteOnWhite = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: false, width: 600, reportSurfaceSame: true },
      defaultCardMeasure,
      [...children],
    );
    expect(whiteOnWhite.surface ?? "surface1").toBe("surface1");
    expect(whiteOnWhite.diagnostics.some((diagnostic) => diagnostic.code === "zone-surface-same")).toBe(true);
    // Off by default: a fitting child renders with no diagnostics.
    const quiet = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: false, width: 600 },
      defaultCardMeasure,
      [...children],
    );
    expect(quiet.diagnostics.some((diagnostic) => diagnostic.code === "zone-surface-same")).toBe(false);
    // A nested (grey) zone never flags its leaf cards, even opted in.
    const nested = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: false, width: 600, depth: 1, reportSurfaceSame: true },
      defaultCardMeasure,
      [...children],
    );
    expect(nested.surface).toBe("surface2");
    expect(nested.diagnostics.some((diagnostic) => diagnostic.code === "zone-surface-same")).toBe(false);
    // Flat host compositions (no explicit children) never flag.
    const flat = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: false, width: 600, reportSurfaceSame: true },
      defaultCardMeasure,
      [],
    );
    expect(flat.diagnostics.some((diagnostic) => diagnostic.code === "zone-surface-same")).toBe(false);
  });
});
