import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { Badge, Button, Card, Checkbox, Input, Radio, ThemeProvider } from "./index.js";

describe("Vue behavioral parity — primitives", () => {
  // --- Button ---
  describe("Button", () => {
    it("renders with default classes st-button--primary and st-button--md", () => {
      const wrapper = mount(Button, { slots: { default: "Click" } });
      const btn = wrapper.find("button");
      expect(btn.classes()).toContain("st-button");
      expect(btn.classes()).toContain("st-button--primary");
      expect(btn.classes()).toContain("st-button--md");
    });

    it("applies variant and size modifier classes", () => {
      const wrapper = mount(Button, {
        props: { variant: "ghost", size: "sm" },
        slots: { default: "Go" },
      });
      const btn = wrapper.find("button");
      expect(btn.classes()).toContain("st-button--ghost");
      expect(btn.classes()).toContain("st-button--sm");
    });

    it("passes disabled attribute", () => {
      const wrapper = mount(Button, {
        props: { disabled: true },
        slots: { default: "Disabled" },
      });
      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("renders slot content", () => {
      const wrapper = mount(Button, { slots: { default: "Hello" } });
      expect(wrapper.text()).toBe("Hello");
    });

    it("defaults to type=button", () => {
      const wrapper = mount(Button, { slots: { default: "X" } });
      expect(wrapper.find("button").attributes("type")).toBe("button");
    });
  });

  // --- Card ---
  describe("Card", () => {
    it("renders a section with st-card class", () => {
      const wrapper = mount(Card, { slots: { default: "Content" } });
      const section = wrapper.find("section");
      expect(section.classes()).toContain("st-card");
      expect(section.classes()).not.toContain("st-card--interactive");
    });

    it("adds st-card--interactive when prop is true", () => {
      const wrapper = mount(Card, {
        props: { interactive: true },
        slots: { default: "Content" },
      });
      expect(wrapper.find("section").classes()).toContain("st-card--interactive");
    });
  });

  // --- Badge ---
  describe("Badge", () => {
    it("renders a span with st-badge and default tone st-badge--neutral", () => {
      const wrapper = mount(Badge, { slots: { default: "New" } });
      const span = wrapper.find("span");
      expect(span.classes()).toContain("st-badge");
      expect(span.classes()).toContain("st-badge--neutral");
    });

    it("applies tone modifier class", () => {
      const wrapper = mount(Badge, {
        props: { tone: "success" },
        slots: { default: "OK" },
      });
      expect(wrapper.find("span").classes()).toContain("st-badge--success");
    });
  });

  // --- Input ---
  describe("Input", () => {
    it("renders a div.st-field with a label and an input.st-control", () => {
      const wrapper = mount(Input, { props: { label: "Name" } });
      expect(wrapper.find(".st-field").exists()).toBe(true);
      expect(wrapper.find(".st-field__label").text()).toBe("Name");
      expect(wrapper.find("input.st-control").exists()).toBe(true);
    });

    it("adds st-control--sm with size=sm", () => {
      const wrapper = mount(Input, { props: { size: "sm" } });
      expect(wrapper.find("input").classes()).toContain("st-control--sm");
    });

    it("sets aria-invalid=true when errorText is provided", () => {
      const wrapper = mount(Input, { props: { errorText: "Required" } });
      expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
      expect(wrapper.find(".st-field__error").text()).toBe("Required");
    });

    it("shows helperText when no errorText", () => {
      const wrapper = mount(Input, { props: { helperText: "Hint" } });
      expect(wrapper.find(".st-field__help").text()).toBe("Hint");
    });

    it("emits update:modelValue on input event", async () => {
      const wrapper = mount(Input);
      await wrapper.find("input").setValue("hello");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["hello"]);
    });
  });

  // --- Checkbox ---
  describe("Checkbox", () => {
    it("renders a label.st-choice--checkbox with the label text", () => {
      const wrapper = mount(Checkbox, { props: { label: "Accept" } });
      expect(wrapper.find("label").classes()).toContain("st-choice");
      expect(wrapper.find("label").classes()).toContain("st-choice--checkbox");
      expect(wrapper.find(".st-choice__label").text()).toBe("Accept");
    });

    it("renders a checkbox input", () => {
      const wrapper = mount(Checkbox, { props: { label: "Accept" } });
      expect(wrapper.find("input[type=checkbox]").exists()).toBe(true);
    });

    it("sets aria-invalid=true when invalid", () => {
      const wrapper = mount(Checkbox, { props: { label: "Accept", invalid: true } });
      expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
    });

    it("shows helperText when provided", () => {
      const wrapper = mount(Checkbox, { props: { label: "Accept", helperText: "Optional" } });
      expect(wrapper.find(".st-choice__help").text()).toBe("Optional");
    });

    it("emits update:modelValue on change", async () => {
      const wrapper = mount(Checkbox, { props: { label: "Accept", modelValue: false } });
      await wrapper.find("input").setValue(true);
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });
  });

  // --- Radio ---
  describe("Radio", () => {
    it("renders a label.st-choice--radio with the label text", () => {
      const wrapper = mount(Radio, { props: { label: "Owner", value: "owner" } });
      expect(wrapper.find("label").classes()).toContain("st-choice");
      expect(wrapper.find("label").classes()).toContain("st-choice--radio");
      expect(wrapper.find(".st-choice__label").text()).toBe("Owner");
    });

    it("renders a radio input", () => {
      const wrapper = mount(Radio, { props: { label: "Owner", value: "owner" } });
      expect(wrapper.find("input[type=radio]").exists()).toBe(true);
    });
  });

  // --- ThemeProvider ---
  describe("ThemeProvider", () => {
    it("renders a div with data-st-theme attribute", () => {
      const wrapper = mount(ThemeProvider, {
        slots: { default: "child" },
        attachTo: document.body,
      });
      const div = wrapper.find("div[data-st-theme]");
      expect(div.exists()).toBe(true);
      wrapper.unmount();
    });
  });

  // --- Export surface ---
  describe("export surface", () => {
    it("exports all expected components", () => {
      const exports = { Badge, Button, Card, Checkbox, Input, Radio, ThemeProvider };
      for (const [name, component] of Object.entries(exports)) {
        expect(component, `${name} should be exported`).toBeDefined();
        expect(typeof component).toBe("object"); // defineComponent returns an object
      }
    });

    it("each component has a name property", () => {
      expect(Button.name).toBe("Button");
      expect(Card.name).toBe("Card");
      expect(Badge.name).toBe("Badge");
      expect(Input.name).toBe("Input");
      expect(Checkbox.name).toBe("Checkbox");
      expect(Radio.name).toBe("Radio");
      expect(ThemeProvider.name).toBe("ThemeProvider");
    });
  });
});
