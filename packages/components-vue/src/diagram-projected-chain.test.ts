import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import {
  PROJECTED_CHAIN_TARGET_WIDTH,
  PROJECTED_CHAIN_WINDOW_HEIGHT,
} from "../../diagram-canvas/test-support/projectedChainFixture.js";
import {
  runProjectedChainFoldContract,
  type ProjectedHostMount,
} from "../../diagram-canvas/tests/host-support/projectedChainHostContract.js";
import DiagramSceneFigure from "./DiagramSceneFigure.vue";

const mounted: { unmount: () => void; container: HTMLElement }[] = [];

const mountVue: ProjectedHostMount = (props) => {
  const container = document.createElement("div");
  document.body.append(container);
  const view = mount(DiagramSceneFigure, { props, attachTo: container });
  mounted.push({ unmount: () => view.unmount(), container });
  return { container };
};

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("MutationObserver", class { observe() {} disconnect() {} takeRecords() { return []; } });
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("innerHeight", PROJECTED_CHAIN_WINDOW_HEIGHT);
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => PROJECTED_CHAIN_TARGET_WIDTH,
  });
});

afterEach(() => {
  for (const view of mounted.splice(0)) {
    view.unmount();
    view.container.remove();
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
});

describe("DiagramSceneFigure projected chain E1 — Vue fold and SVG parity", () => {
  it("should match renderSceneSvg and fold/unfold inner and outer zones live with relayout, link re-routing, depth restamping and legend update", async () => {
    await runProjectedChainFoldContract(mountVue, nextTick, "Vue");
  });
});
