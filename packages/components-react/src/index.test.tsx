import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { sentTechTheme } from "@sentropic/design-system-themes";
import {
  Accordion,
  Alert,
  AreaChart,
  AspectRatio,
  Badge,
  BarChart,
  Breadcrumb,
  Button,
  Card,
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
  Input,
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
  StreamingMessage,
  StructuredList,
  Switch,
  Table,
  Tabs,
  Tag,
  Textarea,
  ThemeProvider,
  Tile,
  TileGroup,
  Toast,
  Toggle,
  Toggletip,
  Tooltip,
  TreeView,
  UnorderedList,
  deriveInitials,
} from "./index.js";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
});

const rows = [
  { id: "row-1", name: "Alpha", status: "Ready", count: 2 },
  { id: "row-2", name: "Beta", status: "Queued", count: 4 },
];

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status" },
  { key: "count", label: "Count", align: "end" as const },
];

const chartData = [
  { label: "Jan", x: "Jan", y: 12, value: 12, tone: "category1" as const },
  { label: "Feb", x: "Feb", y: 18, value: 18, tone: "category2" as const },
];

const componentCases: Array<{ name: string; element: React.ReactElement; text?: string; label?: string }> = [
  {
    name: "Accordion",
    element: <Accordion items={[{ id: "a", title: "Accordion title", content: "Accordion panel" }]} defaultOpenIds={["a"]} />,
    text: "Accordion panel",
  },
  { name: "Alert", element: <Alert title="Alert title" message="Alert message" tone="warning" />, text: "Alert message" },
  { name: "AreaChart", element: <AreaChart data={chartData} label="Area label" />, label: "Area label" },
  { name: "AspectRatio", element: <AspectRatio><span>Ratio content</span></AspectRatio>, text: "Ratio content" },
  { name: "Badge", element: <Badge tone="info">Badge text</Badge>, text: "Badge text" },
  { name: "BarChart", element: <BarChart data={chartData} label="Bar label" />, label: "Bar label" },
  { name: "Breadcrumb", element: <Breadcrumb items={[{ label: "Root", href: "/" }, { label: "Current", current: true }]} />, text: "Current" },
  { name: "Button", element: <Button variant="secondary">Button text</Button>, text: "Button text" },
  { name: "Card", element: <Card interactive>Card body</Card>, text: "Card body" },
  { name: "ChatComposer", element: <ChatComposer placeholder="Ask" submitLabel="Send message" />, text: "Send message" },
  { name: "ChatMessage", element: <ChatMessage role="assistant" content="Chat body" status="completed" />, text: "Chat body" },
  { name: "ChatThread", element: <ChatThread messages={[{ id: "m1", role: "user", content: "Thread message" }]} />, text: "Thread message" },
  { name: "Checkbox", element: <Checkbox label="Checkbox label" defaultChecked />, text: "Checkbox label" },
  { name: "CodeSnippet", element: <CodeSnippet code="npm run verify" />, text: "npm run verify" },
  { name: "Combobox", element: <Combobox label="Combobox label" options={[{ value: "one", label: "One" }]} value="one" />, text: "One" },
  { name: "ContentSwitcher", element: <ContentSwitcher items={[{ value: "one", label: "One" }]} value="one" />, text: "One" },
  { name: "CopyButton", element: <CopyButton text="copy me" label="Copy label" />, text: "Copy label" },
  { name: "DataTable", element: <DataTable columns={columns} rows={rows} caption="Data caption" />, text: "Alpha" },
  { name: "DatePicker", element: <DatePicker label="Date label" value="2026-05-31" />, text: "Date label" },
  { name: "DonutChart", element: <DonutChart data={chartData} label="Donut label" />, label: "Donut label" },
  { name: "Drawer", element: <Drawer open title="Drawer title">Drawer body</Drawer>, text: "Drawer body" },
  { name: "Dropdown", element: <Dropdown label="Dropdown label" options={[{ value: "one", label: "One" }]} value="one" />, text: "One" },
  { name: "EmptyState", element: <EmptyState title="Empty title" message="Empty message" />, text: "Empty message" },
  { name: "FileUploader", element: <FileUploader label="Upload files" items={[{ id: "f1", name: "report.pdf", size: 1200, status: "complete" }]} />, text: "report.pdf" },
  { name: "Footer", element: <Footer brand="SENT" columns={[{ title: "Column", links: [{ label: "Terms", href: "/terms" }] }]} />, text: "Terms" },
  { name: "ForceGraph", element: <ForceGraph label="Graph label" nodes={[{ id: "n1", label: "Node one" }]} edges={[]} />, text: "Node one" },
  { name: "Form", element: <Form status="error" message="Form message">Form body</Form>, text: "Form message" },
  { name: "FormGroup", element: <FormGroup legend="Group legend" helperText="Group help"><Input label="Nested field" /></FormGroup>, text: "Group help" },
  { name: "Header", element: <Header brand="SENT" title="Header title" navigation={[{ label: "Docs", href: "/docs" }]} account={{ name: "Ada Lovelace", email: "ada@example.com" }} />, text: "Docs" },
  { name: "Highlight", element: <Highlight title="Highlight title" tone="success">Highlight body</Highlight>, text: "Highlight body" },
  { name: "IconButton", element: <IconButton aria-label="Icon action">I</IconButton>, text: "I" },
  { name: "InlineLoading", element: <InlineLoading label="Inline loading" status="active" />, text: "Inline loading" },
  { name: "Input", element: <Input label="Input label" helperText="Input help" />, text: "Input help" },
  { name: "LanguageSelector", element: <LanguageSelector options={[{ value: "fr", label: "French" }]} value="fr" />, text: "French" },
  { name: "LineChart", element: <LineChart data={chartData} label="Line label" />, label: "Line label" },
  { name: "Link", element: <Link href="/docs">Link text</Link>, text: "Link text" },
  { name: "LoadingState", element: <LoadingState label="Loading label" />, text: "Loading label" },
  { name: "Menu", element: <Menu items={[{ id: "open", label: "Open item" }]} />, text: "Open item" },
  { name: "MenuPopover", element: <MenuPopover open trigger={<button type="button">Menu trigger</button>} items={[{ id: "open", label: "Menu item" }]} />, text: "Menu item" },
  { name: "MenuTriggerButton", element: <MenuTriggerButton open>Trigger text</MenuTriggerButton>, text: "Trigger text" },
  { name: "MessageActions", element: <MessageActions actions={[{ id: "copy", label: "Copy action" }]} />, text: "Copy action" },
  { name: "MessageStatusBadge", element: <MessageStatusBadge status="processing" />, text: "Processing" },
  { name: "Modal", element: <Modal open title="Modal title">Modal body</Modal>, text: "Modal body" },
  { name: "MultiSelect", element: <MultiSelect label="Multi label" options={[{ value: "one", label: "One" }]} value={["one"]} />, text: "One" },
  { name: "NumberInput", element: <NumberInput label="Number label" value={3} />, text: "Number label" },
  { name: "OrderedList", element: <OrderedList items={["First item"]} />, text: "First item" },
  { name: "OverflowMenu", element: <OverflowMenu open label="More" items={[{ id: "archive", label: "Archive item" }]} />, text: "Archive item" },
  { name: "Pagination", element: <Pagination page={2} pageSize={10} totalItems={40} />, text: "11-20 of 40" },
  { name: "PaginationNav", element: <PaginationNav page={2} totalPages={4} />, text: "Page 2" },
  { name: "PasswordInput", element: <PasswordInput label="Password label" value="secret" />, text: "Password label" },
  { name: "Popover", element: <Popover content="Popover body" open><button type="button">Popover trigger</button></Popover>, text: "Popover body" },
  { name: "ProgressBar", element: <ProgressBar label="Progress label" value={60} />, text: "60%" },
  { name: "ProgressIndicator", element: <ProgressIndicator items={[{ id: "one", label: "Step one", status: "complete" }]} />, text: "Step one" },
  { name: "Quote", element: <Quote author="Grace Hopper">Quote body</Quote>, text: "Quote body" },
  { name: "Radio", element: <Radio label="Radio label" defaultChecked />, text: "Radio label" },
  { name: "ScatterPlot", element: <ScatterPlot data={[{ x: 1, y: 2, label: "Point one" }]} label="Scatter label" />, label: "Scatter label" },
  { name: "Search", element: <Search label="Search label" value="query" />, text: "Search label" },
  { name: "Select", element: <Select label="Select label" value="one"><option value="one">One</option></Select>, text: "Select label" },
  { name: "SideNav", element: <SideNav items={[{ label: "Side item", href: "/side", active: true }]} />, text: "Side item" },
  { name: "SkeletonText", element: <SkeletonText lines={2} label="Loading skeleton" />, text: "Loading skeleton" },
  { name: "SkipLink", element: <SkipLink href="#main">Skip target</SkipLink>, text: "Skip target" },
  { name: "Slider", element: <Slider label="Slider label" value={40} />, text: "40" },
  { name: "Sparkline", element: <Sparkline data={[1, 3, 2]} label="Sparkline label" />, label: "Sparkline label" },
  { name: "StackedBarChart", element: <StackedBarChart data={[{ label: "Q1", segments: [{ label: "Won", value: 7 }] }]} label="Stacked label" />, label: "Stacked label" },
  { name: "StreamingMessage", element: <StreamingMessage text="Streaming body" events={[{ id: "e1", label: "Tool call" }]} />, text: "Streaming body" },
  { name: "StructuredList", element: <StructuredList items={[{ term: "Term", description: "Definition" }]} />, text: "Definition" },
  { name: "Switch", element: <Switch label="Switch label" defaultChecked />, text: "Switch label" },
  { name: "Table", element: <Table columns={columns} rows={rows} caption="Table caption" />, text: "Beta" },
  { name: "Tabs", element: <Tabs items={[{ value: "one", label: "One", content: "Panel one" }]} />, text: "Panel one" },
  { name: "Tag", element: <Tag tone="success">Tag text</Tag>, text: "Tag text" },
  { name: "Textarea", element: <Textarea label="Textarea label" value="Body" />, text: "Textarea label" },
  { name: "Tile", element: <Tile title="Tile title" description="Tile description" />, text: "Tile description" },
  { name: "TileGroup", element: <TileGroup legend="Tile group" items={[{ value: "one", title: "Tile option", description: "Tile copy" }]} value="one" />, text: "Tile copy" },
  { name: "Toast", element: <Toast title="Toast title" message="Toast message" />, text: "Toast message" },
  { name: "Toggle", element: <Toggle label="Toggle label" defaultChecked />, text: "Toggle label" },
  { name: "Toggletip", element: <Toggletip label="Tip label" content="Tip content" open />, text: "Tip content" },
  { name: "Tooltip", element: <Tooltip content="Tooltip content"><button type="button">Hover target</button></Tooltip>, text: "Tooltip content" },
  { name: "TreeView", element: <TreeView nodes={[{ id: "root", label: "Root node", children: [{ id: "child", label: "Child node" }] }]} defaultExpandedIds={["root"]} />, text: "Child node" },
  { name: "UnorderedList", element: <UnorderedList items={["Bullet item"]} />, text: "Bullet item" },
];

