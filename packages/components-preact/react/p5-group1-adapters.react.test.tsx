// React leg only. End-to-end verification of the P5 group-1 adapters
// (`react/compat.ts`, `react/runtime.ts`, `react/signals.ts`) and the two
// non-forwardRef hard-set modules (`Portal`, `ThemeProvider`) after React
// emission — including the documented React-side semantics for `portal-events`
// and `insertion-effect`.
import { sentTechTheme } from "@sentropic/design-system-themes";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useLayoutEffect, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPortal } from "../.react-emit/src/compat.js";
import { Portal, resolvePortalTarget } from "../.react-emit/src/Portal.js";
import {
  dblClick,
  focusOut,
  focusWithin,
  forwardRef,
  textChange,
  textInput,
  useInsertionEffect,
  useSyncExternalStore,
} from "../.react-emit/src/runtime.js";
import { isSignal, unwrap, useValue } from "../.react-emit/src/signals.js";
import { ThemeProvider } from "../.react-emit/src/ThemeProvider.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  for (const style of Array.from(document.head.querySelectorAll("style[data-st-theme-provider]"))) {
    style.remove();
  }
});

describe("P5 group 1 React twins (compat, runtime, signals)", () => {
  it("compat createPortal teleports into target and bubbles clicks through the React tree", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick}>
        {createPortal(
          <button type="button" data-testid="compat-btn">
            Click
          </button>,
          host,
        )}
      </div>,
    );
    const btn = host.querySelector('[data-testid="compat-btn"]') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onParentClick).toHaveBeenCalledTimes(1);
  });

  it("runtime forwardRef forwards object and callback refs on React", () => {
    const Field = forwardRef<HTMLInputElement, { label: string }>((props, ref) => (
      <input ref={ref} aria-label={props.label} />
    ));
    const objectRef = createRef<HTMLInputElement>();
    const callbackRef = vi.fn();
    render(
      <>
        <Field label="Obj" ref={objectRef} />
        <Field label="Cb" ref={callbackRef} />
      </>,
    );
    expect(objectRef.current).toBe(screen.getByLabelText("Obj"));
    expect(callbackRef).toHaveBeenCalledWith(screen.getByLabelText("Cb"));
  });

  it("runtime useInsertionEffect runs before child useLayoutEffect and cleans up on change and unmount", () => {
    const order: string[] = [];
    function Child() {
      useLayoutEffect(() => {
        order.push("child-layout");
      }, []);
      return null;
    }
    function Host({ id }: { id: string }) {
      useInsertionEffect(() => {
        order.push(`+ins-${id}`);
        return () => {
          order.push(`-ins-${id}`);
        };
      }, [id]);
      return <Child />;
    }
    const { rerender, unmount } = render(<Host id="a" />);
    expect(order).toEqual(["+ins-a", "child-layout"]);
    rerender(<Host id="b" />);
    expect(order).toEqual(["+ins-a", "child-layout", "-ins-a", "+ins-b"]);
    unmount();
    expect(order).toEqual(["+ins-a", "child-layout", "-ins-a", "+ins-b", "-ins-b"]);
  });

  it("runtime useSyncExternalStore follows store updates, swaps subscribe, and unsubscribes on unmount", () => {
    let value = 1;
    const listenersA = new Set<() => void>();
    const listenersB = new Set<() => void>();
    const subA = (cb: () => void) => {
      listenersA.add(cb);
      return () => listenersA.delete(cb);
    };
    const subB = (cb: () => void) => {
      listenersB.add(cb);
      return () => listenersB.delete(cb);
    };
    let swap: (next: typeof subA) => void = () => {};
    function Reader() {
      const [sub, setSub] = useState(() => subA);
      swap = (next) => setSub(() => next);
      return <output>{useSyncExternalStore(sub, () => value)}</output>;
    }
    const { unmount } = render(<Reader />);
    expect(screen.getByRole("status").textContent).toBe("1");
    expect(listenersA.size).toBe(1);

    act(() => {
      value = 2;
      listenersA.forEach((cb) => cb());
    });
    expect(screen.getByRole("status").textContent).toBe("2");

    act(() => swap(subB));
    expect(listenersA.size).toBe(0);
    expect(listenersB.size).toBe(1);

    act(() => {
      value = 3;
      listenersB.forEach((cb) => cb());
    });
    expect(screen.getByRole("status").textContent).toBe("3");

    unmount();
    expect(listenersB.size).toBe(0);
  });

  it("runtime event adapters (textInput, textChange, dblClick, focusWithin, focusOut) map to React handlers", () => {
    const order: string[] = [];
    const onValue = vi.fn();
    const onChange = vi.fn(() => order.push("change"));
    const onInput = vi.fn(() => order.push("input"));
    const onDbl = vi.fn();
    const onIn = vi.fn();
    const onOut = vi.fn();
    render(
      <>
        <input aria-label="TextIn" {...textInput<HTMLInputElement>(onValue)} />
        <input aria-label="TextChg" {...textChange<HTMLInputElement>(onChange, onInput)} />
        <button type="button" {...dblClick<HTMLButtonElement>(onDbl)}>
          Double
        </button>
        <div {...focusWithin<HTMLDivElement>(onIn)} {...focusOut<HTMLDivElement>(onOut)}>
          <button type="button">Child</button>
        </div>
      </>,
    );
    fireEvent.change(screen.getByLabelText("TextIn"), { target: { value: "hi" } });
    expect(onValue).toHaveBeenCalledWith("hi");

    const chg = screen.getByLabelText("TextChg");
    // In React a single native `input` event fires both `onInput` and `onChange`,
    // matching the Preact `textChange` composition order.
    fireEvent.input(chg, { target: { value: "a" } });
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["input", "change"]);

    fireEvent.doubleClick(screen.getByRole("button", { name: "Double" }));
    expect(onDbl).toHaveBeenCalledTimes(1);

    const child = screen.getByRole("button", { name: "Child" });
    fireEvent.focus(child);
    fireEvent.blur(child);
    expect(onIn).toHaveBeenCalledTimes(1);
    expect(onOut).toHaveBeenCalledTimes(1);
  });

  it("signals twin collapses isSignal to false and useValue/unwrap to identity", () => {
    const holder = { value: "plain" };
    expect(isSignal(holder)).toBe(false);
    expect(useValue("abc")).toBe("abc");
    expect(unwrap(holder)).toBe(holder);
  });
});

