import { renderZoneSvg as ownerZoneSvg } from "./diagram-render/renderZoneSvg.js";
import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import DiagramZone from "./DiagramZone.svelte";
import { getDiagramGlyph } from "./diagram-icons/registry.js";
import {
  COLLAPSED_SUBTITLE_MEASURE,
  defaultCardMeasure,
  layoutZone,
  lineBoxHeight,
  projectZoneProps,
  ZONE_GEOMETRY,
  type DiagramZoneProps,
  type ZoneDiagnostic,
} from "./diagramCardModel.js";

function baseProps(overrides: Partial<DiagramZoneProps> = {}): DiagramZoneProps {
  return {
    entityId: "grp.people",
    kicker: "PPL",
    title: "People",
    subtitle: "Employees HR · Developers admin · HR content owners",
    footer: "group: people",
    icon: "people",
    iconGlyph: getDiagramGlyph("people"),
    tone: "neutral",
    collapsed: true,
    toggleLabel: "Déplier People",
    x: 700,
    y: 426.5625,
    ...overrides,
  };
}

function parseZoneDom(container: HTMLElement) {
  // The positioning wrapper is present in BOTH states (item 6).
  const pos = container.querySelector(".st-diagramZone-pos") as HTMLElement | null;
  const zone = container.querySelector(".st-diagramZone--expanded") as HTMLElement | null;
  const card = container.querySelector(".st-diagramCard") as HTMLElement | null;
  const texts = (root: Element | null, selector: string) =>
    root === null
      ? []
      : [...root.querySelectorAll(selector)].map((element) => element.textContent ?? "");
  const toggle = (card ?? zone)?.querySelector(".st-diagramCard-toggle button");
  return {
    pos,
    zone,
    card,
    headerTexts: texts(zone ?? card, ".st-diagramCard-kicker,.st-diagramCard-title"),
    bodyTexts: texts(card, ".st-diagramCard-line,.st-diagramCard-detail"),
    subtitleTexts: texts(zone, ".st-diagramZone-subtitle"),
    footer: card?.querySelector(".st-diagramCard-footer")?.textContent ??
      null,
    hasCardRule: card?.querySelector(".st-diagramCard-rule") !== null,
    hasZoneRule: zone?.querySelector(".st-diagramZone-rule") !== null,
    hasHeader: zone?.querySelector(".st-diagramZoneHeader") !== null,
    content: zone?.querySelector(".st-diagramZone-content")?.textContent ?? null,
    toggleExpanded: toggle?.getAttribute("aria-expanded") ?? null,
    toggleLabel: toggle?.getAttribute("aria-label") ?? null,
    dataCollapsed: pos?.getAttribute("data-collapsed") ?? null,
    dataOverflow: pos?.getAttribute("data-zone-overflow") ??
      card?.getAttribute("data-card-overflow") ??
      null,
    dataRefused: pos?.getAttribute("data-zone-refused") ??
      card?.getAttribute("data-card-refused") ??
      null,
  };
}

