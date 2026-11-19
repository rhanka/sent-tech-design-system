import { describe, expect, it } from "vitest";
import {
  anatomyCardGeometry,
  anatomyZoneGeometry,
  CARD_GEOMETRY,
  CARD_GEOMETRY_V2,
  defaultCardMeasure,
  layoutCard,
  layoutZone,
  projectCardProps,
  projectZoneProps,
  ZONE_GEOMETRY,
  ZONE_GEOMETRY_V2,
} from "../../src/presentation/diagramCardModel.js";
import { renderCardSvg } from "../../src/presentation/renderCardSvg.js";

const CONTRACT = {
  entityId: "contract",
  kicker: "KICKER",
  title: "Title",
  body: ["Body", "Detail"],
  detailCount: 1,
  footer: "Footer",
  toggle: { collapsed: true, label: "Expand" },
} as const;

/**
 * DE-1 versioned card anatomy: `diagram-anatomy/v1` stays frozen at
 * 460 × 200 for existing views; `diagram-anatomy/v2` is the compact
 * 352 × 154 default new views pin (padding 6, header inset 12, accent 6,
 * icon 52 / gap 4, type scale unchanged 22 / 32 / 24).
 */
describe("diagram anatomy v2 (DE-1)", () => {
  it("should keep v1 frozen when no anatomy is pinned", () => {
    const layout = layoutCard({ ...CONTRACT }, defaultCardMeasure);
    expect(layout.box).toEqual({ width: 460, height: 200 });
    expect(layout.headerTextX).toBe(92);
    expect(layout.iconBox?.size).toBe(70);
    expect(anatomyCardGeometry(undefined)).toBe(CARD_GEOMETRY);
    expect(anatomyZoneGeometry(undefined)).toBe(ZONE_GEOMETRY);
  });

  it("should lay out the compact 352x154 card with the v2 insets", () => {
    const layout = layoutCard({ ...CONTRACT, anatomy: "v2" }, defaultCardMeasure);
    expect(layout.box).toEqual({ width: 352, height: 154 });
    expect(CARD_GEOMETRY_V2.width).toBe(352);
    expect(CARD_GEOMETRY_V2.height).toBe(154);
    expect(CARD_GEOMETRY_V2.padding).toBe(6);
    expect(CARD_GEOMETRY_V2.headerInset).toBe(12);
    expect(CARD_GEOMETRY_V2.accentWidth).toBe(6);
    expect(CARD_GEOMETRY_V2.iconSize).toBe(52);
    expect(CARD_GEOMETRY_V2.iconTextGap).toBe(4);
    // Type scale unchanged (22 / 32 / 24).
    expect(CARD_GEOMETRY_V2.kicker.size).toBe(22);
    expect(CARD_GEOMETRY_V2.title.size).toBe(32);
    expect(CARD_GEOMETRY_V2.body.size).toBe(24);
    // Header text starts after the compact inset + icon + gap.
    expect(layout.headerTextX).toBe(12 + 52 + 4);
    // Folded header keeps the derived compact width (352 − 2 − 6 − 66 − 68).
    expect(layout.headerTextWidth).toBe(210);
    expect(layout.iconBox?.size).toBe(52);
  });

  it("should render the v2 card SVG at the compact box", () => {
    const result = renderCardSvg({ ...CONTRACT, anatomy: "v2" }, defaultCardMeasure);
    expect(result.kind).toBe("rendered");
    if (result.kind !== "rendered") return;
    expect(result.svg).toContain('width="352"');
    expect(result.svg).toContain('height="154"');
    expect(result.svg).toContain("viewBox=\"0 0 352 154\"");
    expect(result.layout.box).toEqual({ width: 352, height: 154 });
  });

  it("should fold a v2 zone into the compact card and expand it on the compact chrome", () => {
    const zone = {
      entityId: "contract-zone",
      kicker: "KICKER",
      title: "Zone",
      subtitle: "Subtitle",
      footer: "Footer",
      toggleLabel: "Toggle",
      width: 600,
      anatomy: "v2" as const,
    };
    const collapsed = layoutZone({ ...zone, collapsed: true }, defaultCardMeasure);
    expect(collapsed.collapsed).toBe(true);
    expect(collapsed.box).toEqual({ x: 0, y: 0, width: 352, height: 154 });
    const expanded = layoutZone({ ...zone, collapsed: false }, defaultCardMeasure);
    expect(expanded.collapsed).toBe(false);
    expect(expanded.header?.headerTextX).toBe(12 + 52 + 4);
    expect(ZONE_GEOMETRY_V2.collapsedWidth).toBe(352);
    expect(ZONE_GEOMETRY_V2.collapsedHeight).toBe(154);
  });

  it("should project the pinned anatomy from the presentation through both projectors", () => {
    const card = projectCardProps(
      { form: "card", text: { title: "T" }, anatomy: "v2" },
      { entityId: "occurrence:e.1" },
    );
    expect(card.kind).toBe("card");
    if (card.kind !== "card") return;
    expect(card.props.anatomy).toBe("v2");
    const zone = projectZoneProps(
      { form: "container", text: { title: "Z" } },
      { entityId: "occurrence:e.2", collapsed: false, anatomy: "v2" },
    );
    expect(zone.kind).toBe("zone");
    if (zone.kind !== "zone") return;
    expect(zone.props.anatomy).toBe("v2");
    // Unpinned presentations project no anatomy: the frozen v1 applies.
    const plain = projectCardProps({ form: "card", text: { title: "T" } }, { entityId: "occurrence:e.3" });
    expect(plain.kind).toBe("card");
    if (plain.kind !== "card") return;
    expect(plain.props.anatomy).toBeUndefined();
    expect(layoutCard(plain.props, defaultCardMeasure).box).toEqual({ width: 460, height: 200 });
  });

  it("should report a v2 title overflow through the diagnostic path without truncating silently", () => {
    const title = "W".repeat(100);
    const layout = layoutCard({ entityId: "contract", title, body: ["Body"], anatomy: "v2" }, defaultCardMeasure);
    // One-line title first (addendum 8): the second line never fits.
    expect(layout.title).toHaveLength(1);
    expect(layout.title[0]?.text).toMatch(/…$/u);
    const overflow = layout.diagnostics.find((diagnostic) => diagnostic.code === "card-overflow");
    expect(overflow?.slot).toBe("title");
    expect(overflow?.neededPx).toBeGreaterThan(overflow?.allocatedPx ?? 0);
    expect(overflow?.text).toBe(title);
  });
});
