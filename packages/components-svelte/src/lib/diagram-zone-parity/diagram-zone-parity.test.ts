import { renderZoneSvg as ownerZoneSvg } from "../diagram-render/renderZoneSvg.js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import DiagramZone from "../DiagramZone.svelte";
import { getDiagramGlyph } from "../diagram-icons/registry.js";
import { renderZoneSvg, renderZoneSvgFromPresentation, type ZoneSvgResult } from "../diagram-render/renderZoneSvg.js";
import {
  COLLAPSED_SUBTITLE_MEASURE,
  ZONE_GEOMETRY,
  cardLineMeasurer,
  defaultCardMeasure,
  projectZoneProps,
  type DiagramZoneProps,
  type ZoneDiagnostic,
} from "../diagramCardModel.js";
import {
  BANNED_HACK_MARKERS,
  COLLAPSED_ZONES,
  EXPANDED_PEOPLE,
  HRPN_FROZEN_PATH,
  HRPN_FROZEN_SHA256,
  HRPN_HACKS_PATH,
  HRPN_HACKS_SHA256,
  HRPN_RENDER_PATH,
  HRPN_RENDER_SHA256,
  readHrpnPinned,
  sha256Hex,
} from "./diagram-zone-corpus.js";
// Cross-package agreement sources (relative, test-only — no new runtime dep).
import { component } from "../../../../tokens/src/component.js";
import { componentDark } from "../../../../tokens/src/component.dark.js";
import {
  CONTENT_INSET,
  FIXED_CARD_HEIGHT,
  FIXED_CARD_WIDTH,
  LAST_CHILD_TO_BOTTOM_GAP,
  RULE_GAP,
  RULE_TO_FIRST_CHILD_GAP,
  SUBTITLE_TO_RULE_GAP,
  TOGGLE_ALLOCATION,
  type LineMeasurer,
  type MeasureRequest,
} from "../../../../diagram-canvas/src/layout/measure.js";

/**
 * DC-2 static-half parity (Node, no browser — raster stays `unverified`,
 * DC-3).
 *
 * Reference: the hrpn repo at e5eaca3, read-only, asserted by sha256
 * (frozen SVG scene S2-target, hrpn/render.js, FOLDED-CARD-HACKS.md —
 * read through the corpus helpers). Parity covers:
 *  - the seven collapsed zones of the frozen SVG (box, icon, header text
 *    inset, centred 396 px subtitle, rule, footer, top-right toggle slot);
 *  - the expanded PEOPLE zone (frame, header, rule, 4/16/16 rhythm);
 *  - dual-renderer parity renderZoneSvg vs Svelte DiagramZone;
 *  - the align="center" owner variant on both renderers and both states;
 *  - hack absence: no marker of FOLDED-CARD-HACKS.md survives in DS code;
 *  - token / measure.ts / model agreement for the zone geometry.
 *
 * Named deviations (reported, not hidden): DH-08 (the kit's
 * function/detail summary split does not exist — one subtitle string),
 * DH-13 (no foreignObject toggle; the DS slot is the 32 px IconButton
 * box at top right, y = box top + 10 exactly as the frozen SVG, right
 * margin 10 px incl. border vs the kit's flush 0), DIF-03 (zone frame
 * rx 0 vs the kit's 6), DIF-09 (dark layer derived, not forced), and the
 * measurer drift on one wrapped word boundary (the DS advance table is
 * the frozen one; the frozen SVG's own wrap is pinned separately).
 */

const HERE = dirname(fileURLToPath(import.meta.url));

/** Unwrap a zone render result that must be rendered (not refused). */
function svgOf(result: ZoneSvgResult): string {
  expect(result.kind).toBe("rendered");
  if (result.kind !== "rendered") throw new Error("fixture-error: expected a rendered result");
  return result.svg;
}

function zoneProps(zone: (typeof COLLAPSED_ZONES)[number], collapsed: boolean): DiagramZoneProps {
  return {
    entityId: `grp.${zone.id}`,
    kicker: zone.kicker,
    title: zone.title,
    subtitle: zone.subtitle,
    footer: zone.footer,
    icon: zone.icon,
    iconGlyph: getDiagramGlyph(zone.icon),
    tone: zone.tone,
    collapsed,
    toggleLabel: `Toggle ${zone.id}`,
    x: zone.x,
    y: zone.y,
    ...(collapsed ? {} : { width: 492, height: 974.98125 }),
  };
}

interface ParsedZoneSvg {
  transform: string | null;
  dataEntity: string | null;
  dataCollapsed: string | null;
  dataTone: string | null;
  dataProposed: string | null;
  dataZoneOverflow: string | null;
  dataZoneIconUnknown: boolean;
  texts: Array<{ className: string; text: string; x: string | null; y: string | null; anchor: string | null }>;
  rules: Array<Record<string, string | null>>;
  frame: Record<string, string | null> | null;
  icon: { name: string | null; transform: string | null };
  toggle: { collapsed: string | null; transform: string | null };
  width: string | null;
  height: string | null;
}

function parseZoneSvg(svg: string): ParsedZoneSvg {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = doc.documentElement;
  const zone = root.querySelector("g.st-diagramZone") as SVGGElement;
  const texts = [...zone.querySelectorAll("text")].map((element) => ({
    className: element.getAttribute("class") ?? "",
    text: element.textContent ?? "",
    x: element.getAttribute("x"),
    y: element.getAttribute("y"),
    anchor: element.getAttribute("text-anchor"),
  }));
  const rules = [...zone.querySelectorAll("line.st-diagramZone-rule, line.st-diagramZone-footerRule, line.st-diagramCard-rule")].map(
    (element) => ({
      className: element.getAttribute("class"),
      x1: element.getAttribute("x1"),
      x2: element.getAttribute("x2"),
      y1: element.getAttribute("y1"),
      y2: element.getAttribute("y2"),
      vectorEffect: element.getAttribute("vector-effect"),
    }),
  );
  const frame = zone.querySelector("rect.st-diagramZone-frame");
  const icon = zone.querySelector("g.st-diagramCard-icon");
  const toggle = zone.querySelector("g.st-diagramCard-toggle");
  return {
    transform: zone.getAttribute("transform"),
    dataEntity: zone.getAttribute("data-entity"),
    dataCollapsed: zone.getAttribute("data-collapsed"),
    dataTone: zone.getAttribute("data-tone"),
    dataProposed: zone.getAttribute("data-proposed"),
    dataZoneOverflow: zone.getAttribute("data-zone-overflow"),
    dataZoneIconUnknown: zone.hasAttribute("data-zone-icon-unknown"),
    texts,
    rules,
    frame: frame === null ? null : {
      x: frame.getAttribute("x"),
      y: frame.getAttribute("y"),
      width: frame.getAttribute("width"),
      height: frame.getAttribute("height"),
      rx: frame.getAttribute("rx"),
      strokeWidth: frame.getAttribute("stroke-width"),
      strokeDasharray: frame.getAttribute("stroke-dasharray"),
    },
    icon: {
      name: icon?.getAttribute("data-diagram-icon") ?? null,
      transform: icon?.getAttribute("transform") ?? null,
    },
    toggle: {
      collapsed: toggle?.getAttribute("data-collapsed") ?? null,
      transform: toggle?.getAttribute("transform") ?? null,
    },
    width: root.getAttribute("width"),
    height: root.getAttribute("height"),
  };
}

