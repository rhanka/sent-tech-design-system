import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { compileTheme } from "@sentropic/design-system-themes";
import { compile } from "svelte/compiler";
import type { ComponentProps } from "svelte";
import { describe, expect, it, vi } from "vitest";
import CommentModeToggle from "./CommentModeToggle.svelte";
import { modeLabels, viewerThemes } from "./fixtures.js";

// W-1.1 — CommentModeToggle witness (F-T1 unpressed, F-T2 pressed/narrow,
// F-X1 label swap, F-R1 reduced-motion compile half). Sentinels are non-real:
// the shortcut round-trips a sentinel verbatim, proving no key literal is
// hard-coded in the DS (spec §7.1).

const SOURCE = readFileSync(resolve("src/lib/CommentModeToggle.svelte"), "utf8");
const COMPILED_CSS = compile(SOURCE, { css: "external", filename: "CommentModeToggle.svelte" }).css?.code ?? "";

function renderInTheme(props: ComponentProps<typeof CommentModeToggle>) {
  const themeRoot = document.createElement("div");
  themeRoot.setAttribute("data-st-theme", "sent-tech");
  document.body.appendChild(themeRoot);
  return { ...render(CommentModeToggle, { props, target: themeRoot }), themeRoot };
}

function toggleProps(labels = modeLabels(), pressed = false) {
  return {
    pressed,
    label: labels.toggleLabel,
    shortcutLabel: labels.shortcutLabel,
    ariaKeyshortcuts: labels.ariaKeyshortcuts,
    labels: { tooltip: labels.tooltip }
  };
}

