/**
 * M1-b immutable packaged catalog probe against the built dist entry.
 *
 * Standalone Node script (no Vitest): imports only ../dist/index.js, builds
 * the minimal generic@2 scene, attempts the public mutation bypass and
 * exits non-zero when the bypass succeeds. A Vitest wrapper invokes it so
 * the built package is covered outside the source test run. English in code.
 */
import * as core from "../dist/index.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const sha = (bytes) => core.sha256Hex(bytes);

function scene() {
  const document = {
    documentId: core.documentRef("probe"),
    schemaVersion: clone(core.CURRENT_SCHEMA_VERSION),
    revision: 0,
    profileRefs: ["generic@2"],
    typeDefinitions: {},
    entities: {
      "entity:n": {
        id: "entity:n",
        profile: "generic@2",
        type: "node",
        attributes: { name: core.text("N") },
      },
      "entity:c": {
        id: "entity:c",
        profile: "generic@2",
        type: "container",
        attributes: { name: core.text("C") },
      },
      "entity:l": {
        id: "entity:l",
        profile: "generic@2",
        type: "legend",
        attributes: { name: core.text("L") },
      },
      "entity:k": {
        id: "entity:k1",
        profile: "generic@2",
        type: "legend-key",
        attributes: { name: core.text("K"), category: core.text("risk") },
      },
      "entity:k2": {
        id: "entity:k2",
        profile: "generic@2",
        type: "legend-key",
        attributes: { name: core.text("K2"), category: core.text("risk") },
      },
    },
    relations: {},
    ports: {},
    resources: {},
    extensions: [],
  };
  const view = {
    ...core.createView({ viewId: core.viewRef("probe"), semanticDocumentId: document.documentId }),
    entityOccurrences: {
      "occurrence:n": {
        id: core.occurrenceRef("n"),
        entity: core.entityRef("n"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:c": {
        id: core.occurrenceRef("c"),
        entity: core.entityRef("c"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:l": {
        id: core.occurrenceRef("l"),
        entity: core.entityRef("l"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:k": {
        id: core.occurrenceRef("k"),
        entity: core.entityRef("k1"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:k2": {
        id: core.occurrenceRef("k2"),
        entity: core.entityRef("k2"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
    },
    relationOccurrences: {},
    presentation: {
      camera: { x: 0, y: 0, zoom: 1 },
      diagram: {
        contractPin: clone(core.DIAGRAM_PRESENTATION_CONTRACT_PIN),
        entities: {
          "occurrence:n": { form: "card", text: {}, categoryRef: core.entityRef("k1") },
          "occurrence:c": { form: "container", text: {} },
          "occurrence:l": { form: "legend", text: {} },
          "occurrence:k": { form: "legend-key", text: {} },
          "occurrence:k2": { form: "legend-key", text: {} },
        },
        legends: { "occurrence:l": { order: [core.entityRef("k1"), core.entityRef("k2")] } },
        categoryTokens: [{ legendRef: core.entityRef("l"), category: "risk", token: "st-feedback-warning" }],
      },
    },
  };
  return { document, view };
}

function scoped(document) {
  const registry = core.createProfileRegistry([core.generic2Profile]);
  return {
    registry,
    bindings: {
      schemaVersion: "1",
      rows: [core.bindingRowFor(core.generic2Profile, core.SCOPED_CONSTRAINTS_ADAPTER)],
    },
  };
}

const bytes = "export const consumerAdapter = \"consumer\";\n";
const digest = sha(bytes);
const adapterPin = { id: "consumer-adapter", version: "1", contentDigest: digest };
const consumerCatalog = {
  compatibilityAdapter: `${adapterPin.id}@${adapterPin.version}#sha256=${adapterPin.contentDigest}`,
  adapterBytes: bytes,
  schemaPin: clone(core.DIAGRAM_PRESENTATION_SCHEMA_PIN),
};

function applyWithConsumer() {
  const { document, view } = scene();
  return core.applyPresentation(
    {
      familyPins: [core.familyPinForProfile(core.generic2Profile)],
      semanticDocument: document,
      sourceView: view,
      contractPin: clone(core.DIAGRAM_PRESENTATION_CONTRACT_PIN),
      semanticCategoryPins: [],
      adapterPin,
    },
    scoped(document),
  );
}

const expectedRefusal = {
  outcome: "refused",
  diagnostics: [
    {
      code: "occurrence-endpoint-mismatch",
      severity: "error",
      path: "input.adapterPin",
      message: "diagram presentation fails check presentation-pin-mismatch",
      refs: [],
      details: { check: "presentation-pin-mismatch" },
    },
  ],
};

const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const failures = [];

const baseline = applyWithConsumer();
if (!equal(baseline, expectedRefusal)) {
  failures.push(`baseline is not the packaged refusal: ${JSON.stringify(baseline)}`);
}

const catalog = core.DIAGRAM_PRESENTATION_PACKAGED_CATALOG;
if (catalog === undefined) {
  failures.push("packaged catalog export is missing");
} else {
  if (!Object.isFrozen(catalog)) failures.push("packaged catalog export is not frozen");
  if (catalog.schemaPin !== undefined && !Object.isFrozen(catalog.schemaPin)) {
    failures.push("packaged catalog nested schemaPin is not frozen");
  }
  let threw = false;
  try {
    Object.assign(catalog, consumerCatalog);
  } catch {
    threw = true;
  }
  const afterAssign = applyWithConsumer();
  if (!equal(afterAssign, expectedRefusal)) {
    failures.push(`Object.assign bypass succeeded: ${JSON.stringify(afterAssign)} (threw=${threw})`);
  }
  let nestedThrew = false;
  try {
    catalog.compatibilityAdapter = consumerCatalog.compatibilityAdapter;
  } catch {
    nestedThrew = true;
  }
  const afterNested = applyWithConsumer();
  if (!equal(afterNested, expectedRefusal)) {
    failures.push(`nested adapter replacement bypass succeeded: ${JSON.stringify(afterNested)}`);
  }
  if (!threw && !nestedThrew) {
    failures.push("neither Object.assign nor nested adapter replacement threw on a frozen export");
  }
  try {
    Object.assign(catalog, {
      compatibilityAdapter: "transitional:ds-schema-adapter-unqualified",
      adapterBytes: undefined,
      schemaPin: clone(core.DIAGRAM_PRESENTATION_SCHEMA_PIN),
    });
  } catch {
    // Frozen exports refuse restoration; the failed mutation left no change.
  }
}

const record = core.DIAGRAM_PRESENTATION_RECORD;
if (record !== undefined) {
  if (!Object.isFrozen(record)) failures.push("contract record export is not frozen");
  try {
    record.consumers.push("entity:evil");
    failures.push("record consumers array push did not throw");
  } catch {
    // Expected on frozen data.
  }
}

const schema = core.DIAGRAM_PRESENTATION_SCHEMA;
if (schema !== undefined) {
  if (!Object.isFrozen(schema)) failures.push("schema export is not frozen");
  try {
    schema.required.push("evil");
    failures.push("schema required array push did not throw");
  } catch {
    // Expected on frozen data.
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
