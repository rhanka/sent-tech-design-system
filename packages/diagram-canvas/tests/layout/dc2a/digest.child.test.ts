/**
 * Child of the fresh-process determinism gate (l3.test.ts, AC-7): computes the
 * digests of the 31 views in its own Node process and, when
 * `DC2A_DIGEST_OUT` names a file, writes them there for the parent to compare.
 */
import { writeFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { sceneDigests } from "./digest.js";

describe("DC-2a determinism digests", () => {
  it("digests the 31 views", () => {
    const digests = sceneDigests();
    expect(Object.keys(digests)).toHaveLength(31);
    for (const digest of Object.values(digests)) expect(digest).toMatch(/^[0-9a-f]{16}$/);
    const out = process.env["DC2A_DIGEST_OUT"];
    if (out !== undefined && out !== "") writeFileSync(out, JSON.stringify(digests));
  }, 120_000);
});
