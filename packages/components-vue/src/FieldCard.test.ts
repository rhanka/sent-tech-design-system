import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { FieldCard } from "./FieldCard.js";

const mounted: VueWrapper[] = [];
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

describe("FieldCard", () => {
  it("renders the label and body in a section, bordered by default", () => {
    const wrapper = track(
      mount(FieldCard, {
        props: { label: "Coordonnées" },
        slots: { default: () => h("p", "Corps") },
      }),
    );
    const root = wrapper.find(".st-fieldCard");
    expect(root.element.tagName.toLowerCase()).toBe("section");
    expect(root.classes()).toContain("st-fieldCard--bordered");
    expect(wrapper.find(".st-fieldCard__label").text()).toBe("Coordonnées");
    expect(wrapper.find(".st-fieldCard__body").text()).toContain("Corps");
  });

  it("applies the variant modifier class", () => {
    const wrapper = track(mount(FieldCard, { props: { label: "Plain", variant: "plain" } }));
    expect(wrapper.find(".st-fieldCard--plain").exists()).toBe(true);
  });

  it("accent variant applies the categorical tone class for a token-only accent", () => {
    const wrapper = track(
      mount(FieldCard, { props: { label: "Accent", variant: "accent", tone: "category4" } }),
    );
    const root = wrapper.find(".st-fieldCard");
    expect(root.classes()).toContain("st-fieldCard--accent");
    expect(root.classes()).toContain("st-fieldCard--category4");
  });

  it("does not apply a tone class on non-accent variants", () => {
    const wrapper = track(
      mount(FieldCard, { props: { label: "Bordered", variant: "bordered", tone: "category4" } }),
    );
    expect(wrapper.find(".st-fieldCard--category4").exists()).toBe(false);
  });

  it("hides the comment badge when count is 0 and no handler is provided", () => {
    const wrapper = track(mount(FieldCard, { props: { label: "Sans" } }));
    expect(wrapper.find(".st-fieldCard__comments").exists()).toBe(false);
  });

  it("renders a static comment count badge when count > 0 without a handler", () => {
    const wrapper = track(mount(FieldCard, { props: { label: "Avec", commentCount: 3 } }));
    expect(wrapper.find(".st-fieldCard__comments--static").exists()).toBe(true);
    expect(wrapper.find(".st-fieldCard__commentCount").text()).toBe("3");
  });

  it("renders an interactive comment button that calls onOpenComments", async () => {
    const onOpenComments = vi.fn();
    const wrapper = track(
      mount(FieldCard, { props: { label: "Fil", commentCount: 2, onOpenComments } }),
    );
    const btn = wrapper.find("button.st-fieldCard__comments");
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("aria-label")).toBe("Commentaires (2)");
    await btn.trigger("click");
    expect(onOpenComments).toHaveBeenCalledTimes(1);
  });
});
