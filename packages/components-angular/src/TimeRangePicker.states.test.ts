import "@angular/compiler";
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { Calendar } from "../dist/Calendar.js";
import { ContentSwitcher } from "../dist/ContentSwitcher.js";
import { TimeRangePicker } from "../dist/TimeRangePicker.js";
import { computeMenuPopoverPosition } from "../dist/MenuPopover.js";
import type { TimeRange } from "../dist/timeRange.js";

const SPAN_FROM = new Date(2024, 0, 15, 10, 0).getTime();
const SPAN_TO = new Date(2024, 2, 10, 11, 30).getTime();
const SPAN: TimeRange = { mode: "absolute", from: SPAN_FROM, to: SPAN_TO };

describe("Calendar — monthChange output (angular)", () => {
  it("emits the new YYYY-MM on prev/next navigation, via output and callback", () => {
    const c = new Calendar();
    c.month = "2024-01";
    c.ngOnInit();
    const seen: string[] = [];
    const cb = vi.fn();
    c.monthChange.subscribe((m: string) => seen.push(m));
    c.onMonthChange = cb;
    c.nextMonth();
    expect(seen).toEqual(["2024-02"]);
    expect(cb).toHaveBeenLastCalledWith("2024-02");
    c.previousMonth();
    c.previousMonth();
    expect(seen).toEqual(["2024-02", "2024-01", "2023-12"]);
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it("does not emit when the parent drives the month input (no loop)", () => {
    const c = new Calendar();
    c.month = "2024-01";
    c.ngOnInit();
    const seen: string[] = [];
    c.monthChange.subscribe((m: string) => seen.push(m));
    c.month = "2024-06";
    c.ngOnChanges();
    expect(seen).toEqual([]);
    expect(c.monthLabel).toMatch(/2024/);
  });
});

describe("TimeRangePicker — month coupling (angular)", () => {
  it("seeds left on the start month and right on the end month when it is later", () => {
    const c = new TimeRangePicker();
    c.value = SPAN;
    c.openPanel();
    expect(c.leftMonth).toBe("2024-01");
    expect(c.rightMonth).toBe("2024-03");
  });

  it("seeds right on left + 1 when both bounds share a month", () => {
    const c = new TimeRangePicker();
    c.value = {
      mode: "absolute",
      from: new Date(2024, 4, 1, 10, 0).getTime(),
      to: new Date(2024, 4, 20, 11, 0).getTime()
    };
    c.openPanel();
    expect(c.leftMonth).toBe("2024-05");
    expect(c.rightMonth).toBe("2024-06");
  });

  it("pushing left past right nudges right to left + 1", () => {
    const c = new TimeRangePicker();
    c.value = SPAN;
    c.openPanel();
    c.onLeftMonthChange("2024-02");
    expect(c.rightMonth).toBe("2024-03");
    c.onLeftMonthChange("2024-03");
    expect(c.leftMonth).toBe("2024-03");
    expect(c.rightMonth).toBe("2024-04");
  });

  it("pushing right back to left nudges left to right - 1", () => {
    const c = new TimeRangePicker();
    c.value = SPAN;
    c.openPanel();
    c.onRightMonthChange("2024-02");
    expect(c.leftMonth).toBe("2024-01");
    c.onRightMonthChange("2024-01");
    expect(c.rightMonth).toBe("2024-01");
    expect(c.leftMonth).toBe("2023-12");
  });

  it("keeps right strictly after left through a handler sequence", () => {
    const c = new TimeRangePicker();
    c.value = SPAN;
    c.openPanel();
    const moves: Array<() => void> = [
      () => c.onLeftMonthChange("2024-02"),
      () => c.onLeftMonthChange("2024-03"),
      () => c.onRightMonthChange("2024-02"),
      () => c.onRightMonthChange("2024-01"),
      () => c.onRightMonthChange("2023-11"),
      () => c.onLeftMonthChange("2023-10")
    ];
    for (const move of moves) {
      move();
      expect(c.rightMonth > c.leftMonth, `${c.leftMonth} vs ${c.rightMonth}`).toBe(true);
    }
  });
});

describe("TimeRangePicker — onApply / onCancel draft events (angular)", () => {
  it("apply() calls onApply with the value and skips onCancel", () => {
    const c = new TimeRangePicker();
    c.value = SPAN;
    const applied: TimeRange[] = [];
    let cancelled = 0;
    const changed: TimeRange[] = [];
    c.onApply = (v) => void applied.push(v);
    c.onCancel = () => void (cancelled += 1);
    c.change.subscribe((v: TimeRange) => void changed.push(v));
    c.openPanel();
    c.apply();
    expect(applied).toEqual([{ mode: "absolute", from: SPAN_FROM, to: SPAN_TO }]);
    expect(changed).toHaveLength(1);
    expect(cancelled).toBe(0);
    expect(c.open).toBe(false);
  });

  it("cancel() calls onCancel and emits nothing", () => {
    const c = new TimeRangePicker();
    c.value = SPAN;
    let cancelled = 0;
    const changed: TimeRange[] = [];
    c.onCancel = () => void (cancelled += 1);
    c.change.subscribe((v: TimeRange) => void changed.push(v));
    c.openPanel();
    c.cancel();
    expect(cancelled).toBe(1);
    expect(changed).toEqual([]);
  });

  it("selectPreset() commits without onCancel; toggle-close and Escape/outside call onCancel", () => {
    const c = new TimeRangePicker();
    let cancelled = 0;
    c.onCancel = () => void (cancelled += 1);

    c.openPanel();
    c.selectPreset("1h");
    expect(cancelled).toBe(0);

    c.openPanel();
    c.toggle();
    expect(cancelled).toBe(1);

    c.openPanel();
    c.onDocumentKeyDown({ key: "Escape", preventDefault: () => {} } as KeyboardEvent);
    expect(cancelled).toBe(2);

    c.openPanel();
    c.onDocumentPointerDown({ target: {} } as unknown as PointerEvent);
    expect(cancelled).toBe(3);
  });
});

describe("ContentSwitcher — selected state (angular)", () => {
  it("marks exactly the active option selected", () => {
    const s = new ContentSwitcher();
    s.items = [
      { value: "relative", label: "Relative" },
      { value: "absolute", label: "Custom" }
    ];
    s.value = "absolute";
    expect(s.isActive(s.items[0], 0)).toBe(false);
    expect(s.isActive(s.items[1], 1)).toBe(true);
    expect(s.buttonClass(s.items[1], 1)).toContain("st-contentSwitcher__option--selected");
    expect(s.buttonClass(s.items[0], 0)).not.toContain("st-contentSwitcher__option--selected");
  });
});

describe("shared stylesheet entry points (angular)", () => {
  const css = readFileSync(resolve("src/styles.css"), "utf8");

  it("pins the range-background entry point with a primary-derived default", () => {
    expect(css).toContain("--st-component-calendar-rangeBackground");
    expect(css).toContain("color-mix");
  });

  it("pins the legend font-size entry point with the current rendering as default", () => {
    expect(css).toContain("--st-component-selection-legendFontSize, 0.9375rem");
  });

  it("pins the selected indicator ring and the fixed popover", () => {
    expect(css).toContain("inset 0 0 0 1px var(--st-semantic-border-interactive)");
    expect(css).toMatch(/\.st-menuPopover \{[^}]*position: fixed/);
  });

  it("positions the pure solver on viewport coordinates", () => {
    const pos = computeMenuPopoverPosition(
      { top: 40, bottom: 200, left: 10, right: 10, width: 0 },
      "bottom-start",
      undefined,
      { width: 1024, height: 600 }
    );
    expect(pos.top).toBe(204);
    expect(pos.left).toBe(10);
  });
});
