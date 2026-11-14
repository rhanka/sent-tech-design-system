import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { readProfile, pin, sha256, studyBytes } from "../scripts/profile.mjs";

test("should pin the corrected YAML and preserve the approved r3 document", () => {
  const { raw, parsed } = readProfile();
  assert.equal(sha256(raw), pin.committed.rawSha256);
  assert.equal(sha256(studyBytes(parsed)), pin.studyReserializedSha256);
  assert.equal(pin.study.profileHash, "90aa64383475611882a57ca6a739f418dc5a4e7fba2b56df541434b65ef442de");
  assert.equal(pin.study.parsedHash, "cf1b524ce02e8a3917e2f17cfa3c8f6e0959ee429ebda01b4cb3afcef30a1fd8");
  assert.equal(pin.study.bundleDigest, "dd6298d0dce500221428f801e8d28b57584de46cc34e79b9e7880267305cd798");
  assert.equal(pin.committed.profileHash, pin.study.profileHash);
  assert.deepEqual(parsed.x_ui.bridges.relation_types.implementsUiElement.cardinality,
    { source: "0..1", target: "0..n", status: "provisional" });
});

test("should check without producing extraction artifacts", () => {
  const result = execFileSync(process.execPath, [new URL("../scripts/check.mjs", import.meta.url).pathname, "--check"], { encoding: "utf8" });
  assert.match(result, /pinned YAML and study provenance verified/);
});

test("should reproduce all digests with the released engram validator", {
  skip: process.env.ENGRAM_SOURCE_DIR ? false : "Set ENGRAM_SOURCE_DIR or run profile:verify; no validator is vendored",
}, () => {
  const result = execFileSync(process.execPath, [
    new URL("../scripts/verify-engram.mjs", import.meta.url).pathname,
    process.env.ENGRAM_SOURCE_DIR,
  ], { encoding: "utf8" });
  assert.match(result, /study and committed pins match; 0 errors, 0 warnings/);
});
