import { render, screen } from "@testing-library/svelte";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import Search from "./lib/Search.svelte";

describe("Search fluid mode", () => {
  it("does not add the fluid class by default (byte-identical wrapper)", () => {
    const { container } = render(Search, { props: { label: "Recherche", placeholder: "Filter" } });
    const field = container.querySelector(".st-field");
    expect(field).not.toBeNull();
    expect(field?.classList.contains("st-search--fluid")).toBe(false);
  });

  it("adds the st-search--fluid class on the field wrapper when fluid is true", () => {
    const { container } = render(Search, {
      props: { label: "Rechercher une ville…", fluid: true }
    });
    const field = container.querySelector(".st-field");
    expect(field?.classList.contains("st-search--fluid")).toBe(true);
  });

  it("keeps the consumer class alongside the fluid class", () => {
    const { container } = render(Search, {
      props: { label: "Search entities…", fluid: true, class: "drawer-search" }
    });
    const field = container.querySelector(".st-field");
    expect(field?.classList.contains("st-search--fluid")).toBe(true);
    expect(field?.classList.contains("drawer-search")).toBe(true);
  });

  it("lifts the max-width cap in fluid mode via a scoped rule", () => {
    // jsdom does not resolve scoped Svelte <style> max-width through getComputedStyle,
    // so assert the source rule that neutralises the cap (mirrors NumberInput test).
    const source = readFileSync("src/lib/Search.svelte", "utf-8");
    expect(source).toMatch(
      /\.st-field\.st-search--fluid\s*\{[^}]*max-width:\s*none;[^}]*width:\s*100%;/s
    );
  });

  it("still renders an accessible searchbox in fluid mode", () => {
    render(Search, { props: { label: "Recherche", fluid: true, placeholder: "Filter" } });
    const box = screen.getByRole("searchbox", { name: "Recherche" }) as HTMLInputElement;
    expect(box.type).toBe("search");
    expect(box.placeholder).toBe("Filter");
  });
});
