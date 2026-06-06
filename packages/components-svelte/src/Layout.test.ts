import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Flex from "./lib/Flex.svelte";
import Stack from "./lib/Stack.svelte";
import Inline from "./lib/Inline.svelte";
import Container from "./lib/Container.svelte";
import Row from "./lib/Row.svelte";
import Col from "./lib/Col.svelte";
import Grid from "./lib/Grid.svelte";
import Hidden from "./lib/Hidden.svelte";
import Divider from "./lib/Divider.svelte";

const text = (value: string) =>
  createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe("Flex", () => {
  it("renders a flex container with gap token and justify mapping", () => {
    const { container } = render(Flex, {
      props: { gap: 4, justify: "between", align: "center", children: text("a") }
    });
    const el = container.querySelector(".st-flex") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.display).toBe("flex");
    expect(el.style.gap).toBe("var(--st-spacing-4, 1rem)");
    expect(el.style.justifyContent).toBe("space-between");
    expect(el.style.alignItems).toBe("center");
  });

  it("supports inline and direction and polymorphic as", () => {
    const { container } = render(Flex, {
      props: { inline: true, direction: "column", as: "section", children: text("a") }
    });
    const el = container.querySelector("section.st-flex") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.display).toBe("inline-flex");
    expect(el.style.flexDirection).toBe("column");
  });
});

describe("Stack", () => {
  it("is a column flex container", () => {
    const { container } = render(Stack, { props: { gap: 2, children: text("a") } });
    const el = container.querySelector(".st-stack") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.flexDirection).toBe("column");
    expect(el.style.gap).toBe("var(--st-spacing-2, 0.5rem)");
  });
});

describe("Inline", () => {
  it("wraps by default", () => {
    const { container } = render(Inline, { props: { gap: 3, children: text("a") } });
    const el = container.querySelector(".st-inline") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.flexDirection).toBe("row");
    expect(el.style.flexWrap).toBe("wrap");
  });
});

describe("Container", () => {
  it("applies size and padding modifiers", () => {
    const { container } = render(Container, {
      props: { size: "md", children: text("a") }
    });
    const el = container.querySelector(".st-container") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.classList.contains("st-container--md")).toBe(true);
    expect(el.classList.contains("st-container--padded")).toBe(true);
  });

  it("can disable padding", () => {
    const { container } = render(Container, {
      props: { padding: false, children: text("a") }
    });
    const el = container.querySelector(".st-container") as HTMLElement;
    expect(el.classList.contains("st-container--padded")).toBe(false);
  });
});

describe("Row", () => {
  it("renders a flex row and exposes the gutter custom property", () => {
    const { container } = render(Row, { props: { gutter: 4, children: text("a") } });
    const el = container.querySelector(".st-row") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.getPropertyValue("--st-row-gutter")).toBe("var(--st-spacing-4, 1rem)");
  });
});

describe("Col", () => {
  it("span=6 yields a 50% basis", () => {
    const { container } = render(Col, { props: { span: 6, children: text("a") } });
    const el = container.querySelector(".st-col") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.flexBasis).toContain("50%");
    expect(el.style.flexGrow).toBe("0");
  });

  it("span=auto grows", () => {
    const { container } = render(Col, { props: { span: "auto", children: text("a") } });
    const el = container.querySelector(".st-col") as HTMLElement;
    expect(el.classList.contains("st-col--auto")).toBe(true);
    expect(el.style.flexGrow).toBe("1");
  });

  it("applies an offset margin", () => {
    const { container } = render(Col, {
      props: { span: 4, offset: 2, children: text("a") }
    });
    const el = container.querySelector(".st-col") as HTMLElement;
    expect(el.style.marginInlineStart).toContain("16.66");
  });
});

describe("Grid", () => {
  it("renders a grid container with columns and a gap token", () => {
    const { container } = render(Grid, {
      props: { columns: 3, gap: 4, children: text("a") }
    });
    const el = container.querySelector(".st-grid") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.display).toBe("grid");
    expect(el.style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    expect(el.style.gap).toBe("var(--st-spacing-4, 1rem)");
  });

  it("uses auto-fill when minItemWidth is provided (priority over columns)", () => {
    const { container } = render(Grid, {
      props: { columns: 3, minItemWidth: "12rem", children: text("a") }
    });
    const el = container.querySelector(".st-grid") as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe("repeat(auto-fill, minmax(12rem, 1fr))");
  });

  it("supports the polymorphic as prop", () => {
    const { container } = render(Grid, {
      props: { columns: 2, as: "section", children: text("a") }
    });
    const el = container.querySelector("section.st-grid") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.gridTemplateColumns).toBe("repeat(2, minmax(0, 1fr))");
  });
});

describe("Hidden", () => {
  it("emits below/above modifier classes", () => {
    const { container } = render(Hidden, {
      props: { below: "md", above: "xl", children: text("a") }
    });
    const el = container.querySelector(".st-hidden") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.classList.contains("st-hidden--below-md")).toBe(true);
    expect(el.classList.contains("st-hidden--above-xl")).toBe(true);
  });
});

describe("Divider", () => {
  it("is a separator with the given orientation", () => {
    const { getByRole } = render(Divider, { props: { orientation: "vertical" } });
    const el = getByRole("separator");
    expect(el.getAttribute("aria-orientation")).toBe("vertical");
    expect(el.classList.contains("st-divider--vertical")).toBe(true);
  });

  it("renders a centered label as a horizontal separator", () => {
    const { getByRole, getByText } = render(Divider, {
      props: { label: "or", variant: "dashed" }
    });
    const el = getByRole("separator");
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    expect(el.classList.contains("st-divider--labeled")).toBe(true);
    expect(getByText("or")).toBeTruthy();
  });
});
