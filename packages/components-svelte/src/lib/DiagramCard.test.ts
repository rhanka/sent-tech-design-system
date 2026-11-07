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
    expect(root.getAttribute("aria-label")).toBe("Rôles et mandats");
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
  it("raises card-overflow and refuses: no normal card, original text in the diagnostic", () => {
    const diagnostics: CardDiagnostic[] = [];
    const longTitle = `${"mot ".repeat(40).trim()}`;
    const { container } = render(DiagramCard, {
      props: {
        entityId: "entity:overflow",
        title: longTitle,
        body: [],
        measure: defaultCardMeasure,
        onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
      },
    });
    const root = container.querySelector(".st-diagramCard") as HTMLElement;
    // Overflow = refusal: the host sees the refusal state, no normal card.
    expect(root.classList.contains("st-diagramCard--refused")).toBe(true);
    expect(root.dataset.cardRefused).toBe("title");
    expect(root.dataset.cardOverflow).toBe("title");
    expect(container.querySelector(".st-diagramCard-title")).toBeNull();
    expect(container.querySelector(".st-diagramCard-body")).toBeNull();
    expect(root.textContent ?? "").not.toContain("…");
    // The diagnostic carries the original, unwrapped slot text.
    expect(diagnostics).toContainEqual(
      expect.objectContaining({ code: "card-overflow", slot: "title", text: longTitle }),
    );
  });

  it("item 1 — the reviewer's vertical-overflow case is refused in Svelte too", () => {
    const diagnostics: CardDiagnostic[] = [];
    const props = {
      entityId: "entity:review-1",
      kicker: "K",
      title: "Users and operators",
      body: ["Employees HR · Developers admin", "HR content owners"],
      footer: "group: people",
      icon: "people",
      iconGlyph: getDiagramGlyph("people"),
      toggle: { collapsed: true, label: "Déplier" },
      measure: defaultCardMeasure,
      onDiagnostic: (diagnostic: CardDiagnostic) => diagnostics.push(diagnostic),
    } as const;
    const { container } = render(DiagramCard, { props: { ...props } });
    const layout = layoutCard(props, defaultCardMeasure);
    // The second body baseline crosses the footer baseline: diagnosed.
    expect(layout.body[1]?.baseline).toBe(180.96875);
    expect(layout.footerLines[0]?.baseline).toBe(179.5625);
    expect(layout.bodyBottom).toBeGreaterThan(layout.bodyArea.bottom);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "card-overflow",
        slot: "body",
        neededPx: 62.375,
        allocatedPx: 20.78125,
        text: "Employees HR · Developers admin\nHR content owners",
      }),
    );
    // Refused: no normal card content at all.
    const root = container.querySelector(".st-diagramCard") as HTMLElement;
    expect(root.dataset.cardRefused).toBe("body");
    expect(container.querySelector(".st-diagramCard-title")).toBeNull();
    expect(container.querySelector(".st-diagramCard-footer")).toBeNull();
    expect(container.textContent ?? "").not.toContain("…");
  });

  it("raises card-icon-unknown, draws no glyph and collapses the slot", () => {
    const diagnostics: Array<{ code: string; slot: string }> = [];
    const { container } = render(DiagramCard, {
      props: {
        entityId: "entity:unknown-icon",
        title: "Carte",
        body: [],
        icon: "no-such-glyph",
        onDiagnostic: (diagnostic) =>
          diagnostics.push({ code: diagnostic.code, slot: diagnostic.slot }),
      },
    });
    expect(diagnostics).toContainEqual({ code: "card-icon-unknown", slot: "icon" });
    const root = container.querySelector(".st-diagramCard") as HTMLElement;
    expect(root.dataset.cardIconUnknown).toBe("");
    expect(container.querySelector("svg[data-diagram-icon]")).toBeNull();
  });

  it("emits no diagnostic for a fitting card", () => {
    const onDiagnostic = vi.fn();
    render(DiagramCard, { props: { ...BASE, onDiagnostic } });
    expect(onDiagnostic).not.toHaveBeenCalled();
  });

  it("J4: a single long unbreakable word is measured, neededPx > allocatedPx, and refused (finding 5)", () => {
    const token = "@sentropic/architecture-governance-multiagent-coordination";
    const seen: CardDiagnostic[] = [];
    const { container } = render(DiagramCard, {
      props: {
        entityId: "entity:j4",
        title: "Jeton J4",
        body: ["ligne une", token],
        footer: "service: demo",
        measure: defaultCardMeasure,
        onDiagnostic: (d) => seen.push(d),
      },
    });
    const overflow = seen.filter((d) => d.code === "card-overflow");
    expect(overflow.length).toBeGreaterThan(0);
    for (const diagnostic of overflow) {
      expect(diagnostic.neededPx, diagnostic.slot).toBeGreaterThan(diagnostic.allocatedPx);
    }
    // Overflow = refusal: no normal card; the original token survives in
    // the diagnostic data, never truncated in the DOM.
    const root = container.querySelector(".st-diagramCard") as HTMLElement;
    expect(root.dataset.cardRefused).toBe("body");
    expect(container.textContent ?? "").not.toContain(token);
    expect(container.textContent ?? "").not.toContain("…");
    expect(overflow.some((d) => d.text === `ligne une\n${token}`)).toBe(true);
  });

  it("long unbreakable words in kicker, title and footer diagnose too", () => {
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

  it("item 5: the HTML rule is 1 screen px at every zoom (inverse-zoom compensation)", () => {
    const source = readFileSync(resolve(HERE, "DiagramCard.svelte"), "utf8");
    const rule = cssBlock(source, ".st-diagramCard-rule {");
    // The host-published camera zoom is divided out of the rule height.
    expect(rule).toContain(
      "calc(var(--st-component-diagramCard-ruleHeight, 1px) / var(--st-diagram-zoom, 1))",
    );
    // Rule and footer are positioned together: the wrapper carries the
    // automatic top margin, the footer block does not.
    const foot = cssBlock(source, ".st-diagramCard-foot {");
    expect(foot).toContain("margin-top: auto");
    const footer = cssBlock(source, ".st-diagramCard-footer {");
    expect(footer).not.toContain("margin-top");
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
