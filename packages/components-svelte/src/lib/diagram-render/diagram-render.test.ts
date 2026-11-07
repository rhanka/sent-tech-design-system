import { describe, expect, it } from "vitest";
import { getDiagramGlyph } from "../diagram-icons/registry.js";
import {
  defaultCardMeasure,
  firstOverflowDiagnostic,
  headerSlotGeometry,
  layoutCard,
  layoutZone,
  type DiagramCardProps,
  type DiagramZoneProps,
  type ZoneChildSpec,
} from "../diagramCardModel.js";
import { renderCardSvg, renderCardSvgFromPresentation } from "./renderCardSvg.js";
import { renderZoneSvg, renderZoneSvgFromPresentation, zoneContent } from "./renderZoneSvg.js";
// Item 8: the measurer bridge must be reachable through the diagram-render
// subpath itself — this import is the assertion.
import { cardLineMeasurer } from "./index.js";

/**
 * Second-review (Astra) items 1, 2, 3 and 8 on the pure renderers:
 * vertical overflow vs the space above the pinned rule, descendant
 * diagnostic aggregation, overflow = refusal, and the empty-input /
 * export contract of `cardLineMeasurer`.
 */

/** The reviewer's exact case (item 1): toggled card with icon, kicker `K`,
 * title `Users and operators` (two lines at the folded 290 px), two body
 * lines and a footer. */
function reviewerCase(): DiagramCardProps {
  return {
    entityId: "entity:review-1",
    kicker: "K",
    title: "Users and operators",
    body: ["Employees HR · Developers admin", "HR content owners"],
    footer: "group: people",
    icon: "people",
    iconGlyph: getDiagramGlyph("people"),
    toggle: { collapsed: true, label: "Déplier" },
  };
}

describe("item 1 — vertical overflow is validated against the space above the pinned rule", () => {
  it("the reviewer's case is diagnosed with the exact geometry and refused", () => {
    const props = reviewerCase();
    const layout = layoutCard(props, defaultCardMeasure);
    // Title wraps to two lines at the frozen folded header width 290.
    expect(layout.headerTextWidth).toBe(290);
    expect(layout.title.map((line) => line.text)).toEqual(["Users and", "operators"]);
    expect(layout.headerBlockHeight).toBe(111.78125);
    // The pinned rule (footer-driven) leaves 148.5625 − 127.78125 px for
    // the body: 20.78125 px, less than one body line.
    expect(layout.bodyArea).toEqual({ top: 127.78125, bottom: 148.5625 });
    expect(layout.ruleY).toBe(152.5625);
    // The second body baseline (180.96875) crosses the footer baseline
    // (179.5625) — the overlap the reviewer measured as 180.97 / 179.56.
    expect(layout.body[1]?.baseline).toBe(180.96875);
    expect(layout.footerLines[0]?.baseline).toBe(179.5625);
    expect(layout.bodyBottom).toBe(190.15625);
    expect(layout.bodyBottom).toBeGreaterThan(layout.bodyArea.bottom);
    // Diagnosed: one card-overflow carrying the original body text.
    const overflow = layout.diagnostics.filter((diagnostic) => diagnostic.code === "card-overflow");
    expect(overflow).toHaveLength(1);
    expect(overflow[0]).toMatchObject({
      slot: "body",
      entityId: "entity:review-1",
      neededPx: 62.375,
      allocatedPx: 20.78125,
      text: "Employees HR · Developers admin\nHR content owners",
    });
    // And refused by the pure renderer: no normal SVG.
    const rendered = renderCardSvg(props, defaultCardMeasure);
    expect(rendered.kind).toBe("refused");
    if (rendered.kind === "refused") {
      expect("svg" in rendered).toBe(false);
      expect(rendered.diagnostics).toEqual(layout.diagnostics);
    }
  });

  it("the fit boundary is exact: kicker + one-line title + two body lines + footer fits", () => {
    const fitting = layoutCard(
      {
        entityId: "entity:fit",
        kicker: "K",
        title: "People",
        body: ["Employees HR · Developers admin", "HR content owners"],
        footer: "group: people",
        icon: "people",
        iconGlyph: getDiagramGlyph("people"),
        toggle: { collapsed: true, label: "Déplier" },
      },
      defaultCardMeasure,
    );
    expect(fitting.title).toHaveLength(1);
    expect(fitting.bodyArea.bottom - fitting.bodyArea.top).toBe(62.375);
    expect(fitting.body.length * 31.1875).toBe(62.375);
    expect(fitting.diagnostics).toEqual([]);
    expect(renderCardSvg(
      {
        entityId: "entity:fit",
        kicker: "K",
        title: "People",
        body: ["Employees HR · Developers admin", "HR content owners"],
        footer: "group: people",
        icon: "people",
        iconGlyph: getDiagramGlyph("people"),
        toggle: { collapsed: true, label: "Déplier" },
      },
      defaultCardMeasure,
    ).kind).toBe("rendered");
  });
});

