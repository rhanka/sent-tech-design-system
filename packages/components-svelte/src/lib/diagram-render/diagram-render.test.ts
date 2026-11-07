import { describe, expect, it } from "vitest";
import { getDiagramGlyph } from "../diagram-icons/registry.js";
import {
  defaultCardMeasure,
  firstOverflowDiagnostic,
  layoutCard,
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
