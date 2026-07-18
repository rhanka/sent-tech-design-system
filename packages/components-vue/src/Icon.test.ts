import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Icon, ICON_NAMES } from "./Icon.js";

describe("Icon — canonical DS icon set", () => {
  it("renders an svg for every canonical name", () => {
    for (const name of ICON_NAMES) {
      const wrapper = mount(Icon, { props: { name } });
      expect(wrapper.find("svg").exists(), `expected an <svg> for icon "${name}"`).toBe(true);
      wrapper.unmount();
    }
  });

  it("defaults to size 18 and stroke-width 2.25 (DS-standard)", () => {
    const wrapper = mount(Icon, { props: { name: "settings" } });
    const svg = wrapper.find("svg");
    expect(svg.attributes("width")).toBe("18");
    expect(svg.attributes("height")).toBe("18");
    expect(svg.attributes("stroke-width")).toBe("2.25");
  });

  it("is decorative (aria-hidden) with no title", () => {
    const wrapper = mount(Icon, { props: { name: "close" } });
    expect(wrapper.find("svg").attributes("aria-hidden")).toBe("true");
  });

  it("exposes an accessible name when title is set", () => {
    const wrapper = mount(Icon, { props: { name: "eye", title: "Afficher" } });
    const svg = wrapper.find("svg");
    expect(svg.attributes("aria-hidden")).toBeUndefined();
    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-label")).toBe("Afficher");
  });
});
