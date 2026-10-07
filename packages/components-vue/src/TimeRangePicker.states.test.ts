import { mount } from "@vue/test-utils";
import type { VueWrapper } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TimeRangePicker, Calendar, ContentSwitcher, MenuPopover, RadioGroup } from "./index.js";
import type { TimeRange } from "./index.js";

// Pin the shared stylesheet entry points as text.
const stylesCss = readFileSync(resolve("src/styles.css"), "utf8");

const mounted: VueWrapper[] = [];
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
  document.body.innerHTML = "";
});

function track(wrapper: VueWrapper): VueWrapper {
  mounted.push(wrapper);
  return wrapper;
}

function mountPicker(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}): VueWrapper {
  return track(mount(TimeRangePicker, { props, slots, attachTo: document.body }));
}

async function openPanel(wrapper: VueWrapper): Promise<void> {
  await wrapper.find(".st-timeRangePicker__trigger").trigger("click");
}

async function clickTab(wrapper: VueWrapper, text: string): Promise<void> {
  const btn = wrapper.findAll(".st-contentSwitcher button").find((w) => w.text() === text);
  if (!btn) throw new Error(`tab not found: ${text}`);
  await btn.trigger("click");
}

function monthLabels(el: HTMLElement): string[] {
  return Array.from(el.querySelectorAll(".st-calendar__monthLabel")).map(
    (n) => n.textContent?.trim() ?? ""
  );
}
function monthTime(label: string): number {
  return new Date(`${label} 01`).getTime();
}
async function clickNav(wrapper: VueWrapper, index: 0 | 1, dir: "prev" | "next"): Promise<void> {
  const el = wrapper.element as HTMLElement;
  const calendars = el.querySelectorAll(".st-calendar");
  const buttons = calendars[index].querySelectorAll(".st-calendar__navBtn");
  const btn = (dir === "prev" ? buttons[0] : buttons[1]) as HTMLElement;
  btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await wrapper.vm.$nextTick();
}

const SPAN: TimeRange = {
  mode: "absolute",
  from: new Date(2024, 0, 15, 10, 0).getTime(),
  to: new Date(2024, 2, 10, 11, 30).getTime()
};

describe("Calendar — onMonthChange (monthChange emit)", () => {
  it("emits month-change with the new YYYY-MM on prev/next navigation", async () => {
    const onMonthChange = vi.fn();
    const wrapper = track(
      mount(Calendar, { props: { month: "2024-01", onMonthChange }, attachTo: document.body })
    );
    const el = wrapper.element as HTMLElement;
    (el.querySelectorAll(".st-calendar__navBtn")[1] as HTMLElement).dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
    await wrapper.vm.$nextTick();
    expect(onMonthChange).toHaveBeenLastCalledWith("2024-02");
    const prev = el.querySelectorAll(".st-calendar__navBtn")[0] as HTMLElement;
    prev.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    prev.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(onMonthChange).toHaveBeenLastCalledWith("2023-12");
    expect(onMonthChange).toHaveBeenCalledTimes(3);
  });

  it("does not emit when the parent drives the month prop (no loop)", async () => {
    const onMonthChange = vi.fn();
    const wrapper = track(
      mount(Calendar, { props: { month: "2024-01", onMonthChange }, attachTo: document.body })
    );
    await wrapper.setProps({ month: "2024-06" });
    expect(onMonthChange).not.toHaveBeenCalled();
    expect(wrapper.find(".st-calendar__monthLabel").text()).toMatch(/2024/);
  });
});

