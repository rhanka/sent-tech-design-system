// Spike S1 probes. They record, as executable facts, where Preact core
// (no `preact/compat`) behaves differently from React on patterns that the
// 225 modules of `components-react` use, so lot P0 decides each mechanism on
// evidence. Nothing here is part of the package: the candidate hook below is
// test-local.
import { cleanup, fireEvent, render } from "@testing-library/preact";
import { options } from "preact";
import type { VNode } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  it("leaves camelCase SVG presentation attributes untranslated (81 files, 441 uses in components-react)", () => {
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

  it("does not bubble `onFocus` / `onBlur` from a child to a container handler (15 uses in 9 files)", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { container } = render(
      <div onFocus={onFocus} onBlur={onBlur}>
        <input />
      </div>,
    );
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("appends px to unitless numeric styles like React (71 files use inline styles)", () => {
    const { container } = render(<p style={{ width: 10, opacity: 0.5, lineHeight: 2, marginTop: 4 }}>p</p>);
    expect(container.querySelector("p")?.getAttribute("style")).toBe("width: 10px; opacity: 0.5; line-height: 2; margin-top: 4px;");
  });
});
