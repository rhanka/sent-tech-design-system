import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import {
  Accordion,
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  ContentSwitcher,
  EmptyState,
  Highlight,
  IconButton,
  InlineLoading,
  Input,
  Link,
  LoadingState,
  NumberInput,
  PasswordInput,
  ProgressBar,
  ProgressIndicator,
  Quote,
  Radio,
  Search,
  Select,
  SkeletonText,
  SkipLink,
  Switch,
  Tag,
  Textarea,
  ThemeProvider,
  Tile,
  TileGroup,
  Toggle,
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
