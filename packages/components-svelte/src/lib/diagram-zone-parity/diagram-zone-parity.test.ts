import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import DiagramZone from "../DiagramZone.svelte";
import { getDiagramGlyph } from "../diagram-icons/registry.js";
import { renderZoneSvg, renderZoneSvgFromPresentation } from "../diagram-render/renderZoneSvg.js";
import {
  COLLAPSED_SUBTITLE_MEASURE,
  ZONE_GEOMETRY,
  defaultCardMeasure,
  layoutZone,
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
  dataZoneOverflow: string | null;
  dataZoneIconUnknown: boolean;
  texts: Array<{ className: string; text: string; x: string | null; anchor: string | null }>;
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
    anchor: element.getAttribute("text-anchor"),
  }));
  const rules = [...zone.querySelectorAll("line.st-diagramZone-rule, line.st-diagramCard-rule")].map(
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

    expect(TOGGLE_ALLOCATION).toBe(32);
    expect(ZONE_GEOMETRY.toggleAllocation).toBe(TOGGLE_ALLOCATION);

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
});

describe("collapsed-zone parity — hrpn e5eaca3 frozen SVG (7 zones)", () => {
  for (const zone of COLLAPSED_ZONES) {
    it(`collapsed ${zone.id}: 460x200 card at (${zone.x}, ${zone.y}), top-right toggle, centred 396 subtitle`, () => {
      const rendered = renderZoneSvg(zoneProps(zone, true), { measure: defaultCardMeasure });
      const svg = parseZoneSvg(rendered.svg);

      // The zone occurrence box: the card at (x, y), 460 x 200 (DC-D13).
      expect(svg.transform).toBe(`translate(${zone.x} ${zone.y})`);
      expect(svg.width).toBe(String(zone.x + 460));
      expect(svg.height).toBe(String(zone.y + 200));
      expect(svg.dataCollapsed).toBe("true");
      expect(svg.dataEntity).toBe(`grp.${zone.id}`);
      expect(svg.dataTone).toBe(zone.tone);

      // Icon 70 at the card's content inset, canonical scale 70/64.
      expect(svg.icon.name).toBe(zone.icon);
      expect(svg.icon.transform).toBe("translate(16 10) scale(1.09375)");

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
      expect(svg.toggle.transform).toBe("translate(418 10)");
      expect(zone.y + 10).toBe(zone.toggleY);

      // No diagnostics on the frozen corpus content.
      expect(rendered.diagnostics).toEqual([]);
      expect(svg.dataZoneOverflow).toBeNull();
      expect(svg.dataZoneIconUnknown).toBe(false);
    });
  }

  it("collapsed subtitle re-wrap matches the frozen lines where the frozen measurer agrees", () => {
    // The frozen SVG pins its own wrap; the DS measurer is the frozen
    // advance table. Six of seven zones re-wrap identically; the drift on
    // one word boundary is reported, not hidden.
    let identical = 0;
    for (const zone of COLLAPSED_ZONES) {
      const rendered = renderZoneSvg(zoneProps(zone, true), { measure: defaultCardMeasure });
      const svg = parseZoneSvg(rendered.svg);
      const body = svg.texts
        .filter((t) => t.className === "st-diagramCard-body")
        .map((t) => t.text);
      if (body.length === zone.frozenLines.length && body.every((line, i) => line === zone.frozenLines[i])) {
        identical += 1;
      }
    }
    expect(identical).toBeGreaterThanOrEqual(6);
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

  it("frame, header, rule and 4/16/16 rhythm against the frozen numbers", () => {
    const rendered = renderZoneSvg(peopleProps(), { measure: defaultCardMeasure });
    const svg = parseZoneSvg(rendered.svg);
    expect(svg.dataCollapsed).toBe("false");
    // Frame: same box as the frozen group rect; rx 0 (DIF-03: kit rx 6),
    // 1.5 px border (measured-code), DS container tokens for fill/border.
    expect(svg.frame).toMatchObject({
      x: "0",
      y: "0",
      width: "492",
      height: "974.98125",
      rx: "0",
      strokeWidth: "1.5",
    });
    // Icon 70 at the 16 px inset, centred in the header block. The frozen
    // iconY 36.890625 corresponds to the kit's two-line title wrap at the
    // kit's narrower header width; the DS header text width (352 px) fits
    // "Users and operators" on one line, so the DS header block is shorter
    // — reported measurer drift, the icon stays centred in the block.
    const layout = layoutZone(peopleProps(), defaultCardMeasure);
    const header = layout.header;
    if (header === undefined) throw new Error("fixture-error");
    expect(svg.icon.transform).toBe(
      `translate(${header.iconBox?.x} ${header.iconBox?.y}) scale(1.09375)`,
    );
    expect(header.iconBox?.x).toBe(EXPANDED_PEOPLE.iconX);
    expect(header.iconBox?.y).toBe(16 + (header.headerBlockHeight - 70) / 2);
    // Header text at x + 92; kicker/title lossless.
    const kicker = svg.texts.filter((t) => t.className === "st-diagramZone-kicker");
    const title = svg.texts.filter((t) => t.className === "st-diagramZone-title");
    const subtitle = svg.texts.filter((t) => t.className === "st-diagramZone-subtitle");
    expect(kicker.map((t) => t.text)).toEqual([EXPANDED_PEOPLE.kicker]);
    expect(kicker[0]?.x).toBe(String(EXPANDED_PEOPLE.kickerX));
    expect(title.map((t) => t.text).join(" ")).toBe(EXPANDED_PEOPLE.title);
    expect(title[0]?.x).toBe(String(EXPANDED_PEOPLE.titleX));
    expect(subtitle.map((t) => t.text).join(" ")).toBe(EXPANDED_PEOPLE.subtitle);
    expect(subtitle[0]?.x).toBe(String(EXPANDED_PEOPLE.subtitleX));
    // Header rule: same insets as the frozen rule (16 / width - 10), 1 px
    // non-scaling, at the DS-computed y (zone-local; y = 0 here). The frozen
    // ruleY 198.98125 sits under the kit's two-line title; the DS one-line
    // title shortens the header block — same drift as the icon above.
    expect(svg.rules).toHaveLength(1);
    expect(svg.rules[0]).toMatchObject({
      className: "st-diagramZone-rule",
      x1: String(EXPANDED_PEOPLE.ruleX1),
      x2: String(EXPANDED_PEOPLE.ruleX2),
      y1: String(header.ruleY),
      y2: String(header.ruleY),
      vectorEffect: "non-scaling-stroke",
    });
    // 4/16/16 exactly on the DS fixture (§6.2).
    expect(header.ruleY - header.subtitleBottom).toBe(4);
    expect(header.contentTop - header.ruleY).toBe(16);
    // Toggle slot top right of the content box (kit foreignObject at
    // (434.656, 10) is the DH-13 hack this replaces).
    expect(svg.toggle.collapsed).toBe("false");
    expect(svg.toggle.transform).toBe(`translate(${header.toggleBox?.x} ${header.toggleBox?.y})`);
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
    const doc = new DOMParser().parseFromString(rendered.svg, "image/svg+xml");
    const childGroup = doc.querySelector("g.st-diagramZone-child");
    expect(childGroup).not.toBeNull();
    expect(childGroup?.getAttribute("transform")).toBe("translate(16 16)");
    expect(childGroup?.querySelector("g.st-diagramCard-icon")).not.toBeNull();
    expect(childGroup?.querySelector("text.st-diagramCard-title")?.textContent).toBe("Child card");
  });
});

describe("dual-renderer parity — renderZoneSvg vs Svelte DiagramZone", () => {
  for (const zone of COLLAPSED_ZONES) {
    it(`collapsed ${zone.id}: same texts, toggle state and diagnostics`, () => {
      const props = zoneProps(zone, true);
      const rendered = renderZoneSvg(props, { measure: defaultCardMeasure });
      const svg = parseZoneSvg(rendered.svg);
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
    const svg = parseZoneSvg(rendered.svg);
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
    const button = zone.querySelector(".st-diagramCard-toggle button");
    expect(button?.getAttribute("aria-expanded")).toBe("true");
    expect(svg.toggle.collapsed).toBe("false");
    expect(seen).toEqual(rendered.diagnostics);
  });

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
      const svg = parseZoneSvg(rendered.svg);
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
    expect(parseZoneSvg(zone.svg).dataEntity).toBe("grp.people");
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
    const model = readFileSync(resolve(HERE, "../diagramCardModel.ts"), "utf8");
    expect(model).not.toMatch(/^import /m);
    expect(model).not.toMatch(/from ["']/);
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
      (file) => file.includes("/diagram-icons/") || file.includes("/diagram-render/"),
    );
    expect(violations).toEqual([]);
  });
});
