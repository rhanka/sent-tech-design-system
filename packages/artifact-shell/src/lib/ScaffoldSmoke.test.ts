import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import * as barrel from "./index.js";
import { makeBlock } from "./fixtures.js";
import ScaffoldSmoke from "./ScaffoldSmoke.svelte";

// W-0.1 — scaffold smoke witness. Proves the build, token resolution,
// ThemeProvider scoping and the test harness: one BlockDisplay label rendered
// inside a themed subtree. Also asserts the barrel exports no component yet
// (AS-0 ships types only).
describe("W-0.1 scaffold smoke", () => {
  it("renders the fixture block label inside a themed subtree with tokens resolved", () => {
    const block = makeBlock({ label: "SENTINEL-SMOKE-BLOCK-LABEL" });
    const { container } = render(ScaffoldSmoke, { props: { block } });

    // The label from the display model is rendered as text.
    expect(screen.getByText("SENTINEL-SMOKE-BLOCK-LABEL")).toBeTruthy();

    // ThemeProvider scoping: the themed subtree carries data-st-theme.
    const themed = container.querySelector("[data-st-theme]");
    expect(themed).toBeTruthy();

    // The smoke element renders INSIDE the themed subtree, not outside it.
    const smoke = container.querySelector(".st-scaffoldSmoke");
    expect(smoke).toBeTruthy();
    expect(themed?.querySelector(".st-scaffoldSmoke")).toBe(smoke);

    // Token resolution: ThemeProvider injects the compiled theme stylesheet
    // defining the --st-* custom properties the smoke element reads (each with
    // an inline fallback in the component, spec §2.5 / A0-17).
    const style = document.head.querySelector("style[data-st-theme-provider]");
    expect(style).toBeTruthy();
    const css = style?.textContent ?? "";
    expect(css).toContain("--st-");
    for (const name of [
      "--st-semantic-surface-raised",
      "--st-semantic-text-primary",
      "--st-spacing-2",
      "--st-spacing-3"
    ]) {
      expect(css).toContain(name);
    }
  });

  it("the barrel exports no component yet (types only, erased at runtime)", () => {
    expect(Object.keys(barrel)).toEqual([]);
  });
});
