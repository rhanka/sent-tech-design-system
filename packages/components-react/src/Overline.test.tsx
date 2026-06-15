import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Overline } from "./Overline.js";

describe("Overline", () => {
  it("renders a span by default with the st-overline class", () => {
    const { container } = render(<Overline>Documentation</Overline>);
    const el = container.querySelector(".st-overline");
    expect(el?.tagName).toBe("SPAN");
    expect(el?.textContent).toBe("Documentation");
  });

  it("renders the requested tag via `as`", () => {
    const { container } = render(<Overline as="h2">Signaux</Overline>);
    const el = container.querySelector(".st-overline");
    expect(el?.tagName).toBe("H2");
  });

  it("merges a consumer className and forwards rest props", () => {
    const { container } = render(
      <Overline className="extra" data-testid="ov" id="ov-1">
        Communities
      </Overline>,
    );
    const el = container.querySelector(".st-overline");
    expect(el?.classList.contains("extra")).toBe(true);
    expect(el?.getAttribute("data-testid")).toBe("ov");
    expect(el?.getAttribute("id")).toBe("ov-1");
  });
});
