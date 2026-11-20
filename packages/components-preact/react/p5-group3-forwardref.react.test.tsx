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
import * as HandWrittenCheckboxGroup from "../../components-react/src/CheckboxGroup.js";
import * as HandWrittenDisplaySettings from "../../components-react/src/DisplaySettings.js";
import * as HandWrittenEmbed from "../../components-react/src/Embed.js";
import * as HandWrittenMediaContent from "../../components-react/src/MediaContent.js";
import * as HandWrittenSelectableRow from "../../components-react/src/SelectableRow.js";
import * as HandWrittenTranscription from "../../components-react/src/Transcription.js";

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

describe("P5 group 3 forwardRef React-leg parity — Batch 2 (Embed, MediaContent, Transcription, CheckboxGroup)", () => {
  it("emitted Embed ref matches hand-written Embed DOM node", () => {
    const emittedObj = createRef<HTMLDivElement>();
    const emittedCb = makeCallbackRef<HTMLDivElement>();
    const handObj = createRef<HTMLDivElement>();

    const r1 = render(
      <>
        <Emitted.Embed ref={emittedObj} src="https://example.com/a" title="Frame A" />
        <Emitted.Embed ref={emittedCb.ref} src="https://example.com/b" title="Frame B" />
      </>,
    );
    const r2 = render(<HandWrittenEmbed.Embed ref={handObj} src="https://example.com/a" title="Frame A" />);

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("DIV");
    expect(emittedCb.last).toBeInstanceOf(HTMLDivElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted MediaContent ref matches hand-written MediaContent DOM node (image and video)", () => {
    const emittedImg = createRef<HTMLElement>();
    const emittedVid = makeCallbackRef<HTMLElement>();
    const handImg = createRef<HTMLElement>();
    const handVid = createRef<HTMLElement>();

    const r1 = render(
      <>
        <Emitted.MediaContent ref={emittedImg} media="https://example.com/a.png" mediaAlt="A" title="Photo" />
        <Emitted.MediaContent
          ref={emittedVid.ref}
          media="https://example.com/b.mp4"
          mediaKind="video"
          mediaControls={false}
        />
      </>,
    );
    const r2 = render(
      <>
        <HandWrittenMediaContent.MediaContent
          ref={handImg}
          media="https://example.com/a.png"
          mediaAlt="A"
          title="Photo"
        />
        <HandWrittenMediaContent.MediaContent
          ref={handVid}
          media="https://example.com/b.mp4"
          mediaKind="video"
          mediaControls={false}
        />
      </>,
    );

    expect(snapshotNode(emittedImg.current)).toEqual(snapshotNode(handImg.current));
    expect(snapshotNode(emittedVid.last)).toEqual(snapshotNode(handVid.current));
    expect(emittedImg.current?.tagName).toBe("FIGURE");
    expect(emittedVid.last?.tagName).toBe("FIGURE");

    r1.unmount();
    r2.unmount();
    expect(emittedImg.current).toBeNull();
    expect(emittedVid.last).toBeNull();
  });

  it("emitted Transcription ref matches hand-written Transcription DOM node", () => {
    const emittedObj = createRef<HTMLDetailsElement>();
    const emittedCb = makeCallbackRef<HTMLDetailsElement>();
    const handObj = createRef<HTMLDetailsElement>();

    const r1 = render(
      <>
        <Emitted.Transcription ref={emittedObj} open text="Bonjour" />
        <Emitted.Transcription ref={emittedCb.ref} segments={[{ speaker: "A", text: "Hi" }]} />
      </>,
    );
    const r2 = render(<HandWrittenTranscription.Transcription ref={handObj} open text="Bonjour" />);

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("DETAILS");
    expect(emittedCb.last).toBeInstanceOf(HTMLDetailsElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted CheckboxGroup ref matches hand-written CheckboxGroup DOM node", () => {
    const emittedObj = createRef<HTMLFieldSetElement>();
    const emittedCb = makeCallbackRef<HTMLFieldSetElement>();
    const handObj = createRef<HTMLFieldSetElement>();
    const options = [
      { label: "One", value: "1" },
      { label: "Two", value: "2" },
    ];

    const r1 = render(
      <>
        <Emitted.CheckboxGroup ref={emittedObj} legend="Group" options={options} value={["1"]} />
        <Emitted.CheckboxGroup ref={emittedCb.ref} legend="Other" orientation="horizontal" disabled />
      </>,
    );
    const r2 = render(
      <HandWrittenCheckboxGroup.CheckboxGroup ref={handObj} legend="Group" options={options} value={["1"]} />,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("FIELDSET");
    expect(emittedCb.last).toBeInstanceOf(HTMLFieldSetElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });
});
