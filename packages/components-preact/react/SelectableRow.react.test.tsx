// React leg only. The emitted row must keep the `components-react` API and
// a11y contract with plain props (the React twin collapses `MaybeSignal<T>`
// to `T`): standalone selected/disabled/accentBar/className plus the focus
// counterpart of the Preact test "becomes the roving tab stop when a
// focusable child of `trailing` takes focus" (no `components-react` test
// covers that case).
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelectableList } from "../.react-emit/src/SelectableList.js";
import * as barrel from "../../components-react/src/index.js";
import { SelectableRow } from "../.react-emit/src/SelectableRow.js";

afterEach(cleanup);

describe("SelectableRow (React emission), plain-prop parity", () => {
  it("is the module the components-react barrel and SelectableList use", () => {
    expect(barrel.SelectableRow).toBe(SelectableRow);
    expect(barrel.SelectableList).toBe(SelectableList);
  });

  it("reflects selected, accentBar and className with plain props", () => {
    render(
      <SelectableRow value="a" selected accentBar className="extra">
        Alpha
      </SelectableRow>,
    );
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-pressed")).toBe("true");
    expect(row.className).toContain("st-selectableRow--selected");
    expect(row.className).toContain("st-selectableRow--accentBar");
    expect(row.className).toContain("extra");
  });

  it("stays inert with plain disabled and toggles through onSelect when enabled", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <SelectableRow value="a" onSelect={onSelect}>
        Alpha
      </SelectableRow>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenLastCalledWith(true);
    rerender(
      <SelectableRow value="a" disabled onSelect={onSelect}>
        Alpha
      </SelectableRow>,
    );
    const row = screen.getByRole("button");
    expect(row.getAttribute("tabindex")).toBe("-1");
    expect(row.getAttribute("aria-disabled")).toBe("true");
    expect(row.className).toContain("st-selectableRow--disabled");
    fireEvent.click(row);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe("SelectableRow (React emission), focus inside a row", () => {
  it("is the module the components-react barrel and SelectableList use", () => {
    expect(barrel.SelectableRow).toBe(SelectableRow);
    expect(barrel.SelectableList).toBe(SelectableList);
  });

  it("becomes the roving tab stop when a focusable child of `trailing` takes focus", () => {
    render(
      <SelectableList label="Items">
        <SelectableRow value="a">Alpha</SelectableRow>
        <SelectableRow value="b" trailing={<button type="button">More</button>}>
          Beta
        </SelectableRow>
        <SelectableRow value="c" disabled trailing={<button type="button">Locked</button>}>
          Gamma
        </SelectableRow>
      </SelectableList>,
    );
    const alpha = screen.getByRole("option", { name: "Alpha" });
    const beta = screen.getByRole("option", { name: /Beta/ });
    expect(alpha.getAttribute("tabindex")).toBe("0");
    expect(beta.getAttribute("tabindex")).toBe("-1");

    // Focus lands on the button inside the row, not on the row.
    const more = screen.getByRole("button", { name: "More" });
    act(() => more.focus());
    expect(document.activeElement).toBe(more);
    expect(beta.getAttribute("tabindex")).toBe("0");
    expect(alpha.getAttribute("tabindex")).toBe("-1");

    // A disabled row stays out of the roving, whatever takes focus inside it.
    act(() => screen.getByRole("button", { name: "Locked" }).focus());
    expect(beta.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("option", { name: /Gamma/ }).getAttribute("tabindex")).toBe("-1");
  });
});
