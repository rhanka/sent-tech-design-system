import { cleanup, fireEvent, render } from "@testing-library/preact";
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
