import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Modal from "./lib/Modal.svelte";
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
});