describe("P5 group 1 emitted hard-set modules on React leg (Portal, ThemeProvider)", () => {
  it("emitted Portal switches inline/teleported and bubbles clicks through the component tree", () => {
    const onParentClick = vi.fn();
    const { container, rerender } = render(
      <div onClick={onParentClick}>
        <Portal disabled className="extra">
          <button type="button" data-testid="p-btn">
            Go
          </button>
        </Portal>
      </div>,
    );
    expect(container.querySelector('[data-st-portal="inline"]')?.className).toBe("st-portal extra");
    expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeNull();

    rerender(
      <div onClick={onParentClick}>
        <Portal className="moved">
          <button type="button" data-testid="p-btn">
            Go
          </button>
        </Portal>
      </div>,
    );
    const tp = document.body.querySelector('[data-st-portal="teleported"]');
    expect(tp?.className).toBe("st-portal moved");
    fireEvent.click(tp?.querySelector('[data-testid="p-btn"]') as HTMLButtonElement);
    // Semantic mapping `portal-events`: React bubbles portal clicks through the component tree.
    expect(onParentClick).toHaveBeenCalledTimes(1);
    expect(resolvePortalTarget("#missing")).toBe(document.body);
  });

  it("emitted ThemeProvider injects CSS before child useLayoutEffect and swaps cleanly on prop change", () => {
    const styleSelector = `style[data-st-theme-provider="${sentTechTheme.id}"]`;
    let seenByChildLayout: boolean | undefined;
    function Probe() {
      useLayoutEffect(() => {
        seenByChildLayout = document.head.querySelector(styleSelector) !== null;
      }, []);
      return null;
    }
    const { container, rerender, unmount } = render(
      <ThemeProvider theme={sentTechTheme}>
        <Probe />
      </ThemeProvider>,
    );
    // Semantic mapping `insertion-effect`: React runs insertion effects before child layout effects.
    expect(seenByChildLayout).toBe(true);
    expect(container.firstElementChild?.getAttribute("data-st-theme")).toBe(sentTechTheme.id);

    const customTheme = { ...sentTechTheme, id: "react-custom" };
    rerender(
      <ThemeProvider theme={customTheme} namespace="rc">
        <Probe />
      </ThemeProvider>,
    );
    expect(document.head.querySelector(styleSelector)).toBeNull();
    const customStyle = document.head.querySelector('style[data-st-theme-provider="react-custom"]');
    expect(customStyle?.textContent).toContain("--rc-semantic-text-primary");
    unmount();
    expect(document.head.querySelector('style[data-st-theme-provider="react-custom"]')).toBeNull();
  });
});
