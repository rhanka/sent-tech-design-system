import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { TreeView } from "./index.js";

const nodes = [{ id: "root", label: "Root node" }];

const treeLabel = (wrapper: { find: (sel: string) => { attributes: (name: string) => string | undefined } }) =>
  wrapper.find('[role="tree"]').attributes("aria-label");

describe("TreeView accessible name", () => {
  it("renders the default name when neither label nor aria-label is provided", () => {
    const wrapper = mount(TreeView, { props: { nodes } });
    expect(treeLabel(wrapper)).toBe("Arborescence");
  });

  it("renders the label prop when provided", () => {
    const wrapper = mount(TreeView, { props: { nodes, label: "Couches" } });
    expect(treeLabel(wrapper)).toBe("Couches");
  });

  it("respects an explicit aria-label over the default", () => {
    const wrapper = mount(TreeView, { props: { nodes, "aria-label": "Objects tree" } });
    expect(treeLabel(wrapper)).toBe("Objects tree");
  });

  it("prefers an explicit aria-label over label when both are provided", () => {
    const wrapper = mount(TreeView, {
      props: { nodes, label: "Couches", "aria-label": "Objects tree" },
    });
    expect(treeLabel(wrapper)).toBe("Objects tree");
  });
});
