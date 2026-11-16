import { signal } from "@preact/signals";
import { cleanup, render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, it } from "vitest";
import { Accordion } from "./Accordion.js";
import { AspectRatio } from "./AspectRatio.js";
import { Autosave } from "./Autosave.js";
import { ButtonGroup } from "./ButtonGroup.js";
import { Col } from "./Col.js";
import { Collapsible } from "./Collapsible.js";
import { Container } from "./Container.js";
import { Divider } from "./Divider.js";
import { FieldCard } from "./FieldCard.js";
import { Flex } from "./Flex.js";
import { Grid } from "./Grid.js";
import { Hidden } from "./Hidden.js";
import { Inline } from "./Inline.js";
import { InlineLoading } from "./InlineLoading.js";
import { Notification } from "./Notification.js";
import { PanelSection } from "./PanelSection.js";
import { PanelStack } from "./PanelStack.js";
import { ProgressBar } from "./ProgressBar.js";
import { Rating } from "./Rating.js";
import { Row } from "./Row.js";
import { Stack } from "./Stack.js";
import { StatusDot } from "./StatusDot.js";
import { Tile } from "./Tile.js";
import { Timeline } from "./Timeline.js";
import { mergeStyle } from "./internal.js";

afterEach(cleanup);

describe("P1 edges (Carbon findings 2-4)", () => {
  it("FieldCard renders kebab-case SVG presentation attributes and keeps viewBox", () => {
    const { container } = render(<FieldCard label="F" commentCount={2} onOpenComments={() => {}} />);
    const path = container.querySelector("svg path");
    expect(path?.getAttribute("stroke-width")).toBe("1.25");
    expect(path?.getAttribute("stroke-linecap")).toBe("round");
    expect(path?.getAttribute("stroke-linejoin")).toBe("round");
    expect(path?.getAttribute("strokeWidth")).toBeNull();
    expect(path?.getAttribute("strokeLinecap")).toBeNull();
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 16 16");
  });

  it("Rating renders kebab-case SVG presentation attributes and keeps viewBox", () => {
    const { container } = render(<Rating value={3} label="Note" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("stroke-width")).toBe("1.75");
    expect(svg?.getAttribute("stroke-linecap")).toBe("round");
    expect(svg?.getAttribute("stroke-linejoin")).toBe("round");
    expect(svg?.getAttribute("strokeWidth")).toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  it("accepts a Signal for className on the P1 layout modules", () => {
    render(
      <>
        <Flex data-testid="e-flex" className={signal("x-flex")}>a</Flex>
        <Grid data-testid="e-grid" className={signal("x-grid")}>a</Grid>
        <Row data-testid="e-row" className={signal("x-row")}>a</Row>
        <Col data-testid="e-col" className={signal("x-col")}>a</Col>
        <Container data-testid="e-container" className={signal("x-container")}>a</Container>
        <Divider data-testid="e-divider" className={signal("x-divider")} />
        <Hidden data-testid="e-hidden" className={signal("x-hidden")}>a</Hidden>
        <Inline data-testid="e-inline" className={signal("x-inline")}>a</Inline>
        <Stack data-testid="e-stack" className={signal("x-stack")}>a</Stack>
        <FieldCard data-testid="e-field" label="F" className={signal("x-field")} />
        <Notification data-testid="e-notif" title="T" className={signal("x-notif")} />
        <StatusDot data-testid="e-dot" label="D" className={signal("x-dot")} />
        <Timeline data-testid="e-timeline" items={[{ title: "T" }]} className={signal("x-timeline")} />
        <Collapsible data-testid="e-coll" title="T" className={signal("x-coll")}>a</Collapsible>
        <Rating data-testid="e-rating" value={0} label="N" className={signal("x-rating")} />
        <ButtonGroup data-testid="e-bg" className={signal("x-bg")}>a</ButtonGroup>
        <Autosave data-testid="e-autosave" className={signal("x-autosave")} />
      </>,
    );
    for (const [testId, extra] of [
      ["e-flex", "x-flex"],
      ["e-grid", "x-grid"],
      ["e-row", "x-row"],
      ["e-col", "x-col"],
      ["e-container", "x-container"],
      ["e-divider", "x-divider"],
      ["e-hidden", "x-hidden"],
      ["e-inline", "x-inline"],
      ["e-stack", "x-stack"],
      ["e-field", "x-field"],
      ["e-notif", "x-notif"],
      ["e-dot", "x-dot"],
      ["e-timeline", "x-timeline"],
      ["e-coll", "x-coll"],
      ["e-rating", "x-rating"],
      ["e-bg", "x-bg"],
      ["e-autosave", "x-autosave"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
  });

  it("Accordion accepts a signal for openIds", () => {
    render(
      <Accordion
        items={[
          { title: "A", content: "content-a" },
          { title: "B", content: "content-b" },
        ]}
        openIds={signal(["accordion-0"])}
      />,
    );
    expect(screen.getByText("content-a")).toBeTruthy();
    expect(screen.queryByText("content-b")).toBeNull();
  });

  it("Collapsible accepts a signal for open", () => {
    const { container } = render(
      <Collapsible title="T" open={signal(true)}>
        body
      </Collapsible>,
    );
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector(".st-collapsible__region")?.textContent).toBe("body");
  });

  it("Rating accepts a signal for value", () => {
    render(<Rating value={signal(3)} label="Note" onChange={() => {}} />);
    const stars = screen.getAllByRole("radio");
    expect(stars[2].getAttribute("aria-checked")).toBe("true");
    expect(stars[0].getAttribute("aria-checked")).toBe("false");
  });

  it("Tile accepts a signal for selected", () => {
    const { container } = render(<Tile variant="selectable" selected={signal(true)} title="T" />);
    expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(true);
    expect(container.querySelector(".st-tile")?.className).toContain("st-tile--selected");
  });

  it("ProgressBar accepts a signal for value", () => {
    render(<ProgressBar value={signal(50)} label="L" />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("50");
  });

  it("Autosave accepts signals for status and lastSaved", () => {
    const { container } = render(
      <Autosave status={signal("error")} lastSaved={signal("2026-01-01T00:00:00Z")} onRetry={() => {}} />,
    );
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeTruthy();
  });

  it("InlineLoading accepts a signal for status", () => {
    const { container } = render(<InlineLoading status={signal("success")} />);
    expect(container.firstChild instanceof HTMLElement).toBe(true);
    expect((container.firstChild as HTMLElement).className).toContain("st-inlineLoading--success");
  });

  it("PanelStack accepts signals for expanded and primary", () => {
    render(
      <PanelStack expanded={signal("a")} primary={signal("a")}>
        <PanelSection id="a" label="A">body-a</PanelSection>
        <PanelSection id="b" label="B">body-b</PanelSection>
      </PanelStack>,
    );
    expect(screen.getByRole("button", { name: "B" }).getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByText("body-a")).toBeTruthy();
    expect(screen.getByText("body-b")).toBeTruthy();
  });

  it("mergeStyle keeps the base for nullish, merges objects, concatenates strings and unwraps signals", () => {
    expect(mergeStyle({ display: "flex" } as never, undefined)).toEqual({ display: "flex" });
    expect(mergeStyle({ display: "flex" } as never, { color: "red" })).toEqual({
      display: "flex",
      color: "red",
    });
    const concatenated = mergeStyle({ display: "flex" } as never, "color: red") as string;
    expect(typeof concatenated).toBe("string");
    expect(concatenated).toContain("display:flex");
    expect(concatenated).toContain("color: red");
    expect(mergeStyle({ display: "flex" } as never, signal({ color: "red" }))).toEqual({
      display: "flex",
      color: "red",
    });
    const fromSignalString = mergeStyle({ display: "flex" } as never, signal("color: red")) as string;
    expect(typeof fromSignalString).toBe("string");
    expect(fromSignalString).toContain("display:flex");
    expect(fromSignalString).toContain("color: red");
  });

  it("layout modules keep computed styles with a string consumer style", () => {
    const flex = render(<Flex style="color: red">x</Flex>);
    expect((flex.container.firstChild as HTMLElement).style.display).toBe("flex");
    expect((flex.container.firstChild as HTMLElement).style.color).toBe("red");
    flex.unmount();
    const grid = render(<Grid style="color: red">x</Grid>);
    expect((grid.container.firstChild as HTMLElement).style.display).toBe("grid");
    expect((grid.container.firstChild as HTMLElement).style.color).toBe("red");
    grid.unmount();
    const row = render(<Row style="color: red">x</Row>);
    expect((row.container.firstChild as HTMLElement).style.color).toBe("red");
    expect((row.container.firstChild as HTMLElement).style.gap).toBe("var(--st-spacing-4, 1rem)");
    row.unmount();
    const col = render(<Col style="max-width: 20rem">x</Col>);
    expect((col.container.firstChild as HTMLElement).style.maxWidth).toBe("20rem");
    col.unmount();
    const divider = render(<Divider style="color: red" />);
    expect((divider.container.firstChild as HTMLElement).style.color).toBe("red");
    divider.unmount();
    const group = render(<ButtonGroup style="color: red">x</ButtonGroup>);
    expect((group.container.firstChild as HTMLElement).style.color).toBe("red");
    group.unmount();
    const ratio = render(<AspectRatio style="color: red">x</AspectRatio>);
    expect((ratio.container.firstChild as HTMLElement).style.color).toBe("red");
    expect((ratio.container.firstChild as HTMLElement).style.aspectRatio).toBe("16 / 9");
    ratio.unmount();
  });

  it("Flex keeps computed styles with object and signal styles", () => {
    const fromObject = render(<Flex style={{ color: "red" }}>x</Flex>);
    expect((fromObject.container.firstChild as HTMLElement).style.display).toBe("flex");
    expect((fromObject.container.firstChild as HTMLElement).style.color).toBe("red");
    fromObject.unmount();
    const fromSignalObject = render(<Flex style={signal({ color: "red" })}>x</Flex>);
    expect((fromSignalObject.container.firstChild as HTMLElement).style.display).toBe("flex");
    expect((fromSignalObject.container.firstChild as HTMLElement).style.color).toBe("red");
    fromSignalObject.unmount();
    const fromSignalString = render(<Flex style={signal("color: red")}>x</Flex>);
    expect((fromSignalString.container.firstChild as HTMLElement).style.display).toBe("flex");
    expect((fromSignalString.container.firstChild as HTMLElement).style.color).toBe("red");
    fromSignalString.unmount();
  });

  it("ButtonGroup gap wins over a consumer object gap and coexists with a string style", () => {
    const { container, unmount } = render(<ButtonGroup gap={4} style={{ color: "red", gap: "1px" }}>x</ButtonGroup>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.color).toBe("red");
    expect(el.style.gap).toBe("var(--st-spacing-4, 1rem)");
    unmount();
    const fromString = render(<ButtonGroup gap={4} style="color: red">x</ButtonGroup>);
    const el2 = fromString.container.firstChild as HTMLElement;
    expect(el2.style.color).toBe("red");
    expect(el2.style.gap).toContain("var(--st-spacing-4");
    fromString.unmount();
  });
});