describe("DiagramZone — collapsed renders the atomic card (§6.2)", () => {
  it("renders a DiagramCard, no zone frame, subtitle as the centred body", () => {
    const { container } = render(DiagramZone, {
      props: { ...baseProps(), measure: defaultCardMeasure },
    });
    const parsed = parseZoneDom(container);
    expect(parsed.card).not.toBeNull();
    expect(parsed.zone).toBeNull();
    // The folded header text width is the frozen 290 px (toggle reserves
    // 66), so the title wraps exactly like the reference at that width.
    expect(parsed.headerTexts).toEqual(["PPL", "People"]);
    expect(parsed.headerTexts.join(" ")).toBe("PPL People");
    // Subtitle wrapped at the frozen 396 px measure, one body line per
    // wrapped line, no detail re-roling (DH-08 does not exist). The wrap
    // is lossless: the lines join back to the full subtitle string.
    const layout = layoutZone(baseProps(), defaultCardMeasure);
    const bodyLines = layout.card?.body.map((line) => line.text) ?? [];
    expect(bodyLines.join(" ")).toBe("Employees HR · Developers admin · HR content owners");
    expect(bodyLines.length).toBeLessThanOrEqual(2);
    expect(parsed.bodyTexts).toEqual(bodyLines);
    expect(layout.card?.body.every((line) => line.anchor === "middle")).toBe(true);
    expect(layout.card?.body.every((line) => line.x === 230)).toBe(true);
    expect(parsed.footer).toBe("group: people");
    expect(parsed.hasCardRule).toBe(true);
    // Toggle in the top-right slot, Plus when collapsed.
    expect(parsed.toggleExpanded).toBe("false");
    expect(parsed.toggleLabel).toBe("Déplier People");
  });

  it("toggle activation emits the expand intent through onToggle", async () => {
    const onToggle = vi.fn();
    const { container } = render(DiagramZone, {
      props: { ...baseProps(), measure: defaultCardMeasure, onToggle },
    });
    const button = container.querySelector(".st-diagramCard-toggle button") as HTMLElement;
    button.click();
    expect(onToggle).toHaveBeenCalledWith({ entityId: "grp.people", collapsed: true });
  });

  it("collapsed box is the frozen 460 × 200 card at the occurrence", () => {
    const layout = layoutZone(baseProps(), defaultCardMeasure);
    expect(layout.box).toEqual({ x: 700, y: 426.5625, width: 460, height: 200 });
    expect(layout.card?.toggleBox).toEqual({ x: 420, y: 8, size: 32 });
    expect(COLLAPSED_SUBTITLE_MEASURE).toBe(396);
  });

  it("no toggleLabel: the zone is non-foldable (§6.5)", () => {
    const { container } = render(DiagramZone, {
      props: { ...baseProps({ toggleLabel: undefined }), measure: defaultCardMeasure },
    });
    expect(container.querySelector(".st-diagramCard-toggle button")).toBeNull();
  });

  it("subtitle overflow refuses the zone: data-zone-refused, original text in the diagnostic", () => { assertOwnerZoneRetention(false, true); });

  it("item 6: one positioning wrapper carries x/y in collapsed AND expanded states (cycle at 700, 426.5625)", async () => {
    const props = { ...baseProps(), measure: defaultCardMeasure };
    const { container, rerender } = render(DiagramZone, { props });
    const collapsedPos = container.querySelector(".st-diagramZone-pos") as HTMLElement;
    expect(collapsedPos).not.toBeNull();
    expect(collapsedPos.getAttribute("style") ?? "").toMatch(/left:\s*700px/);
    expect(collapsedPos.getAttribute("style") ?? "").toMatch(/top:\s*426\.5625px/);
    expect(collapsedPos.getAttribute("data-collapsed")).toBe("true");
    expect(collapsedPos.getAttribute("data-entity")).toBe("grp.people");
    expect(container.querySelector(".st-diagramCard")).not.toBeNull();

    await rerender({ ...props, collapsed: false, width: 492, height: 400 });
    const expandedPos = container.querySelector(".st-diagramZone-pos") as HTMLElement;
    expect(expandedPos).not.toBeNull();
    expect(expandedPos.getAttribute("style") ?? "").toMatch(/left:\s*700px/);
    expect(expandedPos.getAttribute("style") ?? "").toMatch(/top:\s*426\.5625px/);
    expect(expandedPos.getAttribute("data-collapsed")).toBe("false");
    const frame = container.querySelector(".st-diagramZone--expanded") as HTMLElement;
    expect(frame).not.toBeNull();
    // The frame itself no longer positions: only the shared wrapper does.
    expect(frame.getAttribute("style") ?? "").not.toContain("left:");
    expect(frame.getAttribute("style") ?? "").not.toContain("position");

    await rerender({ ...props, collapsed: true });
    const backPos = container.querySelector(".st-diagramZone-pos") as HTMLElement;
    expect(backPos.getAttribute("style") ?? "").toMatch(/left:\s*700px/);
    expect(backPos.getAttribute("style") ?? "").toMatch(/top:\s*426\.5625px/);
    expect(backPos.getAttribute("data-collapsed")).toBe("true");
    expect(container.querySelector(".st-diagramCard")).not.toBeNull();
    expect(container.querySelector(".st-diagramZone--expanded")).toBeNull();
  });

  it("unknown icon raises zone-icon-unknown and collapses the slot", () => { assertOwnerZoneRetention(true, true); });
});

