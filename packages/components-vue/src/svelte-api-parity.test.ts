import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import {
  Accordion,
  ContentSwitcher,
  Dropdown,
  FileUploader,
  Link,
  Menu,
  MenuTriggerButton,
  MessageActions,
  NumberInput,
  OverflowMenu,
  PaginationNav,
  Search,
  Slider,
  Tabs,
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

  describe("Menu", () => {
    it("renders the Svelte item shape (kind: divider + { value, label, danger })", async () => {
      const onSelect = vi.fn();
      const wrapper = mount(Menu, {
        props: {
          items: [
            { kind: "divider" },
            { value: "delete", label: "Delete", danger: true },
          ],
          onSelect,
        },
      });
      expect(wrapper.find(".st-menu__divider").exists()).toBe(true);
      const item = wrapper.find(".st-menu__item");
      expect(item.classes()).toContain("st-menu__item--danger");
      expect(item.text()).toBe("Delete");
      await item.trigger("click");
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ value: "delete", label: "Delete", danger: true }),
      );
    });

    it("accepts the Svelte flat group shape (kind: group, label-only)", () => {
      const wrapper = mount(Menu, {
        props: {
          items: [
            { kind: "group", label: "Section" },
            { value: "a", label: "A" },
          ],
        },
      });
      expect(wrapper.find(".st-menu__group").text()).toBe("Section");
      expect(wrapper.find(".st-menu__item").text()).toBe("A");
    });

    it("still renders the Vue-native shape (type/id/variant)", () => {
      const wrapper = mount(Menu, {
        props: {
          items: [
            { type: "divider" },
            { id: "del", label: "Remove", variant: "danger" },
          ],
        },
      });
      expect(wrapper.find(".st-menu__divider").exists()).toBe(true);
      expect(wrapper.find(".st-menu__item").classes()).toContain(
        "st-menu__item--danger",
      );
    });
  });

  describe("OverflowMenu", () => {
    it("renders the Svelte item shape (kind/value/danger) when open", () => {
      const wrapper = mount(OverflowMenu, {
        props: {
          open: true,
          items: [
            { kind: "divider" },
            { value: "x", label: "X", danger: true },
          ],
        },
      });
      expect(wrapper.find(".st-menu__divider").exists()).toBe(true);
      expect(wrapper.find(".st-menu__item").classes()).toContain(
        "st-menu__item--danger",
      );
    });
  });

  describe("MenuTriggerButton", () => {
    it("accepts the Svelte `expanded` alias for `open`", () => {
      const wrapper = mount(MenuTriggerButton, { props: { expanded: true } });
      expect(wrapper.find("button").attributes("aria-expanded")).toBe("true");
    });

    it("still accepts the Vue-native `open` prop", () => {
      const wrapper = mount(MenuTriggerButton, { props: { open: true } });
      expect(wrapper.find("button").attributes("aria-expanded")).toBe("true");
    });
  });

  describe("PaginationNav", () => {
    it("accepts the Svelte `pageCount` alias for `totalPages`", () => {
      const wrapper = mount(PaginationNav, { props: { page: 1, pageCount: 3 } });
      expect(wrapper.findAll(".st-paginationNav__page").length).toBe(3);
    });

    it("still accepts the Vue-native `totalPages` prop", () => {
      const wrapper = mount(PaginationNav, { props: { page: 1, totalPages: 2 } });
      expect(wrapper.findAll(".st-paginationNav__page").length).toBe(2);
    });
  });

  describe("Dropdown", () => {
    it("accepts an `onSelect` callback prop (React/Svelte parity)", async () => {
      const onSelect = vi.fn();
      const wrapper = mount(Dropdown, {
        props: {
          label: "Pick",
          open: true,
          options: [{ value: "a", label: "A" }],
          onSelect,
        },
      });
      await wrapper.find('[role="option"]').trigger("click");
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith("a");
    });

    it("still emits the Vue-native `select` event", async () => {
      const wrapper = mount(Dropdown, {
        props: { label: "Pick", open: true, options: [{ value: "a", label: "A" }] },
      });
      await wrapper.find('[role="option"]').trigger("click");
      expect(wrapper.emitted("select")?.[0]).toEqual(["a"]);
    });
  });

  describe("Tabs", () => {
    it("accepts the Svelte lowercase `onchange` callback prop", async () => {
      const onchange = vi.fn();
      const wrapper = mount(Tabs, {
        props: {
          items: [
            { value: "a", label: "A", content: "PA" },
            { value: "b", label: "B", content: "PB" },
          ],
          onchange,
        },
      });
      await wrapper.findAll(".st-tabs__tab")[1].trigger("click");
      expect(onchange).toHaveBeenCalledWith("b");
    });

    it("still emits the Vue-native `change` event", async () => {
      const wrapper = mount(Tabs, {
        props: {
          items: [
            { value: "a", label: "A", content: "PA" },
            { value: "b", label: "B", content: "PB" },
          ],
        },
      });
      await wrapper.findAll(".st-tabs__tab")[1].trigger("click");
      expect(wrapper.emitted("change")?.[0]).toEqual(["b"]);
    });
  });

  describe("ContentSwitcher", () => {
    it("accepts the Svelte lowercase `onchange` callback prop", async () => {
      const onchange = vi.fn();
      const wrapper = mount(ContentSwitcher, {
        props: {
          items: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
          onchange,
        },
      });
      await wrapper.findAll(".st-contentSwitcher__option")[1].trigger("click");
      expect(onchange).toHaveBeenCalledWith("b");
    });

    it("still emits the Vue-native `change` event", async () => {
      const wrapper = mount(ContentSwitcher, {
        props: {
          items: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      });
      await wrapper.findAll(".st-contentSwitcher__option")[1].trigger("click");
      expect(wrapper.emitted("change")?.[0]).toEqual(["b"]);
    });
  });

  describe("Link", () => {
    it("accepts the canonical `variant` prop (muted class)", () => {
      const wrapper = mount(Link, {
        props: { href: "#", variant: "muted" },
        slots: { default: "Muted" },
      });
      expect(wrapper.find("a").classes()).toContain("st-link--muted");
    });

    it("still accepts the deprecated boolean shortcuts (standalone/muted)", () => {
      const wrapper = mount(Link, {
        props: { href: "#", standalone: true },
        slots: { default: "Standalone" },
      });
      expect(wrapper.find("a").classes()).toContain("st-link--standalone");
    });

    it("prefers explicit `variant` over the boolean shortcuts", () => {
      // variant='muted' + standalone -> renders muted (variant wins)
      const wrapper = mount(Link, {
        props: { href: "#", variant: "muted", standalone: true },
        slots: { default: "Conflict" },
      });
      const classes = wrapper.find("a").classes();
      expect(classes).toContain("st-link--muted");
      expect(classes).not.toContain("st-link--standalone");
    });

    it("external -> target=_blank rel=noreferrer", () => {
      const wrapper = mount(Link, {
        props: { href: "https://example.com", external: true },
        slots: { default: "Out" },
      });
      const a = wrapper.find("a");
      expect(a.attributes("target")).toBe("_blank");
      expect(a.attributes("rel")).toBe("noreferrer");
    });

    it("respects an explicit target/rel over external defaults", () => {
      const wrapper = mount(Link, {
        props: { href: "https://example.com", external: true },
        attrs: { target: "_self", rel: "nofollow" },
        slots: { default: "Out" },
      });
      const a = wrapper.find("a");
      expect(a.attributes("target")).toBe("_self");
      expect(a.attributes("rel")).toBe("nofollow");
    });

    it("disabled -> no navigable href + aria-disabled (navigation cut, canon parity)", () => {
      const wrapper = mount(Link, {
        props: { href: "/somewhere", disabled: true },
        slots: { default: "Disabled" },
      });
      const a = wrapper.find("a");
      // disabled coupe la navigation : href absent (comme le canon Svelte).
      expect(a.attributes("href")).toBeUndefined();
      expect(a.attributes("aria-disabled")).toBe("true");
    });
  });
});
