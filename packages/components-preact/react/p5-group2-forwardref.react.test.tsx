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
import * as HandWrittenCollapsible from "../../components-react/src/Collapsible.js";
import * as HandWrittenContainer from "../../components-react/src/Container.js";
import * as HandWrittenDivider from "../../components-react/src/Divider.js";
import * as HandWrittenFlex from "../../components-react/src/Flex.js";
import * as HandWrittenGrid from "../../components-react/src/Grid.js";
import * as HandWrittenHidden from "../../components-react/src/Hidden.js";
import * as HandWrittenInline from "../../components-react/src/Inline.js";
import * as HandWrittenInput from "../../components-react/src/Input.js";
import * as HandWrittenNotification from "../../components-react/src/Notification.js";
import * as HandWrittenRow from "../../components-react/src/Row.js";
import * as HandWrittenStack from "../../components-react/src/Stack.js";

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

describe("P5 group 2 forwardRef React-leg parity — Batch 2 (Collapsible, Container, Divider, Flex)", () => {
  it("emitted Collapsible ref matches hand-written Collapsible DOM node", () => {
    const emittedObj = createRef<HTMLDivElement>();
    const emittedCb = makeCallbackRef<HTMLDivElement>();
    const handObj = createRef<HTMLDivElement>();

    const r1 = render(
      <>
        <Emitted.Collapsible ref={emittedObj} title="Open me" open>
          Content
        </Emitted.Collapsible>
        <Emitted.Collapsible ref={emittedCb.ref} title="Closed">
          Hidden
        </Emitted.Collapsible>
      </>,
    );
    const r2 = render(
      <HandWrittenCollapsible.Collapsible ref={handObj} title="Open me" open>
        Content
      </HandWrittenCollapsible.Collapsible>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("DIV");
    expect(emittedCb.last).toBeInstanceOf(HTMLDivElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted Container ref matches hand-written Container DOM node (default div and polymorphic as)", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedAs = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();
    const handAs = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.Container ref={emittedObj} size="md">
          A
        </Emitted.Container>
        <Emitted.Container ref={emittedAs.ref} as="main" padding={false}>
          B
        </Emitted.Container>
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenContainer.Container ref={handObj} size="md">
          A
        </HandWrittenContainer.Container>
        <HandWrittenContainer.Container ref={handAs} as="main" padding={false}>
          B
        </HandWrittenContainer.Container>
      </>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(snapshotNode(emittedAs.last)).toEqual(snapshotNode(handAs.current));
    expect(emittedAs.last?.tagName).toBe("MAIN");

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedAs.last).toBeNull();
  });

  it("emitted Divider ref matches hand-written Divider DOM node (unlabeled and labeled)", () => {
    const emittedPlain = createRef<HTMLDivElement>();
    const emittedLabeled = makeCallbackRef<HTMLDivElement>();
    const handPlain = createRef<HTMLDivElement>();
    const handLabeled = createRef<HTMLDivElement>();

    const r1 = render(
      <>
        <Emitted.Divider ref={emittedPlain} orientation="vertical" />
        <Emitted.Divider ref={emittedLabeled.ref} label="OU" />
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenDivider.Divider ref={handPlain} orientation="vertical" />
        <HandWrittenDivider.Divider ref={handLabeled} label="OU" />
      </>,
    );

    expect(snapshotNode(emittedPlain.current)).toEqual(snapshotNode(handPlain.current));
    expect(snapshotNode(emittedLabeled.last)).toEqual(snapshotNode(handLabeled.current));
    expect(emittedPlain.current?.getAttribute("role")).toBe("separator");
    expect(emittedLabeled.last?.getAttribute("role")).toBe("separator");

    r1.unmount();
    r2.unmount();
    expect(emittedPlain.current).toBeNull();
    expect(emittedLabeled.last).toBeNull();
  });

  it("emitted Flex ref matches hand-written Flex DOM node (default div and polymorphic as)", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedAs = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();
    const handAs = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.Flex ref={emittedObj} wrap inline>
          A
        </Emitted.Flex>
        <Emitted.Flex ref={emittedAs.ref} as="section" direction="column">
          B
        </Emitted.Flex>
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenFlex.Flex ref={handObj} wrap inline>
          A
        </HandWrittenFlex.Flex>
        <HandWrittenFlex.Flex ref={handAs} as="section" direction="column">
          B
        </HandWrittenFlex.Flex>
      </>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(snapshotNode(emittedAs.last)).toEqual(snapshotNode(handAs.current));
    expect(emittedAs.last?.tagName).toBe("SECTION");

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedAs.last).toBeNull();
  });
});