describe("TimeRangePicker — month coupling", () => {
  it("seeds left on the start month and right on the end month when it is later", async () => {
    const wrapper = mountPicker({ value: SPAN, locale: "en-US" });
    await openPanel(wrapper);
    expect(monthLabels(wrapper.element as HTMLElement)).toEqual(["January 2024", "March 2024"]);
  });

  it("seeds right on left + 1 when both bounds share a month", async () => {
    const same: TimeRange = {
      mode: "absolute",
      from: new Date(2024, 4, 1, 10, 0).getTime(),
      to: new Date(2024, 4, 20, 11, 0).getTime()
    };
    const wrapper = mountPicker({ value: same, locale: "en-US" });
    await openPanel(wrapper);
    expect(monthLabels(wrapper.element as HTMLElement)).toEqual(["May 2024", "June 2024"]);
  });

  it("pushing left past right nudges right to left + 1 (the reported overlap)", async () => {
    const wrapper = mountPicker({ value: SPAN, locale: "en-US" });
    await openPanel(wrapper);
    await clickNav(wrapper, 0, "next");
    await clickNav(wrapper, 0, "next");
    expect(monthLabels(wrapper.element as HTMLElement)).toEqual(["March 2024", "April 2024"]);
  });

  it("pushing right back to left nudges left to right - 1", async () => {
    const wrapper = mountPicker({ value: SPAN, locale: "en-US" });
    await openPanel(wrapper);
    await clickNav(wrapper, 1, "prev");
    await clickNav(wrapper, 1, "prev");
    expect(monthLabels(wrapper.element as HTMLElement)).toEqual(["December 2023", "January 2024"]);
  });

  it("keeps right strictly after left through a click sequence", async () => {
    const wrapper = mountPicker({ value: SPAN, locale: "en-US" });
    await openPanel(wrapper);
    const moves: Array<[0 | 1, "prev" | "next"]> = [
      [0, "next"],
      [0, "next"],
      [1, "prev"],
      [1, "prev"],
      [1, "prev"],
      [0, "prev"]
    ];
    for (const [index, dir] of moves) {
      await clickNav(wrapper, index, dir);
      const [l, r] = monthLabels(wrapper.element as HTMLElement);
      expect(monthTime(r), `${l} vs ${r}`).toBeGreaterThan(monthTime(l));
    }
  });

  it("leaves calendarMonths = 1 alone (single calendar)", async () => {
    const wrapper = mountPicker({ value: SPAN, locale: "en-US", calendarMonths: 1 });
    await openPanel(wrapper);
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-calendar")).toHaveLength(1);
    expect(monthLabels(el)).toEqual(["January 2024"]);
  });

});

describe("Calendar — range classes", () => {
  it("marks endpoints selected and strict interior days in-range", async () => {
    const wrapper = track(
      mount(Calendar, {
        props: { range: true, value: ["2024-01-10", "2024-01-15"], month: "2024-01" },
        attachTo: document.body
      })
    );
    const el = wrapper.element as HTMLElement;
    const day = (iso: string) => el.querySelector(`[data-date="${iso}"]`) as HTMLElement;
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

describe("TimeRangePicker — custom-header slot", () => {
  const header = () =>
    h("fieldset", { "data-testid": "trp-header" }, [
      h("legend", "Date kind"),
      h("label", ["Document", h("input", { type: "radio", name: "kind", value: "doc" })])
    ]);

  it("renders the header at the top of the Custom tab, above the calendars", async () => {
    const wrapper = mountPicker({ locale: "en-US" }, { "custom-header": header });
    await openPanel(wrapper);
    expect(document.querySelector(".st-timeRangePicker__customHeader")).toBeNull();
    await clickTab(wrapper, "Custom");
    const slot = document.querySelector(".st-timeRangePicker__customHeader") as HTMLElement;
    expect(slot.querySelector('[data-testid="trp-header"]')).toBeTruthy();
    const calendars = document.querySelector(".st-timeRangePicker__calendars") as HTMLElement;
    expect(slot.compareDocumentPosition(calendars) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(slot.querySelector('input[name="kind"]')).toBeTruthy();
  });

  it("renders no header wrapper when the slot is not provided", async () => {
    const wrapper = mountPicker({ locale: "en-US" });
    await openPanel(wrapper);
    await clickTab(wrapper, "Custom");
    expect(document.querySelector(".st-timeRangePicker__customHeader")).toBeNull();
  });
});

describe("ContentSwitcher — selected state", () => {
  it("marks exactly the active option selected", () => {
    const wrapper = track(
      mount(ContentSwitcher, {
        props: {
          items: [
            { value: "relative", label: "Relative" },
            { value: "absolute", label: "Custom" }
          ],
          value: "absolute"
        },
        attachTo: document.body
      })
    );
    const options = Array.from(
      (wrapper.element as HTMLElement).querySelectorAll(".st-contentSwitcher__option")
    );
    expect(options).toHaveLength(2);
    expect(options[0].classList.contains("st-contentSwitcher__option--selected")).toBe(false);
    expect(options[1].classList.contains("st-contentSwitcher__option--selected")).toBe(true);
  });
});

describe("MenuPopover — viewport positioning + top layer", () => {
  function makeTrigger(rect: Record<string, number>): HTMLElement {
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
      toJSON: () => ({}),
      ...rect
    } as DOMRect);
    return trigger;
  }

  it("uses viewport coordinates (no document scroll offsets) and no popover attribute without the API", async () => {
    const trigger = makeTrigger({});
    const wrapper = track(
      mount(MenuPopover, {
        props: { open: true, trigger, label: "Menu", placement: "bottom-start" },
        attachTo: document.body
      })
    );
    await wrapper.vm.$nextTick();
    const panel = document.querySelector(".st-menuPopover") as HTMLElement;
    expect(panel.style.top).toBe("84px");
    expect(panel.style.left).toBe("10px");
    expect("showPopover" in panel).toBe(false);
    expect(panel.hasAttribute("popover")).toBe(false);
  });

  it("lifts into the top layer (popover=manual + showPopover) where the API exists", async () => {
    const showPopover = vi.fn();
    const hidePopover = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "showPopover", { configurable: true, value: showPopover });
    Object.defineProperty(HTMLElement.prototype, "hidePopover", { configurable: true, value: hidePopover });
    const trigger = makeTrigger({});
    const wrapper = track(
      mount(MenuPopover, {
        props: { open: true, trigger, label: "Menu", placement: "bottom-start" },
        attachTo: document.body
      })
    );
    try {
      await wrapper.vm.$nextTick();
      const panel = document.querySelector(".st-menuPopover") as HTMLElement;
      expect(showPopover).toHaveBeenCalledTimes(1);
      expect(panel.getAttribute("popover")).toBe("manual");
      await wrapper.setProps({ open: false });
      expect(hidePopover).toHaveBeenCalled();
    } finally {
      // @ts-expect-error cleanup of the test-only API mock
      delete HTMLElement.prototype.showPopover;
      // @ts-expect-error cleanup of the test-only API mock
      delete HTMLElement.prototype.hidePopover;
    }
  });

  it("flips to the side with room when the requested side does not fit", async () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 600 });
    const trigger = makeTrigger({ top: 500, bottom: 540, y: 500 });
    const wrapper = track(
      mount(MenuPopover, {
        props: { open: true, trigger, label: "Menu", placement: "bottom-start" },
        attachTo: document.body
      })
    );
    try {
      await wrapper.vm.$nextTick();
      const panel = document.querySelector(".st-menuPopover") as HTMLElement;
      expect(panel.classList.contains("st-menuPopover--top-start")).toBe(true);
      expect(panel.style.top).toBe("496px");
    } finally {
      Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });
    }
  });
});