describe("item 2 — renderZoneSvg aggregates descendant diagnostics with entity ids", () => {
  const zone: DiagramZoneProps = {
    entityId: "grp.z",
    kicker: "K",
    title: "Zone",
    collapsed: false,
    toggleLabel: "Toggle",
    x: 0,
    y: 0,
    width: 492,
    height: 400,
  };
  const wideChild: ZoneChildSpec = {
    kind: "card",
    x: 16,
    y: 16,
    card: { entityId: "entity:child-w", title: "W".repeat(50), body: [] },
  };

  it("a child title of 50 W reports overflow inside the zone, with the child entity id, and refuses", () => {
    // Standalone, the same child overflows.
    const standalone = renderCardSvg(wideChild.card as DiagramCardProps, defaultCardMeasure);
    expect(standalone.kind).toBe("refused");
    // Inside a zone the diagnostic is aggregated, not lost.
    const rendered = renderZoneSvg(zone, { measure: defaultCardMeasure, children: [wideChild] });
    expect(rendered.kind).toBe("refused");
    if (rendered.kind === "refused") {
      expect("svg" in rendered).toBe(false);
      const childDiagnostic = rendered.diagnostics.find(
        (diagnostic) => diagnostic.entityId === "entity:child-w",
      );
      expect(childDiagnostic).toMatchObject({
        code: "card-overflow",
        slot: "title",
        text: "W".repeat(50),
      });
      expect(childDiagnostic?.neededPx).toBeGreaterThan(childDiagnostic?.allocatedPx ?? 0);
    }
    // zoneContent exposes the same aggregation.
    const content = zoneContent(zone, [wideChild], defaultCardMeasure);
    expect(
      content.diagnostics.some((diagnostic) => diagnostic.entityId === "entity:child-w"),
    ).toBe(true);
  });

  it("a nested zone's descendant overflow is aggregated too", () => {
    const deep: ZoneChildSpec = {
      kind: "card",
      x: 0,
      y: 0,
      card: { entityId: "entity:deep", title: "W".repeat(50), body: [] },
    };
    const inner: ZoneChildSpec = {
      kind: "zone",
      x: 16,
      y: 16,
      zone: { entityId: "grp.inner", title: "Inner", collapsed: false, width: 300, height: 200 },
      children: [deep],
    };
    const rendered = renderZoneSvg(zone, { measure: defaultCardMeasure, children: [inner] });
    expect(rendered.kind).toBe("refused");
    if (rendered.kind === "refused") {
      expect(
        rendered.diagnostics.some(
          (diagnostic) => diagnostic.entityId === "entity:deep" && diagnostic.code === "card-overflow",
        ),
      ).toBe(true);
    }
  });

  it("a fitting child renders normally with no diagnostics", () => {
    const fitting: ZoneChildSpec = {
      kind: "card",
      x: 16,
      y: 16,
      card: { entityId: "entity:child-ok", title: "Child card", body: ["function"] },
    };
    const rendered = renderZoneSvg(zone, { measure: defaultCardMeasure, children: [fitting] });
    expect(rendered.kind).toBe("rendered");
    if (rendered.kind === "rendered") {
      expect(rendered.diagnostics).toEqual([]);
      expect(rendered.svg).toContain("Child card");
    }
  });
});

