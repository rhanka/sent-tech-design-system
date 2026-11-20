import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createRef } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { classNames } from "./classNames.js";
import { createPortal } from "./compat.js";
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
import { isSignal, unwrap, useValue, type MaybeSignal } from "./signals.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("dataviz-preact adapters (Preact leg)", () => {
  it("normalises SVG presentation attributes and SVG tabIndex while preserving camelCase SVG attributes", () => {
    const { container } = render(
      <svg viewBox="0 0 100 40" preserveAspectRatio="xMidYMid meet">
        <g tabIndex={0} data-testid="svg-node">
          <line strokeWidth={2} strokeDasharray="2 3" strokeLinecap="round" strokeLinejoin="round" />
          <text textAnchor="end" dominantBaseline="middle" fontSize="11" textLength={20}>
            tick
          </text>
        </g>
      </svg>,
    );
    const svg = container.querySelector("svg") as SVGElement;
    const g = screen.getByTestId("svg-node") as unknown as SVGElement;
    const line = container.querySelector("line") as SVGElement;
    const text = container.querySelector("text") as SVGElement;

    expect(svg.getAttribute("viewBox")).toBe("0 0 100 40");
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMid meet");
    expect(g.getAttribute("tabindex")).toBe("0");
    expect(g.getAttribute("tabIndex")).toBeNull();
    expect((g as unknown as { tabIndex: number }).tabIndex).toBe(0);
    expect(line.getAttribute("stroke-width")).toBe("2");
    expect(line.getAttribute("stroke-dasharray")).toBe("2 3");
    expect(line.getAttribute("stroke-linecap")).toBe("round");
    expect(line.getAttribute("stroke-linejoin")).toBe("round");
    expect(line.getAttribute("strokeWidth")).toBeNull();
    expect(text.getAttribute("text-anchor")).toBe("end");
    expect(text.getAttribute("dominant-baseline")).toBe("middle");
    expect(text.getAttribute("font-size")).toBe("11");
    expect(text.getAttribute("textLength")).toBe("20");
  });

  it("useSyncExternalStore subscribes, re-renders on change, bails out on Object.is equality and cleans up", async () => {
    let value = 10;
    const listeners = new Set<() => void>();
    const subscribe = (cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    };
    let renders = 0;
    function Reader() {
      renders += 1;
      return <output>{useSyncExternalStore(subscribe, () => value, () => -1)}</output>;
    }
    const { unmount } = render(<Reader />);
    expect(screen.getByRole("status").textContent).toBe("10");
    expect(listeners.size).toBe(1);

    const settled = renders;
    listeners.forEach((cb) => cb());
    await new Promise((r) => setTimeout(r, 15));
    expect(renders).toBe(settled);

    value = 20;
    listeners.forEach((cb) => cb());
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("20"));

    unmount();
    expect(listeners.size).toBe(0);
  });

  it("signals adapter reacts to post-mount .value mutations and updates DOM", async () => {
    const cls = signal("initial-cls");
    const active = signal(false);

    function Edge({ className, on }: { className?: MaybeSignal<string>; on?: MaybeSignal<boolean> }) {
      const resolvedClass = useValue(className);
      const resolvedOn = useValue(on) ?? false;
      return <div data-testid="edge" data-on={String(resolvedOn)} className={classNames("base", resolvedClass)} />;
    }

    expect(isSignal(cls)).toBe(true);
    expect(isSignal("plain")).toBe(false);
    expect(unwrap(cls)).toBe("initial-cls");
    expect(unwrap("plain")).toBe("plain");

    render(<Edge className={cls} on={active} />);
    const el = screen.getByTestId("edge");
    expect(el.className).toBe("base initial-cls");
    expect(el.getAttribute("data-on")).toBe("false");

    cls.value = "mutated-cls";
    active.value = true;
    await waitFor(() => {
      expect(el.className).toBe("base mutated-cls");
      expect(el.getAttribute("data-on")).toBe("true");
    });
  });

  it("forwardRef, createPortal, insertion effect and event adapters work on Preact core", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const events: string[] = [];
    const onInput = vi.fn(() => events.push("input"));
    const onChange = vi.fn(() => events.push("change"));
    const onVal = vi.fn();
    const onDbl = vi.fn();
    const onIn = vi.fn();
    const onOut = vi.fn();

    const Field = forwardRef<HTMLInputElement, { label: string }>((props, ref) => {
      useInsertionEffect(() => {
        events.push("insert");
      }, []);
      return <input ref={ref} aria-label={props.label} {...textInput<HTMLInputElement>(onVal)} />;
    });

    const ref = createRef<HTMLInputElement>();
    render(
      <div>
        <Field label="Query" ref={ref} />
        <input aria-label="Chg" {...textChange<HTMLInputElement>(onChange, onInput)} />
        <button type="button" {...dblClick<HTMLButtonElement>(onDbl)}>
          Dbl
        </button>
        <div {...focusWithin<HTMLDivElement>(onIn)} {...focusOut<HTMLDivElement>(onOut)}>
          <button type="button">Child</button>
        </div>
        {createPortal(<span data-testid="portaled">in-portal</span>, host)}
      </div>,
    );

    expect(ref.current).toBe(screen.getByLabelText("Query"));
    expect(events).toEqual(["insert"]);
    expect(host.querySelector('[data-testid="portaled"]')?.textContent).toBe("in-portal");

    fireEvent.input(screen.getByLabelText("Query"), { target: { value: "hi" } });
    expect(onVal).toHaveBeenCalledWith("hi");

    fireEvent.input(screen.getByLabelText("Chg"), { target: { value: "x" } });
    expect(events).toEqual(["insert", "input", "change"]);

    fireEvent.dblClick(screen.getByRole("button", { name: "Dbl" }));
    expect(onDbl).toHaveBeenCalledTimes(1);

    const child = screen.getByRole("button", { name: "Child" });
    child.focus();
    child.blur();
    expect(onIn).toHaveBeenCalledTimes(1);
    expect(onOut).toHaveBeenCalledTimes(1);
  });
});
