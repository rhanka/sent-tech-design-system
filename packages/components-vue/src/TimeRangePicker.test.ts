import { mount } from "@vue/test-utils";
import type { VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it, vi, afterEach } from "vitest";
import { TimeRangePicker } from "./index.js";
import type { TimeRange } from "./index.js";
import {
  DEFAULT_TIME_RANGE_PRESETS,
  composeAbsolute,
  formatPresetLabel,
  formatTriggerLabel,
  parsePresetMs,
  resolveRelative,
  splitAbsolute,
} from "./index.js";

// ---------------------------------------------------------------------------
// timeRange.ts — pure helpers (ported verbatim from the Svelte reference)
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
      toTime: "23:45",
    });
  });
});

describe("composeAbsolute", () => {
  it("composes a complete, ordered draft into {from,to}", () => {
    const composed = composeAbsolute({
      fromDate: "2024-01-01",
      fromTime: "10:00",
      toDate: "2024-01-02",
      toTime: "11:30",
    });
    expect(composed).toEqual({
      from: new Date(2024, 0, 1, 10, 0).getTime(),
      to: new Date(2024, 0, 2, 11, 30).getTime(),
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
      toTime: "10:00",
    });
    expect(composed).toBeNull();
  });

  it("returns null on malformed date/time parts", () => {
    expect(
      composeAbsolute({ fromDate: "2024/01/01", fromTime: "10:00", toDate: "2024-01-02", toTime: "10:00" }),
    ).toBeNull();
    expect(
      composeAbsolute({ fromDate: "2024-01-01", fromTime: "25:00", toDate: "2024-01-02", toTime: "10:00" }),
    ).toBeNull();
  });

  it("accepts equal from/to (a zero-length range)", () => {
    const ts = new Date(2024, 0, 1, 10, 0).getTime();
    const composed = composeAbsolute({
      fromDate: "2024-01-01",
      fromTime: "10:00",
      toDate: "2024-01-01",
      toTime: "10:00",
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
// TimeRangePicker.ts — component behaviour
// ---------------------------------------------------------------------------

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const mounted: VueWrapper[] = [];
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

function mountPicker(props: Record<string, unknown> = {}): VueWrapper {
  const wrapper = mount(TimeRangePicker, { props, attachTo: document.body });
  mounted.push(wrapper);
  return wrapper;
}

function triggerLabelText(el: HTMLElement): string {
  return el.querySelector(".st-timeRangePicker__triggerLabel")?.textContent?.trim() ?? "";
}

function triggerButton(el: HTMLElement): HTMLButtonElement {
  return el.querySelector(".st-timeRangePicker__trigger") as HTMLButtonElement;
}

async function openPanel(wrapper: VueWrapper): Promise<void> {
  await wrapper.find(".st-timeRangePicker__trigger").trigger("click");
}

async function clickTab(wrapper: VueWrapper, text: string): Promise<void> {
  const btn = wrapper.findAll(".st-contentSwitcher button").find((w) => w.text() === text);
  if (!btn) throw new Error(`tab not found: ${text}`);
  await btn.trigger("click");
}

function actionButton(wrapper: VueWrapper, text: string) {
  const btn = wrapper.findAll(".st-timeRangePicker__actions button").find((w) => w.text() === text);
  if (!btn) throw new Error(`button not found: ${text}`);
  return btn;
}

/** The typed date/time <Input> inside bound index 0 ("from") or 1 ("to") — the
 * sibling <TimePicker> input in the same bound is `readonly`, so filtering it
 * out unambiguously isolates the typed text field. */
function boundTextInput(wrapper: VueWrapper, index: 0 | 1) {
  const bound = wrapper.findAll(".st-timeRangePicker__bound")[index];
  const found = bound.findAll("input").find((w) => w.attributes("readonly") === undefined);
  if (!found) throw new Error(`typed input not found in bound[${index}]`);
  return found;
}

describe("TimeRangePicker — trigger label", () => {
  it("shows the French default relative label for the uncontrolled default (30m)", () => {
    const wrapper = mountPicker();
    expect(triggerLabelText(wrapper.element as HTMLElement)).toBe("30 dernières minutes");
  });

  it("shows an English relative label when locale='en-US'", () => {
    const value: TimeRange = { mode: "relative", relative: "3h", from: Date.now() - 10_800_000, to: Date.now() };
    const wrapper = mountPicker({ value, locale: "en-US" });
    expect(triggerLabelText(wrapper.element as HTMLElement)).toBe("Last 3 hours");
  });

  it("collapses an absolute same-day range on the trigger", () => {
    const from = new Date(2024, 2, 10, 9, 0).getTime();
    const to = new Date(2024, 2, 10, 17, 30).getTime();
    const wrapper = mountPicker({ value: { mode: "absolute", from, to } });
    expect(triggerLabelText(wrapper.element as HTMLElement)).toBe(
      formatTriggerLabel({ mode: "absolute", from, to }, "fr-FR"),
    );
  });

  it("honours a custom formatRange override", () => {
    const wrapper = mountPicker({ formatRange: () => "CUSTOM LABEL" });
    expect(triggerLabelText(wrapper.element as HTMLElement)).toBe("CUSTOM LABEL");
  });
});

describe("TimeRangePicker — open/close mechanics", () => {
  it("opens a role=dialog panel on trigger click and reflects aria-expanded", async () => {
    const wrapper = mountPicker();
    const trigger = triggerButton(wrapper.element as HTMLElement);
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    await openPanel(wrapper);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it("does not open when disabled", async () => {
    const wrapper = mountPicker({ disabled: true });
    const trigger = triggerButton(wrapper.element as HTMLElement);
    expect(trigger.disabled).toBe(true);
    await wrapper.find(".st-timeRangePicker__trigger").trigger("click");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("Escape closes the panel without emitting and returns focus to the trigger", async () => {
    const onChange = vi.fn();
    const wrapper = mountPicker({ onChange });
    const trigger = triggerButton(wrapper.element as HTMLElement);
    trigger.focus();
    await openPanel(wrapper);
    await nextTick();
    await nextTick();
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await nextTick();
    await nextTick();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  });

  it("an outside pointerdown closes the panel without emitting", async () => {
    const onChange = vi.fn();
    const wrapper = mountPicker({ onChange });
    await openPanel(wrapper);
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await nextTick();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves focus inside the dialog when it opens", async () => {
    const wrapper = mountPicker();
    const trigger = triggerButton(wrapper.element as HTMLElement);
    await openPanel(wrapper);
    await nextTick();
    await nextTick();
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(trigger);
  });

  it("traps Tab navigation within the panel (Shift+Tab wraps last -> first)", async () => {
    const wrapper = mountPicker();
    await openPanel(wrapper);
    await nextTick();
    await nextTick();
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    expect(focusables.length).toBeGreaterThan(1);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first.focus();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(last);
  });
});

describe("TimeRangePicker — relative presets", () => {
  it("clicking a preset resolves now, emits {mode:'relative',...}, and closes", async () => {
    const onChange = vi.fn();
    const wrapper = mountPicker({ onChange });
    await openPanel(wrapper);
    const before = Date.now();
    await wrapper.find('[data-value="1h"]').trigger("click");
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
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("re-clicking the already-active preset still refreshes now and closes", async () => {
    const onChange = vi.fn();
    const value: TimeRange = { mode: "relative", relative: "1h", from: Date.now() - 3_601_000, to: Date.now() - 1_000 };
    const wrapper = mountPicker({ value, onChange });
    await openPanel(wrapper);
    const row = document.querySelector('[data-value="1h"]') as HTMLElement;
    expect(row.getAttribute("aria-selected")).toBe("true");
    await wrapper.find('[data-value="1h"]').trigger("click");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as TimeRange).relative).toBe("1h");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("does not emit or close when clicking a disabled preset", async () => {
    const onChange = vi.fn();
    const now = Date.now();
    const wrapper = mountPicker({ presets: ["30m"], max: now - 2 * 86_400_000, onChange });
    await openPanel(wrapper);
    const row = document.querySelector('[data-value="30m"]') as HTMLElement;
    expect(row.getAttribute("aria-disabled")).toBe("true");
    await wrapper.find('[data-value="30m"]').trigger("click");
    expect(onChange).not.toHaveBeenCalled();
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it("accepts object-form presets with an explicit label and durationMs override", async () => {
    const onChange = vi.fn();
    const wrapper = mountPicker({
      presets: [{ token: "custom", label: "Custom 45", durationMs: 45 * 60_000 }],
      onChange,
    });
    await openPanel(wrapper);
    const row = document.querySelector('[data-value="custom"]') as HTMLElement;
    expect(row.textContent?.trim()).toBe("Custom 45");
    await wrapper.find('[data-value="custom"]').trigger("click");
    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0] as TimeRange;
    expect(emitted.relative).toBe("custom");
    expect(Math.abs(emitted.to - emitted.from - 45 * 60_000)).toBeLessThan(50);
  });

  it("honours a custom formatPresetLabel override for preset rows", async () => {
    const wrapper = mountPicker({ presets: ["1h"], formatPresetLabel: (token: string) => `>>${token}<<` });
    await openPanel(wrapper);
    const row = document.querySelector('[data-value="1h"]');
    expect(row?.textContent?.trim()).toBe(">>1h<<");
  });

  it("uses DEFAULT_TIME_RANGE_PRESETS when `presets` is omitted", async () => {
    const wrapper = mountPicker();
    await openPanel(wrapper);
    for (const token of DEFAULT_TIME_RANGE_PRESETS) {
      expect(document.querySelector(`[data-value="${token}"]`)).toBeTruthy();
    }
  });
});

describe("TimeRangePicker — custom tab: Apply/Cancel", () => {
  it("Apply emits {mode:'absolute'} with no `relative`, from<=to, and closes", async () => {
    const onChange = vi.fn();
    const wrapper = mountPicker({ onChange, locale: "en-US" });
    await openPanel(wrapper);
    await clickTab(wrapper, "Custom");

    const fromInput = boundTextInput(wrapper, 0);
    const toInput = boundTextInput(wrapper, 1);
    await fromInput.setValue("2024-01-01 10:00");
    await fromInput.trigger("blur");
    await toInput.setValue("2024-01-02 11:30");
    await toInput.trigger("blur");

    const applyBtn = actionButton(wrapper, "Apply");
    expect((applyBtn.element as HTMLButtonElement).disabled).toBe(false);
    await applyBtn.trigger("click");

    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0] as TimeRange;
    expect(emitted.mode).toBe("absolute");
    expect(emitted.relative).toBeUndefined();
    expect(emitted.from).toBeLessThanOrEqual(emitted.to);
    expect(emitted.from).toBe(new Date(2024, 0, 1, 10, 0).getTime());
    expect(emitted.to).toBe(new Date(2024, 0, 2, 11, 30).getTime());
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("Cancel discards the draft and emits nothing", async () => {
    const onChange = vi.fn();
    const wrapper = mountPicker({ onChange, locale: "en-US" });
    await openPanel(wrapper);
    await clickTab(wrapper, "Custom");
    const fromInput = boundTextInput(wrapper, 0);
    await fromInput.setValue("2024-01-01 10:00");
    await fromInput.trigger("blur");
    await actionButton(wrapper, "Cancel").trigger("click");
    expect(onChange).not.toHaveBeenCalled();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("disables Apply and shows an inline error when from > to", async () => {
    const wrapper = mountPicker({ locale: "en-US" });
    await openPanel(wrapper);
    await clickTab(wrapper, "Custom");
    const fromInput = boundTextInput(wrapper, 0);
    const toInput = boundTextInput(wrapper, 1);
    await fromInput.setValue("2024-01-05 10:00");
    await fromInput.trigger("blur");
    await toInput.setValue("2024-01-01 10:00");
    await toInput.trigger("blur");
    const applyBtn = actionButton(wrapper, "Apply");
    expect((applyBtn.element as HTMLButtonElement).disabled).toBe(true);
    expect(wrapper.find(".st-timeRangePicker__error").text()).toContain("before");
  });

  it("disables Apply while the draft is incomplete (half-picked calendar range)", async () => {
    const wrapper = mountPicker({ locale: "en-US" });
    await openPanel(wrapper);
    await clickTab(wrapper, "Custom");
    const days = wrapper
      .findAll<HTMLButtonElement>(".st-calendar__day:not(.st-calendar__day--outside):not(.st-calendar__day--today)")
      .filter((w) => !(w.element as HTMLButtonElement).disabled);
    expect(days.length).toBeGreaterThan(0);
    await days[0].trigger("click");
    const applyBtn = actionButton(wrapper, "Apply");
    expect((applyBtn.element as HTMLButtonElement).disabled).toBe(true);
    expect(wrapper.find(".st-timeRangePicker__error").exists()).toBe(true);
  });

  it("renders one Calendar when calendarMonths=1", async () => {
    const wrapper = mountPicker({ calendarMonths: 1 });
    await openPanel(wrapper);
    await clickTab(wrapper, "Personnalisé");
    expect(wrapper.findAll(".st-calendar").length).toBe(1);
  });

  it("renders two side-by-side Calendars by default (calendarMonths=2)", async () => {
    const wrapper = mountPicker();
    await openPanel(wrapper);
    await clickTab(wrapper, "Personnalisé");
    expect(wrapper.findAll(".st-calendar").length).toBe(2);
  });
});

describe("TimeRangePicker — controlled vs uncontrolled", () => {
  it("uncontrolled: manages its own state and still calls onChange", async () => {
    const onChange = vi.fn();
    const wrapper = mountPicker({ onChange });
    await openPanel(wrapper);
    await wrapper.find('[data-value="3h"]').trigger("click");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(triggerLabelText(wrapper.element as HTMLElement)).toBe(formatPresetLabel("3h", "fr-FR"));
  });

  it("controlled: reflects a `value` pushed by the consumer via rerender", async () => {
    const onChange = vi.fn();
    const v1: TimeRange = {
      mode: "absolute",
      from: new Date(2024, 0, 1, 8, 0).getTime(),
      to: new Date(2024, 0, 1, 9, 0).getTime(),
    };
    const wrapper = mountPicker({ value: v1, onChange });
    expect(triggerLabelText(wrapper.element as HTMLElement)).toBe(formatTriggerLabel(v1, "fr-FR"));

    const v2: TimeRange = { mode: "relative", relative: "1h", from: Date.now() - 3_600_000, to: Date.now() };
    await wrapper.setProps({ value: v2 });
    expect(triggerLabelText(wrapper.element as HTMLElement)).toBe(formatPresetLabel("1h", "fr-FR"));
  });

  it("controlled: clicking a preset notifies onChange with the resolved value", async () => {
    const onChange = vi.fn();
    // Relative mode so the panel opens straight on the Relative tab (opening
    // seeds the tab from the current mode) and the preset rows are visible.
    const value: TimeRange = { mode: "relative", relative: "30m", from: Date.now() - 1_800_000, to: Date.now() };
    const wrapper = mountPicker({ value, onChange });
    await openPanel(wrapper);
    await wrapper.find('[data-value="6h"]').trigger("click");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as TimeRange).relative).toBe("6h");
  });
});

describe("TimeRangePicker — min/max clamping", () => {
  it("disables a preset that resolves entirely outside the max bound", async () => {
    const now = Date.now();
    const wrapper = mountPicker({ presets: ["30m", "24h"], max: now - 2 * 86_400_000 });
    await openPanel(wrapper);
    const shortRow = document.querySelector('[data-value="30m"]') as HTMLElement;
    expect(shortRow.getAttribute("aria-disabled")).toBe("true");
  });

  it("keeps a preset enabled (clamped) when only part of its window is out of bounds", async () => {
    const now = Date.now();
    const wrapper = mountPicker({ presets: ["24h"], min: now - 60_000 });
    await openPanel(wrapper);
    const row = document.querySelector('[data-value="24h"]') as HTMLElement;
    expect(row.getAttribute("aria-disabled")).toBeNull();
  });
});

describe("TimeRangePicker — misc props", () => {
  it("merges a custom class and applies the size modifier", () => {
    const wrapper = mountPicker({ class: "mine", size: "lg" });
    const root = wrapper.element as HTMLElement;
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.classList.contains("st-timeRangePicker--lg")).toBe(true);
  });

  it("renders the field label and wires it into the trigger's accessible name", () => {
    const wrapper = mountPicker({ label: "Time window" });
    expect(wrapper.find(".st-timeRangePicker__label").text()).toBe("Time window");
    const trigger = triggerButton(wrapper.element as HTMLElement);
    expect(trigger.getAttribute("aria-labelledby")).toBeTruthy();
  });
});
