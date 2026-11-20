// React leg only. Verifies the React adapter twins emitted to `.react-emit/src/`.
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useLayoutEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPortal } from "../.react-emit/src/compat.js";
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

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("dataviz-preact React adapter twins", () => {
  it("compat createPortal teleports into target and bubbles clicks in React", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick}>
        {createPortal(
          <button type="button" data-testid="p-btn">
            Go
          </button>,
          host,
        )}
      </div>,
    );
    const btn = host.querySelector('[data-testid="p-btn"]') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onParentClick).toHaveBeenCalledTimes(1);
  });

  it("runtime forwardRef, useInsertionEffect, useSyncExternalStore and event helpers work on React", () => {
    const order: string[] = [];
    let storeVal = 1;
    const listeners = new Set<() => void>();
    const subscribe = (cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    };

    function Child() {
      useLayoutEffect(() => {
        order.push("layout");
      }, []);
      return <output>{useSyncExternalStore(subscribe, () => storeVal)}</output>;
    }

    const Host = forwardRef<HTMLInputElement, { label: string }>((props, ref) => {
      useInsertionEffect(() => {
        order.push("insert");
      }, []);
      return (
        <div>
          <input ref={ref} aria-label={props.label} />
          <Child />
        </div>
      );
    });

    const ref = createRef<HTMLInputElement>();
    const onVal = vi.fn();
    const onChange = vi.fn();
    const onInput = vi.fn();
    const onDbl = vi.fn();
    const onIn = vi.fn();
    const onOut = vi.fn();

    render(
      <>
        <Host label="RefField" ref={ref} />
        <input aria-label="TextIn" {...textInput<HTMLInputElement>(onVal)} />
        <input aria-label="TextChg" {...textChange<HTMLInputElement>(onChange, onInput)} />
        <button type="button" {...dblClick<HTMLButtonElement>(onDbl)}>
          Double
        </button>
        <div {...focusWithin<HTMLDivElement>(onIn)} {...focusOut<HTMLDivElement>(onOut)}>
          <button type="button">Nested</button>
        </div>
      </>,
    );

    expect(ref.current).toBe(screen.getByLabelText("RefField"));
    expect(order).toEqual(["insert", "layout"]);
    expect(screen.getByRole("status").textContent).toBe("1");

    act(() => {
      storeVal = 2;
      listeners.forEach((cb) => cb());
    });
    expect(screen.getByRole("status").textContent).toBe("2");

    fireEvent.change(screen.getByLabelText("TextIn"), { target: { value: "abc" } });
    expect(onVal).toHaveBeenCalledWith("abc");

    fireEvent.input(screen.getByLabelText("TextChg"), { target: { value: "z" } });
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.doubleClick(screen.getByRole("button", { name: "Double" }));
    expect(onDbl).toHaveBeenCalledTimes(1);

    const nested = screen.getByRole("button", { name: "Nested" });
    fireEvent.focus(nested);
    fireEvent.blur(nested);
    expect(onIn).toHaveBeenCalledTimes(1);
    expect(onOut).toHaveBeenCalledTimes(1);
  });

  it("signals twin collapses isSignal to false and useValue/unwrap to identity", () => {
    const obj = { value: "plain" };
    expect(isSignal(obj)).toBe(false);
    expect(useValue("abc")).toBe("abc");
    expect(unwrap(obj)).toBe(obj);
  });
});
