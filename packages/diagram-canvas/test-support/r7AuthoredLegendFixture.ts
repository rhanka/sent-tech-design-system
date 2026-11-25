import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  entityRef,
  occurrenceRef,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import type { ScenePresentation } from "@sentropic/diagram-canvas/diagramSceneModel";

/**
 * Generic r7 fixture combining an authored `form: "legend"` zone (`legend-key`
 * children) with >= 2 distinct connector styles and one foldable functional
 * zone (`occurrence:e.zone-core`), reproducing the two-legend defect on main.
 */
export function r7AuthoredLegendFixture(folded = false) {
  const document = {
    documentId: folded ? "document:first-paint-r7-authored-legend-folded" : "document:first-paint-r7-authored-legend",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: ["generic@2"],
    typeDefinitions: {},
    entities: {
      "entity:zone-core": {
        id: "entity:zone-core",
        profile: "generic@2",
        type: "container",
        attributes: { name: { kind: "text", value: "Core" } },
      },
      "entity:alpha": {
        id: "entity:alpha",
        profile: "generic@2",
        type: "node",
        attributes: { name: { kind: "text", value: "Alpha" } },
      },
      "entity:beta": {
        id: "entity:beta",
        profile: "generic@2",
        type: "node",
        attributes: { name: { kind: "text", value: "Beta" } },
      },
      "entity:gamma": {
        id: "entity:gamma",
        profile: "generic@2",
        type: "node",
        attributes: { name: { kind: "text", value: "Gamma" } },
      },
      "entity:delta": {
        id: "entity:delta",
        profile: "generic@2",
        type: "node",
        attributes: { name: { kind: "text", value: "Delta" } },
      },
      "entity:legend": {
        id: "entity:legend",
        profile: "generic@2",
        type: "legend",
        attributes: { name: { kind: "text", value: "Domain Legend" } },
      },
      "entity:key-core": {
        id: "entity:key-core",
        profile: "generic@2",
        type: "legend-key",
        attributes: {
          name: { kind: "text", value: "Core Services" },
          category: { kind: "text", value: "brand" },
        },
      },
      "entity:key-ext": {
        id: "entity:key-ext",
        profile: "generic@2",
        type: "legend-key",
        attributes: {
          name: { kind: "text", value: "External Peers" },
          category: { kind: "text", value: "accent" },
        },
      },
    },
    relations: {
      "relation:c.alpha": {
        id: "relation:c.alpha",
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: "entity:zone-core" },
          { role: "child", target: "entity:alpha" },
        ],
        attributes: {},
      },
      "relation:c.beta": {
        id: "relation:c.beta",
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: "entity:zone-core" },
          { role: "child", target: "entity:beta" },
        ],
        attributes: {},
      },
      "relation:c.key-core": {
        id: "relation:c.key-core",
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: "entity:legend" },
          { role: "child", target: "entity:key-core" },
        ],
        attributes: {},
      },
      "relation:c.key-ext": {
        id: "relation:c.key-ext",
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: "entity:legend" },
          { role: "child", target: "entity:key-ext" },
        ],
        attributes: {},
      },
      "relation:r-solid": {
        id: "relation:r-solid",
        profile: "generic@2",
        type: "link",
        endpoints: [
          { role: "source", target: "entity:alpha" },
          { role: "target", target: "entity:beta" },
        ],
        attributes: { label: { kind: "text", value: "calls" } },
      },
      "relation:r-dashed": {
        id: "relation:r-dashed",
        profile: "generic@2",
        type: "link",
        endpoints: [
          { role: "source", target: "entity:alpha" },
          { role: "target", target: "entity:gamma" },
        ],
        attributes: { label: { kind: "text", value: "syncs" } },
      },
      "relation:r-emph": {
        id: "relation:r-emph",
        profile: "generic@2",
        type: "link",
        endpoints: [
          { role: "source", target: "entity:beta" },
          { role: "target", target: "entity:delta" },
        ],
        attributes: { label: { kind: "text", value: "critical" } },
      },
      "relation:r-forward": {
        id: "relation:r-forward",
        profile: "generic@2",
        type: "link",
        endpoints: [
          { role: "source", target: "entity:gamma" },
          { role: "target", target: "entity:delta" },
        ],
        attributes: { label: { kind: "text", value: "forwards" } },
      },
    },
    ports: {},
    resources: {},
    extensions: [],
  };
  const presentation: ScenePresentation = {
    contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    entities: {
      "occurrence:e.zone-core": {
        form: "container",
        anatomy: "v2",
        categoryRef: entityRef("key-core"),
        text: { title: "Core", subtitle: "Services" },
      },
      "occurrence:e.alpha": {
        form: "card",
        anatomy: "v2",
        categoryRef: entityRef("key-core"),
        text: { title: "Alpha", body: "Service A" },
      },
      "occurrence:e.beta": {
        form: "card",
        anatomy: "v2",
        categoryRef: entityRef("key-core"),
        text: { title: "Beta", body: "Service B" },
      },
      "occurrence:e.gamma": {
        form: "card",
        anatomy: "v2",
        categoryRef: entityRef("key-ext"),
        text: { title: "Gamma", body: "Gateway" },
      },
      "occurrence:e.delta": {
        form: "card",
        anatomy: "v2",
        categoryRef: entityRef("key-ext"),
        text: { title: "Delta", body: "Ledger" },
      },
      "occurrence:e.legend": {
        form: "legend",
        anatomy: "v2",
        text: { title: "Domain Legend" },
      },
      "occurrence:e.key-core": {
        form: "legend-key",
        text: { title: "Core Services" },
      },
      "occurrence:e.key-ext": {
        form: "legend-key",
        text: { title: "External Peers" },
      },
    },
    relations: {
      "relation:r-solid": { strokeStyle: "solid", arrowhead: "arrow" },
      "relation:r-dashed": { strokeStyle: "dashed", arrowhead: "arrow" },
      "relation:r-emph": { strokeStyle: "solid", arrowhead: "arrow", emphasis: "emphasis" },
      "relation:r-forward": { strokeStyle: "solid", arrowhead: "arrow" },
    },
    legends: {
      "occurrence:e.legend": {
        order: [entityRef("key-core"), entityRef("key-ext")],
      },
    },
    categoryTokens: [
      { legendRef: entityRef("legend"), category: "brand", token: "accent.primary" },
      { legendRef: entityRef("legend"), category: "accent", token: "accent.secondary" },
    ],
  };
  return {
    document: document as unknown as SemanticDocument,
    presentation,
    defaultFolds: folded ? [occurrenceRef("e.zone-core")] : [],
  };
}
