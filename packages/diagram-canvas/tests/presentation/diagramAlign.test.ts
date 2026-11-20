import { describe, expect, it } from "vitest";
import {
  defaultCardMeasure,
  layoutCard,
  layoutZone,
  projectCardProps,
  projectZoneProps,
} from "../../src/presentation/diagramCardModel.js";

/**
 * DE-1 step 2 — alignment carried by the presentation and passed by the
 * projectors to `layoutCard`/`layoutZone` (both hosts share the projectors
 * by re-export, so parity holds by construction). Governed
 * `diagram-presentation@1` bytes stay untouched: `align` travels as an
 * additive canvas-side pin (`AlignPinned` pattern), absent means `"left"`.
 */
describe("diagram presentation alignment (DE-1 step 2)", () => {
  it("should keep left alignment frozen when no pin is present", () => {
    const card = projectCardProps(
      { form: "card", text: { title: "T" } },
      { entityId: "occurrence:e.1" },
    );
    expect(card.kind).toBe("card");
    if (card.kind !== "card") return;
    expect(card.props.align).toBeUndefined();
    const layout = layoutCard(card.props, defaultCardMeasure);
    expect(layout.title[0]?.anchor).toBe("start");
  });

  it("should pass the presentation align pin through projectCardProps", () => {
    for (const align of ["left", "center"] as const) {
      const card = projectCardProps(
        { form: "card", text: { title: "T" }, align },
        { entityId: "occurrence:e.1" },
      );
      expect(card.kind).toBe("card");
      if (card.kind !== "card") return;
      expect(card.props.align).toBe(align);
    }
  });

  it("should prefer the presentation pin over the opts fallback", () => {
    const card = projectCardProps(
      { form: "card", text: { title: "T" }, align: "left" },
      { entityId: "occurrence:e.1", align: "center" },
    );
    expect(card.kind).toBe("card");
    if (card.kind !== "card") return;
    expect(card.props.align).toBe("left");
    const fallback = projectCardProps(
      { form: "card", text: { title: "T" } },
      { entityId: "occurrence:e.2", align: "center" },
    );
    expect(fallback.kind).toBe("card");
    if (fallback.kind !== "card") return;
    expect(fallback.props.align).toBe("center");
  });

  it("should centre the title line on the middle anchor when pinned center", () => {
    const card = projectCardProps(
      { form: "card", text: { title: "Centred" }, align: "center" },
      { entityId: "occurrence:e.1" },
    );
    expect(card.kind).toBe("card");
    if (card.kind !== "card") return;
    const layout = layoutCard(card.props, defaultCardMeasure);
    expect(layout.title[0]?.anchor).toBe("middle");
    expect(layout.title[0]?.x).toBe(layout.headerTextX + layout.headerTextWidth / 2);
  });

  it("should pass the presentation align pin through projectZoneProps folded and unfolded", () => {
    for (const collapsed of [true, false]) {
      const zone = projectZoneProps(
        { form: "container", text: { title: "Z" }, align: "center" },
        { entityId: "occurrence:e.2", collapsed, toggleLabel: "Toggle" },
      );
      expect(zone.kind).toBe("zone");
      if (zone.kind !== "zone") return;
      expect(zone.props.align).toBe("center");
      const layout = layoutZone(
        { ...zone.props, width: 600 },
        defaultCardMeasure,
      );
      if (collapsed) {
        expect(layout.collapsed).toBe(true);
      } else {
        expect(layout.collapsed).toBe(false);
        expect(layout.header?.title[0]?.anchor).toBe("middle");
      }
    }
  });

  it("should keep zone alignment left by default for v1 and center by default for v2", () => {
    const plain = projectZoneProps(
      { form: "container", text: { title: "Z" } },
      { entityId: "occurrence:e.2", collapsed: true },
    );
    expect(plain.kind).toBe("zone");
    if (plain.kind !== "zone") return;
    expect(plain.props.align).toBeUndefined();
    expect(layoutZone({ ...plain.props, collapsed: false, width: 600 }, defaultCardMeasure).header?.title[0]?.anchor).toBe("start");
    const compact = projectZoneProps(
      { form: "container", text: { title: "Z" }, anatomy: "v2" },
      { entityId: "occurrence:e.4", collapsed: false },
    );
    expect(compact.kind).toBe("zone");
    if (compact.kind !== "zone") return;
    expect(layoutZone({ ...compact.props, width: 600 }, defaultCardMeasure).header?.title[0]?.anchor).toBe("middle");
    const compactLeft = layoutZone({ ...compact.props, width: 600, align: "left" }, defaultCardMeasure);
    expect(compactLeft.header?.title[0]?.anchor).toBe("start");
    const fallback = projectZoneProps(
      { form: "container", text: { title: "Z" } },
      { entityId: "occurrence:e.3", collapsed: false, align: "center" },
    );
    expect(fallback.kind).toBe("zone");
    if (fallback.kind !== "zone") return;
    expect(fallback.props.align).toBe("center");
  });
});
