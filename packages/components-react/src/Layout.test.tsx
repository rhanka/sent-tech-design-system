import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Flex, Stack, Inline, Container, Row, Col, Grid, Hidden, Divider } from "./index.js";

afterEach(cleanup);

describe("Layout system (React)", () => {
  it("Flex renders flex display, direction and an inline gap token", () => {
    const { container } = render(
      <Flex gap={4} direction="column" align="center" justify="between">
        <span>child</span>
      </Flex>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("st-flex");
    expect(el.style.display).toBe("flex");
    expect(el.style.flexDirection).toBe("column");
    expect(el.style.alignItems).toBe("center");
    expect(el.style.justifyContent).toBe("space-between");
    expect(el.style.gap).toBe("var(--st-spacing-4, 1rem)");
  });

  it("Flex inline prop yields inline-flex and respects the as prop", () => {
    const { container } = render(<Flex inline as="span">x</Flex>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("SPAN");
    expect(el.style.display).toBe("inline-flex");
  });

  it("Stack forces column direction and adds st-stack/st-flex classes", () => {
    const { container } = render(<Stack gap={2}>x</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("st-stack");
    expect(el.className).toContain("st-flex");
    expect(el.style.flexDirection).toBe("column");
  });

  it("Inline wraps by default and adds st-inline class", () => {
    const { container } = render(<Inline>x</Inline>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("st-inline");
    expect(el.style.flexWrap).toBe("wrap");
  });

  it("Container applies size + padding classes", () => {
    const { container } = render(<Container size="md">x</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("st-container");
    expect(el.className).toContain("st-container--md");
    expect(el.className).toContain("st-container--padded");
  });

  it("Container can disable padding", () => {
    const { container } = render(<Container padding={false}>x</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).not.toContain("st-container--padded");
  });

  it("Row sets the --st-row-gutter custom property from the gutter step", () => {
    const { container } = render(<Row gutter={4}>x</Row>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("st-row");
    expect(el.style.getPropertyValue("--st-row-gutter")).toBe("var(--st-spacing-4, 1rem)");
    expect(el.style.gap).toBe("var(--st-spacing-4, 1rem)");
  });

  it("Col span=6 yields a ~50% flex-basis accounting for the gutter", () => {
    const { container } = render(<Col span={6}>x</Col>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("st-col");
    expect(el.style.flexBasis).toBe("calc(50% - var(--st-row-gutter, 0px) * 0.5)");
    expect(el.style.maxInlineSize).toBe("calc(50% - var(--st-row-gutter, 0px) * 0.5)");
    expect(el.style.flexGrow).toBe("0");
  });

  it("Col auto span grows and is flagged with st-col--auto", () => {
    const { container } = render(<Col>x</Col>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("st-col--auto");
    expect(el.style.flexBasis).toBe("auto");
    expect(el.style.flexGrow).toBe("1");
  });

  it("Col responsive props add has-* classes and --st-col-* vars", () => {
    const { container } = render(<Col span={12} md={6}>x</Col>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("st-col--has-md");
    expect(el.style.getPropertyValue("--st-col-md")).toBe(
      "calc(50% - var(--st-row-gutter, 0px) * 0.5)",
    );
  });

  it("Grid renders grid display with columns and a gap token", () => {
    const { container } = render(
      <Grid columns={3} gap={4}>
        <span>child</span>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("st-grid");
    expect(el.style.display).toBe("grid");
    expect(el.style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    expect(el.style.gap).toBe("var(--st-spacing-4, 1rem)");
  });

  it("Grid uses auto-fill when minItemWidth is set (priority over columns)", () => {
    const { container } = render(
      <Grid columns={3} minItemWidth="12rem">
        x
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe("repeat(auto-fill, minmax(12rem, 1fr))");
  });

  it("Grid respects the polymorphic as prop", () => {
    const { container } = render(
      <Grid columns={2} as="section">
        x
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("SECTION");
    expect(el.style.gridTemplateColumns).toBe("repeat(2, minmax(0, 1fr))");
  });

  it("Hidden applies the responsive class for below/above breakpoints", () => {
    const { container } = render(<Hidden below="md" above="xl">x</Hidden>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("st-hidden");
    expect(el.className).toContain("st-hidden--below-md");
    expect(el.className).toContain("st-hidden--above-xl");
  });

  it("Divider exposes role=separator with the right aria-orientation", () => {
    render(<Divider />);
    const sep = screen.getByRole("separator");
    expect(sep.getAttribute("aria-orientation")).toBe("horizontal");
    expect(sep.className).toContain("st-divider--horizontal");
    expect(sep.className).toContain("st-divider--solid");
  });

  it("Divider vertical variant sets aria-orientation=vertical", () => {
    render(<Divider orientation="vertical" variant="dashed" />);
    const sep = screen.getByRole("separator");
    expect(sep.getAttribute("aria-orientation")).toBe("vertical");
    expect(sep.className).toContain("st-divider--vertical");
    expect(sep.className).toContain("st-divider--dashed");
  });

  it("Divider with a label renders a labeled separator", () => {
    render(<Divider label="OR" spacing={4} />);
    const sep = screen.getByRole("separator");
    expect(sep.className).toContain("st-divider--labeled");
    expect(sep.getAttribute("aria-orientation")).toBe("horizontal");
    expect(screen.getByText("OR").className).toContain("st-divider__label");
  });
});
