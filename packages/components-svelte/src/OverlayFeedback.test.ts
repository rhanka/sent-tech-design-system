import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import Accordion from "./lib/Accordion.svelte";
import Modal from "./lib/Modal.svelte";
import Tag from "./lib/Tag.svelte";
import Toast from "./lib/Toast.svelte";
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
});