describe("TimeRangePicker — apply / cancel draft events", () => {
  function actionButton(wrapper: VueWrapper, text: string) {
    const btn = wrapper.findAll(".st-timeRangePicker__actions button").find((w) => w.text() === text);
    if (!btn) throw new Error(`button not found: ${text}`);
    return btn;
  }

  it("emits apply with the value on Apply, without cancel", async () => {
    const onApply = vi.fn();
    const onCancel = vi.fn();
    const onChange = vi.fn();
    const wrapper = mountPicker(
      { value: SPAN, onApply, onCancel, onChange, locale: "en-US" },
      {}
    );
    await openPanel(wrapper);
    await actionButton(wrapper, "Apply").trigger("click");
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0]).toEqual({ mode: "absolute", from: SPAN.from, to: SPAN.to });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("emits cancel on Cancel, Escape, outside click and trigger re-click — never on mount", async () => {
    const onCancel = vi.fn();
    const onChange = vi.fn();
    const wrapper = mountPicker({ value: SPAN, onCancel, onChange, locale: "en-US" });
    await wrapper.vm.$nextTick();
    expect(onCancel).not.toHaveBeenCalled();

    await openPanel(wrapper);
    await actionButton(wrapper, "Cancel").trigger("click");
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();

    await openPanel(wrapper);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await wrapper.vm.$nextTick();
    expect(onCancel).toHaveBeenCalledTimes(2);

    await openPanel(wrapper);
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(onCancel).toHaveBeenCalledTimes(3);

    await openPanel(wrapper);
    await wrapper.find(".st-timeRangePicker__trigger").trigger("click");
    await wrapper.vm.$nextTick();
    expect(onCancel).toHaveBeenCalledTimes(4);
  });

  it("does not emit cancel on preset selection", async () => {
    const onCancel = vi.fn();
    const relative: TimeRange = {
      mode: "relative",
      relative: "30m",
      from: Date.now() - 1_800_000,
      to: Date.now()
    };
    const wrapper = mountPicker({ value: relative, onCancel, locale: "en-US" });
    await openPanel(wrapper);
    const row = document.querySelector('[data-value="6h"]') as HTMLElement;
    row.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe("RadioGroup — legend entry point", () => {
  it("declares the tunable legend font size with the current rendering as default", () => {
    expect(stylesCss).toContain("--st-component-selection-legendFontSize, 0.9375rem");
  });

  it("renders the legend unchanged by default", () => {
    const wrapper = track(
      mount(RadioGroup, {
        props: { legend: "Date basis", name: "basis", options: [] },
        attachTo: document.body
      })
    );
    expect((wrapper.element as HTMLElement).querySelector(".st-radioGroup__legend")?.textContent).toBe(
      "Date basis"
    );
  });
});
