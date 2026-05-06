import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Breadcrumb from "./lib/Breadcrumb.svelte";
import Pagination from "./lib/Pagination.svelte";
import SideNav from "./lib/SideNav.svelte";
import Table from "./lib/Table.svelte";
import Tabs from "./lib/Tabs.svelte";

describe("data and navigation components", () => {
  it("renders table caption, headers and row cells", () => {
    render(Table, {
      props: {
        caption: "Products",
        columns: [
          { key: "name", label: "Name" },
          { key: "status", label: "Status" }
        ],
        rows: [
          { id: "forge", name: "Forge", status: "Active" },
          { id: "entropic", name: "Entropic", status: "Refactor" }
        ]
      }
    });

    expect(screen.getByText("Products")).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Forge" })).toBeTruthy();
  });

  it("renders tabs and changes selected panel", async () => {
    render(Tabs, {
      props: {
        items: [
          { value: "overview", label: "Overview", content: "Overview content" },
          { value: "usage", label: "Usage", content: "Usage content" }
        ]
      }
    });

    expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    await fireEvent.click(screen.getByRole("tab", { name: "Usage" }));
    expect(screen.getByRole("tab", { name: "Usage" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Usage content")).toBeTruthy();
  });

  it("renders pagination with current page and disabled previous", () => {
    render(Pagination, { props: { page: 1, pageCount: 3 } });
    expect(screen.getByRole("button", { name: "Previous" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe(
      "page"
    );
  });

  it("renders breadcrumbs with current page", () => {
    render(Breadcrumb, {
      props: {
        items: [
          { label: "Home", href: "/" },
          { label: "Components", href: "/components" },
          { label: "Data", current: true }
        ]
      }
    });

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    expect(screen.getByText("Data").getAttribute("aria-current")).toBe("page");
  });

  it("renders side navigation with active page", () => {
    render(SideNav, {
      props: {
        label: "Components",
        items: [
          { label: "Forms", href: "/components/forms" },
          { label: "Data", href: "/components/data-navigation", active: true }
        ]
      }
    });

    expect(screen.getByRole("navigation", { name: "Components" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Data" }).getAttribute("aria-current")).toBe("page");
  });
});
