import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Search } from "./Search.js";

const root = (el: HTMLElement) =>
  (el.classList.contains("st-search") ? el : el.querySelector<HTMLElement>(".st-search"));

describe("Search — fluid extension (additive, backward-compatible)", () => {
  it("does not apply the fluid modifier by default", () => {
    const wrapper = mount(Search);
    expect(root(wrapper.element as HTMLElement)?.classList.contains("st-search--fluid")).toBe(false);
  });

  it("applies the fluid modifier when fluid is set", () => {
    const wrapper = mount(Search, { props: { fluid: true } });
    expect(root(wrapper.element as HTMLElement)?.classList.contains("st-search--fluid")).toBe(true);
  });

  it("keeps the size and consumer classes alongside the fluid modifier", () => {
    const wrapper = mount(Search, { props: { fluid: true, size: "lg", class: "x-extra" } });
    const el = root(wrapper.element as HTMLElement);
    expect(el?.classList.contains("st-search--fluid")).toBe(true);
    expect(el?.classList.contains("st-search--lg")).toBe(true);
    expect(el?.classList.contains("x-extra")).toBe(true);
  });
});