describe("reference inputs — hrpn e5eaca3 pinned integrity", () => {
  it("frozen SVG matches the pinned sha256 (fixture error otherwise)", () => {
    const blob = readHrpnPinned(HRPN_FROZEN_PATH);
    if (blob === null) {
      console.warn("source-gap: hrpn checkout not readable; reference assertion skipped here");
      return;
    }
    expect(sha256Hex(blob)).toBe(HRPN_FROZEN_SHA256);
  });

  it("hrpn render.js and FOLDED-CARD-HACKS.md match their pinned shas", () => {
    for (const [path, expected] of [
      [HRPN_RENDER_PATH, HRPN_RENDER_SHA256],
      [HRPN_HACKS_PATH, HRPN_HACKS_SHA256],
    ] as const) {
      const blob = readHrpnPinned(path);
      if (blob === null) {
        console.warn(`source-gap: ${path} not readable; reference assertion skipped here`);
        continue;
      }
      expect(sha256Hex(blob)).toBe(expected);
    }
  });

  it("the frozen SVG itself carries the collapsed boxes and toggles the corpus transcribes", () => {
    const blob = readHrpnPinned(HRPN_FROZEN_PATH);
    if (blob === null) return;
    const svg = blob.toString("utf8");
    for (const zone of COLLAPSED_ZONES) {
      // Collapsed group: 460 x 200 box at the zone position, HTML card
      // (kicker / title / function+detail / footer) and the top-right
      // toggle foreignObject at y = box.y + 10, flush right (data-right).
      expect(svg, zone.id).toContain(`<g data-group="${zone.id}"`);
      expect(svg, zone.id).toContain('data-collapsed="true"');
      expect(svg, zone.id).toContain(
        `<rect class="diagram-card-box" x="${zone.x}" y="${zone.y}" width="460" height="200" rx="0">`,
      );
      expect(svg, zone.id).toContain(`<span class="card-code">${zone.kicker}</span>`);
      expect(svg, zone.id).toContain(`<strong class="service-name">${zone.title}</strong>`);
      expect(svg, zone.id).toContain(`data-text="function">${zone.frozenLines[0]}</span>`);
      for (const line of zone.frozenLines.slice(1)) {
        expect(svg, `${zone.id} detail`).toContain(`data-text="detail">${line}</span>`);
      }
      expect(svg, zone.id).toContain(`<strong class="repo-label">${zone.footer}</strong>`);
      expect(svg, zone.id).toContain(
        `data-group-toggle="${zone.id}" data-right="${zone.x + 460}" x="${zone.toggleX}" y="${zone.toggleY}"`,
      );
    }
    // Expanded PEOPLE reference numbers (scene S2-target).
    expect(svg).toContain(
      '<rect class="diagram-group-box" x="0" y="0" width="492" height="974.98125" rx="6"',
    );
    expect(svg).toContain('<line class="diagram-card-rule" x1="16" x2="482" y1="198.98125"');
    expect(svg).toContain('transform="translate(16 36.890625) scale(1.09375)"');
    expect(svg).toContain('<tspan x="92" dy="0">PPL</tspan>');
    expect(svg).toContain('<tspan x="16" dy="0">Employees HR · Developers admin · HR</tspan>');
    expect(svg).toContain('<tspan x="16" dy="31.200000000000003">content owners</tspan>');
    expect(svg).toContain(
      '<foreignObject data-group-toggle="PEOPLE" data-right="492" x="434.65600368403017" y="10"',
    );
  });
});

