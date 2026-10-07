import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { TimeRangePicker } from "./TimeRangePicker.js";
import { Calendar, MenuPopover, RadioGroup } from "./index.js";
import { ContentSwitcher as CatalogContentSwitcher } from "./catalog.js";
import type { TimeRange } from "./timeRange.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Pin the shared stylesheet entry points as text (vitest empties `?raw`
// CSS imports, so read the file directly; vitest runs with the package
// directory as cwd).
const stylesCss = readFileSync(resolve("src/styles.css"), "utf8");

afterEach(cleanup);

function openPanel(container: HTMLElement) {
  fireEvent.click(container.querySelector(".st-timeRangePicker__trigger") as HTMLElement);
}

function monthLabels(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll(".st-calendar__monthLabel")).map(
    (el) => el.textContent?.trim() ?? ""
  );
}
function monthTime(label: string): number {
  return new Date(`${label} 01`).getTime();
}
function navButton(container: HTMLElement, index: 0 | 1, dir: "prev" | "next"): HTMLButtonElement {
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
  it("fires with the new YYYY-MM on prev/next navigation", () => {
    const onMonthChange = vi.fn();
    const { container } = render(<Calendar month="2024-01" onMonthChange={onMonthChange} />);
    fireEvent.click(navButton(container, 0, "next"));
    expect(onMonthChange).toHaveBeenLastCalledWith("2024-02");
    fireEvent.click(navButton(container, 0, "prev"));
    fireEvent.click(navButton(container, 0, "prev"));
    expect(onMonthChange).toHaveBeenLastCalledWith("2023-12");
    expect(onMonthChange).toHaveBeenCalledTimes(3);
  });

  it("does not fire when the parent drives the month prop (no loop)", () => {
    const onMonthChange = vi.fn();
    const view = render(<Calendar month="2024-01" onMonthChange={onMonthChange} />);
    view.rerender(<Calendar month="2024-06" onMonthChange={onMonthChange} />);
    expect(onMonthChange).not.toHaveBeenCalled();
    expect(view.container.querySelector(".st-calendar__monthLabel")?.textContent).toMatch(/2024/);
  });
});

describe("TimeRangePicker — month coupling", () => {
  it("seeds left on the start month and right on the end month when it is later", () => {
    const { container } = render(<TimeRangePicker value={SPAN} locale="en-US" />);
    openPanel(container);
    expect(monthLabels(container)).toEqual(["January 2024", "March 2024"]);
  });

  it("seeds right on left + 1 when both bounds share a month", () => {
    const same: TimeRange = {
      mode: "absolute",
      from: new Date(2024, 4, 1, 10, 0).getTime(),
      to: new Date(2024, 4, 20, 11, 0).getTime()
    };
    const { container } = render(<TimeRangePicker value={same} locale="en-US" />);
    openPanel(container);
    expect(monthLabels(container)).toEqual(["May 2024", "June 2024"]);
  });

  it("pushing left past right nudges right to left + 1 (the reported overlap)", () => {
    const { container } = render(<TimeRangePicker value={SPAN} locale="en-US" />);
    openPanel(container);
    fireEvent.click(navButton(container, 0, "next"));
    fireEvent.click(navButton(container, 0, "next"));
    expect(monthLabels(container)).toEqual(["March 2024", "April 2024"]);
  });

  it("pushing right back to left nudges left to right - 1", () => {
    const { container } = render(<TimeRangePicker value={SPAN} locale="en-US" />);
    openPanel(container);
    fireEvent.click(navButton(container, 1, "prev"));
    fireEvent.click(navButton(container, 1, "prev"));
    expect(monthLabels(container)).toEqual(["December 2023", "January 2024"]);
  });

  it("keeps right strictly after left through a click sequence", () => {
    const { container } = render(<TimeRangePicker value={SPAN} locale="en-US" />);
    openPanel(container);
    const moves: Array<[0 | 1, "prev" | "next"]> = [
      [0, "next"],
      [0, "next"],
      [1, "prev"],
      [1, "prev"],
      [1, "prev"],
      [0, "prev"]
    ];
    for (const [index, dir] of moves) {
      fireEvent.click(navButton(container, index, dir));
      const [l, r] = monthLabels(container);
      expect(monthTime(r), `${l} vs ${r}`).toBeGreaterThan(monthTime(l));
    }
  });

  it("leaves calendarMonths = 1 alone (single calendar)", () => {
    const { container } = render(<TimeRangePicker value={SPAN} locale="en-US" calendarMonths={1} />);
    openPanel(container);
    expect(container.querySelectorAll(".st-calendar")).toHaveLength(1);
    expect(monthLabels(container)).toEqual(["January 2024"]);
  });
});