describe("DiagramZone — expanded paints frame, header, rule, children", () => {
  it("renders the zone frame with header + subtitle + one rule + content", () => {
    const { container } = render(DiagramZone, {
      props: {
        ...baseProps({ collapsed: false, width: 492, height: 974.98125, x: 0, y: 0 }),
        measure: defaultCardMeasure,
        children: createRawSnippet(() => ({
          render: () => `<div class="child-card">child</div>`,
        })),
      },
    });
    const parsed = parseZoneDom(container);
    const layout = layoutZone(
      baseProps({ collapsed: false, width: 492, height: 974.98125, x: 0, y: 0 }),
      defaultCardMeasure,
    );
    const header = layout.header;
    if (header === undefined) throw new Error("fixture-error");
    expect(parsed.zone).not.toBeNull();
    expect(parsed.card).toBeNull();
    expect(parsed.dataCollapsed).toBe("false");
    expect(parsed.hasHeader).toBe(true);
    expect(parsed.headerTexts).toEqual([
      ...header.kicker.map((line) => line.text),
      ...header.title.map((line) => line.text),
    ]);
    expect(parsed.subtitleTexts).toEqual(header.subtitle.map((line) => line.text));
    expect(header.subtitle.map((line) => line.text).join(" ")).toBe(
      "Employees HR · Developers admin · HR content owners",
    );
    expect(parsed.hasZoneRule).toBe(true);
    expect(parsed.content).toContain("child");
    // Minus when expanded, aria-expanded true.
    expect(parsed.toggleExpanded).toBe("true");
  });

  it("expanded toggle emits the collapse intent", () => {
    const onToggle = vi.fn();
    const { container } = render(DiagramZone, {
      props: {
        ...baseProps({ collapsed: false, width: 492, height: 400 }),
        measure: defaultCardMeasure,
        onToggle,
      },
    });
    const button = container.querySelector(".st-diagramCard-toggle button") as HTMLElement;
    button.click();
    expect(onToggle).toHaveBeenCalledWith({ entityId: "grp.people", collapsed: false });
  });

  it("expanded geometry: 4/16/16 rhythm on the DS fixture (§6.2)", () => {
    const layout = layoutZone(
      baseProps({ collapsed: false, width: 492, height: 974.98125, x: 0, y: 0 }),
      defaultCardMeasure,
    );
    const header = layout.header;
    if (header === undefined) throw new Error("fixture-error");
    // subtitle last line → rule 4 px.
    expect(header.ruleY - header.subtitleBottom).toBe(4);
    // rule → content top 16 px.
    expect(header.contentTop - header.ruleY).toBe(ZONE_GEOMETRY.contentInsetTop);
    // icon 70 at the 16 px inset, vertically centred in the header block.
    expect(header.iconBox).toEqual({
      x: 16,
      y: 16 + (header.headerBlockHeight - 70) / 2,
      size: 70,
    });
    // header text at x + 92.
    expect(header.headerTextX).toBe(92);
    // toggle slot at y + 10 exactly as the hrpn frozen SVG (finding 7).
    expect(header.toggleBox).toEqual({ x: 452, y: 8, size: 32 });
    // subtitle wraps under the icon from the left inset.
    expect(header.subtitle[0]?.x).toBe(16);
  });

  it("expanded subtitle measure comes from the layout: min(width, 460) − 26", () => {
    const props = baseProps({ collapsed: false, width: 492, height: 400, x: 0, y: 0 });
    const layout = layoutZone(props, defaultCardMeasure);
    const header = layout.header;
    if (header === undefined) throw new Error("fixture-error");
    // 492 → capped at 460 → 460 − 16 − 10 = 434, the same rule as
    // layoutZone / renderZoneSvg (single geometry source).
    expect(header.subtitleWidth).toBe(434);
    // A wider frame keeps the 460 px cap (GCP at 1860 wraps at 434 too).
    const wide = layoutZone(baseProps({ collapsed: false, width: 1860, height: 400, x: 0, y: 0 }), defaultCardMeasure);
    expect(wide.header?.subtitleWidth).toBe(434);
    // The Svelte header consumes the layout value, no local arithmetic.
    const { container } = render(DiagramZone, { props: { ...props, measure: defaultCardMeasure } });
    const subtitleBox = container.querySelector(".st-diagramZoneHeader-subtitle") as HTMLElement | null;
    expect(subtitleBox?.getAttribute("style") ?? "").toMatch(/width:\s*434px/);
  });

  it("header text width reserves the icon/toggle room only when present (kit rule)", () => {
    const both = layoutZone(baseProps({ collapsed: false, width: 492, x: 0, y: 0 }), defaultCardMeasure).header;
    if (both === undefined) throw new Error("fixture-error");
    expect(both.headerTextX).toBe(92);
    expect(both.headerTextWidth).toBe(492 - 178);
    const noToggle = layoutZone(
      baseProps({ collapsed: false, width: 492, x: 0, y: 0, toggleLabel: undefined }),
      defaultCardMeasure,
    ).header;
    if (noToggle === undefined) throw new Error("fixture-error");
    expect(noToggle.headerTextWidth).toBe(492 - 92 - 16);
    const noIcon = layoutZone(
      baseProps({ collapsed: false, width: 492, x: 0, y: 0, icon: undefined, iconGlyph: undefined }),
      defaultCardMeasure,
    ).header;
    if (noIcon === undefined) throw new Error("fixture-error");
    expect(noIcon.headerTextX).toBe(92);
    expect(noIcon.headerTextWidth).toBe(492 - 178);
    const neither = layoutZone(
      baseProps({
        collapsed: false,
        width: 492,
        x: 0,
        y: 0,
        icon: undefined,
        iconGlyph: undefined,
        toggleLabel: undefined,
      }),
      defaultCardMeasure,
    ).header;
    if (neither === undefined) throw new Error("fixture-error");
    expect(neither.headerTextWidth).toBe(492 - 108);
  });

  it("expanded auto-height reserves the footer below the children", () => {
    const child = {
      kind: "card" as const,
      x: 16,
      y: 216,
      card: { entityId: "entity:child", title: "Child card", body: [] },
    };
    const props = baseProps({ collapsed: false, width: 492, x: 0, y: 0 });
    const layout = layoutZone(props, defaultCardMeasure, [child]);
    const header = layout.header;
    if (header === undefined) throw new Error("fixture-error");
    const childrenBottom = 216 + 200;
    const footerReserve =
      lineBoxHeight(ZONE_GEOMETRY.footer.size) +
      ZONE_GEOMETRY.ruleHeight +
      2 * ZONE_GEOMETRY.ruleMargin +
      ZONE_GEOMETRY.footerBottomInset;
    expect(layout.box.height).toBe(childrenBottom + ZONE_GEOMETRY.contentInsetBottom + footerReserve);
    // The footer rule clears the children plus the bottom content inset.
    expect(header.footerRuleY).toBeGreaterThanOrEqual(childrenBottom + ZONE_GEOMETRY.contentInsetBottom);
    expect(header.footer.length).toBeGreaterThan(0);
  });

  it("expanded keeps and renders the footer; folding never changes it (finding 4)", () => {
    const expandedProps = baseProps({ collapsed: false, width: 492, height: 400, x: 0, y: 0 });
    const { container: expandedDom } = render(DiagramZone, {
      props: { ...expandedProps, measure: defaultCardMeasure },
    });
    const zone = expandedDom.querySelector(".st-diagramZone") as HTMLElement;
    expect(zone.querySelector(".st-diagramZone-footerRule")).not.toBeNull();
    expect(
      [...zone.querySelectorAll(".st-diagramZone-footerLine")].map((el) => el.textContent ?? ""),
    ).toEqual(["group: people"]);
    const layout = layoutZone(expandedProps, defaultCardMeasure);
    const header = layout.header;
    if (header === undefined) throw new Error("fixture-error");
    expect(header.footer.map((line) => line.text)).toEqual(["group: people"]);
    expect(header.footerRuleY).toBeDefined();
    // Collapsed: the same footer through the card.
    const { container: collapsedDom } = render(DiagramZone, {
      props: { ...baseProps(), measure: defaultCardMeasure },
    });
    const card = collapsedDom.querySelector(".st-diagramCard") as HTMLElement;
    expect(
      [...card.querySelectorAll(".st-diagramCard-footerLine")].map((el) => el.textContent ?? ""),
    ).toEqual(["group: people"]);
    expect(layoutZone(baseProps(), defaultCardMeasure).card?.footerLines.map((l) => l.text)).toEqual([
      "group: people",
    ]);
  });

  it("proposed zone: dashed in the expanded state, whatever the tone (finding 1)", () => {
    for (const tone of [undefined, "neutral", "proposal"] as const) {
      const { container } = render(DiagramZone, {
        props: {
          ...baseProps({ collapsed: false, width: 492, height: 400, ...(tone === undefined ? {} : { tone }), proposed: true }),
          measure: defaultCardMeasure,
        },
      });
      const zone = container.querySelector(".st-diagramZone") as HTMLElement;
      expect(zone.getAttribute("data-proposed")).toBe("true");
      expect(zone.classList.contains("st-diagramZone--proposed")).toBe(true);
      // Collapsed: the dashed border is on the card.
      const { container: collapsedDom } = render(DiagramZone, {
        props: {
          ...baseProps({ ...(tone === undefined ? {} : { tone }), proposed: true }),
          measure: defaultCardMeasure,
        },
      });
      const card = collapsedDom.querySelector(".st-diagramCard") as HTMLElement;
      expect(card.getAttribute("data-proposed")).toBe("true");
      expect(card.classList.contains("st-diagramCard--proposed")).toBe(true);
    }
  });

  it("J4 long word in the subtitle: neededPx > allocatedPx and the zone is refused with the original text", () => { assertOwnerZoneRetention(false, false); });

  it("no subtitle: rule sits 4 px under the header block", () => {
    const props = baseProps({ collapsed: false, width: 492, x: 0, y: 0, subtitle: undefined });
    const layout = layoutZone(props, defaultCardMeasure);
    const header = layout.header;
    if (header === undefined) throw new Error("fixture-error");
    expect(header.subtitle).toEqual([]);
    expect(header.ruleY).toBe(16 + header.headerBlockHeight + 4);
  });

  it("align=\"center\" centres every slot in both states", () => {
    const collapsed = layoutZone(baseProps({ align: "center" }), defaultCardMeasure);
    expect(collapsed.card?.kicker.every((line) => line.anchor === "middle")).toBe(true);
    expect(collapsed.card?.title.every((line) => line.anchor === "middle")).toBe(true);
    expect(collapsed.card?.footerLines[0]?.anchor).toBe("middle");
    expect(collapsed.card?.body.every((line) => line.anchor === "middle")).toBe(true);

    const expanded = layoutZone(
      baseProps({ collapsed: false, width: 492, align: "center" }),
      defaultCardMeasure,
    );
    const header = expanded.header;
    if (header === undefined) throw new Error("fixture-error");
    expect(header.kicker.every((line) => line.anchor === "middle")).toBe(true);
    expect(header.title.every((line) => line.anchor === "middle")).toBe(true);
    expect(header.subtitle.every((line) => line.anchor === "middle")).toBe(true);

    const { container: collapsedDom } = render(DiagramZone, {
      props: { ...baseProps({ align: "center" }), measure: defaultCardMeasure },
    });
    expect(
      collapsedDom.querySelector(".st-diagramCard")?.classList.contains("st-diagramCard--center"),
    ).toBe(true);
    const { container: expandedDom } = render(DiagramZone, {
      props: { ...baseProps({ collapsed: false, width: 492, align: "center" }), measure: defaultCardMeasure },
    });
    expect(
      expandedDom.querySelector(".st-diagramZone")?.classList.contains("st-diagramZone--center"),
    ).toBe(true);
  });
});

