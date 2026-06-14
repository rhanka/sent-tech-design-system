import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Badge from "./lib/Badge.svelte";

const count = (n: number | string) =>
  createRawSnippet(() => ({ render: () => `${n}` }));

const badge = (container: Element) => container.querySelector(".st-badge") as HTMLElement;

describe("Badge — base (byte-identity)", () => {
  it("default render carries the pill + md modifiers and no circle/sm class", () => {
    const { container } = render(Badge, { props: { children: count(7) } });
    const el = badge(container);
    expect(el).toBeTruthy();
    // Defaults (shape=pill, size=md) are additive modifier classes with no CSS of
    // their own, so the base render is byte-identical; the circle/sm variants are
    // absent.
    expect(el.classList.contains("st-badge--neutral")).toBe(true);
    expect(el.classList.contains("st-badge--pill")).toBe(true);
    expect(el.classList.contains("st-badge--md")).toBe(true);
    expect(el.classList.contains("st-badge--circle")).toBe(false);
    expect(el.classList.contains("st-badge--sm")).toBe(false);
    expect(el.textContent).toContain("7");
  });
});

describe("Badge — shape", () => {
  it('shape="circle" toggles st-badge--circle (and keeps the tone)', () => {
    const { container } = render(Badge, {
      props: { shape: "circle", tone: "info", children: count(42) }
    });
    const el = badge(container);
    expect(el.classList.contains("st-badge--circle")).toBe(true);
    expect(el.classList.contains("st-badge--pill")).toBe(false);
    // Tone class still applies under the circle shape.
    expect(el.classList.contains("st-badge--info")).toBe(true);
  });

  it("circle accepts 3+ digit content without capping (no 99+ truncation)", () => {
    const { container } = render(Badge, {
      props: { shape: "circle", children: count(1280) }
    });
    // The number is rendered verbatim; the CSS degrades the box to a rounded-rect
    // (never clips), so large consumer counts stay legible.
    expect(badge(container).textContent).toContain("1280");
  });
});

describe("Badge — size", () => {
  it('size="sm" toggles st-badge--sm', () => {
    const { container } = render(Badge, { props: { size: "sm", children: count(3) } });
    const el = badge(container);
    expect(el.classList.contains("st-badge--sm")).toBe(true);
    expect(el.classList.contains("st-badge--md")).toBe(false);
  });
});

describe("Badge — a11y / passthrough", () => {
  it("forwards aria-label via ...rest (ambiguous bare-count guidance)", () => {
    const { container } = render(Badge, {
      props: { shape: "circle", "aria-label": "128 entities", children: count(128) }
    });
    expect(badge(container).getAttribute("aria-label")).toBe("128 entities");
  });
});
