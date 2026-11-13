import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { ICONS, ICON_NAMES, type IconGlyph } from './icon-data.js';
const EyeOff = ICONS['eye-off'];
const Rocket: IconGlyph = { name: 'rocket', nodes: [['path', { d: 'M4 20 20 4M4 16v4h4' }]] };
import { describe, expect, it, vi } from "vitest";
import Icon from './Icon.vue';

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

describe("Icon — glyph prop (neutral Lucide data)", () => {
  it("renders an svg for a glyph passed directly", () => {
    const svg = mount(Icon, { props: { glyph: EyeOff } }).find("svg");
    expect(svg.exists()).toBe(true);
  });

  it("renders the same svg for glyph as for the name mapping to the same lucide icon", () => {
    const byName = mount(Icon, { props: { name: "eye-off" } }).find("svg").element.outerHTML;
    const byGlyph = mount(Icon, { props: { glyph: EyeOff } }).find("svg").element.outerHTML;
    expect(byGlyph).toBe(byName);
  });

  it("applies size, strokeWidth, title and class to a glyph", () => {
    const svg = mount(Icon, {
      props: { glyph: EyeOff, size: 24, strokeWidth: 1.5, title: "Masquer", class: "app-gear" },
    }).find("svg");
    expect(svg.attributes("width")).toBe("24");
    expect(svg.attributes("height")).toBe("24");
    expect(svg.attributes("stroke-width")).toBe("1.5");
    expect(svg.attributes("data-st-icon-stroke")).toBe("prop");
    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-label")).toBe("Masquer");
    expect(svg.attributes("aria-hidden")).toBeUndefined();
    expect(svg.attributes("class")).toContain("st-icon");
    expect(svg.attributes("class")).toContain("app-gear");
  });

  it("lets glyph win when both name and glyph are passed", () => {
    const both = mount(Icon, { props: { name: "eye", glyph: EyeOff } }).find("svg").element
      .outerHTML;
    const expected = mount(Icon, { props: { name: "eye-off" } }).find("svg").element.outerHTML;
    expect(both).toBe(expected);
  });

  it("renders a lucide icon outside the canonical set", () => {
    const svg = mount(Icon, { props: { glyph: Rocket } }).find("svg");
    expect(svg.exists()).toBe(true);
  });

  it("renders nothing when neither name nor glyph is passed", () => {
    const wrapper = mount(Icon, { props: {} });
    expect(wrapper.find("svg").exists()).toBe(false);
  });

  it("warns in dev (without throwing) when both or neither are set", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(() => mount(Icon, { props: { name: "eye", glyph: EyeOff } })).not.toThrow();
      expect(() => mount(Icon, { props: {} })).not.toThrow();
      expect(warn).toHaveBeenCalledTimes(2);
      expect(warn).toHaveBeenCalledWith("[st-icon] Icon requires exactly one of `name` or `glyph`.");
      // Exactly one of the two stays silent.
      warn.mockClear();
      mount(Icon, { props: { name: "eye" } });
      mount(Icon, { props: { glyph: EyeOff } });
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
