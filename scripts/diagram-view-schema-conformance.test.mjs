// Repository guard: view-schema @1/@2 shape matrix against the exact schemas.
//
// diagram-core stays dependency-free (its `tests/no-dom-no-deps.test.ts`
// requires a manifest with no dependency of any kind, devDependencies
// included), so the 2020-12 oracle for the exact vendored @1/@2 schemas
// lives here, at repository level, where `ajv` 8.20.0 is a root
// devDependency. This guard imports the BUILT `packages/diagram-core/dist/`
// (built first below, as `scripts/elements-catalog.test.mjs` does for
// elements) and the root-declared `ajv/dist/2020.js` with its `.js`
// extension — the extensionless deep import resolves only under a test
// runner and fails in plain Node ESM with ERR_MODULE_NOT_FOUND.
//
// Every case of the matrix moved out of
// `packages/diagram-core/tests/view-schema-conformance.test.ts` is kept:
// accepted by @2, refused by DS semantics with the native code, refused by
// @1. The DS-semantic counterparts that need no oracle stay in that
// diagram-core suite; each shape case below also asserts the native DS
// verdict where the original case did.
//
// DS evidence reused (not duplicated): diagram-core `tests/folded-view.test.ts`
// (B.4 source-valid summary, B.5 duplicate key, B.6 summary arms),
// `tests/m1c-pass2.test.ts` (C.6 negatives, B.6/B.7),
// `tests/model-shape.test.ts` (`summaryLabels` as the only optional
// top-level field), `tests/m1c-pass3-*`. The builders follow the B.4
// `foldDocument`/`foldSourceView` pattern with a two-relation scene so the
// sorted/distinct obligations are exercisable.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const diagramDir = join(repoRoot, "packages", "diagram-core");
const distIndexUrl = () => pathToFileURL(join(diagramDir, "dist", "index.js")).href;
const distPinUrl = () => pathToFileURL(join(diagramDir, "dist", "view-schema-pin.js")).href;
const genericStatePath = join(diagramDir, "fixtures", "valid", "generic-state.json");

