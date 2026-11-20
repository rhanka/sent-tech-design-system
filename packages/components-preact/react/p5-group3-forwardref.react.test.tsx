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
import * as HandWrittenBackToTop from "../../components-react/src/BackToTop.js";
import * as HandWrittenBadge from "../../components-react/src/Badge.js";
import * as HandWrittenCheckboxGroup from "../../components-react/src/CheckboxGroup.js";
import * as HandWrittenDataImage from "../../components-react/src/DataImage.js";
import * as HandWrittenDisplaySettings from "../../components-react/src/DisplaySettings.js";
import * as HandWrittenEmbed from "../../components-react/src/Embed.js";
import * as HandWrittenMediaContent from "../../components-react/src/MediaContent.js";
import * as HandWrittenRadioGroup from "../../components-react/src/RadioGroup.js";
import * as HandWrittenSelectableRow from "../../components-react/src/SelectableRow.js";
import * as HandWrittenStepper from "../../components-react/src/Stepper.js";
import * as HandWrittenTableOfContents from "../../components-react/src/TableOfContents.js";
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

describe("P5 group 3 forwardRef React-leg parity — Batch 3 (BackToTop, Stepper, TableOfContents, Badge)", () => {
  it("emitted BackToTop ref matches hand-written BackToTop DOM node", () => {
    const emittedObj = createRef<HTMLButtonElement>();
    const emittedCb = makeCallbackRef<HTMLButtonElement>();
    const handObj = createRef<HTMLButtonElement>();

    const r1 = render(
      <>
        <Emitted.BackToTop ref={emittedObj} autoHide={false} label="Haut" />
        <Emitted.BackToTop ref={emittedCb.ref} autoHide label="Masqué" />
      </>,
    );
    const r2 = render(<HandWrittenBackToTop.BackToTop ref={handObj} autoHide={false} label="Haut" />);

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("BUTTON");
    expect(emittedCb.last).toBeInstanceOf(HTMLButtonElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted Stepper ref matches hand-written Stepper DOM node", () => {
    const emittedObj = createRef<HTMLOListElement>();
    const emittedCb = makeCallbackRef<HTMLOListElement>();
    const handObj = createRef<HTMLOListElement>();
    const steps = [{ label: "Step 1" }, { label: "Step 2" }];

    const r1 = render(
      <>
        <Emitted.Stepper ref={emittedObj} steps={steps} current={1} clickable />
        <Emitted.Stepper ref={emittedCb.ref} steps={steps} orientation="vertical" />
      </>,
    );
    const r2 = render(<HandWrittenStepper.Stepper ref={handObj} steps={steps} current={1} clickable />);

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("OL");
    expect(emittedCb.last).toBeInstanceOf(HTMLOListElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted TableOfContents ref matches hand-written TableOfContents DOM node", () => {
    const emittedObj = createRef<HTMLElement>();
    const emittedCb = makeCallbackRef<HTMLElement>();
    const handObj = createRef<HTMLElement>();
    const items = [
      { id: "one", label: "One" },
      { id: "two", label: "Two", level: 2 },
    ];

    const r1 = render(
      <>
        <Emitted.TableOfContents ref={emittedObj} title="Plan" items={items} activeId="one" />
        <Emitted.TableOfContents ref={emittedCb.ref} items={items} />
      </>,
    );
    const r2 = render(
      <HandWrittenTableOfContents.TableOfContents ref={handObj} title="Plan" items={items} activeId="one" />,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("NAV");
    expect(emittedCb.last).toBeInstanceOf(HTMLElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted Badge ref matches hand-written Badge DOM node", () => {
    const emittedObj = createRef<HTMLSpanElement>();
    const emittedCb = makeCallbackRef<HTMLSpanElement>();
    const handObj = createRef<HTMLSpanElement>();

    const r1 = render(
      <>
        <Emitted.Badge ref={emittedObj} tone="success" shape="circle" size="sm">
          3
        </Emitted.Badge>
        <Emitted.Badge ref={emittedCb.ref}>New</Emitted.Badge>
      </>,
    );
    const r2 = render(
      <HandWrittenBadge.Badge ref={handObj} tone="success" shape="circle" size="sm">
        3
      </HandWrittenBadge.Badge>,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("SPAN");
    expect(emittedCb.last).toBeInstanceOf(HTMLSpanElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });
});

describe("P5 group 3 forwardRef React-leg parity — Batch 4 (DataImage, RadioGroup)", () => {
  it("emitted DataImage ref matches hand-written DataImage DOM node", () => {
    const emittedObj = createRef<HTMLImageElement>();
    const emittedCb = makeCallbackRef<HTMLImageElement>();
    const handObj = createRef<HTMLImageElement>();

    const r1 = render(
      <>
        <Emitted.DataImage ref={emittedObj} src="https://example.com/a.png" alt="Chart A" width={120} fit="contain" />
        <Emitted.DataImage ref={emittedCb.ref} src="https://example.com/b.png" alt="Chart B" />
      </>,
    );
    const r2 = render(
      <HandWrittenDataImage.DataImage
        ref={handObj}
        src="https://example.com/a.png"
        alt="Chart A"
        width={120}
        fit="contain"
      />,
    );

    expect(snapshotNode(emittedObj.current)).toEqual(snapshotNode(handObj.current));
    expect(emittedObj.current?.tagName).toBe("IMG");
    expect(emittedCb.last).toBeInstanceOf(HTMLImageElement);

    r1.unmount();
    r2.unmount();
    expect(emittedObj.current).toBeNull();
    expect(emittedCb.last).toBeNull();
  });

  it("emitted RadioGroup ref matches hand-written RadioGroup DOM node", () => {
    const emittedObj = createRef<HTMLFieldSetElement>();
    const emittedCb = makeCallbackRef<HTMLFieldSetElement>();
    const handObj = createRef<HTMLFieldSetElement>();
    const options = [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
    ];

    const r1 = render(
      <>
        <Emitted.RadioGroup ref={emittedObj} legend="Pick" name="pick-e1" options={options} value="a" />
        <Emitted.RadioGroup ref={emittedCb.ref} legend="Other" name="pick-e2" orientation="horizontal" disabled />
      </>,
    );
    const r2 = render(
      <HandWrittenRadioGroup.RadioGroup ref={handObj} legend="Pick" name="pick-h1" options={options} value="a" />,
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
