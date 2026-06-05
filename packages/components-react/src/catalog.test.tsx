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
    expect(screen.getByLabelText("Notifications").className).toContain("st-toggle__input");
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
        <PaginationNav previousHref="/a" nextHref="/c" />
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
        <CopyButton value="abc" />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Copy" }).className).toContain("st-copyButton");
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
});
