import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { Portal, Popper, computePosition } from "./index.js";

// Teleported panels persist in document.body across tests; track mounted
// wrappers and unmount them after each test so no stale `.st-popper` /
// teleported node leaks into the next assertion.
const mounted: VueWrapper[] = [];
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}

afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

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
    toJSON: () => ({}),
  };
  return {
    getBoundingClientRect: () => ({ ...full, ...rect }) as DOMRect,
  } as unknown as HTMLElement;
}

const content = () => h("div", { "data-testid": "portal-content" }, "teleported");
const panelContent = () => h("span", { "data-testid": "popper-content" }, "panel");

describe("Portal", () => {
  it("renders inline (in place) when disabled", () => {
    const wrapper = track(mount(Portal, {
      props: { disabled: true },
      slots: { default: content },
    }));
    expect(wrapper.find('[data-testid="portal-content"]').exists()).toBe(true);
    expect(wrapper.find('[data-st-portal="inline"]').exists()).toBe(true);
  });

  it("teleports content under document.body", () => {
    track(mount(Portal, {
      props: { target: "body" },
      slots: { default: content },
      attachTo: document.body,
    }));
    const teleported = document.body.querySelector('[data-st-portal="teleported"]');
    expect(teleported).toBeTruthy();
    expect(teleported?.querySelector('[data-testid="portal-content"]')).toBeTruthy();
  });

  it("teleports into a custom selector target", () => {
    const host = document.createElement("div");
    host.id = "portal-target";
    document.body.appendChild(host);
    track(mount(Portal, {
      props: { target: "#portal-target" },
      slots: { default: content },
      attachTo: document.body,
    }));
    expect(host.querySelector('[data-testid="portal-content"]')).toBeTruthy();
    host.remove();
  });

  it("unmounts the teleported node without throwing", () => {
    const wrapper = track(mount(Portal, {
      props: { target: "body" },
      slots: { default: content },
      attachTo: document.body,
    }));
    expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeTruthy();
    expect(() => wrapper.unmount()).not.toThrow();
    expect(document.body.querySelector('[data-st-portal="teleported"]')).toBeNull();
  });
});

describe("Popper", () => {
  it("renders nothing when open is false", () => {
    track(mount(Popper, {
      props: { anchor: mockAnchor(), open: false },
      slots: { default: panelContent },
      attachTo: document.body,
    }));
    expect(document.querySelector(".st-popper")).toBeNull();
    expect(document.querySelector('[data-testid="popper-content"]')).toBeNull();
  });

  it("renders nothing when there is no anchor", () => {
    track(mount(Popper, {
      props: { anchor: null, open: true },
      slots: { default: panelContent },
      attachTo: document.body,
    }));
    expect(document.querySelector(".st-popper")).toBeNull();
  });

  it("renders the panel and applies a position style when open with an anchor", () => {
    track(mount(Popper, {
      props: { anchor: mockAnchor(), open: true },
      slots: { default: panelContent },
      attachTo: document.body,
    }));
    const panel = document.querySelector(".st-popper") as HTMLElement | null;
    expect(panel).toBeTruthy();
    expect(panel?.querySelector('[data-testid="popper-content"]')).toBeTruthy();
    const style = panel?.getAttribute("style") ?? "";
    expect(style).toContain("top:");
    expect(style).toContain("left:");
    expect(style).toContain("position: absolute");
  });

  it("uses fixed positioning when strategy is fixed", () => {
    track(mount(Popper, {
      props: { anchor: mockAnchor(), open: true, strategy: "fixed" },
      slots: { default: panelContent },
      attachTo: document.body,
    }));
    const panel = document.querySelector(".st-popper") as HTMLElement | null;
    expect(panel?.getAttribute("style")).toContain("position: fixed");
  });

  it("reflects the requested placement via data-popper-placement", () => {
    track(mount(Popper, {
      props: {
        anchor: mockAnchor(),
        open: true,
        placement: "right-start",
        flip: false,
        shift: false,
      },
      slots: { default: panelContent },
      attachTo: document.body,
    }));
    const panel = document.querySelector(".st-popper") as HTMLElement | null;
    expect(panel?.getAttribute("data-popper-placement")).toBe("right-start");
  });

  it("renders an arrow element when arrow is true", () => {
    track(mount(Popper, {
      props: { anchor: mockAnchor(), open: true, arrow: true },
      slots: { default: panelContent },
      attachTo: document.body,
    }));
    expect(document.querySelector(".st-popper__arrow")).toBeTruthy();
  });

  it("does not access the anchor's DOM rect while closed", () => {
    const getBoundingClientRect = vi.fn(
      () =>
        ({
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect,
    );
    const anchor = { getBoundingClientRect } as unknown as HTMLElement;
    track(mount(Popper, {
      props: { anchor, open: false },
      slots: { default: panelContent },
      attachTo: document.body,
    }));
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
    viewportHeight: 800,
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
    const lowAnchor = { top: 120, left: 100, right: 200, bottom: 150, width: 100, height: 30 };
    const r = computePosition(lowAnchor, 80, 60, {
      ...base,
      flip: true,
      placement: "bottom",
      viewportHeight: 180,
    });
    expect(r.placement).toBe("top");
  });

  it("does not flip when neither side fits (keeps requested placement)", () => {
    const r = computePosition(anchor, 80, 200, {
      ...base,
      flip: true,
      placement: "bottom",
      viewportHeight: 160,
    });
    expect(r.placement).toBe("bottom");
  });

  it("shifts to stay within the viewport on the cross axis", () => {
    const r = computePosition(
      { top: 10, left: 980, right: 1080, bottom: 50, width: 100, height: 40 },
      120,
      30,
      { ...base, shift: true, placement: "bottom", viewportWidth: 1000 },
    );
    expect(r.left + 120).toBeLessThanOrEqual(1000);
    expect(r.left).toBeGreaterThanOrEqual(0);
  });
});
