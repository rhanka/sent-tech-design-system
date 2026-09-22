import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/svelte";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";
import Icon from "./Icon.svelte";
import { ICON_NAMES } from "./icons.js";

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

// The CSS Svelte actually emits for Icon.svelte (what a consumer app ships).
const svelteCss = compile(readFileSync(resolve("src/lib/Icon.svelte"), "utf8"), {
  css: "external",
  filename: "Icon.svelte",
}).css?.code ?? "";
const rules = iconLayerRules(svelteCss);

describe("Icon — canonical DS icon set", () => {
  it("renders an svg for every canonical name", () => {
    for (const name of ICON_NAMES) {
      const { container, unmount } = render(Icon, { props: { name } });
      const svg = container.querySelector("svg");
      expect(svg, `expected an <svg> for icon "${name}"`).toBeTruthy();
      unmount();
    }
  });

  it("defaults to size 18 and stroke-width 2.25 (DS-standard)", () => {
    const { container } = render(Icon, { props: { name: "settings" } });
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("width")).toBe("18");
    expect(svg.getAttribute("height")).toBe("18");
    expect(svg.getAttribute("stroke-width")).toBe("2.25");
  });

  it("is decorative (aria-hidden) with no title", () => {
    const { container } = render(Icon, { props: { name: "close" } });
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("exposes an accessible name when title is set", () => {
    const { container } = render(Icon, { props: { name: "eye", title: "Afficher" } });
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("aria-hidden")).toBeNull();
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("Afficher");
  });

  it("honours a custom size", () => {
    const { container } = render(Icon, { props: { name: "layers", size: 24 } });
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("width")).toBe("24");
  });

  it("renders the default so both layered token rules apply", () => {
    const { container } = render(Icon, { props: { name: "settings" } });
    const svg = container.querySelector("svg") as SVGElement;
    expect(tokenDeclarationsFor(svg, rules)).toEqual([STROKE_WIDTH_TOKEN, STROKE_TOKEN]);
    // Presentation attributes = the render when no stylesheet is loaded.
    expect(svg.getAttribute("stroke-width")).toBe("2.25");
    expect(svg.getAttribute("stroke")).toBe("currentColor");
    expect(svg.hasAttribute("style")).toBe(false);
  });

  it("marks an explicit strokeWidth so the stroke-width token rule skips it", () => {
    for (const strokeWidth of [2.25, 1.5]) {
      const { container, unmount } = render(Icon, { props: { name: "settings", strokeWidth } });
      const svg = container.querySelector("svg") as SVGElement;
      expect(svg.getAttribute("stroke-width")).toBe(String(strokeWidth));
      expect(svg.getAttribute("data-st-icon-stroke")).toBe("prop");
      expect(tokenDeclarationsFor(svg, rules)).toEqual([STROKE_TOKEN]);
      expect(svg.hasAttribute("style")).toBe(false);
      unmount();
    }
  });

  it("keeps an explicit colour out of the colour token rule", () => {
    const { container } = render(Icon, { props: { name: "close", color: "rgb(0, 128, 0)" } });
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("stroke")).toBe("rgb(0, 128, 0)");
    expect(tokenDeclarationsFor(svg, rules)).toEqual([STROKE_WIDTH_TOKEN]);
  });

  it("ships the same st-icon layer as the React, Vue and Angular styles.css", () => {
    expect(rules.map((rule) => rule.declarations)).toEqual([STROKE_WIDTH_TOKEN, STROKE_TOKEN]);
    for (const pkg of ["components-react", "components-vue", "components-angular"]) {
      const styles = readFileSync(resolve(`../${pkg}/src/styles.css`), "utf8");
      expect(iconLayerRules(styles), `${pkg}/src/styles.css`).toEqual(rules);
      // Declared once: no unlayered copy that would beat layered consumer CSS.
      for (const declaration of [STROKE_WIDTH_TOKEN, STROKE_TOKEN]) {
        expect(styles.split(declaration).length - 1, `${pkg}: ${declaration}`).toBe(1);
      }
    }
    for (const declaration of [STROKE_WIDTH_TOKEN, STROKE_TOKEN]) {
      expect(svelteCss.split(declaration).length - 1).toBe(1);
    }
  });
});