describe("DiagramZone — projection (§4.2/§6.1)", () => {
  it("container and legend forms resolve to a zone; card form and no title to a label", () => {
    const zone = projectZoneProps(
      { form: "container", text: { title: "People", kicker: "PPL", subtitle: "s", footer: "f" }, icon: "people", categoryRef: "neutral" },
      { entityId: "grp.people", collapsed: true, toggleLabel: "t", resolveGlyph: getDiagramGlyph },
    );
    expect(zone.kind).toBe("zone");
    if (zone.kind !== "zone") throw new Error("fixture-error");
    expect(zone.props.title).toBe("People");
    expect(zone.props.subtitle).toBe("s");
    expect(zone.props.footer).toBe("f");
    expect(zone.props.iconGlyph?.face).toBe(getDiagramGlyph("people")?.face);
    expect(zone.props.tone).toBe("neutral");
    expect(zone.props.collapsed).toBe(true);

    expect(projectZoneProps({ form: "legend", text: { title: "L" } }, { entityId: "e", collapsed: false }).kind).toBe("zone");
    expect(projectZoneProps({ form: "card", text: { title: "T" } }, { entityId: "e", collapsed: false })).toEqual({ kind: "label" });
    expect(projectZoneProps({ form: "container", text: {} }, { entityId: "e", collapsed: false })).toEqual({ kind: "label" });
    expect(projectZoneProps(undefined, { entityId: "e", collapsed: false })).toEqual({ kind: "label" });
  });
});