describe("P5 group 2 forwardRef React-leg parity — Batch 3 (Grid, Hidden, Inline, Notification)", () => {
  it("emitted Grid ref matches hand-written Grid DOM node (default div and polymorphic as)", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedAs = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();
    const handAs = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.Grid ref={emittedObj} columns={3}>
          <span>A</span>
        </Emitted.Grid>
        <Emitted.Grid ref={emittedAs.ref} as="ul" minItemWidth="10rem">
          <li>B</li>
        </Emitted.Grid>
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenGrid.Grid ref={handObj} columns={3}>
          <span>A</span>
        </HandWrittenGrid.Grid>
        <HandWrittenGrid.Grid ref={handAs} as="ul" minItemWidth="10rem">
          <li>B</li>
        </HandWrittenGrid.Grid>
      </>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(snapshotNode(emittedAs.last)).toEqual(snapshotNode(handAs.current));
    expect(emittedAs.last?.tagName).toBe("UL");

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedAs.last).toBeNull();
  });

  it("emitted Hidden ref matches hand-written Hidden DOM node (default div and polymorphic as)", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedAs = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();
    const handAs = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.Hidden ref={emittedObj} below="md">
          A
        </Emitted.Hidden>
        <Emitted.Hidden ref={emittedAs.ref} as="span" above="lg">
          B
        </Emitted.Hidden>
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenHidden.Hidden ref={handObj} below="md">
          A
        </HandWrittenHidden.Hidden>
        <HandWrittenHidden.Hidden ref={handAs} as="span" above="lg">
          B
        </HandWrittenHidden.Hidden>
      </>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(snapshotNode(emittedAs.last)).toEqual(snapshotNode(handAs.current));
    expect(emittedAs.last?.tagName).toBe("SPAN");

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedAs.last).toBeNull();
  });

  it("emitted Inline ref matches hand-written Inline DOM node through nested Flex", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedAs = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();
    const handAs = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.Inline ref={emittedObj} gap={2}>
          <span>A</span>
        </Emitted.Inline>
        <Emitted.Inline ref={emittedAs.ref} as="nav" wrap={false}>
          <span>B</span>
        </Emitted.Inline>
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenInline.Inline ref={handObj} gap={2}>
          <span>A</span>
        </HandWrittenInline.Inline>
        <HandWrittenInline.Inline ref={handAs} as="nav" wrap={false}>
          <span>B</span>
        </HandWrittenInline.Inline>
      </>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(snapshotNode(emittedAs.last)).toEqual(snapshotNode(handAs.current));
    expect(emittedAs.last?.tagName).toBe("NAV");

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedAs.last).toBeNull();
  });

  it("emitted Notification ref matches hand-written Notification DOM node", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedCb = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.Notification ref={emittedObj} tone="error" title="Err" dismissible onDismiss={() => {}} />
        <Emitted.Notification ref={emittedCb.ref} tone="info" title="Info" />
      </>,
    );
    const r2 = render(
      <HandWrittenNotification.Notification ref={handObj} tone="error" title="Err" dismissible onDismiss={() => {}} />,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("SECTION");
    expect(emittedObj.current?.getAttribute("role")).toBe("alert");
    expect(emittedCb.last?.getAttribute("role")).toBe("status");

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });
});

describe("P5 group 2 forwardRef React-leg parity — Batch 4 (Row, Stack, Input)", () => {
  it("emitted Row ref matches hand-written Row DOM node (default div and polymorphic as)", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedAs = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();
    const handAs = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.Row ref={emittedObj} gutter={4}>
          <span>A</span>
        </Emitted.Row>
        <Emitted.Row ref={emittedAs.ref} as="section" wrap={false}>
          <span>B</span>
        </Emitted.Row>
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenRow.Row ref={handObj} gutter={4}>
          <span>A</span>
        </HandWrittenRow.Row>
        <HandWrittenRow.Row ref={handAs} as="section" wrap={false}>
          <span>B</span>
        </HandWrittenRow.Row>
      </>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(snapshotNode(emittedAs.last)).toEqual(snapshotNode(handAs.current));
    expect(emittedAs.last?.tagName).toBe("SECTION");

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedAs.last).toBeNull();
  });

  it("emitted Stack ref matches hand-written Stack DOM node through nested Flex", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedAs = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();
    const handAs = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.Stack ref={emittedObj} gap={3}>
          <span>A</span>
        </Emitted.Stack>
        <Emitted.Stack ref={emittedAs.ref} as="aside">
          <span>B</span>
        </Emitted.Stack>
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenStack.Stack ref={handObj} gap={3}>
          <span>A</span>
        </HandWrittenStack.Stack>
        <HandWrittenStack.Stack ref={handAs} as="aside">
          <span>B</span>
        </HandWrittenStack.Stack>
      </>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(snapshotNode(emittedAs.last)).toEqual(snapshotNode(handAs.current));
    expect(emittedAs.last?.tagName).toBe("ASIDE");

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedAs.last).toBeNull();
  });

  it("emitted Input ref reaches inner <input> matching hand-written Input DOM node", () => {
    const emittedObj = createRef<HTMLInputElement>();
    const emittedCb = makeCallbackRef<HTMLInputElement>();
    const handObj = createRef<HTMLInputElement>();

    const r1 = render(
      <>
        <Emitted.Input ref={emittedObj} label="Email" size="lg" invalid />
        <Emitted.Input ref={emittedCb.ref} label="Other" />
      </>,
    );
    const r2 = render(<HandWrittenInput.Input ref={handObj} label="Email" size="lg" invalid />);

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("INPUT");
    expect(emittedObj.current?.getAttribute("aria-invalid")).toBe("true");
    expect(emittedCb.last).toBeInstanceOf(HTMLInputElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });
});
