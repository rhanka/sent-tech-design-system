import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  entityRef,
  lowerLayoutHintsV2,
  m3ProfileRegistry,
  occurrenceRef,
  shippedExecutorBindings,
  type DiagramPresentation,
  type DsLayoutHintsV2,
  type OccurrenceRef,
  type SemanticDocument,
} from "@sentropic/diagram-core";

export interface StackedZonesWidenedOptions {
  /** Use `align: "stretch"` on the column stacks to trigger validation/layout refusal. */
  readonly stretchColumnStacks?: boolean;
  /** Place nested sub-zones in auto-pack (run.stretch) instead of an explicit inner staged grid. */
  readonly nestedAutoPack?: boolean;
}

export function stackedZonesWidenedFixture(options: StackedZonesWidenedOptions = {}) {
  const stackAlign = options.stretchColumnStacks ? ({ align: "stretch" } as const) : {};
  const hintsV2: DsLayoutHintsV2 = {
    vocabulary: "ds-layout-hints@2",
    mode: "stage-columns",
    grids: {
      root: {
        stage_columns: ["col-main", "col-side"],
        transverse_bands: [
          { id: "b1", items: [entityRef("zone-one"), entityRef("side-card")] },
          { id: "b2", items: [entityRef("zone-two")] },
          { id: "b3", items: [entityRef("zone-three")] },
          { id: "b4", items: [entityRef("zone-nested")] },
        ],
        cells: {
          [entityRef("zone-one")]: { column: "col-main" },
          [entityRef("side-card")]: { column: "col-side" },
          [entityRef("zone-two")]: { column: "col-main" },
          [entityRef("zone-three")]: { column: "col-main" },
          [entityRef("zone-nested")]: { column: "col-main" },
        },
      },
      ...(options.nestedAutoPack
        ? {}
        : {
            [entityRef("zone-nested")]: {
              stage_columns: ["sub-col"],
              transverse_bands: [
                { id: "sb1", items: [entityRef("sub-narrow")] },
                { id: "sb2", items: [entityRef("sub-wide")] },
              ],
              cells: {
                [entityRef("sub-narrow")]: { column: "sub-col" },
                [entityRef("sub-wide")]: { column: "sub-col" },
              },
            },
          }),
    },
    stacks: {
      [entityRef("zone-one")]: { axis: "column", ...stackAlign },
      [entityRef("zone-two")]: { axis: "column", ...stackAlign },
      [entityRef("zone-three")]: { axis: "column", ...stackAlign },
      [entityRef("sub-narrow")]: { axis: "column", ...stackAlign },
      ...(options.nestedAutoPack ? {} : { [entityRef("sub-wide")]: { axis: "row" } }),
    },
  };

  const document: SemanticDocument = {
    documentId: "document:generic-stacked-zones-widened" as SemanticDocument["documentId"],
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: ["generic@2"],
    typeDefinitions: {},
    entities: {
      "entity:zone-one": { id: entityRef("zone-one"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Single Card Zone" } } },
      "entity:c1": { id: entityRef("c1"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Alpha" } } },
      "entity:zone-two": { id: entityRef("zone-two"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Two Cards Zone" } } },
      "entity:c2": { id: entityRef("c2"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Beta" } } },
      "entity:c3": { id: entityRef("c3"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Gamma" } } },
      "entity:zone-three": { id: entityRef("zone-three"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Three Cards Zone" } } },
      "entity:c4": { id: entityRef("c4"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Delta" } } },
      "entity:c5": { id: entityRef("c5"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Epsilon" } } },
      "entity:c6": { id: entityRef("c6"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Zeta" } } },
      "entity:zone-nested": { id: entityRef("zone-nested"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Nested Zones" } } },
      "entity:sub-narrow": { id: entityRef("sub-narrow"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Narrow Sub-Zone" } } },
      "entity:s1": { id: entityRef("s1"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Sub Card One" } } },
      "entity:sub-wide": { id: entityRef("sub-wide"), profile: "generic@2", type: "container", attributes: { name: { kind: "text", value: "Wide Sub-Zone" } } },
      "entity:s2": { id: entityRef("s2"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Sub Card Two" } } },
      "entity:s3": { id: entityRef("s3"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Sub Card Three" } } },
      "entity:side-card": { id: entityRef("side-card"), profile: "generic@2", type: "node", attributes: { name: { kind: "text", value: "Target Node" } } },
    },
    relations: {
      "relation:c.c1": { id: "relation:c.c1" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("zone-one") }, { role: "child", target: entityRef("c1") }], attributes: {} },
      "relation:c.c2": { id: "relation:c.c2" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("zone-two") }, { role: "child", target: entityRef("c2") }], attributes: {} },
      "relation:c.c3": { id: "relation:c.c3" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("zone-two") }, { role: "child", target: entityRef("c3") }], attributes: {} },
      "relation:c.c4": { id: "relation:c.c4" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("zone-three") }, { role: "child", target: entityRef("c4") }], attributes: {} },
      "relation:c.c5": { id: "relation:c.c5" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("zone-three") }, { role: "child", target: entityRef("c5") }], attributes: {} },
      "relation:c.c6": { id: "relation:c.c6" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("zone-three") }, { role: "child", target: entityRef("c6") }], attributes: {} },
      "relation:c.sub-narrow": { id: "relation:c.sub-narrow" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("zone-nested") }, { role: "child", target: entityRef("sub-narrow") }], attributes: {} },
      "relation:c.sub-wide": { id: "relation:c.sub-wide" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("zone-nested") }, { role: "child", target: entityRef("sub-wide") }], attributes: {} },
      "relation:c.s1": { id: "relation:c.s1" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("sub-narrow") }, { role: "child", target: entityRef("s1") }], attributes: {} },
      "relation:c.s2": { id: "relation:c.s2" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("sub-wide") }, { role: "child", target: entityRef("s2") }], attributes: {} },
      "relation:c.s3": { id: "relation:c.s3" as never, profile: "generic@2", type: "contains", endpoints: [{ role: "parent", target: entityRef("sub-wide") }, { role: "child", target: entityRef("s3") }], attributes: {} },
      "relation:r1": { id: "relation:r1" as never, profile: "generic@2", type: "link", endpoints: [{ role: "source", target: entityRef("c1") }, { role: "target", target: entityRef("side-card") }], attributes: { label: { kind: "text", value: "sync" } } },
      "relation:r2": { id: "relation:r2" as never, profile: "generic@2", type: "link", endpoints: [{ role: "source", target: entityRef("s1") }, { role: "target", target: entityRef("side-card") }], attributes: { label: { kind: "text", value: "feed" } } },
    },
    ports: {},
    resources: {},
    extensions: [],
  };

  const presentation: DiagramPresentation & {
    readonly entities: Readonly<Record<string, DiagramPresentation["entities"][string] & { readonly anatomy?: "v1" | "v2" }>>;
    readonly relations?: Readonly<Record<string, { readonly strokeStyle?: "solid" | "dashed" | "dotted"; readonly arrowhead?: "arrow" | "none" }>>;
  } = {
    contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    entities: {
      "occurrence:e.zone-one": { form: "container", anatomy: "v2", text: { title: "Single Card Zone" } },
      "occurrence:e.c1": { form: "card", anatomy: "v2", text: { title: "Alpha", body: "Item 1" } },
      "occurrence:e.zone-two": { form: "container", anatomy: "v2", text: { title: "Two Cards Zone" } },
      "occurrence:e.c2": { form: "card", anatomy: "v2", text: { title: "Beta", body: "Item 2" } },
      "occurrence:e.c3": { form: "card", anatomy: "v2", text: { title: "Gamma", body: "Item 3" } },
      "occurrence:e.zone-three": { form: "container", anatomy: "v2", text: { title: "Three Cards Zone" } },
      "occurrence:e.c4": { form: "card", anatomy: "v2", text: { title: "Delta", body: "Item 4" } },
      "occurrence:e.c5": { form: "card", anatomy: "v2", text: { title: "Epsilon", body: "Item 5" } },
      "occurrence:e.c6": { form: "card", anatomy: "v2", text: { title: "Zeta", body: "Item 6" } },
      "occurrence:e.zone-nested": { form: "container", anatomy: "v2", text: { title: "Nested Zones" } },
      "occurrence:e.sub-narrow": { form: "container", anatomy: "v2", text: { title: "Narrow Sub-Zone" } },
      "occurrence:e.s1": { form: "card", anatomy: "v2", text: { title: "Sub Card One", body: "Sub 1" } },
      "occurrence:e.sub-wide": { form: "container", anatomy: "v2", text: { title: "Wide Sub-Zone" } },
      "occurrence:e.s2": { form: "card", anatomy: "v2", text: { title: "Sub Card Two", body: "Sub 2" } },
      "occurrence:e.s3": { form: "card", anatomy: "v2", text: { title: "Sub Card Three", body: "Sub 3" } },
      "occurrence:e.side-card": { form: "card", anatomy: "v2", text: { title: "Target Node", body: "Sink" } },
    },
    relations: {
      "relation:r1": { strokeStyle: "solid", arrowhead: "arrow" },
      "relation:r2": { strokeStyle: "dashed", arrowhead: "arrow" },
    },
    legends: {},
    categoryTokens: [],
  };

  return {
    document,
    presentation,
    hintsV2,
    hints: lowerLayoutHintsV2(hintsV2),
    registry: m3ProfileRegistry,
    bindings: shippedExecutorBindings,
    defaultFolds: [] as readonly OccurrenceRef[],
  };
}
