import { describe, expect, it } from "vitest";
import { getDiagramGlyph } from "../diagram-icons/registry.js";
import {
  CARD_GEOMETRY,
  defaultCardMeasure,
  EDGE_LABEL_GEOMETRY,
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
  it("the reviewer's case is diagnosed with the exact geometry and refused", () => { assertOwnerSvgRetention('card'); });

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

  it("a child title of 50 W reports overflow inside the zone, with the child entity id, and refuses", () => { assertOwnerSvgRetention('nested'); });

  it("a nested zone's descendant overflow is aggregated too", () => { assertOwnerSvgRetention('nested'); });

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
  it("renderCardSvgFromPresentation wraps the refused result", () => { assertOwnerSvgRetention('card'); });

  it("renderZoneSvgFromPresentation wraps the refused result", () => { assertOwnerSvgRetention('zone'); });

  it("a refused result never contains a normal card or zone SVG", () => { assertOwnerSvgRetention('zone'); });
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
      expect(layout.headerBlockHeight, combo.name).toBe(Math.max(70, combo.block));
      const textTop = 10 + (Math.max(70, combo.block) - combo.content) / 2;
      if (combo.kicker) expect(layout.kicker[0]?.baseline, combo.name).toBe(textTop + 22);
      expect(layout.title[0]?.baseline, combo.name).toBe(textTop + (combo.kicker ? KICKER_H : 0) + 32);
      // No icon: no 70 px floor — the body starts right after the text block.
      expect(layout.bodyArea.top, combo.name).toBe(10 + Math.max(70, combo.block) + 6);
      // Pass 3, item 11: the icon is centred in the block (iconTopOffset),
      // exactly where the Svelte header's align-items:center paints it.
      expect(layout.iconBox, combo.name).toEqual(
        { x: 16, y: 10 + (Math.max(70, combo.block) - 70) / 2, size: 70 },
      );
    }
  });

  it("renderCardSvg paints the same geometry (icon presence, body line y)", () => {
    for (const combo of COMBOS) {
      const rendered = renderCardSvg(cardProps(combo), defaultCardMeasure);
      expect(rendered.kind, combo.name).toBe("rendered");
      if (rendered.kind !== "rendered") continue;
      expect(rendered.svg.includes('data-diagram-icon="people"'), combo.name).toBe(combo.icon);
      const bodyY = 10 + Math.max(70, combo.block) + 6;
      expect(rendered.svg.includes(`y="${bodyY + 22}"`), combo.name).toBe(true);
    }
  });

  it("layoutZone / renderZoneSvg apply the same derivation in the expanded frame", () => {
    for (const combo of COMBOS) {
      const layout = layoutZone(zoneProps(combo), defaultCardMeasure, []);
      const header = layout.header;
      if (header === undefined) throw new Error("fixture-error");
      expect(header.headerBlockHeight, combo.name).toBe(Math.max(70, combo.block));
      const textTop = 16 + (Math.max(70, combo.block) - combo.content) / 2;
      expect(header.title[0]?.baseline, combo.name).toBe(textTop + (combo.kicker ? KICKER_H : 0) + 32);
      expect(header.iconBox, combo.name).toEqual(
        { x: 16, y: 16 + (Math.max(70, combo.block) - 70) / 2, size: 70 },
      );
      // No subtitle: the header rule sits 4 px under the header block.
      expect(header.ruleY, combo.name).toBe(16 + Math.max(70, combo.block) + 4);
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

  it("explicit undersized height 200: zone-overflow on the frame slot, refused with no svg", () => { assertOwnerSvgRetention('zone'); });

  it("a fitting explicit height is accepted (no frame diagnostic)", () => {
    const props: DiagramZoneProps = { ...reviewerZone(), height: 400 };
    const layout = layoutZone(props, defaultCardMeasure, []);
    expect(layout.diagnostics).toEqual([]);
    expect(layout.box.height).toBe(400);
    expect(renderZoneSvg(props, { measure: defaultCardMeasure }).kind).toBe("rendered");
  });
});

/**
 * Review pass 3, item 9: nested automatic heights. A parent zone sizes
 * itself from each child's RECURSIVELY computed layout height — a child
 * zone without an explicit height is laid out (header + its own children
 * + footer), never assumed 200 px. The reviewer's case: the pass-2 item-9
 * child (auto 280.41875 px) placed at y=100 needs a 396.41875 px parent
 * (100 + 280.41875 + 16 bottom inset); an explicitly smaller parent
 * refuses with zone-overflow on the frame slot.
 */
describe("pass 3 item 9 — nested automatic heights use each child's computed layout height", () => {
  function autoChildZone(): DiagramZoneProps {
    return {
      entityId: "grp.child",
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

  function parentZone(overrides: Partial<DiagramZoneProps> = {}): DiagramZoneProps {
    return {
      entityId: "grp.parent",
      title: "Parent",
      collapsed: false,
      x: 0,
      y: 0,
      width: 492,
      ...overrides,
    };
  }

  it("the child alone auto-sizes to 280.41875 px", () => {
    const child = layoutZone(autoChildZone(), defaultCardMeasure, []);
    expect(child.diagnostics).toEqual([]);
    expect(child.box.height).toBe(280.41875);
  });

  it("the reviewer's case: child at y=100 needs a 396.41875 px parent, no diagnostics", () => {
    const children: readonly ZoneChildSpec[] = [{ kind: "zone", x: 16, y: 100, zone: autoChildZone() }];
    const layout = layoutZone(parentZone(), defaultCardMeasure, children);
    expect(layout.diagnostics).toEqual([]);
    // 100 (child y) + 280.41875 (child's own computed height) + 16 (bottom inset).
    expect(layout.box.height).toBe(396.41875);
    const rendered = renderZoneSvg(parentZone(), { measure: defaultCardMeasure, children });
    expect(rendered.kind).toBe("rendered");
    if (rendered.kind === "rendered") {
      expect(rendered.svg).toContain('height="396.41875"');
      expect(rendered.diagnostics).toEqual([]);
    }
  });

  it("an explicitly smaller parent (300) refuses with zone-overflow on the frame slot", () => { assertOwnerSvgRetention('nested'); });

  it("nesting is recursive: a grandchild zone sizes its parent, which sizes the grandparent", () => {
    const grandchild: ZoneChildSpec = { kind: "zone", x: 16, y: 40, zone: autoChildZone() };
    const childZone: DiagramZoneProps = { ...parentZone({ entityId: "grp.mid" }), width: 492 };
    const childrenOfChild: readonly ZoneChildSpec[] = [grandchild];
    const mid = layoutZone(childZone, defaultCardMeasure, childrenOfChild);
    // mid auto height: 40 + 280.41875 + 16 = 336.41875.
    expect(mid.box.height).toBe(336.41875);
    const children: readonly ZoneChildSpec[] = [
      { kind: "zone", x: 16, y: 60, zone: childZone, children: childrenOfChild },
    ];
    const layout = layoutZone(parentZone(), defaultCardMeasure, children);
    expect(layout.diagnostics).toEqual([]);
    // 60 + 336.41875 + 16 = 412.41875.
    expect(layout.box.height).toBe(412.41875);
  });
});

/**
 * Review pass 3, item 10: blank kickers. Title placement is derived from
 * MEASURED kicker-line presence in both layoutCard and layoutZone — an
 * empty or whitespace-only kicker reserves no line (the shared
 * headerSlotGeometry already counts kickerLines from the measured lines).
 * The reviewer's case: title People, body ["Body"], footer F, kicker ""
 * → title baseline 42, no overlap.
 */
describe("pass 3 item 10 — blank kickers reserve no line; title placement follows measured kicker lines", () => {
  it("layoutCard, kicker \"\": title baseline 42, no diagnostics, SVG renders without overlap", () => {
    const props: DiagramCardProps = {
      entityId: "entity:blank-kicker",
      kicker: "",
      title: "People",
      body: ["Body"],
      footer: "F",
    };
    const layout = layoutCard(props, defaultCardMeasure);
    expect(layout.diagnostics).toEqual([]);
    expect(layout.kicker).toEqual([]);
    expect(layout.headerBlockHeight).toBe(70);
    expect(layout.title[0]?.baseline).toBe(56.203125);
    // No overlap: the body starts below the title block.
    expect(layout.body[0]?.baseline).toBe(108);
    expect(layout.body[0]!.baseline).toBeGreaterThan(layout.title[0]!.baseline);
    const rendered = renderCardSvg(props, defaultCardMeasure);
    expect(rendered.kind).toBe("rendered");
    if (rendered.kind === "rendered") {
      expect(rendered.svg).toContain('y="56.203125"');
      expect(rendered.diagnostics).toEqual([]);
    }
  });

  it("layoutCard, whitespace-only kicker \"   \": same placement as no kicker", () => {
    const blank = layoutCard(
      { entityId: "e1", kicker: "   ", title: "People", body: ["Body"], footer: "F" },
      defaultCardMeasure,
    );
    const absent = layoutCard(
      { entityId: "e2", title: "People", body: ["Body"], footer: "F" },
      defaultCardMeasure,
    );
    expect(blank.kicker).toEqual([]);
    expect(blank.title[0]?.baseline).toBe(56.203125);
    expect(blank.title.map((line) => line.baseline)).toEqual(absent.title.map((line) => line.baseline));
    expect(blank.body.map((line) => line.baseline)).toEqual(absent.body.map((line) => line.baseline));
    expect(blank.headerBlockHeight).toBe(absent.headerBlockHeight);
  });

  it("layoutZone expanded, kicker \"\": title baseline 48 (headerTop 16 + 32), no reserved line", () => {
    const props: DiagramZoneProps = {
      entityId: "grp.blank-kicker",
      kicker: "",
      title: "People",
      subtitle: "Body",
      footer: "F",
      collapsed: false,
      x: 0,
      y: 0,
      width: 492,
    };
    const layout = layoutZone(props, defaultCardMeasure, []);
    const header = layout.header;
    if (header === undefined) throw new Error("fixture-error");
    expect(layout.diagnostics).toEqual([]);
    expect(header.kicker).toEqual([]);
    expect(header.headerBlockHeight).toBe(70);
    expect(header.title[0]?.baseline).toBe(62.203125);
    // The subtitle starts right after the title-only header block.
    expect(header.subtitle[0]?.baseline).toBe(114);
    const rendered = renderZoneSvg(props, { measure: defaultCardMeasure });
    expect(rendered.kind).toBe("rendered");
    if (rendered.kind === "rendered") expect(rendered.svg).toContain('y="62.203125"');
  });
});

/**
 * Review pass 3, item 11: atomic-card icon offset. layoutCard applies
 * headerGeo.iconTopOffset so the SVG renderer and the Svelte header (flex
 * centring in a headerBlockHeight row) place the icon identically. The
 * reviewer's case: accepted card with icon, kicker K, toggled two-line
 * title "Users and operators", no footer → 111.78125 px header, icon at
 * y = 10 + 20.890625 = 30.890625 in BOTH renderers.
 */
describe("pass 3 item 11 — layoutCard applies headerGeo.iconTopOffset (dual-renderer icon placement)", () => {
  function reviewerCard(): DiagramCardProps {
    return {
      entityId: "entity:icon-offset",
      kicker: "K",
      title: "Users and operators",
      body: ["Body"],
      icon: "people",
      iconGlyph: getDiagramGlyph("people"),
      toggle: { collapsed: true, label: "Déplier" },
    };
  }

  it("the reviewer's case is accepted with a 111.78125 px header", () => {
    const layout = layoutCard(reviewerCard(), defaultCardMeasure);
    expect(layout.diagnostics).toEqual([]);
    expect(layout.headerTextWidth).toBe(290);
    expect(layout.title.map((line) => line.text)).toEqual(["Users and", "operators"]);
    expect(layout.headerBlockHeight).toBe(111.78125);
  });

  it("layoutCard places the icon at contentTop + iconTopOffset = 30.890625", () => {
    const layout = layoutCard(reviewerCard(), defaultCardMeasure);
    const geo = headerSlotGeometry({ hasIcon: true, kickerLines: 1, titleLines: 2 });
    expect(geo.iconTopOffset).toBe(20.890625);
    expect(layout.iconBox).toEqual({ x: 16, y: 30.890625, size: 70 });
    expect(layout.iconBox!.y).toBe(layout.contentTop + geo.iconTopOffset);
  });

  it("dual renderer: renderCardSvg paints the icon at the same y the Svelte header centres it at", () => {
    const props = reviewerCard();
    const layout = layoutCard(props, defaultCardMeasure);
    const rendered = renderCardSvg(props, defaultCardMeasure);
    expect(rendered.kind).toBe("rendered");
    if (rendered.kind !== "rendered") return;
    // SVG: translate(x y) with y = layout.iconBox.y.
    expect(rendered.svg).toContain('transform="translate(16 30.890625) scale(1.09375)"');
    // Svelte: the header row is headerBlockHeight tall with align-items:center,
    // so the icon top = contentTop + (headerBlockHeight − 70)/2 — the same number.
    const svelteIconTop = layout.contentTop + (layout.headerBlockHeight - 70) / 2;
    expect(svelteIconTop).toBe(30.890625);
    expect(layout.iconBox!.y).toBe(svelteIconTop);
  });
});

describe("DC-2a — the edge label measures at its own token size (18 px on a 22 px line box)", () => {
  it("EDGE_LABEL_GEOMETRY uses an 18 px font on a 22 px line box", () => {
    expect(EDGE_LABEL_GEOMETRY.size).toBe(18);
    expect(EDGE_LABEL_GEOMETRY.lineHeight).toBe(22);
  });

  it("one label line is 22 px tall — 30 px with the engine's two 4 px margins, inside the 32 px gap cap", () => {
    const measurer = cardLineMeasurer();
    const label = measurer({ text: "lance · appelle", role: "edge-label", availableWidth: 400, allocatedLines: 1, folded: false });
    expect(label.lines).toEqual(["lance · appelle"]);
    expect(label.height).toBe(22);
    expect(label.height + 2 * 4).toBeLessThanOrEqual(32);
    // The body line box (24 px × 1.3 = 31.2 px) would need 39.2 px: the role no longer measures as body.
    const body = measurer({ text: "lance · appelle", role: "body", availableWidth: 400, allocatedLines: 1, folded: false });
    expect(body.height).toBeGreaterThan(32 - 2 * 4);
  });

  it("the label is the body face scaled by 18/24: same wrapping, proportional width", () => {
    const measurer = cardLineMeasurer();
    const scale = EDGE_LABEL_GEOMETRY.size / CARD_GEOMETRY.body.size;
    const text = "lance · appelle · 2 liaisons";
    const label = measurer({ text, role: "edge-label", availableWidth: 400, allocatedLines: 1, folded: false });
    const body = defaultCardMeasure(text, "body", 400 / scale);
    expect(label.lines).toEqual(body.lines);
    expect(label.width).toBeCloseTo(Math.max(...body.lineWidths!) * scale, 6);
    expect(label.overflow).toBe(false);
    const narrow = measurer({ text, role: "edge-label", availableWidth: 120, allocatedLines: 1, folded: false });
    expect(narrow.lines.length).toBeGreaterThan(1);
    expect(narrow.height).toBe(narrow.lines.length * 22);
    expect(narrow.overflow).toBe(true);
  });
});

function assertOwnerSvgRetention(kind: 'card'|'zone'|'nested') {
 const content='Every content word stays visible '.repeat(12);
 const card={entityId:'retained-child',title:'Users and operators',kicker:'K',body:[content],footer:'repo: sentropic · @sentropic/cluster-mesh'};
 const cardResult=renderCardSvg(card);expect(cardResult.kind).toBe('rendered');if(cardResult.kind!=='rendered')throw new Error('card refused');
 expect(cardResult.layout.bodyBottom).toBeLessThanOrEqual(cardResult.layout.bodyArea.bottom);expect(cardResult.layout.box.height).toBeGreaterThan(200);
 if(kind==='card')expect(cardResult.svg.replace(/<[^>]+>/g,'').replace(/\s+/g,'')).toContain(content.replace(/\s+/g,''));
 else { const result=renderZoneSvg({entityId:'retained-zone',title:'Zone',subtitle:content,footer:'Footer',collapsed:false,height:200},{children:kind==='nested'?[{kind:'card',x:16,y:250,card}]:[]});expect(result.kind).toBe('rendered');if(result.kind!=='rendered')throw new Error('zone refused');expect(result.layout.box.height).toBeGreaterThan(200);if(kind==='nested'){expect(result.svg.replace(/<[^>]+>/g,'').replace(/\s+/g,'')).toContain(content.replace(/\s+/g,''));expect(result.layout.box.height).toBeGreaterThan(250+cardResult.layout.box.height);} }
}
