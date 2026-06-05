import { render } from "@testing-library/svelte";
import { createRawSnippet, tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import Portal from "./lib/Portal.svelte";
import Popper, { computePosition } from "./lib/Popper.svelte";

const content = createRawSnippet(() => ({
  render: () => `<div data-testid="portal-content">teleported</div>`
}));

const panelContent = createRawSnippet(() => ({
  render: () => `<span data-testid="popper-content">panel</span>`
}));

/** Build a fake anchor exposing only getBoundingClientRect (jsdom returns 0s). */
function mockAnchor(rect: Partial<DOMRect> = {}): HTMLElement {
  const full = {
    top: 100,
    left: 50,
    right: 150,
    bottom: 120,
    width: 100,
    height: 20,
    x: 50,
    y: 100,
    toJSON: () => ({})
  };
  return {
    getBoundingClientRect: () => ({ ...full, ...rect }) as DOMRect
  } as unknown as HTMLElement;
}

describe("Portal", () => {
  it("renders inline (in place) when disabled", () => {
    const { container } = render(Portal, {
      props: { disabled: true, children: content }
    });
    // Content stays inside the rendered component subtree.
    expect(container.querySelector('[data-testid="portal-content"]')).toBeTruthy();
    const inline = container.querySelector('[data-st-portal="inline"]');
    expect(inline).toBeTruthy();
  });

  it("teleports content under document.body after mount", async () => {
    const { container } = render(Portal, { props: { children: content } });
    await tick();
    // The teleported container is moved out of the component subtree.
    const teleported = document.body.querySelector('[data-st-portal="teleported"]');
    expect(teleported).toBeTruthy();
    expect(teleported?.querySelector('[data-testid="portal-content"]')).toBeTruthy();
    // It is a direct child of body, not nested in the original render container.
    expect(teleported?.parentElement).toBe(document.body);
    expect(container.contains(teleported)).toBe(false);
  });

  it("teleports into a custom selector target", async () => {
    const host = document.createElement("div");
    host.id = "portal-target";
    document.body.appendChild(host);
    render(Portal, { props: { target: "#portal-target", children: content } });
    await tick();
    expect(host.querySelector('[data-testid="portal-content"]')).toBeTruthy();
    host.remove();
  });

  it("cleans up the teleported node on unmount without throwing", async () => {
    const { unmount } = render(Portal, { props: { children: content } });
    await tick();
    expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeTruthy();
    expect(() => unmount()).not.toThrow();
    await tick();
    expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeNull();
  });
});

describe("Popper", () => {
  it("renders nothing when open is false", () => {
    render(Popper, {
      props: { anchor: mockAnchor(), open: false, children: panelContent }
    });
    expect(document.querySelector(".st-popper")).toBeNull();
    expect(document.querySelector('[data-testid="popper-content"]')).toBeNull();
  });

  it("renders nothing when there is no anchor", () => {
    render(Popper, {
      props: { anchor: null, open: true, children: panelContent }
    });
    expect(document.querySelector(".st-popper")).toBeNull();
  });

  it("renders the panel and applies a position style when open with an anchor", async () => {
    render(Popper, {
      props: { anchor: mockAnchor(), open: true, children: panelContent }
    });
    await tick();
    const panel = document.querySelector(".st-popper") as HTMLElement | null;
    expect(panel).toBeTruthy();
    expect(panel?.querySelector('[data-testid="popper-content"]')).toBeTruthy();
    const style = panel?.getAttribute("style") ?? "";
    expect(style).toContain("top:");
    expect(style).toContain("left:");
    expect(style).toContain("position: absolute");
  });

  it("uses fixed positioning when strategy is fixed", async () => {
    render(Popper, {
      props: { anchor: mockAnchor(), open: true, strategy: "fixed", children: panelContent }
    });
    await tick();
    const panel = document.querySelector(".st-popper") as HTMLElement | null;
    expect(panel?.getAttribute("style")).toContain("position: fixed");
  });

  it("reflects the requested placement via data-popper-placement", async () => {
    render(Popper, {
      props: {
        anchor: mockAnchor(),
        open: true,
        placement: "right-start",
        // Disable flip/shift so the requested placement is preserved verbatim.
        flip: false,
        shift: false,
        children: panelContent
      }
    });
    await tick();
    const panel = document.querySelector(".st-popper") as HTMLElement | null;
    expect(panel?.getAttribute("data-popper-placement")).toBe("right-start");
  });

  it("renders an arrow element when arrow is true", async () => {
    render(Popper, {
      props: { anchor: mockAnchor(), open: true, arrow: true, children: panelContent }
    });
    await tick();
    expect(document.querySelector(".st-popper__arrow")).toBeTruthy();
  });

  it("does not access the anchor's DOM rect while closed", () => {
    const getBoundingClientRect = vi.fn(() => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }) as DOMRect);
    const anchor = { getBoundingClientRect } as unknown as HTMLElement;
    render(Popper, { props: { anchor, open: false, children: panelContent } });
    expect(getBoundingClientRect).not.toHaveBeenCalled();
  });
});

describe("computePosition (pure geometry)", () => {
  const anchor = { top: 100, left: 100, right: 200, bottom: 140, width: 100, height: 40 };
  const base = {
    offset: 8,
    flip: false,
    shift: false,
    viewportWidth: 1000,
    viewportHeight: 800
  };

  it("places below the anchor for bottom placement", () => {
    const r = computePosition(anchor, 80, 30, { ...base, placement: "bottom" });
    expect(r.placement).toBe("bottom");
    expect(r.top).toBe(anchor.bottom + 8);
  });

  it("places above the anchor for top placement", () => {
    const r = computePosition(anchor, 80, 30, { ...base, placement: "top" });
    expect(r.top).toBe(anchor.top - 30 - 8);
  });

  it("flips bottom to top when overflowing the bottom edge and the top fits", () => {
    // Anchor near the bottom of a short viewport: below overflows, above fits.
    const lowAnchor = { top: 120, left: 100, right: 200, bottom: 150, width: 100, height: 30 };
    const r = computePosition(lowAnchor, 80, 60, {
      ...base,
      flip: true,
      placement: "bottom",
      viewportHeight: 180
    });
    expect(r.placement).toBe("top");
  });

  it("does not flip when neither side fits (keeps requested placement)", () => {
    const r = computePosition(anchor, 80, 200, {
      ...base,
      flip: true,
      placement: "bottom",
      viewportHeight: 160
    });
    expect(r.placement).toBe("bottom");
  });

  it("shifts to stay within the viewport on the cross axis", () => {
    const r = computePosition(
      { top: 10, left: 980, right: 1080, bottom: 50, width: 100, height: 40 },
      120,
      30,
      { ...base, shift: true, placement: "bottom", viewportWidth: 1000 }
    );
    // Panel right edge cannot exceed viewport width.
    expect(r.left + 120).toBeLessThanOrEqual(1000);
    expect(r.left).toBeGreaterThanOrEqual(0);
  });
});
