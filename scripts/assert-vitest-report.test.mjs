import test from "node:test";
import assert from "node:assert/strict";

import { checkReport, parseArgs } from "./assert-vitest-report.mjs";

function report(files) {
  return {
    testResults: files.map(([name, statuses, status = "passed"]) => ({
      name: `/repo/packages/graph/tests/golden/${name}`,
      status,
      assertionResults: statuses.map((s, i) => ({ fullName: `${name} #${i}`, status: s })),
    })),
  };
}

test("accepts a run where every test passed and the floors are met", () => {
  const { problems, counts } = checkReport(report([["a.test.ts", ["passed", "passed"]], ["b.test.ts", ["passed"]]]), {
    minTests: 3,
    minFiles: 2,
  });
  assert.deepEqual(problems, []);
  assert.deepEqual(counts, { files: 2, total: 3, passed: 3, failed: 0, skipped: 0 });
});

test("rejects a run with a runtime-skipped test (the ctx.skip false green)", () => {
  const { problems, counts } = checkReport(report([["shapes.test.ts", ["passed", "skipped"]]]));
  assert.equal(counts.skipped, 1);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /1 skipped/);
  assert.match(problems[0], /shapes\.test\.ts > shapes\.test\.ts #1 \[skipped\]/);
});

test("treats todo and pending as not run", () => {
  const { counts, problems } = checkReport(report([["a.test.ts", ["todo", "pending", "passed"]]]));
  assert.equal(counts.skipped, 2);
  assert.equal(problems.length, 1);
});

test("tolerates skips up to --max-skipped", () => {
  const { problems } = checkReport(report([["a.test.ts", ["skipped", "passed"]]]), { maxSkipped: 1 });
  assert.deepEqual(problems, []);
});

test("rejects an empty or shrunken run instead of passing over nothing", () => {
  const { problems } = checkReport(report([]), { minTests: 1, minFiles: 1 });
  assert.equal(problems.length, 2);
  assert.match(problems.join("\n"), /0 test file/);
  assert.match(problems.join("\n"), /0 test\(s\)/);
});

test("rejects failed tests and files that failed to import", () => {
  const { problems, counts } = checkReport(
    report([
      ["a.test.ts", ["failed", "passed"]],
      ["b.test.ts", [], "failed"],
    ]),
  );
  assert.equal(counts.failed, 2);
  assert.match(problems.join("\n"), /2 failed/);
});

test("rejects something that is not a vitest JSON report", () => {
  const { problems, counts } = checkReport({ numTotalTests: 3 });
  assert.equal(counts, null);
  assert.match(problems[0], /not a vitest JSON report/);
});

test("parses its options and refuses unknown or malformed ones", () => {
  assert.deepEqual(parseArgs(["--report=r.json", "--min-tests=120", "--min-files=6", "--max-skipped=0"]), {
    report: "r.json",
    minTests: 120,
    minFiles: 6,
    maxSkipped: 0,
  });
  assert.throws(() => parseArgs([]), /--report/);
  assert.throws(() => parseArgs(["--report=r.json", "--min-tests=abc"]), /non-negative integer/);
  assert.throws(() => parseArgs(["--report=r.json", "--bogus=1"]), /unknown option/);
  assert.throws(() => parseArgs(["r.json"]), /unexpected argument/);
});
