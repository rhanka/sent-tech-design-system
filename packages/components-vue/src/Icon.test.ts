import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Icon, ICON_NAMES } from "./Icon.js";

// The icon token rules shipped in the `@layer st-icon` block of a stylesheet,
// as [{ selector, declarations }]. Empty when the block is absent.
function iconLayerRules(css: string): Array<{ selector: string; declarations: string }> {
  const start = css.indexOf("@layer st-icon {");
  if (start < 0) return [];
  const open = css.indexOf("{", start);
  let depth = 0;
  let end = -1;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) {
      end = i;
      break;
    }
  }
  const body = css.slice(open + 1, end).replace(/\/\*[\s\S]*?\*\//g, "");
  return [...body.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, declarations]) => ({
    selector: selector.trim(),
    declarations: declarations.trim().replace(/\s+/g, " "),
  }));
}

// Declarations of those rules that reach `el` (what the cascade layer applies).
function tokenDeclarationsFor(el: Element, rules: ReturnType<typeof iconLayerRules>): string[] {
  return rules.filter((rule) => el.matches(rule.selector)).map((rule) => rule.declarations);
}

const STROKE_WIDTH_TOKEN = "stroke-width: var(--st-component-icon-strokeWidth, 2.25);";
const STROKE_TOKEN = "stroke: var(--st-component-icon-color, currentColor);";

const styles = readFileSync(resolve("src/styles.css"), "utf8");
const rules = iconLayerRules(styles);

describe("Icon — canonical DS icon set", () => {
  it("renders an svg for every canonical name", () => {
    for (const name of ICON_NAMES) {
      const wrapper = mount(Icon, { props: { name } });
      expect(wrapper.find("svg").exists(), `expected an <svg> for icon "${name}"`).toBe(true);
      wrapper.unmount();
    }
  });

  it("defaults to size 18 and stroke-width 2.25 (DS-standard)", () => {
    const wrapper = mount(Icon, { props: { name: "settings" } });
    const svg = wrapper.find("svg");
    expect(svg.attributes("width")).toBe("18");
    expect(svg.attributes("height")).toBe("18");
    expect(svg.attributes("stroke-width")).toBe("2.25");
  });

  it("is decorative (aria-hidden) with no title", () => {
    const wrapper = mount(Icon, { props: { name: "close" } });
    expect(wrapper.find("svg").attributes("aria-hidden")).toBe("true");
  });

  it("exposes an accessible name when title is set", () => {
    const wrapper = mount(Icon, { props: { name: "eye", title: "Afficher" } });
    const svg = wrapper.find("svg");
    expect(svg.attributes("aria-hidden")).toBeUndefined();
    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-label")).toBe("Afficher");
  });

  it("renders the default so both layered token rules of styles.css apply", () => {
    const svg = mount(Icon, { props: { name: "settings" } }).find("svg");
    expect(tokenDeclarationsFor(svg.element, rules)).toEqual([STROKE_WIDTH_TOKEN, STROKE_TOKEN]);
    // Presentation attributes = the render when no stylesheet is loaded.
    expect(svg.attributes("stroke-width")).toBe("2.25");
    expect(svg.attributes("stroke")).toBe("currentColor");
    expect(svg.attributes("style")).toBeUndefined();
  });

  it("marks an explicit strokeWidth so the stroke-width token rule skips it", () => {
    for (const strokeWidth of [2.25, 1.5]) {
      const svg = mount(Icon, { props: { name: "settings", strokeWidth } }).find("svg");
      expect(svg.attributes("stroke-width")).toBe(String(strokeWidth));
      expect(svg.attributes("data-st-icon-stroke")).toBe("prop");
      expect(tokenDeclarationsFor(svg.element, rules)).toEqual([STROKE_TOKEN]);
      expect(svg.attributes("style")).toBeUndefined();
    }
  });

  it("keeps an explicit colour out of the colour token rule", () => {
    const svg = mount(Icon, { props: { name: "close" }, attrs: { color: "rgb(0, 128, 0)" } }).find("svg");
    expect(svg.attributes("stroke")).toBe("rgb(0, 128, 0)");
    expect(tokenDeclarationsFor(svg.element, rules)).toEqual([STROKE_WIDTH_TOKEN]);
  });

  it("ships the token rules only inside the st-icon cascade layer", () => {
    expect(rules.map((rule) => rule.declarations)).toEqual([STROKE_WIDTH_TOKEN, STROKE_TOKEN]);
    // Declared once: no unlayered copy that would beat layered consumer CSS.
    for (const declaration of [STROKE_WIDTH_TOKEN, STROKE_TOKEN]) {
      expect(styles.split(declaration).length - 1).toBe(1);
    }
  });
});