describe("W-1.1 CommentModeToggle (F-T1 / F-T2)", () => {
  it("F-T1 unpressed: aria-pressed=false, sentinel aria-keyshortcuts verbatim, tooltip contains shortcutLabel, click -> one onToggle, nothing opens", async () => {
    const labels = modeLabels();
    const onToggle = vi.fn();
    const { container, themeRoot } = renderInTheme({ ...toggleProps(labels, false), onToggle });

    // renders inside the [data-st-theme] subtree, in place (no portal)
    const button = themeRoot.querySelector("button") as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(themeRoot.getAttribute("data-st-theme")).toBe("sent-tech");
    expect(screen.getByRole("button", { name: labels.toggleLabel })).toBe(button);

    expect(button.getAttribute("aria-pressed")).toBe("false");
    // non-real sentinel round-trips verbatim (WAI-ARIA grammar, §7.1 M-2)
    expect(button.getAttribute("aria-keyshortcuts")).toBe(labels.ariaKeyshortcuts);
    expect(labels.ariaKeyshortcuts).toBe("Alt+Shift+Z");

    // tooltip text is labels.tooltip and contains shortcutLabel verbatim
    const tooltip = container.querySelector('[role="tooltip"]');
    expect(tooltip?.textContent).toBe(labels.tooltip);
    expect(labels.tooltip).toContain(labels.shortcutLabel);

    // click emits onToggle exactly once and opens nothing (no composer, list
    // or popover is rendered by the toggle)
    button.focus();
    await fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(document.querySelector('[data-st-shell="comment-mode-status"]')).toBeNull();
    expect(document.querySelector("textarea")).toBeNull();
    // focus stays on the button after activation
    expect(document.activeElement).toBe(button);
  });

  it("F-T2 pressed: accessible name survives from label, pressed non-colour cue (class + weight change) plus aria-pressed", () => {
    const labels = modeLabels();
    const { container, themeRoot } = renderInTheme({ ...toggleProps(labels, true), onToggle: () => {} });

    const button = themeRoot.querySelector("button") as HTMLButtonElement;
    // the accessible name stays `label` at every width — the icon-only
    // presentation is a header layout concern; structurally the name survives
    // with a visually-hidden label (aria-label, no visible text node)
    expect(screen.getByRole("button", { name: labels.toggleLabel })).toBe(button);
    expect(button.textContent?.trim()).toBe("");
    expect(button.getAttribute("aria-pressed")).toBe("true");

    // pressed non-colour cue: modifier class present AND the stylesheet gives
    // it a border/weight change (never colour alone)
    const wrapper = container.querySelector(".st-commentModeToggle--pressed");
    expect(wrapper).toBeTruthy();
    expect(COMPILED_CSS).toContain(".st-commentModeToggle--pressed");
    const pressedRule = COMPILED_CSS.slice(COMPILED_CSS.indexOf(".st-commentModeToggle--pressed"));
    expect(pressedRule).toContain("border-width");
  });

  it("F-T1 unpressed has no pressed cue", () => {
    const { container } = renderInTheme({ ...toggleProps(modeLabels(), false), onToggle: () => {} });
    expect(container.querySelector(".st-commentModeToggle--pressed")).toBeNull();
    expect(container.querySelector(".st-commentModeToggle")).toBeTruthy();
  });

  it("F-X1 label swap: every visible/accessible string changes, zero residual sentinel", async () => {
    const labels = modeLabels();
    const swapped = modeLabels({
      toggleLabel: "SWAPPED-TOGGLE-LABEL",
      shortcutLabel: "SWAPPED-SHORTCUT+Alt+Y",
      ariaKeyshortcuts: "Alt+Shift+Y",
      tooltip: "SWAPPED-TOOLTIP (SWAPPED-SHORTCUT+Alt+Y)"
    });
    const { container, rerender } = renderInTheme({ ...toggleProps(labels, false), onToggle: () => {} });
    expect(container.innerHTML).toContain(labels.toggleLabel);
    expect(container.innerHTML).toContain(labels.tooltip);

    await rerender({ ...toggleProps(swapped, false), onToggle: () => {} });
    const html = container.innerHTML;
    for (const old of [labels.toggleLabel, labels.tooltip, labels.shortcutLabel, labels.ariaKeyshortcuts]) {
      expect(html).not.toContain(old);
    }
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(screen.getByRole("button", { name: swapped.toggleLabel })).toBe(button);
    expect(button.getAttribute("aria-keyshortcuts")).toBe("Alt+Shift+Y");
    expect(container.querySelector('[role="tooltip"]')?.textContent).toBe(swapped.tooltip);
    expect(swapped.tooltip).toContain(swapped.shortcutLabel);
  });

  it("F-R1 reduced motion: the compiled component ships a prefers-reduced-motion block with zero durations", () => {
    const media = COMPILED_CSS.slice(COMPILED_CSS.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(media).toContain("@media (prefers-reduced-motion: reduce)");
    expect(media).toContain("transition-duration: 0s");
    expect(media).toContain("animation-duration: 0s");
  });
});

describe("§5.4 fixture matrix — light and dark viewer themes", () => {
  it("the toggle renders in every viewer theme with the compiled theme variables scoped to the theme root", () => {
    const labels = modeLabels();
    for (const theme of Object.values(viewerThemes)) {
      const themeRoot = document.createElement("div");
      themeRoot.setAttribute("data-st-theme", theme.id);
      const style = document.createElement("style");
      style.textContent = compileTheme(theme);
      themeRoot.appendChild(style);
      document.body.appendChild(themeRoot);
      // the theme root really carries the compiled token table
      expect(style.textContent, theme.id).toContain("--st-semantic-surface-raised");

      const mounted = render(CommentModeToggle, {
        target: themeRoot,
        props: { ...toggleProps(labels, true), onToggle: vi.fn() }
      });
      const root = themeRoot.querySelector('[data-st-shell="comment-mode-toggle"]');
      expect(root, `theme ${theme.id}`).not.toBeNull();
      expect(root?.querySelector("button")).not.toBeNull();

      mounted.unmount();
      expect(themeRoot.querySelector('[data-st-shell="comment-mode-toggle"]')).toBeNull();
      themeRoot.remove();
    }
  });
});
