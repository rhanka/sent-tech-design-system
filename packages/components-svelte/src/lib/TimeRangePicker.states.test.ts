import { fireEvent, render } from "@testing-library/svelte";
import { createRawSnippet, tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import Calendar from "./Calendar.svelte";
import ContentSwitcher from "./ContentSwitcher.svelte";
import MenuPopover from "./MenuPopover.svelte";
import RadioGroup from "./RadioGroup.svelte";
import TimeRangePicker from "./TimeRangePicker.svelte";
import type { TimeRange } from "./TimeRangePicker.svelte";
import radioGroupSrc from "./RadioGroup.svelte?raw";

function triggerButton(container: HTMLElement): HTMLButtonElement {
  return container.querySelector(".st-timeRangePicker__trigger") as HTMLButtonElement;
}
async function openPanel(container: HTMLElement) {
  await fireEvent.click(triggerButton(container));
  await tick();
}

function monthLabels(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll(".st-calendar__monthLabel")).map(
    (el) => el.textContent?.trim() ?? ""
  );
}
function monthTime(label: string): number {
  return new Date(`${label} 01`).getTime();
}
function navButtons(container: HTMLElement, index: 0 | 1, dir: "prev" | "next"): HTMLButtonElement {
  const calendars = container.querySelectorAll(".st-calendar");
  const buttons = calendars[index].querySelectorAll(".st-calendar__navBtn");
  return (dir === "prev" ? buttons[0] : buttons[1]) as HTMLButtonElement;
}

const SPAN: TimeRange = {
  mode: "absolute",
  from: new Date(2024, 0, 15, 10, 0).getTime(),
  to: new Date(2024, 2, 10, 11, 30).getTime()
};

describe("Calendar — onMonthChange", () => {
  it("fires with the new YYYY-MM on prev/next navigation", async () => {
    const onMonthChange = vi.fn();
    const { container } = render(Calendar, { props: { month: "2024-01", onMonthChange } });
    await fireEvent.click(navButtons(container, 0, "next"));
    expect(onMonthChange).toHaveBeenLastCalledWith("2024-02");
    await fireEvent.click(navButtons(container, 0, "prev"));
    await fireEvent.click(navButtons(container, 0, "prev"));
    expect(onMonthChange).toHaveBeenLastCalledWith("2023-12");
    expect(onMonthChange).toHaveBeenCalledTimes(3);
  });

  it("does not fire when the parent drives the month prop (no loop)", async () => {
    const onMonthChange = vi.fn();
    const view = render(Calendar, { props: { month: "2024-01", onMonthChange } });
    await view.rerender({ month: "2024-06", onMonthChange });
    await tick();
    expect(onMonthChange).not.toHaveBeenCalled();
    expect(view.container.querySelector(".st-calendar__monthLabel")?.textContent).toMatch(/2024/);
  });
});

describe("TimeRangePicker — month coupling", () => {
  it("seeds left on the start month and right on the end month when it is later", async () => {
    const { container } = render(TimeRangePicker, { props: { value: SPAN, locale: "en-US" } });
    await openPanel(container);
    expect(monthLabels(container)).toEqual(["January 2024", "March 2024"]);
  });

  it("seeds right on left + 1 when both bounds share a month", async () => {
    const same: TimeRange = {
      mode: "absolute",
      from: new Date(2024, 4, 1, 10, 0).getTime(),
      to: new Date(2024, 4, 20, 11, 0).getTime()
    };
    const { container } = render(TimeRangePicker, { props: { value: same, locale: "en-US" } });
    await openPanel(container);
    expect(monthLabels(container)).toEqual(["May 2024", "June 2024"]);
  });

  it("pushing left past right nudges right to left + 1 (the reported overlap)", async () => {
    const { container } = render(TimeRangePicker, { props: { value: SPAN, locale: "en-US" } });
    await openPanel(container);
    await fireEvent.click(navButtons(container, 0, "next"));
    await tick();
    await fireEvent.click(navButtons(container, 0, "next"));
    await tick();
    // Left Jan -> Mar; right was Mar, pushed to Apr.
    expect(monthLabels(container)).toEqual(["March 2024", "April 2024"]);
  });

  it("pushing right back to left nudges left to right - 1", async () => {
    const { container } = render(TimeRangePicker, { props: { value: SPAN, locale: "en-US" } });
    await openPanel(container);
    await fireEvent.click(navButtons(container, 1, "prev"));
    await tick();
    await fireEvent.click(navButtons(container, 1, "prev"));
    await tick();
    // Right Mar -> Jan; left was Jan, pushed back to Dec 2023.
    expect(monthLabels(container)).toEqual(["December 2023", "January 2024"]);
  });

  it("keeps right strictly after left through a click sequence", async () => {
    const { container } = render(TimeRangePicker, { props: { value: SPAN, locale: "en-US" } });
    await openPanel(container);
    const moves: Array<[0 | 1, "prev" | "next"]> = [
      [0, "next"],
      [0, "next"],
      [1, "prev"],
      [1, "prev"],
      [1, "prev"],
      [0, "prev"]
    ];
    for (const [index, dir] of moves) {
      await fireEvent.click(navButtons(container, index, dir));
      await tick();
      const [l, r] = monthLabels(container);
      expect(monthTime(r), `${l} vs ${r}`).toBeGreaterThan(monthTime(l));
    }
  });

  it("leaves calendarMonths = 1 alone (single calendar)", async () => {
    const { container } = render(TimeRangePicker, {
      props: { value: SPAN, locale: "en-US", calendarMonths: 1 }
    });
    await openPanel(container);
    expect(container.querySelectorAll(".st-calendar")).toHaveLength(1);
    expect(monthLabels(container)).toEqual(["January 2024"]);
  });
});

