import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { tick } from "svelte";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import {
  PROJECTED_CHAIN_TARGET_WIDTH,
  PROJECTED_CHAIN_WINDOW_HEIGHT,
} from "../../../diagram-canvas/test-support/projectedChainFixture.js";
import {
  runProjectedChainFoldContract,
  type ProjectedHostMount,
} from "../../../diagram-canvas/tests/host-support/projectedChainHostContract.js";
import DiagramSceneFigure from "./DiagramSceneFigure.svelte";
import VueDiagramSceneFigure from "../../../components-vue/src/DiagramSceneFigure.vue";

const mountedVue: { unmount: () => void; container: HTMLElement }[] = [];

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
  cleanup();
  for (const view of mountedVue.splice(0)) {
    view.unmount();
    view.container.remove();
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
});

const mountSvelte: ProjectedHostMount = (props) => render(DiagramSceneFigure, props);

const mountVue: ProjectedHostMount = (props) => {
  const container = document.createElement("div");
  document.body.append(container);
  const view = mount(VueDiagramSceneFigure, { props, attachTo: container });
  mountedVue.push({ unmount: () => view.unmount(), container });
  return { container };
};

describe("DiagramSceneFigure projected chain E1 — three-target parity (Svelte, Vue, renderSceneSvg) and live fold", () => {
  it("should render identical geometry, compact v2 boxes, depth surfaces, DE-2 paths and legend across Svelte, Vue and renderSceneSvg, across inner and outer live fold/unfold", async () => {
    const svelteSnapshots = await runProjectedChainFoldContract(mountSvelte, tick, "Svelte");
    cleanup();
    const vueSnapshots = await runProjectedChainFoldContract(mountVue, nextTick, "Vue");

    expect(vueSnapshots.unfolded).toEqual(svelteSnapshots.unfolded);
    expect(vueSnapshots.innerFolded).toEqual(svelteSnapshots.innerFolded);
    expect(vueSnapshots.outerFolded).toEqual(svelteSnapshots.outerFolded);
  });
});