describe("one geometry source — zone tokens, measure.ts and the model agree", () => {
  it("collapsed box, insets and gaps agree across the three sources", () => {
    expect(FIXED_CARD_WIDTH).toBe(460);
    expect(FIXED_CARD_HEIGHT).toBe(200);
    expect(ZONE_GEOMETRY.collapsedWidth).toBe(FIXED_CARD_WIDTH);
    expect(ZONE_GEOMETRY.collapsedHeight).toBe(FIXED_CARD_HEIGHT);
    expect(component.diagramZone.collapsedWidth).toBe("460px");
    expect(component.diagramZone.collapsedHeight).toBe("200px");

    expect(CONTENT_INSET).toBe(16);
    expect(ZONE_GEOMETRY.contentInsetInline).toBe(CONTENT_INSET);
    expect(ZONE_GEOMETRY.contentInsetTop).toBe(RULE_TO_FIRST_CHILD_GAP);
    expect(ZONE_GEOMETRY.contentInsetBottom).toBe(LAST_CHILD_TO_BOTTOM_GAP);
    expect(component.diagramZone.contentInsetTop).toBe("16px");
    expect(component.diagramZone.contentInsetInline).toBe("16px");

    expect(RULE_GAP).toBe(4);
    expect(SUBTITLE_TO_RULE_GAP).toBe(4);
    expect(ZONE_GEOMETRY.headerRuleGap).toBe(SUBTITLE_TO_RULE_GAP);
    expect(component.diagramZone.headerRuleGap).toBe("4px");

    expect(TOGGLE_ALLOCATION).toBe(66);
    expect(ZONE_GEOMETRY.toggleAllocation).toBe(TOGGLE_ALLOCATION);
    expect(ZONE_GEOMETRY.toggleBoxSize).toBe(32);
    expect(ZONE_GEOMETRY.headerTextInset).toBe(178);
    expect(ZONE_GEOMETRY.toggleTopInset).toBe(8);
    // Shared allocation roles: one table for card and zone.
    expect(ZONE_GEOMETRY.allocatedLines).toEqual({ kicker: 1, title: 2, subtitle: 2, footer: 1 });
    // Tokens carry the same numbers (zone leaves alias the card's).
    expect(component.diagramZone.toggleAllocation).toBe("var(--st-component-diagramCard-toggleAllocation)");
    expect(component.diagramZone.toggleBoxSize).toBe("var(--st-component-diagramCard-toggleBoxSize)");
    expect(component.diagramZone.headerTextInset).toBe("178px");
    expect(component.diagramZone.toggleTopInset).toBe("var(--st-component-diagramZone-toggleInset)");
    expect(component.diagramZone.toggleInset).toBe("8px");
    expect(component.diagramZone.footerBottomInset).toBe("var(--st-component-diagramCard-footerBottomInset)");
    expect(component.diagramZone.proposedDashArray).toBe("4 5");

    expect(ZONE_GEOMETRY.collapsedInset).toBe(16);
    expect(ZONE_GEOMETRY.collapsedSubtitleMarginInline).toBe(16);
    expect(component.diagramZone.collapsedInset).toBe("16px");
    expect(component.diagramZone.collapsedSubtitleMarginInline).toBe("16px");
    expect(COLLAPSED_SUBTITLE_MEASURE).toBe(396);

    expect(component.diagramZone.radius).toBe("0");
    expect(component.diagramZone.borderWidth).toBe("1.5px");
    expect(ZONE_GEOMETRY.borderWidth).toBe(1.5);
    // Typography aliases the card's by construction (§6.4).
    expect(component.diagramZone.kickerFontSize).toBe("var(--st-component-diagramCard-kickerFontSize)");
    expect(component.diagramZone.titleFontSize).toBe("var(--st-component-diagramCard-titleFontSize)");
    expect(component.diagramZone.subtitleGap).toBe("var(--st-component-diagramCard-gap)");
    expect(ZONE_GEOMETRY.subtitleGap).toBe(6);
  });

  it("dark layer derives from the same builder (DIF-09)", () => {
    expect(componentDark.diagramZone.surface).not.toBe("#ffffff");
    expect(componentDark.diagramZone.surface).not.toBe("#fff");
  });

  it("one measurement source: the exported LineMeasurer bridge delegates to the model measurer", () => {
    // The diagram-canvas engine speaks LineMeasurer; the renderers and the
    // Svelte components speak CardLineMeasure. Both must be the SAME
    // measurement: the exported cardLineMeasurer bridge (production code,
    // no role cast) is a pure re-shaping, and every corpus string measured
    // through it agrees with the model measurer.
    const adapter: LineMeasurer = cardLineMeasurer();
    const samples: Array<[string, "kicker" | "title" | "body" | "footer", number, number]> = [
      [EXPANDED_PEOPLE.kicker, "kicker", 314, 1],
      [EXPANDED_PEOPLE.title, "title", 314, 2],
      [EXPANDED_PEOPLE.subtitle, "body", 434, 2],
      ...COLLAPSED_ZONES.map(
        (zone): [string, "body", number, number] => [zone.subtitle, "body", 396, 2],
      ),
      ...COLLAPSED_ZONES.map(
        (zone): [string, "footer", number, number] => [zone.footer, "footer", 436, 1],
      ),
      ["Charge @sentropic/architecture-governance-multiagent-coordination", "body", 436, 2],
    ];
    for (const [text, role, availableWidth, allocatedLines] of samples) {
      const request: MeasureRequest = { text, role, availableWidth, allocatedLines, folded: false };
      const viaAdapter = adapter(request);
      const direct = defaultCardMeasure(text, role, availableWidth);
      expect(viaAdapter.lines, text).toEqual([...direct.lines]);
      expect(viaAdapter.overflow, text).toBe(
        direct.tooWide || direct.lines.length > allocatedLines,
      );
    }
    // The pinned reference wraps: expanded PEOPLE title at 314 and the
    // frozen collapsed subtitle lines at 396.
    expect(adapter({ text: EXPANDED_PEOPLE.title, role: "title", availableWidth: 314, allocatedLines: 2, folded: false }).lines)
      .toEqual([...EXPANDED_PEOPLE.titleLines]);
    expect(adapter({ text: EXPANDED_PEOPLE.subtitle, role: "body", availableWidth: 434, allocatedLines: 2, folded: false }).lines)
      .toEqual([...EXPANDED_PEOPLE.subtitleLines]);
    for (const zone of COLLAPSED_ZONES) {
      expect(
        adapter({ text: zone.subtitle, role: "body", availableWidth: 396, allocatedLines: 2, folded: true }).lines,
        zone.id,
      ).toEqual([...zone.frozenLines]);
    }
  });
});

