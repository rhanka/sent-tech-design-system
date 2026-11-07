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

    // Token resolution: ThemeProvider injects the compiled theme stylesheet
    // defining the --st-* custom properties the smoke element reads.
    const style = document.head.querySelector("style[data-st-theme-provider]");
    expect(style).toBeTruthy();
    expect(style?.textContent ?? "").toContain("--st-");

    // The smoke element carries its token-read class (jsdom allows class and
    // custom-property presence, not computed layout).
    expect(container.querySelector(".st-scaffoldSmoke")).toBeTruthy();
  });

  it("the barrel exports no component yet (types only, erased at runtime)", () => {
    expect(Object.keys(barrel)).toEqual([]);
  });
});
