import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { render, cleanup } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import {
  createDocument,
  createProcessFlowExtension,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  documentRef,
  entityRef,
  enumeration,
  m3ProfileRegistry,
  PROCESS_PROFILE_ID,
  quantity,
  relationRef,
  shippedExecutorBindings,
  text,
  type SemanticDocument,
} from "../../diagram-core/dist/index.js";
import { renderProcessTable } from "../../diagram-canvas/dist/index.js";
import { renderSceneSvg } from "../../diagram-canvas/dist/presentation/renderSceneSvg.js";
import { cardLineMeasurer } from "./diagramCardModel.js";
import VueFigure from "./DiagramSceneFigure.vue";
import SvelteFigure from "../../components-svelte/src/lib/DiagramSceneFigure.svelte";
import type { DiagramSceneFigureProps } from "./DiagramSceneFigure.types.js";
import { withControlIconTokens } from "./test-support/control-icon-contract.js";

afterEach(cleanup);

function dom(node: Element): unknown {
  const attributes = [...node.attributes]
    .map((a) => {
      if (a.name === "class") {
        return [a.name, a.value.split(/\s+/).filter((c) => !c.startsWith("svelte-")).sort().join(" ")];
      }
      if (a.name === "style") {
        const s = (node as HTMLElement).style;
        return [a.name, Array.from({ length: s.length }, (_, i) => s.item(i)).sort().map((k) => [k, s.getPropertyValue(k).trim()])];
      }
      return [a.name, a.value.replace(/diagram-arrow-[^\s)]+/g, "diagram-arrow-instance")];
    })
    .filter(([name, value]) => !String(name).startsWith("data-v-") && !(name === "class" && !value))
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  return {
    tag: node.tagName,
    attributes,
    children: [...node.childNodes].flatMap((n) =>
      n.nodeType === 1
        ? [dom(n as Element)]
        : n.nodeType === 3 && n.textContent?.trim()
          ? [n.textContent.replace(/\s+/g, " ").trim()]
          : [],
    ),
  };
}

