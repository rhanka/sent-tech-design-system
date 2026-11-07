import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render } from "@testing-library/svelte";
import { compileTheme } from "@sentropic/design-system-themes";
import { compile } from "svelte/compiler";
import type { ComponentProps } from "svelte";
import { describe, expect, it, vi } from "vitest";
import LassoLayer from "./LassoLayer.svelte";
import { viewerThemes } from "./fixtures.js";
import type { LassoLayerEvents, LassoLayerHostHandlers, RectDisplay } from "./types.js";

// W-1.6 — LassoLayer witness (F-L1 band geometry / inactive renders nothing,
// F-L2 HostHandler payload shape + render-only component). The lasso end/cancel
// routing lives in LassoLayerHostHandlers owned by the adapter; the component
// emits no event.

const SOURCE = readFileSync(resolve("src/lib/LassoLayer.svelte"), "utf8");
const COMPILED_CSS = compile(SOURCE, { css: "external", filename: "LassoLayer.svelte" }).css?.code ?? "";

function renderInTheme(props: ComponentProps<typeof LassoLayer>) {
  const themeRoot = document.createElement("div");
  themeRoot.setAttribute("data-st-theme", "sent-tech");
  document.body.appendChild(themeRoot);
  return { ...render(LassoLayer, { props, target: themeRoot }), themeRoot };
}

describe("W-1.6 LassoLayer (F-L1 / F-L2)", () => {
  it("F-L1 dragging: one band element at the exact rect coordinates; inactive or null rect renders nothing", () => {
    const rect: RectDisplay = { x: 12, y: 34, width: 120, height: 56 };
    const { themeRoot } = renderInTheme({ active: true, rect });

    const root = themeRoot.querySelector('[data-st-shell="lasso-layer"]') as HTMLElement;
    expect(root).toBeTruthy();
    const band = root.querySelector(".st-lassoLayer__band") as HTMLElement;
    expect(band).toBeTruthy();
    expect(band.style.left).toBe("12px");
    expect(band.style.top).toBe("34px");
    expect(band.style.width).toBe("120px");
    expect(band.style.height).toBe("56px");
    // the band is decorative: hidden from AT
    expect(band.getAttribute("aria-hidden")).toBe("true");
    // exactly one band
    expect(root.querySelectorAll(".st-lassoLayer__band").length).toBe(1);
  });

  it("F-L1 inactive / null rect: renders nothing", () => {
    const rect: RectDisplay = { x: 0, y: 0, width: 10, height: 10 };
    const a = renderInTheme({ active: false, rect });
    expect(a.themeRoot.querySelector('[data-st-shell="lasso-layer"]')).toBeNull();
    expect(a.themeRoot.childElementCount).toBe(0);
    const b = renderInTheme({ active: true, rect: null });
    expect(b.themeRoot.querySelector('[data-st-shell="lasso-layer"]')).toBeNull();
    expect(b.themeRoot.childElementCount).toBe(0);
  });

  it("F-L2: the harness invokes LassoLayerHostHandlers.onLassoEnd directly; the payload is a bare rect with exactly the keys x/y/width/height; the component emits no event", async () => {
    // host gesture layer (adapter-owned), invoked directly by the harness
    const received: RectDisplay[] = [];
    const onLassoCancel = vi.fn();
    const hostHandlers: LassoLayerHostHandlers = {
      onLassoEnd: (rect) => received.push(rect),
      onLassoCancel
    };
    hostHandlers.onLassoEnd({ x: 5, y: 6, width: 70, height: 80 });
    expect(received.length).toBe(1);
    // bare RectDisplay only — sorted keys exactly ["height","width","x","y"],
    // no candidate/block content key
    expect(Object.keys(received[0]).sort()).toEqual(["height", "width", "x", "y"]);
    hostHandlers.onLassoCancel();
    expect(onLassoCancel).toHaveBeenCalledTimes(1);

    // the component is render-only: it emits no event. Compile-time: the
    // events type admits no member (enforced by svelte-check on this file).
    // @ts-expect-error — LassoLayerEvents is Record<string, never>
    const bad: LassoLayerEvents = { onLassoEnd: () => {} };
    void bad;

    // runtime: rendering with no event props and firing pointer/keyboard
    // events on the band emits nothing and throws nothing
    const rect: RectDisplay = { x: 1, y: 2, width: 30, height: 40 };
    const { themeRoot } = renderInTheme({ active: true, rect });
    const band = themeRoot.querySelector(".st-lassoLayer__band") as HTMLElement;
    await fireEvent.pointerUp(band);
    await fireEvent.keyDown(band, { key: "Escape" });
    await fireEvent.click(band);
    // no event prop exists on the component to observe — the render above
    // mounted with only { active, rect }
    expect(themeRoot.querySelectorAll(".st-lassoLayer__band").length).toBe(1);
  });

  it("F-R1 reduced motion: the compiled component zeroes durations under the media query (band updates instantly)", () => {
    const media = COMPILED_CSS.slice(COMPILED_CSS.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(media).toContain("@media (prefers-reduced-motion: reduce)");
    expect(media).toContain("transition-duration: 0s");
    expect(media).toContain("animation-duration: 0s");
  });
});

describe("§5.4 fixture matrix — light and dark viewer themes", () => {
  it("the lasso renders in every viewer theme with the compiled theme variables scoped to the theme root", () => {
    const rect: RectDisplay = { x: 4, y: 8, width: 60, height: 24 };
    for (const theme of Object.values(viewerThemes)) {
      const themeRoot = document.createElement("div");
      themeRoot.setAttribute("data-st-theme", theme.id);
      const style = document.createElement("style");
      style.textContent = compileTheme(theme);
      themeRoot.appendChild(style);
      document.body.appendChild(themeRoot);
      expect(style.textContent, theme.id).toContain("--st-semantic-surface-raised");

      const mounted = render(LassoLayer, { target: themeRoot, props: { active: true, rect } });
      const root = themeRoot.querySelector('[data-st-shell="lasso-layer"]');
      expect(root, `theme ${theme.id}`).not.toBeNull();
      expect(root?.querySelector(".st-lassoLayer__band")).not.toBeNull();
      expect(root?.querySelector(".st-lassoLayer__fill")).not.toBeNull();

      mounted.unmount();
      expect(themeRoot.querySelector('[data-st-shell="lasso-layer"]')).toBeNull();
      themeRoot.remove();
    }
  });
});
