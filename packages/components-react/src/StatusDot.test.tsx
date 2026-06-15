import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusDot } from "./StatusDot.js";

const dot = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".st-statusDot__dot");

describe("StatusDot", () => {
  it("defaults to the neutral tone and an 8px dot", () => {
    const { container } = render(<StatusDot />);
    const el = dot(container);
    expect(el?.classList.contains("st-statusDot__dot--neutral")).toBe(true);
    expect(el?.style.width).toBe("8px");
    expect(el?.style.height).toBe("8px");
  });

  it("applies a semantic tone class", () => {
    const { container } = render(<StatusDot tone="success" />);
    expect(dot(container)?.classList.contains("st-statusDot__dot--success")).toBe(true);
  });

  it("color prevails over tone: inline background, no tone class", () => {
    const { container } = render(<StatusDot tone="success" color="#2563eb" />);
    const el = dot(container);
    expect(el?.style.backgroundColor).toContain("rgb(37, 99, 235)");
    expect(el?.classList.contains("st-statusDot__dot--success")).toBe(false);
    expect(el?.className).not.toContain("st-statusDot__dot--");
  });

  it("accepts a CSS token as the color", () => {
    const { container } = render(<StatusDot color="var(--st-semantic-feedback-info)" />);
    expect(dot(container)?.style.backgroundColor).toContain("var(--st-semantic-feedback-info)");
  });

  it("applies the size as inline width/height in px", () => {
    const { container } = render(<StatusDot size={14} />);
    expect(dot(container)?.style.width).toBe("14px");
    expect(dot(container)?.style.height).toBe("14px");
  });

  it("decorative (no label): role=img with aria-label from tone, then color", () => {
    const { container: byTone } = render(<StatusDot tone="warning" />);
    const a = dot(byTone);
    expect(a?.getAttribute("role")).toBe("img");
    expect(a?.getAttribute("aria-label")).toBe("warning");

    const { container: byColor } = render(<StatusDot color="#abcdef" />);
    expect(dot(byColor)?.getAttribute("aria-label")).toBe("#abcdef");
  });

  it("with label: renders the text and hides the decorative dot", () => {
    const { container } = render(<StatusDot tone="success" label="EN DIRECT" />);
    expect(container.querySelector(".st-statusDot__label")?.textContent).toBe("EN DIRECT");
    const el = dot(container);
    expect(el?.getAttribute("aria-hidden")).toBe("true");
    expect(el?.getAttribute("role")).toBeNull();
  });

  it("adds the pulse class only when pulse is set", () => {
    const { container: on } = render(<StatusDot pulse />);
    expect(dot(on)?.classList.contains("st-statusDot__dot--pulse")).toBe(true);
    const { container: off } = render(<StatusDot />);
    expect(dot(off)?.classList.contains("st-statusDot__dot--pulse")).toBe(false);
  });
});
