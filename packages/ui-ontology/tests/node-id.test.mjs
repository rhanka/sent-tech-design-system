import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { UI_ID_PREFIX, uiNodeId } from "../dist/index.js";
import { readProfile } from "../scripts/profile.mjs";

test("should match the approved prefixes and canonical tuple for every type", () => {
  const { parsed } = readProfile();
  assert.deepEqual(UI_ID_PREFIX, parsed.x_ui.node_id.prefixes);
  assert.deepEqual(Object.keys(UI_ID_PREFIX), Object.keys(parsed.node_types));
  for (const [type, seedNames] of Object.entries(parsed.x_ui.node_id.seeds)) {
    const tuple = ["ui@1", "repo", type, ...seedNames];
    const expected = createHash("sha256").update(JSON.stringify(tuple)).digest("hex").slice(0, 32);
    assert.equal(uiNodeId("repo", type, seedNames), UI_ID_PREFIX[type] + expected);
    assert.equal(uiNodeId("repo", type, seedNames), uiNodeId("repo", type, seedNames));
    assert.notEqual(uiNodeId("repo", type, seedNames), uiNodeId("other-repo", type, seedNames));
  }
});

test("should keep delimiter, tuple-length, producer and type identities distinct", () => {
  const ids = [
    uiNodeId("repo", "Component", ["a:b", "c"]),
    uiNodeId("repo", "Component", ["a", "b:c"]),
    uiNodeId("repo", "Component", ["a", "b", "c"]),
    uiNodeId("repo", "Component", ["a", ""]),
    uiNodeId("repo", "Component", ["a"]),
    uiNodeId("repo", "Component", ["app-one", "button"]),
    uiNodeId("repo", "Component", ["app-two", "button"]),
    uiNodeId("repo", "ComposedView", ["app-one", "button"]),
    uiNodeId("repo", "Token", ["app-one", "--color"]),
    uiNodeId("repo", "Token", ["app-two", "--color"]),
  ];
  assert.equal(new Set(ids).size, ids.length);
});

test("should preserve Unicode scalar strings and reject invalid identity inputs", () => {
  assert.notEqual(uiNodeId("repo", "Icon", ["é"]), uiNodeId("repo", "Icon", ["e\u0301"]));
  assert.match(uiNodeId("repo", "Icon", ["😀", "\u0000", "\"\\"]), /^uico:[a-f0-9]{32}$/);
  assert.throws(() => uiNodeId("repo", "Unknown", []), TypeError);
  assert.throws(() => uiNodeId("repo", "toString", []), TypeError);
  assert.throws(() => uiNodeId("repo", "Icon", ["\ud800"]), TypeError);
  assert.throws(() => uiNodeId("repo", "Icon", [null]), TypeError);
});
