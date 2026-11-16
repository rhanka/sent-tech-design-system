// React leg only. Counterpart of the Preact test "becomes the roving tab stop
// when a focusable child of `trailing` takes focus": the emitted row, driven
// by the emitted `SelectableList`, must keep React's behaviour, where the
// focus of a descendant bubbles to the row. No `components-react` test covers
// that case.
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SelectableList } from "../.react-emit/src/SelectableList.js";
import * as barrel from "../../components-react/src/index.js";
import { SelectableRow } from "../.react-emit/src/SelectableRow.js";

afterEach(cleanup);

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
