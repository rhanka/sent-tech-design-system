import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import DiagramCard from "./DiagramCard.svelte";
import { getDiagramGlyph } from "./diagram-icons/registry.js";
import { defaultCardMeasure } from "./diagramCardModel.js";

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
  it("raises card-overflow, keeps the complete string and the box", () => {
    const diagnostics: Array<{ code: string; slot: string }> = [];
    const { container } = render(DiagramCard, {
      props: {
        entityId: "entity:overflow",
        title: `${"mot ".repeat(40).trim()}`,
        body: [],
        measure: defaultCardMeasure,
        onDiagnostic: (diagnostic) =>
          diagnostics.push({ code: diagnostic.code, slot: diagnostic.slot }),
      },
    });
    const root = container.querySelector(".st-diagramCard") as HTMLElement;
    expect(diagnostics).toContainEqual({ code: "card-overflow", slot: "title" });
    expect(root.dataset.cardOverflow).toBe("title");
    expect(root.textContent).toContain("mot mot mot");
    expect(root.textContent).not.toContain("…");
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
});
