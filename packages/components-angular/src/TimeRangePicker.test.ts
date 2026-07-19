import "@angular/compiler";
import { describe, expect, it } from "vitest";

import { TimeRangePicker } from "../dist/TimeRangePicker.js";
import {
  DEFAULT_TIME_RANGE_PRESETS,
  composeAbsolute,
  formatPresetLabel,
  formatTriggerLabel,
  parsePresetMs,
  resolveRelative,
  splitAbsolute,
} from "../dist/timeRange.js";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("timeRange helpers (angular)", () => {
  it("parses the token grammar", () => {
    expect(parsePresetMs("30m")).toBe(30 * MINUTE);
    expect(parsePresetMs("1h")).toBe(HOUR);
    expect(parsePresetMs("7d")).toBe(7 * DAY);
    expect(parsePresetMs("2w")).toBe(14 * DAY);
  });

  it("rejects malformed tokens", () => {
    expect(parsePresetMs("banana")).toBeNull();
    expect(parsePresetMs("30")).toBeNull();
    expect(parsePresetMs("")).toBeNull();
  });

  it("resolves a relative token to a concrete window", () => {
    const now = 1_700_000_000_000;
    const { from, to } = resolveRelative("1h", now);
    expect(to).toBe(now);
    expect(from).toBe(now - HOUR);
  });

  it("clamps a resolved window to min/max", () => {
    const now = 1_700_000_000_000;
    const min = now - 30 * MINUTE;
    const { from, to } = resolveRelative("24h", now, { min, max: now });
    expect(from).toBe(min);
    expect(to).toBe(now);
  });

  it("round-trips split/compose in local time", () => {
    const from = new Date(2026, 7, 1, 8, 0).getTime();
    const to = new Date(2026, 7, 1, 12, 0).getTime();
    const draft = splitAbsolute(from, to);
    expect(draft.fromTime).toBe("08:00");
    expect(draft.toTime).toBe("12:00");
    expect(composeAbsolute(draft)).toEqual({ from, to });
  });

  it("refuses an inverted or incomplete draft", () => {
    expect(
      composeAbsolute({ fromDate: "2026-08-02", fromTime: "10:00", toDate: "2026-08-01", toTime: "09:00" }),
    ).toBeNull();
    expect(
      composeAbsolute({ fromDate: null, fromTime: "10:00", toDate: "2026-08-01", toTime: "12:00" }),
    ).toBeNull();
  });

  it("labels presets and ranges per locale", () => {
    expect(formatPresetLabel("30m", "en-US")).toMatch(/30/);
    expect(formatPresetLabel("30m", "fr-FR")).toMatch(/30/);
    expect(
      formatTriggerLabel({ mode: "relative", relative: "1h", from: 0, to: HOUR }, "en-US"),
    ).toMatch(/./);
  });
});

