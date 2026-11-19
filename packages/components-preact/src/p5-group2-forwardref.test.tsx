import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createRef } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { ButtonGroup } from "./ButtonGroup.js";
import { Card } from "./Card.js";
import { Col, offsetMargin, spanBasis } from "./Col.js";
import { Collapsible } from "./Collapsible.js";
import { Container } from "./Container.js";
import { Divider } from "./Divider.js";
import { Flex, alignValue, justifyValue, spacingToken } from "./Flex.js";

afterEach(cleanup);

describe("P5 group 2 forwardRef modules — Batch 1 (Button, ButtonGroup, Card, Col)", () => {
  it("Button forwards object and callback refs to <button>, mutates className/disabled signals, and preserves consumer handlers", async () => {
    const cls = signal("b-before");
    const disabled = signal(false);
    const onClick = vi.fn();
    const objRef = createRef<HTMLButtonElement>();
    const cbRef = vi.fn();

    const { rerender, unmount } = render(
      <Button ref={objRef} className={cls} disabled={disabled} onClick={onClick}>
        Submit
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Submit" }) as HTMLButtonElement;
    expect(objRef.current).toBe(btn);
    expect(objRef.current?.tagName).toBe("BUTTON");
    expect(btn.className).toBe("st-button st-button--primary st-button--md b-before");
    expect(btn.disabled).toBe(false);

    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "b-after";
    disabled.value = true;
    await waitFor(() => expect(btn.className).toBe("st-button st-button--primary st-button--md b-after"));
    await waitFor(() => expect(btn.disabled).toBe(true));

    disabled.value = false;
    await waitFor(() => expect(btn.disabled).toBe(false));

    rerender(
      <Button ref={cbRef} className={cls} disabled={disabled} onClick={onClick}>
        Submit
      </Button>,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(btn);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("ButtonGroup forwards refs to <div role='group'>, mutates className/attached/style signals, and preserves consumer handlers", async () => {
    const cls = signal("bg-before");
    const attached = signal(false);
    const style = signal({ color: "red" });
    const onClick = vi.fn();
    const objRef = createRef<HTMLDivElement>();
    const cbRef = vi.fn();

    const { rerender, unmount } = render(
      <ButtonGroup
        ref={objRef}
        label="Actions"
        gap={4}
        attached={attached}
        className={cls}
        style={style}
        onClick={onClick}
      >
        <Button>One</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Actions" }) as HTMLDivElement;
    expect(objRef.current).toBe(group);
    expect(objRef.current?.tagName).toBe("DIV");
    expect(group.className).toBe("st-buttonGroup st-buttonGroup--horizontal bg-before");
    expect(group.style.gap).toBe("var(--st-spacing-4, 1rem)");
    expect(group.style.color).toBe("red");

    fireEvent.click(group);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "bg-after";
    attached.value = true;
    style.value = { color: "blue" };
    await waitFor(() =>
      expect(group.className).toBe("st-buttonGroup st-buttonGroup--horizontal st-buttonGroup--attached bg-after"),
    );
    expect(group.style.gap).toBe("");
    expect(group.style.color).toBe("blue");

    attached.value = false;
    await waitFor(() => expect(group.className).not.toContain("st-buttonGroup--attached"));
    expect(group.style.gap).toBe("var(--st-spacing-4, 1rem)");

    rerender(
      <ButtonGroup
        ref={cbRef}
        label="Actions"
        gap={4}
        attached={attached}
        className={cls}
        style={style}
        onClick={onClick}
      >
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(group);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("Card forwards refs to <section>, mutates className/interactive signals, and preserves consumer handlers", async () => {
    const cls = signal("card-before");
    const interactive = signal(false);
    const onClick = vi.fn();
    const objRef = createRef<HTMLElement>();
    const cbRef = vi.fn();

    const { rerender, unmount } = render(
      <Card ref={objRef} data-testid="card" interactive={interactive} className={cls} onClick={onClick}>
        Body
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(objRef.current).toBe(card);
    expect(objRef.current?.tagName).toBe("SECTION");
    expect(card.className).toBe("st-card card-before");

    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "card-after";
    interactive.value = true;
    await waitFor(() => expect(card.className).toBe("st-card st-card--interactive card-after"));

    interactive.value = false;
    await waitFor(() => expect(card.className).toBe("st-card card-after"));

    rerender(
      <Card ref={cbRef} data-testid="card" interactive={interactive} className={cls} onClick={onClick}>
        Body
      </Card>,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(card);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("Col forwards refs across default and polymorphic `as`, mutates className/style signals, and keeps helper parity", async () => {
    const cls = signal("col-before");
    const style = signal({ color: "red" });
    const onClick = vi.fn();
    const divRef = createRef<HTMLElement>();
    const articleRef = vi.fn();

    const { rerender, unmount } = render(
      <Col ref={divRef} data-testid="col" span={6} offset={2} className={cls} style={style} onClick={onClick}>
        Cell
      </Col>,
    );
    const col = screen.getByTestId("col");
    expect(divRef.current).toBe(col);
    expect(divRef.current?.tagName).toBe("DIV");
    expect(col.className).toBe("st-col col-before");
    expect(col.style.color).toBe("red");
    expect(col.style.flexBasis).toBe(spanBasis(6));
    expect(col.style.marginInlineStart).toBe(offsetMargin(2));

    fireEvent.click(col);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "col-after";
    style.value = { color: "green" };
    await waitFor(() => expect(col.className).toBe("st-col col-after"));
    await waitFor(() => expect(col.style.color).toBe("green"));
    expect(col.style.flexBasis).toBe(spanBasis(6));

    rerender(
      <Col ref={articleRef} data-testid="col" as="article" span={4} className={cls} style={style} onClick={onClick}>
        Cell
      </Col>,
    );
    const article = screen.getByTestId("col");
    expect(divRef.current).toBeNull();
    expect(article.tagName).toBe("ARTICLE");
    expect(articleRef).toHaveBeenLastCalledWith(article);

    unmount();
    expect(articleRef).toHaveBeenLastCalledWith(null);
  });
});

describe("P5 group 2 forwardRef modules — Batch 2 (Collapsible, Container, Divider, Flex)", () => {
  it("Collapsible forwards refs to outer <div>, mutates open/disabled/className signals, normalises SVG stroke-width, and preserves consumer handlers", async () => {
    const cls = signal("coll-before");
    const open = signal(false);
    const disabled = signal(false);
    const onToggle = vi.fn();
    const onClick = vi.fn();
    const objRef = createRef<HTMLDivElement>();
    const cbRef = vi.fn();

    const { container, rerender, unmount } = render(
      <Collapsible
        ref={objRef}
        data-testid="coll"
        title="Details"
        open={open}
        disabled={disabled}
        className={cls}
        onToggle={onToggle}
        onClick={onClick}
      >
        <p>Panel content</p>
      </Collapsible>,
    );
    const root = screen.getByTestId("coll") as HTMLDivElement;
    const trigger = screen.getByRole("button", { name: "Details" }) as HTMLButtonElement;
    expect(objRef.current).toBe(root);
    expect(objRef.current?.tagName).toBe("DIV");
    expect(root.className).toBe("st-collapsible coll-before");
    expect(trigger.disabled).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".st-collapsible__region")).toBeNull();

    // SVG normaliser from runtime.ts turns strokeWidth into stroke-width on the ChevronDown icon.
    const svg = container.querySelector(".st-collapsible__icon svg");
    expect(svg?.getAttribute("stroke-width")).toBe("2.25");
    expect(svg?.getAttribute("strokeWidth")).toBeNull();

    // Clicking trigger runs internal toggle (onToggle) AND bubbles to consumer onClick on root.
    fireEvent.click(trigger);
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(onClick).toHaveBeenCalledTimes(1);

    // Mutate open, disabled, className signals post-mount.
    cls.value = "coll-after";
    open.value = true;
    disabled.value = true;
    await waitFor(() => expect(root.className).toBe("st-collapsible st-collapsible--open coll-after"));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector(".st-collapsible__region")?.textContent).toBe("Panel content");
    expect(trigger.disabled).toBe(true);

    // Disabled trigger must not invoke onToggle.
    onToggle.mockClear();
    fireEvent.click(trigger);
    expect(onToggle).not.toHaveBeenCalled();

    // Re-enabling and closing via signals updates DOM back.
    disabled.value = false;
    open.value = false;
    await waitFor(() => expect(trigger.disabled).toBe(false));
    await waitFor(() => expect(container.querySelector(".st-collapsible__region")).toBeNull());
    expect(root.className).toBe("st-collapsible coll-after");

    rerender(
      <Collapsible
        ref={cbRef}
        data-testid="coll"
        title="Details"
        open={open}
        disabled={disabled}
        className={cls}
        onToggle={onToggle}
        onClick={onClick}
      >
        <p>Panel content</p>
      </Collapsible>,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(root);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("Container forwards refs across default and polymorphic `as`, mutates className/padding signals, and preserves consumer handlers", async () => {
    const cls = signal("cont-before");
    const padding = signal(true);
    const onClick = vi.fn();
    const objRef = createRef<HTMLElement>();
    const mainRef = vi.fn();

    const { rerender, unmount } = render(
      <Container ref={objRef} data-testid="cont" size="md" padding={padding} className={cls} onClick={onClick}>
        Inner
      </Container>,
    );
    const el = screen.getByTestId("cont");
    expect(objRef.current).toBe(el);
    expect(objRef.current?.tagName).toBe("DIV");
    expect(el.className).toBe("st-container st-container--md st-container--padded cont-before");

    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "cont-after";
    padding.value = false;
    await waitFor(() => expect(el.className).toBe("st-container st-container--md cont-after"));

    padding.value = true;
    await waitFor(() => expect(el.className).toBe("st-container st-container--md st-container--padded cont-after"));

    rerender(
      <Container ref={mainRef} data-testid="cont" as="main" size="md" padding={padding} className={cls} onClick={onClick}>
        Inner
      </Container>,
    );
    const main = screen.getByTestId("cont");
    expect(objRef.current).toBeNull();
    expect(main.tagName).toBe("MAIN");
    expect(mainRef).toHaveBeenLastCalledWith(main);

    unmount();
    expect(mainRef).toHaveBeenLastCalledWith(null);
  });

  it("Divider forwards refs in both unlabeled and labeled branches, mutates className/style signals, and preserves consumer handlers", async () => {
    const cls = signal("div-before");
    const style = signal({ opacity: "0.5" });
    const onClick = vi.fn();
    const unlabeledRef = createRef<HTMLDivElement>();
    const labeledRef = vi.fn();

    const { rerender, unmount } = render(
      <Divider ref={unlabeledRef} spacing={4} className={cls} style={style} onClick={onClick} />,
    );
    const sep = screen.getByRole("separator") as HTMLDivElement;
    expect(unlabeledRef.current).toBe(sep);
    expect(unlabeledRef.current?.tagName).toBe("DIV");
    expect(sep.className).toBe("st-divider st-divider--horizontal st-divider--solid div-before");
    expect(sep.style.opacity).toBe("0.5");

    fireEvent.click(sep);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "div-after";
    style.value = { opacity: "0.9" };
    await waitFor(() => expect(sep.className).toBe("st-divider st-divider--horizontal st-divider--solid div-after"));
    await waitFor(() => expect(sep.style.opacity).toBe("0.9"));

    // Switch to labeled branch (second JSX return path) and mutate signals there too.
    rerender(<Divider ref={labeledRef} label="OU" spacing={2} className={cls} style={style} onClick={onClick} />);
    const labeledSep = screen.getByRole("separator") as HTMLDivElement;
    expect(labeledRef).toHaveBeenLastCalledWith(labeledSep);
    expect(labeledSep.className).toBe(
      "st-divider st-divider--horizontal st-divider--solid st-divider--labeled div-after",
    );
    expect(labeledSep.querySelector(".st-divider__label")?.textContent).toBe("OU");

    cls.value = "div-labeled";
    await waitFor(() =>
      expect(labeledSep.className).toBe(
        "st-divider st-divider--horizontal st-divider--solid st-divider--labeled div-labeled",
      ),
    );

    unmount();
    expect(labeledRef).toHaveBeenLastCalledWith(null);
  });

  it("Flex forwards refs across default and polymorphic `as`, mutates wrap/inline/className/style signals, and keeps helper parity", async () => {
    const cls = signal("flx-before");
    const wrap = signal(false);
    const inline = signal(false);
    const style = signal({ color: "red" });
    const onClick = vi.fn();
    const objRef = createRef<HTMLElement>();
    const sectionRef = vi.fn();

    const { rerender, unmount } = render(
      <Flex
        ref={objRef}
        data-testid="flex"
        gap={3}
        align="center"
        justify="between"
        wrap={wrap}
        inline={inline}
        className={cls}
        style={style}
        onClick={onClick}
      >
        Item
      </Flex>,
    );
    const el = screen.getByTestId("flex");
    expect(objRef.current).toBe(el);
    expect(objRef.current?.tagName).toBe("DIV");
    expect(el.className).toBe("st-flex flx-before");
    expect(el.style.display).toBe("flex");
    expect(el.style.flexWrap).toBe("nowrap");
    expect(el.style.alignItems).toBe(alignValue("center"));
    expect(el.style.justifyContent).toBe(justifyValue("between"));
    expect(el.style.gap).toBe(spacingToken(3));
    expect(el.style.color).toBe("red");

    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "flx-after";
    wrap.value = true;
    inline.value = true;
    style.value = { color: "navy" };
    await waitFor(() => expect(el.className).toBe("st-flex flx-after"));
    expect(el.style.display).toBe("inline-flex");
    expect(el.style.flexWrap).toBe("wrap");
    expect(el.style.color).toBe("navy");

    wrap.value = false;
    inline.value = false;
    await waitFor(() => expect(el.style.display).toBe("flex"));
    expect(el.style.flexWrap).toBe("nowrap");

    rerender(
      <Flex
        ref={sectionRef}
        data-testid="flex"
        as="section"
        wrap={wrap}
        inline={inline}
        className={cls}
        style={style}
        onClick={onClick}
      >
        Item
      </Flex>,
    );
    const section = screen.getByTestId("flex");
    expect(objRef.current).toBeNull();
    expect(section.tagName).toBe("SECTION");
    expect(sectionRef).toHaveBeenLastCalledWith(section);

    unmount();
    expect(sectionRef).toHaveBeenLastCalledWith(null);
  });
});
