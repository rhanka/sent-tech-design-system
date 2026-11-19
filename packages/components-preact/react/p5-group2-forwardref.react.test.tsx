// React leg only. Verifies that every emitted P5 group-2 forwardRef module
// attaches object and callback refs to the exact same DOM element shape
// (tagName, role, className) as its hand-written components-react twin and
// releases refs cleanly on unmount.
import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import * as Emitted from "../.react-emit/src/index.js";
import * as HandWrittenButton from "../../components-react/src/Button.js";
import * as HandWrittenButtonGroup from "../../components-react/src/ButtonGroup.js";
import * as HandWrittenCard from "../../components-react/src/Card.js";
import * as HandWrittenCol from "../../components-react/src/Col.js";

afterEach(cleanup);

function makeCallbackRef<T>() {
  const seen: Array<T | null> = [];
  const ref = (node: T | null) => {
    seen.push(node);
  };
  return {
    ref,
    seen,
    get last(): T | null {
      return seen.length > 0 ? seen[seen.length - 1] : null;
    },
  };
}

function snapshotNode(node: Element | null) {
  expect(node).toBeInstanceOf(Element);
  return {
    tagName: node!.tagName,
    role: node!.getAttribute("role"),
    className: node!.className,
  };
}

describe("P5 group 2 forwardRef React-leg parity — Batch 1 (Button, ButtonGroup, Card, Col)", () => {
  it("emitted Button ref matches hand-written Button DOM node", () => {
    const emittedObj = createRef<HTMLButtonElement>();
    const emittedCb = makeCallbackRef<HTMLButtonElement>();
    const handObj = createRef<HTMLButtonElement>();

    const r1 = render(
      <>
        <Emitted.Button ref={emittedObj}>Save</Emitted.Button>
        <Emitted.Button ref={emittedCb.ref}>Cb</Emitted.Button>
      </>,
    );
    const r2 = render(<HandWrittenButton.Button ref={handObj}>Save</HandWrittenButton.Button>);

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("BUTTON");
    expect(emittedCb.last).toBeInstanceOf(HTMLButtonElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted ButtonGroup ref matches hand-written ButtonGroup DOM node", () => {
    const emittedObj = createRef<HTMLDivElement>();
    const emittedCb = makeCallbackRef<HTMLDivElement>();
    const handObj = createRef<HTMLDivElement>();

    const r1 = render(
      <>
        <Emitted.ButtonGroup ref={emittedObj} label="G" attached>
          <span>a</span>
        </Emitted.ButtonGroup>
        <Emitted.ButtonGroup ref={emittedCb.ref} label="G2">
          <span>b</span>
        </Emitted.ButtonGroup>
      </>,
    );
    const r2 = render(
      <HandWrittenButtonGroup.ButtonGroup ref={handObj} label="G" attached>
        <span>a</span>
      </HandWrittenButtonGroup.ButtonGroup>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("DIV");
    expect(emittedCb.last).toBeInstanceOf(HTMLDivElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted Card ref matches hand-written Card DOM node", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedCb = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.Card ref={emittedObj} interactive>
          Body
        </Emitted.Card>
        <Emitted.Card ref={emittedCb.ref}>Body 2</Emitted.Card>
      </>,
    );
    const r2 = render(
      <HandWrittenCard.Card ref={handObj} interactive>
        Body
      </HandWrittenCard.Card>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("SECTION");
    expect(emittedCb.last).toBeInstanceOf(HTMLElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted Col ref matches hand-written Col DOM node (default div and polymorphic as)", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedAs = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();
    const handAs = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.Col ref={emittedObj} span={6}>
          A
        </Emitted.Col>
        <Emitted.Col ref={emittedAs.ref} as="article" span={4}>
          B
        </Emitted.Col>
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenCol.Col ref={handObj} span={6}>
          A
        </HandWrittenCol.Col>
        <HandWrittenCol.Col ref={handAs} as="article" span={4}>
          B
        </HandWrittenCol.Col>
      </>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(snapshotNode(emittedAs.last)).toEqual(snapshotNode(handAs.current));
    expect(emittedAs.last?.tagName).toBe("ARTICLE");

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedAs.last).toBeNull();
  });
});
