import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mountAngularIsland } from "./angular-island";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mountAngularIsland", () => {
  it("mounts a real Angular design-system component", async () => {
    const dom = new JSDOM("<!doctype html><div id=\"host\"></div>");
    const host = dom.window.document.getElementById("host") as HTMLElement;
    vi.stubGlobal("window", dom.window);
    vi.stubGlobal("document", dom.window.document);
    vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
    vi.stubGlobal("Node", dom.window.Node);

    const handle = await mountAngularIsland(host, [
      { comp: "Button", props: { variant: "primary" }, children: ["Primary"] }
    ]);

    expect(host.querySelector("[data-st-component=\"Button\"]")?.textContent).toBe("Primary");

    handle.unmount();
    expect(host.textContent).toBe("");
  }, 20_000);
});
