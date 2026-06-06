import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { Flex, Stack, Inline, Container, Row, Col, Grid, Hidden, Divider } from "./index.js";

describe("Layout system (Vue)", () => {
  it("Flex renders flex display, direction and an inline gap token", () => {
    const wrapper = mount(Flex, {
      props: { gap: 4, direction: "column", align: "center", justify: "between" },
      slots: { default: "child" },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-flex")).toBe(true);
    expect(el.style.display).toBe("flex");
    expect(el.style.flexDirection).toBe("column");
    expect(el.style.alignItems).toBe("center");
    expect(el.style.justifyContent).toBe("space-between");
    expect(el.style.gap).toBe("var(--st-spacing-4, 1rem)");
  });

  it("Flex inline prop yields inline-flex and respects the as prop", () => {
    const wrapper = mount(Flex, { props: { inline: true, as: "span" }, slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.tagName).toBe("SPAN");
    expect(el.style.display).toBe("inline-flex");
  });

  it("Stack forces column direction and adds st-stack/st-flex classes", () => {
    const wrapper = mount(Stack, { props: { gap: 2 }, slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-stack")).toBe(true);
    expect(el.classList.contains("st-flex")).toBe(true);
    expect(el.style.flexDirection).toBe("column");
  });

  it("Inline wraps by default and adds st-inline class", () => {
    const wrapper = mount(Inline, { slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-inline")).toBe(true);
    expect(el.style.flexWrap).toBe("wrap");
  });

  it("Container applies size + padding classes", () => {
    const wrapper = mount(Container, { props: { size: "md" }, slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-container")).toBe(true);
    expect(el.classList.contains("st-container--md")).toBe(true);
    expect(el.classList.contains("st-container--padded")).toBe(true);
  });

  it("Container can disable padding", () => {
    const wrapper = mount(Container, { props: { padding: false }, slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-container--padded")).toBe(false);
  });

  it("Row sets the --st-row-gutter custom property from the gutter step", () => {
    const wrapper = mount(Row, { props: { gutter: 4 }, slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-row")).toBe(true);
    expect(el.style.getPropertyValue("--st-row-gutter")).toBe("var(--st-spacing-4, 1rem)");
    expect(el.style.gap).toBe("var(--st-spacing-4, 1rem)");
  });

  it("Col span=6 yields a ~50% flex-basis accounting for the gutter", () => {
    const wrapper = mount(Col, { props: { span: 6 }, slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-col")).toBe(true);
    expect(el.style.flexBasis).toBe("calc(50% - var(--st-row-gutter, 0px) * 0.5)");
    expect(el.style.getPropertyValue("max-inline-size")).toBe(
      "calc(50% - var(--st-row-gutter, 0px) * 0.5)",
    );
    expect(el.style.flexGrow).toBe("0");
  });

  it("Col auto span grows and is flagged with st-col--auto", () => {
    const wrapper = mount(Col, { slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-col--auto")).toBe(true);
    expect(el.style.flexBasis).toBe("auto");
    expect(el.style.flexGrow).toBe("1");
  });

  it("Col responsive props add has-* classes and --st-col-* vars", () => {
    const wrapper = mount(Col, { props: { span: 12, md: 6 }, slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-col--has-md")).toBe(true);
    expect(el.style.getPropertyValue("--st-col-md")).toBe(
      "calc(50% - var(--st-row-gutter, 0px) * 0.5)",
    );
  });

  it("Grid renders grid display with columns and a gap token", () => {
    const wrapper = mount(Grid, { props: { columns: 3, gap: 4 }, slots: { default: "child" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-grid")).toBe(true);
    expect(el.style.display).toBe("grid");
    expect(el.style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    expect(el.style.gap).toBe("var(--st-spacing-4, 1rem)");
  });

  it("Grid uses auto-fill when minItemWidth is set (priority over columns)", () => {
    const wrapper = mount(Grid, {
      props: { columns: 3, minItemWidth: "12rem" },
      slots: { default: "x" },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe("repeat(auto-fill, minmax(12rem, 1fr))");
  });

  it("Grid respects the polymorphic as prop", () => {
    const wrapper = mount(Grid, { props: { columns: 2, as: "section" }, slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.tagName).toBe("SECTION");
    expect(el.style.gridTemplateColumns).toBe("repeat(2, minmax(0, 1fr))");
  });

  it("Hidden applies the responsive class for below/above breakpoints", () => {
    const wrapper = mount(Hidden, { props: { below: "md", above: "xl" }, slots: { default: "x" } });
    const el = wrapper.element as HTMLElement;
    expect(el.classList.contains("st-hidden")).toBe(true);
    expect(el.classList.contains("st-hidden--below-md")).toBe(true);
    expect(el.classList.contains("st-hidden--above-xl")).toBe(true);
  });

  it("Divider exposes role=separator with the right aria-orientation", () => {
    const wrapper = mount(Divider);
    const sep = wrapper.element as HTMLElement;
    expect(sep.getAttribute("role")).toBe("separator");
    expect(sep.getAttribute("aria-orientation")).toBe("horizontal");
    expect(sep.classList.contains("st-divider--horizontal")).toBe(true);
    expect(sep.classList.contains("st-divider--solid")).toBe(true);
  });

  it("Divider vertical variant sets aria-orientation=vertical", () => {
    const wrapper = mount(Divider, { props: { orientation: "vertical", variant: "dashed" } });
    const sep = wrapper.element as HTMLElement;
    expect(sep.getAttribute("aria-orientation")).toBe("vertical");
    expect(sep.classList.contains("st-divider--vertical")).toBe(true);
    expect(sep.classList.contains("st-divider--dashed")).toBe(true);
  });

  it("Divider with a label renders a labeled separator", () => {
    const wrapper = mount(Divider, { props: { label: "OR", spacing: 4 } });
    const sep = wrapper.element as HTMLElement;
    expect(sep.classList.contains("st-divider--labeled")).toBe(true);
    expect(sep.getAttribute("aria-orientation")).toBe("horizontal");
    const label = wrapper.find(".st-divider__label");
    expect(label.text()).toBe("OR");
  });
});
