import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/svelte";
import {
  ChevronDown,
  ChevronRight,
  CircleDashed,
  Eye,
  EyeOff,
  Layers,
  MessageSquare,
  Rocket,
  Settings,
  Target,
  X
} from "@lucide/svelte";
import { compile } from "svelte/compiler";
import type { ComponentProps } from "svelte";
import { describe, expect, it } from "vitest";
import Icon from "./Icon.svelte";
import { ICONS, ICON_NAMES, type IconGlyph } from "./icons.js";

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

// W-1.0 (A1-3b) — catalogue witness extension for the CA-L1 fold-in performed
// by AS-1: the eight pre-existing names keep their glyphs and `comment` is
// added, mapping to lucide MessageSquare (nine names total). The other seven
// CA names land with their own CA lots, not here.
describe("W-1.0 icon catalogue — CA-L1 fold-in (comment) and circle-dashed", () => {
  it("ICON_NAMES carries exactly the eight pre-existing names plus comment and circle-dashed", () => {
    expect(ICON_NAMES).toEqual([
      "settings",
      "eye",
      "eye-off",
      "layers",
      "target",
      "close",
      "chevron-down",
      "chevron-right",
      "comment",
      "circle-dashed"
    ]);
  });

  it("the eight pre-existing mappings are unchanged, comment -> MessageSquare, and circle-dashed -> CircleDashed", () => {
    expect(ICONS.settings).toBe(Settings);
    expect(ICONS.eye).toBe(Eye);
    expect(ICONS["eye-off"]).toBe(EyeOff);
    expect(ICONS.layers).toBe(Layers);
    expect(ICONS.target).toBe(Target);
    expect(ICONS.close).toBe(X);
    expect(ICONS["chevron-down"]).toBe(ChevronDown);
    expect(ICONS["chevron-right"]).toBe(ChevronRight);
    expect(ICONS.comment).toBe(MessageSquare);
    expect(ICONS["circle-dashed"]).toBe(CircleDashed);
  });

  it("renders an svg for the comment name", () => {
    const { container } = render(Icon, { props: { name: "comment" } });
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("Icon — glyph prop (any lucide icon)", () => {
  it("renders an svg for a glyph passed directly", () => {
    const { container } = render(Icon, { props: { glyph: EyeOff as unknown as IconGlyph } });
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders the same svg for glyph as for the name mapping to the same lucide icon", () => {
    // ICONS["eye-off"] IS EyeOff (see the catalogue test above): the glyph
    // path must render exactly what the name path renders.
    const byName = render(Icon, { props: { name: "eye-off" } });
    const byGlyph = render(Icon, { props: { glyph: ICONS["eye-off"] } });
    expect(byGlyph.container.querySelector("svg")?.outerHTML).toBe(
      byName.container.querySelector("svg")?.outerHTML,
    );
    byName.unmount();
    byGlyph.unmount();
  });

  it("applies size, strokeWidth, title and class to a glyph", () => {
    const { container } = render(Icon, {
      props: {
        glyph: EyeOff as unknown as IconGlyph,
        size: 24,
        strokeWidth: 1.5,
        title: "Masquer",
        class: "app-gear",
      },
    });
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("width")).toBe("24");
    expect(svg.getAttribute("height")).toBe("24");
    expect(svg.getAttribute("stroke-width")).toBe("1.5");
    expect(svg.getAttribute("data-st-icon-stroke")).toBe("prop");
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("Masquer");
    expect(svg.getAttribute("aria-hidden")).toBeNull();
    expect(svg.getAttribute("class")).toContain("st-icon");
    expect(svg.getAttribute("class")).toContain("app-gear");
  });

  it("lets glyph win when both name and glyph are passed", () => {
    const { container } = render(Icon, {
      props: { name: "eye", glyph: ICONS["eye-off"] } as unknown as ComponentProps<typeof Icon>,
    });
    const expected = render(Icon, { props: { name: "eye-off" } });
    expect(container.querySelector("svg")?.outerHTML).toBe(
      expected.container.querySelector("svg")?.outerHTML,
    );
    expected.unmount();
  });

  it("renders a lucide icon outside the canonical set", () => {
    const { container } = render(Icon, { props: { glyph: Rocket as unknown as IconGlyph } });
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders nothing when neither name nor glyph is passed", () => {
    const { container } = render(Icon, {
      props: {} as unknown as ComponentProps<typeof Icon>,
    });
    expect(container.querySelector("svg")).toBeNull();
  });
});
