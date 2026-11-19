import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createRef } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { ButtonGroup } from "./ButtonGroup.js";
import { Card } from "./Card.js";
import { Col, offsetMargin, spanBasis } from "./Col.js";

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