test("view-schema guard: the diagram-core package builds before the matrix runs", () => {
  const build = spawnSync("npm", ["run", "build", "-w", "@sentropic/diagram-core"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (build.status !== 0) {
    throw new Error(`diagram-core build failed (${build.status}):\n${build.stdout}\n${build.stderr}`);
  }
});

async function loadMatrix() {
  const core = await import(distIndexUrl());
  const pin = await import(distPinUrl());
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateV2 = ajv.compile(pin.DIAGRAM_VIEW_SCHEMA_V2);
  const validateV1 = ajv.compile(pin.DIAGRAM_VIEW_SCHEMA_V1);
  return { core, pin, validateV2, validateV1 };
}

function scopedOptions(core, profiles) {
  const registry = core.createProfileRegistry(profiles);
  return {
    registry,
    bindings: {
      schemaVersion: "1",
      rows: profiles.map((profile) => core.bindingRowFor(profile, core.SCOPED_CONSTRAINTS_ADAPTER)),
    },
  };
}

function baseDocument(core, profileRefs) {
  return {
    documentId: core.documentRef("m3"),
    schemaVersion: core.CURRENT_SCHEMA_VERSION,
    revision: 0,
    profileRefs: [...profileRefs],
    typeDefinitions: {},
    entities: {},
    relations: {},
    ports: {},
    resources: {},
    extensions: [],
  };
}

function ent(core, id, profile, type, attributes = {}) {
  return { id: core.entityRef(id), profile, type, attributes };
}

function rel(core, id, profile, type, endpoints, attributes = {}) {
  return {
    id: core.relationRef(id),
    profile,
    type,
    endpoints: endpoints.map((endpoint) => ({ role: endpoint.role, target: endpoint.target })),
    attributes,
  };
}

function conformanceDocument(core) {
  const base = baseDocument(core, ["generic@2"]);
  return {
    ...base,
    revision: 1,
    entities: {
      "entity:a": ent(core, "a", "generic@2", "node", { name: { kind: "text", value: "A" } }),
      "entity:b": ent(core, "b", "generic@2", "node", { name: { kind: "text", value: "B" } }),
    },
    relations: {
      "relation:r1": rel(core, "r1", "generic@2", "link", [
        { role: "source", target: "entity:a" },
        { role: "target", target: "entity:b" },
      ]),
      "relation:r2": rel(core, "r2", "generic@2", "link", [
        { role: "source", target: "entity:a" },
        { role: "target", target: "entity:b" },
      ]),
    },
    ports: {},
  };
}

function conformanceView(core, document, summaryLabels) {
  const view = core.createView({ viewId: core.viewRef("conform"), semanticDocumentId: document.documentId });
  return {
    ...view,
    revision: document.revision,
    entityOccurrences: {
      "occurrence:a": {
        id: core.occurrenceRef("a"),
        entity: core.entityRef("a"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:b": {
        id: core.occurrenceRef("b"),
        entity: core.entityRef("b"),
        geometry: { x: 540, y: 0, width: 460, height: 200 },
      },
    },
    relationOccurrences: {
      "occurrence:o1": {
        id: core.occurrenceRef("o1"),
        relation: core.relationRef("r1"),
        endpoints: [
          { role: "source", occurrence: core.occurrenceRef("a") },
          { role: "target", occurrence: core.occurrenceRef("b") },
        ],
      },
      "occurrence:o2": {
        id: core.occurrenceRef("o2"),
        relation: core.relationRef("r2"),
        endpoints: [
          { role: "source", occurrence: core.occurrenceRef("a") },
          { role: "target", occurrence: core.occurrenceRef("b") },
        ],
      },
    },
    portOccurrences: {},
    groups: {},
    filters: [],
    ...(summaryLabels === undefined ? {} : { summaryLabels }),
  };
}

function validSummary(core) {
  return {
    "sum:ok": {
      id: "sum:ok",
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "Kept",
      relationIds: [core.relationRef("r1"), core.relationRef("r2")],
    },
  };
}

function dsCheckOf(core, view, document, id) {
  const options = scopedOptions(core, [core.generic2Profile]);
  const diagnostics = core.validateView(view, document, options);
  const entry = diagnostics.find((item) => item.path === `summaryLabels.${id}`);
  if (entry === undefined) return undefined;
  const details = entry.details;
  return details?.check ?? entry.code;
}

test("view-schema guard: compiles the exact @2 and @1 schemas with the 2020-12 oracle", async () => {
  const { pin, validateV2, validateV1 } = await loadMatrix();
  assert.equal(pin.DIAGRAM_VIEW_SCHEMA_V2["$id"], "engram:diagram-view-schema/2");
  assert.equal(pin.DIAGRAM_VIEW_SCHEMA_V1["$id"], "engram:diagram-view-schema/1");
  assert.equal(typeof validateV2, "function");
  assert.equal(typeof validateV1, "function");
});

test("view-schema guard: every DS-valid persisted view shape validates against @2", async () => {
  const { core, validateV2, validateV1 } = await loadMatrix();
  const options = scopedOptions(core, [core.generic2Profile]);
  const document = conformanceDocument(core);
  const view = conformanceView(core, document, validSummary(core));
  assert.deepEqual(core.validateView(view, document, options), []);
  assert.equal(validateV2(view), true);
  assert.equal(validateV1(view), true);
  const stored = JSON.parse(readFileSync(genericStatePath, "utf8"));
  const persisted = Object.values(stored.views);
  assert.ok(persisted.length > 0, "the persisted fixture must hold at least one view");
  for (const item of persisted) {
    assert.equal(validateV2(item), true);
  }
});

test("view-schema guard: duplicate relationIds accepted by @2, refused by DS semantics", async () => {
  const { core, validateV2 } = await loadMatrix();
  const document = conformanceDocument(core);
  const view = conformanceView(core, document, {
    "sum:dup": {
      id: "sum:dup",
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "Kept",
      relationIds: [core.relationRef("r1"), core.relationRef("r1")],
    },
  });
  assert.equal(validateV2(view), true);
  assert.equal(dsCheckOf(core, view, document, "sum:dup"), "summary-constituents-mismatch");
});

test("view-schema guard: unsorted relationIds accepted by @2, refused by DS semantics", async () => {
  const { core, validateV2 } = await loadMatrix();
  const document = conformanceDocument(core);
  const view = conformanceView(core, document, {
    "sum:unsorted": {
      id: "sum:unsorted",
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "Kept",
      relationIds: [core.relationRef("r2"), core.relationRef("r1")],
    },
  });
  assert.equal(validateV2(view), true);
  assert.equal(dsCheckOf(core, view, document, "sum:unsorted"), "summary-constituents-mismatch");
});

test("view-schema guard: empty relationOccurrences accepted by @2, refused by @1 and DS semantics", async () => {
  const { core, validateV2, validateV1 } = await loadMatrix();
  const document = conformanceDocument(core);
  const view = conformanceView(core, document, {
    "sum:empty-occ": {
      id: "sum:empty-occ",
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "Kept",
      relationIds: [core.relationRef("r1"), core.relationRef("r2")],
      relationOccurrences: [],
    },
  });
  assert.equal(validateV2(view), true);
  assert.equal(validateV1(view), false);
  assert.equal(dsCheckOf(core, view, document, "sum:empty-occ"), "summary-constituents-mismatch");
});

test("view-schema guard: empty label accepted by @2, refused by @1", async () => {
  const { core, validateV2, validateV1 } = await loadMatrix();
  const document = conformanceDocument(core);
  const view = conformanceView(core, document, {
    "sum:empty-label": {
      id: "sum:empty-label",
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "",
      relationIds: [core.relationRef("r1"), core.relationRef("r2")],
    },
  });
  assert.equal(validateV2(view), true);
  assert.equal(validateV1(view), false);
});

test("view-schema guard: duplicate source triple refused by DS semantics with summary-duplicate-key", async () => {
  const { core, validateV2 } = await loadMatrix();
  const document = conformanceDocument(core);
  const view = conformanceView(core, document, {
    "sum:one": {
      id: "sum:one",
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "One",
      relationIds: [core.relationRef("r1"), core.relationRef("r2")],
    },
    "sum:two": {
      id: "sum:two",
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "Two",
      relationIds: [core.relationRef("r1"), core.relationRef("r2")],
    },
  });
  assert.equal(validateV2(view), true);
  assert.equal(dsCheckOf(core, view, document, "sum:two"), "summary-duplicate-key");
});

test("view-schema guard: id/key disagreement refused by DS semantics with record-key-mismatch", async () => {
  const { core, validateV2 } = await loadMatrix();
  const document = conformanceDocument(core);
  const view = conformanceView(core, document, {
    "sum:key": {
      id: "sum:other",
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "Kept",
      relationIds: [core.relationRef("r1"), core.relationRef("r2")],
    },
  });
  assert.equal(validateV2(view), true);
  const options = scopedOptions(core, [core.generic2Profile]);
  const diagnostics = core.validateView(view, document, options);
  assert.equal(
    diagnostics.some((item) => item.code === "record-key-mismatch" && item.path === "summaryLabels.sum:key"),
    true,
  );
});

test("view-schema guard: empty relationIds refused by @2 shape and DS semantics", async () => {
  const { core, validateV2 } = await loadMatrix();
  const document = conformanceDocument(core);
  const view = conformanceView(core, document, {
    "sum:no-rel": {
      id: "sum:no-rel",
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "Kept",
      relationIds: [],
    },
  });
  assert.equal(validateV2(view), false);
  assert.equal(dsCheckOf(core, view, document, "sum:no-rel"), "summary-constituents-mismatch");
});

test("view-schema guard: @1-only negatives stay refused by @1", async () => {
  const { core, validateV1, validateV2 } = await loadMatrix();
  const document = conformanceDocument(core);
  const withOccurrences = conformanceView(core, document, {
    "sum:occ": {
      id: "sum:occ",
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "Kept",
      relationIds: [core.relationRef("r1")],
      relationOccurrences: [core.occurrenceRef("o1")],
    },
  });
  assert.equal(validateV1(withOccurrences), false);
  const idLess = conformanceView(core, document, {
    "sum:noid": {
      sourceOccurrence: core.occurrenceRef("a"),
      targetOccurrence: core.occurrenceRef("b"),
      label: "Kept",
      relationIds: [core.relationRef("r1")],
    },
  });
  assert.equal(validateV1(idLess), true);
  assert.equal(validateV2(idLess), false);
});
