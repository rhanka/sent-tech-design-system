import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { NavSection } from "./NavSection.js";

const body = (text = "contenu de section") => () =>
  h("div", { class: "x-body" }, text);

const actionSlot = (label = "Ajouter") => () =>
  h("button", { type: "button", class: "x-action" }, label);

describe("NavSection", () => {
  it("renders the label via Overline (small-caps section heading)", () => {
    const wrapper = mount(NavSection, {
      props: { label: "DOCUMENTATION" },
      slots: { default: body() },
    });
    const overline = (wrapper.element as HTMLElement).querySelector(".st-overline");
    expect(overline).toBeTruthy();
    expect(overline?.textContent).toContain("DOCUMENTATION");
  });

  it("renders the slotted children content", () => {
    const wrapper = mount(NavSection, {
      props: { label: "SIGNAUX" },
      slots: { default: body("liste de signaux") },
    });
    expect(
      (wrapper.element as HTMLElement).querySelector(".x-body")?.textContent,
    ).toContain("liste de signaux");
  });

  it("renders a circle count badge when count is provided", () => {
    const wrapper = mount(NavSection, {
      props: { label: "COMMUNITIES", count: 12 },
      slots: { default: body() },
    });
    const badge = (wrapper.element as HTMLElement).querySelector(".st-badge");
    expect(badge).toBeTruthy();
    expect(badge?.classList.contains("st-badge--circle")).toBe(true);
    expect(badge?.textContent).toContain("12");
  });

  it("omits the count badge when count is undefined", () => {
    const wrapper = mount(NavSection, {
      props: { label: "Pastilles" },
      slots: { default: body() },
    });
    expect((wrapper.element as HTMLElement).querySelector(".st-badge")).toBeNull();
  });

  it("renders a count of 0 (falsy but present)", () => {
    const wrapper = mount(NavSection, {
      props: { label: "Zonage", count: 0 },
      slots: { default: body() },
    });
    const badge = (wrapper.element as HTMLElement).querySelector(".st-badge");
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain("0");
  });

  it("non-collapsible: renders a group titled by the Overline", () => {
    const wrapper = mount(NavSection, {
      props: { label: "Zonage / Potentiel" },
      slots: { default: body() },
    });
    const el = wrapper.element as HTMLElement;
    // The section root IS the wrapper element in @vue/test-utils.
    const group =
      el.getAttribute("role") === "group" ? el : el.querySelector('[role="group"]');
    expect(group).toBeTruthy();
    // The Overline carries the heading id referenced by aria-labelledby.
    const labelledby = group?.getAttribute("aria-labelledby");
    expect(labelledby).toBeTruthy();
    const heading = el.querySelector(`#${labelledby}`);
    expect(heading?.textContent).toContain("Zonage / Potentiel");
  });

  it("non-collapsible: renders the Overline as the requested heading tag", () => {
    const wrapper = mount(NavSection, {
      props: { label: "DOCUMENTATION", as: "h2" },
      slots: { default: body() },
    });
    const heading = (wrapper.element as HTMLElement).querySelector("h2.st-overline");
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toContain("DOCUMENTATION");
  });

  it("renders the action slot in the section header (foyer of the local action)", () => {
    const wrapper = mount(NavSection, {
      props: { label: "Pastilles" },
      slots: { default: body(), action: actionSlot("Ajouter une pastille") },
    });
    const action = (wrapper.element as HTMLElement).querySelector(
      ".st-navSection__action .x-action",
    );
    expect(action).toBeTruthy();
    expect(action?.textContent).toContain("Ajouter une pastille");
  });

  it("collapsible: renders a trigger with aria-expanded that toggles the content", async () => {
    const wrapper = mount(NavSection, {
      props: { label: "SIGNAUX", collapsible: true, open: true },
      slots: { default: body("signaux ouverts") },
    });
    const el = wrapper.element as HTMLElement;
    const trigger = wrapper.find(".st-collapsible__trigger");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(el.querySelector(".x-body")).toBeTruthy();

    await trigger.trigger("click");
    expect(wrapper.find(".st-collapsible__trigger").attributes("aria-expanded")).toBe("false");
    expect((wrapper.element as HTMLElement).querySelector(".x-body")).toBeNull();

    await wrapper.find(".st-collapsible__trigger").trigger("click");
    expect(wrapper.find(".st-collapsible__trigger").attributes("aria-expanded")).toBe("true");
    expect((wrapper.element as HTMLElement).querySelector(".x-body")).toBeTruthy();
  });

  it("collapsible: starts closed when open is false", () => {
    const wrapper = mount(NavSection, {
      props: { label: "SIGNAUX", collapsible: true, open: false },
      slots: { default: body() },
    });
    expect(wrapper.find(".st-collapsible__trigger").attributes("aria-expanded")).toBe("false");
    expect((wrapper.element as HTMLElement).querySelector(".x-body")).toBeNull();
  });

  it("collapsible: surfaces the count in the trigger", () => {
    const wrapper = mount(NavSection, {
      props: { label: "SIGNAUX", count: 7, collapsible: true, open: true },
      slots: { default: body() },
    });
    const badge = (wrapper.element as HTMLElement).querySelector(".st-badge--circle");
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain("7");
    // The badge sits in the trigger's trailing slot, before the chevron.
    expect(
      (wrapper.element as HTMLElement).querySelector(".st-collapsible__trailing .st-badge"),
    ).toBeTruthy();
  });

  it("merges a consumer class onto the root", () => {
    const wrapper = mount(NavSection, {
      props: { label: "DOCUMENTATION", class: "x-extra" },
      slots: { default: body() },
    });
    const root = (wrapper.element as HTMLElement).classList.contains("st-navSection")
      ? (wrapper.element as HTMLElement)
      : (wrapper.element as HTMLElement).querySelector<HTMLElement>(".st-navSection");
    expect(root).toBeTruthy();
    expect(root?.classList.contains("x-extra")).toBe(true);
  });
});
