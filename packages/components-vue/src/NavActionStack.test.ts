import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavActionStack } from "./NavActionStack.js";
import type { NavAction } from "./NavActionStack.js";

afterEach(() => {
  vi.restoreAllMocks();
});

const byRole = (el: HTMLElement, selector: string, name: string) =>
  Array.from(el.querySelectorAll<HTMLElement>(selector)).find(
    (node) => node.textContent?.trim() === name,
  );

describe("NavActionStack", () => {
  it("renders every action as a control", () => {
    const actions: NavAction[] = [
      { label: "Exporter", kind: "primary" },
      { label: "Importer", kind: "secondary" },
      { label: "Éditeur", kind: "ghost" },
    ];
    const wrapper = mount(NavActionStack, { props: { actions, label: "Actions du drawer" } });
    const el = wrapper.element as HTMLElement;

    expect(byRole(el, "button", "Exporter")).toBeTruthy();
    expect(byRole(el, "button", "Importer")).toBeTruthy();
    expect(byRole(el, "button", "Éditeur")).toBeTruthy();
    expect(el.getAttribute("role")).toBe("group");
    expect(el.getAttribute("aria-label")).toBe("Actions du drawer");
  });

  it("maps kind to the matching Button variant", () => {
    const actions: NavAction[] = [
      { label: "Primaire", kind: "primary" },
      { label: "Secondaire", kind: "secondary" },
      { label: "Discret", kind: "ghost" },
    ];
    const wrapper = mount(NavActionStack, { props: { actions } });
    const el = wrapper.element as HTMLElement;

    expect(byRole(el, "button", "Primaire")?.className).toContain("st-button--primary");
    expect(byRole(el, "button", "Secondaire")?.className).toContain("st-button--secondary");
    expect(byRole(el, "button", "Discret")?.className).toContain("st-button--ghost");
  });

  it("defaults actions without a kind to secondary (never a stray primary)", () => {
    const wrapper = mount(NavActionStack, { props: { actions: [{ label: "Sans kind" }] } });
    expect(byRole(wrapper.element as HTMLElement, "button", "Sans kind")?.className).toContain(
      "st-button--secondary",
    );
  });

  it("keeps only one primary: extra primaries are degraded to secondary and warned", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const actions: NavAction[] = [
      { label: "Premier", kind: "primary" },
      { label: "Second", kind: "primary" },
    ];
    const wrapper = mount(NavActionStack, { props: { actions } });
    const el = wrapper.element as HTMLElement;

    expect(byRole(el, "button", "Premier")?.className).toContain("st-button--primary");
    const second = byRole(el, "button", "Second");
    expect(second?.className).toContain("st-button--secondary");
    expect(second?.className).not.toContain("st-button--primary");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("primary");
  });

  it("renders the dangerZone separately, in danger tone, under its overline label", () => {
    const wrapper = mount(NavActionStack, {
      props: {
        actions: [{ label: "Exporter", kind: "primary" }],
        dangerZone: { label: "Supprimer le bien" },
      },
    });
    const el = wrapper.element as HTMLElement;

    const danger = byRole(el, "button", "Supprimer le bien");
    expect(danger?.className).toContain("st-button--danger");
    const dangerGroup = el.querySelector<HTMLElement>(".st-navActionStack__danger");
    expect(dangerGroup?.getAttribute("role")).toBe("group");
    expect(dangerGroup?.getAttribute("aria-label")).toBe("Zone sensible");
    expect(el.querySelector(".st-navActionStack__dangerLabel")?.textContent).toBe("Zone sensible");
  });

  it("honours a custom dangerLabel", () => {
    const wrapper = mount(NavActionStack, {
      props: { dangerZone: { label: "Purger" }, dangerLabel: "Irréversible" },
    });
    const el = wrapper.element as HTMLElement;
    const dangerGroup = el.querySelector<HTMLElement>(".st-navActionStack__danger");
    expect(dangerGroup?.getAttribute("aria-label")).toBe("Irréversible");
    expect(el.querySelector(".st-navActionStack__dangerLabel")?.textContent).toBe("Irréversible");
  });

  it("renders an action with an href as a link, not a button", () => {
    const wrapper = mount(NavActionStack, {
      props: { actions: [{ label: "Ouvrir l'éditeur", href: "/editor", kind: "secondary" }] },
    });
    const el = wrapper.element as HTMLElement;
    const link = el.querySelector<HTMLAnchorElement>("a.st-navActionStack__item");
    expect(link?.getAttribute("href")).toBe("/editor");
    expect(link?.textContent?.trim()).toBe("Ouvrir l'éditeur");
    expect(link?.className).toContain("st-button--secondary");
  });

  it("applies the orientation modifier on the root", () => {
    const horizontal = mount(NavActionStack, {
      props: { actions: [{ label: "A", kind: "primary" }], orientation: "horizontal" },
    });
    expect(
      (horizontal.element as HTMLElement).classList.contains("st-navActionStack--horizontal"),
    ).toBe(true);

    const vertical = mount(NavActionStack, {
      props: { actions: [{ label: "B", kind: "primary" }], orientation: "vertical" },
    });
    expect(
      (vertical.element as HTMLElement).classList.contains("st-navActionStack--vertical"),
    ).toBe(true);
  });
});
