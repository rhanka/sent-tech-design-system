import assert from "node:assert/strict";
import { readProfile, pin, sha256, studyBytes, correctedSentence } from "./profile.mjs";

if (process.argv.slice(2).some(arg => arg !== "--check")) {
  throw new Error("Usage: node scripts/check.mjs --check");
}
const { raw, parsed } = readProfile();
assert.equal(sha256(raw), pin.committed.rawSha256, "Committed YAML pin drift");
assert.equal(sha256(studyBytes(parsed)), pin.studyReserializedSha256, "Study provenance drift");
assert.equal(parsed.id, "ui");
assert.equal(parsed.version, "1");
assert.equal(Object.keys(parsed.node_types).length, 20);
assert.equal(Object.keys(parsed.relation_types).length, 30);
assert.ok(parsed.x_ui.bridges.relation_types.implementsUiElement.asserted_by.includes(correctedSentence));
console.log("ui@1: pinned YAML and study provenance verified; extraction starts in L1");
