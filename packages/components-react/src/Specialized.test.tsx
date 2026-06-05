import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Rating, TimePicker, Calendar, SlideIndicator, Autosave } from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("Rating", () => {
  it("emits the clicked value via onChange", () => {
    const onChange = vi.fn();
    render(<Rating label="Note" onChange={onChange} />);
    const stars = screen.getAllByRole("radio");
    expect(stars).toHaveLength(5);
    fireEvent.click(stars[2]); // 3rd star -> value 3
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("re-clicking the current value resets to 0", () => {
    const onChange = vi.fn();
    render(<Rating value={3} onChange={onChange} />);
    const stars = screen.getAllByRole("radio");
    fireEvent.click(stars[2]); // re-click the 3rd star (current = 3)
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("is inert when readonly (no onChange, stars disabled)", () => {
    const onChange = vi.fn();
    render(<Rating value={2} readonly onChange={onChange} />);
    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-readonly")).toBe("true");
    const stars = screen.getAllByRole("radio");
    expect((stars[0] as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(stars[4]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports keyboard arrows", () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} />);
    const stars = screen.getAllByRole("radio");
    fireEvent.keyDown(stars[1], { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(3);
  });
});

describe("TimePicker", () => {
  it("generates slots by step and selects HH:mm (24h)", () => {
    const onChange = vi.fn();
    render(<TimePicker label="Heure" step={60} onChange={onChange} />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.click(input);
    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    // 24h * 1 slot/hour = 24 slots (00:00 .. 23:00)
    expect(options).toHaveLength(24);
    expect(options[0].textContent).toBe("00:00");
    fireEvent.click(options[9]); // 09:00
    expect(onChange).toHaveBeenCalledWith("09:00");
  });

  it("respects min/max bounds", () => {
    render(<TimePicker step={60} min="08:00" max="10:00" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.click(input);
    const options = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["08:00", "09:00", "10:00"]);
  });

  it("displays 12h but still emits 24h HH:mm", () => {
    const onChange = vi.fn();
    render(<TimePicker step={60} format="12" min="13:00" max="13:00" onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    const option = within(screen.getByRole("listbox")).getByRole("option");
    expect(option.textContent).toBe("01:00 PM");
    fireEvent.click(option);
    expect(onChange).toHaveBeenCalledWith("13:00");
  });
});

describe("Calendar", () => {
  it("renders a 42-cell grid and selects a day -> YYYY-MM-DD", () => {
    const onChange = vi.fn();
    render(<Calendar month="2024-03" onChange={onChange} />);
    const cells = screen.getAllByRole("gridcell");
    expect(cells).toHaveLength(42);
    // Find the day labelled "15" that is in-month (not an outside cell).
    const day15 = cells.find(
      (c) => c.textContent === "15" && !c.className.includes("st-calendar__day--outside"),
    )!;
    fireEvent.click(day15);
    expect(onChange).toHaveBeenCalledWith("2024-03-15");
  });

  it("disables out-of-bounds dates via min/max", () => {
    render(<Calendar month="2024-03" min="2024-03-10" max="2024-03-20" />);
    const cells = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    const inMonth = cells.filter((c) => !c.className.includes("st-calendar__day--outside"));
    const day5 = inMonth.find((c) => c.textContent === "5")!;
    const day15 = inMonth.find((c) => c.textContent === "15")!;
    expect(day5.disabled).toBe(true);
    expect(day15.disabled).toBe(false);
  });

  it("range mode returns a [start, end] tuple", () => {
    const onChange = vi.fn();
    render(<Calendar month="2024-03" range onChange={onChange} />);
    const cells = screen.getAllByRole("gridcell");
    const inMonth = cells.filter((c) => !c.className.includes("st-calendar__day--outside"));
    const day10 = inMonth.find((c) => c.textContent === "10")!;
    fireEvent.click(day10);
    expect(onChange).toHaveBeenCalledWith(["2024-03-10", null]);
  });
});

describe("SlideIndicator", () => {
  it("marks the current tab and emits the clicked index", () => {
    const onChange = vi.fn();
    render(<SlideIndicator count={4} current={1} onChange={onChange} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(tabs[1].getAttribute("tabindex")).toBe("0");
    fireEvent.click(tabs[3]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("does not re-emit when clicking the current index", () => {
    const onChange = vi.fn();
    render(<SlideIndicator count={3} current={2} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("tab")[2]);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Autosave", () => {
  it("uses role=status and the idle label by default", () => {
    render(<Autosave status="idle" locale="fr-FR" />);
    const region = screen.getByRole("status");
    expect(region.textContent).toContain("Modifications enregistrées");
  });

  it("uses role=alert and shows a retry button on error", () => {
    const onRetry = vi.fn();
    render(<Autosave status="error" onRetry={onRetry} locale="fr-FR" />);
    const region = screen.getByRole("alert");
    expect(region.textContent).toContain("Échec de l'enregistrement");
    fireEvent.click(screen.getByText("Réessayer"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("honours overridden labels", () => {
    render(<Autosave status="saving" labels={{ saving: "Wait…" }} />);
    expect(screen.getByRole("status").textContent).toContain("Wait…");
  });
});