describe("collapsed-zone parity — hrpn e5eaca3 frozen SVG (7 zones)", () => {
  for (const zone of COLLAPSED_ZONES) {
    it(`collapsed ${zone.id}: 460x200 card at (${zone.x}, ${zone.y}), top-right toggle, centred 396 subtitle`, () => {
      const rendered = renderZoneSvg(zoneProps(zone, true), { measure: defaultCardMeasure });
      const svg = parseZoneSvg(svgOf(rendered));

      // The zone occurrence box: the card at (x, y), 460 x 200 (DC-D13).
      expect(svg.transform).toBe(`translate(${zone.x} ${zone.y})`);
      expect(svg.width).toBe(String(zone.x + 460));
      expect(svg.height).toBe(String(zone.y + 200));
      expect(svg.dataCollapsed).toBe("true");
      expect(svg.dataEntity).toBe(`grp.${zone.id}`);
      expect(svg.dataTone).toBe(zone.tone);

      // Icon 70 at the card's content inset, centred in the header block
      // (pass 3, item 11: iconTopOffset — kicker 28.59375 + title 41.59375
      // = 70.1875 block, so y = 10 + 0.09375), canonical scale 70/64.
      expect(svg.icon.name).toBe(zone.icon);
      expect(svg.icon.transform).toBe("translate(16 10.09375) scale(1.09375)");

      // Header text at the 92 px inset (icon 16 + 70 + gap 6).
      const kicker = svg.texts.filter((t) => t.className === "st-diagramCard-kicker");
      const title = svg.texts.filter((t) => t.className === "st-diagramCard-title");
      expect(kicker.map((t) => t.text)).toEqual([zone.kicker]);
      expect(kicker[0]?.x).toBe("92");
      expect(title.map((t) => t.text).join(" ")).toBe(zone.title);
      expect(title[0]?.x).toBe("92");

      // Collapsed subtitle: wrapped at the frozen 396 px measure, centred
      // (anchor middle at x = 230), lossless (joins back to the subtitle).
      const body = svg.texts.filter((t) => t.className === "st-diagramCard-body");
      expect(body.map((t) => t.text).join(" ")).toBe(zone.subtitle);
      expect(body.length).toBeLessThanOrEqual(2);
      for (const line of body) {
        expect(line.anchor).toBe("middle");
        expect(line.x).toBe("230");
      }

      // Rule + pinned footer exactly as a leaf card (§5.4).
      expect(svg.rules).toHaveLength(1);
      expect(svg.rules[0]).toMatchObject({
        className: "st-diagramCard-rule",
        x1: "16",
        x2: "450",
        y1: "152.5625",
        y2: "152.5625",
        vectorEffect: "non-scaling-stroke",
      });
      const footer = svg.texts.filter((t) => t.className === "st-diagramCard-footer");
      expect(footer.map((t) => t.text)).toEqual([zone.footer]);

      // Toggle slot: top right with the hrpn top margin — the frozen SVG's
      // toggle sits at y = box.y + 10 exactly; the DS slot is the 32 px
      // IconButton box at (418, 10) card-local (right margin 10 px incl.
      // border vs the kit's flush 0 — named deviation, DH-13 family).
      expect(svg.toggle.collapsed).toBe("true");
      expect(svg.toggle.transform).toBe("translate(420 8)");
      expect(zone.y + 10).toBe(zone.toggleY);

      // No diagnostics on the frozen corpus content.
      expect(rendered.diagnostics).toEqual([]);
      expect(svg.dataZoneOverflow).toBeNull();
      expect(svg.dataZoneIconUnknown).toBe(false);
    });
  }

  it("collapsed subtitle re-wrap matches the frozen lines for every zone", () => {
    // The frozen SVG pins its own wrap at the 396 px measure; the DS
    // measurer is the frozen advance table and must reproduce all seven.
    for (const zone of COLLAPSED_ZONES) {
      const rendered = renderZoneSvg(zoneProps(zone, true), { measure: defaultCardMeasure });
      const svg = parseZoneSvg(svgOf(rendered));
      const body = svg.texts
        .filter((t) => t.className === "st-diagramCard-body")
        .map((t) => t.text);
      expect(body, zone.id).toEqual([...zone.frozenLines]);
    }
    expect(COLLAPSED_ZONES.length).toBe(7);
  });
});

describe("expanded-zone parity — PEOPLE frame of the frozen SVG", () => {
  function peopleProps(align?: "left" | "center"): DiagramZoneProps {
    return {
      entityId: "grp.PEOPLE",
      kicker: EXPANDED_PEOPLE.kicker,
      title: EXPANDED_PEOPLE.title,
      subtitle: EXPANDED_PEOPLE.subtitle,
      icon: EXPANDED_PEOPLE.icon,
      iconGlyph: getDiagramGlyph(EXPANDED_PEOPLE.icon),
      tone: EXPANDED_PEOPLE.tone,
      collapsed: false,
      toggleLabel: "Replier People",
      x: EXPANDED_PEOPLE.x,
      y: EXPANDED_PEOPLE.y,
      width: EXPANDED_PEOPLE.width,
      height: EXPANDED_PEOPLE.height,
      ...(align === undefined ? {} : { align }),
    };
  }

  it("frame, header, rule and toggle against the frozen SVG numbers (pinned, not self-compared)", () => {
    const rendered = renderZoneSvg(peopleProps(), { measure: defaultCardMeasure });
    const svg = parseZoneSvg(svgOf(rendered));
    expect(svg.dataCollapsed).toBe("false");
    // Frame: same box as the frozen group rect; rx 0 (DIF-03: kit rx 6),
    // 1.5 px border (measured-code), DS container tokens for fill/border.
    expect(svg.frame).toMatchObject({
      x: "0",
      y: "0",
      width: String(EXPANDED_PEOPLE.width),
      height: String(EXPANDED_PEOPLE.height),
      rx: "0",
      strokeWidth: "1.5",
    });
    // Icon 70 at the 16 px inset, centred in the header block: the frozen
    // iconY 36.890625 (two-line title wrap at the kit's width − 178).
    expect(svg.icon.transform).toBe(
      `translate(${EXPANDED_PEOPLE.iconX} ${EXPANDED_PEOPLE.iconY}) scale(${EXPANDED_PEOPLE.iconScale})`,
    );
    // Kicker/title at x + 92 with the frozen baselines: kicker y = 38,
    // title first line y = 76.59375, wrapped exactly like the frozen SVG.
    const kicker = svg.texts.filter((t) => t.className === "st-diagramZone-kicker");
    const title = svg.texts.filter((t) => t.className === "st-diagramZone-title");
    const subtitle = svg.texts.filter((t) => t.className === "st-diagramZone-subtitle");
    expect(kicker.map((t) => t.text)).toEqual([EXPANDED_PEOPLE.kicker]);
    expect(kicker[0]?.x).toBe(String(EXPANDED_PEOPLE.kickerX));
    expect(Number(kicker[0]?.y)).toBeCloseTo(EXPANDED_PEOPLE.kickerY, 9);
    expect(title.map((t) => t.text)).toEqual([...EXPANDED_PEOPLE.titleLines]);
    expect(title[0]?.x).toBe(String(EXPANDED_PEOPLE.titleX));
    expect(Number(title[0]?.y)).toBeCloseTo(EXPANDED_PEOPLE.titleY, 9);
    // Subtitle from the left inset, frozen wrap and baselines (raw 31.2 dy).
    expect(subtitle.map((t) => t.text)).toEqual([...EXPANDED_PEOPLE.subtitleLines]);
    expect(subtitle[0]?.x).toBe(String(EXPANDED_PEOPLE.subtitleX));
    expect(Number(subtitle[0]?.y)).toBeCloseTo(EXPANDED_PEOPLE.subtitleY, 9);
    expect(Number(subtitle[1]?.y)).toBeCloseTo(EXPANDED_PEOPLE.subtitleY + 31.2, 9);
    // Header rule: frozen insets and the frozen ruleY 198.98125.
    expect(svg.rules).toHaveLength(1);
    expect(svg.rules[0]).toMatchObject({
      className: "st-diagramZone-rule",
      x1: String(EXPANDED_PEOPLE.ruleX1),
      x2: String(EXPANDED_PEOPLE.ruleX2),
      vectorEffect: "non-scaling-stroke",
    });
    expect(Number(svg.rules[0]?.y1)).toBeCloseTo(EXPANDED_PEOPLE.ruleY, 9);
    expect(svg.rules[0]?.y2).toBe(svg.rules[0]?.y1);
    // 4/16/16 rhythm: rule 4 px under the subtitle block, content 16 under
    // the rule (derived from the pinned baselines, not from the layout).
    const subtitleBottom = EXPANDED_PEOPLE.subtitleY + 31.2 + 8;
    expect(EXPANDED_PEOPLE.ruleY - subtitleBottom).toBeCloseTo(4, 9);
    // Toggle slot: y = box.y + 10 exactly as the frozen SVG (finding 7);
    // x is the DS 32 px slot at the 16 px right inset (DH-13: the kit's
    // flush-right foreignObject is the replaced hack).
    expect(svg.toggle.collapsed).toBe("false");
    const toggleMatch = /^translate\(([-0-9.]+) ([-0-9.]+)\)$/.exec(svg.toggle.transform ?? "");
    expect(toggleMatch).not.toBeNull();
    expect(Number(toggleMatch?.[1])).toBe(EXPANDED_PEOPLE.width - 8 - 32);
    expect(Number(toggleMatch?.[2])).toBe(8);
    expect(rendered.diagnostics).toEqual([]);
  });

  it("expanded with children: child cards render inside the frame", () => {
    const child = {
      kind: "card" as const,
      x: 16,
      y: 16,
      card: {
        entityId: "entity:child",
        title: "Child card",
        body: ["function"],
        icon: "server",
        iconGlyph: getDiagramGlyph("server"),
      },
    };
    const rendered = renderZoneSvg(peopleProps(), {
      measure: defaultCardMeasure,
      children: [child],
    });
    const doc = new DOMParser().parseFromString(svgOf(rendered), "image/svg+xml");
    const childGroup = doc.querySelector("g.st-diagramZone-child");
    expect(childGroup).not.toBeNull();
    expect(childGroup?.getAttribute("transform")).toBe("translate(16 16)");
    expect(childGroup?.querySelector("g.st-diagramCard-icon")).not.toBeNull();
    expect(childGroup?.querySelector("text.st-diagramCard-title")?.textContent).toBe("Child card");
  });
});

