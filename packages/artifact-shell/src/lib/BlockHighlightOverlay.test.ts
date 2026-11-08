import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render } from "@testing-library/svelte";
import { compileTheme } from "@sentropic/design-system-themes";
import { compile } from "svelte/compiler";
import type { ComponentProps } from "svelte";
import { describe, expect, it, vi } from "vitest";
import BlockHighlightOverlay from "./BlockHighlightOverlay.svelte";
import { makeBlock, modeLabels, pageBackgrounds, viewerThemes } from "./fixtures.js";

// W-1.5 — BlockHighlightOverlay witness (F-H1 4 theme/page cells, F-H2
// selected treatment, F-H3 both-null, chip → onAnchor in both treatments,
// reduced motion, F-X1). jsdom asserts structure/classes; the computed
// contrast numbers are browser row B-1 (A1-12, not run (host GPU)).

const SOURCE = readFileSync(resolve("src/lib/BlockHighlightOverlay.svelte"), "utf8");
const COMPILED_CSS = compile(SOURCE, { css: "external", filename: "BlockHighlightOverlay.svelte" }).css?.code ?? "";

/** One fixture cell: a page wrapper on the authored-page background inside a
 *  themed viewer-chrome subtree with the compiled theme variables injected. */
function renderCell(
  theme: (typeof viewerThemes)["light" | "dark"],
  pageKind: "pageLight" | "pageDark",
  props: ComponentProps<typeof BlockHighlightOverlay>
) {
  const themeRoot = document.createElement("div");
  themeRoot.setAttribute("data-st-theme", theme.id);
  const style = document.createElement("style");
  style.textContent = compileTheme(theme);
  themeRoot.appendChild(style);
  const page = document.createElement("div");
  page.setAttribute("data-st-shell", "authored-page");
  // background value comes from the foundation token table at runtime — no
  // colour literal is written here (import-graph gate item 6)
  page.style.background = pageBackgrounds[pageKind].background;
  themeRoot.appendChild(page);
  document.body.appendChild(themeRoot);
  return { ...render(BlockHighlightOverlay, { props, target: page }), themeRoot, page };
}

function overlayProps(labels = modeLabels(), overrides: Record<string, unknown> = {}) {
  return {
    hovered: null,
    selected: null,
    chipLabel: labels.chipLabel,
    ...overrides
  };
}