describe("item 3 — overflow = refusal: explicit refused results, original text preserved", () => {
  it("renderCardSvgFromPresentation wraps the refused result", () => {
    const result = renderCardSvgFromPresentation(
      { form: "card", text: { title: "W".repeat(50) } },
      { entityId: "entity:pres" },
    );
    expect(result.kind).toBe("card");
    if (result.kind !== "card") throw new Error("fixture-error");
    expect(result.result.kind).toBe("refused");
    if (result.result.kind === "refused") {
      expect("svg" in result.result).toBe(false);
      expect(firstOverflowDiagnostic(result.result.diagnostics)?.text).toBe("W".repeat(50));
    }
  });

  it("renderZoneSvgFromPresentation wraps the refused result", () => {
    const result = renderZoneSvgFromPresentation(
      { form: "container", text: { title: "Zone", subtitle: "W".repeat(200) } },
      { entityId: "grp.pres", collapsed: false, width: 492, height: 400 },
    );
    expect(result.kind).toBe("zone");
    if (result.kind !== "zone") throw new Error("fixture-error");
    expect(result.result.kind).toBe("refused");
    if (result.result.kind === "refused") {
      expect("svg" in result.result).toBe(false);
      const overflow = firstOverflowDiagnostic(result.result.diagnostics);
      expect(overflow).toBeDefined();
      expect(overflow?.text).toBe("W".repeat(200));
    }
  });

  it("a refused result never contains a normal card or zone SVG", () => {
    const rendered = renderCardSvg(reviewerCase(), defaultCardMeasure);
    expect(rendered.kind).toBe("refused");
    if (rendered.kind === "refused") {
      expect(Object.keys(rendered).sort()).toEqual(["diagnostics", "kind", "layout"]);
    }
  });
});

describe("item 8 — cardLineMeasurer through diagram-render, empty input clamped at 0", () => {
  it("empty text measures width 0, not -Infinity", () => {
    const measurer = cardLineMeasurer();
    const empty = measurer({ text: "", role: "body", availableWidth: 396, allocatedLines: 2, folded: false });
    expect(empty.width).toBe(0);
    expect(Number.isFinite(empty.width)).toBe(true);
    expect(empty.lines).toEqual([]);
    expect(empty.height).toBe(0);
    expect(empty.overflow).toBe(false);
  });

  it("non-empty text still measures through the same bridge", () => {
    const measurer = cardLineMeasurer();
    const line = measurer({ text: "service: h2a", role: "footer", availableWidth: 436, allocatedLines: 1, folded: false });
    expect(line.width).toBeGreaterThan(0);
    expect(line.lines).toEqual(["service: h2a"]);
    expect(line.overflow).toBe(false);
    const wide = measurer({ text: "W".repeat(50), role: "title", availableWidth: 434, allocatedLines: 2, folded: false });
    expect(wide.overflow).toBe(true);
    expect(wide.width).toBeGreaterThan(434);
  });
});

/**
 * Review pass 2, item 10: the optional-slot header geometry (omitted icon
 * and/or kicker) is derived ONCE in the model (`headerSlotGeometry`) and
 * applied identically by `layoutCard`, `layoutZone`, `renderCardSvg` and
 * `renderZoneSvg` — all four icon/kicker combinations.
 */
