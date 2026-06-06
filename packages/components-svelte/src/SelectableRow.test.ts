import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import SelectableRow from "./lib/SelectableRow.svelte";

const labelChildren = createRawSnippet(() => ({
  render: () => "<span>Documents</span>"
}));

describe("SelectableRow", () => {
  // Le défaut est role="button" (standalone) — "option" n'est valide qu'à l'intérieur
  // d'un listbox. En mode button, l'état selected est communiqué via aria-pressed.
  it("renders with role=button (standalone default) and the row class", () => {
    const { container } = render(SelectableRow, {
      props: { children: labelChildren }
    });
    const row = screen.getByRole("button");
    expect(row).toBeTruthy();
    expect(row.className).toContain("st-selectableRow");
    expect(container.textContent).toContain("Documents");
  });

  it("selected applies aria-pressed=true and the selected class (role=button)", () => {
    render(SelectableRow, { props: { selected: true, children: labelChildren } });
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-pressed")).toBe("true");
    expect(row.className).toContain("st-selectableRow--selected");
  });

  it("is not selected by default (aria-pressed=false, no selected class)", () => {
    render(SelectableRow, { props: { children: labelChildren } });
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-pressed")).toBe("false");
    expect(row.className).not.toContain("st-selectableRow--selected");
  });

  it("click toggles selection and calls onselect with the new state", async () => {
    const onselect = vi.fn();
    render(SelectableRow, { props: { onselect, children: labelChildren } });
    const row = screen.getByRole("button");
    await fireEvent.click(row);
    expect(onselect).toHaveBeenCalledTimes(1);
    expect(onselect).toHaveBeenLastCalledWith(true);
    expect(row.getAttribute("aria-pressed")).toBe("true");
    // Toggle back off.
    await fireEvent.click(row);
    expect(onselect).toHaveBeenLastCalledWith(false);
    expect(row.getAttribute("aria-pressed")).toBe("false");
  });

  it("Enter key selects (calls onselect)", async () => {
    const onselect = vi.fn();
    render(SelectableRow, { props: { onselect, children: labelChildren } });
    const row = screen.getByRole("button");
    await fireEvent.keyDown(row, { key: "Enter" });
    expect(onselect).toHaveBeenCalledTimes(1);
    expect(onselect).toHaveBeenLastCalledWith(true);
  });

  it("Space key selects (calls onselect)", async () => {
    const onselect = vi.fn();
    render(SelectableRow, { props: { onselect, children: labelChildren } });
    const row = screen.getByRole("button");
    await fireEvent.keyDown(row, { key: " " });
    expect(onselect).toHaveBeenCalledTimes(1);
    expect(onselect).toHaveBeenLastCalledWith(true);
  });

  it("disabled does not emit onselect on click or key, and exposes aria-disabled", async () => {
    const onselect = vi.fn();
    render(SelectableRow, {
      props: { disabled: true, onselect, children: labelChildren }
    });
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-disabled")).toBe("true");
    expect(row.getAttribute("tabindex")).toBe("-1");
    await fireEvent.click(row);
    await fireEvent.keyDown(row, { key: "Enter" });
    expect(onselect).not.toHaveBeenCalled();
  });

  it("is focusable (tabindex 0) when not disabled", () => {
    render(SelectableRow, { props: { children: labelChildren } });
    const row = screen.getByRole("button");
    expect(row.getAttribute("tabindex")).toBe("0");
  });

  it("exposes value as data-value", () => {
    render(SelectableRow, { props: { value: "docs", children: labelChildren } });
    const row = screen.getByRole("button");
    expect(row.getAttribute("data-value")).toBe("docs");
  });

  it("renders leading and trailing snippets", () => {
    const leading = createRawSnippet(() => ({
      render: () => '<span data-testid="lead">L</span>'
    }));
    const trailing = createRawSnippet(() => ({
      render: () => '<span data-testid="trail">T</span>'
    }));
    const { container } = render(SelectableRow, {
      props: { leading, trailing, children: labelChildren }
    });
    expect(container.querySelector(".st-selectableRow__leading")).toBeTruthy();
    expect(container.querySelector(".st-selectableRow__trailing")).toBeTruthy();
    expect(screen.getByTestId("lead")).toBeTruthy();
    expect(screen.getByTestId("trail")).toBeTruthy();
  });

  it("does NOT add the accent-bar modifier by default (2 signals only)", () => {
    render(SelectableRow, { props: { selected: true, children: labelChildren } });
    const row = screen.getByRole("button");
    expect(row.className).not.toContain("st-selectableRow--accentBar");
  });

  it("adds the accent-bar modifier when accentBar is opted in", () => {
    render(SelectableRow, {
      props: { selected: true, accentBar: true, children: labelChildren }
    });
    const row = screen.getByRole("button");
    expect(row.className).toContain("st-selectableRow--accentBar");
    expect(row.className).toContain("st-selectableRow--selected");
  });

  it("honours a custom role for a standalone row", () => {
    render(SelectableRow, { props: { role: "menuitemcheckbox", children: labelChildren } });
    const row = screen.getByRole("menuitemcheckbox");
    expect(row).toBeTruthy();
    // aria-selected et aria-pressed ne sont pas exposés pour un rôle custom.
    expect(row.getAttribute("aria-selected")).toBeNull();
    expect(row.getAttribute("aria-pressed")).toBeNull();
  });

  // --- a11y invariant: aria-pressed (point 3 de la revue Codex) ---
  it("a11y invariant: role=button → aria-pressed reflète selected (true/false)", () => {
    const { rerender } = render(SelectableRow, {
      props: { selected: false, children: labelChildren }
    });
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-pressed")).toBe("false");
    // Pas d'aria-selected sur role=button.
    expect(row.getAttribute("aria-selected")).toBeNull();
    // Après sélection.
    rerender({ selected: true, children: labelChildren });
    expect(row.getAttribute("aria-pressed")).toBe("true");
    expect(row.getAttribute("aria-selected")).toBeNull();
  });

  it("a11y invariant: role=option → aria-selected exposé, pas aria-pressed", () => {
    render(SelectableRow, { props: { role: "option", selected: true, children: labelChildren } });
    const row = screen.getByRole("option");
    expect(row.getAttribute("aria-selected")).toBe("true");
    expect(row.getAttribute("aria-pressed")).toBeNull();
  });
});