describe("TimeRangePicker (angular)", () => {
  it("defaults to the 30m relative window", () => {
    const c = new TimeRangePicker();
    const v = c.currentValue;
    expect(v.mode).toBe("relative");
    expect(v.relative).toBe("30m");
    expect(v.to - v.from).toBe(30 * MINUTE);
  });

  it("honours a controlled value over internal state", () => {
    const c = new TimeRangePicker();
    c.value = { mode: "absolute", from: 1000, to: 2000 };
    expect(c.currentValue).toEqual({ mode: "absolute", from: 1000, to: 2000 });
  });

  it("seeds an uncontrolled component from defaultValue", () => {
    const c = new TimeRangePicker();
    c.defaultValue = { mode: "absolute", from: 500, to: 900 };
    expect(c.currentValue).toEqual({ mode: "absolute", from: 500, to: 900 });
  });

  it("exposes the canonical preset list with labels", () => {
    const c = new TimeRangePicker();
    const tokens = c.resolvedPresets.map((p) => p.token);
    expect(tokens).toEqual(DEFAULT_TIME_RANGE_PRESETS);
    expect(c.resolvedPresets.every((p) => p.label.length > 0)).toBe(true);
  });

  it("disables a preset that would resolve below min", () => {
    const c = new TimeRangePicker();
    c.min = Date.now() - HOUR;
    const byToken = Object.fromEntries(c.resolvedPresets.map((p) => [p.token, p.disabled]));
    expect(byToken["30m"]).toBe(false);
    expect(byToken["30d"]).toBe(true);
  });

  it("emits a resolved relative range on preset selection and closes", () => {
    const c = new TimeRangePicker();
    const seen: unknown[] = [];
    c.valueChange.subscribe((v: unknown) => seen.push(v));
    c.openPanel();
    c.selectPreset("1h");

    expect(seen).toHaveLength(1);
    const v = seen[0] as { mode: string; relative?: string; from: number; to: number };
    expect(v.mode).toBe("relative");
    expect(v.relative).toBe("1h");
    expect(v.to - v.from).toBe(HOUR);
    expect(Math.abs(v.to - Date.now())).toBeLessThan(5000);
    expect(c.open).toBe(false);
  });

  it("opens the panel on the current mode and seeds the draft", () => {
    const c = new TimeRangePicker();
    const from = new Date(2026, 7, 1, 8, 0).getTime();
    const to = new Date(2026, 7, 1, 12, 0).getTime();
    c.value = { mode: "absolute", from, to };
    c.openPanel();

    expect(c.open).toBe(true);
    expect(c.activeTab).toBe("absolute");
    expect(c.draft.fromTime).toBe("08:00");
    expect(c.draft.toTime).toBe("12:00");
  });

  it("stages the custom tab: Apply emits absolute without a relative token", () => {
    const c = new TimeRangePicker();
    const seen: unknown[] = [];
    c.valueChange.subscribe((v: unknown) => seen.push(v));
    c.openPanel();
    c.onCalendarChange(["2026-08-01", "2026-08-02"]);
    c.onFromTimeChange("08:00");
    c.onToTimeChange("18:30");

    expect(c.canApply).toBe(true);
    c.apply();

    expect(seen).toHaveLength(1);
    const v = seen[0] as { mode: string; relative?: string; from: number; to: number };
    expect(v.mode).toBe("absolute");
    expect(v.relative).toBeUndefined();
    expect(v.from).toBeLessThanOrEqual(v.to);
    expect(c.open).toBe(false);
  });

  it("emits nothing on cancel", () => {
    const c = new TimeRangePicker();
    const seen: unknown[] = [];
    c.valueChange.subscribe((v: unknown) => seen.push(v));
    c.openPanel();
    c.onCalendarChange(["2026-08-01", "2026-08-02"]);
    c.cancel();

    expect(seen).toHaveLength(0);
    expect(c.open).toBe(false);
  });

  it("blocks Apply on an inverted or incomplete draft", () => {
    const c = new TimeRangePicker();
    c.openPanel();

    c.onCalendarChange([null, null]);
    expect(c.canApply).toBe(false);
    expect(c.errorText).not.toBeNull();

    c.onCalendarChange(["2026-08-05", "2026-08-01"]);
    expect(c.canApply).toBe(false);

    const seen: unknown[] = [];
    c.valueChange.subscribe((v: unknown) => seen.push(v));
    c.apply();
    expect(seen).toHaveLength(0);
  });

  it("clamps an applied absolute range to min/max", () => {
    const c = new TimeRangePicker();
    const min = new Date(2026, 7, 1, 10, 0).getTime();
    const max = new Date(2026, 7, 1, 16, 0).getTime();
    c.min = min;
    c.max = max;
    c.openPanel();
    c.onCalendarChange(["2026-08-01", "2026-08-01"]);
    c.onFromTimeChange("08:00");
    c.onToTimeChange("23:00");

    const seen: Array<{ from: number; to: number }> = [];
    c.valueChange.subscribe((v: { from: number; to: number }) => seen.push(v));
    c.apply();

    expect(seen[0]!.from).toBe(min);
    expect(seen[0]!.to).toBe(max);
  });

  it("does not mutate internal state when controlled", () => {
    const c = new TimeRangePicker();
    c.value = { mode: "absolute", from: 1000, to: 2000 };
    c.selectPreset("1h");
    expect(c.currentValue).toEqual({ mode: "absolute", from: 1000, to: 2000 });
  });

  it("composes the canonical host class with a consumer class", () => {
    const c = new TimeRangePicker();
    c.classInput = "app-range";
    expect(c.hostClass).toContain("st-timeRangePicker");
    expect(c.hostClass).toContain("app-range");
  });

  it("is inert while disabled", () => {
    const c = new TimeRangePicker();
    c.disabled = true;
    c.toggle();
    expect(c.open).toBe(false);
  });
});
