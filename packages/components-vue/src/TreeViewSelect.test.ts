import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { TreeView } from "./index.js";
import type { TreeNode } from "./index.js";

// FR3 — TreeView select/update:selectedId parity with the Svelte reference.

const nodes: TreeNode[] = [
  {
    id: "fruits",
    label: "Fruits",
    children: [
      { id: "apple", label: "Pomme" },
      { id: "pear", label: "Poire", disabled: true },
    ],
  },
  { id: "veg", label: "Légumes" },
];

describe("TreeView select/update:selectedId (FR3)", () => {
  it("stays display-only without listeners (no tabindex)", () => {
    const wrapper = mount(TreeView, { props: { nodes } });
    expect(wrapper.find("[role='tree']").exists()).toBe(true);
    expect(wrapper.find('[data-tree-id="veg"]').attributes("tabindex")).toBeUndefined();
  });

  it("emits select with the leaf id on click", async () => {
    const wrapper = mount(TreeView, { props: { nodes, onSelect: () => {} } });
    await wrapper.find('[data-tree-id="veg"]').trigger("click");
    expect(wrapper.emitted("select")?.[0]).toEqual(["veg"]);
  });

  it("emits update:selectedId alongside select (same payload)", async () => {
    const wrapper = mount(TreeView, { props: { nodes, "onUpdate:selectedId": () => {} } });
    await wrapper.find('[data-tree-id="veg"]').trigger("click");
    expect(wrapper.emitted("update:selectedId")?.[0]).toEqual(["veg"]);
    expect(wrapper.emitted("select")?.[0]).toEqual(["veg"]);
  });

  it("clicking a PARENT toggles expansion, does not select", async () => {
    const wrapper = mount(TreeView, { props: { nodes, onSelect: () => {} } });
    expect(wrapper.find('[data-tree-id="apple"]').exists()).toBe(false);
    await wrapper.find('[data-tree-id="fruits"]').trigger("click");
    expect(wrapper.find('[data-tree-id="apple"]').exists()).toBe(true);
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("selects a leaf with the Enter key", async () => {
    const wrapper = mount(TreeView, {
      props: { nodes, defaultExpandedIds: ["fruits"], onSelect: () => {} },
    });
    await wrapper.find('[data-tree-id="apple"]').trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("select")?.[0]).toEqual(["apple"]);
  });

  it("selects a leaf with the Space key", async () => {
    const wrapper = mount(TreeView, { props: { nodes, onSelect: () => {} } });
    await wrapper.find('[data-tree-id="veg"]').trigger("keydown", { key: " " });
    expect(wrapper.emitted("select")?.[0]).toEqual(["veg"]);
  });

  it("does not select a disabled leaf", async () => {
    const wrapper = mount(TreeView, {
      props: { nodes, defaultExpandedIds: ["fruits"], onSelect: () => {} },
    });
    await wrapper.find('[data-tree-id="pear"]').trigger("click");
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("marks the controlled selectedId via aria-selected", () => {
    const wrapper = mount(TreeView, { props: { nodes, selectedId: "veg", onSelect: () => {} } });
    expect(wrapper.find('[data-tree-id="veg"]').attributes("aria-selected")).toBe("true");
  });

  it("moves focus with ArrowDown, Home and End", async () => {
    const wrapper = mount(TreeView, {
      props: { nodes, defaultExpandedIds: ["fruits"], onSelect: () => {} },
      attachTo: document.body,
    });
    wrapper.find('[data-tree-id="fruits"]').element.focus();

    await wrapper.find('[data-tree-id="fruits"]').trigger("keydown", { key: "ArrowDown" });
    await Promise.resolve();
    expect(document.activeElement).toBe(wrapper.find('[data-tree-id="apple"]').element);

    await wrapper.find('[data-tree-id="apple"]').trigger("keydown", { key: "End" });
    await Promise.resolve();
    expect(document.activeElement).toBe(wrapper.find('[data-tree-id="veg"]').element);

    await wrapper.find('[data-tree-id="veg"]').trigger("keydown", { key: "Home" });
    await Promise.resolve();
    expect(document.activeElement).toBe(wrapper.find('[data-tree-id="fruits"]').element);

    wrapper.unmount();
  });

  it("expands and collapses parent rows with ArrowRight and ArrowLeft", async () => {
    const wrapper = mount(TreeView, { props: { nodes, onSelect: () => {} } });
    expect(wrapper.find('[data-tree-id="apple"]').exists()).toBe(false);
    await wrapper.find('[data-tree-id="fruits"]').trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.find('[data-tree-id="apple"]').exists()).toBe(true);
    await wrapper.find('[data-tree-id="fruits"]').trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.find('[data-tree-id="apple"]').exists()).toBe(false);
  });

  it("honours controlled expandedIds without mutating internal expansion", async () => {
    const wrapper = mount(TreeView, { props: { nodes, expandedIds: [], onSelect: () => {} } });
    await wrapper.find('[data-tree-id="fruits"]').trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.find('[data-tree-id="apple"]').exists()).toBe(false);

    await wrapper.setProps({ expandedIds: ["fruits"] });
    expect(wrapper.find('[data-tree-id="apple"]').exists()).toBe(true);
  });
});