describe("W-1.5 BlockHighlightOverlay (F-H1 / F-H2 / F-H3)", () => {
  it("F-H1 hover in all 4 theme/page cells: dual stroke elements + fill + label chip with chipLabel; count badge only when threadCount > 0", () => {
    const labels = modeLabels();
    const hovered = makeBlock({ threadCount: 0 });
    const cells = [
      { theme: viewerThemes.light, page: "pageLight" as const },
      { theme: viewerThemes.light, page: "pageDark" as const },
      { theme: viewerThemes.dark, page: "pageLight" as const },
      { theme: viewerThemes.dark, page: "pageDark" as const }
    ];
    for (const cell of cells) {
      const { page } = renderCell(cell.theme, cell.page, {
        ...overlayProps(labels, { hovered }),
        onAnchor: () => {}
      });
      const root = page.querySelector('[data-st-shell="block-highlight-overlay"]') as HTMLElement;
      expect(root, `cell ${cell.theme.id}/${cell.page}`).toBeTruthy();
      const rect = root.querySelector(".st-blockHighlightOverlay__rect--hover") as HTMLElement;
      expect(rect).toBeTruthy();
      // positioned from the rect prop (viewer coordinates)
      expect(rect.style.left).toBe(`${hovered.rect.x}px`);
      expect(rect.style.top).toBe(`${hovered.rect.y}px`);
      expect(rect.style.width).toBe(`${hovered.rect.width}px`);
      expect(rect.style.height).toBe(`${hovered.rect.height}px`);
      // dual-tone outline: both stroke elements + fill, all aria-hidden
      const strokes = rect.querySelectorAll(".st-blockHighlightOverlay__stroke");
      expect(strokes.length).toBe(2);
      expect(rect.querySelector(".st-blockHighlightOverlay__stroke--dark")).toBeTruthy();
      expect(rect.querySelector(".st-blockHighlightOverlay__stroke--light")).toBeTruthy();
      expect(rect.querySelector(".st-blockHighlightOverlay__fill")).toBeTruthy();
      for (const el of [rect.querySelector(".st-blockHighlightOverlay__stroke--dark"), rect.querySelector(".st-blockHighlightOverlay__stroke--light"), rect.querySelector(".st-blockHighlightOverlay__fill")]) {
        expect(el?.getAttribute("aria-hidden")).toBe("true");
      }
      // label chip: chipLabel text, no count badge at threadCount 0
      const chip = rect.querySelector("button.st-blockHighlightOverlay__chip") as HTMLButtonElement;
      expect(chip).toBeTruthy();
      expect(chip.textContent).toContain(labels.chipLabel);
      expect(chip.textContent).not.toContain("0");
      expect(rect.querySelector(".st-blockHighlightOverlay__chipCount")).toBeNull();
      // the chip is a pointer affordance only: not in the Tab order
      expect(chip.getAttribute("tabindex")).toBe("-1");
    }
  });

  it("F-H1 count rule: threadCount > 0 renders the count badge with the number as text", () => {
    const labels = modeLabels();
    const hovered = makeBlock({ threadCount: 2 });
    const { page } = renderCell(viewerThemes.light, "pageLight", {
      ...overlayProps(labels, { hovered }),
      onAnchor: () => {}
    });
    const chip = page.querySelector("button.st-blockHighlightOverlay__chip") as HTMLElement;
    expect(chip.textContent).toContain(labels.chipLabel);
    const badge = chip.querySelector(".st-blockHighlightOverlay__chipCount") as HTMLElement;
    expect(badge).toBeTruthy();
    expect(badge.textContent).toBe("2");
  });

  it("F-H2 selected: selected modifier class distinct from hover, chip shows label + count, chip click → onAnchor; hover chip click → onAnchor too", async () => {
    const labels = modeLabels();
    const selected = makeBlock({ key: "sentinel-selected-key", threadCount: 3 });

    // selected treatment
    const onAnchorSelected = vi.fn();
    const a = renderCell(viewerThemes.light, "pageLight", {
      ...overlayProps(labels, { selected }),
      onAnchor: onAnchorSelected
    });
    const selectedRect = a.page.querySelector(".st-blockHighlightOverlay__rect--selected") as HTMLElement;
    expect(selectedRect).toBeTruthy();
    // hover rect absent; selected cue is the modifier class (never colour alone)
    expect(a.page.querySelector(".st-blockHighlightOverlay__rect--hover")).toBeNull();
    const chipSelected = selectedRect.querySelector("button.st-blockHighlightOverlay__chip") as HTMLButtonElement;
    expect(chipSelected.textContent).toContain(labels.chipLabel);
    expect(chipSelected.querySelector(".st-blockHighlightOverlay__chipCount")?.textContent).toBe("3");
    await fireEvent.click(chipSelected);
    expect(onAnchorSelected).toHaveBeenCalledTimes(1);

    // hover treatment: chip click → onAnchor as well (W-1.5 hover-chip half)
    const onAnchorHover = vi.fn();
    const b = renderCell(viewerThemes.dark, "pageDark", {
      ...overlayProps(labels, { hovered: makeBlock({ threadCount: 1 }) }),
      onAnchor: onAnchorHover
    });
    const hoverRect = b.page.querySelector(".st-blockHighlightOverlay__rect--hover") as HTMLElement;
    expect(hoverRect).toBeTruthy();
    expect(b.page.querySelector(".st-blockHighlightOverlay__rect--selected")).toBeNull();
    const chipHover = hoverRect.querySelector("button.st-blockHighlightOverlay__chip") as HTMLButtonElement;
    await fireEvent.click(chipHover);
    expect(onAnchorHover).toHaveBeenCalledTimes(1);

    // the two treatments are distinguishable by class, and the compiled CSS
    // gives the selected outline an increased WEIGHT (never colour alone):
    // the dark stroke grows to the thick border-width token and the light
    // stroke insets by that same width so it cannot occlude the increase
    expect(COMPILED_CSS).toContain(".st-blockHighlightOverlay__rect--selected");
    const selectedRule = COMPILED_CSS.slice(COMPILED_CSS.indexOf(".st-blockHighlightOverlay__rect--selected"));
    expect(selectedRule).toMatch(/border-width:\s*var\(--st-border-width-thick,\s*2px\)/);
    expect(selectedRule).toMatch(/inset:\s*var\(--st-border-width-thick,\s*2px\)/);
    // hover keeps the baseline dual outline at the thin weight
    const hoverRule = COMPILED_CSS.slice(
      COMPILED_CSS.indexOf(".st-blockHighlightOverlay__stroke--light"),
      COMPILED_CSS.indexOf(".st-blockHighlightOverlay__fill")
    );
    expect(hoverRule).toMatch(/inset:\s*var\(--st-border-width-thin,\s*1px\)/);
    expect(hoverRule).toMatch(/border-width:\s*var\(--st-border-width-thin,\s*1px\)/);
  });

  it("F-H3 both null: renders nothing (no overlay root, no rect)", () => {
    const { page } = renderCell(viewerThemes.light, "pageLight", {
      ...overlayProps(modeLabels()),
      onAnchor: () => {}
    });
    expect(page.querySelector('[data-st-shell="block-highlight-overlay"]')).toBeNull();
    expect(page.querySelector(".st-blockHighlightOverlay__rect")).toBeNull();
    expect(page.childElementCount).toBe(0);
  });

  it("overlay root is pointer-events:none with the chip as the only pointer target; z-order below the candidate list", () => {
    expect(COMPILED_CSS).toMatch(/\.st-blockHighlightOverlay[^{]*\{[^}]*pointer-events:\s*none/);
    expect(COMPILED_CSS).toMatch(/\.st-blockHighlightOverlay__chip[^{]*\{[^}]*pointer-events:\s*auto/);
    // §5.5 layering: highlight/lasso (z 1) < candidate list (z 2) < status (z 3)
    expect(COMPILED_CSS).toMatch(/\.st-blockHighlightOverlay[^{]*\{[^}]*z-index:\s*1/);
  });

  it("chip is positioned inside the block rect (scope §6.4 F2: leaving every stamped block clears the highlight, so the pointer path block → chip must never leave block.rect)", () => {
    // Falsifiable: fails with `top: 100%` + margin (chip outside the rect,
    // unmounted on approach before its click can land).
    // [^{]* spans the svelte scoping hash; the chip rule is the first
    // `.st-blockHighlightOverlay__chip…` selector in the compiled CSS
    const chipRule = COMPILED_CSS.match(/\.st-blockHighlightOverlay__chip[^{]*\{[^}]*\}/)?.[0] ?? "";
    expect(chipRule).toMatch(/top:\s*var\(--st-spacing-1,\s*0\.25rem\)/);
    expect(chipRule).toMatch(/right:\s*var\(--st-spacing-1,\s*0\.25rem\)/);
    expect(chipRule).not.toMatch(/top:\s*100%/);
    expect(chipRule).not.toMatch(/margin-top/);
  });

  it("F-R1 reduced motion: compiled component zeroes durations under the media query", () => {
    const media = COMPILED_CSS.slice(COMPILED_CSS.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(media).toContain("@media (prefers-reduced-motion: reduce)");
    expect(media).toContain("transition-duration: 0s");
    expect(media).toContain("animation-duration: 0s");
  });

  it("F-X1 label swap: chipLabel sentinel swap changes the chip text, zero residual", async () => {
    const labels = modeLabels();
    const swapped = modeLabels({ chipLabel: "SWAPPED-CHIP-LABEL" });
    const { page, rerender } = renderCell(viewerThemes.light, "pageLight", {
      ...overlayProps(labels, { hovered: makeBlock() }),
      onAnchor: () => {}
    });
    expect(page.innerHTML).toContain(labels.chipLabel);
    await rerender({ ...overlayProps(swapped, { hovered: makeBlock() }), onAnchor: () => {} });
    expect(page.innerHTML).not.toContain(labels.chipLabel);
    expect(page.innerHTML).toContain(swapped.chipLabel);
  });
});
