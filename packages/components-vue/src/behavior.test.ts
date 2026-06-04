import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
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
  GraphLegend,
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
  nodeShapePath,
} from "./index.js";

describe("Vue behavioral parity — primitives", () => {
  // --- Button ---
  describe("Button", () => {
    it("renders with default classes st-button--primary and st-button--md", () => {
      const wrapper = mount(Button, { slots: { default: "Click" } });
      const btn = wrapper.find("button");
      expect(btn.classes()).toContain("st-button");
      expect(btn.classes()).toContain("st-button--primary");
      expect(btn.classes()).toContain("st-button--md");
    });

    it("applies variant and size modifier classes", () => {
      const wrapper = mount(Button, {
        props: { variant: "ghost", size: "sm" },
        slots: { default: "Go" },
      });
      const btn = wrapper.find("button");
      expect(btn.classes()).toContain("st-button--ghost");
      expect(btn.classes()).toContain("st-button--sm");
    });

    it("passes disabled attribute", () => {
      const wrapper = mount(Button, {
        props: { disabled: true },
        slots: { default: "Disabled" },
      });
      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("renders slot content", () => {
      const wrapper = mount(Button, { slots: { default: "Hello" } });
      expect(wrapper.text()).toBe("Hello");
    });

    it("defaults to type=button", () => {
      const wrapper = mount(Button, { slots: { default: "X" } });
      expect(wrapper.find("button").attributes("type")).toBe("button");
    });
  });

  // --- Card ---
  describe("Card", () => {
    it("renders a section with st-card class", () => {
      const wrapper = mount(Card, { slots: { default: "Content" } });
      const section = wrapper.find("section");
      expect(section.classes()).toContain("st-card");
      expect(section.classes()).not.toContain("st-card--interactive");
    });

    it("adds st-card--interactive when prop is true", () => {
      const wrapper = mount(Card, {
        props: { interactive: true },
        slots: { default: "Content" },
      });
      expect(wrapper.find("section").classes()).toContain("st-card--interactive");
    });
  });

  // --- Badge ---
  describe("Badge", () => {
    it("renders a span with st-badge and default tone st-badge--neutral", () => {
      const wrapper = mount(Badge, { slots: { default: "New" } });
      const span = wrapper.find("span");
      expect(span.classes()).toContain("st-badge");
      expect(span.classes()).toContain("st-badge--neutral");
    });

    it("applies tone modifier class", () => {
      const wrapper = mount(Badge, {
        props: { tone: "success" },
        slots: { default: "OK" },
      });
      expect(wrapper.find("span").classes()).toContain("st-badge--success");
    });
  });

  // --- Input ---
  describe("Input", () => {
    it("renders a div.st-field with a label and an input.st-control", () => {
      const wrapper = mount(Input, { props: { label: "Name" } });
      expect(wrapper.find(".st-field").exists()).toBe(true);
      expect(wrapper.find(".st-field__label").text()).toBe("Name");
      expect(wrapper.find("input.st-control").exists()).toBe(true);
    });

    it("adds st-control--sm with size=sm", () => {
      const wrapper = mount(Input, { props: { size: "sm" } });
      expect(wrapper.find("input").classes()).toContain("st-control--sm");
    });

    it("sets aria-invalid=true when errorText is provided", () => {
      const wrapper = mount(Input, { props: { errorText: "Required" } });
      expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
      expect(wrapper.find(".st-field__error").text()).toBe("Required");
    });

    it("shows helperText when no errorText", () => {
      const wrapper = mount(Input, { props: { helperText: "Hint" } });
      expect(wrapper.find(".st-field__help").text()).toBe("Hint");
    });

    it("emits update:modelValue on input event", async () => {
      const wrapper = mount(Input);
      await wrapper.find("input").setValue("hello");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["hello"]);
    });
  });

  // --- Checkbox ---
  describe("Checkbox", () => {
    it("renders a label.st-choice--checkbox with the label text", () => {
      const wrapper = mount(Checkbox, { props: { label: "Accept" } });
      expect(wrapper.find("label").classes()).toContain("st-choice");
      expect(wrapper.find("label").classes()).toContain("st-choice--checkbox");
      expect(wrapper.find(".st-choice__label").text()).toBe("Accept");
    });

    it("renders a checkbox input", () => {
      const wrapper = mount(Checkbox, { props: { label: "Accept" } });
      expect(wrapper.find("input[type=checkbox]").exists()).toBe(true);
    });

    it("sets aria-invalid=true when invalid", () => {
      const wrapper = mount(Checkbox, { props: { label: "Accept", invalid: true } });
      expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
    });

    it("shows helperText when provided", () => {
      const wrapper = mount(Checkbox, { props: { label: "Accept", helperText: "Optional" } });
      expect(wrapper.find(".st-choice__help").text()).toBe("Optional");
    });

    it("emits update:modelValue on change", async () => {
      const wrapper = mount(Checkbox, { props: { label: "Accept", modelValue: false } });
      await wrapper.find("input").setValue(true);
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });
  });

  // --- Radio ---
  describe("Radio", () => {
    it("renders a label.st-choice--radio with the label text", () => {
      const wrapper = mount(Radio, { props: { label: "Owner", value: "owner" } });
      expect(wrapper.find("label").classes()).toContain("st-choice");
      expect(wrapper.find("label").classes()).toContain("st-choice--radio");
      expect(wrapper.find(".st-choice__label").text()).toBe("Owner");
    });

    it("renders a radio input", () => {
      const wrapper = mount(Radio, { props: { label: "Owner", value: "owner" } });
      expect(wrapper.find("input[type=radio]").exists()).toBe(true);
    });
  });

  // --- ThemeProvider ---
  describe("ThemeProvider", () => {
    it("renders a div with data-st-theme attribute", () => {
      const wrapper = mount(ThemeProvider, {
        slots: { default: "child" },
        attachTo: document.body,
      });
      const div = wrapper.find("div[data-st-theme]");
      expect(div.exists()).toBe(true);
      wrapper.unmount();
    });
  });

  // --- Export surface (batch 1) ---
  describe("export surface — batch 1", () => {
    it("exports all expected components", () => {
      const exports = { Badge, Button, Card, Checkbox, Input, Radio, ThemeProvider };
      for (const [name, component] of Object.entries(exports)) {
        expect(component, `${name} should be exported`).toBeDefined();
        expect(typeof component).toBe("object");
      }
    });

    it("each component has a name property", () => {
      expect(Button.name).toBe("Button");
      expect(Card.name).toBe("Card");
      expect(Badge.name).toBe("Badge");
      expect(Input.name).toBe("Input");
      expect(Checkbox.name).toBe("Checkbox");
      expect(Radio.name).toBe("Radio");
      expect(ThemeProvider.name).toBe("ThemeProvider");
    });
  });
});

// ─── Batch 2: new components ────────────────────────────────────────────────

describe("Vue behavioral parity — batch 2", () => {
  // --- Accordion ---
  describe("Accordion", () => {
    it("renders a div.st-accordion", () => {
      const wrapper = mount(Accordion, {
        props: { items: [{ title: "Q", content: "A" }] },
      });
      expect(wrapper.find(".st-accordion").exists()).toBe(true);
    });

    it("renders accordion items with triggers", () => {
      const wrapper = mount(Accordion, {
        props: {
          items: [
            { id: "item1", title: "Section 1", content: "Body 1" },
            { id: "item2", title: "Section 2", content: "Body 2" },
          ],
        },
      });
      expect(wrapper.findAll(".st-accordion__trigger").length).toBe(2);
    });

    it("opens an item when trigger is clicked", async () => {
      const wrapper = mount(Accordion, {
        props: {
          items: [{ id: "x", title: "Title", content: "Content" }],
        },
      });
      expect(wrapper.find(".st-accordion__panel").exists()).toBe(false);
      await wrapper.find(".st-accordion__trigger").trigger("click");
      expect(wrapper.find(".st-accordion__panel").exists()).toBe(true);
    });

    it("emits change when toggled", async () => {
      const wrapper = mount(Accordion, {
        props: { items: [{ id: "a", title: "T", content: "C" }] },
      });
      await wrapper.find(".st-accordion__trigger").trigger("click");
      expect(wrapper.emitted("change")).toBeTruthy();
    });

    it("has name Accordion", () => {
      expect(Accordion.name).toBe("Accordion");
    });
  });

  // --- Alert ---
  describe("Alert", () => {
    it("renders section.st-alert with default tone info", () => {
      const wrapper = mount(Alert, { props: { title: "Notice" } });
      expect(wrapper.find(".st-alert").exists()).toBe(true);
      expect(wrapper.find(".st-alert--info").exists()).toBe(true);
    });

    it("applies tone modifier class", () => {
      const wrapper = mount(Alert, {
        props: { tone: "error", title: "Error!" },
      });
      expect(wrapper.find(".st-alert--error").exists()).toBe(true);
    });

    it("uses role=alert for warning/error tone", () => {
      const wrapper = mount(Alert, { props: { tone: "warning", title: "W" } });
      expect(wrapper.find("section").attributes("role")).toBe("alert");
    });

    it("uses role=status for info tone", () => {
      const wrapper = mount(Alert, { props: { tone: "info", title: "I" } });
      expect(wrapper.find("section").attributes("role")).toBe("status");
    });

    it("renders title and message", () => {
      const wrapper = mount(Alert, {
        props: { title: "My Title", message: "My message" },
      });
      expect(wrapper.find(".st-alert__title").text()).toBe("My Title");
      expect(wrapper.find(".st-alert__message").text()).toBe("My message");
    });

    it("has name Alert", () => {
      expect(Alert.name).toBe("Alert");
    });
  });

  // --- Breadcrumb ---
  describe("Breadcrumb", () => {
    it("renders a nav.st-breadcrumb", () => {
      const wrapper = mount(Breadcrumb, {
        props: { items: [{ label: "Home", href: "/" }] },
      });
      expect(wrapper.find("nav.st-breadcrumb").exists()).toBe(true);
    });

    it("renders items as list elements", () => {
      const wrapper = mount(Breadcrumb, {
        props: {
          items: [
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: "Item", current: true },
          ],
        },
      });
      expect(wrapper.findAll("li").length).toBe(3);
    });

    it("renders links for items with href", () => {
      const wrapper = mount(Breadcrumb, {
        props: { items: [{ label: "Home", href: "/" }] },
      });
      expect(wrapper.find("a").exists()).toBe(true);
    });

    it("marks current item with aria-current=page", () => {
      const wrapper = mount(Breadcrumb, {
        props: { items: [{ label: "Current", current: true }] },
      });
      expect(wrapper.find("span[aria-current='page']").exists()).toBe(true);
    });

    it("has name Breadcrumb", () => {
      expect(Breadcrumb.name).toBe("Breadcrumb");
    });
  });

  // --- ContentSwitcher ---
  describe("ContentSwitcher", () => {
    it("renders a div.st-contentSwitcher", () => {
      const wrapper = mount(ContentSwitcher, {
        props: { items: [{ id: "a", label: "A" }] },
      });
      expect(wrapper.find(".st-contentSwitcher").exists()).toBe(true);
    });

    it("applies size modifier", () => {
      const wrapper = mount(ContentSwitcher, {
        props: { items: [{ id: "a", label: "A" }], size: "sm" },
      });
      expect(wrapper.find(".st-contentSwitcher--sm").exists()).toBe(true);
    });

    it("marks selected item with --selected class", () => {
      const wrapper = mount(ContentSwitcher, {
        props: {
          items: [
            { id: "x", label: "X" },
            { id: "y", label: "Y" },
          ],
          value: "x",
        },
      });
      const buttons = wrapper.findAll("button");
      expect(buttons[0].classes()).toContain(
        "st-contentSwitcher__option--selected",
      );
      expect(buttons[1].classes()).not.toContain(
        "st-contentSwitcher__option--selected",
      );
    });

    it("emits change when button clicked", async () => {
      const wrapper = mount(ContentSwitcher, {
        props: { items: [{ id: "a", label: "A" }] },
      });
      await wrapper.find("button").trigger("click");
      expect(wrapper.emitted("change")).toBeTruthy();
    });

    it("has name ContentSwitcher", () => {
      expect(ContentSwitcher.name).toBe("ContentSwitcher");
    });
  });

  // --- EmptyState ---
  describe("EmptyState", () => {
    it("renders section.st-emptyState", () => {
      const wrapper = mount(EmptyState, { props: { title: "Nothing here" } });
      expect(wrapper.find(".st-emptyState").exists()).toBe(true);
    });

    it("renders title", () => {
      const wrapper = mount(EmptyState, { props: { title: "Empty" } });
      expect(wrapper.find(".st-emptyState__title").text()).toBe("Empty");
    });

    it("renders message when provided", () => {
      const wrapper = mount(EmptyState, {
        props: { title: "E", message: "No items found" },
      });
      expect(wrapper.find(".st-emptyState__message").text()).toBe(
        "No items found",
      );
    });

    it("has name EmptyState", () => {
      expect(EmptyState.name).toBe("EmptyState");
    });
  });

  // --- Highlight ---
  describe("Highlight", () => {
    it("renders aside.st-highlight with default tone neutral", () => {
      const wrapper = mount(Highlight, { slots: { default: "Note" } });
      expect(wrapper.find("aside.st-highlight").exists()).toBe(true);
      expect(wrapper.find(".st-highlight--neutral").exists()).toBe(true);
    });

    it("applies tone class", () => {
      const wrapper = mount(Highlight, {
        props: { tone: "warning" },
        slots: { default: "Warn" },
      });
      expect(wrapper.find(".st-highlight--warning").exists()).toBe(true);
    });

    it("renders title when provided", () => {
      const wrapper = mount(Highlight, {
        props: { title: "Important" },
        slots: { default: "Content" },
      });
      expect(wrapper.find(".st-highlight__title").text()).toBe("Important");
    });

    it("has name Highlight", () => {
      expect(Highlight.name).toBe("Highlight");
    });
  });

  // --- IconButton ---
  describe("IconButton", () => {
    it("renders button.st-iconButton with default size md and variant secondary", () => {
      const wrapper = mount(IconButton, { slots: { default: "x" } });
      const btn = wrapper.find("button");
      expect(btn.classes()).toContain("st-iconButton");
      expect(btn.classes()).toContain("st-iconButton--md");
      expect(btn.classes()).toContain("st-iconButton--secondary");
    });

    it("applies size and variant modifiers", () => {
      const wrapper = mount(IconButton, {
        props: { size: "sm", variant: "ghost" },
        slots: { default: "x" },
      });
      expect(wrapper.find("button").classes()).toContain("st-iconButton--sm");
      expect(wrapper.find("button").classes()).toContain("st-iconButton--ghost");
    });

    it("has name IconButton", () => {
      expect(IconButton.name).toBe("IconButton");
    });
  });

  // --- InlineLoading ---
  describe("InlineLoading", () => {
    it("renders div.st-inlineLoading with default status active", () => {
      const wrapper = mount(InlineLoading);
      expect(wrapper.find(".st-inlineLoading").exists()).toBe(true);
      expect(wrapper.find(".st-inlineLoading--active").exists()).toBe(true);
    });

    it("renders label", () => {
      const wrapper = mount(InlineLoading, { props: { label: "Processing" } });
      expect(wrapper.find(".st-inlineLoading__label").text()).toBe("Processing");
    });

    it("applies status modifier", () => {
      const wrapper = mount(InlineLoading, { props: { status: "success" } });
      expect(wrapper.find(".st-inlineLoading--success").exists()).toBe(true);
    });

    it("has name InlineLoading", () => {
      expect(InlineLoading.name).toBe("InlineLoading");
    });
  });

  // --- Link ---
  describe("Link", () => {
    it("renders an anchor.st-link", () => {
      const wrapper = mount(Link, {
        props: { href: "/page" },
        slots: { default: "Go" },
      });
      expect(wrapper.find("a.st-link").exists()).toBe(true);
    });

    it("applies muted modifier", () => {
      const wrapper = mount(Link, {
        props: { muted: true },
        slots: { default: "Muted" },
      });
      expect(wrapper.find("a").classes()).toContain("st-link--muted");
    });

    it("applies standalone modifier", () => {
      const wrapper = mount(Link, {
        props: { standalone: true },
        slots: { default: "Standalone" },
      });
      expect(wrapper.find("a").classes()).toContain("st-link--standalone");
    });

    it("applies disabled modifier and aria-disabled", () => {
      const wrapper = mount(Link, {
        props: { disabled: true },
        slots: { default: "Disabled" },
      });
      expect(wrapper.find("a").classes()).toContain("st-link--disabled");
      expect(wrapper.find("a").attributes("aria-disabled")).toBe("true");
    });

    it("has name Link", () => {
      expect(Link.name).toBe("Link");
    });
  });

  // --- LoadingState ---
  describe("LoadingState", () => {
    it("renders section.st-loading with default variant spinner", () => {
      const wrapper = mount(LoadingState);
      expect(wrapper.find(".st-loading").exists()).toBe(true);
      expect(wrapper.find(".st-loading--spinner").exists()).toBe(true);
    });

    it("renders label text", () => {
      const wrapper = mount(LoadingState, { props: { label: "Please wait" } });
      expect(wrapper.find(".st-loading__label").text()).toBe("Please wait");
    });

    it("applies skeleton variant", () => {
      const wrapper = mount(LoadingState, { props: { variant: "skeleton" } });
      expect(wrapper.find(".st-loading--skeleton").exists()).toBe(true);
    });

    it("has name LoadingState", () => {
      expect(LoadingState.name).toBe("LoadingState");
    });
  });

  // --- NumberInput ---
  describe("NumberInput", () => {
    it("renders a div.st-numberInput with type=number input", () => {
      const wrapper = mount(NumberInput, { props: { label: "Count" } });
      expect(wrapper.find(".st-numberInput").exists()).toBe(true);
      expect(wrapper.find("input[type=number]").exists()).toBe(true);
    });

    it("shows label", () => {
      const wrapper = mount(NumberInput, { props: { label: "Qty" } });
      expect(wrapper.find(".st-field__label").text()).toBe("Qty");
    });

    it("shows error text", () => {
      const wrapper = mount(NumberInput, { props: { errorText: "Too big" } });
      expect(wrapper.find(".st-field__error").text()).toBe("Too big");
    });

    it("emits update:modelValue on input", async () => {
      const wrapper = mount(NumberInput);
      await wrapper.find("input").setValue("42");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("has name NumberInput", () => {
      expect(NumberInput.name).toBe("NumberInput");
    });
  });

  // --- PasswordInput ---
  describe("PasswordInput", () => {
    it("renders a password input by default", () => {
      const wrapper = mount(PasswordInput);
      expect(wrapper.find("input[type=password]").exists()).toBe(true);
    });

    it("renders a toggle button", () => {
      const wrapper = mount(PasswordInput);
      expect(wrapper.find(".st-passwordInput__toggle").exists()).toBe(true);
      expect(wrapper.find(".st-passwordInput__toggle").text()).toBe("Show");
    });

    it("toggles to text type when Show is clicked", async () => {
      const wrapper = mount(PasswordInput);
      await wrapper.find(".st-passwordInput__toggle").trigger("click");
      expect(wrapper.find("input[type=text]").exists()).toBe(true);
      expect(wrapper.find(".st-passwordInput__toggle").text()).toBe("Hide");
    });

    it("shows error text", () => {
      const wrapper = mount(PasswordInput, { props: { errorText: "Required" } });
      expect(wrapper.find(".st-field__error").text()).toBe("Required");
    });

    it("has name PasswordInput", () => {
      expect(PasswordInput.name).toBe("PasswordInput");
    });
  });

  // --- ProgressBar ---
  describe("ProgressBar", () => {
    it("renders div.st-progressBar", () => {
      const wrapper = mount(ProgressBar);
      expect(wrapper.find(".st-progressBar").exists()).toBe(true);
    });

    it("applies tone and size modifiers on track", () => {
      const wrapper = mount(ProgressBar, {
        props: { tone: "success", size: "sm" },
      });
      expect(
        wrapper.find(".st-progressBar__track--success").exists(),
      ).toBe(true);
      expect(wrapper.find(".st-progressBar__track--sm").exists()).toBe(true);
    });

    it("renders percentage value", () => {
      const wrapper = mount(ProgressBar, { props: { value: 50 } });
      expect(wrapper.find(".st-progressBar__value").text()).toBe("50%");
    });

    it("shows label when provided", () => {
      const wrapper = mount(ProgressBar, { props: { label: "Progress" } });
      expect(wrapper.find(".st-progressBar__label").text()).toBe("Progress");
    });

    it("has name ProgressBar", () => {
      expect(ProgressBar.name).toBe("ProgressBar");
    });
  });

  // --- ProgressIndicator ---
  describe("ProgressIndicator", () => {
    it("renders ol.st-progressIndicator", () => {
      const wrapper = mount(ProgressIndicator, {
        props: { items: [{ label: "Step 1" }] },
      });
      expect(wrapper.find(".st-progressIndicator").exists()).toBe(true);
    });

    it("applies orientation modifier", () => {
      const wrapper = mount(ProgressIndicator, {
        props: { items: [], orientation: "vertical" },
      });
      expect(
        wrapper.find(".st-progressIndicator--vertical").exists(),
      ).toBe(true);
    });

    it("renders step items with correct status class", () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          items: [
            { label: "Done", status: "complete" },
            { label: "Now", status: "current" },
          ],
        },
      });
      const steps = wrapper.findAll(".st-progressIndicator__step");
      expect(steps[0].classes()).toContain(
        "st-progressIndicator__step--complete",
      );
      expect(steps[1].classes()).toContain(
        "st-progressIndicator__step--current",
      );
    });

    it("has name ProgressIndicator", () => {
      expect(ProgressIndicator.name).toBe("ProgressIndicator");
    });
  });

  // --- Quote ---
  describe("Quote", () => {
    it("renders blockquote.st-quote", () => {
      const wrapper = mount(Quote, { slots: { default: "Words" } });
      expect(wrapper.find("blockquote.st-quote").exists()).toBe(true);
    });

    it("renders slot content in st-quote__text", () => {
      const wrapper = mount(Quote, { slots: { default: "A wise saying" } });
      expect(wrapper.find(".st-quote__text").text()).toBe("A wise saying");
    });

    it("renders author", () => {
      const wrapper = mount(Quote, {
        props: { author: "Socrates" },
        slots: { default: "..." },
      });
      expect(wrapper.find(".st-quote__author").text()).toBe("Socrates");
    });

    it("renders source when provided", () => {
      const wrapper = mount(Quote, {
        props: { source: "Book" },
        slots: { default: "..." },
      });
      expect(wrapper.find(".st-quote__source").text()).toBe("Book");
    });

    it("has name Quote", () => {
      expect(Quote.name).toBe("Quote");
    });
  });

  // --- Search ---
  describe("Search", () => {
    it("renders div.st-search with type=search input", () => {
      const wrapper = mount(Search);
      expect(wrapper.find(".st-search").exists()).toBe(true);
      expect(wrapper.find("input[type=search]").exists()).toBe(true);
    });

    it("applies size modifier", () => {
      const wrapper = mount(Search, { props: { size: "lg" } });
      expect(wrapper.find(".st-search--lg").exists()).toBe(true);
    });

    it("renders label when provided", () => {
      const wrapper = mount(Search, { props: { label: "Search" } });
      expect(wrapper.find(".st-field__label").text()).toBe("Search");
    });

    it("emits update:modelValue on input", async () => {
      const wrapper = mount(Search);
      await wrapper.find("input").setValue("query");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("has name Search", () => {
      expect(Search.name).toBe("Search");
    });
  });

  // --- Select ---
  describe("Select", () => {
    it("renders a select.st-select inside div.st-field", () => {
      const wrapper = mount(Select);
      expect(wrapper.find(".st-field").exists()).toBe(true);
      expect(wrapper.find("select.st-select").exists()).toBe(true);
    });

    it("applies size modifier", () => {
      const wrapper = mount(Select, { props: { size: "sm" } });
      expect(wrapper.find("select").classes()).toContain("st-select--sm");
    });

    it("renders options when provided", () => {
      const wrapper = mount(Select, {
        props: {
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      });
      expect(wrapper.findAll("option").length).toBe(2);
    });

    it("sets aria-invalid when errorText provided", () => {
      const wrapper = mount(Select, { props: { errorText: "Required" } });
      expect(wrapper.find("select").attributes("aria-invalid")).toBe("true");
    });

    it("emits update:modelValue on change", async () => {
      const wrapper = mount(Select, {
        props: {
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      });
      await wrapper.find("select").setValue("b");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("has name Select", () => {
      expect(Select.name).toBe("Select");
    });
  });

  // --- SkeletonText ---
  describe("SkeletonText", () => {
    it("renders div.st-skeleton with skeleton lines", () => {
      const wrapper = mount(SkeletonText);
      expect(wrapper.find(".st-skeleton").exists()).toBe(true);
      expect(wrapper.findAll(".st-skeleton__line").length).toBe(3);
    });

    it("renders specified number of lines", () => {
      const wrapper = mount(SkeletonText, { props: { lines: 5 } });
      expect(wrapper.findAll(".st-skeleton__line").length).toBe(5);
    });

    it("marks first line as heading", () => {
      const wrapper = mount(SkeletonText, { props: { lines: 2 } });
      const lines = wrapper.findAll(".st-skeleton__line");
      expect(lines[0].classes()).toContain("st-skeleton__line--heading");
      expect(lines[1].classes()).not.toContain("st-skeleton__line--heading");
    });

    it("has name SkeletonText", () => {
      expect(SkeletonText.name).toBe("SkeletonText");
    });
  });

  // --- SkipLink ---
  describe("SkipLink", () => {
    it("renders a.st-skipLink", () => {
      const wrapper = mount(SkipLink);
      expect(wrapper.find("a.st-skipLink").exists()).toBe(true);
    });

    it("defaults href to #main", () => {
      const wrapper = mount(SkipLink);
      expect(wrapper.find("a").attributes("href")).toBe("#main");
    });

    it("renders default text when no slot", () => {
      const wrapper = mount(SkipLink);
      expect(wrapper.text()).toBe("Skip to content");
    });

    it("renders custom href", () => {
      const wrapper = mount(SkipLink, { props: { href: "#content" } });
      expect(wrapper.find("a").attributes("href")).toBe("#content");
    });

    it("has name SkipLink", () => {
      expect(SkipLink.name).toBe("SkipLink");
    });
  });

  // --- Switch ---
  describe("Switch", () => {
    it("renders label.st-switch with checkbox[role=switch]", () => {
      const wrapper = mount(Switch, { props: { label: "Enable" } });
      expect(wrapper.find("label.st-switch").exists()).toBe(true);
      expect(wrapper.find("input[type=checkbox][role=switch]").exists()).toBe(true);
    });

    it("renders label text", () => {
      const wrapper = mount(Switch, { props: { label: "Dark mode" } });
      expect(wrapper.find(".st-switch__label").text()).toBe("Dark mode");
    });

    it("renders helper text", () => {
      const wrapper = mount(Switch, {
        props: { label: "Enable", helperText: "Optional" },
      });
      expect(wrapper.find(".st-switch__help").text()).toBe("Optional");
    });

    it("emits update:modelValue on change", async () => {
      const wrapper = mount(Switch, {
        props: { label: "Enable", modelValue: false },
      });
      await wrapper.find("input").setValue(true);
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("has name Switch", () => {
      expect(Switch.name).toBe("Switch");
    });
  });

  // --- Tag ---
  describe("Tag", () => {
    it("renders span.st-tag with default tone neutral", () => {
      const wrapper = mount(Tag, { slots: { default: "Label" } });
      expect(wrapper.find("span.st-tag").exists()).toBe(true);
      expect(wrapper.find(".st-tag--neutral").exists()).toBe(true);
    });

    it("applies tone and size modifiers", () => {
      const wrapper = mount(Tag, {
        props: { tone: "success", size: "sm" },
        slots: { default: "OK" },
      });
      expect(wrapper.find(".st-tag--success").exists()).toBe(true);
      expect(wrapper.find(".st-tag--sm").exists()).toBe(true);
    });

    it("applies disabled modifier", () => {
      const wrapper = mount(Tag, {
        props: { disabled: true },
        slots: { default: "D" },
      });
      expect(wrapper.find(".st-tag--disabled").exists()).toBe(true);
    });

    it("renders slot content in st-tag__label", () => {
      const wrapper = mount(Tag, { slots: { default: "MyTag" } });
      expect(wrapper.find(".st-tag__label").text()).toBe("MyTag");
    });

    it("has name Tag", () => {
      expect(Tag.name).toBe("Tag");
    });
  });

  // --- Textarea ---
  describe("Textarea", () => {
    it("renders div.st-field with textarea.st-textarea", () => {
      const wrapper = mount(Textarea);
      expect(wrapper.find(".st-field").exists()).toBe(true);
      expect(wrapper.find("textarea.st-textarea").exists()).toBe(true);
    });

    it("shows label", () => {
      const wrapper = mount(Textarea, { props: { label: "Message" } });
      expect(wrapper.find(".st-field__label").text()).toBe("Message");
    });

    it("sets aria-invalid when errorText provided", () => {
      const wrapper = mount(Textarea, { props: { errorText: "Required" } });
      expect(wrapper.find("textarea").attributes("aria-invalid")).toBe("true");
    });

    it("shows helperText", () => {
      const wrapper = mount(Textarea, { props: { helperText: "Max 500 chars" } });
      expect(wrapper.find(".st-field__help").text()).toBe("Max 500 chars");
    });

    it("emits update:modelValue on input", async () => {
      const wrapper = mount(Textarea);
      await wrapper.find("textarea").setValue("Hello");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("has name Textarea", () => {
      expect(Textarea.name).toBe("Textarea");
    });
  });

  // --- Tile ---
  describe("Tile", () => {
    it("renders section.st-tile with default static variant", () => {
      const wrapper = mount(Tile);
      expect(wrapper.find("section.st-tile").exists()).toBe(true);
      expect(wrapper.find(".st-tile--static").exists()).toBe(true);
    });

    it("applies selected modifier", () => {
      const wrapper = mount(Tile, { props: { selected: true } });
      expect(wrapper.find(".st-tile--selected").exists()).toBe(true);
    });

    it("applies disabled modifier", () => {
      const wrapper = mount(Tile, { props: { disabled: true } });
      expect(wrapper.find(".st-tile--disabled").exists()).toBe(true);
    });

    it("renders title and description", () => {
      const wrapper = mount(Tile, {
        props: { title: "My Tile", description: "A tile" },
      });
      expect(wrapper.find(".st-tile__title").text()).toBe("My Tile");
      expect(wrapper.find(".st-tile__description").text()).toBe("A tile");
    });

    it("has name Tile", () => {
      expect(Tile.name).toBe("Tile");
    });
  });

  // --- TileGroup ---
  describe("TileGroup", () => {
    it("renders fieldset.st-tileGroup", () => {
      const wrapper = mount(TileGroup, {
        props: { items: [{ value: "a", title: "A" }] },
      });
      expect(wrapper.find("fieldset.st-tileGroup").exists()).toBe(true);
    });

    it("renders legend when provided", () => {
      const wrapper = mount(TileGroup, {
        props: { legend: "Choose one", items: [] },
      });
      expect(wrapper.find(".st-tileGroup__legend").text()).toBe("Choose one");
    });

    it("renders tile items", () => {
      const wrapper = mount(TileGroup, {
        props: {
          items: [
            { value: "a", title: "Option A" },
            { value: "b", title: "Option B" },
          ],
        },
      });
      expect(wrapper.findAll("input[type=radio]").length).toBe(2);
    });

    it("marks selected tile with --checked class", () => {
      const wrapper = mount(TileGroup, {
        props: {
          items: [{ value: "a", title: "A" }, { value: "b", title: "B" }],
          value: "a",
        },
      });
      const tiles = wrapper.findAll(".st-tileGroup__tile");
      expect(tiles[0].classes()).toContain("st-tileGroup__tile--checked");
      expect(tiles[1].classes()).not.toContain("st-tileGroup__tile--checked");
    });

    it("has name TileGroup", () => {
      expect(TileGroup.name).toBe("TileGroup");
    });
  });

  // --- Toggle ---
  describe("Toggle", () => {
    it("renders label.st-toggle with checkbox[role=switch]", () => {
      const wrapper = mount(Toggle, { props: { label: "Feature" } });
      expect(wrapper.find("label.st-toggle").exists()).toBe(true);
      expect(wrapper.find("input[type=checkbox][role=switch]").exists()).toBe(true);
    });

    it("applies size modifier", () => {
      const wrapper = mount(Toggle, {
        props: { label: "Feature", size: "sm" },
      });
      expect(wrapper.find(".st-toggle--sm").exists()).toBe(true);
    });

    it("renders label text", () => {
      const wrapper = mount(Toggle, { props: { label: "Notifications" } });
      expect(wrapper.find(".st-toggle__label").text()).toBe("Notifications");
    });

    it("renders helper text", () => {
      const wrapper = mount(Toggle, {
        props: { label: "Feature", helperText: "Enable this feature" },
      });
      expect(wrapper.find(".st-toggle__help").text()).toBe("Enable this feature");
    });

    it("emits update:modelValue on change", async () => {
      const wrapper = mount(Toggle, {
        props: { label: "Toggle", modelValue: false },
      });
      await wrapper.find("input").setValue(true);
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("has name Toggle", () => {
      expect(Toggle.name).toBe("Toggle");
    });
  });

  // --- Batch 2 export surface ---
  describe("export surface — batch 2", () => {
    const batch2 = {
      Accordion,
      Alert,
      Breadcrumb,
      ContentSwitcher,
      EmptyState,
      Highlight,
      IconButton,
      InlineLoading,
      Link,
      LoadingState,
      NumberInput,
      PasswordInput,
      ProgressBar,
      ProgressIndicator,
      Quote,
      Search,
      Select,
      SkeletonText,
      SkipLink,
      Switch,
      Tag,
      Textarea,
      Tile,
      TileGroup,
      Toggle,
    };

    it("exports all batch 2 components", () => {
      for (const [name, component] of Object.entries(batch2)) {
        expect(component, `${name} should be exported`).toBeDefined();
        expect(typeof component).toBe("object");
      }
    });

    it("each batch 2 component has a name property matching its key", () => {
      for (const [name, component] of Object.entries(batch2)) {
        expect(component.name, `${name}.name`).toBe(name);
      }
    });
  });
});

// ─── Batch 3: overlays / nav / lists / forms ────────────────────────────────

describe("Vue behavioral parity — batch 3", () => {
  // --- AspectRatio ---
  describe("AspectRatio", () => {
    it("renders a div.st-aspectRatio", () => {
      const wrapper = mount(AspectRatio, { slots: { default: "content" } });
      expect(wrapper.find(".st-aspectRatio").exists()).toBe(true);
    });

    it("applies inline aspectRatio style from ratio prop (string)", () => {
      const wrapper = mount(AspectRatio, { props: { ratio: "4 / 3" }, slots: { default: "" } });
      expect((wrapper.find(".st-aspectRatio").element as HTMLElement).style.aspectRatio).toBe("4 / 3");
    });

    it("applies inline aspectRatio style from ratio prop (number)", () => {
      const wrapper = mount(AspectRatio, { props: { ratio: 2 }, slots: { default: "" } });
      expect((wrapper.find(".st-aspectRatio").element as HTMLElement).style.aspectRatio).toBe("2");
    });

    it("has name AspectRatio", () => {
      expect(AspectRatio.name).toBe("AspectRatio");
    });
  });

  // --- CodeSnippet ---
  describe("CodeSnippet", () => {
    it("renders a pre.st-codeSnippet by default", () => {
      const wrapper = mount(CodeSnippet, { props: { code: "const x = 1;" } });
      expect(wrapper.find("pre.st-codeSnippet").exists()).toBe(true);
    });

    it("renders code in st-codeSnippet__code", () => {
      const wrapper = mount(CodeSnippet, { props: { code: "hello" } });
      expect(wrapper.find(".st-codeSnippet__code").text()).toBe("hello");
    });

    it("renders inline as code.st-codeSnippet--inline", () => {
      const wrapper = mount(CodeSnippet, { props: { code: "x", inline: true } });
      expect(wrapper.find("code.st-codeSnippet--inline").exists()).toBe(true);
    });

    it("has name CodeSnippet", () => {
      expect(CodeSnippet.name).toBe("CodeSnippet");
    });
  });

  // --- CopyButton ---
  describe("CopyButton", () => {
    it("renders button.st-copyButton", () => {
      const wrapper = mount(CopyButton);
      expect(wrapper.find("button.st-copyButton").exists()).toBe(true);
    });

    it("applies size modifier class", () => {
      const wrapper = mount(CopyButton, { props: { size: "sm" } });
      expect(wrapper.find("button").classes()).toContain("st-copyButton--sm");
    });

    it("shows copy label by default", () => {
      const wrapper = mount(CopyButton, { props: { label: "Copy" } });
      expect(wrapper.find(".st-copyButton__label").text()).toBe("Copy");
    });

    it("has name CopyButton", () => {
      expect(CopyButton.name).toBe("CopyButton");
    });
  });

  // --- Drawer ---
  describe("Drawer", () => {
    it("renders nothing when open=false", () => {
      const wrapper = mount(Drawer, { props: { open: false } });
      expect(wrapper.find(".st-drawer").exists()).toBe(false);
    });

    it("renders aside.st-drawer when open=true", () => {
      const wrapper = mount(Drawer, { props: { open: true } });
      expect(wrapper.find("aside.st-drawer").exists()).toBe(true);
    });

    it("applies placement modifier", () => {
      const wrapper = mount(Drawer, { props: { open: true, placement: "left" } });
      expect(wrapper.find(".st-drawer--left").exists()).toBe(true);
    });

    it("renders title when provided", () => {
      const wrapper = mount(Drawer, { props: { open: true, title: "My Drawer" } });
      expect(wrapper.find(".st-drawer__title").text()).toBe("My Drawer");
    });

    it("renders close button", () => {
      const wrapper = mount(Drawer, { props: { open: true } });
      expect(wrapper.find(".st-drawer__close").exists()).toBe(true);
    });

    it("emits close when close button clicked", async () => {
      const wrapper = mount(Drawer, { props: { open: true } });
      await wrapper.find(".st-drawer__close").trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("has name Drawer", () => {
      expect(Drawer.name).toBe("Drawer");
    });
  });

  // --- Dropdown ---
  describe("Dropdown", () => {
    it("renders div.st-dropdown", () => {
      const wrapper = mount(Dropdown, { props: { options: [] } });
      expect(wrapper.find(".st-dropdown").exists()).toBe(true);
    });

    it("renders a trigger button", () => {
      const wrapper = mount(Dropdown, {
        props: { options: [{ value: "a", label: "A" }] },
      });
      expect(wrapper.find(".st-dropdown__button").exists()).toBe(true);
    });

    it("opens list when trigger clicked", async () => {
      const wrapper = mount(Dropdown, {
        props: { options: [{ value: "a", label: "A" }] },
      });
      expect(wrapper.find(".st-dropdown__list").exists()).toBe(false);
      await wrapper.find(".st-dropdown__button").trigger("click");
      expect(wrapper.find(".st-dropdown__list").exists()).toBe(true);
    });

    it("renders options in open list", async () => {
      const wrapper = mount(Dropdown, {
        props: {
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      });
      await wrapper.find(".st-dropdown__button").trigger("click");
      expect(wrapper.findAll(".st-dropdown__option").length).toBe(2);
    });

    it("has name Dropdown", () => {
      expect(Dropdown.name).toBe("Dropdown");
    });
  });

  // --- FileUploader ---
  describe("FileUploader", () => {
    it("renders div.st-fileUploader-field", () => {
      const wrapper = mount(FileUploader);
      expect(wrapper.find(".st-fileUploader-field").exists()).toBe(true);
    });

    it("renders file input", () => {
      const wrapper = mount(FileUploader);
      expect(wrapper.find("input[type=file]").exists()).toBe(true);
    });

    it("renders items list", () => {
      const wrapper = mount(FileUploader, {
        props: {
          items: [
            { name: "file1.txt", status: "complete" },
            { name: "file2.pdf", status: "error" },
          ],
        },
      });
      expect(wrapper.findAll(".st-fileUploader__item").length).toBe(2);
    });

    it("applies item status modifier", () => {
      const wrapper = mount(FileUploader, {
        props: { items: [{ name: "f.txt", status: "uploading" }] },
      });
      expect(wrapper.find(".st-fileUploader__item--uploading").exists()).toBe(true);
    });

    it("has name FileUploader", () => {
      expect(FileUploader.name).toBe("FileUploader");
    });
  });

  // --- Footer ---
  describe("Footer", () => {
    it("renders footer.st-footer", () => {
      const wrapper = mount(Footer);
      expect(wrapper.find("footer.st-footer").exists()).toBe(true);
    });

    it("renders brand when provided", () => {
      const wrapper = mount(Footer, { props: { brand: "SENT" } });
      expect(wrapper.find(".st-footer__brand").text()).toBe("SENT");
    });

    it("renders link columns", () => {
      const wrapper = mount(Footer, {
        props: {
          columns: [
            { title: "Col 1", links: [{ label: "Link", href: "/link" }] },
          ],
        },
      });
      expect(wrapper.find("nav").exists()).toBe(true);
      expect(wrapper.find("a").exists()).toBe(true);
    });

    it("renders copyright", () => {
      const wrapper = mount(Footer, { props: { copyright: "© 2025" } });
      expect(wrapper.find(".st-footer__copyright").text()).toBe("© 2025");
    });

    it("has name Footer", () => {
      expect(Footer.name).toBe("Footer");
    });
  });

  // --- Form ---
  describe("Form", () => {
    it("renders form.st-form", () => {
      const wrapper = mount(Form);
      expect(wrapper.find("form.st-form").exists()).toBe(true);
    });

    it("renders children in st-form__body", () => {
      const wrapper = mount(Form, { slots: { default: "<input />" } });
      expect(wrapper.find(".st-form__body").exists()).toBe(true);
    });

    it("renders message with correct status class", () => {
      const wrapper = mount(Form, {
        props: { message: "Saved!", status: "submitted" },
      });
      expect(wrapper.find(".st-form__message--success").text()).toBe("Saved!");
    });

    it("renders error message", () => {
      const wrapper = mount(Form, {
        props: { message: "Failed", status: "error" },
      });
      expect(wrapper.find(".st-form__message--error").exists()).toBe(true);
    });

    it("emits submit on form submit", async () => {
      const wrapper = mount(Form);
      await wrapper.find("form").trigger("submit");
      expect(wrapper.emitted("submit")).toBeTruthy();
    });

    it("has name Form", () => {
      expect(Form.name).toBe("Form");
    });
  });

  // --- FormGroup ---
  describe("FormGroup", () => {
    it("renders fieldset.st-formGroup", () => {
      const wrapper = mount(FormGroup, { props: { legend: "Group" } });
      expect(wrapper.find("fieldset.st-formGroup").exists()).toBe(true);
    });

    it("renders legend", () => {
      const wrapper = mount(FormGroup, { props: { legend: "My Group" } });
      expect(wrapper.find(".st-formGroup__legend").text()).toBe("My Group");
    });

    it("renders helperText when provided", () => {
      const wrapper = mount(FormGroup, {
        props: { legend: "G", helperText: "Hint" },
      });
      expect(wrapper.find(".st-formGroup__help").text()).toBe("Hint");
    });

    it("renders slot content in body", () => {
      const wrapper = mount(FormGroup, {
        props: { legend: "G" },
        slots: { default: "<input />" },
      });
      expect(wrapper.find(".st-formGroup__body").exists()).toBe(true);
    });

    it("has name FormGroup", () => {
      expect(FormGroup.name).toBe("FormGroup");
    });
  });

  // --- Header ---
  describe("Header", () => {
    it("renders header.st-header", () => {
      const wrapper = mount(Header);
      expect(wrapper.find("header.st-header").exists()).toBe(true);
    });

    it("applies sticky modifier", () => {
      const wrapper = mount(Header, { props: { sticky: true } });
      expect(wrapper.find(".st-header--sticky").exists()).toBe(true);
    });

    it("renders brand link", () => {
      const wrapper = mount(Header, { props: { brand: "MyBrand" } });
      expect(wrapper.find(".st-header__logo").text()).toBe("MyBrand");
    });

    it("renders nav links", () => {
      const wrapper = mount(Header, {
        props: {
          navigation: [
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ],
        },
      });
      expect(wrapper.findAll(".st-header__navigation a").length).toBe(2);
    });

    it("renders account initials", () => {
      const wrapper = mount(Header, {
        props: { account: { name: "John Doe" } },
      });
      expect(wrapper.find(".st-header__avatar--initials").text()).toBe("JD");
    });

    it("has name Header", () => {
      expect(Header.name).toBe("Header");
    });
  });

  // --- LanguageSelector ---
  describe("LanguageSelector", () => {
    it("renders div.st-languageSelector", () => {
      const wrapper = mount(LanguageSelector, {
        props: { options: [{ value: "en", label: "English" }] },
      });
      expect(wrapper.find(".st-languageSelector").exists()).toBe(true);
    });

    it("renders trigger button", () => {
      const wrapper = mount(LanguageSelector, {
        props: { options: [{ value: "en", label: "English" }] },
      });
      expect(wrapper.find(".st-languageSelector__trigger").exists()).toBe(true);
    });

    it("shows menu when open=true", () => {
      const wrapper = mount(LanguageSelector, {
        props: {
          options: [{ value: "en", label: "English" }, { value: "fr", label: "French" }],
          open: true,
        },
      });
      expect(wrapper.find(".st-languageSelector__menu").exists()).toBe(true);
      expect(wrapper.findAll(".st-languageSelector__option").length).toBe(2);
    });

    it("marks active option", () => {
      const wrapper = mount(LanguageSelector, {
        props: {
          options: [{ value: "en", label: "English" }, { value: "fr", label: "French" }],
          value: "fr",
          open: true,
        },
      });
      const activeOpts = wrapper.findAll(".st-languageSelector__option--active");
      expect(activeOpts.length).toBe(1);
    });

    it("emits change on option click", async () => {
      const wrapper = mount(LanguageSelector, {
        props: {
          options: [{ value: "en", label: "English" }],
          open: true,
        },
      });
      await wrapper.find(".st-languageSelector__option").trigger("click");
      expect(wrapper.emitted("change")).toBeTruthy();
    });

    it("has name LanguageSelector", () => {
      expect(LanguageSelector.name).toBe("LanguageSelector");
    });
  });

  // --- OrderedList ---
  describe("OrderedList", () => {
    it("renders ol.st-orderedList", () => {
      const wrapper = mount(OrderedList, { props: { items: ["A", "B"] } });
      expect(wrapper.find("ol.st-orderedList").exists()).toBe(true);
    });

    it("renders items as li.st-orderedList__item", () => {
      const wrapper = mount(OrderedList, { props: { items: ["X", "Y", "Z"] } });
      expect(wrapper.findAll(".st-orderedList__item").length).toBe(3);
    });

    it("renders nested items", () => {
      const wrapper = mount(OrderedList, {
        props: {
          items: [{ label: "Parent", children: ["Child"] }],
        },
      });
      expect(wrapper.find("ol").exists()).toBe(true);
    });

    it("has name OrderedList", () => {
      expect(OrderedList.name).toBe("OrderedList");
    });
  });

  // --- UnorderedList ---
  describe("UnorderedList", () => {
    it("renders ul.st-unorderedList", () => {
      const wrapper = mount(UnorderedList, { props: { items: ["A", "B"] } });
      expect(wrapper.find("ul.st-unorderedList").exists()).toBe(true);
    });

    it("renders items as li.st-unorderedList__item", () => {
      const wrapper = mount(UnorderedList, { props: { items: ["X", "Y"] } });
      expect(wrapper.findAll(".st-unorderedList__item").length).toBe(2);
    });

    it("has name UnorderedList", () => {
      expect(UnorderedList.name).toBe("UnorderedList");
    });
  });

  // --- StructuredList ---
  describe("StructuredList", () => {
    it("renders dl.st-structuredList", () => {
      const wrapper = mount(StructuredList, {
        props: { items: [{ term: "Name", description: "Alice" }] },
      });
      expect(wrapper.find("dl.st-structuredList").exists()).toBe(true);
    });

    it("renders rows with dt and dd", () => {
      const wrapper = mount(StructuredList, {
        props: {
          items: [
            { term: "Name", description: "Alice" },
            { label: "Role", value: "Admin" },
          ],
        },
      });
      expect(wrapper.findAll(".st-structuredList__row").length).toBe(2);
      expect(wrapper.find(".st-structuredList__term").text()).toBe("Name");
      expect(wrapper.find(".st-structuredList__definition").text()).toBe("Alice");
    });

    it("applies bordered modifier", () => {
      const wrapper = mount(StructuredList, {
        props: { items: [], bordered: true },
      });
      expect(wrapper.find(".st-structuredList--bordered").exists()).toBe(true);
    });

    it("has name StructuredList", () => {
      expect(StructuredList.name).toBe("StructuredList");
    });
  });

  // --- SideNav ---
  describe("SideNav", () => {
    it("renders nav.st-sideNav", () => {
      const wrapper = mount(SideNav, {
        props: { items: [{ label: "Home", href: "/" }] },
      });
      expect(wrapper.find("nav.st-sideNav").exists()).toBe(true);
    });

    it("renders nav links", () => {
      const wrapper = mount(SideNav, {
        props: {
          items: [
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ],
        },
      });
      expect(wrapper.findAll("a").length).toBe(2);
    });

    it("marks active link", () => {
      const wrapper = mount(SideNav, {
        props: {
          items: [{ label: "Active", href: "/active", active: true }],
        },
      });
      expect(wrapper.find(".st-sideNav__link--active").exists()).toBe(true);
    });

    it("has name SideNav", () => {
      expect(SideNav.name).toBe("SideNav");
    });
  });

  // --- Pagination ---
  describe("Pagination", () => {
    it("renders nav.st-pagination", () => {
      const wrapper = mount(Pagination, { props: { page: 1 } });
      expect(wrapper.find("nav.st-pagination").exists()).toBe(true);
    });

    it("renders Previous and Next buttons", () => {
      const wrapper = mount(Pagination, {
        props: { page: 2, totalItems: 30, pageSize: 10 },
      });
      const buttons = wrapper.findAll("button");
      expect(buttons[0].text()).toBe("Previous");
      expect(buttons[buttons.length - 1].text()).toBe("Next");
    });

    it("disables Previous on first page", () => {
      const wrapper = mount(Pagination, {
        props: { page: 1, totalItems: 20, pageSize: 10 },
      });
      expect(wrapper.find("button[disabled]").text()).toBe("Previous");
    });

    it("emits pageChange on page button click", async () => {
      const wrapper = mount(Pagination, {
        props: { page: 1, totalItems: 20, pageSize: 10 },
      });
      const pageButtons = wrapper.findAll(".st-pagination__page");
      await pageButtons[1].trigger("click");
      expect(wrapper.emitted("pageChange")).toBeTruthy();
    });

    it("has name Pagination", () => {
      expect(Pagination.name).toBe("Pagination");
    });
  });

  // --- PaginationNav ---
  describe("PaginationNav", () => {
    it("renders nav.st-paginationNav", () => {
      const wrapper = mount(PaginationNav);
      expect(wrapper.find("nav.st-paginationNav").exists()).toBe(true);
    });

    it("renders page buttons", () => {
      const wrapper = mount(PaginationNav, { props: { totalPages: 3 } });
      expect(wrapper.findAll(".st-paginationNav__page").length).toBe(3);
    });

    it("marks current page as active", () => {
      const wrapper = mount(PaginationNav, { props: { page: 2, totalPages: 3 } });
      expect(wrapper.find(".st-paginationNav__page--active").text()).toBe("Page 2");
    });

    it("renders anchor when previousHref provided", () => {
      const wrapper = mount(PaginationNav, {
        props: { previousHref: "/prev" },
      });
      expect(wrapper.find("a[href='/prev']").exists()).toBe(true);
    });

    it("has name PaginationNav", () => {
      expect(PaginationNav.name).toBe("PaginationNav");
    });
  });

  // --- Slider ---
  describe("Slider", () => {
    it("renders div.st-slider with type=range input", () => {
      const wrapper = mount(Slider);
      expect(wrapper.find(".st-slider").exists()).toBe(true);
      expect(wrapper.find("input[type=range]").exists()).toBe(true);
    });

    it("applies size modifier", () => {
      const wrapper = mount(Slider, { props: { size: "sm" } });
      expect(wrapper.find(".st-slider--sm").exists()).toBe(true);
    });

    it("renders label when provided", () => {
      const wrapper = mount(Slider, { props: { label: "Volume" } });
      expect(wrapper.find(".st-field__label").text()).toBe("Volume");
    });

    it("renders current value", () => {
      const wrapper = mount(Slider, { props: { modelValue: 42 } });
      expect(wrapper.find(".st-slider__value").text()).toBe("42");
    });

    it("emits update:modelValue on input", async () => {
      const wrapper = mount(Slider);
      await wrapper.find("input").setValue("75");
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("has name Slider", () => {
      expect(Slider.name).toBe("Slider");
    });
  });

  // --- Batch 3 export surface ---
  describe("export surface — batch 3", () => {
    const batch3 = {
      AspectRatio,
      CodeSnippet,
      CopyButton,
      Drawer,
      Dropdown,
      FileUploader,
      Footer,
      Form,
      FormGroup,
      Header,
      LanguageSelector,
      OrderedList,
      UnorderedList,
      StructuredList,
      SideNav,
      Pagination,
      PaginationNav,
      Slider,
    };

    it("exports all batch 3 components", () => {
      for (const [name, component] of Object.entries(batch3)) {
        expect(component, `${name} should be exported`).toBeDefined();
        expect(typeof component).toBe("object");
      }
    });

    it("each batch 3 component has a name property matching its key", () => {
      for (const [name, component] of Object.entries(batch3)) {
        expect(component.name, `${name}.name`).toBe(name);
      }
    });
  });
});

// ─── Batch 4: overlays / menus / tables ─────────────────────────────────────

describe("Vue behavioral parity — batch 4", () => {
  // --- Menu ---
  describe("Menu", () => {
    it("renders a div.st-menu with role=menu", () => {
      const wrapper = mount(Menu, { props: { items: [] } });
      expect(wrapper.find(".st-menu").exists()).toBe(true);
      expect(wrapper.find("[role='menu']").exists()).toBe(true);
    });

    it("renders action items as buttons with role=menuitem", () => {
      const wrapper = mount(Menu, {
        props: { items: [{ label: "Copy" }, { label: "Paste" }] },
      });
      expect(wrapper.findAll("[role='menuitem']").length).toBe(2);
    });

    it("applies danger modifier on danger variant item", () => {
      const wrapper = mount(Menu, {
        props: { items: [{ label: "Delete", variant: "danger" }] },
      });
      expect(wrapper.find(".st-menu__item--danger").exists()).toBe(true);
    });

    it("renders divider with role=separator", () => {
      const wrapper = mount(Menu, {
        props: { items: [{ type: "divider" }] },
      });
      expect(wrapper.find("[role='separator']").exists()).toBe(true);
    });

    it("renders group with section.st-menu__group", () => {
      const wrapper = mount(Menu, {
        props: {
          items: [
            { type: "group", label: "Group", items: [{ label: "Item" }] },
          ],
        },
      });
      expect(wrapper.find(".st-menu__group").exists()).toBe(true);
    });

    it("applies dense modifier", () => {
      const wrapper = mount(Menu, {
        props: { items: [], dense: true },
      });
      expect(wrapper.find(".st-menu--dense").exists()).toBe(true);
    });

    it("emits select when item clicked", async () => {
      const wrapper = mount(Menu, {
        props: { items: [{ id: "a", label: "Copy" }] },
      });
      await wrapper.find("[role='menuitem']").trigger("click");
      expect(wrapper.emitted("select")).toBeTruthy();
    });

    it("has name Menu", () => {
      expect(Menu.name).toBe("Menu");
    });
  });

  // --- MenuPopover ---
  describe("MenuPopover", () => {
    it("renders div.st-menuPopover", () => {
      const wrapper = mount(MenuPopover, { props: { items: [], open: false } });
      expect(wrapper.find(".st-menuPopover").exists()).toBe(true);
    });

    it("shows content when open=true", () => {
      const wrapper = mount(MenuPopover, {
        props: { items: [{ label: "Item" }], open: true },
      });
      expect(wrapper.find(".st-menuPopover__content").exists()).toBe(true);
    });

    it("hides content when open=false", () => {
      const wrapper = mount(MenuPopover, {
        props: { items: [{ label: "Item" }], open: false },
      });
      expect(wrapper.find(".st-menuPopover__content").exists()).toBe(false);
    });

    it("applies placement modifier", () => {
      const wrapper = mount(MenuPopover, {
        props: { items: [], open: false, placement: "top-end" },
      });
      expect(wrapper.find(".st-menuPopover--top-end").exists()).toBe(true);
    });

    it("has name MenuPopover", () => {
      expect(MenuPopover.name).toBe("MenuPopover");
    });
  });

  // --- MenuTriggerButton ---
  describe("MenuTriggerButton", () => {
    it("renders a button with correct classes", () => {
      const wrapper = mount(MenuTriggerButton, { slots: { default: "Menu" } });
      const btn = wrapper.find("button");
      expect(btn.classes()).toContain("st-menuTriggerButton");
      expect(btn.classes()).toContain("st-button--secondary");
    });

    it("sets aria-expanded from open prop", () => {
      const wrapper = mount(MenuTriggerButton, {
        props: { open: true },
        slots: { default: "Menu" },
      });
      expect(wrapper.find("button").attributes("aria-expanded")).toBe("true");
    });

    it("has name MenuTriggerButton", () => {
      expect(MenuTriggerButton.name).toBe("MenuTriggerButton");
    });
  });

  // --- Modal ---
  describe("Modal", () => {
    it("renders nothing when open=false", () => {
      const wrapper = mount(Modal, { props: { open: false } });
      expect(wrapper.find(".st-modal").exists()).toBe(false);
    });

    it("renders section.st-modal when open=true", () => {
      const wrapper = mount(Modal, { props: { open: true } });
      expect(wrapper.find(".st-modal").exists()).toBe(true);
    });

    it("renders title when provided", () => {
      const wrapper = mount(Modal, { props: { open: true, title: "My Modal" } });
      expect(wrapper.find(".st-modal__title").text()).toBe("My Modal");
    });

    it("renders close button", () => {
      const wrapper = mount(Modal, { props: { open: true } });
      expect(wrapper.find(".st-modal__close").exists()).toBe(true);
    });

    it("emits close when close button clicked", async () => {
      const wrapper = mount(Modal, { props: { open: true } });
      await wrapper.find(".st-modal__close").trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("renders modal backdrop", () => {
      const wrapper = mount(Modal, { props: { open: true } });
      expect(wrapper.find(".st-modal__backdrop").exists()).toBe(true);
    });

    it("has name Modal", () => {
      expect(Modal.name).toBe("Modal");
    });
  });

  // --- OverflowMenu ---
  describe("OverflowMenu", () => {
    it("renders div.st-overflowMenu", () => {
      const wrapper = mount(OverflowMenu, { props: { items: [] } });
      expect(wrapper.find(".st-overflowMenu").exists()).toBe(true);
    });

    it("renders trigger button", () => {
      const wrapper = mount(OverflowMenu, { props: { items: [] } });
      expect(wrapper.find(".st-overflowMenu__trigger").exists()).toBe(true);
    });

    it("opens list when trigger clicked", async () => {
      const wrapper = mount(OverflowMenu, {
        props: { items: [{ label: "Edit" }] },
      });
      expect(wrapper.find(".st-overflowMenu__list").exists()).toBe(false);
      await wrapper.find(".st-overflowMenu__trigger").trigger("click");
      expect(wrapper.find(".st-overflowMenu__list").exists()).toBe(true);
    });

    it("applies dense modifier", () => {
      const wrapper = mount(OverflowMenu, {
        props: { items: [], dense: true },
      });
      expect(wrapper.find(".st-overflowMenu--dense").exists()).toBe(true);
    });

    it("has name OverflowMenu", () => {
      expect(OverflowMenu.name).toBe("OverflowMenu");
    });
  });

  // --- Popover ---
  describe("Popover", () => {
    it("renders span.st-popover-host", () => {
      const wrapper = mount(Popover, { props: { content: "Info" } });
      expect(wrapper.find(".st-popover-host").exists()).toBe(true);
    });

    it("shows popover content when open=true", () => {
      const wrapper = mount(Popover, {
        props: { content: "Tooltip content", open: true },
      });
      expect(wrapper.find(".st-popover").exists()).toBe(true);
    });

    it("hides popover content when open=false", () => {
      const wrapper = mount(Popover, {
        props: { content: "Tooltip content", open: false },
      });
      expect(wrapper.find(".st-popover").exists()).toBe(false);
    });

    it("applies placement modifier", () => {
      const wrapper = mount(Popover, {
        props: { content: "Info", open: true, placement: "top" },
      });
      expect(wrapper.find(".st-popover--top").exists()).toBe(true);
    });

    it("has name Popover", () => {
      expect(Popover.name).toBe("Popover");
    });
  });

  // --- Tabs ---
  describe("Tabs", () => {
    it("renders section.st-tabs", () => {
      const wrapper = mount(Tabs, {
        props: { items: [{ id: "a", label: "Tab A", content: "Content A" }] },
      });
      expect(wrapper.find(".st-tabs").exists()).toBe(true);
    });

    it("renders a tablist with tabs", () => {
      const wrapper = mount(Tabs, {
        props: {
          items: [
            { id: "a", label: "Tab A", content: "A" },
            { id: "b", label: "Tab B", content: "B" },
          ],
        },
      });
      expect(wrapper.find("[role='tablist']").exists()).toBe(true);
      expect(wrapper.findAll("[role='tab']").length).toBe(2);
    });

    it("marks the first tab as active by default", () => {
      const wrapper = mount(Tabs, {
        props: {
          items: [{ id: "a", label: "A", content: "C" }],
        },
      });
      expect(wrapper.find(".st-tabs__tab--active").exists()).toBe(true);
    });

    it("renders tab panel", () => {
      const wrapper = mount(Tabs, {
        props: { items: [{ id: "a", label: "A", content: "Content A" }] },
      });
      expect(wrapper.find("[role='tabpanel']").exists()).toBe(true);
    });

    it("emits change when tab clicked", async () => {
      const wrapper = mount(Tabs, {
        props: {
          items: [
            { id: "a", label: "A", content: "A" },
            { id: "b", label: "B", content: "B" },
          ],
        },
      });
      const tabs = wrapper.findAll("[role='tab']");
      await tabs[1].trigger("click");
      expect(wrapper.emitted("change")).toBeTruthy();
    });

    it("has name Tabs", () => {
      expect(Tabs.name).toBe("Tabs");
    });
  });

  // --- Toast ---
  describe("Toast", () => {
    it("renders aside.st-toast with default tone info", () => {
      const wrapper = mount(Toast, { props: { title: "Notice" } });
      expect(wrapper.find("aside.st-toast").exists()).toBe(true);
      expect(wrapper.find(".st-toast--info").exists()).toBe(true);
    });

    it("applies tone modifier class", () => {
      const wrapper = mount(Toast, {
        props: { tone: "error", title: "Error!" },
      });
      expect(wrapper.find(".st-toast--error").exists()).toBe(true);
    });

    it("renders title text", () => {
      const wrapper = mount(Toast, { props: { title: "Done" } });
      expect(wrapper.find(".st-toast__title").text()).toBe("Done");
    });

    it("renders message when provided", () => {
      const wrapper = mount(Toast, {
        props: { title: "T", message: "Something happened" },
      });
      expect(wrapper.find(".st-toast__message").text()).toBe("Something happened");
    });

    it("renders a queue of items when items prop provided", () => {
      const wrapper = mount(Toast, {
        props: {
          items: [
            { id: "1", title: "Toast 1" },
            { id: "2", title: "Toast 2" },
          ],
        },
      });
      expect(wrapper.find(".st-toastQueue").exists()).toBe(true);
      expect(wrapper.findAll(".st-toast").length).toBe(2);
    });

    it("emits close on close button click", async () => {
      const wrapper = mount(Toast, { props: { title: "Hello" } });
      await wrapper.find("button").trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("has name Toast", () => {
      expect(Toast.name).toBe("Toast");
    });
  });

  // --- Toggletip ---
  describe("Toggletip", () => {
    it("renders span.st-toggletip with default placement top", () => {
      const wrapper = mount(Toggletip, { props: { label: "Info" } });
      expect(wrapper.find(".st-toggletip").exists()).toBe(true);
      expect(wrapper.find(".st-toggletip--top").exists()).toBe(true);
    });

    it("renders trigger button", () => {
      const wrapper = mount(Toggletip, { props: { label: "Info" } });
      expect(wrapper.find(".st-toggletip__trigger").exists()).toBe(true);
    });

    it("opens bubble when trigger clicked", async () => {
      const wrapper = mount(Toggletip, {
        props: { label: "Info", content: "Details here" },
      });
      expect(wrapper.find(".st-toggletip__bubble").exists()).toBe(false);
      await wrapper.find(".st-toggletip__trigger").trigger("click");
      expect(wrapper.find(".st-toggletip__bubble").exists()).toBe(true);
    });

    it("shows content inside bubble", async () => {
      const wrapper = mount(Toggletip, {
        props: { label: "Info", content: "Hello details" },
      });
      await wrapper.find(".st-toggletip__trigger").trigger("click");
      expect(wrapper.find(".st-toggletip__content").text()).toBe("Hello details");
    });

    it("emits update:open on toggle", async () => {
      const wrapper = mount(Toggletip, { props: { label: "Info" } });
      await wrapper.find(".st-toggletip__trigger").trigger("click");
      expect(wrapper.emitted("update:open")).toBeTruthy();
    });

    it("has name Toggletip", () => {
      expect(Toggletip.name).toBe("Toggletip");
    });
  });

  // --- Tooltip ---
  describe("Tooltip", () => {
    it("renders span.st-tooltip with default placement top", () => {
      const wrapper = mount(Tooltip, {
        props: { content: "Help text" },
        slots: { default: "Hover me" },
      });
      expect(wrapper.find(".st-tooltip").exists()).toBe(true);
      expect(wrapper.find(".st-tooltip--top").exists()).toBe(true);
    });

    it("renders trigger slot in st-tooltip__trigger", () => {
      const wrapper = mount(Tooltip, {
        props: { content: "Info" },
        slots: { default: "Button" },
      });
      expect(wrapper.find(".st-tooltip__trigger").text()).toBe("Button");
    });

    it("renders tooltip content", () => {
      const wrapper = mount(Tooltip, {
        props: { content: "My tooltip" },
        slots: { default: "?" },
      });
      expect(wrapper.find(".st-tooltip__content").text()).toBe("My tooltip");
    });

    it("tooltip content has role=tooltip", () => {
      const wrapper = mount(Tooltip, {
        props: { content: "info" },
        slots: { default: "x" },
      });
      expect(wrapper.find("[role='tooltip']").exists()).toBe(true);
    });

    it("applies placement modifier", () => {
      const wrapper = mount(Tooltip, {
        props: { content: "Info", placement: "bottom" },
        slots: { default: "x" },
      });
      expect(wrapper.find(".st-tooltip--bottom").exists()).toBe(true);
    });

    it("has name Tooltip", () => {
      expect(Tooltip.name).toBe("Tooltip");
    });
  });

  // --- TreeView ---
  describe("TreeView", () => {
    it("renders div.st-treeView with role=tree", () => {
      const wrapper = mount(TreeView, {
        props: { nodes: [{ id: "n1", label: "Node 1" }] },
      });
      expect(wrapper.find(".st-treeView").exists()).toBe(true);
      expect(wrapper.find("[role='tree']").exists()).toBe(true);
    });

    it("renders tree rows", () => {
      const wrapper = mount(TreeView, {
        props: {
          nodes: [
            { id: "n1", label: "Node 1" },
            { id: "n2", label: "Node 2" },
          ],
        },
      });
      expect(wrapper.findAll(".st-treeView__row").length).toBe(2);
    });

    it("marks selected row", () => {
      const wrapper = mount(TreeView, {
        props: {
          nodes: [{ id: "n1", label: "Node 1" }],
          selectedId: "n1",
        },
      });
      expect(wrapper.find(".st-treeView__row--selected").exists()).toBe(true);
    });

    it("renders caret as leaf when node has no children", () => {
      const wrapper = mount(TreeView, {
        props: { nodes: [{ id: "n1", label: "Leaf" }] },
      });
      expect(wrapper.find(".st-treeView__caret--leaf").exists()).toBe(true);
    });

    it("expands children when id in expandedIds", () => {
      const wrapper = mount(TreeView, {
        props: {
          nodes: [
            {
              id: "n1",
              label: "Parent",
              children: [{ id: "n1a", label: "Child" }],
            },
          ],
          expandedIds: ["n1"],
        },
      });
      expect(wrapper.findAll(".st-treeView__row").length).toBe(2);
    });

    it("has name TreeView", () => {
      expect(TreeView.name).toBe("TreeView");
    });
  });

  // --- Combobox ---
  describe("Combobox", () => {
    it("renders div.st-combobox with default size md", () => {
      const wrapper = mount(Combobox, {
        props: { options: [{ value: "a", label: "A" }] },
      });
      expect(wrapper.find(".st-combobox").exists()).toBe(true);
      expect(wrapper.find(".st-combobox--md").exists()).toBe(true);
    });

    it("renders a combobox input", () => {
      const wrapper = mount(Combobox, { props: { options: [] } });
      expect(wrapper.find("input[role='combobox']").exists()).toBe(true);
    });

    it("shows option list when input focused", async () => {
      const wrapper = mount(Combobox, {
        props: { options: [{ value: "a", label: "Option A" }] },
      });
      await wrapper.find("input").trigger("focus");
      expect(wrapper.find(".st-combobox__list").exists()).toBe(true);
    });

    it("renders options in list", async () => {
      const wrapper = mount(Combobox, {
        props: {
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      });
      await wrapper.find("input").trigger("focus");
      expect(wrapper.findAll(".st-combobox__option").length).toBe(2);
    });

    it("applies size modifier", () => {
      const wrapper = mount(Combobox, {
        props: { options: [], size: "sm" },
      });
      expect(wrapper.find(".st-combobox--sm").exists()).toBe(true);
    });

    it("has name Combobox", () => {
      expect(Combobox.name).toBe("Combobox");
    });
  });

  // --- MultiSelect ---
  describe("MultiSelect", () => {
    it("renders div.st-multiSelect with default size md", () => {
      const wrapper = mount(MultiSelect, {
        props: { options: [{ value: "a", label: "A" }] },
      });
      expect(wrapper.find(".st-multiSelect").exists()).toBe(true);
      expect(wrapper.find(".st-multiSelect--md").exists()).toBe(true);
    });

    it("renders a trigger button", () => {
      const wrapper = mount(MultiSelect, { props: { options: [] } });
      expect(wrapper.find(".st-multiSelect__trigger").exists()).toBe(true);
    });

    it("opens list when trigger clicked", async () => {
      const wrapper = mount(MultiSelect, {
        props: { options: [{ value: "a", label: "A" }] },
      });
      expect(wrapper.find(".st-multiSelect__list").exists()).toBe(false);
      await wrapper.find(".st-multiSelect__trigger").trigger("click");
      expect(wrapper.find(".st-multiSelect__list").exists()).toBe(true);
    });

    it("renders options in list", async () => {
      const wrapper = mount(MultiSelect, {
        props: {
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      });
      await wrapper.find(".st-multiSelect__trigger").trigger("click");
      expect(wrapper.findAll(".st-multiSelect__option").length).toBe(2);
    });

    it("marks selected options with --selected class", async () => {
      const wrapper = mount(MultiSelect, {
        props: {
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
          value: ["a"],
        },
      });
      await wrapper.find(".st-multiSelect__trigger").trigger("click");
      const options = wrapper.findAll(".st-multiSelect__option");
      expect(options[0].classes()).toContain("st-multiSelect__option--selected");
      expect(options[1].classes()).not.toContain("st-multiSelect__option--selected");
    });

    it("has name MultiSelect", () => {
      expect(MultiSelect.name).toBe("MultiSelect");
    });
  });

  // --- DatePicker ---
  describe("DatePicker", () => {
    it("renders div.st-datepicker", () => {
      const wrapper = mount(DatePicker);
      expect(wrapper.find(".st-datepicker").exists()).toBe(true);
    });

    it("applies size modifier", () => {
      const wrapper = mount(DatePicker, { props: { size: "sm" } });
      expect(wrapper.find(".st-datepicker--sm").exists()).toBe(true);
    });

    it("renders a date input", () => {
      const wrapper = mount(DatePicker);
      expect(wrapper.find("input[type=date]").exists()).toBe(true);
    });

    it("renders label when provided", () => {
      const wrapper = mount(DatePicker, { props: { label: "Birth date" } });
      expect(wrapper.find(".st-field__label").text()).toBe("Birth date");
    });

    it("has name DatePicker", () => {
      expect(DatePicker.name).toBe("DatePicker");
    });
  });

  // --- DataTable ---
  describe("DataTable", () => {
    it("renders div.st-dataTable-wrap with table.st-dataTable", () => {
      const wrapper = mount(DataTable, {
        props: { columns: [{ key: "name", label: "Name" }], rows: [] },
      });
      expect(wrapper.find(".st-dataTable-wrap").exists()).toBe(true);
      expect(wrapper.find("table.st-dataTable").exists()).toBe(true);
    });

    it("applies size modifier", () => {
      const wrapper = mount(DataTable, {
        props: { columns: [], rows: [], size: "sm" },
      });
      expect(wrapper.find(".st-dataTable--sm").exists()).toBe(true);
    });

    it("renders column headers", () => {
      const wrapper = mount(DataTable, {
        props: {
          columns: [
            { key: "a", label: "Col A" },
            { key: "b", label: "Col B" },
          ],
          rows: [],
        },
      });
      expect(wrapper.findAll("th").length).toBe(2);
    });

    it("renders rows", () => {
      const wrapper = mount(DataTable, {
        props: {
          columns: [{ key: "name", label: "Name" }],
          rows: [
            { id: "1", name: "Alice" },
            { id: "2", name: "Bob" },
          ],
        },
      });
      expect(wrapper.findAll("tbody tr").length).toBe(2);
    });

    it("renders a sort button and cycles asc -> desc -> none on click", async () => {
      const onSortChange = vi.fn();
      const wrapper = mount(DataTable, {
        props: {
          columns: [
            { key: "name", label: "Name", sortable: true },
            { key: "count", label: "Count", align: "end" },
          ],
          rows: [
            { id: "a", name: "Beta", count: 4 },
            { id: "b", name: "Alpha", count: 2 },
          ],
          onSortChange,
        },
      });
      const names = () => wrapper.findAll("tbody tr td:first-child").map((n) => n.text());
      expect(names()).toEqual(["Beta", "Alpha"]);
      const btn = wrapper.find(".st-dataTable__sortBtn");
      await btn.trigger("click");
      expect(names()).toEqual(["Alpha", "Beta"]);
      expect(wrapper.find('th[aria-sort="ascending"]').exists()).toBe(true);
      expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" });
      await btn.trigger("click");
      expect(names()).toEqual(["Beta", "Alpha"]);
      await btn.trigger("click");
      expect(onSortChange).toHaveBeenLastCalledWith(null);
    });

    it("supports multiple selection and emits onSelectionChange", async () => {
      const onSelectionChange = vi.fn();
      const wrapper = mount(DataTable, {
        props: {
          columns: [{ key: "name", label: "Name" }],
          rows: [
            { id: "a", name: "Alpha" },
            { id: "b", name: "Beta" },
          ],
          selectable: "multiple",
          onSelectionChange,
        },
      });
      const boxes = wrapper.findAll('tbody input[type="checkbox"]');
      expect(boxes.length).toBe(2);
      await boxes[0].setValue(true);
      expect(onSelectionChange).toHaveBeenCalledWith(["a"]);
      expect(wrapper.find(".st-dataTable__row--selected").exists()).toBe(true);
    });

    it("paginates with a range label and prev/next controls", async () => {
      const wrapper = mount(DataTable, {
        props: {
          columns: [{ key: "name", label: "Name" }],
          rows: [
            { id: "a", name: "Alpha" },
            { id: "b", name: "Beta" },
            { id: "c", name: "Gamma" },
          ],
          pageSize: 2,
        },
      });
      expect(wrapper.find(".st-dataTable__range").text()).toBe("1–2 of 3");
      expect(wrapper.findAll("tbody tr").length).toBe(2);
      const buttons = wrapper.findAll(".st-dataTable__pagerBtn");
      expect((buttons[0].element as HTMLButtonElement).disabled).toBe(true);
      await buttons[1].trigger("click");
      expect(wrapper.find(".st-dataTable__range").text()).toBe("3–3 of 3");
      expect(wrapper.findAll("tbody tr").length).toBe(1);
    });

    it("renders a custom cell, an empty label and fires onRowClick", async () => {
      const onRowClick = vi.fn();
      const empty = mount(DataTable, {
        props: { columns: [{ key: "name", label: "Name" }], rows: [], emptyLabel: "Nothing here" },
      });
      expect(empty.find(".st-dataTable__empty").text()).toBe("Nothing here");
      const wrapper = mount(DataTable, {
        props: {
          columns: [{ key: "name", label: "Name", cell: (row: { name: unknown }) => h("strong", {}, String(row.name)) }],
          rows: [{ id: "a", name: "Alpha" }],
          onRowClick,
        },
      });
      expect(wrapper.find("td strong").text()).toBe("Alpha");
      await wrapper.find(".st-dataTable__row--clickable").trigger("click");
      expect(onRowClick).toHaveBeenCalledWith({ id: "a", name: "Alpha" });
    });

    it("has name DataTable", () => {
      expect(DataTable.name).toBe("DataTable");
    });
  });

  // --- Table ---
  describe("Table", () => {
    it("renders div.st-table-wrap with table.st-table", () => {
      const wrapper = mount(Table, {
        props: { columns: [{ key: "name", label: "Name" }], rows: [] },
      });
      expect(wrapper.find(".st-table-wrap").exists()).toBe(true);
      expect(wrapper.find("table.st-table").exists()).toBe(true);
    });

    it("renders column headers", () => {
      const wrapper = mount(Table, {
        props: {
          columns: [
            { key: "a", label: "Col A" },
            { key: "b", label: "Col B" },
          ],
          rows: [],
        },
      });
      expect(wrapper.findAll("th").length).toBe(2);
    });

    it("renders rows with cell data", () => {
      const wrapper = mount(Table, {
        props: {
          columns: [{ key: "name", label: "Name" }],
          rows: [{ id: "1", name: "Alice" }, { id: "2", name: "Bob" }],
        },
      });
      expect(wrapper.findAll("tbody tr").length).toBe(2);
    });

    it("renders caption", () => {
      const wrapper = mount(Table, {
        props: { columns: [], rows: [], caption: "My Table" },
      });
      expect(wrapper.find("caption").text()).toBe("My Table");
    });

    it("has name Table", () => {
      expect(Table.name).toBe("Table");
    });
  });

  // --- Batch 4 export surface ---
  describe("export surface — batch 4", () => {
    const batch4 = {
      Combobox,
      DataTable,
      DatePicker,
      Menu,
      MenuPopover,
      MenuTriggerButton,
      Modal,
      MultiSelect,
      OverflowMenu,
      Popover,
      Table,
      Tabs,
      Toast,
      Toggletip,
      Tooltip,
      TreeView,
    };

    it("exports all batch 4 components", () => {
      for (const [name, component] of Object.entries(batch4)) {
        expect(component, `${name} should be exported`).toBeDefined();
        expect(typeof component).toBe("object");
      }
    });

    it("each batch 4 component has a name property matching its key", () => {
      for (const [name, component] of Object.entries(batch4)) {
        expect(component.name, `${name}.name`).toBe(name);
      }
    });
  });
});

// ─── Batch 5: charts / data-viz / chat ──────────────────────────────────────

describe("Vue behavioral parity — batch 5", () => {
  // --- AreaChart ---
  describe("AreaChart", () => {
    it("renders div.st-areaChart with an aria-labelled visual", () => {
      const wrapper = mount(AreaChart, {
        props: { data: [{ x: 0, y: 10 }, { x: 1, y: 20 }], label: "Area" },
      });
      expect(wrapper.find("div.st-areaChart").exists()).toBe(true);
      expect(wrapper.find(".st-areaChart__visual").attributes("aria-label")).toBe("Area");
    });

    it("renders SVG with a line path and an area path", () => {
      const wrapper = mount(AreaChart, {
        props: { data: [{ x: 0, y: 5 }, { x: 1, y: 10 }], label: "A" },
      });
      expect(wrapper.find(".st-areaChart__line").exists()).toBe(true);
      expect(wrapper.find(".st-areaChart__area").exists()).toBe(true);
    });

    it("renders dot circles for each datum", () => {
      const wrapper = mount(AreaChart, {
        props: { data: [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 3 }], label: "A" },
      });
      expect(wrapper.findAll(".st-areaChart__dot").length).toBe(3);
    });

    it("normalises a bare number[] into x/y data values", () => {
      const wrapper = mount(AreaChart, {
        props: { data: [3, 6, 2], label: "Bare" },
      });
      expect(wrapper.findAll(".st-areaChart__dot").length).toBe(3);
      const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
      expect(items).toEqual(["0: 3", "1: 6", "2: 2"]);
    });

    it("exposes the label via the data list aria-label", () => {
      const wrapper = mount(AreaChart, {
        props: { data: [{ x: 0, y: 1 }], label: "My Area Chart" },
      });
      expect(wrapper.find(".st-chartDataList").attributes("aria-label")).toBe("Data values for My Area Chart");
    });

    it("has name AreaChart", () => {
      expect(AreaChart.name).toBe("AreaChart");
    });
  });

  // --- BarChart ---
  describe("BarChart", () => {
    it("renders div.st-barChart", () => {
      const wrapper = mount(BarChart, {
        props: { data: [{ label: "A", value: 10 }], label: "Bar" },
      });
      expect(wrapper.find("div.st-barChart").exists()).toBe(true);
    });

    it("renders one rect per datum", () => {
      const wrapper = mount(BarChart, {
        props: { data: [{ label: "A", value: 5 }, { label: "B", value: 8 }, { label: "C", value: 3 }], label: "Bar" },
      });
      expect(wrapper.findAll(".st-barChart__bar").length).toBe(3);
    });

    it("applies tone class to bars and defaults to category1", () => {
      const wrapper = mount(BarChart, {
        props: { data: [{ label: "A", value: 10, tone: "category2" }, { label: "B", value: 4 }], label: "Bar" },
      });
      expect(wrapper.find(".st-barChart__bar--category2").exists()).toBe(true);
      expect(wrapper.find(".st-barChart__bar--category1").exists()).toBe(true);
    });

    it("supports horizontal orientation", () => {
      const wrapper = mount(BarChart, {
        props: { data: [{ label: "A", value: 4 }], label: "Bar", orientation: "horizontal" },
      });
      expect(wrapper.find(".st-barChart__categoryLabel").attributes("text-anchor")).toBe("end");
    });

    it("has name BarChart", () => {
      expect(BarChart.name).toBe("BarChart");
    });
  });

  // --- LineChart ---
  describe("LineChart", () => {
    it("renders div.st-lineChart with a tone modifier", () => {
      const wrapper = mount(LineChart, {
        props: { data: [{ x: 0, y: 10 }, { x: 1, y: 20 }], label: "Line", tone: "category5" },
      });
      expect(wrapper.find("div.st-lineChart").exists()).toBe(true);
      expect(wrapper.find(".st-lineChart--category5").exists()).toBe(true);
    });

    it("renders a line path with no fill", () => {
      const wrapper = mount(LineChart, {
        props: { data: [{ x: 0, y: 5 }, { x: 1, y: 10 }], label: "Line" },
      });
      expect(wrapper.find(".st-lineChart__line").exists()).toBe(true);
      expect(wrapper.find(".st-lineChart__line").attributes("fill")).toBe("none");
    });

    it("renders dot circles for each datum", () => {
      const wrapper = mount(LineChart, {
        props: { data: [{ x: 0, y: 1 }, { x: 1, y: 2 }], label: "Line" },
      });
      expect(wrapper.findAll(".st-lineChart__dot").length).toBe(2);
    });

    it("draws an area path only when area is enabled", () => {
      const plain = mount(LineChart, { props: { data: [{ x: 0, y: 1 }, { x: 1, y: 3 }], label: "L" } });
      expect(plain.find(".st-lineChart__area").exists()).toBe(false);
      const withArea = mount(LineChart, { props: { data: [{ x: 0, y: 1 }, { x: 1, y: 3 }], label: "L", area: true } });
      expect(withArea.find(".st-lineChart__area").exists()).toBe(true);
    });

    it("emits cubic beziers when smooth is set", () => {
      const wrapper = mount(LineChart, {
        props: { data: [{ x: 0, y: 1 }, { x: 1, y: 4 }, { x: 2, y: 2 }], label: "L", smooth: true },
      });
      expect(wrapper.find(".st-lineChart__line").attributes("d")).toContain("C");
    });

    it("has name LineChart", () => {
      expect(LineChart.name).toBe("LineChart");
    });
  });

  // --- DonutChart ---
  describe("DonutChart", () => {
    it("renders div.st-donutChart with an aria-labelled visual", () => {
      const wrapper = mount(DonutChart, {
        props: { label: "Donut", data: [{ label: "A", value: 30 }, { label: "B", value: 70 }] },
      });
      expect(wrapper.find("div.st-donutChart").exists()).toBe(true);
      expect(wrapper.find(".st-donutChart__visual").attributes("aria-label")).toBe("Donut");
    });

    it("renders one ring-slice path per datum with tone classes", () => {
      const wrapper = mount(DonutChart, {
        props: { label: "L", data: [{ label: "A", value: 40, tone: "category3" }, { label: "B", value: 60 }] },
      });
      const slices = wrapper.findAll("path.st-donutChart__slice");
      expect(slices.length).toBe(2);
      expect(slices[0].attributes("d")?.startsWith("M")).toBe(true);
      expect(wrapper.find(".st-donutChart__slice--category3").exists()).toBe(true);
    });

    it("renders center text with the total and an SR data list", () => {
      const wrapper = mount(DonutChart, {
        props: { label: "L", data: [{ label: "A", value: 30 }, { label: "B", value: 70 }] },
      });
      expect(wrapper.find(".st-donutChart__center").text()).toBe("100");
      const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
      expect(items).toEqual(["A: 30 (30%)", "B: 70 (70%)"]);
    });

    it("honours a custom centerLabel and hides it when null", () => {
      const custom = mount(DonutChart, {
        props: { label: "L", centerLabel: "42%", data: [{ label: "A", value: 1 }] },
      });
      expect(custom.find(".st-donutChart__center").text()).toBe("42%");
      const hidden = mount(DonutChart, {
        props: { label: "L", centerLabel: null, data: [{ label: "A", value: 1 }] },
      });
      expect(hidden.find(".st-donutChart__center").exists()).toBe(false);
    });

    it("has name DonutChart", () => {
      expect(DonutChart.name).toBe("DonutChart");
    });
  });

  // --- ScatterPlot ---
  describe("ScatterPlot", () => {
    it("renders div.st-scatterPlot with axes and an aria-labelled visual", () => {
      const wrapper = mount(ScatterPlot, {
        props: { label: "Scatter", data: [{ x: 1, y: 2 }] },
      });
      expect(wrapper.find("div.st-scatterPlot").exists()).toBe(true);
      expect(wrapper.find(".st-scatterPlot__visual").attributes("aria-label")).toBe("Scatter");
      expect(wrapper.findAll(".st-scatterPlot__axis").length).toBe(2);
    });

    it("renders one circle per datum", () => {
      const wrapper = mount(ScatterPlot, {
        props: { label: "L", data: [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }] },
      });
      expect(wrapper.findAll(".st-scatterPlot__point").length).toBe(3);
    });

    it("applies tone class to points and honours a custom radius", () => {
      const wrapper = mount(ScatterPlot, {
        props: { label: "L", radius: 9, data: [{ x: 1, y: 2, tone: "category3" }] },
      });
      expect(wrapper.find(".st-scatterPlot__point--category3").exists()).toBe(true);
      expect(wrapper.find(".st-scatterPlot__point").attributes("r")).toBe("9");
    });

    it("renders axis labels and an SR data list", () => {
      const wrapper = mount(ScatterPlot, {
        props: { label: "L", xLabel: "X", yLabel: "Y", data: [{ x: 1, y: 2, label: "P1" }] },
      });
      const axisLabels = wrapper.findAll(".st-scatterPlot__axisLabel").map((n) => n.text());
      expect(axisLabels).toEqual(["X", "Y"]);
      const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
      expect(items).toEqual(["P1: x 1, y 2"]);
    });

    it("has name ScatterPlot", () => {
      expect(ScatterPlot.name).toBe("ScatterPlot");
    });
  });

  // --- Sparkline ---
  describe("Sparkline", () => {
    it("renders span.st-sparkline with default tone neutral and 120x28 viewBox", () => {
      const wrapper = mount(Sparkline, { props: { data: [1, 2, 3] } });
      expect(wrapper.find("span.st-sparkline").exists()).toBe(true);
      expect(wrapper.find(".st-sparkline--neutral").exists()).toBe(true);
      expect(wrapper.find("svg").attributes("viewBox")).toBe("0 0 120 28");
    });

    it("applies tone modifier", () => {
      const wrapper = mount(Sparkline, {
        props: { data: [1, 2, 3], tone: "success" },
      });
      expect(wrapper.find(".st-sparkline--success").exists()).toBe(true);
    });

    it("renders a line path in SVG with the default stroke width", () => {
      const wrapper = mount(Sparkline, { props: { data: [10, 20, 30] } });
      expect(wrapper.find(".st-sparkline__line").exists()).toBe(true);
      expect(wrapper.find(".st-sparkline__line").attributes("stroke-width")).toBe("1.5");
    });

    it("supports custom dimensions, strokeWidth and an optional area fill", () => {
      const wrapper = mount(Sparkline, {
        props: { data: [1, 2, 3], width: 200, height: 40, strokeWidth: 3, area: true },
      });
      expect(wrapper.find("svg").attributes("viewBox")).toBe("0 0 200 40");
      expect(wrapper.find(".st-sparkline__line").attributes("stroke-width")).toBe("3");
      expect(wrapper.find(".st-sparkline__area").exists()).toBe(true);
    });

    it("has name Sparkline", () => {
      expect(Sparkline.name).toBe("Sparkline");
    });
  });

  // --- StackedBarChart ---
  describe("StackedBarChart", () => {
    it("renders div.st-stackedBar with an aria-labelled visual", () => {
      const wrapper = mount(StackedBarChart, {
        props: {
          label: "Sales",
          data: [{ label: "Row 1", segments: [{ label: "A", value: 50 }, { label: "B", value: 50 }] }],
        },
      });
      expect(wrapper.find("div.st-stackedBar").exists()).toBe(true);
      expect(wrapper.find(".st-stackedBar__visual").attributes("aria-label")).toBe("Sales");
    });

    it("renders segment rects with tone classes", () => {
      const wrapper = mount(StackedBarChart, {
        props: {
          label: "L",
          data: [
            {
              label: "Row 1",
              segments: [
                { label: "A", value: 60, tone: "category2" },
                { label: "B", value: 40 },
              ],
            },
          ],
        },
      });
      expect(wrapper.findAll(".st-stackedBar__seg").length).toBe(2);
      expect(wrapper.find(".st-stackedBar__seg--category2").exists()).toBe(true);
    });

    it("renders category labels, a legend and an SR data list", () => {
      const wrapper = mount(StackedBarChart, {
        props: {
          label: "L",
          data: [{ label: "Row A", segments: [{ label: "X", value: 70 }, { label: "Y", value: 30 }] }],
        },
      });
      expect(wrapper.find(".st-stackedBar__categoryLabel").text()).toBe("Row A");
      const legend = wrapper.findAll(".st-stackedBar__legendItem").map((n) => n.text().trim());
      expect(legend).toEqual(["X", "Y"]);
      const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
      expect(items).toEqual(["Row A, X: 70", "Row A, Y: 30"]);
    });

    it("can hide the legend via showLegend=false", () => {
      const wrapper = mount(StackedBarChart, {
        props: {
          label: "L",
          showLegend: false,
          data: [{ label: "Q1", segments: [{ label: "A", value: 2 }] }],
        },
      });
      expect(wrapper.find(".st-stackedBar__legend").exists()).toBe(false);
    });

    it("has name StackedBarChart", () => {
      expect(StackedBarChart.name).toBe("StackedBarChart");
    });
  });

  // --- ForceGraph ---
  describe("ForceGraph", () => {
    it("renders figure.st-forceGraph", () => {
      const wrapper = mount(ForceGraph, {
        props: { nodes: [{ id: "a", label: "A" }], edges: [] },
      });
      expect(wrapper.find("figure.st-forceGraph").exists()).toBe(true);
    });

    it("renders node circles", () => {
      const wrapper = mount(ForceGraph, {
        props: {
          nodes: [{ id: "a" }, { id: "b" }],
          edges: [],
        },
      });
      expect(wrapper.findAll(".st-forceGraph__dot").length).toBe(2);
    });

    it("renders edges as lines", () => {
      const wrapper = mount(ForceGraph, {
        props: {
          nodes: [{ id: "a" }, { id: "b" }],
          edges: [{ source: "a", target: "b" }],
        },
      });
      expect(wrapper.findAll(".st-forceGraph__edge").length).toBe(1);
    });

    it("marks selected nodes", () => {
      const wrapper = mount(ForceGraph, {
        props: {
          nodes: [{ id: "a" }],
          edges: [],
          selectedIds: ["a"],
        },
      });
      expect(wrapper.find(".st-forceGraph__node--selected").exists()).toBe(true);
    });

    it("applies weak class to weak edges", () => {
      const wrapper = mount(ForceGraph, {
        props: {
          nodes: [{ id: "a" }, { id: "b" }],
          edges: [{ source: "a", target: "b", weak: true }],
        },
      });
      expect(wrapper.find(".st-forceGraph__edge--weak").exists()).toBe(true);
    });

    it("emits select when node clicked", async () => {
      const wrapper = mount(ForceGraph, {
        props: { nodes: [{ id: "n1" }], edges: [] },
      });
      await wrapper.find(".st-forceGraph__node").trigger("click");
      expect(wrapper.emitted("select")).toBeTruthy();
      expect(wrapper.emitted("select")?.[0]).toEqual(["n1"]);
    });

    it("renders an svg", () => {
      const wrapper = mount(ForceGraph, {
        props: { nodes: [{ id: "a" }], edges: [] },
      });
      expect(wrapper.find("svg").exists()).toBe(true);
    });

    it("renders a node group per node", () => {
      const wrapper = mount(ForceGraph, {
        props: { nodes: [{ id: "a" }, { id: "b" }, { id: "c" }], edges: [] },
      });
      expect(wrapper.findAll(".st-forceGraph__node").length).toBe(3);
    });

    it("renders a path.st-forceGraph__shape for non-dot shapes", () => {
      const wrapper = mount(ForceGraph, {
        props: {
          nodes: [
            { id: "d", shape: "diamond" },
            { id: "s", shape: "star" },
          ],
          edges: [],
        },
      });
      expect(wrapper.findAll("path.st-forceGraph__shape").length).toBe(2);
    });

    it("uses a circle (no shape path) for dot/circle shapes", () => {
      const wrapper = mount(ForceGraph, {
        props: {
          nodes: [{ id: "a", shape: "dot" }, { id: "b", shape: "circle" }],
          edges: [],
        },
      });
      expect(wrapper.findAll("path.st-forceGraph__shape").length).toBe(0);
      expect(wrapper.findAll("circle.st-forceGraph__dot").length).toBe(2);
    });

    it("renders the legend overlay when legend prop is set", () => {
      const wrapper = mount(ForceGraph, {
        props: {
          nodes: [{ id: "a" }],
          edges: [],
          legend: [
            { label: "Person", shape: "circle", tone: "category1" },
            { label: "Weak link", weak: true },
          ],
        },
      });
      expect(wrapper.find(".st-forceGraph__legend").exists()).toBe(true);
      expect(wrapper.findAll(".st-forceGraph__legendEntry").length).toBe(2);
    });

    it("emits edgeHover when an edge hit area is hovered", async () => {
      const wrapper = mount(ForceGraph, {
        props: {
          nodes: [{ id: "a" }, { id: "b" }],
          edges: [{ source: "a", target: "b", relation: "knows" }],
        },
      });
      await wrapper.find(".st-forceGraph__edgeHit").trigger("mouseenter");
      expect(wrapper.emitted("edgeHover")).toBeTruthy();
      expect(wrapper.emitted("edgeHover")?.[0]?.[0]).toMatchObject({
        source: "a",
        target: "b",
        relation: "knows",
      });
    });

    it("has name ForceGraph", () => {
      expect(ForceGraph.name).toBe("ForceGraph");
    });
  });

  // --- nodeShapePath helper ---
  describe("nodeShapePath", () => {
    it("returns null for dot and circle", () => {
      expect(nodeShapePath("dot", 7)).toBeNull();
      expect(nodeShapePath("circle", 7)).toBeNull();
      expect(nodeShapePath(undefined, 7)).toBeNull();
    });

    it("returns a non-null path for shaped nodes", () => {
      for (const shape of ["diamond", "star", "hexagon", "box", "square", "triangle"] as const) {
        const path = nodeShapePath(shape, 7);
        expect(path, `${shape} should produce a path`).not.toBeNull();
        expect(typeof path).toBe("string");
        expect((path as string).startsWith("M")).toBe(true);
      }
    });
  });

  // --- GraphLegend ---
  describe("GraphLegend", () => {
    it("renders div.st-graphLegend", () => {
      const wrapper = mount(GraphLegend, {
        props: { entries: [{ label: "Person", shape: "circle" }] },
      });
      expect(wrapper.find("div.st-graphLegend").exists()).toBe(true);
    });

    it("renders exactly one entry per entries item", () => {
      const wrapper = mount(GraphLegend, {
        props: {
          entries: [
            { label: "Person", shape: "circle", tone: "category1" },
            { label: "Place", shape: "diamond", tone: "category2" },
            { label: "Weak", weak: true },
          ],
        },
      });
      expect(wrapper.findAll(".st-graphLegend__entry").length).toBe(3);
    });

    it("renders the title when provided", () => {
      const wrapper = mount(GraphLegend, {
        props: { entries: [], title: "Legend" },
      });
      expect(wrapper.find(".st-graphLegend__title").text()).toBe("Legend");
    });

    it("renders a shape path for shaped entries and a line for edge entries", () => {
      const wrapper = mount(GraphLegend, {
        props: {
          entries: [
            { label: "Diamond", shape: "diamond" },
            { label: "Edge", weak: true },
          ],
        },
      });
      expect(wrapper.find("path.st-graphLegend__shape").exists()).toBe(true);
      expect(wrapper.find("line.st-graphLegend__edge").exists()).toBe(true);
    });

    it("has name GraphLegend", () => {
      expect(GraphLegend.name).toBe("GraphLegend");
    });
  });

  // --- ChatComposer ---
  describe("ChatComposer", () => {
    it("renders form.st-chatComposer", () => {
      const wrapper = mount(ChatComposer);
      expect(wrapper.find("form.st-chatComposer").exists()).toBe(true);
    });

    it("renders a textarea", () => {
      const wrapper = mount(ChatComposer);
      expect(wrapper.find(".st-chatComposer__textarea").exists()).toBe(true);
    });

    it("renders a submit button with submitLabel", () => {
      const wrapper = mount(ChatComposer, { props: { submitLabel: "Go" } });
      const btn = wrapper.find("button[type=submit]");
      expect(btn.exists()).toBe(true);
      expect(btn.text()).toBe("Go");
    });

    it("emits submit with current value on form submit", async () => {
      const wrapper = mount(ChatComposer, { props: { value: "hello" } });
      await wrapper.find("form").trigger("submit");
      expect(wrapper.emitted("submit")).toBeTruthy();
    });

    it("has name ChatComposer", () => {
      expect(ChatComposer.name).toBe("ChatComposer");
    });
  });

  // --- ChatMessage ---
  describe("ChatMessage", () => {
    it("renders article.st-chatMessage with default role assistant", () => {
      const wrapper = mount(ChatMessage);
      expect(wrapper.find("article.st-chatMessage").exists()).toBe(true);
      expect(wrapper.find(".st-chatMessage--assistant").exists()).toBe(true);
    });

    it("applies role modifier class", () => {
      const wrapper = mount(ChatMessage, { props: { role: "user" } });
      expect(wrapper.find(".st-chatMessage--user").exists()).toBe(true);
    });

    it("renders avatar initial", () => {
      const wrapper = mount(ChatMessage, { props: { role: "user" } });
      expect(wrapper.find(".st-chatMessage__avatar").text()).toBe("U");
    });

    it("renders content", () => {
      const wrapper = mount(ChatMessage, { props: { content: "Hello!" } });
      expect(wrapper.find(".st-chatMessage__content").text()).toBe("Hello!");
    });

    it("normalizes streaming status to processing", () => {
      const wrapper = mount(ChatMessage, { props: { status: "streaming" } });
      expect(wrapper.find(".st-chatMessage--processing").exists()).toBe(true);
    });

    it("normalizes error status to failed", () => {
      const wrapper = mount(ChatMessage, { props: { status: "error" } });
      expect(wrapper.find(".st-chatMessage--failed").exists()).toBe(true);
    });

    it("has name ChatMessage", () => {
      expect(ChatMessage.name).toBe("ChatMessage");
    });
  });

  // --- ChatThread ---
  describe("ChatThread", () => {
    it("renders section.st-chatThread", () => {
      const wrapper = mount(ChatThread);
      expect(wrapper.find("section.st-chatThread").exists()).toBe(true);
    });

    it("renders empty label when no messages", () => {
      const wrapper = mount(ChatThread, { props: { emptyLabel: "No messages yet" } });
      expect(wrapper.find(".st-chatThread__empty").text()).toBe("No messages yet");
    });

    it("renders ChatMessage for each message in messages prop", () => {
      const wrapper = mount(ChatThread, {
        props: {
          messages: [
            { id: "1", role: "user", content: "Hello" },
            { id: "2", role: "assistant", content: "Hi" },
          ],
        },
      });
      expect(wrapper.findAll(".st-chatMessage").length).toBe(2);
    });

    it("has name ChatThread", () => {
      expect(ChatThread.name).toBe("ChatThread");
    });
  });

  // --- StreamingMessage ---
  describe("StreamingMessage", () => {
    it("renders section.st-streamingMessage with default mode live", () => {
      const wrapper = mount(StreamingMessage);
      expect(wrapper.find("section.st-streamingMessage").exists()).toBe(true);
      expect(wrapper.find(".st-streamingMessage--live").exists()).toBe(true);
    });

    it("applies mode modifier", () => {
      const wrapper = mount(StreamingMessage, { props: { mode: "passive" } });
      expect(wrapper.find(".st-streamingMessage--passive").exists()).toBe(true);
    });

    it("renders text", () => {
      const wrapper = mount(StreamingMessage, { props: { text: "Loading..." } });
      expect(wrapper.find(".st-streamingMessage__text").text()).toBe("Loading...");
    });

    it("renders events as list items", () => {
      const wrapper = mount(StreamingMessage, {
        props: {
          events: [
            { id: "e1", label: "Step 1" },
            { id: "e2", label: "Step 2" },
          ],
        },
      });
      expect(wrapper.findAll(".st-streamingMessage__trailList li").length).toBe(2);
    });

    it("has name StreamingMessage", () => {
      expect(StreamingMessage.name).toBe("StreamingMessage");
    });
  });

  // --- MessageActions ---
  describe("MessageActions", () => {
    it("renders nav.st-messageActions", () => {
      const wrapper = mount(MessageActions, { props: { actions: [] } });
      expect(wrapper.find("nav.st-messageActions").exists()).toBe(true);
    });

    it("renders action buttons", () => {
      const wrapper = mount(MessageActions, {
        props: {
          actions: [
            { label: "Copy", onClick: () => {} },
            { label: "Delete", variant: "danger" },
          ],
        },
      });
      expect(wrapper.findAll("button").length).toBe(2);
    });

    it("applies danger class to danger variant actions", () => {
      const wrapper = mount(MessageActions, {
        props: { actions: [{ label: "Remove", variant: "danger" }] },
      });
      expect(wrapper.find(".st-button--danger").exists()).toBe(true);
    });

    it("applies hoverOnly modifier when visibility=hover", () => {
      const wrapper = mount(MessageActions, {
        props: { actions: [], visibility: "hover" },
      });
      expect(wrapper.find(".st-messageActions--hoverOnly").exists()).toBe(true);
    });

    it("has name MessageActions", () => {
      expect(MessageActions.name).toBe("MessageActions");
    });
  });

  // --- MessageStatusBadge ---
  describe("MessageStatusBadge", () => {
    it("renders span.st-messageStatusBadge", () => {
      const wrapper = mount(MessageStatusBadge, { props: { status: "completed" } });
      expect(wrapper.find("span.st-messageStatusBadge").exists()).toBe(true);
    });

    it("applies success tone for completed status", () => {
      const wrapper = mount(MessageStatusBadge, { props: { status: "completed" } });
      expect(wrapper.find(".st-badge--success").exists()).toBe(true);
    });

    it("applies error tone for failed status", () => {
      const wrapper = mount(MessageStatusBadge, { props: { status: "failed" } });
      expect(wrapper.find(".st-badge--error").exists()).toBe(true);
    });

    it("applies info tone for processing status", () => {
      const wrapper = mount(MessageStatusBadge, { props: { status: "processing" } });
      expect(wrapper.find(".st-badge--info").exists()).toBe(true);
    });

    it("normalizes sent to completed", () => {
      const wrapper = mount(MessageStatusBadge, { props: { status: "sent" } });
      expect(wrapper.find(".st-badge--success").exists()).toBe(true);
    });

    it("normalizes streaming to processing", () => {
      const wrapper = mount(MessageStatusBadge, { props: { status: "streaming" } });
      expect(wrapper.find(".st-badge--info").exists()).toBe(true);
    });

    it("renders the dot element", () => {
      const wrapper = mount(MessageStatusBadge, { props: { status: "pending" } });
      expect(wrapper.find(".st-messageStatusBadge__dot").exists()).toBe(true);
    });

    it("has name MessageStatusBadge", () => {
      expect(MessageStatusBadge.name).toBe("MessageStatusBadge");
    });
  });

  // --- Batch 5 export surface ---
  describe("export surface — batch 5", () => {
    const batch5 = {
      AreaChart,
      BarChart,
      LineChart,
      DonutChart,
      ScatterPlot,
      Sparkline,
      StackedBarChart,
      ForceGraph,
      GraphLegend,
      ChatComposer,
      ChatMessage,
      ChatThread,
      StreamingMessage,
      MessageActions,
      MessageStatusBadge,
    };

    it("exports all batch 5 components", () => {
      for (const [name, component] of Object.entries(batch5)) {
        expect(component, `${name} should be exported`).toBeDefined();
        expect(typeof component).toBe("object");
      }
    });

    it("each batch 5 component has a name property matching its key", () => {
      for (const [name, component] of Object.entries(batch5)) {
        expect(component.name, `${name}.name`).toBe(name);
      }
    });
  });
});