describe("item 10 — optional-slot header geometry derived once, applied by every renderer", () => {
  const KICKER_H = 28.59375; // lineBoxHeight(22)
  const TITLE_H = 41.59375; // lineBoxHeight(32)
  const COMBOS = [
    { name: "icon+kicker", icon: true, kicker: true, content: KICKER_H + TITLE_H, block: Math.max(70, KICKER_H + TITLE_H) },
    { name: "icon only", icon: true, kicker: false, content: TITLE_H, block: 70 },
    { name: "kicker only", icon: false, kicker: true, content: KICKER_H + TITLE_H, block: KICKER_H + TITLE_H },
    { name: "neither", icon: false, kicker: false, content: TITLE_H, block: TITLE_H },
  ] as const;

  function cardProps(combo: (typeof COMBOS)[number]): DiagramCardProps {
    return {
      entityId: `entity:hdr-${combo.name}`,
      title: "People",
      body: ["ligne une"],
      footer: "service: demo",
      ...(combo.kicker ? { kicker: "K" } : {}),
      ...(combo.icon ? { icon: "people", iconGlyph: getDiagramGlyph("people") } : {}),
    };
  }

  function zoneProps(combo: (typeof COMBOS)[number]): DiagramZoneProps {
    return {
      entityId: `grp:hdr-${combo.name}`,
      title: "People",
      collapsed: false,
      toggleLabel: "Toggle",
      x: 0,
      y: 0,
      width: 492,
      ...(combo.kicker ? { kicker: "K" } : {}),
      ...(combo.icon ? { icon: "people", iconGlyph: getDiagramGlyph("people") } : {}),
    };
  }

  it("headerSlotGeometry is the single derivation for all four combinations", () => {
    for (const combo of COMBOS) {
      const geo = headerSlotGeometry({
        hasIcon: combo.icon,
        kickerLines: combo.kicker ? 1 : 0,
        titleLines: 1,
      });
      expect(geo.contentHeight, combo.name).toBe(combo.content);
      expect(geo.blockHeight, combo.name).toBe(combo.block);
      expect(geo.textTopOffset, combo.name).toBe((combo.block - combo.content) / 2);
      expect(geo.iconTopOffset, combo.name).toBe(combo.icon ? (combo.block - 70) / 2 : 0);
    }
  });

  it("layoutCard applies it: header block, centred text band, body start", () => {
    for (const combo of COMBOS) {
      const layout = layoutCard(cardProps(combo), defaultCardMeasure);
      expect(layout.headerBlockHeight, combo.name).toBe(combo.block);
      const textTop = 10 + (combo.block - combo.content) / 2;
      if (combo.kicker) expect(layout.kicker[0]?.baseline, combo.name).toBe(textTop + 22);
      expect(layout.title[0]?.baseline, combo.name).toBe(textTop + (combo.kicker ? KICKER_H : 0) + 32);
      // No icon: no 70 px floor — the body starts right after the text block.
      expect(layout.bodyArea.top, combo.name).toBe(10 + combo.block + 6);
      expect(layout.iconBox, combo.name).toEqual(
        combo.icon ? { x: 16, y: 10, size: 70 } : undefined,
      );
    }
  });

  it("renderCardSvg paints the same geometry (icon presence, body line y)", () => {
    for (const combo of COMBOS) {
      const rendered = renderCardSvg(cardProps(combo), defaultCardMeasure);
      expect(rendered.kind, combo.name).toBe("rendered");
      if (rendered.kind !== "rendered") continue;
      expect(rendered.svg.includes('data-diagram-icon="people"'), combo.name).toBe(combo.icon);
      const bodyY = 10 + combo.block + 6;
      expect(rendered.svg.includes(`y="${bodyY + 22}"`), combo.name).toBe(true);
    }
  });

  it("layoutZone / renderZoneSvg apply the same derivation in the expanded frame", () => {
    for (const combo of COMBOS) {
      const layout = layoutZone(zoneProps(combo), defaultCardMeasure, []);
      const header = layout.header;
      if (header === undefined) throw new Error("fixture-error");
      expect(header.headerBlockHeight, combo.name).toBe(combo.block);
      const textTop = 16 + (combo.block - combo.content) / 2;
      expect(header.title[0]?.baseline, combo.name).toBe(textTop + (combo.kicker ? KICKER_H : 0) + 32);
      expect(header.iconBox, combo.name).toEqual(
        combo.icon ? { x: 16, y: 16 + (combo.block - 70) / 2, size: 70 } : undefined,
      );
      // No subtitle: the header rule sits 4 px under the header block.
      expect(header.ruleY, combo.name).toBe(16 + combo.block + 4);
      const rendered = renderZoneSvg(zoneProps(combo), { measure: defaultCardMeasure });
      expect(rendered.kind, combo.name).toBe("rendered");
      if (rendered.kind !== "rendered") continue;
      expect(rendered.svg.includes('data-diagram-icon="people"'), combo.name).toBe(combo.icon);
    }
  });
});

