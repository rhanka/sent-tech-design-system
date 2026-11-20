import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { Component, createRef } from "preact";
import type { ComponentChildren } from "preact";
import { useLayoutEffect, useState } from "preact/hooks";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  dblClick,
  focusOut,
  focusWithin,
  forwardRef,
  textChange,
  textInput,
  useInsertionEffect,
  useSyncExternalStore,
} from "./runtime.js";

afterEach(cleanup);

describe("runtime adapter (Preact core, no preact/compat)", () => {
  it("forwardRef hands the ref to the render function and keeps it out of the props", () => {
    const seenProps = vi.fn();
    const Field = forwardRef<HTMLInputElement, { label: string }>((props, ref) => {
      seenProps(props);
      return <input ref={ref} aria-label={props.label} />;
    });
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(<Field label="Name" ref={ref} />);
    expect(ref.current).toBe(screen.getByLabelText("Name"));
    expect(seenProps).toHaveBeenLastCalledWith({ label: "Name" });
    expect(Field.displayName).toMatch(/^ForwardRef\(/);

    // A component rendered without a ref receives null, as in React.
    const seenRef = vi.fn();
    const Plain = forwardRef<HTMLSpanElement, {}>((_props, forwarded) => {
      seenRef(forwarded);
      return <span>plain</span>;
    });
    rerender(<Plain />);
    expect(seenRef).toHaveBeenLastCalledWith(null);
    // The ref of the unmounted component is released.
    expect(ref.current).toBeNull();
  });

  it("useSyncExternalStore follows an external store and unsubscribes on unmount", async () => {
    let value = 1;
    const listeners = new Set<() => void>();
    const subscribe = (onChange: () => void) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    };
    const getSnapshot = () => value;
    function Reader() {
      return <output>{useSyncExternalStore(subscribe, getSnapshot)}</output>;
    }
    const { unmount } = render(<Reader />);
    expect(screen.getByRole("status").textContent).toBe("1");
    expect(listeners.size).toBe(1);

    value = 2;
    listeners.forEach((listener) => listener());
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("2"));

    unmount();
    expect(listeners.size).toBe(0);
  });

  it("useSyncExternalStore subscribes once, whatever the snapshot does and with an inline getSnapshot", async () => {
    let value = 1;
    let subscriptions = 0;
    let unsubscriptions = 0;
    const listeners = new Set<() => void>();
    const subscribe = (onChange: () => void) => {
      subscriptions += 1;
      listeners.add(onChange);
      return () => {
        unsubscriptions += 1;
        listeners.delete(onChange);
      };
    };
    let renders = 0;
    function Reader({ label }: { label: string }) {
      renders += 1;
      // A new `getSnapshot` function on every render.
      const current = useSyncExternalStore(subscribe, () => value);
      return (
        <output>
          {label}:{current}
        </output>
      );
    }
    const { rerender, unmount } = render(<Reader label="a" />);
    expect(screen.getByRole("status").textContent).toBe("a:1");

    for (const next of [2, 3, 4]) {
      value = next;
      listeners.forEach((listener) => listener());
      await waitFor(() => expect(screen.getByRole("status").textContent).toBe(`a:${next}`));
    }
    // A parent re-render with an unchanged store.
    rerender(<Reader label="b" />);
    expect(screen.getByRole("status").textContent).toBe("b:4");
    await waitFor(() => expect(renders).toBeGreaterThanOrEqual(5));

    expect(subscriptions).toBe(1);
    expect(unsubscriptions).toBe(0);
    expect(listeners.size).toBe(1);

    // A notification without a change does not re-render.
    const settled = renders;
    listeners.forEach((listener) => listener());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(renders).toBe(settled);

    unmount();
    expect(unsubscriptions).toBe(1);
    expect(listeners.size).toBe(0);
  });

  it("useSyncExternalStore catches a store change made between render and subscription", async () => {
    let value = "initial";
    const subscribe = () => () => {};
    const getSnapshot = () => value;
    function Reader() {
      return <output>{useSyncExternalStore(subscribe, getSnapshot)}</output>;
    }
    /** Writes the store in the layout phase, with nobody subscribed yet. */
    function LateWriter() {
      useLayoutEffect(() => {
        value = "written before subscription";
      }, []);
      return null;
    }
    render(
      <>
        <Reader />
        <LateWriter />
      </>,
    );
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("written before subscription"));
  });

  it("useSyncExternalStore takes React's third argument: getServerSnapshot is read only where there is no document", () => {
    const subscribe = () => () => {};
    const getSnapshot = vi.fn(() => "client");
    const getServerSnapshot = vi.fn(() => "server");
    function Reader() {
      return <output>{useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)}</output>;
    }
    const { unmount } = render(<Reader />);
    expect(screen.getByRole("status").textContent).toBe("client");
    expect(getServerSnapshot).not.toHaveBeenCalled();
    unmount();

    // Server render: no `document` while the hook takes its snapshot.
    const seen: string[] = [];
    function ServerReader({ withServerSnapshot }: { withServerSnapshot: boolean }) {
      vi.stubGlobal("document", undefined);
      try {
        seen.push(useSyncExternalStore(subscribe, getSnapshot, withServerSnapshot ? getServerSnapshot : undefined));
      } finally {
        vi.unstubAllGlobals();
      }
      return null;
    }
    render(<ServerReader withServerSnapshot />);
    expect(seen[0]).toBe("server");
    cleanup();
    // Without a server snapshot the client reader is the only one there is.
    seen.length = 0;
    render(<ServerReader withServerSnapshot={false} />);
    expect(seen[0]).toBe("client");
  });

  it("useSyncExternalStore re-subscribes when `subscribe` itself changes", async () => {
    const calls: string[] = [];
    const store = (name: string) => () => {
      calls.push(`+${name}`);
      return () => {
        calls.push(`-${name}`);
      };
    };
    const first = store("first");
    const second = store("second");
    let swap: (next: () => () => void) => void = () => {};
    function Reader() {
      const [subscribe, setSubscribe] = useState(() => first);
      swap = (next) => setSubscribe(() => next);
      return <output>{useSyncExternalStore(subscribe, () => 0)}</output>;
    }
    const { unmount } = render(<Reader />);
    expect(calls).toEqual(["+first"]);
    swap(second);
    await waitFor(() => expect(calls).toEqual(["+first", "-first", "+second"]));
    unmount();
    expect(calls).toEqual(["+first", "-first", "+second", "-second"]);
  });

  it("textInput reports every keystroke of a text control through the native input event", () => {
    const onValue = vi.fn();
    render(<input aria-label="Query" {...textInput<HTMLInputElement>(onValue)} />);
    const input = screen.getByLabelText("Query");
    fireEvent.input(input, { target: { value: "a" } });
    fireEvent.input(input, { target: { value: "ab" } });
    expect(onValue.mock.calls.map(([value]) => value)).toEqual(["a", "ab"]);
  });

  it("focusWithin hears the focus of the element and of its descendants, through the bubbling event", () => {
    const seen: Array<EventTarget | null> = [];
    render(
      <div data-testid="group" tabIndex={0} {...focusWithin<HTMLDivElement>((event) => seen.push(event.target))}>
        <button type="button">Inside</button>
      </div>,
    );
    const group = screen.getByTestId("group");
    const inside = screen.getByRole("button", { name: "Inside" });
    group.focus();
    inside.focus();
    expect(seen).toEqual([group, inside]);
    // The helper binds `focusin`: the non-bubbling `focus` event alone does not reach it.
    fireEvent.focus(inside);
    expect(seen).toHaveLength(2);
    fireEvent.focusIn(inside);
    expect(seen).toHaveLength(3);
  });

  it("forwardRef supports callback refs and detaches the previous ref when swapped", () => {
    const Field = forwardRef<HTMLInputElement, { label: string }>((props, ref) => (
      <input ref={ref} aria-label={props.label} />
    ));
    const refA = vi.fn();
    const refB = createRef<HTMLInputElement>();
    const { rerender, unmount } = render(<Field label="Swap" ref={refA} />);
    const input = screen.getByLabelText("Swap") as HTMLInputElement;
    expect(refA).toHaveBeenLastCalledWith(input);

    rerender(<Field label="Swap" ref={refB} />);
    expect(refA).toHaveBeenLastCalledWith(null);
    expect(refB.current).toBe(input);

    unmount();
    expect(refB.current).toBeNull();
  });

  it("normalises SVG presentation attributes and tabIndex while preserving genuine camelCase SVG attributes", () => {
    const { container } = render(
      <div>
        <svg viewBox="0 0 20 20">
          <defs>
            <clipPath id="clip-rt" clipPathUnits="userSpaceOnUse" />
            <marker id="mk-rt" markerWidth={6} markerHeight={6} markerUnits="strokeWidth" />
          </defs>
          <g clipPath="url(#clip-rt)" tabIndex={0} data-testid="svg-focusable">
            <line strokeWidth={2} strokeDasharray="4 2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <rect fillOpacity={0.5} pointerEvents="all" />
            <text textAnchor="middle" dominantBaseline="central" fontSize={12} textLength={10}>
              ok
            </text>
          </g>
        </svg>
        <div tabIndex={0} data-testid="html-tab" />
      </div>,
    );
    const svg = container.querySelector("svg") as SVGElement;
    const clipPath = container.querySelector("clipPath") as SVGElement;
    const marker = container.querySelector("marker") as SVGElement;
    const g = screen.getByTestId("svg-focusable") as unknown as SVGElement;
    const line = container.querySelector("line") as SVGElement;
    const rect = container.querySelector("rect") as SVGElement;
    const text = container.querySelector("text") as SVGElement;

    expect(svg.getAttribute("viewBox")).toBe("0 0 20 20");
    expect(clipPath.getAttribute("clipPathUnits")).toBe("userSpaceOnUse");
    expect(marker.getAttribute("markerWidth")).toBe("6");
    expect(marker.getAttribute("markerHeight")).toBe("6");
    expect(marker.getAttribute("markerUnits")).toBe("strokeWidth");

    expect(g.getAttribute("clip-path")).toBe("url(#clip-rt)");
    expect(g.getAttribute("clipPath")).toBeNull();
    expect(g.getAttribute("tabindex")).toBe("0");
    expect(g.getAttribute("tabIndex")).toBeNull();
    expect((g as unknown as { tabIndex: number }).tabIndex).toBe(0);

    expect(line.getAttribute("stroke-width")).toBe("2");
    expect(line.getAttribute("stroke-dasharray")).toBe("4 2");
    expect(line.getAttribute("stroke-linecap")).toBe("round");
    expect(line.getAttribute("vector-effect")).toBe("non-scaling-stroke");
    expect(line.getAttribute("strokeWidth")).toBeNull();

    expect(rect.getAttribute("fill-opacity")).toBe("0.5");
    expect(rect.getAttribute("pointer-events")).toBe("all");
    expect(rect.getAttribute("fillOpacity")).toBeNull();

    expect(text.getAttribute("text-anchor")).toBe("middle");
    expect(text.getAttribute("dominant-baseline")).toBe("central");
    expect(text.getAttribute("font-size")).toBe("12");
    expect(text.getAttribute("textLength")).toBe("10");

    expect(screen.getByTestId("html-tab").getAttribute("tabindex")).toBe("0");
  });

  it("useInsertionEffect runs on mount, cleans up before re-running on dep change, and cleans up on unmount", () => {
    const events: string[] = [];
    function Probe({ id }: { id: string }) {
      useInsertionEffect(() => {
        events.push(`+${id}`);
        return () => {
          events.push(`-${id}`);
        };
      }, [id]);
      return <span>{id}</span>;
    }
    const { rerender, unmount } = render(<Probe id="a" />);
    expect(events).toEqual(["+a"]);
    rerender(<Probe id="b" />);
    expect(events).toEqual(["+a", "-a", "+b"]);
    unmount();
    expect(events).toEqual(["+a", "-a", "+b", "-b"]);
  });

  it("useSyncExternalStore uses Object.is semantics (NaN bailout, +0/-0 update) and surfaces throwing snapshots", async () => {
    let value: number = Number.NaN;
    let shouldThrow = false;
    const listeners = new Set<() => void>();
    const subscribe = (onChange: () => void) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    };
    let renders = 0;
    function Reader() {
      renders += 1;
      const current = useSyncExternalStore(subscribe, () => {
        if (shouldThrow) throw new Error("snapshot boom");
        return value;
      });
      return <output>{Object.is(current, -0) ? "-0" : String(current)}</output>;
    }
    class Catcher extends Component<{ children: ComponentChildren }, { error: string | null }> {
      state = { error: null as string | null };
      static getDerivedStateFromError(error: Error) {
        return { error: error.message };
      }
      render() {
        return this.state.error ? <p data-testid="caught">{this.state.error}</p> : this.props.children;
      }
    }

    render(
      <Catcher>
        <Reader />
      </Catcher>,
    );
    expect(screen.getByRole("status").textContent).toBe("NaN");
    const afterMount = renders;
    // NaN -> NaN is identical under Object.is: no extra render.
    listeners.forEach((l) => l());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(renders).toBe(afterMount);

    // +0 -> -0 differs under Object.is: must re-render.
    value = 0;
    listeners.forEach((l) => l());
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("0"));
    value = -0;
    listeners.forEach((l) => l());
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("-0"));

    // A snapshot reader that throws on notification re-renders so the error surfaces.
    shouldThrow = true;
    listeners.forEach((l) => l());
    await waitFor(() => expect(screen.getByTestId("caught").textContent).toBe("snapshot boom"));
  });

  it("textChange maps onChange to native input and composes consumer onInput first", () => {
    const order: string[] = [];
    const onChange = vi.fn(() => order.push("change"));
    const onInput = vi.fn(() => order.push("input"));
    render(
      <>
        <input aria-label="Solo" {...textChange<HTMLInputElement>(onChange)} />
        <input aria-label="Composed" {...textChange<HTMLInputElement>(onChange, onInput)} />
      </>,
    );
    fireEvent.input(screen.getByLabelText("Solo"), { target: { value: "x" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["change"]);

    order.length = 0;
    fireEvent.input(screen.getByLabelText("Composed"), { target: { value: "y" } });
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(order).toEqual(["input", "change"]);
  });

  it("dblClick binds native dblclick", () => {
    const onDbl = vi.fn();
    render(
      <button type="button" {...dblClick<HTMLButtonElement>(onDbl)}>
        Target
      </button>,
    );
    fireEvent.dblClick(screen.getByRole("button", { name: "Target" }));
    expect(onDbl).toHaveBeenCalledTimes(1);
  });

  it("focusOut hears focus leaving a descendant to a sibling or body through bubbling focusout", () => {
    const seen: Array<EventTarget | null> = [];
    render(
      <>
        <div data-testid="host" {...focusOut<HTMLDivElement>((event) => seen.push(event.target))}>
          <button type="button">Inside</button>
        </div>
        <button type="button">Outside</button>
      </>,
    );
    const inside = screen.getByRole("button", { name: "Inside" });
    const outside = screen.getByRole("button", { name: "Outside" });
    inside.focus();
    outside.focus();
    expect(seen).toEqual([inside]);
    // Returning focus to inside then blurring to body still fires focusout.
    inside.focus();
    inside.blur();
    expect(seen).toEqual([inside, inside]);
    // Non-bubbling blur alone on the child does not reach the container.
    fireEvent.blur(inside);
    expect(seen).toHaveLength(2);
    fireEvent.focusOut(inside);
    expect(seen).toHaveLength(3);
  });
});
