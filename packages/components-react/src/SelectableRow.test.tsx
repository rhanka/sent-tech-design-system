import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SelectableRow } from "./SelectableRow.js";

afterEach(cleanup);

describe("SelectableRow", () => {
  it("renders with role=option and the row class", () => {
    const { container } = render(<SelectableRow>Documents</SelectableRow>);
    const row = screen.getByRole("option");
    expect(row).toBeTruthy();
    expect(row.className).toContain("st-selectableRow");
    expect(container.textContent).toContain("Documents");
  });

  it("selected applies aria-selected=true and the selected class", () => {
    render(<SelectableRow selected>Documents</SelectableRow>);
    const row = screen.getByRole("option");
    expect(row.getAttribute("aria-selected")).toBe("true");
    expect(row.className).toContain("st-selectableRow--selected");
  });

  it("is not selected by default (aria-selected=false, no selected class)", () => {
    render(<SelectableRow>Documents</SelectableRow>);
    const row = screen.getByRole("option");
    expect(row.getAttribute("aria-selected")).toBe("false");
    expect(row.className).not.toContain("st-selectableRow--selected");
  });

  it("click calls onSelect with the toggled state (controlled)", () => {
    const onSelect = vi.fn();
    render(<SelectableRow onSelect={onSelect}>Documents</SelectableRow>);
    const row = screen.getByRole("option");
    fireEvent.click(row);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenLastCalledWith(true);
  });

  it("click on a selected row calls onSelect(false)", () => {
    const onSelect = vi.fn();
    render(
      <SelectableRow selected onSelect={onSelect}>
        Documents
      </SelectableRow>,
    );
    fireEvent.click(screen.getByRole("option"));
    expect(onSelect).toHaveBeenLastCalledWith(false);
  });

  it("reflects controlled selected updates and stays in sync with onSelect", () => {
    function Controlled() {
      const [selected, setSelected] = React.useState(false);
      return (
        <SelectableRow selected={selected} onSelect={setSelected}>
          Documents
        </SelectableRow>
      );
    }
    render(<Controlled />);
    const row = screen.getByRole("option");
    expect(row.getAttribute("aria-selected")).toBe("false");
    fireEvent.click(row);
    expect(row.getAttribute("aria-selected")).toBe("true");
    expect(row.className).toContain("st-selectableRow--selected");
    fireEvent.click(row);
    expect(row.getAttribute("aria-selected")).toBe("false");
  });

  it("Enter key selects (calls onSelect)", () => {
    const onSelect = vi.fn();
    render(<SelectableRow onSelect={onSelect}>Documents</SelectableRow>);
    fireEvent.keyDown(screen.getByRole("option"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenLastCalledWith(true);
  });

  it("Space key selects (calls onSelect)", () => {
    const onSelect = vi.fn();
    render(<SelectableRow onSelect={onSelect}>Documents</SelectableRow>);
    fireEvent.keyDown(screen.getByRole("option"), { key: " " });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenLastCalledWith(true);
  });

  it("disabled does not emit onSelect on click or key, and exposes aria-disabled", () => {
    const onSelect = vi.fn();
    render(
      <SelectableRow disabled onSelect={onSelect}>
        Documents
      </SelectableRow>,
    );
    const row = screen.getByRole("option");
    expect(row.getAttribute("aria-disabled")).toBe("true");
    expect(row.getAttribute("tabindex")).toBe("-1");
    fireEvent.click(row);
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("is focusable (tabindex 0) when not disabled", () => {
    render(<SelectableRow>Documents</SelectableRow>);
    expect(screen.getByRole("option").getAttribute("tabindex")).toBe("0");
  });

  it("exposes value as data-value", () => {
    render(<SelectableRow value="docs">Documents</SelectableRow>);
    expect(screen.getByRole("option").getAttribute("data-value")).toBe("docs");
  });

  it("renders leading and trailing content", () => {
    const { container } = render(
      <SelectableRow
        leading={<span data-testid="lead">L</span>}
        trailing={<span data-testid="trail">T</span>}
      >
        Documents
      </SelectableRow>,
    );
    expect(container.querySelector(".st-selectableRow__leading")).toBeTruthy();
    expect(container.querySelector(".st-selectableRow__trailing")).toBeTruthy();
    expect(screen.getByTestId("lead")).toBeTruthy();
    expect(screen.getByTestId("trail")).toBeTruthy();
  });
});