describe("Calendar — range classes", () => {
  it("marks endpoints selected and strict interior days in-range", () => {
    const { container } = render(
      <Calendar range value={["2024-01-10", "2024-01-15"]} month="2024-01" />
    );
    const day = (iso: string) => container.querySelector(`[data-date="${iso}"]`) as HTMLElement;
    expect(day("2024-01-10").classList.contains("st-calendar__day--selected")).toBe(true);
    expect(day("2024-01-15").classList.contains("st-calendar__day--selected")).toBe(true);
    expect(day("2024-01-10").classList.contains("st-calendar__day--inRange")).toBe(false);
    expect(day("2024-01-12").classList.contains("st-calendar__day--inRange")).toBe(true);
    expect(day("2024-01-12").classList.contains("st-calendar__day--selected")).toBe(false);
    expect(day("2024-01-20").classList.contains("st-calendar__day--inRange")).toBe(false);
  });

  it("pins the range-background entry point with a primary-derived default", () => {
    expect(stylesCss).toContain("--st-component-calendar-rangeBackground");
    expect(stylesCss).toContain("color-mix");
  });
});

describe("TimeRangePicker — customHeader", () => {
  it("renders the header at the top of the Custom tab, above the calendars", () => {
    const { container, getByRole } = render(
      <TimeRangePicker
        locale="en-US"
        customHeader={
          <fieldset data-testid="trp-header">
            <legend>Date kind</legend>
            <label>
              <input type="radio" name="kind" value="doc" />
              Document
            </label>
          </fieldset>
        }
      />
    );
    openPanel(container);
    expect(container.querySelector(".st-timeRangePicker__customHeader")).toBeNull();
    fireEvent.click(getByRole("button", { name: "Custom" }));
    const slot = container.querySelector(".st-timeRangePicker__customHeader") as HTMLElement;
    expect(slot.querySelector('[data-testid="trp-header"]')).toBeTruthy();
    const calendars = container.querySelector(".st-timeRangePicker__calendars") as HTMLElement;
    expect(slot.compareDocumentPosition(calendars) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(slot.querySelector('input[name="kind"]')).toBeTruthy();
  });

  it("renders no header wrapper when not provided", () => {
    const { container, getByRole } = render(<TimeRangePicker locale="en-US" />);
    openPanel(container);
    fireEvent.click(getByRole("button", { name: "Custom" }));
    expect(container.querySelector(".st-timeRangePicker__customHeader")).toBeNull();
  });
});

describe("ContentSwitcher — selected state", () => {
  it("marks exactly the active option selected (catalog contract used by TimeRangePicker)", () => {
    const { container } = render(
      <CatalogContentSwitcher
        items={[
          { value: "relative", label: "Relative" },
          { value: "absolute", label: "Custom" }
        ]}
        value="absolute"
      />
    );
    const options = Array.from(container.querySelectorAll(".st-contentSwitcher__option"));
    expect(options).toHaveLength(2);
    expect(options[0].classList.contains("st-contentSwitcher__option--selected")).toBe(false);
    expect(options[1].classList.contains("st-contentSwitcher__option--selected")).toBe(true);
  });

  it("TimeRangePicker opens on the Custom tab selected for an absolute value", () => {
    const { container } = render(<TimeRangePicker value={SPAN} locale="en-US" />);
    openPanel(container);
    const selected = container.querySelectorAll(".st-contentSwitcher__option--selected");
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toBe("Custom");
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
    const view = render(
      <MenuPopover open label="Menu" trigger={trigger} placement="bottom-start">
        <button type="button">Item</button>
      </MenuPopover>
    );
    return { view, trigger };
  }

  it("uses viewport coordinates (no document scroll offsets) and no popover attribute without the API", () => {
    Object.defineProperty(window, "scrollX", { configurable: true, value: 50 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 100 });
    const { view, trigger } = openWithTrigger();
    try {
      const panel = view.container.querySelector(".st-menuPopover") as HTMLElement;
      expect(panel.style.top).toBe("84px");
      expect(panel.style.left).toBe("10px");
      expect("showPopover" in panel).toBe(false);
      expect(panel.hasAttribute("popover")).toBe(false);
    } finally {
      Object.defineProperty(window, "scrollX", { configurable: true, value: 0 });
      Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
      trigger.remove();
      view.unmount();
    }
  });

  it("lifts into the top layer (popover=manual + showPopover) where the API exists", () => {
    const showPopover = vi.fn();
    const hidePopover = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "showPopover", { configurable: true, value: showPopover });
    Object.defineProperty(HTMLElement.prototype, "hidePopover", { configurable: true, value: hidePopover });
    const { view, trigger } = openWithTrigger();
    try {
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

  it("flips to the side with room when the requested side does not fit", () => {
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
    const view = render(<MenuPopover open label="Menu" trigger={trigger} placement="bottom-start" />);
    try {
      const panel = view.container.querySelector(".st-menuPopover") as HTMLElement;
      expect(panel.classList.contains("st-menuPopover--top-start")).toBe(true);
      expect(panel.style.top).toBe("496px");
    } finally {
      trigger.remove();
      view.unmount();
    }
  });

  it("repositions on resize", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    const rect = {
      top: 40,
      bottom: 80,
      left: 10,
      right: 110,
      width: 100,
      height: 40,
      x: 10,
      y: 40,
      toJSON: () => ({})
    };
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(rect as DOMRect);
    const view = render(<MenuPopover open label="Menu" trigger={trigger} placement="bottom-start" />);
    try {
      const panel = view.container.querySelector(".st-menuPopover") as HTMLElement;
      expect(panel.style.top).toBe("84px");
      rect.top = 100;
      rect.bottom = 140;
      fireEvent(window, new Event("resize"));
      expect(panel.style.top).toBe("144px");
    } finally {
      trigger.remove();
      view.unmount();
    }
  });
});

describe("TimeRangePicker — onApply / onCancel draft events", () => {
  it("fires onApply with the value on Apply, without onCancel", () => {
    const onChange = vi.fn();
    const onApply = vi.fn();
    const onCancel = vi.fn();
    const { container, getByRole } = render(
      <TimeRangePicker value={SPAN} onChange={onChange} onApply={onApply} onCancel={onCancel} locale="en-US" />
    );
    openPanel(container);
    fireEvent.click(getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0]).toEqual({ mode: "absolute", from: SPAN.from, to: SPAN.to });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("fires onCancel on Cancel, Escape, outside click and trigger re-click — never on mount", () => {
    const onCancel = vi.fn();
    const onChange = vi.fn();
    const { container, getByRole } = render(
      <TimeRangePicker value={SPAN} onCancel={onCancel} onChange={onChange} locale="en-US" />
    );
    expect(onCancel).not.toHaveBeenCalled();

    openPanel(container);
    fireEvent.click(getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();

    openPanel(container);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(2);

    openPanel(container);
    fireEvent.pointerDown(document.body);
    expect(onCancel).toHaveBeenCalledTimes(3);

    openPanel(container);
    fireEvent.click(container.querySelector(".st-timeRangePicker__trigger") as HTMLElement);
    expect(onCancel).toHaveBeenCalledTimes(4);
  });

  it("does not fire onCancel on preset selection", () => {
    const onCancel = vi.fn();
    const relative: TimeRange = {
      mode: "relative",
      relative: "30m",
      from: Date.now() - 1_800_000,
      to: Date.now()
    };
    const { container } = render(<TimeRangePicker value={relative} onCancel={onCancel} locale="en-US" />);
    openPanel(container);
    fireEvent.click(container.querySelector('[data-value="6h"]') as HTMLElement);
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe("RadioGroup — legend entry point", () => {
  it("declares the tunable legend font size with the current rendering as default", () => {
    expect(stylesCss).toContain("--st-component-selection-legendFontSize, 0.9375rem");
  });

  it("renders the legend unchanged by default", () => {
    const { container } = render(<RadioGroup legend="Date basis" name="basis" options={[]} />);
    expect(container.querySelector(".st-radioGroup__legend")?.textContent).toBe("Date basis");
  });
});
