import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreeView } from "./index.js";
import type { TreeNode } from "./index.js";

// FR3 — TreeView onSelect/onChange parity with the Svelte reference.
// Payload = the activated leaf node's id. Parents toggle expansion instead.

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

const row = (container: HTMLElement, id: string) =>
  container.querySelector<HTMLElement>(`[data-tree-id="${id}"]`)!;

describe("TreeView onSelect/onChange (FR3)", () => {
  it("stays display-only without handlers (no tabindex, no role lie)", () => {
    const { container } = render(<TreeView nodes={nodes} />);
    expect(container.querySelector("[role='tree']")).not.toBeNull();
    expect(row(container, "veg").getAttribute("tabindex")).toBeNull();
  });

  it("fires onSelect with the leaf id on click", () => {
    const onSelect = vi.fn();
    const { container } = render(<TreeView nodes={nodes} onSelect={onSelect} />);
    fireEvent.click(row(container, "veg"));
    expect(onSelect).toHaveBeenCalledWith("veg");
  });

  it("fires onChange with the same payload as onSelect", () => {
    const onSelect = vi.fn();
    const onChange = vi.fn();
    const { container } = render(<TreeView nodes={nodes} onSelect={onSelect} onChange={onChange} />);
    fireEvent.click(row(container, "veg"));
    expect(onChange).toHaveBeenCalledWith("veg");
    expect(onSelect).toHaveBeenCalledWith("veg");
  });

  it("clicking a PARENT toggles expansion, does not select", () => {
    const onSelect = vi.fn();
    const { container } = render(<TreeView nodes={nodes} onSelect={onSelect} />);
    // Initially collapsed: only top-level rows visible.
    expect(container.querySelector('[data-tree-id="apple"]')).toBeNull();
    fireEvent.click(row(container, "fruits"));
    expect(container.querySelector('[data-tree-id="apple"]')).not.toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("selects a leaf with the Enter key", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TreeView nodes={nodes} defaultExpandedIds={["fruits"]} onSelect={onSelect} />,
    );
    fireEvent.keyDown(row(container, "apple"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("apple");
  });

  it("selects a leaf with the Space key", () => {
    const onSelect = vi.fn();
    const { container } = render(<TreeView nodes={nodes} onSelect={onSelect} />);
    fireEvent.keyDown(row(container, "veg"), { key: " " });
    expect(onSelect).toHaveBeenCalledWith("veg");
  });

  it("does not select a disabled leaf", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TreeView nodes={nodes} defaultExpandedIds={["fruits"]} onSelect={onSelect} />,
    );
    fireEvent.click(row(container, "pear"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("marks the controlled selectedId via aria-selected", () => {
    const { container } = render(<TreeView nodes={nodes} selectedId="veg" onSelect={() => {}} />);
    expect(row(container, "veg").getAttribute("aria-selected")).toBe("true");
  });
});