describe("Calendar — range classes", () => {
  it("marks endpoints selected and strict interior days in-range", async () => {
    const { container } = render(Calendar, {
      props: { range: true, value: ["2024-01-10", "2024-01-15"], month: "2024-01" }
    });
    const day = (iso: string) => container.querySelector(`[data-date="${iso}"]`) as HTMLElement;
    expect(day("2024-01-10").classList.contains("st-calendar__day--selected")).toBe(true);
    expect(day("2024-01-15").classList.contains("st-calendar__day--selected")).toBe(true);
    expect(day("2024-01-10").classList.contains("st-calendar__day--inRange")).toBe(false);
    expect(day("2024-01-12").classList.contains("st-calendar__day--inRange")).toBe(true);
    expect(day("2024-01-12").classList.contains("st-calendar__day--selected")).toBe(false);
    expect(day("2024-01-20").classList.contains("st-calendar__day--inRange")).toBe(false);
  });
});

describe("TimeRangePicker — customHeader slot", () => {
  const header = createRawSnippet(() => ({
    render: () =>
      `<fieldset data-testid="trp-header"><legend>Date kind</legend><label><input type="radio" name="kind" value="doc" />Document</label></fieldset>`
  }));

  it("renders the header at the top of the Custom tab, above the calendars", async () => {
    const { container, getByRole } = render(TimeRangePicker, {
      props: { customHeader: header, locale: "en-US" }
    });
    await openPanel(container);
    // Relative tab first: no header.
    expect(container.querySelector(".st-timeRangePicker__customHeader")).toBeNull();
    await fireEvent.click(getByRole("tab", { name: "Custom" }));
    const slot = container.querySelector(".st-timeRangePicker__customHeader") as HTMLElement;
    expect(slot.querySelector('[data-testid="trp-header"]')).toBeTruthy();
    const calendars = container.querySelector(".st-timeRangePicker__calendars") as HTMLElement;
    expect(slot.compareDocumentPosition(calendars) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Header content is focusable through the panel trap.
    expect(slot.querySelector('input[name="kind"]')).toBeTruthy();
  });

  it("renders no header wrapper when the snippet is not provided", async () => {
    const { container, getByRole } = render(TimeRangePicker, { props: { locale: "en-US" } });
    await openPanel(container);
    await fireEvent.click(getByRole("tab", { name: "Custom" }));
    expect(container.querySelector(".st-timeRangePicker__customHeader")).toBeNull();
  });
});

describe("ContentSwitcher — selected state", () => {
  it("marks exactly the active option selected", () => {
    const { container } = render(ContentSwitcher, {
      props: {
        items: [
          { value: "relative", label: "Relative" },
          { value: "absolute", label: "Custom" }
        ],
        value: "absolute"
      }
    });
    const options = Array.from(container.querySelectorAll(".st-contentSwitcher__option"));
    expect(options).toHaveLength(2);
    expect(options[0].classList.contains("st-contentSwitcher__option--selected")).toBe(false);
    expect(options[1].classList.contains("st-contentSwitcher__option--selected")).toBe(true);
    expect(options[1].getAttribute("aria-selected")).toBe("true");
  });
});

describe("MenuPopover — viewport positioning + top layer", () => {
  function openWithTrigger() {
    const trigger = document.createElement("button");
    trigger.textContent = "Trigger";
    document.body.appendChild(trigger);
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 40,
      bottom: 80,
      left: 10,
      right: 110,
      width: 100,
      height: 40,
      x: 10,
      y: 40,
      toJSON: () => ({})
    } as DOMRect);
    const view = render(MenuPopover, {
      props: { open: true, trigger, label: "Menu", placement: "bottom-start" }
    });
    return { view, trigger };
  }

  it("uses viewport coordinates (no document scroll offsets) and no popover attribute without the API", async () => {
    Object.defineProperty(window, "scrollX", { configurable: true, value: 50 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 100 });
    const { view, trigger } = openWithTrigger();
    try {
      await tick();
      const panel = view.container.querySelector(".st-menuPopover") as HTMLElement;
      // rect.bottom(80) + GAP(4): scrollY(100) must NOT be added.
      expect(panel.style.top).toBe("84px");
      expect(panel.style.left).toBe("10px");
      // jsdom has no Popover API: no attribute (a static one would force
      // display:none via the UA rule), plain fixed positioning applies.
      expect("showPopover" in panel).toBe(false);
      expect(panel.hasAttribute("popover")).toBe(false);
    } finally {
      Object.defineProperty(window, "scrollX", { configurable: true, value: 0 });
      Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
      trigger.remove();
      view.unmount();
    }
  });

  it("lifts into the top layer (popover=manual + showPopover) where the API exists", async () => {
    const showPopover = vi.fn();
    const hidePopover = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "showPopover", {
      configurable: true,
      value: showPopover
    });
    Object.defineProperty(HTMLElement.prototype, "hidePopover", {
      configurable: true,
      value: hidePopover
    });
    const { view, trigger } = openWithTrigger();
    try {
      await tick();
      const panel = view.container.querySelector(".st-menuPopover") as HTMLElement;
      expect(showPopover).toHaveBeenCalledTimes(1);
      expect(panel.getAttribute("popover")).toBe("manual");
      view.unmount();
      expect(hidePopover).toHaveBeenCalled();
    } finally {
      // @ts-expect-error cleanup of the test-only API mock
      delete HTMLElement.prototype.showPopover;
      // @ts-expect-error cleanup of the test-only API mock
      delete HTMLElement.prototype.hidePopover;
      trigger.remove();
    }
  });

  it("flips to the side with room when the requested side does not fit", async () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 600 });
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      top: 500,
      bottom: 540,
      left: 10,
      right: 110,
      width: 100,
      height: 40,
      x: 10,
      y: 500,
      toJSON: () => ({})
    } as DOMRect);
    const view = render(MenuPopover, {
      props: { open: true, trigger, label: "Menu", placement: "bottom-start" }
    });
    try {
      await tick();
      const panel = view.container.querySelector(".st-menuPopover") as HTMLElement;
      // Below: 600-540-4 = 56 < MIN_HEIGHT(160); above wins -> top-* class.
      expect(panel.classList.contains("st-menuPopover--top-start")).toBe(true);
      expect(panel.style.top).toBe("496px");
    } finally {
      trigger.remove();
      view.unmount();
    }
  });
});

