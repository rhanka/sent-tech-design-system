import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createRef } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { forwardRef, textInput, useSyncExternalStore } from "./runtime.js";

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

  it("textInput reports every keystroke of a text control through the native input event", () => {
    const onValue = vi.fn();
    render(<input aria-label="Query" {...textInput<HTMLInputElement>(onValue)} />);
    const input = screen.getByLabelText("Query");
    fireEvent.input(input, { target: { value: "a" } });
    fireEvent.input(input, { target: { value: "ab" } });
    expect(onValue.mock.calls.map(([value]) => value)).toEqual(["a", "ab"]);
  });
});
