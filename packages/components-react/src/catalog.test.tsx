import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  Accordion,
  Alert,
  AreaChart,
  AspectRatio,
  BarChart,
  Breadcrumb,
  Button,
  ChatComposer,
  ChatMessage,
  ChatThread,
  Checkbox,
  CodeSnippet,
  Combobox,
  ContentSwitcher,
  CopyButton,
  DataTable,
  DatePicker,
  DonutChart,
  Drawer,
  Dropdown,
  EmptyState,
  FileUploader,
  Footer,
  ForceGraph,
  GraphLegend,
  nodeShapePath,
  Form,
  FormGroup,
  Header,
  Highlight,
  IconButton,
  InlineLoading,
  LanguageSelector,
  LineChart,
  Link,
  LoadingState,
  Menu,
  MenuPopover,
  MenuTriggerButton,
  MessageActions,
  MessageStatusBadge,
  Modal,
  MultiSelect,
  NumberInput,
  OrderedList,
  OverflowMenu,
  Pagination,
  PaginationNav,
  PasswordInput,
  Popover,
  ProgressBar,
  ProgressIndicator,
  Quote,
  Radio,
  ScatterPlot,
  Search,
  Select,
  SideNav,
  SkeletonText,
  SkipLink,
  Slider,
  Sparkline,
  StackedBarChart,
  StructuredList,
  Switch,
  Table,
  Tabs,
  Tag,
  Textarea,
  Tile,
  TileGroup,
  Toast,
  Toggle,
  Toggletip,
  Tooltip,
  TreeView,
  UnorderedList,
} from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("React public catalog parity", () => {
  it("renders form controls with the shared field and control anatomy", () => {
    render(
      <Form aria-label="Account form">
        <FormGroup legend="Identity">
          <Textarea label="Bio" helperText="Short profile" />
          <Select
            label="Role"
            options={[
              { label: "Designer", value: "designer" },
              { label: "Developer", value: "developer" },
            ]}
          />
          <Search label="Search" placeholder="Find" />
          <PasswordInput label="Password" />
          <NumberInput label="Seats" min={1} />
          <Checkbox label="Active" checked readOnly />
          <Radio label="Owner" checked readOnly />
          <Toggle label="Notifications" checked readOnly />
          <Switch label="Billing" checked readOnly />
          <Slider label="Usage" min={0} max={100} defaultValue={40} />
          <Dropdown label="Region" options={[{ label: "EU", value: "eu" }]} />
          <Combobox label="Team" options={[{ label: "Design", value: "design" }]} />
          <MultiSelect label="Scopes" options={[{ label: "Docs", value: "docs" }]} values={["docs"]} />
          <DatePicker label="Date" />
          <FileUploader label="Assets" items={[{ name: "logo.svg", status: "complete" }]} />
        </FormGroup>
      </Form>,
    );

    expect(screen.getByRole("form", { name: "Account form" }).className).toContain("st-form");
    expect(screen.getByText("Identity").className).toContain("st-formGroup__legend");
    expect(screen.getByLabelText("Bio").className).toContain("st-control");
    expect(screen.getByLabelText("Search").className).toContain("st-search__input");
    expect(screen.getByLabelText("Active").className).toContain("st-choice__input");
    expect(screen.getByRole("switch", { name: "Notifications" }).className).toContain("st-toggle__input");
    expect(screen.getByText("logo.svg").className).toContain("st-fileUploader__name");
  });

  it("renders navigation and command components", () => {
    render(
      <>
        <Header brand="Sentropic" navItems={[{ label: "Docs", href: "/docs" }]} />
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Components" }]} />
        <Tabs
          items={[
            { id: "usage", label: "Usage" },
            { id: "api", label: "API" },
          ]}
          activeId="api"
        />
        <ContentSwitcher
          items={[
            { id: "svelte", label: "Svelte" },
            { id: "react", label: "React" },
          ]}
          activeId="react"
        />
        <Pagination page={2} totalPages={5} />
        <PaginationNav previousHref="/a" nextHref="/c" label="Page navigation" />
        <SideNav items={[{ label: "Foundations", href: "/foundations" }]} />
        <Menu items={[{ label: "Copy" }, { label: "Archive" }]} />
        <MenuTriggerButton>Open</MenuTriggerButton>
        <MenuPopover items={[{ label: "Settings" }]} />
        <OverflowMenu items={[{ label: "Rename" }]} />
        <LanguageSelector options={[{ label: "Français", value: "fr" }]} value="fr" />
        <Link href="/docs">Read docs</Link>
        <Footer links={[{ label: "Privacy", href: "/privacy" }]} />
      </>,
    );

    expect(screen.getByRole("banner").className).toContain("st-header");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" }).className).toContain("st-breadcrumb");
    expect(screen.getByRole("tab", { name: "API" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("React").className).toContain("st-contentSwitcher__button");
    expect(screen.getByRole("navigation", { name: "Pagination" }).className).toContain("st-pagination");
    expect(screen.getByText("Foundations").className).toContain("st-sideNav__link");
    expect(screen.getAllByRole("menu")[0].className).toContain("st-menu");
    expect(screen.getByText("Read docs").className).toContain("st-link");
    expect(screen.getByRole("contentinfo").className).toContain("st-footer");
  });

  it("renders feedback, overlay and status components", () => {
    const onClose = vi.fn();
    render(
      <>
        <Alert tone="warning" title="Quota">Review usage</Alert>
        <Tag tone="info">Beta</Tag>
        <Tooltip content="More detail"><Button>Hover me</Button></Tooltip>
        <Toggletip label="Help">Helpful context</Toggletip>
        <Accordion items={[{ title: "Details", content: "Expanded text" }]} />
        <Modal open title="Confirm" onClose={onClose}>Proceed?</Modal>
        <Drawer open title="Filters" onClose={onClose}>Drawer body</Drawer>
        <Popover trigger={<Button>Open popover</Button>}>Popover body</Popover>
        <Toast tone="success" title="Saved" onClose={onClose}>All changes persisted</Toast>
        <InlineLoading label="Saving" />
        <LoadingState title="Loading" />
        <MessageStatusBadge status="sent" />
        <ProgressBar value={40} label="Progress" />
        <ProgressIndicator items={[{ label: "Draft", status: "complete" }, { label: "Review", status: "current" }]} />
        <SkeletonText lines={2} />
      </>,
    );

    expect(screen.getByRole("alert").className).toContain("st-alert");
    expect(screen.getByText("Beta").className).toContain("st-tag");
    expect(screen.getByText("More detail").className).toContain("st-tooltip");
    expect(screen.getByRole("dialog", { name: "Confirm" }).className).toContain("st-modal");
    expect(screen.getByRole("dialog", { name: "Filters" }).className).toContain("st-drawer");
    expect(screen.getByText("Saved").closest(".st-toast")).not.toBeNull();
    expect(screen.getByRole("progressbar").className).toContain("st-progressBar");
  });

  it("renders data, display, chart and AI-message surfaces", () => {
    render(
      <>
        <Table columns={[{ key: "name", label: "Name" }]} rows={[{ id: "1", name: "Alice" }]} />
        <DataTable columns={[{ key: "status", label: "Status" }]} rows={[{ id: "2", status: "Ready" }]} />
        <StructuredList items={[{ label: "Owner", value: "Design" }]} />
        <OrderedList items={["One", "Two"]} />
        <UnorderedList items={["Alpha", "Beta"]} />
        <CodeSnippet code="npm run verify" />
        <CopyButton value="copy-me" />
        <Highlight tone="success">Matched</Highlight>
        <Quote cite="System">Careful defaults</Quote>
        <AspectRatio ratio="16 / 9"><span>Media</span></AspectRatio>
        <Tile title="Plan" />
        <TileGroup items={[{ title: "Design", value: "design" }]} />
        <EmptyState title="No data" action={<Button>Refresh</Button>} />
        <TreeView nodes={[{ id: "root", label: "Root", children: [{ id: "leaf", label: "Leaf" }] }]} />
        <AreaChart data={[{ x: "Mon", y: 10 }]} label="Area chart" />
        <BarChart data={[{ label: "A", value: 4 }]} label="Bar chart" />
        <LineChart data={[{ x: "Mon", y: 10 }]} label="Line chart" />
        <DonutChart data={[{ label: "Used", value: 70 }]} label="Donut chart" />
        <ScatterPlot data={[{ x: 1, y: 2, label: "Point" }]} label="Scatter chart" />
        <StackedBarChart data={[{ label: "Q1", segments: [{ label: "A", value: 2 }] }]} label="Stacked chart" />
        <Sparkline data={[1, 2, 3]} />
        <ForceGraph label="Force graph" nodes={[{ id: "a", label: "A" }]} edges={[]} />
        <ChatThread>
          <ChatMessage role="assistant" content="Ready" />
          <ChatComposer value="" placeholder="Ask" />
        </ChatThread>
        <MessageActions actions={[{ label: "Copy" }]} />
        <ChatMessage role="user"><span>Custom child</span></ChatMessage>
      </>,
    );

    expect(screen.getByRole("table", { name: "Table" }).className).toContain("st-table");
    expect(screen.getAllByText("Ready").some((entry) => entry.closest(".st-dataTable"))).toBe(true);
    expect(screen.getByText("Owner").className).toContain("st-structuredList__term");
    expect(screen.getByText("npm run verify").className).toContain("st-codeSnippet__code");
    expect(screen.getByText("No data").className).toContain("st-emptyState__title");
    expect(screen.getByText("Root").className).toContain("st-treeView__label");
    expect(screen.getByLabelText("Area chart").className).toContain("st-areaChart");
    expect(screen.getAllByText("Ready").some((entry) => entry.closest(".st-chatMessage"))).toBe(true);
    expect(screen.getByPlaceholderText("Ask").className).toContain("st-chatComposer__input");
  });

  it("keeps icon and copy actions interactive", () => {
    const onClick = vi.fn();
    render(
      <>
        <IconButton aria-label="Refresh" onClick={onClick}>R</IconButton>
        <CopyButton value="abc" locale="en-US" />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Copy" }).className).toContain("st-copyButton");
  });

  it("renders nested ordered list children with the --nested modifier", () => {
    const { container } = render(
      <OrderedList
        items={[
          "Step",
          { content: "Group", children: ["Sub A", "Sub B"] },
        ]}
      />,
    );
    const root = container.querySelector("ol.st-orderedList") as HTMLOListElement;
    expect(root).toBeTruthy();
    expect(root.className).toBe("st-orderedList");
    const nested = root.querySelector("ol.st-orderedList--nested") as HTMLOListElement;
    expect(nested).toBeTruthy();
    expect(nested.classList.contains("st-orderedList")).toBe(true);
    expect(nested.querySelectorAll("li.st-orderedList__item").length).toBe(2);
  });

  it("renders nested unordered list children with the --nested modifier", () => {
    const { container } = render(
      <UnorderedList
        items={[
          "Forge",
          { content: "Sentropic", children: ["Tokens", "Themes"] },
        ]}
      />,
    );
    const root = container.querySelector("ul.st-unorderedList") as HTMLUListElement;
    expect(root).toBeTruthy();
    const nested = root.querySelector("ul.st-unorderedList--nested") as HTMLUListElement;
    expect(nested).toBeTruthy();
    expect(nested.classList.contains("st-unorderedList")).toBe(true);
    expect(nested.querySelectorAll("li.st-unorderedList__item").length).toBe(2);
  });

  it("Footer forwards arbitrary HTML attributes (data-*) onto <footer>", () => {
    const { container } = render(<Footer copyright="© 2026" data-form="newsletter" />);
    const footer = container.querySelector("footer.st-footer") as HTMLElement;
    expect(footer).toBeTruthy();
    expect(footer.getAttribute("data-form")).toBe("newsletter");
  });
});

describe("ForceGraph parity (0.10.4)", () => {
  it("nodeShapePath returns null for dot & circle and a path for other shapes", () => {
    expect(nodeShapePath("dot", 7)).toBeNull();
    expect(nodeShapePath("circle", 7)).toBeNull();
    expect(nodeShapePath(undefined, 7)).toBeNull();
    for (const shape of ["diamond", "star", "hexagon", "box", "square", "triangle"] as const) {
      const path = nodeShapePath(shape, 7);
      expect(path).not.toBeNull();
      expect(typeof path).toBe("string");
      expect((path as string).length).toBeGreaterThan(0);
    }
  });

  it("renders an svg with node groups and edge lines", () => {
    const { container } = render(
      <ForceGraph
        label="Knowledge graph"
        nodes={[
          { id: "a", label: "Alpha" },
          { id: "b", label: "Beta" },
        ]}
        edges={[{ source: "a", target: "b" }]}
      />,
    );

    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.querySelectorAll(".st-forceGraph__node").length).toBe(2);
    // one visible edge line + one hit-area line per edge
    expect(container.querySelectorAll(".st-forceGraph__edge").length).toBe(1);
    expect(container.querySelectorAll(".st-forceGraph__edgeHit").length).toBe(1);
    expect(screen.getByRole("img", { name: "Knowledge graph" })).toBeTruthy();
  });

  it("renders a path with st-forceGraph__shape for non-dot shapes", () => {
    const { container } = render(
      <ForceGraph
        label="Shapes"
        nodes={[
          { id: "a", label: "Alpha", shape: "diamond" },
          { id: "b", label: "Beta", shape: "dot" },
        ]}
        edges={[]}
      />,
    );

    const shapePath = container.querySelector("path.st-forceGraph__shape");
    expect(shapePath).toBeTruthy();
    // the dot node renders a circle, not a path
    expect(container.querySelectorAll("circle.st-forceGraph__shape").length).toBe(1);
  });

  it("renders the legend overlay when legend is set", () => {
    const { container } = render(
      <ForceGraph
        label="With legend"
        nodes={[{ id: "a", label: "Alpha" }]}
        edges={[]}
        legend={[
          { label: "Entity", shape: "circle", tone: "category1" },
          { label: "Weak link", weak: true },
        ]}
      />,
    );

    const legend = container.querySelector(".st-forceGraph__legend");
    expect(legend).toBeTruthy();
    expect(legend?.querySelectorAll(".st-forceGraph__legendEntry").length).toBe(2);
    expect(screen.getByText("Entity")).toBeTruthy();
    expect(screen.getByText("Weak link")).toBeTruthy();
  });

  it("fires onEdgeHover when an edge is hovered", () => {
    const onEdgeHover = vi.fn();
    const edge = { source: "a", target: "b", relation: "links" };
    const { container } = render(
      <ForceGraph
        label="Hover graph"
        nodes={[
          { id: "a", label: "Alpha" },
          { id: "b", label: "Beta" },
        ]}
        edges={[edge]}
        onEdgeHover={onEdgeHover}
      />,
    );

    const hit = container.querySelector(".st-forceGraph__edgeHit");
    expect(hit).toBeTruthy();
    fireEvent.mouseEnter(hit as Element);
    expect(onEdgeHover).toHaveBeenCalledTimes(1);
    expect(onEdgeHover).toHaveBeenCalledWith(edge);
  });

  it("GraphLegend renders exactly one entry per item", () => {
    const { container } = render(
      <GraphLegend
        title="Legend"
        entries={[
          { label: "One", shape: "circle" },
          { label: "Two", shape: "diamond", tone: "category2" },
          { label: "Three", weak: true },
        ]}
      />,
    );

    expect(container.querySelector(".st-graphLegend")).toBeTruthy();
    expect(container.querySelectorAll(".st-graphLegend__entry").length).toBe(3);
    expect(screen.getByText("Legend").className).toContain("st-graphLegend__title");
  });

  it("accepts a repulsion prop and renders without throwing", () => {
    const nodes = [
      { id: "a", label: "Alpha" },
      { id: "b", label: "Beta" },
      { id: "c", label: "Gamma" },
    ];
    const edges = [{ source: "a", target: "b" }];
    expect(() =>
      render(<ForceGraph label="Aéré" nodes={nodes} edges={edges} repulsion={4} />),
    ).not.toThrow();
    cleanup();
    expect(() =>
      render(<ForceGraph label="Compact" nodes={nodes} edges={edges} repulsion={0.2} />),
    ).not.toThrow();
  });

  it("hover dims non-neighbour nodes/edges but keeps the hovered node, its neighbours and incident edges full", () => {
    // a—b, b—c ; hovering b keeps {b, a, c} full and dims d (non-neighbour).
    // Edge a—b and b—c are incident to b (full) ; edge c—d is not (dimmed).
    const { container } = render(
      <ForceGraph
        label="Hover connexe"
        nodes={[
          { id: "a", label: "Alpha" },
          { id: "b", label: "Beta" },
          { id: "c", label: "Gamma" },
          { id: "d", label: "Delta" },
        ]}
        edges={[
          { source: "a", target: "b" },
          { source: "b", target: "c" },
          { source: "c", target: "d" },
        ]}
      />,
    );

    const nodeOf = (label: string) =>
      (container.querySelector(`[aria-label="${label}"]`) as Element).closest(
        ".st-forceGraph__node",
      ) as Element;
    const bShape = container.querySelector('[aria-label="Beta"]') as Element;

    fireEvent.mouseEnter(bShape);

    // Hovered node + direct neighbours stay full.
    expect(nodeOf("Beta").classList.contains("st-forceGraph__node--dim")).toBe(false);
    expect(nodeOf("Alpha").classList.contains("st-forceGraph__node--dim")).toBe(false);
    expect(nodeOf("Gamma").classList.contains("st-forceGraph__node--dim")).toBe(false);
    // Non-neighbour dims.
    expect(nodeOf("Delta").classList.contains("st-forceGraph__node--dim")).toBe(true);

    // Edges: incident to b stay full, the c—d edge dims.
    const edges = Array.from(container.querySelectorAll(".st-forceGraph__edge"));
    const dimmedEdges = edges.filter((e) =>
      e.classList.contains("st-forceGraph__edge--dim"),
    );
    expect(edges.length).toBe(3);
    expect(dimmedEdges.length).toBe(1);

    fireEvent.mouseLeave(bShape);
    // Hover cleared → nothing dimmed.
    expect(nodeOf("Delta").classList.contains("st-forceGraph__node--dim")).toBe(false);
  });

  it("fires onNodeHover with the node on enter and null on leave", () => {
    const onNodeHover = vi.fn();
    const { container } = render(
      <ForceGraph
        label="Node hover"
        nodes={[
          { id: "a", label: "Alpha" },
          { id: "b", label: "Beta" },
        ]}
        edges={[{ source: "a", target: "b" }]}
        onNodeHover={onNodeHover}
      />,
    );

    const aShape = container.querySelector('[aria-label="Alpha"]') as Element;
    fireEvent.mouseEnter(aShape);
    expect(onNodeHover).toHaveBeenCalledTimes(1);
    expect(onNodeHover).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "a", label: "Alpha" }),
    );
    fireEvent.mouseLeave(aShape);
    expect(onNodeHover).toHaveBeenCalledTimes(2);
    expect(onNodeHover).toHaveBeenLastCalledWith(null);
  });

  // -------------------------------------------------------------------------
  // mergePair (reconciliation merge animation)
  // -------------------------------------------------------------------------
  describe("mergePair merge animation", () => {
    const mergeNodes = [
      { id: "a", label: "Alpha" },
      { id: "b", label: "Beta" },
      { id: "c", label: "Gamma" },
    ];
    const mergeEdges = [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
    ];

    it("eventually calls onMergeComplete for a valid pair (id-based)", async () => {
      const onMergeComplete = vi.fn();
      render(
        <ForceGraph
          label="Merge"
          nodes={mergeNodes}
          edges={mergeEdges}
          mergePair={{ id: "m1", from: "a", into: "b" }}
          onMergeComplete={onMergeComplete}
        />,
      );
      // The rAF glide (or reduced-motion fast path) resolves; allow up to ~1.5s
      // for the animation to finish in the jsdom environment.
      await vi.waitFor(() => expect(onMergeComplete).toHaveBeenCalledTimes(1), {
        timeout: 1500,
      });
      expect(onMergeComplete.mock.calls[0][0]).toEqual({
        id: "m1",
        from: "a",
        into: "b",
      });
    });

    it("is idempotent on id: a new object with the same id does not replay", async () => {
      const onMergeComplete = vi.fn();
      const { rerender } = render(
        <ForceGraph
          label="Merge idempotent"
          nodes={mergeNodes}
          edges={mergeEdges}
          mergePair={{ id: "m1", from: "a", into: "b" }}
          onMergeComplete={onMergeComplete}
        />,
      );
      await vi.waitFor(() => expect(onMergeComplete).toHaveBeenCalledTimes(1), {
        timeout: 1500,
      });
      // Same id, fresh object → no-op.
      rerender(
        <ForceGraph
          label="Merge idempotent"
          nodes={mergeNodes}
          edges={mergeEdges}
          mergePair={{ id: "m1", from: "a", into: "b" }}
          onMergeComplete={onMergeComplete}
        />,
      );
      await new Promise((r) => setTimeout(r, 60));
      expect(onMergeComplete).toHaveBeenCalledTimes(1);
    });

    it("a NEW id replays the merge even for the same from/into", async () => {
      const onMergeComplete = vi.fn();
      const { rerender } = render(
        <ForceGraph
          label="Merge replay"
          nodes={mergeNodes}
          edges={mergeEdges}
          mergePair={{ id: "m1", from: "a", into: "b" }}
          onMergeComplete={onMergeComplete}
        />,
      );
      await vi.waitFor(() => expect(onMergeComplete).toHaveBeenCalledTimes(1), {
        timeout: 1500,
      });
      rerender(
        <ForceGraph
          label="Merge replay"
          nodes={mergeNodes}
          edges={mergeEdges}
          mergePair={{ id: "m2", from: "a", into: "b" }}
          onMergeComplete={onMergeComplete}
        />,
      );
      await vi.waitFor(() => expect(onMergeComplete).toHaveBeenCalledTimes(2), {
        timeout: 1500,
      });
      expect(onMergeComplete.mock.calls[1][0]).toEqual({
        id: "m2",
        from: "a",
        into: "b",
      });
    });

    it("masks the `from` node after completion until it is removed", async () => {
      const onMergeComplete = vi.fn();
      const { container } = render(
        <ForceGraph
          label="Merge mask"
          nodes={mergeNodes}
          edges={mergeEdges}
          mergePair={{ id: "m1", from: "a", into: "b" }}
          onMergeComplete={onMergeComplete}
        />,
      );
      await vi.waitFor(() => expect(onMergeComplete).toHaveBeenCalledTimes(1), {
        timeout: 1500,
      });
      // The `from` node group is aria-hidden (masked) after completion. The mask
      // is a React state update, so wait for the resulting re-render to flush.
      await vi.waitFor(
        () => {
          const masked = Array.from(
            container.querySelectorAll(".st-forceGraph__node"),
          ).filter((g) => g.getAttribute("aria-hidden") === "true");
          expect(masked.length).toBe(1);
        },
        { timeout: 1500 },
      );
    });

    it("cancels the in-flight glide (no callback) when `from` is removed mid-merge", async () => {
      const onMergeComplete = vi.fn();
      const { rerender } = render(
        <ForceGraph
          label="Merge cancel"
          nodes={mergeNodes}
          edges={mergeEdges}
          mergePair={{ id: "m1", from: "a", into: "b" }}
          onMergeComplete={onMergeComplete}
        />,
      );
      // Immediately remove `from` so the next frame re-validation cancels.
      rerender(
        <ForceGraph
          label="Merge cancel"
          nodes={mergeNodes.filter((n) => n.id !== "a")}
          edges={mergeEdges.filter((e) => e.source !== "a" && e.target !== "a")}
          mergePair={{ id: "m1", from: "a", into: "b" }}
          onMergeComplete={onMergeComplete}
        />,
      );
      await new Promise((r) => setTimeout(r, 120));
      expect(onMergeComplete).not.toHaveBeenCalled();
    });

    it("does not call onMergeComplete after unmount", async () => {
      const onMergeComplete = vi.fn();
      const { unmount } = render(
        <ForceGraph
          label="Merge unmount"
          nodes={mergeNodes}
          edges={mergeEdges}
          mergePair={{ id: "m1", from: "a", into: "b" }}
          onMergeComplete={onMergeComplete}
        />,
      );
      unmount();
      await new Promise((r) => setTimeout(r, 120));
      expect(onMergeComplete).not.toHaveBeenCalled();
    });

    it("reduced-motion path resolves on a microtask (no animation delay)", async () => {
      const original = window.matchMedia;
      window.matchMedia = ((q: string) => ({
        matches: true,
        media: q,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() {
          return false;
        },
      })) as typeof window.matchMedia;
      try {
        const onMergeComplete = vi.fn();
        render(
          <ForceGraph
            label="Merge reduced"
            nodes={mergeNodes}
            edges={mergeEdges}
            mergePair={{ id: "m1", from: "a", into: "b" }}
            onMergeComplete={onMergeComplete}
          />,
        );
        // The microtask fires almost immediately; a window well under the 450ms
        // animation duration still proves it resolved on the fast path (not via
        // the rAF glide), while tolerating event-loop jitter under full-suite load.
        await vi.waitFor(() => expect(onMergeComplete).toHaveBeenCalledTimes(1), {
          timeout: 300,
        });
        expect(onMergeComplete.mock.calls[0][0]).toEqual({
          id: "m1",
          from: "a",
          into: "b",
        });
      } finally {
        window.matchMedia = original;
      }
    });

    it("does not crash and never calls onMergeComplete for an invalid pair", async () => {
      const onMergeComplete = vi.fn();
      const { container } = render(
        <ForceGraph
          label="Merge invalid"
          nodes={mergeNodes}
          edges={mergeEdges}
          mergePair={{ id: "m1", from: "missing", into: "b" }}
          onMergeComplete={onMergeComplete}
        />,
      );
      expect(container.querySelectorAll(".st-forceGraph__node").length).toBe(3);
      await new Promise((r) => setTimeout(r, 40));
      expect(onMergeComplete).not.toHaveBeenCalled();
    });

    it("does nothing (no callback) when mergePair is null", async () => {
      const onMergeComplete = vi.fn();
      render(
        <ForceGraph
          label="No merge"
          nodes={mergeNodes}
          edges={mergeEdges}
          mergePair={null}
          onMergeComplete={onMergeComplete}
        />,
      );
      await new Promise((r) => setTimeout(r, 40));
      expect(onMergeComplete).not.toHaveBeenCalled();
    });
  });
});

