import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Rating from "./lib/Rating.svelte";
import TimePicker from "./lib/TimePicker.svelte";
import Calendar from "./lib/Calendar.svelte";
import SlideIndicator from "./lib/SlideIndicator.svelte";
import Autosave from "./lib/Autosave.svelte";

describe("Rating", () => {
  it("exposes a radiogroup with one radio per star", () => {
    const { container } = render(Rating, { props: { value: 0, max: 5 } });
    const group = container.querySelector('[role="radiogroup"]') as HTMLElement;
    expect(group).toBeTruthy();
    expect(group.querySelectorAll('[role="radio"]')).toHaveLength(5);
  });

  it("emits the clicked value through onChange", async () => {
    const onChange = vi.fn();
    render(Rating, { props: { value: 0, max: 5, onChange } });
    const stars = screen.getAllByRole("radio");
    await fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it("does not emit when readonly", async () => {
    const onChange = vi.fn();
    render(Rating, { props: { value: 3, max: 5, readonly: true, onChange } });
    const stars = screen.getAllByRole("radio");
    await fireEvent.click(stars[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves the value with arrow keys", async () => {
    const onChange = vi.fn();
    render(Rating, { props: { value: 2, max: 5, onChange } });
    const stars = screen.getAllByRole("radio");
    await fireEvent.keyDown(stars[1], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(3);
  });
});

describe("TimePicker", () => {
  it("generates time slots based on step", async () => {
    render(TimePicker, { props: { value: "", step: 30, label: "Heure" } });
    await fireEvent.click(screen.getByLabelText("Heure"));
    const options = screen.getAllByRole("option");
    // 24h * 2 slots/hour = 48 with a 30-minute step.
    expect(options).toHaveLength(48);
    expect(options[0].textContent?.trim()).toBe("00:00");
    expect(options[1].textContent?.trim()).toBe("00:30");
  });

  it("respects min and max bounds", async () => {
    render(TimePicker, { props: { value: "", step: 60, min: "09:00", max: "12:00", label: "H" } });
    await fireEvent.click(screen.getByLabelText("H"));
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent?.trim())).toEqual([
      "09:00",
      "10:00",
      "11:00",
      "12:00"
    ]);
  });

  it("emits the selected slot as HH:mm", async () => {
    const onChange = vi.fn();
    render(TimePicker, { props: { value: "", step: 60, onChange, label: "Time" } });
    await fireEvent.click(screen.getByLabelText("Time"));
    await fireEvent.click(screen.getByRole("option", { name: "08:00" }));
    expect(onChange).toHaveBeenCalledWith("08:00");
  });

  it("renders 12h format while still emitting 24h HH:mm", async () => {
    const onChange = vi.fn();
    render(TimePicker, {
      props: { value: "", step: 60, format: "12", onChange, label: "T" }
    });
    await fireEvent.click(screen.getByLabelText("T"));
    // 13:00 should display as 01:00 PM but emit "13:00".
    const pm = screen.getByRole("option", { name: "01:00 PM" });
    await fireEvent.click(pm);
    expect(onChange).toHaveBeenCalledWith("13:00");
  });
});

describe("Calendar", () => {
  it("renders the month grid with 42 day cells", () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", locale: "fr-FR" }
    });
    expect(container.querySelector('[role="grid"]')).toBeTruthy();
    expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(42);
  });

  it("emits the clicked day as YYYY-MM-DD", async () => {
    const onChange = vi.fn();
    render(Calendar, { props: { value: "2026-06-01", month: "2026-06", onChange, locale: "fr-FR" } });
    const label = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(2026, 5, 15));
    await fireEvent.click(screen.getByRole("gridcell", { name: label }));
    expect(onChange).toHaveBeenCalledWith("2026-06-15");
  });

  it("disables days outside the min/max bounds", () => {
    render(Calendar, {
      props: { value: null, month: "2026-06", min: "2026-06-10", max: "2026-06-20", locale: "fr-FR" }
    });
    const labelFor = (day: number) =>
      new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(2026, 5, day));
    const before = screen.getByRole("gridcell", { name: labelFor(5) }) as HTMLButtonElement;
    const inside = screen.getByRole("gridcell", { name: labelFor(15) }) as HTMLButtonElement;
    expect(before.disabled).toBe(true);
    expect(inside.disabled).toBe(false);
  });

  it("emits a [start, end] tuple in range mode", async () => {
    const onChange = vi.fn();
    render(Calendar, {
      props: { value: [null, null], range: true, month: "2026-06", onChange, locale: "fr-FR" }
    });
    const labelFor = (day: number) =>
      new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(2026, 5, day));
    await fireEvent.click(screen.getByRole("gridcell", { name: labelFor(10) }));
    expect(onChange).toHaveBeenLastCalledWith(["2026-06-10", null]);
  });
});

describe("SlideIndicator", () => {
  it("marks the current slide with aria-selected and aria-current", () => {
    render(SlideIndicator, { props: { count: 4, current: 2 } });
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(tabs[2].getAttribute("aria-selected")).toBe("true");
    expect(tabs[2].getAttribute("aria-current")).toBe("true");
    expect(tabs[0].getAttribute("aria-selected")).toBe("false");
  });

  it("emits the clicked index", async () => {
    const onChange = vi.fn();
    render(SlideIndicator, { props: { count: 4, current: 0, onChange } });
    const tabs = screen.getAllByRole("tab");
    await fireEvent.click(tabs[3]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("moves through slides with arrow keys", async () => {
    const onChange = vi.fn();
    render(SlideIndicator, { props: { count: 4, current: 1, onChange } });
    const tabs = screen.getAllByRole("tab");
    await fireEvent.keyDown(tabs[1], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(2);
  });
});

describe("Autosave", () => {
  it("shows the saving label with role=status", () => {
    const { container } = render(Autosave, { props: { status: "saving", locale: "fr-FR" } });
    const root = container.querySelector(".st-autosave") as HTMLElement;
    expect(root.getAttribute("role")).toBe("status");
    expect(root.textContent).toContain("Enregistrement");
  });

  it("shows the saved label", () => {
    render(Autosave, { props: { status: "saved", locale: "fr-FR" } });
    expect(screen.getByText("Enregistré")).toBeTruthy();
  });

  it("uses role=alert and a retry button on error", async () => {
    const onRetry = vi.fn();
    render(Autosave, { props: { status: "error", onRetry, locale: "fr-FR" } });
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Échec");
    const retry = within(alert).getByRole("button", { name: "Réessayer" });
    await fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("honours custom labels", () => {
    render(Autosave, { props: { status: "saving", labels: { saving: "Sauvegarde en cours" } } });
    expect(screen.getByText("Sauvegarde en cours")).toBeTruthy();
  });
});
