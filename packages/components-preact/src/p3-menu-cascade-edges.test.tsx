import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MenuPopover } from "./MenuPopover.js";
import { MenuTriggerButton } from "./MenuTriggerButton.js";
import { OverflowMenu } from "./OverflowMenu.js";
import { Popover } from "./Popover.js";
import { Toggletip } from "./Toggletip.js";
import { Tooltip } from "./Tooltip.js";

afterEach(cleanup);

describe("P3 group 1 edges (menu cascade: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every group-1 module", () => {
    render(
      <>
        <MenuTriggerButton data-testid="e-menutrigger" className={signal("x-menutrigger")} />
        <OverflowMenu data-testid="e-overflow" items={[]} label="M" className={signal("x-overflow")} />
        <Popover data-testid="e-popover" content="C" className={signal("x-popover")}>
          T
        </Popover>
        <Toggletip data-testid="e-toggletip" label="L" className={signal("x-toggletip")}>
          B
        </Toggletip>
        <Tooltip data-testid="e-tooltip" content="C" className={signal("x-tooltip")}>
          T
        </Tooltip>
        <MenuPopover data-testid="e-menupopover" open trigger={null} label="M" className={signal("x-menupopover")}>
          body
        </MenuPopover>
      </>,
    );
    for (const [testId, extra] of [
      ["e-menutrigger", "x-menutrigger"],
      ["e-overflow", "x-overflow"],
      ["e-popover", "x-popover"],
      ["e-toggletip", "x-toggletip"],
      ["e-tooltip", "x-tooltip"],
      ["e-menupopover", "x-menupopover"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
  });

  it("MenuTriggerButton follows open and expanded signals mutated after mount", async () => {
    const open = signal(false);
    const { container, unmount } = render(<MenuTriggerButton open={open} />);
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("false");
    open.value = true;
    await waitFor(() => expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true"));
    unmount();
    const expanded = signal(false);
    render(<MenuTriggerButton expanded={expanded} />);
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("false");
    expanded.value = true;
    await waitFor(() => expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true"));
  });

  it("follows className signals mutated after mount on every group-1 module", async () => {
    const menutrigger = signal("x-menutrigger");
    const overflow = signal("x-overflow");
    const popover = signal("x-popover");
    const toggletip = signal("x-toggletip");
    const tooltip = signal("x-tooltip");
    const menupopover = signal("x-menupopover");
    render(
      <>
        <MenuTriggerButton data-testid="m-menutrigger" className={menutrigger} />
        <OverflowMenu data-testid="m-overflow" items={[]} label="M" className={overflow} />
        <Popover data-testid="m-popover" content="C" className={popover}>
          T
        </Popover>
        <Toggletip data-testid="m-toggletip" label="L" className={toggletip}>
          B
        </Toggletip>
        <Tooltip data-testid="m-tooltip" content="C" className={tooltip}>
          T
        </Tooltip>
        <MenuPopover data-testid="m-menupopover" open trigger={null} label="M" className={menupopover}>
          body
        </MenuPopover>
      </>,
    );
    const cases = [
      ["m-menutrigger", menutrigger],
      ["m-overflow", overflow],
      ["m-popover", popover],
      ["m-toggletip", toggletip],
      ["m-tooltip", tooltip],
      ["m-menupopover", menupopover],
    ] as const;
    for (const [testId, sig] of cases) {
      expect(screen.getByTestId(testId).className).toContain(sig.value);
    }
    for (const [, sig] of cases) {
      sig.value = "x-after";
    }
    for (const [testId] of cases) {
      await waitFor(() => expect(screen.getByTestId(testId).className).toContain("x-after"));
    }
  });

  it("Popover follows an open signal mutated after mount and keeps the consumer onClick", async () => {
    const open = signal(false);
    const { container } = render(
      <Popover trigger="T" content="C" open={open} />,
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    open.value = true;
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeTruthy());
    await waitFor(() =>
      expect(container.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("T"),
    );
    const onClick = vi.fn();
    const { container: uncontrolled } = render(
      <Popover trigger="T" content="C" onClick={onClick} />,
    );
    expect(uncontrolled.querySelector('[role="dialog"]')).toBeNull();
    fireEvent.click(uncontrolled.querySelector(".st-popover-host") as HTMLElement);
    expect(uncontrolled.querySelector('[role="dialog"]')).toBeTruthy();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Toggletip follows an open signal mutated after mount", async () => {
    const open = signal(false);
    const { container } = render(
      <Toggletip label="L" content="C" open={open} />,
    );
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector('[role="status"]')).toBeNull();
    open.value = true;
    await waitFor(() => expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true"));
    await waitFor(() => expect(container.querySelector('[role="status"]')?.textContent).toBe("C"));
  });

  it("Tooltip shows on hover and keeps consumer handlers", () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onBlur = vi.fn();
    const { container } = render(
      <Tooltip content="C" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onBlur={onBlur}>
        T
      </Tooltip>,
    );
    const host = container.querySelector(".st-tooltip") as HTMLElement;
    expect(host.querySelector('[role="tooltip"]')?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.mouseEnter(host);
    expect(host.querySelector('[role="tooltip"]')?.getAttribute("aria-hidden")).toBe("false");
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(host);
    expect(host.querySelector('[role="tooltip"]')?.getAttribute("aria-hidden")).toBe("true");
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
    fireEvent.blur(host);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("Tooltip keeps a consumer onFocus and opens on focus-in", () => {
    const onFocus = vi.fn();
    const { container } = render(
      <Tooltip content="C" onFocus={onFocus}>
        T
      </Tooltip>,
    );
    const host = container.querySelector(".st-tooltip") as HTMLElement;
    expect(host.querySelector('[role="tooltip"]')?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.focusIn(host);
    expect(host.querySelector('[role="tooltip"]')?.getAttribute("aria-hidden")).toBe("false");
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it("Tooltip closes when focus leaves to body", () => {
    const onBlur = vi.fn();
    const { container } = render(
      <Tooltip content="C" onBlur={onBlur}>
        T
      </Tooltip>,
    );
    const host = container.querySelector(".st-tooltip") as HTMLElement;
    fireEvent.focusIn(host);
    expect(host.querySelector('[role="tooltip"]')?.getAttribute("aria-hidden")).toBe("false");
    // Leaving to `body` fires no `focusin`: the bubbling leave still closes.
    fireEvent.focusOut(host);
    expect(host.querySelector('[role="tooltip"]')?.getAttribute("aria-hidden")).toBe("true");
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("OverflowMenu follows open and dense signals mutated after mount", async () => {
    const open = signal(false);
    const dense = signal(false);
    const { container } = render(
      <OverflowMenu items={[{ label: "A" }]} label="M" open={open} dense={dense} />,
    );
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(container.querySelector(".st-overflowMenu")?.className).not.toContain("st-overflowMenu--dense");
    open.value = true;
    await waitFor(() => expect(container.querySelector('[role="menu"]')).toBeTruthy());
    dense.value = true;
    await waitFor(() =>
      expect(container.querySelector(".st-overflowMenu")?.className).toContain("st-overflowMenu--dense"),
    );
  });

  it("MenuPopover follows an open signal mutated after mount and keeps a consumer style", async () => {
    const open = signal(false);
    const { container } = render(
      <MenuPopover open={open} trigger={null} label="M" style="color: red">
        body
      </MenuPopover>,
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    open.value = true;
    let dialog: HTMLElement | null = null;
    await waitFor(() => {
      dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });
    expect((dialog as unknown as HTMLElement).textContent).toContain("body");
    expect((dialog as unknown as HTMLElement).style.color).toBe("red");
    expect((dialog as unknown as HTMLElement).style.top).toBe("0px");
  });
});
