import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { ErrorSummary } from "./ErrorSummary.js";

const mounted: VueWrapper[] = [];
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

describe("ErrorSummary", () => {
  it("renders the heading and one link per error", () => {
    const wrapper = track(
      mount(ErrorSummary, {
        props: {
          heading: "Il y a un problème",
          errors: [
            { href: "#nom", text: "Saisissez votre nom" },
            { href: "#courriel", text: "Courriel invalide" },
          ],
        },
      }),
    );
    const root = wrapper.find(".st-error-summary");
    expect(root.exists()).toBe(true);
    expect(root.element.tagName.toLowerCase()).toBe("section");
    expect(root.attributes("role")).toBe("alert");
    expect(wrapper.find(".st-error-summary__heading").text()).toBe("Il y a un problème");
    const links = wrapper.findAll(".st-error-summary__link");
    expect(links.length).toBe(2);
    expect(links[0].attributes("href")).toBe("#nom");
    expect(links[1].text()).toBe("Courriel invalide");
  });

  it("uses a default heading and renders no list with no errors", () => {
    const wrapper = track(mount(ErrorSummary));
    expect(wrapper.find(".st-error-summary__heading").text()).toBe("There was a problem");
    expect(wrapper.find(".st-error-summary__list").exists()).toBe(false);
  });
});
