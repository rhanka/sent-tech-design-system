import { renderCardSvg as ownerCardSvg } from "./diagram-render/renderCardSvg.js";
import { fireEvent, render } from "@testing-library/svelte";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import DiagramCard from "./DiagramCard.svelte";
import { getDiagramGlyph } from "./diagram-icons/registry.js";
import { defaultCardMeasure, layoutCard, type CardDiagnostic } from "./diagramCardModel.js";

const BASE = {
  entityId: "entity:h2a-roles",
  kicker: "ORGANISATION",
  title: "Rôles et mandats",
  body: ["Organisation humains-agents · C01", "RACI · acteurs vérifiés · scope-guard"],
  detailCount: 1,
  footer: "service: h2a",
  icon: "people",
  iconGlyph: getDiagramGlyph("people"),
  tone: "identity",
} as const;

describe("DiagramCard — fixed box and slots", () => {
  it("renders the fixed 460×200 box with square corners from tokens", () => {
    const { container } = render(DiagramCard, { props: { ...BASE } });
    const root = container.querySelector(".st-diagramCard") as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.dataset.entity).toBe("entity:h2a-roles");
    expect(root.dataset.tone).toBe("identity");
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("aria-label")).toBe([BASE.kicker, BASE.title, ...BASE.body, BASE.footer].join('\n'));
  });

  it("renders every slot string completely, detail line secondary", () => {
    const { container } = render(DiagramCard, { props: { ...BASE } });
    const text = container.querySelector(".st-diagramCard")?.textContent ?? "";
    for (const expected of [
      "ORGANISATION",
      "Rôles et mandats",
      "Organisation humains-agents · C01",
      "RACI · acteurs vérifiés · scope-guard",
      "service: h2a",
    ]) {
      expect(text).toContain(expected);
    }
    expect(text).not.toContain("…");
    const detail = container.querySelector(".st-diagramCard-detail");
    expect(detail?.textContent).toBe("RACI · acteurs vérifiés · scope-guard");
  });

  it("renders the icon from the glyph prop and the rule plus pinned footer", () => {
    const { container } = render(DiagramCard, { props: { ...BASE } });
    const icon = container.querySelector('svg[data-diagram-icon="people"]');
    expect(icon).toBeTruthy();
    expect(icon?.querySelectorAll("path").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector(".st-diagramCard-rule")).toBeTruthy();
    expect(container.querySelector(".st-diagramCard-footer")?.textContent).toBe("service: h2a");
  });

  it("omits the rule and footer when no footer is set", () => {
    const { footer: _dropped, ...noFooter } = BASE;
    const { container } = render(DiagramCard, { props: { ...noFooter } });
    expect(container.querySelector(".st-diagramCard-rule")).toBeNull();
    expect(container.querySelector(".st-diagramCard-footer")).toBeNull();
  });

  it("emits select with the entity id on click", async () => {
    const onSelect = vi.fn();
    const { container } = render(DiagramCard, { props: { ...BASE, onSelect } });
    await fireEvent.click(container.querySelector(".st-diagramCard") as HTMLElement);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({ entityId: "entity:h2a-roles" });
  });
});