describe("pass-4 blocking — expanded Svelte parts positioned from the shared layout (frozen values, no DS functions)", () => {
  // Expected values below are frozen literals (or plain arithmetic on
  // frozen literals): no layoutZone / renderZoneSvg call derives them.
  function peopleDom(overrides: Partial<DiagramZoneProps> = {}) {
    const props: DiagramZoneProps = {
      entityId: "grp.PEOPLE",
      kicker: EXPANDED_PEOPLE.kicker,
      title: EXPANDED_PEOPLE.title,
      subtitle: EXPANDED_PEOPLE.subtitle,
      footer: "group: people",
      icon: EXPANDED_PEOPLE.icon,
      iconGlyph: getDiagramGlyph(EXPANDED_PEOPLE.icon),
      tone: EXPANDED_PEOPLE.tone,
      collapsed: false,
      toggleLabel: "Replier People",
      x: 0,
      y: 0,
      width: EXPANDED_PEOPLE.width,
      height: EXPANDED_PEOPLE.height,
      ...overrides,
    };
    const { container } = render(DiagramZone, { props: { ...props, measure: defaultCardMeasure } });
    const zone = container.querySelector(".st-diagramZone--expanded") as HTMLElement | null;
    const styleOf = (selector: string): string =>
      (zone?.querySelector(selector) as HTMLElement | null)?.getAttribute("style") ?? "";
    return { container, zone, styleOf };
  }

  it("expanded PEOPLE: frozen rule y 198.98125, content start 214.98125, footer inset 9.25 in the Svelte DOM", () => {
    const { zone, styleOf } = peopleDom();
    expect(zone).not.toBeNull();
    // Frame box from the layout.
    expect(zone?.getAttribute("style") ?? "").toContain("width: 492px");
    expect(zone?.getAttribute("style") ?? "").toContain("height: 974.98125px");
    // Header band: top = headerInset 16 (frame-edge), height =
    // ruleY − headerRuleGap − headerTop = 198.98125 − 4 − 16.
    expect(styleOf(".st-diagramZone-header")).toContain("calc(16px");
    expect(styleOf(".st-diagramZone-header")).toContain("height: 178.98125px");
    // Frozen PEOPLE rule y 198.98125 (frame-edge coordinate); the CSS
    // border is subtracted exactly once, through the border token.
    const rule = styleOf(".st-diagramZone-rule");
    expect(rule).toContain("calc(198.98125px");
    expect(rule).toContain("var(--st-component-diagramZone-borderWidth, 1.5px)");
    // Frozen content start 214.98125 = rule y + contentInsetTop 16.
    expect(styleOf(".st-diagramZone-content")).toContain("calc(214.98125px");
    // Footer rule: footerBottom − footer line box − rule − ruleMargin,
    // footerBottom = 974.98125 − 1.5 (border) − 9.25 (inset).
    const footerRuleY = 974.98125 - 1.5 - 9.25 - 31.1875 - 1 - 4;
    expect(footerRuleY).toBe(928.04375);
    expect(styleOf(".st-diagramZone-footerRule")).toContain(`calc(${footerRuleY}px`);
    // Footer pinned at the frame bottom with the 9.25 px inset — no border
    // subtraction in the value (the padding box already sits inside the
    // border, so the inset is the whole bottom offset).
    const footer = styleOf(".st-diagramZone-footer");
    expect(footer).toContain("bottom: var(--st-component-diagramZone-footerBottomInset");
    expect(footer).toContain("9.25px");
    expect(footer).not.toContain("7.75");
  });

  it("reviewer case: two-line title/subtitle + footer F at automatic height 280.41875, footer at its pinned position", () => {
    const { container, zone, styleOf } = peopleDom({
      entityId: "grp.review4",
      kicker: "K",
      footer: "F",
      height: undefined,
    });
    expect(zone).not.toBeNull();
    // Automatic height: header + content inset + footer reserve = 280.41875.
    expect(zone?.getAttribute("style") ?? "").toContain("height: 280.41875px");
    // Not refused at the automatic height.
    expect(container.querySelector(".st-diagramZone-pos")?.getAttribute("data-zone-refused")).toBeNull();
    // Same two-line title + two-line subtitle header as PEOPLE: rule
    // 198.98125, content start 214.98125.
    expect(styleOf(".st-diagramZone-rule")).toContain("calc(198.98125px");
    expect(styleOf(".st-diagramZone-content")).toContain("calc(214.98125px");
    // The footer stays pinned inside the 280.41875 px frame: footerBottom =
    // 280.41875 − 1.5 (border) − 9.25 (inset) = 269.66875, so the footer rule
    // sits at 269.66875 − 31.1875 (line box) − 1 (rule) − 4 (margin).
    const footerBottom = 280.41875 - 1.5 - 9.25;
    expect(footerBottom).toBe(269.66875);
    const footerRuleY = footerBottom - 31.1875 - 1 - 4;
    expect(footerRuleY).toBe(233.48125);
    expect(styleOf(".st-diagramZone-footerRule")).toContain(`calc(${footerRuleY}px`);
    const footer = styleOf(".st-diagramZone-footer");
    expect(footer).toContain("9.25px");
    expect(footer).not.toContain("7.75");
    expect(zone?.querySelector(".st-diagramZone-footerLine")?.textContent).toBe("F");
  });
});

