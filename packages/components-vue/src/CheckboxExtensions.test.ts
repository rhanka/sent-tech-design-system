import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { Checkbox } from "./Checkbox.js";

const root = (el: HTMLElement) =>
  el.classList.contains("st-choice") ? el : el.querySelector<HTMLElement>(".st-choice");

describe("Checkbox — description/trailing extensions (additive, backward-compatible)", () => {
  it("still renders a plain checkbox without the new props", () => {
    const wrapper = mount(Checkbox, { props: { label: "Accept" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-choice__label")?.textContent).toBe("Accept");
    expect(el.querySelector(".st-choice__description")).toBeNull();
    expect(el.querySelector(".st-choice__trailing")).toBeNull();
    expect(root(el)?.classList.contains("st-choice--described")).toBe(false);
  });

  it("renders a secondary muted description under the label and flags the row", () => {
    const wrapper = mount(Checkbox, {
      props: { label: "Filtre", description: "uniquement les actifs" },
    });
    const el = wrapper.element as HTMLElement;
    const desc = el.querySelector<HTMLElement>(".st-choice__description");
    expect(desc?.textContent).toBe("uniquement les actifs");
    expect(root(el)?.classList.contains("st-choice--described")).toBe(true);
  });

  it("wires the description into aria-describedby on the input", () => {
    const wrapper = mount(Checkbox, {
      props: { label: "Filtre", description: "hint" },
    });
    const el = wrapper.element as HTMLElement;
    const input = el.querySelector<HTMLInputElement>(".st-choice__input");
    const desc = el.querySelector<HTMLElement>(".st-choice__description");
    const describedBy = input?.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toBe(desc?.getAttribute("id"));
  });

  it("merges the description id with a consumer-provided aria-describedby", () => {
    const wrapper = mount(Checkbox, {
      props: { label: "Filtre", description: "hint" },
      attrs: { "aria-describedby": "consumer-id" },
    });
    const el = wrapper.element as HTMLElement;
    const input = el.querySelector<HTMLInputElement>(".st-choice__input");
    const describedBy = input?.getAttribute("aria-describedby") ?? "";
    expect(describedBy.split(" ")).toContain("consumer-id");
    expect(describedBy.split(" ").length).toBe(2);
  });

  it("renders a trailing slot pushed to the row end", () => {
    const wrapper = mount(Checkbox, {
      props: { label: "Catégorie" },
      slots: { trailing: () => h("span", { class: "x-count" }, "12") },
    });
    const el = wrapper.element as HTMLElement;
    const trailing = el.querySelector<HTMLElement>(".st-choice__trailing");
    expect(trailing).toBeTruthy();
    expect(trailing?.querySelector(".x-count")?.textContent).toBe("12");
  });
});
