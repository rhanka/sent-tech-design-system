import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox.js";
import { Search } from "./Search.js";

describe("Checkbox — description / trailing extensions", () => {
  it("renders without description or trailing (backward compatible)", () => {
    const { container } = render(<Checkbox label="Active" />);
    expect(container.querySelector(".st-choice__label")?.textContent).toBe("Active");
    expect(container.querySelector(".st-choice__description")).toBeNull();
    expect(container.querySelector(".st-choice__trailing")).toBeNull();
    expect(container.querySelector(".st-choice--described")).toBeNull();
    // existing class contract is preserved
    expect(container.querySelector(".st-choice__input")).toBeTruthy();
  });

  it("renders a description, flags the row, and wires aria-describedby to its id", () => {
    const { container } = render(<Checkbox label="Critique" description="Signaux de gravité haute" />);
    const desc = container.querySelector<HTMLElement>(".st-choice__description");
    expect(desc?.textContent).toBe("Signaux de gravité haute");
    expect(container.querySelector(".st-choice--described")).toBeTruthy();
    const input = container.querySelector<HTMLInputElement>(".st-choice__input");
    expect(input?.getAttribute("aria-describedby")).toBe(desc?.id);
    expect(desc?.id).toBeTruthy();
  });

  it("merges a consumer aria-describedby with the description id", () => {
    const { container } = render(
      <Checkbox label="L" description="D" aria-describedby="consumer-hint" />,
    );
    const desc = container.querySelector<HTMLElement>(".st-choice__description");
    const input = container.querySelector<HTMLInputElement>(".st-choice__input");
    const value = input?.getAttribute("aria-describedby") ?? "";
    expect(value.split(" ")).toContain("consumer-hint");
    expect(value.split(" ")).toContain(desc?.id);
  });

  it("preserves a consumer aria-describedby untouched when there is no description", () => {
    const { container } = render(<Checkbox label="L" aria-describedby="consumer-hint" />);
    const input = container.querySelector<HTMLInputElement>(".st-choice__input");
    expect(input?.getAttribute("aria-describedby")).toBe("consumer-hint");
  });

  it("renders a trailing slot pushed to the row end", () => {
    const { container } = render(
      <Checkbox label="Erreurs" trailing={<span data-testid="count">42</span>} />,
    );
    const trailing = container.querySelector(".st-choice__trailing");
    expect(trailing).toBeTruthy();
    expect(trailing?.querySelector('[data-testid="count"]')?.textContent).toBe("42");
  });
});

describe("Search — fluid extension", () => {
  it("does not add the fluid modifier by default", () => {
    const { container } = render(<Search label="Search" />);
    expect(container.querySelector(".st-search--fluid")).toBeNull();
    // root class contract preserved
    expect(container.querySelector(".st-search--md")).toBeTruthy();
    expect(container.querySelector(".st-search__input")).toBeTruthy();
  });

  it("adds st-search--fluid on the root when fluid is set", () => {
    const { container } = render(<Search label="Search" fluid />);
    const root = container.querySelector(".st-search");
    expect(root?.classList.contains("st-search--fluid")).toBe(true);
  });
});