describe("TimeRangePicker — onApply / onCancel draft events", () => {
  it("fires onApply with the value on Apply, without onCancel", async () => {
    const onChange = vi.fn();
    const onApply = vi.fn();
    const onCancel = vi.fn();
    const view = render(TimeRangePicker, {
      props: { value: SPAN, onChange, onApply, onCancel, locale: "en-US" }
    });
    await openPanel(view.container);
    await fireEvent.click(view.getByRole("button", { name: "Apply" }));
    await tick();
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0]).toEqual({ mode: "absolute", from: SPAN.from, to: SPAN.to });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("fires onCancel on Cancel, Escape, outside click and trigger re-click — never on mount", async () => {
    const onCancel = vi.fn();
    const onChange = vi.fn();
    const view = render(TimeRangePicker, {
      props: { value: SPAN, onCancel, onChange, locale: "en-US" }
    });
    await tick();
    expect(onCancel).not.toHaveBeenCalled();

    // Cancel button.
    await openPanel(view.container);
    await fireEvent.click(view.getByRole("button", { name: "Cancel" }));
    await tick();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();

    // Escape.
    await openPanel(view.container);
    await fireEvent.keyDown(window, { key: "Escape" });
    await tick();
    expect(onCancel).toHaveBeenCalledTimes(2);

    // Outside click.
    await openPanel(view.container);
    await fireEvent.pointerDown(document.body);
    await tick();
    expect(onCancel).toHaveBeenCalledTimes(3);

    // Trigger re-click.
    await openPanel(view.container);
    await fireEvent.click(triggerButton(view.container));
    await tick();
    expect(onCancel).toHaveBeenCalledTimes(4);
  });

  it("does not fire onCancel on preset selection or Apply", async () => {
    const onCancel = vi.fn();
    const relative: TimeRange = {
      mode: "relative",
      relative: "30m",
      from: Date.now() - 1_800_000,
      to: Date.now()
    };
    const view = render(TimeRangePicker, { props: { value: relative, onCancel, locale: "en-US" } });
    await openPanel(view.container);
    await fireEvent.click(view.container.querySelector('[data-value="6h"]') as HTMLElement);
    await tick();
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe("RadioGroup — legend entry point", () => {
  it("declares the tunable legend font size with the current rendering as default", () => {
    expect(radioGroupSrc).toContain("--st-component-selection-legendFontSize, 0.9375rem");
  });

  it("renders the legend unchanged by default", () => {
    const { container } = render(RadioGroup, {
      props: { legend: "Date basis", name: "basis", options: [] }
    });
    const legend = container.querySelector(".st-radioGroup__legend") as HTMLElement;
    expect(legend.textContent).toBe("Date basis");
  });
});
