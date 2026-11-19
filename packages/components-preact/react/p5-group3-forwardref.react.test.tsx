// React leg only. Verifies that every emitted P5 group-3 forwardRef module
// attaches object and callback refs to the exact same DOM element shape
// (tagName, role, className) as its hand-written components-react twin and
// releases refs cleanly on unmount.
import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import * as Emitted from "../.react-emit/src/index.js";
import * as HandWrittenAvatar from "../../components-react/src/Avatar.js";
import * as HandWrittenAvatarGroup from "../../components-react/src/AvatarGroup.js";
import * as HandWrittenDisplaySettings from "../../components-react/src/DisplaySettings.js";
import * as HandWrittenSelectableRow from "../../components-react/src/SelectableRow.js";

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

describe("P5 group 3 forwardRef React-leg parity — Batch 1 (SelectableRow, Avatar, AvatarGroup, DisplaySettings)", () => {
  it("emitted SelectableRow ref matches hand-written SelectableRow DOM node (div and anchor)", () => {
    const emittedDiv = createRef<HTMLElement>();
    const emittedLink = makeCallbackRef<HTMLElement>();
    const handDiv = createRef<HTMLElement>();
    const handLink = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.SelectableRow ref={emittedDiv} value="a" selected accentBar>
          Alpha
        </Emitted.SelectableRow>
        <Emitted.SelectableRow ref={emittedLink.ref} href="/docs">
          Docs
        </Emitted.SelectableRow>
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenSelectableRow.SelectableRow ref={handDiv} value="a" selected accentBar>
          Alpha
        </HandWrittenSelectableRow.SelectableRow>
        <HandWrittenSelectableRow.SelectableRow ref={handLink} href="/docs">
          Docs
        </HandWrittenSelectableRow.SelectableRow>
      </>,
    );

    expect(snapshotNode(emittedDiv.current)).toEqual(snapshotNode(handDiv.current));
    expect(snapshotNode(emittedLink.last)).toEqual(snapshotNode(handLink.current));
    expect(emittedDiv.current?.tagName).toBe("DIV");
    expect(emittedLink.last?.tagName).toBe("A");

    r1.unmount();
    r2.unmount();
    expect(emittedDiv.current).toBeNull();
    expect(emittedLink.last).toBeNull();
  });

  it("emitted Avatar ref matches hand-written Avatar DOM node (initials and image)", () => {
    const emittedObj = createRef<HTMLSpanElement>();
    const emittedImg = makeCallbackRef<HTMLSpanElement>();
    const handObj = createRef<HTMLSpanElement>();
    const handImg = createRef<HTMLSpanElement>();

    const r1 = render(
      <>
        <Emitted.Avatar ref={emittedObj} name="Ada Lovelace" size="lg" />
        <Emitted.Avatar ref={emittedImg.ref} name="Ada Lovelace" src="https://example.com/a.png" />
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenAvatar.Avatar ref={handObj} name="Ada Lovelace" size="lg" />
        <HandWrittenAvatar.Avatar ref={handImg} name="Ada Lovelace" src="https://example.com/a.png" />
      </>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(snapshotNode(emittedImg.last)).toEqual(snapshotNode(handImg.current));
    expect(emittedObj.current?.tagName).toBe("SPAN");
    expect(emittedImg.last).toBeInstanceOf(HTMLSpanElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedImg.last).toBeNull();
  });

  it("emitted AvatarGroup ref matches hand-written AvatarGroup DOM node", () => {
    const emittedObj = createRef<HTMLDivElement>();
    const emittedCb = makeCallbackRef<HTMLDivElement>();
    const handObj = createRef<HTMLDivElement>();

    const r1 = render(
      <>
        <Emitted.AvatarGroup ref={emittedObj} max={2} total={5} size="sm">
          <span>A</span>
        </Emitted.AvatarGroup>
        <Emitted.AvatarGroup ref={emittedCb.ref}>
          <span>B</span>
        </Emitted.AvatarGroup>
      </>,
    );
    const r2 = render(
      <HandWrittenAvatarGroup.AvatarGroup ref={handObj} max={2} total={5} size="sm">
        <span>A</span>
      </HandWrittenAvatarGroup.AvatarGroup>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("DIV");
    expect(emittedCb.last).toBeInstanceOf(HTMLDivElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted DisplaySettings ref matches hand-written DisplaySettings DOM node", () => {
    const emittedObj = createRef<HTMLDivElement>();
    const emittedCb = makeCallbackRef<HTMLDivElement>();
    const handObj = createRef<HTMLDivElement>();

    const r1 = render(
      <>
        <Emitted.DisplaySettings ref={emittedObj} values={{ fontScale: "large" }} />
        <Emitted.DisplaySettings ref={emittedCb.ref} showContrast={false} />
      </>,
    );
    const r2 = render(<HandWrittenDisplaySettings.DisplaySettings ref={handObj} values={{ fontScale: "large" }} />);

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("DIV");
    expect(emittedCb.last).toBeInstanceOf(HTMLDivElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });
});
