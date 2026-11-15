import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createRef } from "preact";
import { useLayoutEffect, useState } from "preact/hooks";
import { afterEach, describe, expect, it, vi } from "vitest";
import { focusWithin, forwardRef, textInput, useSyncExternalStore } from "./runtime.js";

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
});
