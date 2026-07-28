import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MenuPopover } from "./index.js";
import type { MenuPopoverPlacement } from "./index.js";

afterEach(cleanup);

// Mirrors the real Svelte consumer pattern (TimeRangePicker.svelte,
// IdentityButton.svelte): the trigger button is rendered by the CONSUMER, not
// by MenuPopover itself, and its DOM node is passed in as the `trigger` prop.
function Harness({
  closeOnOutside,
  closeOnEscape,
  placement,
}: {
  closeOnOutside?: boolean;
  closeOnEscape?: boolean;
  placement?: MenuPopoverPlacement;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  return (
    <div>
      <button
        type="button"
        ref={triggerRef}
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((o) => !o)}
      >
        Trigger
      </button>
      <MenuPopover
        open={open}
        onOpenChange={setOpen}
        trigger={triggerRef.current}
        label="Menu"
        placement={placement}
        closeOnOutside={closeOnOutside}
        closeOnEscape={closeOnEscape}
      >
        <button type="button">Item</button>
      </MenuPopover>
    </div>
  );
}

describe("MenuPopover", () => {
  it("renders no popover element when closed (was: always-mounted shell)", () => {
    const { container } = render(<MenuPopover open={false} label="Menu" />);
    expect(container.querySelector(".st-menuPopover")).toBeNull();
  });

  it("renders children directly inside .st-menuPopover when open=true (no wrapper div, Svelte DOM parity)", () => {
    const { container } = render(
      <MenuPopover open label="Menu">
        <button type="button">Item</button>
      </MenuPopover>
    );
    const panel = container.querySelector(".st-menuPopover");
    expect(panel).toBeTruthy();
    expect(container.querySelector(".st-menuPopover__content")).toBeNull();
    expect(panel?.querySelector("button")).toBeTruthy();
  });

  it("sets role=dialog and aria-label from the label prop", () => {
    render(<MenuPopover open label="Actions menu" />);
    expect(screen.getByRole("dialog", { name: "Actions menu" })).toBeTruthy();
  });

  it("applies the placement modifier class", () => {
    const { container } = render(<MenuPopover open label="Menu" placement="top-end" />);
    expect(container.querySelector(".st-menuPopover--top-end")).toBeTruthy();
  });

  it("computes a viewport-aware max-height from the trigger position (not a flat max-height:100vh)", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 40,
      bottom: 200,
      left: 10,
      right: 10,
      width: 0,
      height: 0,
      x: 10,
      y: 40,
      toJSON: () => ({})
    } as DOMRect);
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 600 });

    try {
      const { container } = render(<MenuPopover open label="Menu" trigger={trigger} placement="bottom-start" />);
      const panel = container.querySelector(".st-menuPopover") as HTMLElement;
      // available space below trigger = innerHeight(600) - bottom(200) - GAP(4) - VIEWPORT_MARGIN(8) = 388
      expect(panel.style.maxHeight).toBe("388px");
      expect(panel.style.top).toBe("204px");
      expect(panel.style.left).toBe("10px");
    } finally {
      Object.defineProperty(window, "innerHeight", { configurable: true, value: originalInnerHeight });
      document.body.removeChild(trigger);
    }
  });

  it("floors the computed max-height at MIN_HEIGHT when the trigger is glued to the viewport edge", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 590,
      bottom: 590,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 590,
      toJSON: () => ({})
    } as DOMRect);
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 600 });

    try {
      const { container } = render(<MenuPopover open label="Menu" trigger={trigger} />);
      const panel = container.querySelector(".st-menuPopover") as HTMLElement;
      // available space = 600 - 590 - 4 - 8 = -2 -> floored to MIN_HEIGHT (160)
      expect(panel.style.maxHeight).toBe("160px");
    } finally {
      Object.defineProperty(window, "innerHeight", { configurable: true, value: originalInnerHeight });
      document.body.removeChild(trigger);
    }
  });

  describe("interaction lifecycle (Svelte parity)", () => {
    it("trigger aria-expanded reflects open state", () => {
      render(<Harness />);
      const trigger = screen.getByRole("button", { name: "Trigger" });
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    });

    it("Escape closes the panel", () => {
      render(<Harness />);
      fireEvent.click(screen.getByRole("button", { name: "Trigger" }));
      expect(screen.queryByRole("dialog")).toBeTruthy();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.getByRole("button", { name: "Trigger" }).getAttribute("aria-expanded")).toBe("false");
    });

    it("an outside pointerdown closes the panel", () => {
      render(<Harness />);
      fireEvent.click(screen.getByRole("button", { name: "Trigger" }));
      expect(screen.queryByRole("dialog")).toBeTruthy();
      fireEvent.pointerDown(document.body);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("a pointerdown inside the panel does NOT close it", () => {
      render(<Harness />);
      fireEvent.click(screen.getByRole("button", { name: "Trigger" }));
      fireEvent.pointerDown(screen.getByText("Item"));
      expect(screen.queryByRole("dialog")).toBeTruthy();
    });

    it("a pointerdown on the trigger itself does NOT close it via outside-click handling", () => {
      render(<Harness />);
      const trigger = screen.getByRole("button", { name: "Trigger" });
      fireEvent.click(trigger);
      fireEvent.pointerDown(trigger);
      expect(screen.queryByRole("dialog")).toBeTruthy();
    });

    it("closeOnEscape=false keeps the panel open on Escape", () => {
      render(<Harness closeOnEscape={false} />);
      fireEvent.click(screen.getByRole("button", { name: "Trigger" }));
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByRole("dialog")).toBeTruthy();
    });

    it("closeOnOutside=false keeps the panel open on outside pointerdown", () => {
      render(<Harness closeOnOutside={false} />);
      fireEvent.click(screen.getByRole("button", { name: "Trigger" }));
      fireEvent.pointerDown(document.body);
      expect(screen.queryByRole("dialog")).toBeTruthy();
    });
  });
});
