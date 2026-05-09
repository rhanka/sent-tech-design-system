import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Alert from "./lib/Alert.svelte";
import Drawer from "./lib/Drawer.svelte";
import Dropdown from "./lib/Dropdown.svelte";
import EmptyState from "./lib/EmptyState.svelte";
import Link from "./lib/Link.svelte";
import LoadingState from "./lib/LoadingState.svelte";
import Menu from "./lib/Menu.svelte";
import Popover from "./lib/Popover.svelte";

const content = createRawSnippet(() => ({ render: () => "<p>Panel content</p>" }));
const action = createRawSnippet(() => ({ render: () => '<button type="button">Create</button>' }));
const trigger = createRawSnippet(() => ({ render: () => '<button type="button">Details</button>' }));

describe("plan completion components", () => {
  it("renders links with native href and disabled state", () => {
    render(Link, {
      props: {
        href: "/components",
        children: createRawSnippet(() => ({ render: () => "<span>Components</span>" }))
      }
    });
    render(Link, {
      props: {
        href: "/disabled",
        disabled: true,
        children: createRawSnippet(() => ({ render: () => "<span>Disabled</span>" }))
      }
    });

    expect(screen.getByRole("link", { name: "Components" }).getAttribute("href")).toBe(
      "/components"
    );
    expect(screen.getByText("Disabled").closest("a")?.getAttribute("aria-disabled")).toBe("true");
  });

  it("renders alert tones with appropriate live region semantics", () => {
    render(Alert, { props: { tone: "error", title: "Failed", message: "Retry later" } });
    render(Alert, { props: { tone: "success", title: "Saved" } });

    expect(screen.getByRole("alert").textContent).toContain("Failed");
    expect(screen.getByRole("status").textContent).toContain("Saved");
  });

  it("renders menu items and emits item actions", async () => {
    let selected = "";
    render(Menu, {
      props: {
        label: "Actions",
        items: [
          { label: "Edit", value: "edit" },
          { label: "Archive", value: "archive", disabled: true }
        ],
        onselect: (value: string) => {
          selected = value;
        }
      }
    });

    await fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(selected).toBe("edit");
    expect(screen.getByRole("menuitem", { name: "Archive" }).getAttribute("aria-disabled")).toBe(
      "true"
    );
  });

  it("renders popover and drawer only when open", () => {
    render(Popover, { props: { open: true, label: "Details", trigger, children: content } });
    render(Drawer, { props: { open: true, title: "Inspector", children: content } });
    render(Drawer, { props: { open: false, title: "Closed", children: content } });

    expect(screen.getByRole("dialog", { name: "Details" })).toBeTruthy();
    expect(screen.getByRole("dialog", { name: "Inspector" })).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Closed" })).toBeNull();
  });

  it("renders dropdown options with selected state", async () => {
    let selected = "";
    render(Dropdown, {
      props: {
        label: "Product",
        value: "forge",
        options: [
          { label: "Forge", value: "forge" },
          { label: "Entropic", value: "entropic" }
        ],
        onselect: (value: string) => {
          selected = value;
        }
      }
    });

    await fireEvent.click(screen.getByRole("button", { name: "Product: Forge" }));
    await fireEvent.click(screen.getByRole("option", { name: "Entropic" }));
    expect(selected).toBe("entropic");
  });

  it("renders empty and loading states with accessible labels", () => {
    render(EmptyState, { props: { title: "No services", message: "Create the first service.", action } });
    render(LoadingState, { props: { label: "Loading services" } });

    expect(screen.getByText("No services")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
    expect(screen.getByRole("status", { name: "Loading services" }).getAttribute("aria-busy")).toBe(
      "true"
    );
  });
});
