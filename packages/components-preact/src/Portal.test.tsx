import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/preact";
import { createContext } from "preact";
import { useContext, useState } from "preact/hooks";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Portal, resolvePortalTarget } from "./Portal.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("Portal (Preact)", () => {
  it("renders inline (in place) when disabled", () => {
    const { container } = render(
      <Portal disabled className="extra">
        <div data-testid="portal-content">inline</div>
      </Portal>,
    );
    const inline = container.querySelector('[data-st-portal="inline"]');
    expect(inline?.className).toBe("st-portal extra");
    expect(inline?.querySelector('[data-testid="portal-content"]')).toBeTruthy();
  });

  it("accepts a signal for `className` and follows it inline and when teleported", async () => {
    const extra = signal("first");
    const { container } = render(<Portal disabled className={extra} />);
    const inline = container.querySelector('[data-st-portal="inline"]');
    expect(inline?.className).toBe("st-portal first");
    extra.value = "second";
    await waitFor(() => expect(container.querySelector('[data-st-portal="inline"]')?.className).toBe("st-portal second"));

    const teleportedClass = signal("tp-a");
    render(
      <Portal className={teleportedClass}>
        <span>tp</span>
      </Portal>,
    );
    await waitFor(() => expect(document.body.querySelector('[data-st-portal="teleported"]')?.className).toBe("st-portal tp-a"));
    teleportedClass.value = "tp-b";
    await waitFor(() => expect(document.body.querySelector('[data-st-portal="teleported"]')?.className).toBe("st-portal tp-b"));
  });

  it("accepts a signal for `disabled` and switches inline/teleported in both directions post-mount", async () => {
    const disabled = signal(false);
    const { container } = render(
      <Portal disabled={disabled}>
        <div data-testid="portal-signal-disabled">content</div>
      </Portal>,
    );
    await waitFor(() => expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeTruthy());
    expect(container.querySelector('[data-st-portal="inline"]')).toBeNull();
    disabled.value = true;
    await waitFor(() => expect(container.querySelector('[data-st-portal="inline"]')).toBeTruthy());
    expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeNull();
    disabled.value = false;
    await waitFor(() => expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeTruthy());
    expect(container.querySelector('[data-st-portal="inline"]')).toBeNull();

    cleanup();
    document.body.innerHTML = "";

    const startsDisabled = signal(true);
    const second = render(
      <Portal disabled={startsDisabled}>
        <div data-testid="portal-starts-disabled">start</div>
      </Portal>,
    );
    expect(second.container.querySelector('[data-st-portal="inline"]')).toBeTruthy();
    expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeNull();
    startsDisabled.value = false;
    await waitFor(() => expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeTruthy());
    expect(second.container.querySelector('[data-st-portal="inline"]')).toBeNull();
  });

  it("accepts a signal for `target` (element and CSS selector) and moves the portal post-mount", async () => {
    const hostA = document.createElement("div");
    hostA.id = "portal-signal-a";
    const hostB = document.createElement("div");
    hostB.id = "portal-signal-b";
    document.body.appendChild(hostA);
    document.body.appendChild(hostB);
    const target = signal<string | HTMLElement>(hostA);
    render(
      <Portal target={target}>
        <div data-testid="portal-signal-target">content</div>
      </Portal>,
    );
    await waitFor(() => expect(hostA.querySelector('[data-testid="portal-signal-target"]')).toBeTruthy());
    expect(hostB.querySelector('[data-testid="portal-signal-target"]')).toBeNull();
    target.value = hostB;
    await waitFor(() => expect(hostB.querySelector('[data-testid="portal-signal-target"]')).toBeTruthy());
    expect(hostA.querySelector('[data-testid="portal-signal-target"]')).toBeNull();
    target.value = "#portal-signal-a";
    await waitFor(() => expect(hostA.querySelector('[data-testid="portal-signal-target"]')).toBeTruthy());
    expect(hostB.querySelector('[data-testid="portal-signal-target"]')).toBeNull();
  });

  it("resolvePortalTarget handles SSR (no document), nullish default, selector fallback and elements", () => {
    const host = document.createElement("section");
    document.body.appendChild(host);
    expect(resolvePortalTarget(undefined)).toBe(document.body);
    expect(resolvePortalTarget("#does-not-exist")).toBe(document.body);
    expect(resolvePortalTarget(host)).toBe(host);
    vi.stubGlobal("document", undefined);
    try {
      expect(resolvePortalTarget(undefined)).toBeNull();
      expect(resolvePortalTarget("body")).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("teleports content under document.body after mount", () => {
    const { container } = render(
      <Portal>
        <div data-testid="portal-content">teleported</div>
      </Portal>,
    );
    const teleported = document.body.querySelector('[data-st-portal="teleported"]');
    expect(teleported?.querySelector('[data-testid="portal-content"]')).toBeTruthy();
    expect(teleported?.parentElement).toBe(document.body);
    expect(container.contains(teleported)).toBe(false);
    expect(container.querySelector('[data-st-portal="inline"]')).toBeNull();
  });

  it("teleports into a selector target or an element target", () => {
    const host = document.createElement("div");
    host.id = "portal-target";
    document.body.appendChild(host);
    const other = document.createElement("section");
    document.body.appendChild(other);
    render(
      <>
        <Portal target="#portal-target">
          <span data-testid="by-selector">a</span>
        </Portal>
        <Portal target={other}>
          <span data-testid="by-element">b</span>
        </Portal>
      </>,
    );
    expect(host.querySelector('[data-testid="by-selector"]')).toBeTruthy();
    expect(other.querySelector('[data-testid="by-element"]')).toBeTruthy();
    expect(resolvePortalTarget("#missing")).toBe(document.body);
  });

  it("removes the teleported node on unmount", () => {
    const { unmount } = render(
      <Portal>
        <div data-testid="portal-content">teleported</div>
      </Portal>,
    );
    expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeTruthy();
    expect(() => unmount()).not.toThrow();
    expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeNull();
  });

  it("keeps context, state updates and events working across the portal", () => {
    const Theme = createContext("none");
    const onOutside = vi.fn();
    function Inside() {
      const theme = useContext(Theme);
      const [count, setCount] = useState(0);
      return (
        <button type="button" data-testid="inside" onClick={() => setCount(count + 1)}>
          {theme}:{count}
        </button>
      );
    }
    render(
      <Theme.Provider value="dark">
        <div onClick={onOutside}>
          <Portal>
            <Inside />
          </Portal>
        </div>
      </Theme.Provider>,
    );
    const inside = document.body.querySelector('[data-testid="inside"]') as HTMLButtonElement;
    expect(inside.textContent).toBe("dark:0");
    fireEvent.click(inside);
    expect(inside.textContent).toBe("dark:1");
    // Documents the runtime difference: Preact events follow the DOM tree, so
    // a click inside a portal does NOT reach a handler of the component-tree
    // parent. React bubbles it through the component tree.
    expect(onOutside).not.toHaveBeenCalled();
  });
});