function processFixture(): SemanticDocument {
  const base = createDocument({ documentId: documentRef("process-parity"), profileRefs: [PROCESS_PROFILE_ID] });
  return {
    ...base,
    entities: {
      "entity:l1": { id: entityRef("l1"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Intake Desk"), order: quantity(0, "index") } },
      "entity:l2": { id: entityRef("l2"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Review Desk"), order: quantity(1, "index") } },
      "entity:s1": { id: entityRef("s1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Submit"), kind: enumeration("start") } },
      "entity:s2": { id: entityRef("s2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Decision"), kind: enumeration("decision") } },
      "entity:s3": { id: entityRef("s3"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Done"), kind: enumeration("end") } },
    },
    relations: {
      "relation:l1.s1": { id: relationRef("l1.s1"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l1") }, { role: "step", target: entityRef("s1") }], attributes: {} },
      "relation:l2.s2": { id: relationRef("l2.s2"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l2") }, { role: "step", target: entityRef("s2") }], attributes: {} },
      "relation:l2.s3": { id: relationRef("l2.s3"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l2") }, { role: "step", target: entityRef("s3") }], attributes: {} },
      "relation:s1.s2": { id: relationRef("s1.s2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s1") }, { role: "target", target: entityRef("s2") }], attributes: { label: text("Route") } },
      "relation:s2.s1": { id: relationRef("s2.s1"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s2") }, { role: "target", target: entityRef("s1") }], attributes: { label: text("Retry"), kind: enumeration("retry") } },
      "relation:s2.s3": { id: relationRef("s2.s3"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s2") }, { role: "target", target: entityRef("s3") }], attributes: { label: text("Approve"), emphasis: enumeration("emphasis") } },
    },
    extensions: [createProcessFlowExtension({ direction: "LR" })],
  };
}

describe("process@1 Svelte / Vue / static SVG parity (L1e)", () => {
  it("renders identical DOM, geometry, and step table across Svelte, Vue, and renderSceneSvg", async () => {
    const doc = processFixture();
    const presentation = {
      contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
      entities: {},
      legends: {},
      categoryTokens: [],
    };
    const props = {
      document: doc,
      presentation,
      registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
      bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
      measureLines: cardLineMeasurer(),
      title: "Parity process",
    };

    const vue = mount(VueFigure, { props, attachTo: document.body });
    const svelte = render(SvelteFigure, props);
    try {
      await nextTick();
      await tick();

      expect(vue.findAll('[data-scene-kind="process"]')).toHaveLength(5);
      expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.querySelector("figure")!)));
      expect(vue.find(".st-diagramProcess-fallback").html()).toContain("Process steps and transitions");
      expect(vue.findAll(".st-diagramProcess-fallback tbody tr")).toHaveLength(3);

      const staticRendered = renderSceneSvg({
        document: doc,
        presentation,
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
        measureLines: cardLineMeasurer(),
        collapsed: [],
      });
      const svgParser = new DOMParser().parseFromString(staticRendered.svg, "image/svg+xml");
      const staticBoxes = [...svgParser.querySelectorAll(".st-diagramProcessBox")];
      const staticLanes = [...svgParser.querySelectorAll(".st-diagramProcessLane")];
      const hostBoxes = [...vue.element.querySelectorAll(".st-diagramProcessBox")];
      const hostLanes = [...vue.element.querySelectorAll(".st-diagramProcessLane")];
      expect(hostBoxes).toHaveLength(staticBoxes.length);
      expect(hostLanes).toHaveLength(staticLanes.length);
      expect(vue.findAll("[data-scene-edge]")).toHaveLength(staticRendered.scene.edges.length);
      expect(staticRendered.svg).toContain('data-edge-stroke="dashed"');
      expect(vue.find('[data-edge-stroke="dashed"]').exists()).toBe(true);
      expect(renderProcessTable(doc)).toContain("Intake Desk");
      expect(svgParser.documentElement.getAttribute("data-display-scale")).toBe("1");
      expect(vue.element.getAttribute("data-zoom")).toBe("1");
      expect(svelte.container.querySelector("figure")!.getAttribute("data-zoom")).toBe("1");
      expect(vue.element.getAttribute("data-zoom-readout")).toBe("100");
      expect(svelte.container.querySelector("figure")!.getAttribute("data-zoom-readout")).toBe("100");
    } finally {
      vue.unmount();
    }
  });

  it("renders process@1 at 1:1 (maxDisplayScale: 1 and non-16:9 height) even with theme 0.62 token and tall TB flows", async () => {
    const base = createDocument({ documentId: documentRef("process-tb-tall"), profileRefs: [PROCESS_PROFILE_ID] });
    const tbDoc: SemanticDocument = {
      ...base,
      entities: {
        "entity:s1": { id: entityRef("s1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Step 1") } },
        "entity:s2": { id: entityRef("s2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Step 2") } },
        "entity:s3": { id: entityRef("s3"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Step 3") } },
        "entity:s4": { id: entityRef("s4"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Step 4") } },
        "entity:s5": { id: entityRef("s5"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Step 5") } },
      },
      relations: {
        "relation:s1.s2": { id: relationRef("s1.s2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s1") }, { role: "target", target: entityRef("s2") }], attributes: {} },
        "relation:s2.s3": { id: relationRef("s2.s3"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s2") }, { role: "target", target: entityRef("s3") }], attributes: {} },
        "relation:s3.s4": { id: relationRef("s3.s4"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s3") }, { role: "target", target: entityRef("s4") }], attributes: {} },
        "relation:s4.s5": { id: relationRef("s4.s5"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s4") }, { role: "target", target: entityRef("s5") }], attributes: {} },
      },
      extensions: [createProcessFlowExtension({ direction: "TB" })],
    };
    const presentation = {
      contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
      entities: {},
      legends: {},
      categoryTokens: [],
    };
    const prevToken = document.documentElement.style.getPropertyValue("--st-component-diagramScene-maxDisplayScale");
    document.documentElement.style.setProperty("--st-component-diagramScene-maxDisplayScale", "0.62");
    const props = {
      document: tbDoc,
      presentation,
      registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
      bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
      measureLines: cardLineMeasurer(),
      targetWidth: 640,
      title: "Tall TB process",
    };
    const vue = mount(VueFigure, { props, attachTo: document.body });
    const svelte = render(SvelteFigure, props);
    try {
      await nextTick();
      await tick();
      expect(vue.element.getAttribute("data-zoom")).toBe("1");
      expect(svelte.container.querySelector("figure")!.getAttribute("data-zoom")).toBe("1");
      expect(vue.element.getAttribute("data-zoom-readout")).toBe("100");
      expect(svelte.container.querySelector("figure")!.getAttribute("data-zoom-readout")).toBe("100");
      expect(vue.vm.getCamera().maxZoom).toBe(1);
    } finally {
      vue.unmount();
      if (prevToken) document.documentElement.style.setProperty("--st-component-diagramScene-maxDisplayScale", prevToken);
      else document.documentElement.style.removeProperty("--st-component-diagramScene-maxDisplayScale");
    }
  });

  it("keeps existing v1/v2 scenes byte-unchanged with no process table fallback", async () => {
    const base = createDocument({ documentId: documentRef("legacy-v1-v2"), profileRefs: ["generic@2"] });
    const doc: SemanticDocument = {
      ...base,
      entities: {
        "entity:a": { id: entityRef("a"), profile: "generic@2", type: "node", attributes: { name: text("Alpha") } },
        "entity:b": { id: entityRef("b"), profile: "generic@2", type: "node", attributes: { name: text("Beta") } },
      },
      relations: {
        "relation:a.b": { id: relationRef("a.b"), profile: "generic@2", type: "link", endpoints: [{ role: "source", target: entityRef("a") }, { role: "target", target: entityRef("b") }], attributes: { label: text("calls") } },
      },
    };
    const presentation = {
      contractPin: DIAGRAM_PRESENTATION_CONTRACT_PIN,
      entities: {
        "occurrence:e.a": { form: "card" as const, text: { title: "Alpha" } },
        "occurrence:e.b": { form: "card" as const, text: { title: "Beta" } },
      },
      legends: {},
      categoryTokens: [],
    };
    const props = {
      document: doc,
      presentation,
      registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
      bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
      measureLines: cardLineMeasurer(),
    };
    const vue = mount(VueFigure, { props, attachTo: document.body });
    const svelte = render(SvelteFigure, props);
    try {
      await nextTick();
      await tick();
      expect(vue.find(".st-diagramProcess-fallback").exists()).toBe(false);
      expect(svelte.container.querySelector(".st-diagramProcess-fallback")).toBeNull();
      const domNorm = (node: Element) => JSON.parse(JSON.stringify(dom(node)).replace(/"(?:c\d+|v-\d+)(?=["-])/g, '"host'));
      expect(domNorm(vue.element)).toEqual(domNorm(withControlIconTokens(svelte.container.querySelector("figure")!)));
      const svg1 = renderSceneSvg({ ...props, collapsed: [] }).svg;
      const svg2 = renderSceneSvg({ ...props, collapsed: [] }).svg;
      expect(svg1).toBe(svg2);
      expect(svg1).not.toContain("st-diagramProcessBox");
    } finally {
      vue.unmount();
    }
  });
});
