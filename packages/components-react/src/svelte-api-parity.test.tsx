import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Accordion, FileUploader, MessageActions } from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

// These tests assert that the React components accept the canonical Svelte API
// (props/shapes from packages/components-svelte/src/lib/<Comp>.svelte) without
// regressing the existing React-native API.
describe("React accepts the canonical Svelte API", () => {
  describe("FileUploader", () => {
    it("renders the Svelte item shape ({ file: { name, size } })", () => {
      render(
        <FileUploader
          label="Upload"
          items={[{ file: { name: "report.pdf", size: 2048 }, status: "complete" }]}
        />,
      );
      expect(screen.getByText("report.pdf")).toBeTruthy();
      // 2048 bytes -> "2.0 KB"
      expect(screen.getByText("2.0 KB")).toBeTruthy();
    });

    it("still renders the flat React shape ({ name, size })", () => {
      render(<FileUploader label="Upload" items={[{ name: "logo.svg", size: 1024 }]} />);
      expect(screen.getByText("logo.svg")).toBeTruthy();
      expect(screen.getByText("1.0 KB")).toBeTruthy();
    });

    it("prefers item.file.name over item.name when both are present", () => {
      render(<FileUploader items={[{ name: "flat.txt", file: { name: "nested.txt" } }]} />);
      expect(screen.getByText("nested.txt")).toBeTruthy();
      expect(screen.queryByText("flat.txt")).toBeNull();
    });
  });

  describe("MessageActions", () => {
    it("renders action.icon (Svelte snippet equivalent) when no label is set", () => {
      render(
        <MessageActions
          actions={[{ id: "copy", icon: <svg data-testid="copy-icon" /> }]}
        />,
      );
      expect(screen.getByTestId("copy-icon")).toBeTruthy();
      // id is used as the accessible name when only an icon is provided.
      expect(screen.getByRole("button", { name: "copy" })).toBeTruthy();
    });

    it("still renders action.label (React-native API)", () => {
      render(<MessageActions actions={[{ id: "copy", label: "Copy" }]} />);
      expect(screen.getByText("Copy")).toBeTruthy();
    });

    it("prefers label over icon when both are present", () => {
      render(
        <MessageActions actions={[{ id: "copy", label: "Copy", icon: <svg data-testid="i" /> }]} />,
      );
      expect(screen.getByText("Copy")).toBeTruthy();
      expect(screen.queryByTestId("i")).toBeNull();
    });
  });

  describe("Accordion", () => {
    it("accepts the Svelte `open` alias for initially open items", () => {
      render(
        <Accordion items={[{ id: "a", title: "A", content: "Panel A" }]} open={["a"]} />,
      );
      expect(screen.getByText("Panel A")).toBeTruthy();
    });

    it("accepts the Svelte `multiple` alias (multiple panels open at once)", () => {
      render(
        <Accordion
          items={[
            { id: "a", title: "A", content: "Panel A" },
            { id: "b", title: "B", content: "Panel B" },
          ]}
          multiple
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "A" }));
      fireEvent.click(screen.getByRole("button", { name: "B" }));
      expect(screen.getByText("Panel A")).toBeTruthy();
      expect(screen.getByText("Panel B")).toBeTruthy();
    });

    it("collapses the previous panel when multiple is false (single-open)", () => {
      render(
        <Accordion
          items={[
            { id: "a", title: "A", content: "Panel A" },
            { id: "b", title: "B", content: "Panel B" },
          ]}
          multiple={false}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "A" }));
      fireEvent.click(screen.getByRole("button", { name: "B" }));
      expect(screen.queryByText("Panel A")).toBeNull();
      expect(screen.getByText("Panel B")).toBeTruthy();
    });
  });
});