describe("DatePicker controlled contract (Svelte parity)", () => {
  const openPanel = () => fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
  const enabledDay = () =>
    Array.from(document.querySelectorAll<HTMLButtonElement>(".st-datepicker__day")).find((d) => !d.disabled)!;

  it("exposes a dialog trigger with a11y attributes matching Svelte", () => {
    render(<DatePicker label="Date" openLabel="Open calendar" />);
    const trigger = screen.getByRole("button", { name: "Open calendar" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    openPanel();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("st-datepicker__panel");
    expect(document.querySelector(".st-datepicker__grid[role='grid']")).toBeTruthy();
    expect(document.querySelector(".st-datepicker__weekday[role='columnheader']")).toBeTruthy();
    const day = document.querySelector(".st-datepicker__day")!;
    expect(day.getAttribute("aria-label")).toBeTruthy();
    expect(day.getAttribute("aria-pressed")).toBe("false");
  });

  it("calls onChange with a Date in single mode and renders controlled value", () => {
    const onChange = vi.fn();
    render(<DatePicker label="Date" openLabel="Open calendar" value={new Date(2026, 4, 31)} onChange={onChange} locale="fr-FR" />);
    const input = document.querySelector<HTMLInputElement>(".st-datepicker__control")!;
    expect(input.value).toContain("31");
    openPanel();
    fireEvent.click(enabledDay());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it("emits a {start,end} payload in range mode (Date objects)", () => {
    const onChange = vi.fn();
    render(<DatePicker label="Range" openLabel="Open calendar" mode="range" value={{ start: null, end: null }} onChange={onChange} />);
    openPanel();
    const days = Array.from(document.querySelectorAll<HTMLButtonElement>(".st-datepicker__day")).filter((d) => !d.disabled);
    fireEvent.click(days[5]);
    const first = onChange.mock.calls[0][0] as { start: Date | null; end: Date | null };
    expect(first.start).toBeInstanceOf(Date);
    expect(first.end).toBeNull();

    // Second pick completes the range when the committed start is fed back in (controlled flow).
    cleanup();
    onChange.mockClear();
    render(<DatePicker label="Range" openLabel="Open calendar" mode="range" value={{ start: first.start, end: null }} onChange={onChange} />);
    openPanel();
    const days2 = Array.from(document.querySelectorAll<HTMLButtonElement>(".st-datepicker__day")).filter((d) => !d.disabled);
    fireEvent.click(days2[days2.length - 1]);
    const second = onChange.mock.calls[0][0] as { start: Date | null; end: Date | null };
    expect(second.start).toBeInstanceOf(Date);
    expect(second.end).toBeInstanceOf(Date);
  });

  it("works uncontrolled with defaultValue fallback", () => {
    const onChange = vi.fn();
    render(<DatePicker label="Date" openLabel="Open calendar" onChange={onChange} />);
    openPanel();
    fireEvent.click(enabledDay());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
    // Uncontrolled: the input now reflects the local selection.
    expect(document.querySelector<HTMLInputElement>(".st-datepicker__control")!.value).not.toBe("");
  });

  it("closes the panel on Escape", () => {
    render(<DatePicker label="Date" openLabel="Open calendar" />);
    openPanel();
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(document.querySelector(".st-datepicker__panel")).toBeNull();
  });
});