describe("React design system catalogue", () => {
  for (const componentCase of componentCases) {
    it(`renders ${componentCase.name} with the shared DS class contract`, () => {
      render(componentCase.element);
      if (componentCase.label !== undefined) {
        expect(screen.getByLabelText(componentCase.label)).toBeTruthy();
      } else {
        expect(screen.getByText(componentCase.text as string)).toBeTruthy();
      }
      expect(document.querySelector(`[class*="st-"]`)).toBeTruthy();
    });
  }

  it("renders ThemeProvider with scoped theme data and CSS injection", () => {
    render(
      <ThemeProvider theme={sentTechTheme}>
        <Button>Inside</Button>
      </ThemeProvider>,
    );

    const wrapper = screen.getByRole("button", { name: "Inside" }).parentElement;
    expect(wrapper?.getAttribute("data-st-theme")).toBe(sentTechTheme.id);
    const style = document.head.querySelector("style[data-st-theme-provider='sent-tech']");
    expect(style?.textContent).toContain('[data-st-theme="sent-tech"]');
    expect(style?.textContent).toContain("--st-semantic-text-primary");
  });

  it("keeps lightweight interactions wired", () => {
    const onChange = vi.fn();
    render(<Accordion items={[{ id: "a", title: "Toggle me", content: "Hidden body" }]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle me" }));
    expect(onChange).toHaveBeenCalledWith(["a"]);
    expect(screen.getByText("Hidden body")).toBeTruthy();
  });

  it("derives initials from account names", () => {
    expect(deriveInitials("Ada Lovelace")).toBe("AL");
  });
});
