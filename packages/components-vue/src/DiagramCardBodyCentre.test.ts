import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import DiagramCard from "./DiagramCard.vue";
import { defaultCardMeasure, layoutCard } from "@sentropic/diagram-canvas/diagramCardModel";

const HERE = dirname(fileURLToPath(import.meta.url));

function cssBlock(source: string, selector: string): string {
  const start = source.indexOf(selector);
  expect(start, selector).toBeGreaterThan(-1);
  const end = source.indexOf("}", start);
  return source.slice(start, end).replaceAll(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Owner card-body-centring, Vue host: identical to the Svelte host — the
 * body block is centred horizontally and vertically in the remaining body
 * box, the frozen box is unchanged and the accessible text stays complete.
 */
describe("DiagramCard — body block centring (owner card-body-centring)", () => {
  it("centres the body block horizontally and vertically in the remaining body box", () => {
    const source = readFileSync(resolve(HERE, "DiagramCard.vue"), "utf8");
    const body = cssBlock(source, ".st-diagramCard-body {");
    expect(body).toContain("flex: 1 1 auto");
    expect(body).toContain("display: flex");
    expect(body).toContain("justify-content: center");
    expect(body).toContain("text-align: center");
    expect(body).toContain("flex-direction: column");
    expect(source).not.toContain(".st-diagramCard--subtitle .st-diagramCard-body");
  });

  it("keeps the committed styles.css mirror in sync with the SFC (first-paint paints styles.css)", () => {
    const mirror = readFileSync(resolve(HERE, "styles.css"), "utf8");
    const sfc = readFileSync(resolve(HERE, "DiagramCard.vue"), "utf8");
    const body = cssBlock(mirror, ".st-diagramCard-body {");
    expect(body).toContain("flex: 1 1 auto");
    expect(body).toContain("display: flex");
    expect(body).toContain("justify-content: center");
    expect(body).toContain("text-align: center");
    expect(body).toContain("flex-direction: column");
    expect(mirror).not.toContain(".st-diagramCard--subtitle .st-diagramCard-body");
    expect(cssBlock(mirror, ".st-diagramCard-body {")).toBe(cssBlock(sfc, ".st-diagramCard-body {"));
  });

  it("renders the llm-gateway body centred with the complete accessible text", () => {
    const props = {
      entityId: "entity:llm-gateway",
      title: "llm-gateway",
      body: ["Achemine les demandes de modèles"],
      measure: defaultCardMeasure,
    };
    const view = mount(DiagramCard, { props: props as never });
    const layout = layoutCard(
      { entityId: props.entityId, title: props.title, body: props.body },
      defaultCardMeasure,
    );
    expect(layout.bodyX).toBe(14);
    expect(layout.bodyWidth).toBe(436);
    const body = view.element.querySelector(".st-diagramCard-body") as HTMLElement;
    const style = body.getAttribute("style") ?? "";
    expect(Number(/margin-left:\s*([\d.-]+)px/.exec(style)?.[1])).toBe(-2);
    expect(Number(/width:\s*([\d.]+)px/.exec(style)?.[1])).toBe(436);
    expect(body.textContent).toBe("Achemine les demandes de modèles");
    for (const line of layout.body) {
      expect(line.anchor).toBe("middle");
      expect(line.x).toBe(232);
    }
    const root = view.element.matches(".st-diagramCard")
      ? view.element
      : view.element.querySelector(".st-diagramCard")!;
    expect(root.getAttribute("aria-label")).toBe("llm-gateway\nAchemine les demandes de modèles");
    view.unmount();
  });
});