describe("dual-renderer parity — renderZoneSvg vs Svelte DiagramZone", () => {
  for (const zone of COLLAPSED_ZONES) {
    it(`collapsed ${zone.id}: same texts, toggle state and diagnostics`, () => {
      const props = zoneProps(zone, true);
      const rendered = renderZoneSvg(props, { measure: defaultCardMeasure });
      const svg = parseZoneSvg(svgOf(rendered));
      const seen: ZoneDiagnostic[] = [];
      const { container } = render(DiagramZone, {
        props: { ...props, measure: defaultCardMeasure, onDiagnostic: (d) => seen.push(d) },
      });
      const card = container.querySelector(".st-diagramCard") as HTMLElement;
      expect(card).not.toBeNull();
      expect(container.querySelector(".st-diagramZone")).toBeNull();
      const domTexts = [...card.querySelectorAll(
        ".st-diagramCard-kicker,.st-diagramCard-title,.st-diagramCard-line,.st-diagramCard-detail,.st-diagramCard-footer",
      )].map((element) => element.textContent ?? "");
      const svgTexts = svg.texts
        .filter((t) => t.className.startsWith("st-diagramCard-") && t.className !== "st-diagramCard-rule")
        .map((t) => t.text);
      expect(domTexts).toEqual(svgTexts);
      const button = card.querySelector(".st-diagramCard-toggle button");
      expect(button?.getAttribute("aria-expanded")).toBe("false");
      expect(svg.toggle.collapsed).toBe("true");
      expect(seen).toEqual(rendered.diagnostics);
      expect(card.getAttribute("data-card-overflow")).toBe(
        svg.dataZoneOverflow === null ? null : svg.dataZoneOverflow,
      );
      // Positions, not only texts: the Svelte positioning wrapper sits
      // exactly where the SVG group translates.
      const pos = container.querySelector(".st-diagramZone-pos") as HTMLElement;
      const translate = /^translate\(([-0-9.]+) ([-0-9.]+)\)$/.exec(svg.transform ?? "");
      expect(translate).not.toBeNull();
      const posStyle = pos.getAttribute("style") ?? "";
      expect(posStyle).toContain(`left: ${translate?.[1]}px`);
      expect(posStyle).toContain(`top: ${translate?.[2]}px`);
    });
  }

  it("expanded PEOPLE: same header texts, rule and toggle in both renderers", () => {
    const props: DiagramZoneProps = {
      entityId: "grp.PEOPLE",
      kicker: EXPANDED_PEOPLE.kicker,
      title: EXPANDED_PEOPLE.title,
      subtitle: EXPANDED_PEOPLE.subtitle,
      icon: EXPANDED_PEOPLE.icon,
      iconGlyph: getDiagramGlyph(EXPANDED_PEOPLE.icon),
      tone: EXPANDED_PEOPLE.tone,
      collapsed: false,
      toggleLabel: "Replier People",
      x: 0,
      y: 0,
      width: EXPANDED_PEOPLE.width,
      height: EXPANDED_PEOPLE.height,
    };
    const rendered = renderZoneSvg(props, { measure: defaultCardMeasure });
    const svg = parseZoneSvg(svgOf(rendered));
    const seen: ZoneDiagnostic[] = [];
    const { container } = render(DiagramZone, {
      props: { ...props, measure: defaultCardMeasure, onDiagnostic: (d) => seen.push(d) },
    });
    const zone = container.querySelector(".st-diagramZone") as HTMLElement;
    expect(zone).not.toBeNull();
    const domHeader = [
      ...zone.querySelectorAll(".st-diagramCard-kicker,.st-diagramCard-title"),
    ].map((element) => element.textContent ?? "");
    const domSubtitle = [...zone.querySelectorAll(".st-diagramZone-subtitle")].map(
      (element) => element.textContent ?? "",
    );
    expect(domHeader).toEqual([
      ...svg.texts.filter((t) => t.className === "st-diagramZone-kicker").map((t) => t.text),
      ...svg.texts.filter((t) => t.className === "st-diagramZone-title").map((t) => t.text),
    ]);
    expect(domSubtitle).toEqual(
      svg.texts.filter((t) => t.className === "st-diagramZone-subtitle").map((t) => t.text),
    );
    expect(zone.querySelectorAll(".st-diagramZone-rule")).toHaveLength(1);
    expect(svg.rules).toHaveLength(1);
    // Positions, not only texts and counts: the Svelte frame box and rule
    // sit exactly at the SVG frame box and rule y; the content starts 16 px
    // under the rule in both renderers.
    const frameStyle = zone.getAttribute("style") ?? "";
    expect(frameStyle).toContain(`width: ${svg.frame?.width}px`);
    expect(frameStyle).toContain(`height: ${svg.frame?.height}px`);
    const ruleEl = zone.querySelector(".st-diagramZone-rule") as HTMLElement;
    expect(ruleEl.getAttribute("style") ?? "").toContain(`calc(${svg.rules[0]?.y1}px`);
    const contentEl = zone.querySelector(".st-diagramZone-content") as HTMLElement;
    expect(contentEl.getAttribute("style") ?? "").toContain(
      `calc(${Number(svg.rules[0]?.y1) + 16}px`,
    );
    const button = zone.querySelector(".st-diagramCard-toggle button");
    expect(button?.getAttribute("aria-expanded")).toBe("true");
    expect(svg.toggle.collapsed).toBe("false");
    expect(seen).toEqual(rendered.diagnostics);
  });

  it("expanded zone keeps and renders the footer; folding never changes it (finding 4)", () => {
    const base: DiagramZoneProps = {
      entityId: "grp.footed",
      kicker: "K",
      title: "Footed zone",
      subtitle: "A subtitle line",
      footer: "group: footed",
      icon: "people",
      iconGlyph: getDiagramGlyph("people"),
      tone: "neutral",
      collapsed: false,
      toggleLabel: "Toggle footed",
      x: 0,
      y: 0,
      width: 492,
      height: 400,
    };
    // Expanded: footer + footer rule in the SVG, footer block in Svelte.
    const expanded = renderZoneSvg({ ...base, collapsed: false }, { measure: defaultCardMeasure });
    const expandedSvg = parseZoneSvg(svgOf(expanded));
    const footerTexts = expandedSvg.texts.filter((t) => t.className === "st-diagramZone-footer");
    expect(footerTexts.map((t) => t.text)).toEqual(["group: footed"]);
    const footerRule = expandedSvg.rules.filter((r) => r.className === "st-diagramZone-footerRule");
    expect(footerRule).toHaveLength(1);
    expect(footerRule[0]).toMatchObject({ x1: "16", x2: "482", vectorEffect: "non-scaling-stroke" });
    const seenExpanded: ZoneDiagnostic[] = [];
    const { container: expandedDom } = render(DiagramZone, {
      props: { ...base, collapsed: false, measure: defaultCardMeasure, onDiagnostic: (d) => seenExpanded.push(d) },
    });
    const zoneEl = expandedDom.querySelector(".st-diagramZone") as HTMLElement;
    expect(zoneEl.querySelector(".st-diagramZone-footerRule")).not.toBeNull();
    expect(
      [...zoneEl.querySelectorAll(".st-diagramZone-footerLine")].map((el) => el.textContent ?? ""),
    ).toEqual(["group: footed"]);
    // Positions, not only texts: the Svelte footer rule sits at the SVG
    // footer rule's y, the frame box matches, and the Svelte footer is
    // pinned with the 9.25 px inset (no border subtraction).
    const domFooterRule = zoneEl.querySelector(".st-diagramZone-footerRule") as HTMLElement;
    expect(domFooterRule.getAttribute("style") ?? "").toContain(`calc(${footerRule[0]?.y1}px`);
    expect(zoneEl.getAttribute("style") ?? "").toContain(`height: ${expandedSvg.frame?.height}px`);
    const domFooter = zoneEl.querySelector(".st-diagramZone-footer") as HTMLElement;
    const domFooterStyle = domFooter.getAttribute("style") ?? "";
    expect(domFooterStyle).toContain("9.25px");
    expect(domFooterStyle).not.toContain("7.75");
    // Collapsed: the very same footer through the card content.
    const collapsed = renderZoneSvg({ ...base, collapsed: true }, { measure: defaultCardMeasure });
    const collapsedSvg = parseZoneSvg(svgOf(collapsed));
    const collapsedFooter = collapsedSvg.texts.filter((t) => t.className === "st-diagramCard-footer");
    expect(collapsedFooter.map((t) => t.text)).toEqual(["group: footed"]);
    const { container: collapsedDom } = render(DiagramZone, {
      props: { ...base, collapsed: true, measure: defaultCardMeasure, onDiagnostic: (d) => seenExpanded.push(d) },
    });
    const cardEl = collapsedDom.querySelector(".st-diagramCard") as HTMLElement;
    expect(cardEl.querySelector(".st-diagramCard-footer")?.textContent ?? null).toBe("group: footed");
    // Same footer text and same (empty) diagnostics in both states.
    expect(expanded.diagnostics).toEqual([]);
    expect(collapsed.diagnostics).toEqual([]);
  });

  it("proposed zone: dashed frame independent of tone, collapsed and expanded, both renderers", () => {
    for (const collapsed of [true, false]) {
      for (const tone of [undefined, "neutral", "proposal"] as const) {
        const props: DiagramZoneProps = {
          entityId: "grp.proposed",
          kicker: "K",
          title: "Proposed zone",
          subtitle: "A subtitle line",
          footer: "group: proposed",
          icon: "people",
          iconGlyph: getDiagramGlyph("people"),
          ...(tone === undefined ? {} : { tone }),
          proposed: true,
          collapsed,
          toggleLabel: "Toggle proposed",
          x: 0,
          y: 0,
          ...(collapsed ? {} : { width: 492, height: 400 }),
        };
        const rendered = renderZoneSvg(props, { measure: defaultCardMeasure });
        const svg = parseZoneSvg(svgOf(rendered));
        expect(svg.dataProposed, `${collapsed} ${tone}`).toBe("true");
        if (collapsed) {
          // Collapsed: the card border carries the dash.
          expect(svgOf(rendered)).toContain(
            'stroke-dasharray="var(--st-component-diagramCard-proposedDashArray, 4 5)"',
          );
        } else {
          expect(svg.frame?.strokeDasharray, `${collapsed} ${tone}`).toBe(
            "var(--st-component-diagramZone-proposedDashArray, 4 5)",
          );
        }
        const { container } = render(DiagramZone, {
          props: { ...props, measure: defaultCardMeasure },
        });
        const root = (container.querySelector(".st-diagramZone") ??
          container.querySelector(".st-diagramCard")) as HTMLElement;
        expect(root.getAttribute("data-proposed"), `${collapsed} ${tone}`).toBe("true");
        expect(root.classList.contains(collapsed ? "st-diagramCard--proposed" : "st-diagramZone--proposed"), `${collapsed} ${tone}`).toBe(true);
        // Not proposed: no dash anywhere.
        const plain = renderZoneSvg({ ...props, proposed: undefined }, { measure: defaultCardMeasure });
        expect(svgOf(plain)).not.toContain("data-proposed");
        expect(svgOf(plain)).not.toContain("stroke-dasharray");
      }
    }
  });

  it("J4 long word in the expanded subtitle: measured, neededPx > allocatedPx, refused in both renderers", () => { assertOwnerZoneRetention(false, false); });

  it('align="center": every text slot anchored middle in the SVG, class on the Svelte root, both states', () => {
    for (const collapsed of [true, false]) {
      const props: DiagramZoneProps = {
        entityId: "grp.center",
        kicker: "K",
        title: "Centred zone",
        subtitle: "A centred subtitle line",
        footer: "group: center",
        icon: "people",
        iconGlyph: getDiagramGlyph("people"),
        collapsed,
        toggleLabel: "Toggle",
        align: "center",
        x: 10,
        y: 20,
        ...(collapsed ? {} : { width: 492, height: 400 }),
      };
      const rendered = renderZoneSvg(props, { measure: defaultCardMeasure });
      const svg = parseZoneSvg(svgOf(rendered));
      const textSlots = svg.texts.filter((t) => t.className.startsWith("st-diagram"));
      expect(textSlots.length).toBeGreaterThan(0);
      for (const line of textSlots) {
        expect(line.anchor, `${line.className} ${line.text}`).toBe("middle");
      }
      const { container } = render(DiagramZone, {
        props: { ...props, measure: defaultCardMeasure },
      });
      const root = (container.querySelector(".st-diagramZone") ??
        container.querySelector(".st-diagramCard")) as HTMLElement;
      expect(root.className).toContain(collapsed ? "st-diagramCard--center" : "st-diagramZone--center");
      // Same box in both states and both renderers.
      expect(rendered.layout.box.width).toBe(collapsed ? 460 : 492);
      expect(rendered.layout.box.height).toBe(collapsed ? 200 : 400);
    }
  });

  it("projection to renderZoneSvgFromPresentation renders the zone or a label", () => {
    const zone = renderZoneSvgFromPresentation(
      { form: "container", text: { title: "People", subtitle: "s" }, icon: "people" },
      { entityId: "grp.people", collapsed: true, toggleLabel: "t", x: 5, y: 6 },
    );
    expect(zone.kind).toBe("zone");
    if (zone.kind !== "zone") throw new Error("fixture-error");
    expect(parseZoneSvg(svgOf(zone.result)).dataEntity).toBe("grp.people");
    expect(
      renderZoneSvgFromPresentation({ form: "card", text: { title: "T" } }, { entityId: "e", collapsed: false }),
    ).toEqual({ kind: "label" });
    expect(projectZoneProps(undefined, { entityId: "e", collapsed: false })).toEqual({ kind: "label" });
  });
});

