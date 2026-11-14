// Spike S1 probes. They record, as executable facts, where Preact core
// (no `preact/compat`) behaves differently from React on patterns that the
// 226 non-test modules of `components-react` use, so lot P0 decides each
// mechanism on evidence. The reach of each pattern is counted by
// `scripts/port-metrics.mjs` (`measurements/port-metrics.txt`). Nothing here
// is part of the package: the candidate hook below is test-local.
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { options } from "preact";
import type { VNode } from "preact";
import { useEffect, useLayoutEffect } from "preact/hooks";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";

afterEach(cleanup);

const chart = () => (
  <svg viewBox="0 0 10 10">
    <defs>
      <clipPath id="c" clipPathUnits="userSpaceOnUse" />
    </defs>
    <line strokeWidth={2} strokeDasharray="4 2" strokeLinecap="round" />
    <text textAnchor="middle" dominantBaseline="central" fontSize={12} textLength={5}>
      t
    </text>
    <g clipPath="url(#c)" />
  </svg>
);

describe("Preact core vs React: runtime gaps measured by S1", () => {
  it("leaves camelCase SVG presentation attributes of an element untranslated", () => {
    const { container } = render(chart());
    expect(container.querySelector("line")?.getAttributeNames()).toEqual(["strokeWidth", "strokeDasharray", "strokeLinecap"]);
    expect(container.querySelector("text")?.getAttribute("text-anchor")).toBeNull();
    expect(container.querySelector("g")?.getAttribute("clip-path")).toBeNull();
  });

  it("a core-only vnode hook translates them, keeping the genuine camelCase attributes (candidate for P0)", () => {
    // Same attribute families as `preact/compat` translates.
    const presentation =
      /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
    const previous = options.vnode;
    options.vnode = (vnode: VNode<Record<string, unknown>>) => {
      if (typeof vnode.type === "string") {
        const props = vnode.props;
        for (const name in props) {
          if (presentation.test(name)) {
            props[name.replace(/[A-Z0-9]/g, "-$&").toLowerCase()] = props[name];
            delete props[name];
          }
        }
      }
      previous?.(vnode);
    };
    try {
      const { container } = render(chart());
      expect(container.querySelector("line")?.getAttributeNames()).toEqual(["stroke-width", "stroke-dasharray", "stroke-linecap"]);
      expect(container.querySelector("text")?.getAttributeNames().sort()).toEqual([
        "dominant-baseline",
        "font-size",
        "text-anchor",
        "textLength",
      ]);
      expect(container.querySelector("g")?.getAttribute("clip-path")).toBe("url(#c)");
      expect(container.querySelector("svg")?.getAttributeNames()).toEqual(["viewBox"]);
      expect(container.querySelector("clipPath")?.getAttributeNames()).toEqual(["id", "clipPathUnits"]);
    } finally {
      options.vnode = previous;
    }
  });

  it("fires `onChange` of a text control on the native change event only, not per keystroke", () => {
    const onChange = vi.fn();
    const { container } = render(<input onChange={onChange} />);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "a" } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "ab" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does not bubble `onFocus` / `onBlur` from a child to a container handler; `onFocusIn` / `onFocusOut` do", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onFocusIn = vi.fn();
    const onFocusOut = vi.fn();
    const { container } = render(
      <div onFocus={onFocus} onBlur={onBlur} onFocusIn={onFocusIn} onFocusOut={onFocusOut}>
        <input />
      </div>,
    );
    const input = container.querySelector("input") as HTMLInputElement;
    // Real focus changes: the DOM dispatches focus + focusin, then blur + focusout.
    input.focus();
    input.blur();
    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
    expect(onFocusIn).toHaveBeenCalledTimes(1);
    expect(onFocusOut).toHaveBeenCalledTimes(1);
  });

  it("drops a consumer `class` when a ported component computes `className` (open row for P0)", () => {
    // Preact consumers write `class`. The ported components keep React's
    // `className`: the consumer `class` travels in the rest props, and the
    // computed `className`, applied after it, replaces it on the element.
    render(
      <>
        <Button class="from-class">A</Button>
        <Button className="from-className">B</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "A" }).className).toBe("st-button st-button--primary st-button--md");
    expect(screen.getByRole("button", { name: "B" }).className).toBe("st-button st-button--primary st-button--md from-className");
  });

  it("has run the layout and the passive effect cleanups when `unmount()` returns", () => {
    // Holds on Preact 10. `npm run probe:preact` runs this file on another
    // major and records what differs (measurements/preact-major-probe.txt).
    const cleaned: string[] = [];
    function Probe() {
      useEffect(() => () => void cleaned.push("effect"), []);
      useLayoutEffect(() => () => void cleaned.push("layout"), []);
      return <p>probe</p>;
    }
    const { unmount } = render(<Probe />);
    unmount();
    expect([...cleaned].sort()).toEqual(["effect", "layout"]);
  });

  it("appends px to unitless numeric styles like React", () => {
    const { container } = render(<p style={{ width: 10, opacity: 0.5, lineHeight: 2, marginTop: 4 }}>p</p>);
    expect(container.querySelector("p")?.getAttribute("style")).toBe("width: 10px; opacity: 0.5; line-height: 2; margin-top: 4px;");
  });
});