describe("DiagramZone — expanded vertical overflow (item 9)", () => {
  function reviewerProps(overrides: Partial<DiagramZoneProps> = {}): DiagramZoneProps {
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
      ...overrides,
    };
  }

  it("no height: the Svelte frame auto-sizes to header + content + footer (281.59375), no refusal", () => { assertOwnerZoneRetention(false, false); });

  it("explicit undersized height 200: refused with data-zone-refused=frame and the diagnostic", () => { assertOwnerZoneRetention(false, false); });

  it("the Svelte expanded header row applies the model's headerBlockHeight (item 10)", () => {
    const props = baseProps({ collapsed: false, width: 492, height: 400, x: 0, y: 0 });
    const { container } = render(DiagramZone, { props: { ...props, measure: defaultCardMeasure } });
    const layout = layoutZone(props, defaultCardMeasure);
    const header = layout.header;
    if (header === undefined) throw new Error("fixture-error");
    const row = container.querySelector(".st-diagramCardHeader") as HTMLElement | null;
    expect(row).not.toBeNull();
    const rowHeight = Number(/height:\s*([\d.]+)px/.exec(row?.getAttribute("style") ?? "")?.[1]);
    expect(rowHeight).toBe(header.headerBlockHeight);
  });
});

function assertOwnerZoneRetention(unknown: boolean, collapsed: boolean) {
 const props={entityId:'owner-zone',title:'Zone',subtitle:'Every subtitle word must remain visible '.repeat(8),footer:'repo: sentropic · @sentropic/cluster-mesh',collapsed,height:200,width:492,...(unknown?{icon:'unmapped'}:{})};
 const result=ownerZoneSvg(props);expect(result.kind).toBe('rendered');if(result.kind!=='rendered')throw new Error('content refused');
 const view=render(DiagramZone,{props});expect(view.container.querySelector('[data-zone-refused]')).toBeNull();expect(view.container.querySelector('[data-diagram-icon]')).not.toBeNull();
 expect(view.container.textContent?.replace(/\s+/g,'')).toContain(props.subtitle.replace(/\s+/g,''));
 if(collapsed) expect(result.layout.box.height).toBe(200); else expect(result.layout.box.height).toBeGreaterThanOrEqual(200);
 expect(result.diagnostics.some(d=>d.reason==='truncated')).toBe(true);
 if(unknown){expect(result.diagnostics.some(d=>d.code==='card-icon-missing')).toBe(true);expect(view.container.querySelector('[data-diagram-icon="unknown"]')).not.toBeNull();}
}
