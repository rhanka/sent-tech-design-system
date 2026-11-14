import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { createRef } from "preact";
import { useState } from "preact/hooks";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelectableListContext, SelectableListVersionContext, SelectableRow } from "./SelectableRow.js";
import type { SelectableListContextValue } from "./SelectableRow.js";

afterEach(cleanup);

describe("SelectableRow (Preact), standalone", () => {
  it("renders with role=button, the row class and tabindex 0", () => {
    const { container } = render(<SelectableRow value="docs">Documents</SelectableRow>);
    const row = screen.getByRole("button");
    expect(row.className).toBe("st-selectableRow");
    expect(row.getAttribute("tabindex")).toBe("0");
    expect(row.getAttribute("aria-pressed")).toBe("false");
    expect(row.getAttribute("data-value")).toBe("docs");
    expect(container.querySelector(".st-selectableRow__content")?.textContent).toBe("Documents");
  });

  it("reflects the selected state and the opt-in modifiers", () => {
    render(
      <SelectableRow selected accentBar caption="12 files" leading={<i>L</i>} trailing={<i>T</i>}>
        Documents
      </SelectableRow>,
    );
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-pressed")).toBe("true");
    expect(row.className).toBe(
      "st-selectableRow st-selectableRow--selected st-selectableRow--accentBar st-selectableRow--hasCaption",
    );
    expect(row.querySelector(".st-selectableRow__leading")?.textContent).toBe("L");
    expect(row.querySelector(".st-selectableRow__trailing")?.textContent).toBe("T");
    expect(row.querySelector(".st-selectableRow__content--stacked .st-selectableRow__label")?.textContent).toBe("Documents");
    expect(row.querySelector(".st-selectableRow__caption")?.textContent).toBe("12 files");
  });

  it("toggles through click, Enter and Space, and stays in sync when controlled", () => {
    const seen = vi.fn();
    function Controlled() {
      const [selected, setSelected] = useState(false);
      return (
        <SelectableRow
          selected={selected}
          onSelect={(next) => {
            seen(next);
            setSelected(next);
          }}
        >
          Documents
        </SelectableRow>
      );
    }
    render(<Controlled />);
    const row = screen.getByRole("button");
    fireEvent.click(row);
    expect(row.getAttribute("aria-pressed")).toBe("true");
    fireEvent.keyDown(row, { key: "Enter" });
    expect(row.getAttribute("aria-pressed")).toBe("false");
    fireEvent.keyDown(row, { key: " " });
    expect(row.getAttribute("aria-pressed")).toBe("true");
    expect(seen.mock.calls.map(([next]) => next)).toEqual([true, false, true]);
  });

  it("is inert when disabled: no onSelect, aria-disabled, tabindex -1", () => {
    const onSelect = vi.fn();
    render(
      <SelectableRow disabled onSelect={onSelect}>
        Documents
      </SelectableRow>,
    );
    const row = screen.getByRole("button");
    fireEvent.click(row);
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onSelect).not.toHaveBeenCalled();
    expect(row.getAttribute("aria-disabled")).toBe("true");
    expect(row.getAttribute("tabindex")).toBe("-1");
    expect(row.className).toContain("st-selectableRow--disabled");
  });

  it("renders an anchor for `href` and lets the role be overridden", () => {
    render(
      <>
        <SelectableRow href="/docs">Docs</SelectableRow>
        <SelectableRow role="option" selected>
          Option
        </SelectableRow>
      </>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("aria-pressed")).toBeNull();
    const option = screen.getByRole("option", { name: "Option" });
    expect(option.getAttribute("aria-selected")).toBe("true");
    expect(option.getAttribute("aria-pressed")).toBeNull();
  });

  it("forwards its ref (object and callback) to the row element", () => {
    const objectRef = createRef<HTMLElement>();
    const callbackRef = vi.fn();
    render(
      <>
        <SelectableRow ref={objectRef}>One</SelectableRow>
        <SelectableRow ref={callbackRef}>Two</SelectableRow>
      </>,
    );
    expect(objectRef.current).toBe(screen.getByRole("button", { name: "One" }));
    expect(callbackRef).toHaveBeenCalledWith(screen.getByRole("button", { name: "Two" }));
  });
});

describe("SelectableRow (Preact), managed through context", () => {
  /** Minimal list: the two contexts a real `SelectableList` provides. */
  function Harness({ spy }: { spy: Pick<SelectableListContextValue, "register" | "navigate" | "focusRow"> }) {
    const [selected, setSelected] = useState<HTMLElement | null>(null);
    const [version, setVersion] = useState(0);
    const [actions] = useState(() => {
      let current: HTMLElement | null = null;
      const value: SelectableListContextValue = {
        managed: true,
        itemRole: "option",
        register: spy.register,
        isSelected: (el) => current === el,
        isTabStop: (el) => current === el,
        activate: (el) => {
          current = el;
          setSelected(el);
          setVersion((count) => count + 1);
        },
        focusRow: spy.focusRow,
        navigate: spy.navigate,
      };
      return value;
    });
    return (
      <SelectableListContext.Provider value={actions}>
        <SelectableListVersionContext.Provider value={version}>
          <div role="listbox" data-selected={selected?.getAttribute("data-value") ?? ""}>
            <SelectableRow value="a">Alpha</SelectableRow>
            <SelectableRow value="b">Beta</SelectableRow>
          </div>
        </SelectableListVersionContext.Provider>
      </SelectableListContext.Provider>
    );
  }

  it("takes role, selection and tab stop from the list and re-renders on a version bump", () => {
    const unregister = vi.fn();
    const spy = { register: vi.fn(() => unregister), navigate: vi.fn(), focusRow: vi.fn() };
    const { unmount } = render(<Harness spy={spy} />);
    const alpha = screen.getByRole("option", { name: "Alpha" });
    const beta = screen.getByRole("option", { name: "Beta" });

    expect(spy.register).toHaveBeenCalledTimes(2);
    expect(spy.register).toHaveBeenCalledWith(alpha, "a", false);
    expect(alpha.getAttribute("aria-selected")).toBe("false");
    expect(alpha.getAttribute("aria-pressed")).toBeNull();

    fireEvent.click(beta);
    expect(beta.getAttribute("aria-selected")).toBe("true");
    expect(beta.getAttribute("tabindex")).toBe("0");
    expect(beta.className).toContain("st-selectableRow--selected");
    expect(alpha.getAttribute("aria-selected")).toBe("false");
    expect(alpha.getAttribute("tabindex")).toBe("-1");
    expect(screen.getByRole("listbox").getAttribute("data-selected")).toBe("b");

    fireEvent.keyDown(beta, { key: "ArrowDown" });
    expect(spy.navigate).toHaveBeenLastCalledWith(beta, "ArrowDown");
    fireEvent.focus(alpha);
    expect(spy.focusRow).toHaveBeenLastCalledWith(alpha);

    unmount();
    expect(unregister).toHaveBeenCalledTimes(2);
  });
});
