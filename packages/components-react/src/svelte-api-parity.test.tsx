import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  Accordion,
  ContentSwitcher,
  Dropdown,
  FileUploader,
  Menu,
  MenuTriggerButton,
  MessageActions,
  OverflowMenu,
  PaginationNav,
  Tabs,
} from "./index.js";

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

  describe("Menu", () => {
    it("renders the Svelte item shape (kind: divider + { value, label, danger })", () => {
      const onSelect = vi.fn();
      render(
        <Menu
          items={[
            { kind: "divider" },
            { value: "delete", label: "Delete", danger: true },
          ]}
          onSelect={onSelect}
        />,
      );
      // divider rendered
      expect(document.querySelector(".st-menu__divider")).toBeTruthy();
      // danger item rendered with the danger class
      const item = screen.getByRole("menuitem", { name: "Delete" });
      expect(item.className).toContain("st-menu__item--danger");
      // onSelect receives the item; `value` is preserved on it
      fireEvent.click(item);
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ value: "delete", label: "Delete", danger: true }),
      );
    });

    it("accepts the Svelte flat group shape (kind: group, label-only)", () => {
      render(
        <Menu
          items={[
            { kind: "group", label: "Section" },
            { value: "a", label: "A" },
          ]}
        />,
      );
      expect(screen.getByText("Section")).toBeTruthy();
      expect(screen.getByRole("menuitem", { name: "A" })).toBeTruthy();
    });

    it("still renders the React-native shape (type/id/variant)", () => {
      render(
        <Menu
          items={[
            { type: "divider" },
            { id: "del", label: "Remove", variant: "danger" },
          ]}
        />,
      );
      expect(document.querySelector(".st-menu__divider")).toBeTruthy();
      expect(
        screen.getByRole("menuitem", { name: "Remove" }).className,
      ).toContain("st-menu__item--danger");
    });
  });

  describe("OverflowMenu", () => {
    it("renders the Svelte item shape (kind/value/danger) when open", () => {
      render(
        <OverflowMenu
          open
          items={[
            { kind: "divider" },
            { value: "x", label: "X", danger: true },
          ]}
        />,
      );
      expect(document.querySelector(".st-menu__divider")).toBeTruthy();
      expect(
        screen.getByRole("menuitem", { name: "X" }).className,
      ).toContain("st-menu__item--danger");
    });
  });

  describe("MenuTriggerButton", () => {
    it("accepts the Svelte `expanded` alias for `open`", () => {
      render(<MenuTriggerButton expanded aria-label="More" />);
      expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
    });

    it("still accepts the React-native `open` prop", () => {
      render(<MenuTriggerButton open aria-label="More" />);
      expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
    });
  });

  describe("PaginationNav", () => {
    it("accepts the Svelte `pageCount` alias for `totalPages`", () => {
      render(<PaginationNav page={1} pageCount={3} />);
      expect(screen.getByText("Page 1")).toBeTruthy();
      expect(screen.getByText("Page 2")).toBeTruthy();
      expect(screen.getByText("Page 3")).toBeTruthy();
    });

    it("still accepts the React-native `totalPages` prop", () => {
      render(<PaginationNav page={1} totalPages={2} />);
      expect(screen.getByText("Page 1")).toBeTruthy();
      expect(screen.getByText("Page 2")).toBeTruthy();
      expect(screen.queryByText("Page 3")).toBeNull();
    });
  });

  describe("Dropdown", () => {
    it("accepts the Svelte lowercase `onselect` handler", () => {
      const onselect = vi.fn();
      render(
        <Dropdown
          label="Pick"
          open
          options={[{ value: "a", label: "A" }]}
          onselect={onselect}
        />,
      );
      fireEvent.click(screen.getByRole("option", { name: "A" }));
      expect(onselect).toHaveBeenCalledWith("a");
    });

    it("still accepts the React-native `onSelect` handler", () => {
      const onSelect = vi.fn();
      render(
        <Dropdown
          label="Pick"
          open
          options={[{ value: "a", label: "A" }]}
          onSelect={onSelect}
        />,
      );
      fireEvent.click(screen.getByRole("option", { name: "A" }));
      expect(onSelect).toHaveBeenCalledWith("a");
    });
  });

  describe("Tabs", () => {
    it("accepts the Svelte lowercase `onchange` handler", () => {
      const onchange = vi.fn();
      render(
        <Tabs
          items={[
            { value: "a", label: "A", content: "PA" },
            { value: "b", label: "B", content: "PB" },
          ]}
          onchange={onchange}
        />,
      );
      fireEvent.click(screen.getByRole("tab", { name: "B" }));
      expect(onchange).toHaveBeenCalledWith("b");
    });
  });

  describe("ContentSwitcher", () => {
    it("accepts the Svelte lowercase `onchange` handler", () => {
      const onchange = vi.fn();
      render(
        <ContentSwitcher
          items={[
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ]}
          onchange={onchange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "B" }));
      expect(onchange).toHaveBeenCalledWith("b");
    });
  });
});
