import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TreeView } from "./index.js";

afterEach(() => {
  cleanup();
});

const nodes = [{ id: "root", label: "Root node" }];

describe("TreeView accessible name", () => {
  it("renders the default name when neither label nor aria-label is provided", () => {
    render(<TreeView nodes={nodes} />);
    expect(screen.getByRole("tree", { name: "Arborescence" })).toBeTruthy();
  });

  it("renders the label prop when provided", () => {
    render(<TreeView nodes={nodes} label="Couches" />);
    expect(screen.getByRole("tree", { name: "Couches" })).toBeTruthy();
  });

  it("respects an explicit aria-label over the default", () => {
    render(<TreeView nodes={nodes} aria-label="Objects tree" />);
    expect(screen.getByRole("tree", { name: "Objects tree" })).toBeTruthy();
  });

  it("prefers an explicit aria-label over label when both are provided", () => {
    render(<TreeView nodes={nodes} label="Couches" aria-label="Objects tree" />);
    expect(screen.getByRole("tree", { name: "Objects tree" })).toBeTruthy();
  });
});
