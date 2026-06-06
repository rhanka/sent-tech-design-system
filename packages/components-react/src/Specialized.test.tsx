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

  it("is inert when readonly — renders role=img, no interactive elements", () => {
    const onChange = vi.fn();
    render(<Rating value={2} readonly label="Note" onChange={onChange} />);
    // role="img" on the container, accessible name includes the value
    const img = screen.getByRole("img");
    expect(img).toBeTruthy();
    expect(img.getAttribute("aria-label")).toContain("2 / 5");
    // No buttons in readonly mode
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    fireEvent.click(img);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports keyboard arrows on radio buttons (moves focus to target)", () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} />);
    const stars = screen.getAllByRole("radio");
    fireEvent.keyDown(stars[1], { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(3);
    // Focus should move to star 3 (index 2)
    expect(document.activeElement).toBe(stars[2]);
  });

  it("Home goes to star 1 (not 0) in integer mode", () => {
    const onChange = vi.fn();
    render(<Rating value={3} onChange={onChange} />);
    const stars = screen.getAllByRole("radio");
    fireEvent.keyDown(stars[2], { key: "Home" });
    expect(onChange).toHaveBeenCalledWith(1);
    expect(document.activeElement).toBe(stars[0]);
  });

  it("ArrowLeft stays at 1, does not go below 1 in integer mode", () => {
    const onChange = vi.fn();
    render(<Rating value={1} onChange={onChange} />);
    const stars = screen.getAllByRole("radio");
    fireEvent.keyDown(stars[0], { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(1);
    expect(document.activeElement).toBe(stars[0]);
  });

  it("allowHalf renders a slider with correct ARIA", () => {
    const onChange = vi.fn();
    render(<Rating value={2.5} allowHalf label="Note" onChange={onChange} />);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-valuenow")).toBe("2.5");
    expect(slider.getAttribute("aria-valuemin")).toBe("0");
    expect(slider.getAttribute("aria-valuemax")).toBe("5");
    expect(slider.getAttribute("aria-label")).toBe("Note");
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

  it("ArrowDown opens the list and sets aria-activedescendant", () => {
    render(<TimePicker step={60} min="08:00" max="10:00" />);
    const input = screen.getByRole("combobox");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(input.getAttribute("aria-activedescendant")).toBeTruthy();
  });

  it("ArrowDown/Up navigates through options and updates aria-activedescendant", () => {
    render(<TimePicker step={60} min="08:00" max="10:00" />);
    const input = screen.getByRole("combobox");
    // Open list
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const firstDesc = input.getAttribute("aria-activedescendant");
    // ArrowDown to next option
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const secondDesc = input.getAttribute("aria-activedescendant");
    expect(firstDesc).not.toBe(secondDesc);
    // ArrowUp back to first
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.getAttribute("aria-activedescendant")).toBe(firstDesc);
  });

  it("Home/End jump to first/last option", () => {
    render(<TimePicker step={60} min="08:00" max="10:00" />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "End" });
    // aria-activedescendant should point to last option (index 2)
    const listId = input.getAttribute("aria-controls")!;
    expect(input.getAttribute("aria-activedescendant")).toBe(`${listId}-opt-2`);
    fireEvent.keyDown(input, { key: "Home" });
    expect(input.getAttribute("aria-activedescendant")).toBe(`${listId}-opt-0`);
  });

  it("Enter selects the active option and closes the list", () => {
    const onChange = vi.fn();
    render(<TimePicker step={60} min="08:00" max="10:00" onChange={onChange} />);
    const input = screen.getByRole("combobox");
    // ArrowDown opens and focuses first option (08:00)
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // ArrowDown again to 09:00
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("09:00");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("Escape closes the list without selecting", () => {
    const onChange = vi.fn();
    render(<TimePicker step={60} min="08:00" max="10:00" onChange={onChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(onChange).not.toHaveBeenCalled();
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

  it("grid has role=row wrappers (not display:contents)", () => {
    render(<Calendar month="2024-03" />);
    const rows = screen.getAllByRole("row");
    // 1 header row + 6 week rows = 7
    expect(rows.length).toBeGreaterThanOrEqual(7);
  });

  it("roving tabindex: exactly one cell has tabindex=0 (the focus date)", () => {
    render(<Calendar month="2024-03" />);
    const cells = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    const tabbable = cells.filter((c) => c.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].disabled).toBe(false);
  });

  it("roving tabindex: disabled cells never have tabindex=0", () => {
    render(<Calendar month="2024-03" min="2024-03-10" max="2024-03-20" />);
    const cells = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    const tabbable = cells.filter((c) => c.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].disabled).toBe(false);
  });

  it("ArrowRight moves focus to the next day", () => {
    render(<Calendar month="2024-03" value="2024-03-10" />);
    const cells = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    const inMonth = cells.filter((c) => !c.className.includes("st-calendar__day--outside"));
    const day10 = inMonth.find((c) => c.textContent === "10")!;
    day10.focus();
    fireEvent.keyDown(day10.closest("[role='grid']")!, { key: "ArrowRight" });
    // After ArrowRight, day 11 should be focused
    const day11 = inMonth.find((c) => c.textContent === "11")!;
    expect(day11.getAttribute("tabindex")).toBe("0");
  });

  it("ArrowDown moves focus 7 days forward", () => {
    render(<Calendar month="2024-03" value="2024-03-10" />);
    const cells = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    const inMonth = cells.filter((c) => !c.className.includes("st-calendar__day--outside"));
    const day10 = inMonth.find((c) => c.textContent === "10")!;
    fireEvent.keyDown(day10.closest("[role='grid']")!, { key: "ArrowDown" });
    const day17 = inMonth.find((c) => c.textContent === "17")!;
    expect(day17.getAttribute("tabindex")).toBe("0");
  });

  it("Enter/Space on focused cell selects it", () => {
    const onChange = vi.fn();
    render(<Calendar month="2024-03" value="2024-03-10" onChange={onChange} />);
    const cells = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    const inMonth = cells.filter((c) => !c.className.includes("st-calendar__day--outside"));
    const day10 = inMonth.find((c) => c.textContent === "10")!;
    const grid = day10.closest("[role='grid']")!;
    day10.focus();
    fireEvent.keyDown(grid, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("2024-03-10");
  });
});

describe("SlideIndicator", () => {
  it("marks the current button with aria-current and emits the clicked index", () => {
    const onChange = vi.fn();
    render(<SlideIndicator count={4} current={1} onChange={onChange} />);
    // role="group" + buttons (not tablist/tabs)
    expect(screen.getByRole("group")).toBeTruthy();
    const btns = screen.getAllByRole("button");
    expect(btns).toHaveLength(4);
    expect(btns[1].getAttribute("aria-current")).toBe("true");
    expect(btns[1].getAttribute("tabindex")).toBe("0");
    expect(btns[0].getAttribute("tabindex")).toBe("-1");
    fireEvent.click(btns[3]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("does not re-emit when clicking the current index", () => {
    const onChange = vi.fn();
    render(<SlideIndicator count={3} current={2} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("button")[2]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ArrowRight moves DOM focus to the next button", () => {
    const onChange = vi.fn();
    render(<SlideIndicator count={3} current={0} onChange={onChange} label="Slide" />);
    const btns = screen.getAllByRole("button");
    btns[0].focus();
    fireEvent.keyDown(btns[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(1);
    expect(document.activeElement).toBe(btns[1]);
  });

  it("Home / End jump to first / last", () => {
    const onChange = vi.fn();
    render(<SlideIndicator count={4} current={2} onChange={onChange} label="Slide" />);
    const btns = screen.getAllByRole("button");
    btns[2].focus();
    fireEvent.keyDown(btns[2], { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(document.activeElement).toBe(btns[0]);
    fireEvent.keyDown(btns[0], { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(document.activeElement).toBe(btns[3]);
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
