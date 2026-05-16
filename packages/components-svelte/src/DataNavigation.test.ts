import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import AspectRatio from "./lib/AspectRatio.svelte";
import Breadcrumb from "./lib/Breadcrumb.svelte";
import ContentSwitcher from "./lib/ContentSwitcher.svelte";
import DataTable from "./lib/DataTable.svelte";
import Pagination from "./lib/Pagination.svelte";
import PaginationNav from "./lib/PaginationNav.svelte";
import ProgressIndicator from "./lib/ProgressIndicator.svelte";
import SideNav from "./lib/SideNav.svelte";
import StructuredList from "./lib/StructuredList.svelte";
import Table from "./lib/Table.svelte";
import Tabs from "./lib/Tabs.svelte";
import UnorderedList from "./lib/UnorderedList.svelte";

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

  it("renders DataTable caption, headers and cell values", () => {
    render(DataTable, {
      props: {
        caption: "Services",
        columns: [
          { key: "name", label: "Name" },
          { key: "status", label: "Status" }
        ],
        rows: [
          { id: "1", name: "Forge", status: "Active" },
          { id: "2", name: "Entropic", status: "Refactor" }
        ]
      }
    });

    expect(screen.getByText("Services")).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Forge" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Entropic" })).toBeTruthy();
  });

  it("DataTable sorts rows when a sortable header is clicked", async () => {
    render(DataTable, {
      props: {
        columns: [
          { key: "name", label: "Name" },
          { key: "score", label: "Score" }
        ],
        rows: [
          { id: "a", name: "Charlie", score: 30 },
          { id: "b", name: "Alpha", score: 10 },
          { id: "c", name: "Bravo", score: 20 }
        ]
      }
    });

    const header = screen.getByRole("columnheader", { name: /Name/ });
    expect(header.getAttribute("aria-sort")).toBe("none");

    await fireEvent.click(within(header).getByRole("button"));
    expect(header.getAttribute("aria-sort")).toBe("ascending");

    const rows = screen.getAllByRole("row").slice(1);
    const firstRowName = within(rows[0]).getAllByRole("cell")[0].textContent?.trim();
    expect(firstRowName).toBe("Alpha");

    await fireEvent.click(within(header).getByRole("button"));
    expect(header.getAttribute("aria-sort")).toBe("descending");
    const rowsDesc = screen.getAllByRole("row").slice(1);
    const firstRowDesc = within(rowsDesc[0]).getAllByRole("cell")[0].textContent?.trim();
    expect(firstRowDesc).toBe("Charlie");
  });

  it("DataTable selects multiple rows via checkboxes and select-all", async () => {
    let selected: string[] = [];
    render(DataTable, {
      props: {
        selectable: "multiple",
        selectedIds: selected,
        columns: [{ key: "name", label: "Name", sortable: false }],
        rows: [
          { id: "a", name: "Forge" },
          { id: "b", name: "Entropic" }
        ],
        onRowClick: undefined
      }
    });

    const rowCheckboxes = screen
      .getAllByRole("checkbox")
      .filter((cb) => cb.getAttribute("aria-label")?.startsWith("Select row"));
    expect(rowCheckboxes).toHaveLength(2);

    await fireEvent.click(rowCheckboxes[0]);
    expect((rowCheckboxes[0] as HTMLInputElement).checked).toBe(true);

    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" });
    await fireEvent.click(selectAll);
    const refreshed = screen
      .getAllByRole("checkbox")
      .filter((cb) => cb.getAttribute("aria-label")?.startsWith("Select row"));
    expect((refreshed[0] as HTMLInputElement).checked).toBe(true);
    expect((refreshed[1] as HTMLInputElement).checked).toBe(true);
  });

  it("DataTable paginates rows when pageSize is set", async () => {
    render(DataTable, {
      props: {
        pageSize: 2,
        columns: [{ key: "name", label: "Name", sortable: false }],
        rows: [
          { id: "a", name: "Alpha" },
          { id: "b", name: "Bravo" },
          { id: "c", name: "Charlie" },
          { id: "d", name: "Delta" }
        ]
      }
    });

    expect(screen.getByRole("cell", { name: "Alpha" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Bravo" })).toBeTruthy();
    expect(screen.queryByRole("cell", { name: "Charlie" })).toBeNull();

    await fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("cell", { name: "Charlie" })).toBeTruthy();
    expect(screen.queryByRole("cell", { name: "Alpha" })).toBeNull();
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

  it("renders ContentSwitcher options as tabs and selects current value", () => {
    render(ContentSwitcher, {
      props: {
        label: "Vue",
        value: "table",
        items: [
          { value: "table", label: "Table" },
          { value: "card", label: "Cartes" }
        ]
      }
    });
    const group = screen.getByRole("tablist", { name: "Vue" });
    const table = within(group).getByRole("tab", { name: "Table" });
    const card = within(group).getByRole("tab", { name: "Cartes" });
    expect(table.getAttribute("aria-selected")).toBe("true");
    expect(card.getAttribute("aria-selected")).toBe("false");
  });

  it("ContentSwitcher fires onchange when a different option is clicked", async () => {
    let latest = "table";
    render(ContentSwitcher, {
      props: {
        label: "Vue",
        value: "table",
        items: [
          { value: "table", label: "Table" },
          { value: "card", label: "Cartes" }
        ],
        onchange: (next: string) => {
          latest = next;
        }
      }
    });
    await fireEvent.click(screen.getByRole("tab", { name: "Cartes" }));
    expect(latest).toBe("card");
  });

  it("PaginationNav renders ellipses, current page marker and previous/next bounds", () => {
    render(PaginationNav, { props: { page: 6, pageCount: 20, siblings: 1 } });

    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(nav).toBeTruthy();
    expect(within(nav).getAllByText("…").length).toBe(2);
    const current = within(nav).getByRole("button", { name: "Page 6" });
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("button", { name: "Page 1" })).toBeTruthy();
    expect(within(nav).getByRole("button", { name: "Page 20" })).toBeTruthy();
    expect(within(nav).getByRole("button", { name: "Previous page" })).toHaveProperty(
      "disabled",
      false
    );
    expect(within(nav).getByRole("button", { name: "Next page" })).toHaveProperty(
      "disabled",
      false
    );
  });

  it("PaginationNav disables previous on first page and fires onPageChange when clicked", async () => {
    let latest = 1;
    render(PaginationNav, {
      props: {
        page: 1,
        pageCount: 5,
        onPageChange: (next: number) => {
          latest = next;
        }
      }
    });
    expect(screen.getByRole("button", { name: "Previous page" })).toHaveProperty("disabled", true);
    await fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(latest).toBe(3);
  });

  it("ProgressIndicator renders ordered steps with current aria marker", () => {
    render(ProgressIndicator, {
      props: {
        items: [
          { value: "intake", label: "Intake", status: "complete" },
          { value: "review", label: "Review", description: "QA + sign-off", status: "current" },
          { value: "publish", label: "Publish", status: "upcoming" }
        ]
      }
    });
    const list = screen.getByRole("list", { name: "Progress" });
    expect(list).toBeTruthy();
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[1].getAttribute("aria-current")).toBe("step");
    expect(items[0].getAttribute("aria-current")).toBeNull();
    expect(within(list).getByText("QA + sign-off")).toBeTruthy();
  });

  it("AspectRatio wraps children in a container with the requested CSS aspect-ratio", () => {
    const children = createRawSnippet(() => ({
      render: () => '<img alt="cover" src="data:," />'
    }));
    const { container } = render(AspectRatio, {
      props: { ratio: "4/3", children }
    });
    const wrapper = container.querySelector(".st-aspectRatio") as HTMLDivElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.aspectRatio).toBe("4/3");
    expect(wrapper.querySelector("img")).toBeTruthy();
  });

  it("StructuredList renders one <dt>/<dd> pair per item", () => {
    const { container } = render(StructuredList, {
      props: {
        items: [
          { key: "Tenant", value: "Sentropic" },
          { key: "Env", value: "production" }
        ]
      }
    });
    const dl = container.querySelector("dl.st-structuredList") as HTMLDListElement;
    expect(dl).toBeTruthy();
    const terms = dl.querySelectorAll("dt");
    const definitions = dl.querySelectorAll("dd");
    expect(terms).toHaveLength(2);
    expect(definitions).toHaveLength(2);
    expect(terms[0].textContent?.trim()).toBe("Tenant");
    expect(definitions[0].textContent?.trim()).toBe("Sentropic");
    expect(terms[1].textContent?.trim()).toBe("Env");
    expect(definitions[1].textContent?.trim()).toBe("production");
  });

  it("UnorderedList renders string items and supports nested children", () => {
    const { container } = render(UnorderedList, {
      props: {
        items: [
          { content: "Forge" },
          {
            content: "Sentropic",
            children: [{ content: "Tokens" }, { content: "Themes" }]
          }
        ]
      }
    });
    const root = container.querySelector("ul.st-unorderedList") as HTMLUListElement;
    expect(root).toBeTruthy();
    const directItems = Array.from(root.children).filter((c) => c.tagName === "LI");
    expect(directItems).toHaveLength(2);
    const nested = directItems[1].querySelector("ul");
    expect(nested).toBeTruthy();
    expect(nested?.querySelectorAll("li")).toHaveLength(2);
    expect(screen.getByText("Tokens")).toBeTruthy();
    expect(screen.getByText("Themes")).toBeTruthy();
  });
});
