import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MenuTriggerButton } from "./MenuTriggerButton.js";
import { OverflowMenu } from "./OverflowMenu.js";
import { Popover } from "./Popover.js";
import { Toggletip } from "./Toggletip.js";
import { Tooltip } from "./Tooltip.js";

afterEach(cleanup);

describe("P3 lane 1 edges (signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every lane module", () => {
    render(
      <>
        <MenuTriggerButton data-testid="e-menutriggerbutton" aria-label="M" className={signal("x-menutriggerbutton")} />
        <OverflowMenu data-testid="e-overflowmenu" items={[]} className={signal("x-overflowmenu")} />
        <Popover
          data-testid="e-popover"
          trigger={
            <button type="button">T</button>
          }
          className={signal("x-popover")}
        >
          B
        </Popover>
        <Toggletip data-testid="e-toggletip" label="L" className={signal("x-toggletip")}>
          B
        </Toggletip>
        <Tooltip data-testid="e-tooltip" content="C" className={signal("x-tooltip")}>
          <button type="button">T</button>
        </Tooltip>
      </>,
    );
    for (const [testId, extra] of [
      ["e-menutriggerbutton", "x-menutriggerbutton"],
      ["e-overflowmenu", "x-overflowmenu"],
      ["e-popover", "x-popover"],
      ["e-toggletip", "x-toggletip"],
      ["e-tooltip", "x-tooltip"],
    ]) {
      expect(screen.getByTestId(testId).classList.contains(extra)).toBe(true);
    }
  });

  it("merges consumer string, object and signal styles", async () => {
    const style = signal({ color: "green" });
    render(
      <>
        <MenuTriggerButton data-testid="s-string" aria-label="A" style="max-width: 20rem" />
        <Toggletip data-testid="s-object" label="L" style={{ color: "red" }}>
          B
        </Toggletip>
        <OverflowMenu data-testid="s-signal" items={[]} style={style} />
      </>,
    );
    expect((screen.getByTestId("s-string") as HTMLElement).style.maxWidth).toBe("20rem");
    expect((screen.getByTestId("s-object") as HTMLElement).style.color).toBe("red");
    expect((screen.getByTestId("s-signal") as HTMLElement).style.color).toBe("green");
    style.value = { color: "blue" };
    await waitFor(() => expect((screen.getByTestId("s-signal") as HTMLElement).style.color).toBe("blue"));
  });

  it("MenuTriggerButton follows open and expanded signals mutated after mount", async () => {
    const open = signal(false);
    const { unmount } = render(<MenuTriggerButton open={open} aria-label="Actions" />);
    const button = screen.getByRole("button", { name: "Actions" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    open.value = true;
    await waitFor(() => expect(button.getAttribute("aria-expanded")).toBe("true"));
    unmount();

    const expanded = signal(false);
    render(<MenuTriggerButton expanded={expanded} aria-label="More" />);
    const alias = screen.getByRole("button", { name: "More" });
    expect(alias.getAttribute("aria-expanded")).toBe("false");
    expanded.value = true;
    await waitFor(() => expect(alias.getAttribute("aria-expanded")).toBe("true"));
  });

  it("OverflowMenu follows open and dense signals mutated after mount", async () => {
    const open = signal(false);
    const dense = signal(false);
    render(
      <OverflowMenu
        data-testid="e-overflow"
        open={open}
        dense={dense}
        items={[{ label: "Edit" }]}
        label="Actions"
      />,
    );
    const host = screen.getByTestId("e-overflow");
    expect(host.classList.contains("st-overflowMenu--dense")).toBe(false);
    expect(screen.queryByRole("menuitem", { name: "Edit" })).toBeNull();
    dense.value = true;
    await waitFor(() => expect(host.classList.contains("st-overflowMenu--dense")).toBe(true));
    open.value = true;
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edit" })).toBeTruthy());
  });

  it("OverflowMenu closes a flat menu on leaf select and on Escape", async () => {
    const onSelect = vi.fn();
    render(<OverflowMenu items={[{ id: "rename", label: "Rename" }]} label="More actions" onSelect={onSelect} />);
    const trigger = screen.getByRole("button", { name: "More actions" });
    fireEvent.click(trigger);
    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]).toHaveLength(1);
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "Rename" })).toBeNull());

    fireEvent.click(trigger);
    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Rename" }), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "Rename" })).toBeNull());
  });

  it("Popover follows an open signal mutated after mount and derives its label from the trigger", async () => {
    const open = signal(false);
    render(
      <Popover open={open} trigger={<button type="button">Context</button>}>
        Popover body
      </Popover>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    open.value = true;
    await waitFor(() => expect(screen.getByRole("dialog", { name: "Context" })).toBeTruthy());
  });

  it("Popover opens on trigger click and closes on Escape and outside mousedown", async () => {
    render(
      <>
        <Popover trigger={<button type="button">Context</button>}>Popover body</Popover>
        <button type="button">Outside</button>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Context" }));
    const dialog = screen.getByRole("dialog", { name: "Context" });
    expect(dialog.className).toContain("st-popover--bottom");
    fireEvent.mouseDown(screen.getByRole("button", { name: "Outside" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "Context" }));
    expect(screen.getByRole("dialog", { name: "Context" })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Context" }), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("Toggletip follows an open signal mutated after mount", async () => {
    const open = signal(false);
    render(<Toggletip open={open} label="More information" content="Persistent help" />);
    const trigger = screen.getByRole("button", { name: "More information" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("status")).toBeNull();
    open.value = true;
    await waitFor(() => {
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(screen.getByRole("status").textContent).toContain("Persistent help");
    });
  });

  it("Toggletip toggles on trigger click and closes on Escape", async () => {
    render(<Toggletip label="More information" content="Persistent help" />);
    const trigger = screen.getByRole("button", { name: "More information" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("status").textContent).toContain("Persistent help");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });

  it("Tooltip reveals its content on hover and focus", async () => {
    const { container } = render(
      <Tooltip content="Detailed help">
        <button type="button">Hover help</button>
      </Tooltip>,
    );
    const host = container.querySelector(".st-tooltip") as HTMLElement;
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip.getAttribute("aria-hidden")).toBe("true");

    fireEvent.mouseEnter(host);
    await waitFor(() => expect(tooltip.getAttribute("aria-hidden")).toBe("false"));
    fireEvent.mouseLeave(host);
    await waitFor(() => expect(tooltip.getAttribute("aria-hidden")).toBe("true"));

    fireEvent.focusIn(screen.getByRole("button", { name: "Hover help" }));
    await waitFor(() => expect(tooltip.getAttribute("aria-hidden")).toBe("false"));
    fireEvent.focusIn(document.body);
    await waitFor(() => expect(tooltip.getAttribute("aria-hidden")).toBe("true"));
  });
});
