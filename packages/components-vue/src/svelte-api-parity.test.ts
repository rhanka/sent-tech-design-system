import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import {
  Accordion,
  FileUploader,
  MessageActions,
  NumberInput,
  Search,
  Slider,
} from "./index.js";

// These tests assert that the Vue components accept the canonical Svelte API
// (props/shapes from packages/components-svelte/src/lib/<Comp>.svelte) without
// regressing the existing Vue-native API.
describe("Vue accepts the canonical Svelte API", () => {
  describe("FileUploader", () => {
    it("renders the Svelte item shape ({ file: { name, size } })", () => {
      const wrapper = mount(FileUploader, {
        props: {
          items: [{ file: { name: "report.pdf", size: 2048 }, status: "complete" }],
        },
      });
      expect(wrapper.find(".st-fileUploader__itemName").text()).toBe("report.pdf");
      expect(wrapper.find(".st-fileUploader__itemSize").text()).toBe("2.0 KB");
    });

    it("still renders the flat Vue shape ({ name, size })", () => {
      const wrapper = mount(FileUploader, {
        props: { items: [{ name: "logo.svg", size: 1024 }] },
      });
      expect(wrapper.find(".st-fileUploader__itemName").text()).toBe("logo.svg");
      expect(wrapper.find(".st-fileUploader__itemSize").text()).toBe("1.0 KB");
    });

    it("prefers item.file.name over item.name", () => {
      const wrapper = mount(FileUploader, {
        props: { items: [{ name: "flat.txt", file: { name: "nested.txt" } }] },
      });
      expect(wrapper.find(".st-fileUploader__itemName").text()).toBe("nested.txt");
    });
  });

  describe("MessageActions", () => {
    it("renders action.icon when no label is set", () => {
      const wrapper = mount(MessageActions, {
        props: { actions: [{ id: "copy", icon: "ICON" }] },
      });
      const button = wrapper.find("button");
      expect(button.text()).toBe("ICON");
      expect(button.attributes("aria-label")).toBe("copy");
    });

    it("still renders action.label (Vue-native API)", () => {
      const wrapper = mount(MessageActions, {
        props: { actions: [{ id: "copy", label: "Copy" }] },
      });
      expect(wrapper.find("button").text()).toBe("Copy");
    });

    it("prefers label over icon when both are present", () => {
      const wrapper = mount(MessageActions, {
        props: { actions: [{ id: "copy", label: "Copy", icon: "ICON" }] },
      });
      expect(wrapper.find("button").text()).toBe("Copy");
    });
  });

  describe("Accordion", () => {
    it("accepts the Svelte `open` alias for initially open items", () => {
      const wrapper = mount(Accordion, {
        props: { items: [{ id: "a", title: "A", content: "Panel A" }], open: ["a"] },
      });
      expect(wrapper.find(".st-accordion__panel").exists()).toBe(true);
      expect(wrapper.find(".st-accordion__panel").text()).toBe("Panel A");
    });

    it("accepts the Svelte `multiple` alias (multiple panels open)", async () => {
      const wrapper = mount(Accordion, {
        props: {
          items: [
            { id: "a", title: "A", content: "Panel A" },
            { id: "b", title: "B", content: "Panel B" },
          ],
          multiple: true,
        },
      });
      const triggers = wrapper.findAll(".st-accordion__trigger");
      await triggers[0].trigger("click");
      await triggers[1].trigger("click");
      expect(wrapper.findAll(".st-accordion__panel").length).toBe(2);
    });

    it("single-open when multiple is false", async () => {
      const wrapper = mount(Accordion, {
        props: {
          items: [
            { id: "a", title: "A", content: "Panel A" },
            { id: "b", title: "B", content: "Panel B" },
          ],
          multiple: false,
        },
      });
      const triggers = wrapper.findAll(".st-accordion__trigger");
      await triggers[0].trigger("click");
      await triggers[1].trigger("click");
      const panels = wrapper.findAll(".st-accordion__panel");
      expect(panels.length).toBe(1);
      expect(panels[0].text()).toBe("Panel B");
    });
  });

  describe("NumberInput", () => {
    it("accepts the Svelte/React `value` prop as well as modelValue", () => {
      const wrapper = mount(NumberInput, { props: { value: 7 } });
      expect((wrapper.find("input").element as HTMLInputElement).value).toBe("7");
    });

    it("still accepts modelValue (Vue-native v-model API)", () => {
      const wrapper = mount(NumberInput, { props: { modelValue: 3 } });
      expect((wrapper.find("input").element as HTMLInputElement).value).toBe("3");
    });
  });

  describe("Search", () => {
    it("accepts the Svelte/React `value` prop as well as modelValue", () => {
      const wrapper = mount(Search, { props: { value: "query" } });
      expect((wrapper.find("input").element as HTMLInputElement).value).toBe("query");
    });

    it("still accepts modelValue (Vue-native v-model API)", () => {
      const wrapper = mount(Search, { props: { modelValue: "abc" } });
      expect((wrapper.find("input").element as HTMLInputElement).value).toBe("abc");
    });
  });

  describe("Slider", () => {
    it("accepts the Svelte/React `value` prop as well as modelValue", () => {
      const wrapper = mount(Slider, { props: { value: 42 } });
      expect((wrapper.find("input").element as HTMLInputElement).value).toBe("42");
    });
  });
});
