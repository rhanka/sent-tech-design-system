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
    expect(screen.getByRole("complementary", { name: "Filters" }).className).toContain("st-drawer");
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
        <AreaChart data={[{ x: "Mon", y: 10 }]} />
        <BarChart data={[{ label: "A", value: 4 }]} />
        <LineChart data={[{ x: "Mon", y: 10 }]} />
        <DonutChart data={[{ label: "Used", value: 70 }]} />
        <ScatterPlot data={[{ x: 1, y: 2, label: "Point" }]} />
        <StackedBarChart data={[{ label: "Q1", segments: [{ label: "A", value: 2 }] }]} />
        <Sparkline data={[1, 2, 3]} />
        <ForceGraph nodes={[{ id: "a", label: "A" }]} edges={[]} />
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
