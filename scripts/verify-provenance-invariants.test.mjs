import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The provenance verifier compares each recorded entry against the file ON DISK,
// so it cannot see a corrupted UPSTREAM hash: an `adapted-*` entry whose sha256
// was overwritten with the local hash still verifies, while the reference that
// makes the ledger useful is gone. That happened in #77, on
// packages/graph/tsconfig.json, and the audit written for #83 missed it for the
// same reason. These invariants look at the ledger itself.
const ledger = JSON.parse(
  readFileSync(new URL("../docs/graph-dataviz-m1-provenance.json", import.meta.url), "utf8"),
);

test("no adapted entry records the local hash as its upstream hash", () => {
  const offenders = ledger.files
    .filter((f) => f.status?.startsWith("adapted-"))
    .filter((f) => f.sha256 && f.destinationSha256 && f.sha256 === f.destinationSha256)
    .map((f) => f.destination);
  assert.deepEqual(
    offenders,
    [],
    `an adapted entry must keep the upstream source hash in sha256 and the local state in destinationSha256:\n  ${offenders.join("\n  ")}`,
  );
});

test("every adapted entry carries both hashes and an upstream commit", () => {
  const offenders = ledger.files
    .filter((f) => f.status?.startsWith("adapted-"))
    .filter((f) => !f.sha256 || !f.destinationSha256 || !f.commit || !f.repository)
    .map((f) => f.destination);
  assert.deepEqual(offenders, [], `incomplete adapted entries:\n  ${offenders.join("\n  ")}`);
});

test("no local entry pretends to have an upstream", () => {
  const offenders = ledger.files
    .filter((f) => f.status?.startsWith("local-"))
    .filter((f) => f.destinationSha256 || f.commit || f.repository || f.source)
    .map((f) => f.destination);
  assert.deepEqual(
    offenders,
    [],
    `a monorepo-authored file has no upstream, so no commit, repository, source or destinationSha256:\n  ${offenders.join("\n  ")}`,
  );
});

test("the invariants actually see the ledger", () => {
  const adapted = ledger.files.filter((f) => f.status?.startsWith("adapted-")).length;
  const local = ledger.files.filter((f) => f.status?.startsWith("local-")).length;
  assert.ok(adapted > 0, "expected adapted entries in the ledger");
  assert.ok(local > 0, "expected local entries in the ledger");
});