/**
 * Review pass 2, item 9: expanded-zone vertical overflow. Automatic height
 * includes the header + content + footer requirements; an explicitly
 * undersized frame is refused with a zone-overflow diagnostic. The
 * reviewer's exact case: width 492, icon people, kicker K, title
 * "Users and operators", subtitle "Employees HR · Developers admin · HR
 * content owners", footer F, no height.
 */
describe("item 9 — expanded-zone vertical overflow: auto height covers header+content+footer, undersized frames refuse", () => {
  function reviewerZone(): DiagramZoneProps {
    return {
      entityId: "grp.review9",
      kicker: "K",
      title: "Users and operators",
      subtitle: "Employees HR · Developers admin · HR content owners",
      footer: "F",
      icon: "people",
      iconGlyph: getDiagramGlyph("people"),
      collapsed: false,
      toggleLabel: "Toggle",
      x: 0,
      y: 0,
      width: 492,
    };
  }

  it("no height: the frame grows past the 200 px floor to fit header + rule + footer", () => {
    const layout = layoutZone(reviewerZone(), defaultCardMeasure, []);
    const header = layout.header;
    if (header === undefined) throw new Error("fixture-error");
    // The reviewer's measured content start: 214.98125 (header 111.78125 +
    // subtitle 2 lines + rule + 16), beyond the old auto-sized 200 px frame.
    expect(header.contentTop).toBe(214.98125);
    expect(layout.diagnostics).toEqual([]);
    // Auto height = contentTop + bottom inset + footer reserve (49.4375).
    expect(layout.box.height).toBe(214.98125 + 16 + 49.4375);
    // The footer rule clears the content top: nothing overlaps.
    expect(header.footerRuleY).toBeGreaterThanOrEqual(header.contentTop);
    expect(header.footer[0]?.baseline).toBe(260.48125);
    const rendered = renderZoneSvg(reviewerZone(), { measure: defaultCardMeasure });
    expect(rendered.kind).toBe("rendered");
    if (rendered.kind === "rendered") {
      expect(rendered.diagnostics).toEqual([]);
      expect(rendered.svg).toContain('height="280.41875"');
    }
  });

  it("explicit undersized height 200: zone-overflow on the frame slot, refused with no svg", () => {
    const props: DiagramZoneProps = { ...reviewerZone(), height: 200 };
    const layout = layoutZone(props, defaultCardMeasure, []);
    expect(layout.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "zone-overflow",
        slot: "frame",
        entityId: "grp.review9",
        neededPx: 280.41875,
        allocatedPx: 200,
      }),
    );
    const rendered = renderZoneSvg(props, { measure: defaultCardMeasure });
    expect(rendered.kind).toBe("refused");
    if (rendered.kind === "refused") {
      expect("svg" in rendered).toBe(false);
      expect(firstOverflowDiagnostic(rendered.diagnostics)?.slot).toBe("frame");
    }
  });

  it("a fitting explicit height is accepted (no frame diagnostic)", () => {
    const props: DiagramZoneProps = { ...reviewerZone(), height: 400 };
    const layout = layoutZone(props, defaultCardMeasure, []);
    expect(layout.diagnostics).toEqual([]);
    expect(layout.box.height).toBe(400);
    expect(renderZoneSvg(props, { measure: defaultCardMeasure }).kind).toBe("rendered");
  });
});
