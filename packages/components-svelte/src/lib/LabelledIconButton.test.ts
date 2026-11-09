import { fireEvent, render, screen } from "@testing-library/svelte";
import {
  ChevronDown,
  ChevronRight,
  CircleDashed,
  Eye,
  EyeOff,
  Layers,
  MessageSquare,
  Settings,
  Target,
  X
} from "@lucide/svelte";
import { describe, expect, it, vi } from "vitest";
import LabelledIconButton from "./LabelledIconButton.svelte";
import { ICONS, ICON_NAMES, type IconName } from "./icons.js";

// W-1.0 — CA-L1 fold-in witnesses (AS-1 performs the fold-in: the eight
// pre-existing icon mappings are unchanged and `comment` is added, plus
// `circle-dashed`, ten names total). Sentinel strings are non-real so nothing is
// hard-coded in the component. The three additive props (pressed /
// ariaKeyshortcuts / tooltipContent) are recorded as a CA-L1 amendment.

const SENTINEL = "SENTINEL";
const LABEL = `${SENTINEL}-LABEL`;
const TOOLTIP = `${SENTINEL}-TOOLTIP-CONTENT`;
// Non-real but WAI-ARIA-grammar-valid sentinel (Alt+Shift+Z).
const SHORTCUTS = "Alt+Shift+Z";

const PRE_EXISTING: Array<[IconName, unknown]> = [
  ["settings", Settings],
  ["eye", Eye],
  ["eye-off", EyeOff],
  ["layers", Layers],
  ["target", Target],
  ["close", X],
  ["chevron-down", ChevronDown],
  ["chevron-right", ChevronRight],
  ["comment", MessageSquare],
  ["circle-dashed", CircleDashed]
];

describe("W-1.0 LabelledIconButton (CA-L1 fold-in)", () => {
  it("the icon catalogue keeps the eight pre-existing mappings and adds comment -> MessageSquare and circle-dashed -> CircleDashed", () => {
    expect(ICON_NAMES).toHaveLength(10);
    for (const [name, glyph] of PRE_EXISTING) {
      expect(ICONS[name], `mapping for "${name}" changed`).toBe(glyph);
    }
    expect(ICON_NAMES).toContain("comment");
    expect(ICONS.comment).toBe(MessageSquare);
    expect(ICON_NAMES).toContain("circle-dashed");
    expect(ICONS["circle-dashed"]).toBe(CircleDashed);
  });

  it("renders exactly one button whose accessible name is exactly the label", () => {
    const { container } = render(LabelledIconButton, { props: { label: LABEL, icon: "comment" } });
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(1);
    expect(screen.getByRole("button", { name: LABEL })).toBe(buttons[0]);
    // no visible text node beside the glyph: the label lives in the
    // accessibility/tooltip layer only
    expect(buttons[0].textContent?.trim()).toBe("");
  });

  it("tooltip content defaults to the label; tooltipContent overrides it while the accessible name stays label", async () => {
    const { container, unmount } = render(LabelledIconButton, { props: { label: LABEL, icon: "comment" } });
    expect(container.querySelector('[role="tooltip"]')?.textContent).toBe(LABEL);
    // focus reveals the tooltip content (real :focus-within visibility is the
    // browser row; jsdom asserts the content the focus path renders)
    const button = container.querySelector("button") as HTMLButtonElement;
    await fireEvent.focus(button);
    expect(container.querySelector('[role="tooltip"]')?.textContent).toBe(LABEL);
    unmount();

    const { container: c2 } = render(LabelledIconButton, {
      props: { label: LABEL, icon: "comment", tooltipContent: TOOLTIP }
    });
    expect(c2.querySelector('[role="tooltip"]')?.textContent).toBe(TOOLTIP);
    expect(screen.getByRole("button", { name: LABEL })).toBeTruthy();
  });

  it("the glyph is decorative (aria-hidden) inside the button", () => {
    const { container } = render(LabelledIconButton, { props: { label: LABEL, icon: "comment" } });
    const svg = container.querySelector("button svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("forwards disabled / variant / size to the IconButton", () => {
    const { container } = render(LabelledIconButton, {
      props: { label: LABEL, icon: "comment", disabled: true, variant: "danger", size: "sm" }
    });
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.className).toContain("st-iconButton--danger");
    expect(button.className).toContain("st-iconButton--sm");
  });

  it("CA-L1 amendment: pressed -> aria-pressed and ariaKeyshortcuts -> aria-keyshortcuts verbatim", () => {
    const { container } = render(LabelledIconButton, {
      props: { label: LABEL, icon: "comment", pressed: true, ariaKeyshortcuts: SHORTCUTS }
    });
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("aria-keyshortcuts")).toBe(SHORTCUTS);
  });

  it("omits aria-keyshortcuts when the amendment prop is not set", () => {
    const { container } = render(LabelledIconButton, { props: { label: LABEL, icon: "comment", pressed: false } });
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.hasAttribute("aria-keyshortcuts")).toBe(false);
  });

  it("click fires onclick exactly once", async () => {
    const onclick = vi.fn();
    const { container } = render(LabelledIconButton, { props: { label: LABEL, icon: "comment", onclick } });
    await fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    expect(onclick).toHaveBeenCalledTimes(1);
  });
});
