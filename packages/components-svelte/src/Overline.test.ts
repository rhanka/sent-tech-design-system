import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Overline from "./lib/Overline.svelte";

const text = (label: string) =>
  createRawSnippet(() => ({ render: () => `<span>${label}</span>` }));

const root = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".st-overline");

describe("Overline", () => {
  it("renders a span by default with the slotted text", () => {
    const { container } = render(Overline, { props: { children: text("DOCUMENTATION") } });
    const el = root(container);
    expect(el).toBeTruthy();
    expect(el?.tagName).toBe("SPAN");
    expect(el?.textContent).toContain("DOCUMENTATION");
  });

  it("renders the requested tag via `as`", () => {
    for (const [as, tag] of [
      ["div", "DIV"],
      ["h2", "H2"],
      ["h3", "H3"]
    ] as const) {
      const { container } = render(Overline, { props: { as, children: text("SIGNAUX") } });
      expect(root(container)?.tagName).toBe(tag);
    }
  });

  it("carries the st-overline class (scoped small-caps styling lives there)", () => {
    // jsdom does not apply scoped <style> to getComputedStyle, so the visual
    // uppercase transform is asserted via the contract class, not computed style.
    const { container } = render(Overline, { props: { children: text("communities") } });
    expect(root(container)?.classList.contains("st-overline")).toBe(true);
  });

  it("merges a consumer class onto the root", () => {
    const { container } = render(Overline, {
      props: { class: "x-extra", children: text("DOCUMENTS SOURCES") }
    });
    const el = root(container);
    expect(el?.classList.contains("st-overline")).toBe(true);
    expect(el?.classList.contains("x-extra")).toBe(true);
  });

  it("forwards arbitrary attributes via ...rest", () => {
    const { container } = render(Overline, {
      props: { id: "sec-label", children: text("SECTION") }
    });
    expect(root(container)?.getAttribute("id")).toBe("sec-label");
  });
});
