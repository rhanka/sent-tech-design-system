/**
 * DS-CANON-1: canonical form, domain tag, digests (spec section 5.1).
 *
 * Written directly against RFC 8785 (JCS); it must NOT import
 * `packages/elements/src/generator/canonical.ts` (spec section 5.2: that
 * canonicaliser sorts string-only arrays and would erase the array order
 * sensitivity K1a requires).
 *
 * Rules: object keys sorted by UTF-16 code units, recursively; arrays keep
 * order; numbers in ECMAScript form; strings as JSON strings encoded in
 * UTF-8; no whitespace. Non-finite numbers and non-JSON values throw.
 */
import { createHash } from "node:crypto";

import {
  CONTRACT_DIGEST_TAG,
  CONTRACT_INDEX_DIGEST_TAG,
  ENTRY_DIGEST_TAG,
  INDEX_DIGEST_TAG,
} from "./constants.js";

export function canonicalizeJson(value: unknown): string {
  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("canonicalizeJson: non-finite number is not JSON");
    }
    if (Object.is(value, -0)) return "-0";
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeJson(item)).join(",")}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value).sort();
    const body = keys
      .map((key) => {
        const member = (value as Record<string, unknown>)[key];
        if (member === undefined) {
          throw new Error(`canonicalizeJson: undefined member "${key}" is not JSON`);
        }
        return `${JSON.stringify(key)}:${canonicalizeJson(member)}`;
      })
      .join(",");
    return `{${body}}`;
  }
  throw new Error(`canonicalizeJson: ${typeof value} is not JSON`);
}

/** Raw file digest: SHA-256 over committed bytes, no domain tag. */
export function fileDigestHex(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

/** Tagged digest: SHA-256 over UTF-8(tag) || 0x00 || C(V). */
export function taggedDigest(value: unknown, tag: string): string {
  const hash = createHash("sha256");
  hash.update(tag, "utf8");
  hash.update(new Uint8Array([0]));
  hash.update(canonicalizeJson(value), "utf8");
  return `sha256:${hash.digest("hex")}`;
}

/** Entry digest: tagged digest of the entry object WITHOUT its digest. */
export function entryDigest(entryWithoutDigest: unknown): string {
  return taggedDigest(entryWithoutDigest, ENTRY_DIGEST_TAG);
}

/**
 * Index revision (spec section 5.4): tagged digest (index tag) of
 * `{entries: [rows in emitted order], producerId}`. Rows carry no revision
 * field; sourceCommit and generator version stay outside the preimage.
 */
export function indexRevision(rows: readonly unknown[], producerId: string): string {
  return taggedDigest({ entries: [...rows], producerId }, INDEX_DIGEST_TAG);
}

/** Contract digest (spec section 4): tagged digest of the contract document WITHOUT its digest. */
export function contractDigest(contractWithoutDigest: unknown): string {
  return taggedDigest(contractWithoutDigest, CONTRACT_DIGEST_TAG);
}

/**
 * Contract index revision (spec section 5.2): tagged digest
 * (contract-index tag) of `{entries: [rows in emitted order], producerId}`.
 * Rows carry no revision field; sourceCommit and generator version stay
 * outside the preimage, exactly as in the K1a index rule.
 */
export function contractsRevision(rows: readonly unknown[], producerId: string): string {
  return taggedDigest({ entries: [...rows], producerId }, CONTRACT_INDEX_DIGEST_TAG);
}