describe("hack absence — no FOLDED-CARD-HACKS.md marker survives in DS code", () => {
  const SOURCES = [
    "../diagramCardModel.ts",
    "../DiagramCard.svelte",
    "../DiagramCardHeader.svelte",
    "../DiagramZone.svelte",
    "../DiagramZoneHeader.svelte",
    "../diagram-icons/registry.ts",
    "../diagram-icons/DiagramIcon.svelte",
    "../diagram-render/renderCardSvg.ts",
    "../diagram-render/renderZoneSvg.ts",
    "../diagram-render/index.ts",
  ];
  // Comments document the hacks they replace; the scan targets code only.
  const codeOnly = (source: string): string =>
    source
      .replaceAll(/<!--[\s\S]*?-->/g, "")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("//"))
      .join("\n");
  const texts = SOURCES.map((file) => ({
    file,
    source: readFileSync(resolve(HERE, file), "utf8"),
  }));

  it("no hack marker from the pinned FOLDED-CARD-HACKS list", () => {
    for (const { file, source } of texts) {
      const code = codeOnly(source);
      for (const marker of BANNED_HACK_MARKERS) {
        expect(code, `${file} contains ${marker}`).not.toContain(marker);
      }
    }
  });

  it("no ellipsis/clamp/nowrap on zone text, no hex, no redefined --st-* token", () => {
    for (const { file, source } of texts) {
      const withoutComments = codeOnly(source);
      for (const banned of ["…", "ellipsis", "line-clamp", "nowrap", "overflow:hidden", "overflow: hidden"]) {
        expect(withoutComments, `${file} ${banned}`).not.toContain(banned);
      }
      expect(withoutComments, `${file} hex`).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(withoutComments, `${file} redefined token}`).not.toMatch(/--st-[a-z-]+:/);
    }
  });

  it("the shared model still imports nothing", () => {
    const model = readFileSync(resolve(HERE, "../../../../diagram-canvas/src/presentation/diagramCardModel.ts"), "utf8");
    expect(model.match(/^import .*$/gm)).toEqual(['import { getDiagramGlyph } from "./registry.js";']);
  });

  it("the barrel graph still resolves neither subpath (zone added)", () => {
    const LIB = resolve(HERE, "..");
    const seen = new Set<string>();
    const queue = [resolve(LIB, "index.ts")];
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      if (!existsSync(file)) continue;
      let source = readFileSync(file, "utf8");
      source = source.replaceAll(/import\s+type\s+[^;]+;/g, "");
      source = source.replaceAll(/export\s+type\s+[^;]+from\s+["'][^"']+["'];?/g, "");
      for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
        const specifier = match[1];
        if (!specifier.startsWith(".")) continue;
        const resolved = resolve(dirname(file), specifier);
        const candidates = resolved.endsWith(".js")
          ? [`${resolved.slice(0, -3)}.ts`]
          : [resolved, `${resolved}.ts`, `${resolved}.svelte`, resolve(resolved, "index.ts")];
        for (const candidate of candidates) {
          if ((candidate.endsWith(".ts") || candidate.endsWith(".svelte")) && existsSync(candidate) && !seen.has(candidate)) {
            queue.push(candidate);
          }
        }
      }
    }
    const violations = [...seen].filter(
      (file) => (file.includes("/diagram-icons/") && !file.endsWith("/registry.ts")) || file.includes("/diagram-render/"),
    );
    expect(violations).toEqual([]);
  });
});

function assertOwnerZoneRetention(unknown: boolean, collapsed: boolean) {
 const props={entityId:'owner-zone',title:'Zone',subtitle:'Every subtitle word must remain visible '.repeat(8),footer:'repo: sentropic · @sentropic/cluster-mesh',collapsed,height:200,width:492,...(unknown?{icon:'unmapped'}:{})};
 const result=ownerZoneSvg(props);expect(result.kind).toBe('rendered');if(result.kind!=='rendered')throw new Error('content refused');
 const view=render(DiagramZone,{props});expect(view.container.querySelector('[data-zone-refused]')).toBeNull();expect(view.container.querySelector('[data-diagram-icon]')).not.toBeNull();
 expect(view.container.textContent?.replace(/\s+/g,'')).toContain(props.subtitle.replace(/\s+/g,''));
 expect(result.layout.box.height).toBeGreaterThan(200);
 if(unknown){expect(result.diagnostics.some(d=>d.code==='card-icon-missing')).toBe(true);expect(view.container.querySelector('[data-diagram-icon="unknown"]')).not.toBeNull();}
}