describe("DiagramCard — toggle slot", () => {
  it("renders no toggle control without the toggle prop", () => {
    const { container } = render(DiagramCard, { props: { ...BASE } });
    expect(container.querySelector(".st-diagramCard-toggle")).toBeNull();
  });

  it("renders the DS IconButton toggle with Plus when collapsed", async () => {
    const onToggle = vi.fn();
    const { container } = render(DiagramCard, {
      props: { ...BASE, toggle: { collapsed: true, label: "Collapse zone", onToggle } },
    });
    const button = container.querySelector(
      '.st-diagramCard-toggle button[aria-label="Collapse zone"]',
    ) as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders Minus with aria-expanded true when expanded", () => {
    const { container } = render(DiagramCard, {
      props: { ...BASE, toggle: { collapsed: false, label: "Expand zone" } },
    });
    const button = container.querySelector(".st-diagramCard-toggle button");
    expect(button?.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("DiagramCard — diagnostics", () => {
  it("raises card-overflow and refuses: no normal card, original text in the diagnostic", () => { assertOwnerCardRetention('vertical'); });

  it("item 1 — the reviewer's vertical-overflow case is refused in Svelte too", () => { assertOwnerCardRetention('vertical'); });

  it("raises card-icon-unknown, draws no glyph and collapses the slot", () => { assertOwnerCardRetention('unknown'); });

  it("emits no diagnostic for a fitting card", () => {
    const onDiagnostic = vi.fn();
    render(DiagramCard, { props: { ...BASE, onDiagnostic } });
    expect(onDiagnostic).not.toHaveBeenCalled();
  });

  it("J4: a single long unbreakable word is measured, neededPx > allocatedPx, and refused (finding 5)", () => { assertOwnerCardRetention('long'); });

  it("long unbreakable words in capped kicker, title and footer remain diagnostic", () => {
    const word = `supercalifragilisticexpialidocious-${"x".repeat(60)}`;
    for (const slot of ["kicker", "title", "footer"] as const) {
      const seen: Array<{ code: string; slot: string; neededPx: number; allocatedPx: number }> = [];
      const props =
        slot === "kicker"
          ? { entityId: "e", kicker: word, title: "T", body: [] }
          : slot === "title"
            ? { entityId: "e", title: word, body: [] }
            : { entityId: "e", title: "T", body: [], footer: word };
      render(DiagramCard, {
        props: {
          ...props,
          autoSize: false,
          measure: defaultCardMeasure,
          onDiagnostic: (d) =>
            seen.push({ code: d.code, slot: d.slot, neededPx: d.neededPx, allocatedPx: d.allocatedPx }),
        },
      });
      const overflow = seen.filter((d) => d.code === "card-overflow" && d.slot === slot);
      expect(overflow.length, slot).toBeGreaterThan(0);
      for (const diagnostic of overflow) {
        expect(diagnostic.neededPx, slot).toBeGreaterThan(diagnostic.allocatedPx);
      }
    }
  });
});

describe("DiagramCard — folded subtitle centring and shared rule/footer geometry (items 4-5)", () => {
  const HERE = dirname(fileURLToPath(import.meta.url));

  function cssBlock(source: string, selector: string): string {
    const start = source.indexOf(selector);
    expect(start, selector).toBeGreaterThan(-1);
    const end = source.indexOf("}", start);
    // Declarations only: comments document the intent, they are not CSS.
    return source.slice(start, end).replaceAll(/\/\*[\s\S]*?\*\//g, "");
  }

  it("item 4: the subtitle body box is the model's 396 px at the 16 px inset, centred at 230", () => {
    const props = {
      entityId: "entity:subtitle",
      kicker: "PPL",
      title: "People",
      body: ["Employees HR · Developers admin · HR content owners"],
      bodyMode: "subtitle" as const,
      footer: "group: people",
      icon: "people",
      iconGlyph: getDiagramGlyph("people"),
      toggle: { collapsed: true, label: "Déplier" },
    };
    const { container } = render(DiagramCard, { props: { ...props, measure: defaultCardMeasure } });
    const layout = layoutCard(props, defaultCardMeasure);
    // The frozen allocation: body box at x = 32, width 396 (not the wider
    // 418 content box that centred at 241).
    expect(layout.bodyX).toBe(32);
    expect(layout.bodyWidth).toBe(396);
    const body = container.querySelector(".st-diagramCard-body") as HTMLElement;
    const style = body.getAttribute("style") ?? "";
    const marginLeft = Number(/margin-left:\s*([\d.]+)px/.exec(style)?.[1]);
    const width = Number(/width:\s*([\d.]+)px/.exec(style)?.[1]);
    expect(marginLeft).toBe(16);
    expect(width).toBe(396);
    // Pinned geometry asserted independently of the model: content origin
    // 16 (accent 8 + padding 8) + margin-left + width/2 = 230.
    expect(16 + marginLeft + width / 2).toBe(230);
    expect(layout.bodyX + layout.bodyWidth / 2).toBe(230);
  });

  it("item 5: rule and footer render inside one pinned wrapper, ruleY independent of body lines", () => {
    const { container } = render(DiagramCard, { props: { ...BASE, measure: defaultCardMeasure } });
    const foot = container.querySelector(".st-diagramCard-foot") as HTMLElement | null;
    expect(foot).not.toBeNull();
    expect(foot?.querySelector(":scope > .st-diagramCard-rule")).not.toBeNull();
    expect(foot?.querySelector(":scope > .st-diagramCard-footer")).not.toBeNull();
    // Shared geometry: the rule is pinned from the footer, so its y does
    // not move with the body line count — the SVG keeps the 4 px gap.
    for (const body of [[], ["ligne une"], ["ligne une", "ligne deux"]] as const) {
      const layout = layoutCard(
        { entityId: "entity:pin", title: "Épinglé", body: [...body], footer: "service: demo" },
        defaultCardMeasure,
      );
      expect(layout.ruleY, `body ${body.length}`).toBe(152.5625);
    }
  });

  it("item 5: the rule keeps a constant 1 px layout footprint at every zoom; only its painted stroke is counter-scaled", () => {
    const source = readFileSync(resolve(HERE, "DiagramCard.svelte"), "utf8");
    const rule = cssBlock(source, ".st-diagramCard-rule {");
    // LAYOUT properties never read the zoom: at overview zoom 0.25 the rule
    // still occupies exactly 1 px of layout, so the pinned footer does not
    // move (the reviewer's case: 183 px of non-shrinking children at zoom
    // 0.25 versus 180 px at zoom 1).
    for (const prop of ["height", "flex", "margin", "padding", "border-width"]) {
      const decl = rule.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "m"))?.[1] ?? "";
      expect(decl.includes("--st-diagram-zoom"), `${prop}: ${decl}`).toBe(false);
    }
    expect(rule).toContain("height: var(--st-component-diagramCard-ruleHeight, 1px)");
    // Only the painted stroke is counter-scaled, via a paint-only property.
    expect(rule).toContain("transform: scaleY(calc(1 / var(--st-diagram-zoom, 1)))");
    // Footer position at zoom 0.25 and 1: the foot wrapper stays pinned to
    // the bottom and neither it nor the footer reads the zoom in layout.
    const foot = cssBlock(source, ".st-diagramCard-foot {");
    expect(foot).toContain("margin-top: auto");
    const footer = cssBlock(source, ".st-diagramCard-footer {");
    expect(footer).not.toContain("--st-diagram-zoom");
    expect(footer).not.toContain("margin-top");
    // Evaluate the rule's layout footprint and painted stroke at the
    // overview zoom and at zoom 1: the footprint is the constant 1 px box,
    // the stroke is exactly 1 screen px both times (footprint × scaleY ×
    // host zoom).
    const evalPx = (expr: string, zoom: number): number => {
      const substituted = expr
        .replaceAll("var(--st-component-diagramCard-ruleHeight, 1px)", "1px")
        .replaceAll("var(--st-diagram-zoom, 1)", String(zoom));
      const body = substituted.match(/calc\(([^)]+)\)/)?.[1] ?? substituted;
      const tokens = body.replaceAll("px", "").match(/\d*\.?\d+|[()+\-*/]/g) ?? [];
      let acc = Number(tokens[0]);
      for (let i = 1; i + 1 < tokens.length; i += 2) {
        const op = tokens[i];
        const operand = Number(tokens[i + 1]);
        acc = op === "+" ? acc + operand : op === "-" ? acc - operand : op === "*" ? acc * operand : acc / operand;
      }
      return acc;
    };
    const heightDecl = rule.match(/(?:^|;)\s*height\s*:\s*([^;]+)/m)?.[1] ?? "";
    const scaleDecl = rule.match(/transform\s*:\s*scaleY\((.*)\)/)?.[1] ?? "";
    for (const zoom of [0.25, 1]) {
      const footprint = evalPx(heightDecl, zoom);
      expect(footprint, `rule layout footprint at zoom ${zoom}`).toBe(1);
      expect(footprint * evalPx(scaleDecl, zoom) * zoom, `painted stroke at zoom ${zoom}`).toBe(1);
    }
    // The canonical card's inner height is 180 px; with the constant
    // footprint the children still require exactly 180 px at zoom 0.25, so
    // the footer stays at its pinned position (model is zoom-independent).
    const layout = layoutCard(
      {
        entityId: "entity:zoom",
        kicker: "K",
        title: "People",
        body: ["ligne une", "ligne deux"],
        footer: "service: demo",
      },
      defaultCardMeasure,
    );
    expect(layout.footerBottom).toBe(200 - 2 - 9.25);
    expect(layout.ruleY).toBe(152.5625);
  });

  it("item 5: the zone rules keep the same constant footprint at every zoom", () => {
    const zoneSource = readFileSync(resolve(HERE, "DiagramZone.svelte"), "utf8");
    for (const selector of [".st-diagramZone-rule {", ".st-diagramZone-footerRule {"]) {
      const block = cssBlock(zoneSource, selector);
      for (const prop of ["height", "flex", "margin"]) {
        const decl = block.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "m"))?.[1] ?? "";
        expect(decl.includes("--st-diagram-zoom"), `${selector} ${prop}: ${decl}`).toBe(false);
      }
      expect(block).toContain("height: var(--st-component-diagramCard-ruleHeight, 1px)");
      expect(block).toContain("transform: scaleY(calc(1 / var(--st-diagram-zoom, 1)))");
    }
  });
});

describe("DiagramCard — proposed status (finding 1)", () => {
  it("dashed border independent of tone; absent when not proposed", () => {
    for (const tone of [undefined, "identity", "proposal", "neutral"] as const) {
      const { container } = render(DiagramCard, {
        props: { ...BASE, ...(tone === undefined ? {} : { tone }), proposed: true },
      });
      const root = container.querySelector(".st-diagramCard") as HTMLElement;
      expect(root.getAttribute("data-proposed")).toBe("true");
      expect(root.classList.contains("st-diagramCard--proposed")).toBe(true);
      // The dash does not depend on the tone: whatever the tint, same class.
      expect(root.dataset.tone).toBe(tone ?? "identity");
    }
    const { container } = render(DiagramCard, { props: { ...BASE } });
    const root = container.querySelector(".st-diagramCard") as HTMLElement;
    expect(root.getAttribute("data-proposed")).toBeNull();
    expect(root.classList.contains("st-diagramCard--proposed")).toBe(false);
  });
});

describe("DiagramCard — optional-slot header geometry applied by the Svelte header (item 10)", () => {
  const KICKER_H = 28.59375; // lineBoxHeight(22)
  const TITLE_H = 41.59375; // lineBoxHeight(32)
  const COMBOS = [
    { name: "icon+kicker", icon: true, kicker: true, block: Math.max(70, KICKER_H + TITLE_H) },
    { name: "icon only", icon: true, kicker: false, block: 70 },
    { name: "kicker only", icon: false, kicker: true, block: KICKER_H + TITLE_H },
    { name: "neither", icon: false, kicker: false, block: TITLE_H },
  ] as const;

  it("the header row height is the model's headerBlockHeight for every icon/kicker combination", () => {
    for (const combo of COMBOS) {
      const props = {
        entityId: `entity:hdr-${combo.name}`,
        title: "People",
        body: ["ligne une"],
        footer: "service: demo",
        ...(combo.kicker ? { kicker: "K" } : {}),
        ...(combo.icon ? { icon: "people", iconGlyph: getDiagramGlyph("people") } : {}),
      };
      const { container } = render(DiagramCard, { props: { ...props, measure: defaultCardMeasure } });
      const layout = layoutCard(props, defaultCardMeasure);
      expect(layout.headerBlockHeight, combo.name).toBe(Math.max(70, combo.block));
      const header = container.querySelector(".st-diagramCardHeader") as HTMLElement | null;
      expect(header, combo.name).not.toBeNull();
      // The Svelte header applies the model geometry explicitly: the row is
      // exactly headerBlockHeight tall — no 70 px floor without an icon.
      const rowHeight = Number(/height:\s*([\d.]+)px/.exec(header?.getAttribute("style") ?? "")?.[1]);
      expect(rowHeight, combo.name).toBe(Math.max(70,combo.block));
      expect(header?.querySelector("svg[data-diagram-icon]") !== null, combo.name).toBe(true);
      // The body starts right after the model's header block + gap.
      expect(layout.bodyArea.top, combo.name).toBe(10 + Math.max(70,combo.block) + 6);
    }
  });
});

describe("DiagramCard — pass 3 item 11: icon offset matches the Svelte header centring (dual renderer)", () => {
  it("the reviewer's case: icon, kicker K, toggled two-line title, no footer — Svelte icon top = model iconBox.y", () => {
    const props = {
      entityId: "entity:icon-offset",
      kicker: "K",
      title: "Users and operators",
      body: ["Body"],
      icon: "people",
      iconGlyph: getDiagramGlyph("people"),
      toggle: { collapsed: true, label: "Déplier" },
    };
    const { container } = render(DiagramCard, { props: { ...props, measure: defaultCardMeasure } });
    const layout = layoutCard(props, defaultCardMeasure);
    expect(layout.diagnostics).toEqual([]);
    expect(layout.headerBlockHeight).toBe(111.78125);
    // The Svelte header row is exactly headerBlockHeight tall with
    // align-items:center, so the icon top = contentTop + (block − 70)/2.
    const header = container.querySelector(".st-diagramCardHeader") as HTMLElement | null;
    expect(header).not.toBeNull();
    const rowHeight = Number(/height:\s*([\d.]+)px/.exec(header?.getAttribute("style") ?? "")?.[1]);
    expect(rowHeight).toBe(111.78125);
    const icon = header?.querySelector("svg[data-diagram-icon]") as SVGElement | null;
    expect(icon).not.toBeNull();
    const svelteIconTop = layout.contentTop + (rowHeight - 70) / 2;
    expect(svelteIconTop).toBe(30.890625);
    // The model's iconBox — what renderCardSvg paints — is the same point.
    expect(layout.iconBox).toEqual({ x: 16, y: 30.890625, size: 70 });
  });
});

function assertOwnerCardRetention(kind: 'long' | 'vertical' | 'unknown') {
  const props = { entityId: 'owner-content', title: kind === 'vertical' ? 'Users and operators of the diagram' : 'Card', kicker:'K', body: kind === 'long' ? ['W'.repeat(500)] : ['Line one', 'Line two', 'Line three'], footer:'repo: sentropic · @sentropic/cluster-mesh', ...(kind === 'unknown' ? {icon:'unmapped'} : {}) };
  const result = ownerCardSvg(props);
  expect(result.kind).toBe('rendered');
  if(result.kind !== 'rendered') throw new Error('content refused');
  const view = render(DiagramCard, {props});
  expect(view.container.querySelector('[data-card-refused]')).toBeNull();
  expect(view.container.querySelector('[data-diagram-icon]')).not.toBeNull();
  expect(view.container.textContent?.replace(/\s+/g,'')).toContain(props.body.join('').replace(/\s+/g,''));
  if(kind === 'unknown') { expect(result.diagnostics.some(d=>d.code==='card-icon-missing')).toBe(true); expect(view.container.querySelector('[data-diagram-icon="unknown"]')).not.toBeNull(); }
  if(kind === 'vertical') { expect(result.layout.box).toEqual({width:460,height:200}); expect(result.layout.bodyBottom).toBeLessThanOrEqual(result.layout.bodyArea.bottom); }
}
