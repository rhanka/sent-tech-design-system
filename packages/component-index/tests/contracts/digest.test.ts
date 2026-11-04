import { describe, expect, it } from "vitest";

import {
  canonicalizeJson,
  contractDigest,
  contractsRevision,
  entryDigest,
  indexRevision,
  taggedDigest,
} from "../../src/generator/digest.js";
import { CONTRACT_DIGEST_TAG, CONTRACT_INDEX_DIGEST_TAG } from "../../src/generator/constants.js";

// K1b vectors (spec section 4). Expected digests were computed with the
// independent node:crypto oracle (scratch, never the generator module):
// key-order twins collide, array order differs, one unicode case, one
// contract-shaped case. Tags are the frozen-shape new domains of section 4.
const C1 = { componentId: "button", contractSource: "derived", producerId: "sentropic-ds" };
const C1_DIGEST = "sha256:e41a0d5e549fb1260571db319c003447ddfb8933a48c486be86a432c68f1c696";
const C1_CANONICAL = '{"componentId":"button","contractSource":"derived","producerId":"sentropic-ds"}';

const C1B = { producerId: "sentropic-ds", contractSource: "derived", componentId: "button" };

const C3A = { slots: ["children", "footer"] };
const C3A_DIGEST = "sha256:4a6c97d7d32591f93d5e34dd9fe4c99b9f1c470a1e7b62035461b96cc32a0e34";
const C3B = { slots: ["footer", "children"] };
const C3B_DIGEST = "sha256:26d63af0dc34d3fe3e4f5f54e10f46de051661a0be472240419417913720ff3b";

const C4 = {
  description: { en: "Contract for the modal dialog", fr: "Contrat de la boîte de dialogue — été, où, façade" },
};
const C4_DIGEST = "sha256:eac8884c28658509286177defe7acdb1af228038c606cf7bb941eae3017efbcc";

const C5 = {
  componentId: "modal",
  contractSource: "derived",
  frameworks: {
    angular: { status: "complete" },
    react: { status: "partial" },
    svelte: { status: "complete" },
    vue: { status: "complete" },
  },
  producerId: "sentropic-ds",
};
const C5_DIGEST = "sha256:44e595f9e2e6fb1885033a54282e2a919076977a8279111d2e42b4cb1f255cea";
const C5_CANONICAL =
  '{"componentId":"modal","contractSource":"derived","frameworks":{"angular":{"status":"complete"},"react":{"status":"partial"},"svelte":{"status":"complete"},"vue":{"status":"complete"}},"producerId":"sentropic-ds"}';

describe("K1b contract digest vectors", () => {
  it("tags are the frozen section 4 domains", () => {
    expect(CONTRACT_DIGEST_TAG).toBe("sentropic.ds.component-contract/v1");
    expect(CONTRACT_INDEX_DIGEST_TAG).toBe("sentropic.ds.component-contract-index/v1");
  });

  it("C1 canonical form and digest match byte-for-byte", () => {
    expect(canonicalizeJson(C1)).toBe(C1_CANONICAL);
    expect(taggedDigest(C1, CONTRACT_DIGEST_TAG)).toBe(C1_DIGEST);
    expect(contractDigest(C1)).toBe(C1_DIGEST);
  });

  it("C1B (key order) collides with C1", () => {
    expect(canonicalizeJson(C1B)).toBe(C1_CANONICAL);
    expect(contractDigest(C1B)).toBe(C1_DIGEST);
  });

  it("C3A and C3B differ by array order only", () => {
    expect(taggedDigest(C3A, CONTRACT_DIGEST_TAG)).toBe(C3A_DIGEST);
    expect(taggedDigest(C3B, CONTRACT_DIGEST_TAG)).toBe(C3B_DIGEST);
    expect(contractDigest(C3A)).not.toBe(contractDigest(C3B));
  });

  it("C4 unicode digest matches", () => {
    expect(contractDigest(C4)).toBe(C4_DIGEST);
  });

  it("C5 contract-shaped digest matches", () => {
    expect(canonicalizeJson(C5)).toBe(C5_CANONICAL);
    expect(contractDigest(C5)).toBe(C5_DIGEST);
  });

  it("contract and index tags never collide on the same value", () => {
    const value = { componentId: "button" };
    expect(contractDigest(value)).not.toBe(taggedDigest(value, CONTRACT_INDEX_DIGEST_TAG));
    expect(contractDigest(value)).not.toBe(entryDigest(value));
    expect(taggedDigest(value, CONTRACT_INDEX_DIGEST_TAG)).not.toBe(indexRevision([], "sentropic-ds"));
  });

  it("contractsRevision covers the row set and producer", () => {
    const rows = [{ componentId: "button", contractDigest: contractDigest(C1) }];
    const revision = contractsRevision(rows, "sentropic-ds");
    expect(revision).toBe("sha256:cd71a5941400211bd449fde3f00fa3c35033f9692bc7f1cbc29670ea9abe54d7");
    expect(contractsRevision([], "sentropic-ds")).not.toBe(revision);
  });
});
