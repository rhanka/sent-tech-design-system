import { fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import TimeRangePicker from "./TimeRangePicker.svelte";
import type { TimeRange } from "./TimeRangePicker.svelte";
import {
  DEFAULT_TIME_RANGE_PRESETS,
  composeAbsolute,
  formatPresetLabel,
  formatTriggerLabel,
  parsePresetMs,
  resolveRelative,
  splitAbsolute
} from "./timeRange";

// ---------------------------------------------------------------------------
// timeRange.ts — pure helpers
// ---------------------------------------------------------------------------

describe("parsePresetMs", () => {
  it("parses each unit in the locked grammar", () => {
    expect(parsePresetMs("30m")).toBe(30 * 60_000);
    expect(parsePresetMs("1h")).toBe(3_600_000);
    expect(parsePresetMs("24h")).toBe(24 * 3_600_000);
    expect(parsePresetMs("7d")).toBe(7 * 86_400_000);
    expect(parsePresetMs("2w")).toBe(2 * 604_800_000);
  });

  it("returns null for tokens outside ^(\\d+)(m|h|d|w)$", () => {
    expect(parsePresetMs("abc")).toBeNull();
    expect(parsePresetMs("10x")).toBeNull();
    expect(parsePresetMs("10")).toBeNull();
    expect(parsePresetMs("m10")).toBeNull();
    expect(parsePresetMs("")).toBeNull();
    expect(parsePresetMs("-10m")).toBeNull();
  });

  it("accepts a zero-amount token (degenerate but grammatically valid)", () => {
    expect(parsePresetMs("0m")).toBe(0);
  });
});

describe("resolveRelative", () => {
  it("resolves to [now - duration, now] and reports the relative token", () => {
    const now = 1_700_000_000_000;
    const resolved = resolveRelative("1h", now);
    expect(resolved).toEqual({ mode: "relative", relative: "1h", from: now - 3_600_000, to: now });
  });

  it("returns null for an ungrammatical token", () => {
    expect(resolveRelative("bogus", Date.now())).toBeNull();
  });

  it("clamps `to` down to max without disabling when `from` still fits", () => {
    const now = 1_700_000_000_000;
    const max = now - 1_000;
    const resolved = resolveRelative("24h", now, { max });
    expect(resolved).not.toBeNull();
    expect(resolved?.to).toBe(max);
    expect(resolved?.from).toBe(now - 24 * 3_600_000);
  });

  it("clamps `from` up to min without disabling when `to` still fits", () => {
    const now = 1_700_000_000_000;
    const min = now - 10 * 60_000;
    const resolved = resolveRelative("30m", now, { min });
    expect(resolved).not.toBeNull();
    expect(resolved?.from).toBe(min);
    expect(resolved?.to).toBe(now);
  });

  it("returns null (disables) when the clamped window collapses (from > to)", () => {
    const now = 1_700_000_000_000;
    // max caps `to` two days back; the 30-minute window's unclamped `from` is
    // far more recent than that -> from > to after clamping.
    const max = now - 2 * 86_400_000;
    expect(resolveRelative("30m", now, { max })).toBeNull();
  });
});

describe("splitAbsolute", () => {
  it("splits epoch ms into local YYYY-MM-DD / HH:mm parts", () => {
    const from = new Date(2024, 0, 15, 9, 5).getTime();
    const to = new Date(2024, 0, 16, 23, 45).getTime();
    expect(splitAbsolute(from, to)).toEqual({
      fromDate: "2024-01-15",
      fromTime: "09:05",
      toDate: "2024-01-16",
      toTime: "23:45"
    });
  });
});

describe("composeAbsolute", () => {
  it("composes a complete, ordered draft into {from,to}", () => {
    const composed = composeAbsolute({
      fromDate: "2024-01-01",
      fromTime: "10:00",
      toDate: "2024-01-02",
      toTime: "11:30"
    });
    expect(composed).toEqual({
      from: new Date(2024, 0, 1, 10, 0).getTime(),
      to: new Date(2024, 0, 2, 11, 30).getTime()
    });
  });

  it("returns null when any part is missing", () => {
    expect(composeAbsolute({ fromDate: "2024-01-01", fromTime: "10:00", toDate: "2024-01-02" })).toBeNull();
    expect(composeAbsolute({})).toBeNull();
  });

  it("returns null when from is after to", () => {
    const composed = composeAbsolute({
      fromDate: "2024-01-05",
      fromTime: "10:00",
      toDate: "2024-01-01",
      toTime: "10:00"
    });
    expect(composed).toBeNull();
  });

  it("returns null on malformed date/time parts", () => {
    expect(
      composeAbsolute({ fromDate: "2024/01/01", fromTime: "10:00", toDate: "2024-01-02", toTime: "10:00" })
    ).toBeNull();
    expect(
      composeAbsolute({ fromDate: "2024-01-01", fromTime: "25:00", toDate: "2024-01-02", toTime: "10:00" })
    ).toBeNull();
  });

  it("accepts equal from/to (a zero-length range)", () => {
    const ts = new Date(2024, 0, 1, 10, 0).getTime();
    const composed = composeAbsolute({
      fromDate: "2024-01-01",
      fromTime: "10:00",
      toDate: "2024-01-01",
      toTime: "10:00"
    });
    expect(composed).toEqual({ from: ts, to: ts });
  });
});

describe("formatPresetLabel", () => {
  it("renders correct French singular/plural + gender agreement for every default preset", () => {
    expect(formatPresetLabel("30m", "fr-FR")).toBe("30 dernières minutes");
    expect(formatPresetLabel("1h", "fr-FR")).toBe("Dernière heure");
    expect(formatPresetLabel("3h", "fr-FR")).toBe("3 dernières heures");
    expect(formatPresetLabel("6h", "fr-FR")).toBe("6 dernières heures");
    expect(formatPresetLabel("12h", "fr-FR")).toBe("12 dernières heures");
    expect(formatPresetLabel("24h", "fr-FR")).toBe("24 dernières heures");
    expect(formatPresetLabel("3d", "fr-FR")).toBe("3 derniers jours");
    expect(formatPresetLabel("7d", "fr-FR")).toBe("7 derniers jours");
    expect(formatPresetLabel("30d", "fr-FR")).toBe("30 derniers jours");
  });

  it("renders English labels, singular phrased without a leading '1'", () => {
    expect(formatPresetLabel("30m", "en-US")).toBe("Last 30 minutes");
    expect(formatPresetLabel("1h", "en-US")).toBe("Last hour");
    expect(formatPresetLabel("7d", "en-US")).toBe("Last 7 days");
    expect(formatPresetLabel("2w", "en-US")).toBe("Last 2 weeks");
  });

  it("falls back to the raw token for a non-grammatical custom token", () => {
    expect(formatPresetLabel("custom-token", "fr-FR")).toBe("custom-token");
  });

  it("defaults to French when locale is omitted", () => {
    expect(formatPresetLabel("1h")).toBe("Dernière heure");
  });
});

describe("formatTriggerLabel", () => {
  it("delegates to formatPresetLabel for a relative value", () => {
    const value: TimeRange = { mode: "relative", relative: "3h", from: 0, to: 1 };
    expect(formatTriggerLabel(value, "fr-FR")).toBe(formatPresetLabel("3h", "fr-FR"));
  });

  it("collapses a same-day absolute range to one date + HH:mm–HH:mm", () => {
    const from = new Date(2024, 2, 10, 9, 0).getTime();
    const to = new Date(2024, 2, 10, 17, 30).getTime();
    const label = formatTriggerLabel({ mode: "absolute", from, to }, "fr-FR");
    expect(label).toBe("10/03/2024 09:00–17:30");
  });

  it("shows both full dates for a multi-day absolute range", () => {
    const from = new Date(2024, 2, 10, 9, 0).getTime();
    const to = new Date(2024, 2, 12, 17, 30).getTime();
    const label = formatTriggerLabel({ mode: "absolute", from, to }, "fr-FR");
    expect(label).toContain("10/03/2024");
    expect(label).toContain("12/03/2024");
    expect(label).not.toContain("–17:30");
  });
});

// ---------------------------------------------------------------------------
// TimeRangePicker.svelte — component behaviour
// ---------------------------------------------------------------------------

function triggerLabelText(container: HTMLElement): string {
  return container.querySelector(".st-timeRangePicker__triggerLabel")?.textContent?.trim() ?? "";
}

function triggerButton(container: HTMLElement): HTMLButtonElement {
  return container.querySelector(".st-timeRangePicker__trigger") as HTMLButtonElement;
}

async function openPanel(container: HTMLElement) {
  await fireEvent.click(triggerButton(container));
}

describe("TimeRangePicker — trigger label", () => {
  it("shows the French default relative label for the uncontrolled default (30m)", () => {
    const { container } = render(TimeRangePicker, { props: {} });
    expect(triggerLabelText(container)).toBe("30 dernières minutes");
  });

  it("shows an English relative label when locale='en-US'", () => {
    const value: TimeRange = { mode: "relative", relative: "3h", from: Date.now() - 10_800_000, to: Date.now() };
    const { container } = render(TimeRangePicker, { props: { value, locale: "en-US" } });
    expect(triggerLabelText(container)).toBe("Last 3 hours");
  });

  it("collapses an absolute same-day range on the trigger", () => {
    const from = new Date(2024, 2, 10, 9, 0).getTime();
    const to = new Date(2024, 2, 10, 17, 30).getTime();
    const { container } = render(TimeRangePicker, { props: { value: { mode: "absolute", from, to } } });
    expect(triggerLabelText(container)).toBe(formatTriggerLabel({ mode: "absolute", from, to }, "fr-FR"));
  });

  it("honours a custom formatRange override", () => {
    const { container } = render(TimeRangePicker, { props: { formatRange: () => "CUSTOM LABEL" } });
    expect(triggerLabelText(container)).toBe("CUSTOM LABEL");
  });
});

describe("TimeRangePicker — open/close mechanics", () => {
  it("opens a role=dialog panel on trigger click and reflects aria-expanded", async () => {
    const { container } = render(TimeRangePicker, { props: {} });
    const trigger = triggerButton(container);
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    await openPanel(container);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it("does not open when disabled", async () => {
    const { container } = render(TimeRangePicker, { props: { disabled: true } });
    const trigger = triggerButton(container);
    expect(trigger.disabled).toBe(true);
    await fireEvent.click(trigger);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("Escape closes the panel without emitting and returns focus to the trigger", async () => {
    const onChange = vi.fn();
    const { container } = render(TimeRangePicker, { props: { onChange } });
    const trigger = triggerButton(container);
    trigger.focus();
    await openPanel(container);
    await tick();
    await tick();
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    await fireEvent.keyDown(window, { key: "Escape" });
    await tick();
    await tick();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  });

  it("an outside pointerdown closes the panel without emitting", async () => {
    const onChange = vi.fn();
    const { container } = render(TimeRangePicker, { props: { onChange } });
    await openPanel(container);
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    await fireEvent.pointerDown(document.body);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves focus inside the dialog when it opens", async () => {
    const { container } = render(TimeRangePicker, { props: {} });
    const trigger = triggerButton(container);
    await openPanel(container);
    await tick();
    await tick();
    await tick();
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(trigger);
  });

  it("traps Tab navigation within the panel (Shift+Tab wraps last -> first)", async () => {
    const { container } = render(TimeRangePicker, { props: {} });
    await openPanel(container);
    await tick();
    await tick();
    await tick();
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
    expect(focusables.length).toBeGreaterThan(1);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first.focus();
    await fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});

describe("TimeRangePicker — relative presets", () => {
  it("clicking a preset resolves now, emits {mode:'relative',...}, and closes", async () => {
    const onChange = vi.fn();
    const { container } = render(TimeRangePicker, { props: { onChange } });
    await openPanel(container);
    const before = Date.now();
    const row = container.querySelector('[data-value="1h"]') as HTMLElement;
    await fireEvent.click(row);
    const after = Date.now();

    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0] as TimeRange;
    expect(emitted.mode).toBe("relative");
    expect(emitted.relative).toBe("1h");
    const tolerance = 25;
    expect(emitted.to).toBeGreaterThanOrEqual(before - tolerance);
    expect(emitted.to).toBeLessThanOrEqual(after + tolerance);
    expect(emitted.from).toBeGreaterThanOrEqual(before - 3_600_000 - tolerance);
    expect(emitted.from).toBeLessThanOrEqual(after - 3_600_000 + tolerance);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("re-clicking the already-active preset still refreshes now and closes", async () => {
    const onChange = vi.fn();
    const value: TimeRange = { mode: "relative", relative: "1h", from: Date.now() - 3_601_000, to: Date.now() - 1_000 };
    const { container } = render(TimeRangePicker, { props: { value, onChange } });
    await openPanel(container);
    const row = container.querySelector('[data-value="1h"]') as HTMLElement;
    expect(row.getAttribute("aria-selected")).toBe("true");
    await fireEvent.click(row);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as TimeRange).relative).toBe("1h");
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("does not emit or close when clicking a disabled preset", async () => {
    const onChange = vi.fn();
    const now = Date.now();
    const { container } = render(TimeRangePicker, {
      props: { presets: ["30m"], max: now - 2 * 86_400_000, onChange }
    });
    await openPanel(container);
    const row = container.querySelector('[data-value="30m"]') as HTMLElement;
    expect(row.getAttribute("aria-disabled")).toBe("true");
    await fireEvent.click(row);
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it("accepts object-form presets with an explicit label and durationMs override", async () => {
    const onChange = vi.fn();
    const { container } = render(TimeRangePicker, {
      props: { presets: [{ token: "custom", label: "Custom 45", durationMs: 45 * 60_000 }], onChange }
    });
    await openPanel(container);
    const row = container.querySelector('[data-value="custom"]') as HTMLElement;
    expect(row.textContent?.trim()).toBe("Custom 45");
    await fireEvent.click(row);
    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0] as TimeRange;
    expect(emitted.relative).toBe("custom");
    expect(Math.abs(emitted.to - emitted.from - 45 * 60_000)).toBeLessThan(50);
  });

  it("honours a custom formatPresetLabel override for preset rows", async () => {
    const { container } = render(TimeRangePicker, {
      props: { presets: ["1h"], formatPresetLabel: (token: string) => `>>${token}<<` }
    });
    await openPanel(container);
    const row = container.querySelector('[data-value="1h"]');
    expect(row?.textContent?.trim()).toBe(">>1h<<");
  });

  it("uses DEFAULT_TIME_RANGE_PRESETS when `presets` is omitted", async () => {
    const { container } = render(TimeRangePicker, { props: {} });
    await openPanel(container);
    for (const token of DEFAULT_TIME_RANGE_PRESETS) {
      expect(container.querySelector(`[data-value="${token}"]`)).toBeTruthy();
    }
  });
});

describe("TimeRangePicker — custom tab: Apply/Cancel", () => {
  it("Apply emits {mode:'absolute'} with no `relative`, from<=to, and closes", async () => {
    const onChange = vi.fn();
    const { container, getByRole, getByLabelText } = render(TimeRangePicker, {
      props: { onChange, locale: "en-US" }
    });
    await openPanel(container);
    await fireEvent.click(getByRole("tab", { name: "Custom" }));

    const fromInput = getByLabelText("From") as HTMLInputElement;
    const toInput = getByLabelText("To") as HTMLInputElement;
    await fireEvent.input(fromInput, { target: { value: "2024-01-01 10:00" } });
    await fireEvent.blur(fromInput);
    await fireEvent.input(toInput, { target: { value: "2024-01-02 11:30" } });
    await fireEvent.blur(toInput);

    const applyBtn = getByRole("button", { name: "Apply" }) as HTMLButtonElement;
    expect(applyBtn.disabled).toBe(false);
    await fireEvent.click(applyBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0] as TimeRange;
    expect(emitted.mode).toBe("absolute");
    expect(emitted.relative).toBeUndefined();
    expect(emitted.from).toBeLessThanOrEqual(emitted.to);
    expect(emitted.from).toBe(new Date(2024, 0, 1, 10, 0).getTime());
    expect(emitted.to).toBe(new Date(2024, 0, 2, 11, 30).getTime());
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("Cancel discards the draft and emits nothing", async () => {
    const onChange = vi.fn();
    const { container, getByRole, getByLabelText } = render(TimeRangePicker, {
      props: { onChange, locale: "en-US" }
    });
    await openPanel(container);
    await fireEvent.click(getByRole("tab", { name: "Custom" }));
    const fromInput = getByLabelText("From") as HTMLInputElement;
    await fireEvent.input(fromInput, { target: { value: "2024-01-01 10:00" } });
    await fireEvent.blur(fromInput);
    await fireEvent.click(getByRole("button", { name: "Cancel" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("disables Apply and shows an inline error when from > to", async () => {
    const { container, getByRole, getByLabelText } = render(TimeRangePicker, { props: { locale: "en-US" } });
    await openPanel(container);
    await fireEvent.click(getByRole("tab", { name: "Custom" }));
    const fromInput = getByLabelText("From") as HTMLInputElement;
    const toInput = getByLabelText("To") as HTMLInputElement;
    await fireEvent.input(fromInput, { target: { value: "2024-01-05 10:00" } });
    await fireEvent.blur(fromInput);
    await fireEvent.input(toInput, { target: { value: "2024-01-01 10:00" } });
    await fireEvent.blur(toInput);
    const applyBtn = getByRole("button", { name: "Apply" }) as HTMLButtonElement;
    expect(applyBtn.disabled).toBe(true);
    expect(container.querySelector(".st-timeRangePicker__error")?.textContent).toContain("before");
  });

  it("disables Apply while the draft is incomplete (half-picked calendar range)", async () => {
    const { container, getByRole } = render(TimeRangePicker, { props: { locale: "en-US" } });
    await openPanel(container);
    await fireEvent.click(getByRole("tab", { name: "Custom" }));
    const days = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        ".st-calendar__day:not(.st-calendar__day--outside):not(.st-calendar__day--today)"
      )
    ).filter((d) => !d.disabled);
    expect(days.length).toBeGreaterThan(0);
    await fireEvent.click(days[0]);
    const applyBtn = getByRole("button", { name: "Apply" }) as HTMLButtonElement;
    expect(applyBtn.disabled).toBe(true);
    expect(container.querySelector(".st-timeRangePicker__error")).toBeTruthy();
  });

  it("renders one Calendar when calendarMonths=1", async () => {
    const { container, getByRole } = render(TimeRangePicker, { props: { calendarMonths: 1 } });
    await openPanel(container);
    await fireEvent.click(getByRole("tab", { name: "Personnalisé" }));
    expect(container.querySelectorAll(".st-calendar").length).toBe(1);
  });

  it("renders two side-by-side Calendars by default (calendarMonths=2)", async () => {
    const { container, getByRole } = render(TimeRangePicker, { props: {} });
    await openPanel(container);
    await fireEvent.click(getByRole("tab", { name: "Personnalisé" }));
    expect(container.querySelectorAll(".st-calendar").length).toBe(2);
  });
});

describe("TimeRangePicker — controlled vs uncontrolled", () => {
  it("uncontrolled: manages its own state and still calls onChange", async () => {
    const onChange = vi.fn();
    const { container } = render(TimeRangePicker, { props: { onChange } });
    await openPanel(container);
    const row = container.querySelector('[data-value="3h"]') as HTMLElement;
    await fireEvent.click(row);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(triggerLabelText(container)).toBe(formatPresetLabel("3h", "fr-FR"));
  });

  it("controlled: reflects a `value` pushed by the consumer via rerender", async () => {
    const onChange = vi.fn();
    const v1: TimeRange = { mode: "absolute", from: new Date(2024, 0, 1, 8, 0).getTime(), to: new Date(2024, 0, 1, 9, 0).getTime() };
    const { container, rerender } = render(TimeRangePicker, { props: { value: v1, onChange } });
    expect(triggerLabelText(container)).toBe(formatTriggerLabel(v1, "fr-FR"));

    const v2: TimeRange = { mode: "relative", relative: "1h", from: Date.now() - 3_600_000, to: Date.now() };
    await rerender({ value: v2, onChange });
    expect(triggerLabelText(container)).toBe(formatPresetLabel("1h", "fr-FR"));
  });

  it("controlled: clicking a preset notifies onChange with the resolved value", async () => {
    const onChange = vi.fn();
    // Relative mode so the panel opens straight on the Relative tab (opening
    // seeds the tab from the current mode) and the preset rows are visible.
    const value: TimeRange = { mode: "relative", relative: "30m", from: Date.now() - 1_800_000, to: Date.now() };
    const { container } = render(TimeRangePicker, { props: { value, onChange } });
    await openPanel(container);
    const row = container.querySelector('[data-value="6h"]') as HTMLElement;
    await fireEvent.click(row);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as TimeRange).relative).toBe("6h");
  });
});

describe("TimeRangePicker — min/max clamping", () => {
  it("disables a preset that resolves entirely outside the max bound", async () => {
    const now = Date.now();
    const { container } = render(TimeRangePicker, {
      props: { presets: ["30m", "24h"], max: now - 2 * 86_400_000 }
    });
    await openPanel(container);
    const shortRow = container.querySelector('[data-value="30m"]') as HTMLElement;
    expect(shortRow.getAttribute("aria-disabled")).toBe("true");
  });

  it("keeps a preset enabled (clamped) when only part of its window is out of bounds", async () => {
    const now = Date.now();
    const { container } = render(TimeRangePicker, {
      props: { presets: ["24h"], min: now - 60_000 }
    });
    await openPanel(container);
    const row = container.querySelector('[data-value="24h"]') as HTMLElement;
    expect(row.getAttribute("aria-disabled")).toBeNull();
  });
});

describe("TimeRangePicker — misc props", () => {
  it("merges a custom class and applies the size modifier", () => {
    const { container } = render(TimeRangePicker, { props: { class: "mine", size: "lg" } });
    const root = container.querySelector(".st-timeRangePicker") as HTMLElement;
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.classList.contains("st-timeRangePicker--lg")).toBe(true);
  });

  it("renders the field label and wires it into the trigger's accessible name", () => {
    const { container } = render(TimeRangePicker, { props: { label: "Time window" } });
    expect(container.querySelector(".st-timeRangePicker__label")?.textContent).toBe("Time window");
    const trigger = triggerButton(container);
    expect(trigger.getAttribute("aria-labelledby")).toBeTruthy();
  });
});
