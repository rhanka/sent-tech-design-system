import { describe, expect, it } from "vitest";
import {
  defaultCardMeasure,
  layoutCard,
  layoutZone,
} from "../../src/presentation/diagramCardModel.js";

/**
 * Owner addendum 8 — card title one line first (see the v2 anatomy suite
 * for the one-line title + overflow case), optional icon without text
 * loss, or a reported overflow diagnostic. Dropping the icon reclaims the
 * pictogram room for the text in both states; text that still does not fit
 * reports `card-overflow` instead of truncating silently.
 */
describe("diagram optional icon without text loss (addendum 8)", () => {
  it("should reclaim the pictogram room for the title when the icon is dropped", () => {
    const withIcon = layoutCard(
      { entityId: "card", title: "Title", body: ["Body"], icon: "base" },
      defaultCardMeasure,
    );
    expect(withIcon.headerTextX).toBe(16 + 70 + 6);
    const noIcon = layoutCard(
      { entityId: "card", title: "Title", body: ["Body"], icon: "none" },
      defaultCardMeasure,
    );
    // No icon: the text starts at the content inset, no space reserved.
    expect(noIcon.headerTextX).toBe(16);
    expect(noIcon.headerTextWidth - withIcon.headerTextWidth).toBe(76);
    // Same compact geometry: the reclaimed room follows the v2 insets.
    const compactIcon = layoutCard(
      { entityId: "card", title: "Title", body: ["Body"], icon: "base", anatomy: "v2" },
      defaultCardMeasure,
    );
    const compactNoIcon = layoutCard(
      { entityId: "card", title: "Title", body: ["Body"], icon: "none", anatomy: "v2" },
      defaultCardMeasure,
    );
    expect(compactIcon.headerTextX).toBe(12 + 52 + 4);
    expect(compactNoIcon.headerTextX).toBe(12);
  });

  it("should wrap the same title in fewer lines without the icon and never lose text", () => {
    const title = "x".repeat(20);
    for (const icon of ["base", "none"] as const) {
      const layout = layoutCard({ entityId: "card", title, body: ["Body"], icon }, defaultCardMeasure);
      expect(layout.diagnostics).toEqual([]);
    }
    const withIcon = layoutCard({ entityId: "card", title, body: ["Body"], icon: "base" }, defaultCardMeasure);
    const noIcon = layoutCard({ entityId: "card", title, body: ["Body"], icon: "none" }, defaultCardMeasure);
    expect(withIcon.title).toHaveLength(2);
    expect(noIcon.title).toHaveLength(1);
    expect(noIcon.title.map((line) => line.text).join("")).toBe(title);
  });

  it("should still report overflow when the title fits neither allocation", () => {
    const title = "W".repeat(100);
    for (const icon of ["base", "none"] as const) {
      const layout = layoutCard({ entityId: "card", title, body: ["Body"], icon }, defaultCardMeasure);
      const overflow = layout.diagnostics.find((diagnostic) => diagnostic.code === "card-overflow");
      expect(overflow?.slot).toBe("title");
      expect(overflow?.neededPx).toBeGreaterThan(overflow?.allocatedPx ?? 0);
    }
  });

  it("should reclaim the pictogram room in folded and expanded zones", () => {
    const expanded = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: false, width: 600, toggleLabel: "Toggle", icon: "none" },
      defaultCardMeasure,
    );
    expect(expanded.collapsed).toBe(false);
    expect(expanded.header?.headerTextX).toBe(16);
    const expandedIcon = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: false, width: 600, toggleLabel: "Toggle", icon: "cluster" },
      defaultCardMeasure,
    );
    expect(expandedIcon.header?.headerTextX).toBe(16 + 70 + 6);
    // Folded: the zone IS the card, same reclamation at the shared slot.
    const folded = layoutZone(
      { entityId: "zone", title: "Zone", collapsed: true, toggleLabel: "Toggle", icon: "none" },
      defaultCardMeasure,
    );
    expect(folded.collapsed).toBe(true);
    expect(folded.card?.headerTextX).toBe(16);
  });
});
