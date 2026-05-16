import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import Accordion from "./lib/Accordion.svelte";
import CopyButton from "./lib/CopyButton.svelte";
import Header from "./lib/Header.svelte";
import InlineLoading from "./lib/InlineLoading.svelte";
import Modal from "./lib/Modal.svelte";
import OverflowMenu from "./lib/OverflowMenu.svelte";
import ProgressBar from "./lib/ProgressBar.svelte";
import SkeletonText from "./lib/SkeletonText.svelte";
import Tag from "./lib/Tag.svelte";
import Toast from "./lib/Toast.svelte";
import Toggletip from "./lib/Toggletip.svelte";
import Tooltip from "./lib/Tooltip.svelte";

const body = createRawSnippet(() => ({ render: () => "<p>Modal content</p>" }));
const trigger = createRawSnippet(() => ({ render: () => "<button>Hover target</button>" }));

describe("overlay and feedback components", () => {
  it("renders an open modal as a labelled dialog", () => {
    render(Modal, { props: { open: true, title: "Confirm", children: body } });
    expect(screen.getByRole("dialog", { name: "Confirm" })).toBeTruthy();
    expect(screen.getByText("Modal content")).toBeTruthy();
  });

  it("does not render a closed modal", () => {
    render(Modal, { props: { open: false, title: "Confirm", children: body } });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders tooltip content with tooltip role", () => {
    render(Tooltip, { props: { content: "More context", children: trigger } });
    expect(screen.getByRole("tooltip").textContent).toContain("More context");
  });

  it("renders error toasts as alerts and other toasts as status", () => {
    render(Toast, { props: { tone: "error", title: "Failed", message: "Try again" } });
    render(Toast, { props: { tone: "success", title: "Saved" } });
    expect(screen.getByRole("alert").textContent).toContain("Failed");
    expect(screen.getByRole("status").textContent).toContain("Saved");
  });

  it("renders a Tag with content and no dismiss button by default", () => {
    const label = createRawSnippet(() => ({ render: () => "Beta" }));
    render(Tag, { props: { tone: "info", children: label } });
    expect(screen.getByText("Beta")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
  });

  it("renders a dismissible Tag and triggers onDismiss", async () => {
    const onDismiss = vi.fn();
    const label = createRawSnippet(() => ({ render: () => "Closable" }));
    render(Tag, { props: { tone: "neutral", dismissible: true, onDismiss, children: label } });
    const btn = screen.getByRole("button", { name: "Dismiss" });
    await fireEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders an Accordion with collapsed sections by default", () => {
    render(Accordion, {
      props: {
        items: [
          { id: "a", title: "Alpha", content: "Alpha body" },
          { id: "b", title: "Beta", content: "Beta body" }
        ]
      }
    });
    const trigger = screen.getByRole("button", { name: "Alpha" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Alpha body")).toBeNull();
  });

  it("expands an Accordion section when triggered and collapses others in single mode", async () => {
    let latest: string[] = [];
    render(Accordion, {
      props: {
        items: [
          { id: "a", title: "Alpha", content: "Alpha body" },
          { id: "b", title: "Beta", content: "Beta body" }
        ],
        onchange: (open: string[]) => {
          latest = open;
        }
      }
    });
    await fireEvent.click(screen.getByRole("button", { name: "Alpha" }));
    expect(latest).toEqual(["a"]);
    expect(screen.getByText("Alpha body")).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Beta" }));
    expect(latest).toEqual(["b"]);
    expect(screen.queryByText("Alpha body")).toBeNull();
    expect(screen.getByText("Beta body")).toBeTruthy();
  });

  it("supports multi-open Accordion mode", async () => {
    let latest: string[] = [];
    render(Accordion, {
      props: {
        multiple: true,
        items: [
          { id: "a", title: "Alpha", content: "Alpha body" },
          { id: "b", title: "Beta", content: "Beta body" }
        ],
        onchange: (open: string[]) => {
          latest = open;
        }
      }
    });
    await fireEvent.click(screen.getByRole("button", { name: "Alpha" }));
    await fireEvent.click(screen.getByRole("button", { name: "Beta" }));
    expect(latest).toEqual(["a", "b"]);
    expect(screen.getByText("Alpha body")).toBeTruthy();
    expect(screen.getByText("Beta body")).toBeTruthy();
  });

  it("renders a ProgressBar with progressbar role and aria-value attributes", () => {
    render(ProgressBar, { props: { label: "Upload", value: 42, max: 100 } });
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar.getAttribute("aria-valuenow")).toBe("42");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("renders an indeterminate ProgressBar without aria-valuenow", () => {
    render(ProgressBar, { props: { label: "Loading", indeterminate: true } });
    const bar = screen.getByRole("progressbar", { name: "Loading" });
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
  });

  it("CopyButton writes to clipboard and switches to copied label", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    const onCopied = vi.fn();
    render(CopyButton, { props: { value: "secret-value", label: "Copy", copiedLabel: "Copied!", onCopied } });
    const btn = screen.getByRole("button", { name: /Copy/ });
    await fireEvent.click(btn);
    expect(writeText).toHaveBeenCalledWith("secret-value");
    expect(onCopied).toHaveBeenCalledWith("secret-value");
    expect(screen.getByText("Copied!")).toBeTruthy();
  });

  it("InlineLoading uses status role and exposes a label", () => {
    render(InlineLoading, { props: { label: "Saving…", status: "active" } });
    const node = screen.getByRole("status");
    expect(node.textContent).toContain("Saving…");
  });

  it("InlineLoading uses alert role when status is error", () => {
    render(InlineLoading, { props: { label: "Failed", status: "error" } });
    expect(screen.getByRole("alert").textContent).toContain("Failed");
  });

  it("SkeletonText renders the requested number of lines as a busy status", () => {
    const { container } = render(SkeletonText, { props: { lines: 3 } });
    const node = screen.getByRole("status", { name: "Loading…" });
    expect(node.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll(".st-skeleton__line").length).toBe(3);
  });

  it("Toggletip toggles its bubble on trigger click", async () => {
    render(Toggletip, { props: { content: "Helpful info", triggerLabel: "Help" } });
    const trigger = screen.getByRole("button", { name: "Help" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Helpful info")).toBeNull();
    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Helpful info")).toBeTruthy();
  });

  it("OverflowMenu toggles its menu on trigger click and fires onselect on item click", async () => {
    const onSelect = vi.fn();
    const itemClick = vi.fn();
    render(OverflowMenu, {
      props: {
        triggerLabel: "Row actions",
        items: [
          { value: "edit", label: "Edit", onclick: itemClick },
          { value: "delete", label: "Delete", danger: true }
        ],
        onselect: onSelect
      }
    });
    const trigger = screen.getByRole("button", { name: "Row actions" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("menu")).toBeNull();

    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = screen.getByRole("menu");
    expect(menu).toBeTruthy();

    const editItem = screen.getByRole("menuitem", { name: "Edit" });
    await fireEvent.click(editItem);
    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("edit");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("Header renders a banner with optional title", () => {
    render(Header, { props: { title: "Sentropic Console" } });
    const banner = screen.getByRole("banner", { name: "Application header" });
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain("Sentropic Console");
  });
});
