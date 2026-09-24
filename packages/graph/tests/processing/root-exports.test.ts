import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import * as root from "../../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const baseline: string[] = JSON.parse(
  readFileSync(join(here, "root-exports.baseline.json"), "utf8"),
);

describe("public root unchanged since main", () => {
  it("exports every symbol the main baseline exported (no removal, no rename)", () => {
    const current = new Set(Object.keys(root));
    const missing = baseline.filter((name) => !current.has(name));
    expect(missing).toEqual([]);
  });
});
