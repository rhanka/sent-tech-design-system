import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import {
  Avatar,
  AvatarGroup,
  ButtonGroup,
  Button,
  CheckboxGroup,
  RadioGroup,
  Typography,
  Collapsible,
  Stepper,
} from "./index.js";

describe("Avatar", () => {
  it("renders derived initials when no src is provided", () => {
    const wrapper = mount(Avatar, { props: { name: "Ada Lovelace" } });
    const avatar = wrapper.find('[role="img"]');
    expect(avatar.attributes("aria-label")).toBe("Ada Lovelace");
    expect(avatar.text()).toBe("AL");
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("renders an image when src is provided", () => {
    const wrapper = mount(Avatar, {
      props: { name: "Ada Lovelace", src: "/ada.png", alt: "Portrait" },
    });
    const avatar = wrapper.find(".st-avatar");
    expect(avatar.attributes("aria-label")).toBe("Portrait");
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("/ada.png");
    expect(wrapper.find(".st-avatar__initials").exists()).toBe(false);
  });
});

describe("AvatarGroup", () => {
  it("renders a +N overflow token when total exceeds max", () => {
    const wrapper = mount(AvatarGroup, {
      props: { max: 2, total: 5 },
      slots: {
        default: () => [
          h(Avatar, { name: "A B" }),
          h(Avatar, { name: "C D" }),
        ],
      },
    });
    const overflow = wrapper.find(".st-avatarGroup__overflow");
    expect(overflow.exists()).toBe(true);
    expect(overflow.text()).toBe("+3");
    expect(overflow.attributes("aria-label")).toBe("+3");
  });

  it("renders no overflow token when total is within max", () => {
    const wrapper = mount(AvatarGroup, {
      props: { max: 3, total: 2 },
      slots: {
        default: () => [
          h(Avatar, { name: "A B" }),
          h(Avatar, { name: "C D" }),
        ],
      },
    });
    expect(wrapper.find(".st-avatarGroup__overflow").exists()).toBe(false);
  });
});

describe("ButtonGroup", () => {
  it("exposes role=group with the provided label", () => {
    const wrapper = mount(ButtonGroup, {
      props: { label: "Actions" },
      slots: {
        default: () => [
          h(Button, () => "One"),
          h(Button, () => "Two"),
        ],
      },
    });
    const group = wrapper.find('[role="group"]');
    expect(group.exists()).toBe(true);
    expect(group.attributes("aria-label")).toBe("Actions");
    expect(group.classes()).toContain("st-buttonGroup");
  });
});

describe("CheckboxGroup", () => {
  it("calls onChange with the next selection when a box is toggled", async () => {
    const onChange = vi.fn();
    const wrapper = mount(CheckboxGroup, {
      props: {
        legend: "Toppings",
        name: "toppings",
        value: ["a"],
        onChange,
        options: [
          { label: "Anchovies", value: "a" },
          { label: "Basil", value: "b" },
        ],
      },
    });
    const inputs = wrapper.findAll('input[type="checkbox"]');
    // Basil = index 1, currently unchecked -> toggling adds "b".
    await inputs[1].setValue(true);
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    // Anchovies = index 0, currently checked -> toggling removes "a".
    onChange.mockClear();
    await inputs[0].setValue(false);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe("RadioGroup", () => {
  it("emits the selected value and enforces exclusivity", async () => {
    const onChange = vi.fn();
    const wrapper = mount(RadioGroup, {
      props: {
        legend: "Size",
        name: "size",
        value: "sm",
        onChange,
        options: [
          { label: "Small", value: "sm" },
          { label: "Large", value: "lg" },
        ],
      },
    });
    const inputs = wrapper.findAll(
      'input[type="radio"]',
    ) as unknown as Array<{ element: HTMLInputElement; setValue: (v: boolean) => Promise<void> }>;
    const small = inputs[0].element;
    const large = inputs[1].element;
    expect(small.checked).toBe(true);
    expect(large.checked).toBe(false);
    await inputs[1].setValue(true);
    expect(onChange).toHaveBeenCalledWith("lg");
  });
});

describe("Typography", () => {
  it("maps a variant to its default tag", () => {
    const wrapper = mount(Typography, {
      props: { variant: "h2" },
      slots: { default: () => "Title" },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.tagName).toBe("H2");
    expect(el.classList.contains("st-typography--h2")).toBe(true);
  });

  it("honours the as override and truncate flag", () => {
    const wrapper = mount(Typography, {
      props: { variant: "body", as: "span", truncate: true },
      slots: { default: () => "Long text" },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.tagName).toBe("SPAN");
    expect(el.classList.contains("st-typography--truncate")).toBe(true);
  });
});

describe("Collapsible", () => {
  it("toggles aria-expanded and reveals the region", async () => {
    const onToggle = vi.fn();
    const wrapper = mount(Collapsible, {
      props: { title: "Details", onToggle },
      slots: { default: () => "Hidden content" },
    });
    const trigger = wrapper.find(".st-collapsible__trigger");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(wrapper.find('[role="region"]').exists()).toBe(false);
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(onToggle).toHaveBeenCalledWith(true);
    const region = wrapper.find('[role="region"]');
    expect(region.exists()).toBe(true);
    expect(region.attributes("aria-labelledby")).toBe(
      trigger.attributes("id"),
    );
    expect(trigger.attributes("aria-controls")).toBe(region.attributes("id"));
  });
});

describe("Stepper", () => {
  it("marks the current step with aria-current=step", () => {
    const wrapper = mount(Stepper, {
      props: {
        current: 1,
        steps: [{ label: "One" }, { label: "Two" }, { label: "Three" }],
      },
    });
    const items = wrapper.findAll("li");
    expect(items[0].attributes("aria-current")).toBeUndefined();
    expect(items[1].attributes("aria-current")).toBe("step");
    expect(items[2].attributes("aria-current")).toBeUndefined();
  });

  it("invokes onStepClick when clickable", async () => {
    const onStepClick = vi.fn();
    const wrapper = mount(Stepper, {
      props: {
        current: 1,
        clickable: true,
        onStepClick,
        steps: [{ label: "One" }, { label: "Two" }],
      },
    });
    const buttons = wrapper.findAll(".st-stepper__circle--button");
    await buttons[0].trigger("click");
    expect(onStepClick).toHaveBeenCalledWith(0);
  });
});
