import { describe, expect, it } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  entityRef,
  m3ProfileRegistry,
  relationRef,
  shippedExecutorBindings,
} from "@sentropic/diagram-core";
import {
  cardLineMeasurer,
  defaultCardMeasure,
  layoutZone,
  normalizeZoneDepth,
  projectCardProps,
  projectZoneProps,
  zoneDepthSurface,
  type DiagramCardProps,
} from "../../src/presentation/diagramCardModel.js";
import { layoutScene, type SceneDocument, type ScenePresentation } from "../../src/presentation/diagramSceneModel.js";

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
    // Semantically tinted cards never trigger zone-surface-same even on surface1.
    const tinted: DiagramCardProps = { entityId: "tinted", title: "Tinted", body: [], tone: "category1" };
    const tintedOnWhite = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: false, width: 600, reportSurfaceSame: true },
      defaultCardMeasure,
      [{ kind: "card", x: 0, y: 0, card: tinted }],
    );
    expect(tintedOnWhite.diagnostics.some((diagnostic) => diagnostic.code === "zone-surface-same")).toBe(false);
  });

  it("should emit zone-surface-same from scene layout only for untinted leaf cards on surface1 zones", () => {
    const doc = {
      documentId: "document:surface-same-scene",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities: {
        "entity:outer": { id: entityRef("outer"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Outer" } } },
        "entity:inner": { id: entityRef("inner"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Inner" } } },
        "entity:whiteOuter": { id: entityRef("whiteOuter"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "White Outer" } } },
        "entity:tintedOuter": { id: entityRef("tintedOuter"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Tinted Outer" } } },
        "entity:whiteInner": { id: entityRef("whiteInner"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "White Inner" } } },
      },
      relations: {
        "relation:c1": { id: relationRef("c1"), profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("outer") }, { role: "child", target: entityRef("inner") }], attributes: {} },
        "relation:c2": { id: relationRef("c2"), profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("outer") }, { role: "child", target: entityRef("whiteOuter") }], attributes: {} },
        "relation:c3": { id: relationRef("c3"), profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("outer") }, { role: "child", target: entityRef("tintedOuter") }], attributes: {} },
        "relation:c4": { id: relationRef("c4"), profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("inner") }, { role: "child", target: entityRef("whiteInner") }], attributes: {} },
      },
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SceneDocument;
    const pres = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        "occurrence:e.outer": { form: "container", text: { title: "Outer" } },
        "occurrence:e.inner": { form: "container", text: { title: "Inner" } },
        "occurrence:e.whiteOuter": { form: "card", text: { title: "White Outer", body: "Untinted" } },
        "occurrence:e.tintedOuter": { form: "card", categoryRef: "category1", text: { title: "Tinted Outer", body: "Tinted" } },
        "occurrence:e.whiteInner": { form: "card", text: { title: "White Inner", body: "Untinted" } },
      },
      legends: {},
      categoryTokens: [],
    } as unknown as ScenePresentation;
    const baseInput = {
      document: doc,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: pres,
      measureLines: cardLineMeasurer(defaultCardMeasure),
      collapsed: [],
    };
    // Off by default: zero zone-surface-same warnings.
    const quiet = layoutScene(baseInput);
    expect(quiet.status).toBe("laid-out");
    if (quiet.status !== "laid-out") return;
    expect(quiet.warnings.filter((w) => w.code === "zone-surface-same")).toEqual([]);

    // Opt-in at default parity: only whiteOuter on outer (surface1) is flagged; tintedOuter and whiteInner (on surface2) are not.
    const reported = layoutScene({ ...baseInput, reportSurfaceSame: true });
    expect(reported.status).toBe("laid-out");
    if (reported.status !== "laid-out") return;
    const sameWarnings = reported.warnings.filter((w) => w.code === "zone-surface-same");
    expect(sameWarnings).toHaveLength(1);
    expect(sameWarnings[0]?.refs).toEqual(["occurrence:e.outer", "occurrence:e.whiteOuter"]);

    // Flipped parity (depthParityStart = 1): outer is surface2, inner is surface1 -> only whiteInner is flagged.
    const flipped = layoutScene({ ...baseInput, depthParityStart: 1, reportSurfaceSame: true });
    expect(flipped.status).toBe("laid-out");
    if (flipped.status !== "laid-out") return;
    const flippedWarnings = flipped.warnings.filter((w) => w.code === "zone-surface-same");
    expect(flippedWarnings).toHaveLength(1);
    expect(flippedWarnings[0]?.refs).toEqual(["occurrence:e.inner", "occurrence:e.whiteInner"]);
  });
});
