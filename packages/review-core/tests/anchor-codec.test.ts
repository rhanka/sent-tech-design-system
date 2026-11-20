import { describe, expect, it } from "vitest";

import {
  ANCHOR_KEY_PREFIX,
  AnchorTooLongError,
  AnchorValidationError,
  MAX_QUOTE_CONTEXT_LENGTH,
  MAX_SECTION_KEY_LENGTH,
  decodeAnchor,
  encodeAnchor,
  tryEncodeAnchor,
  type TextAnchorPayload,
} from "../src/index.js";
import {
  NEAR_CAP_CONTEXT_TRIM_ANCHOR,
  NON_ASCII_TEXT_ANCHOR,
  OVER_CAP_EMOJI_ANCHOR,
  OVER_CAP_EXACT_TRUNCATE_ANCHOR,
  SIMPLE_ELEMENT_ANCHOR,
  SIMPLE_REGION_ANCHOR,
  SIMPLE_TEXT_ANCHOR,
  UNENCODABLE_OVER_CAP_ELEMENT_ANCHOR,
  UNENCODABLE_OVER_CAP_TEXT_ANCHOR,
} from "./fixtures/anchors.js";

const BASE64URL_RE = /^[A-Za-z0-9_-]+$/;

function hasLoneSurrogate(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
      i += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }
  return false;
}

describe("DS-2 anchor encode/decode in sectionKey ('a1:' + base64url(UTF-8 JSON))", () => {
  it("should round-trip text, element, and region anchors using a1: + base64url", () => {
    expect(ANCHOR_KEY_PREFIX).toBe("a1:");
    expect(MAX_QUOTE_CONTEXT_LENGTH).toBe(32);

    for (const payload of [SIMPLE_TEXT_ANCHOR, SIMPLE_ELEMENT_ANCHOR, SIMPLE_REGION_ANCHOR]) {
      const encoded = encodeAnchor(payload);
      expect(encoded.startsWith("a1:")).toBe(true);
      expect(encoded.length).toBeLessThanOrEqual(MAX_SECTION_KEY_LENGTH);
      expect(BASE64URL_RE.test(encoded.slice(3))).toBe(true);
      expect(encoded).not.toContain("=");
      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");

      const decoded = decodeAnchor(encoded);
      expect(decoded).toEqual(payload);
    }
  });

  it("should safely round-trip non-ASCII, French punctuation, CJK, and emoji via UTF-8 TextEncoder/TextDecoder", () => {
    const encoded = encodeAnchor(NON_ASCII_TEXT_ANCHOR);
    expect(encoded.startsWith("a1:")).toBe(true);
    expect(BASE64URL_RE.test(encoded.slice(3))).toBe(true);

    const decoded = decodeAnchor(encoded);
    expect(decoded).toEqual(NON_ASCII_TEXT_ANCHOR);
  });

  it("should clamp prefix (tail <= 32) and suffix (head <= 32) by Unicode code points", () => {
    const anchor: TextAnchorPayload = {
      t: "text",
      q: {
        exact: "target",
        prefix: "0123456789".repeat(5) + "TAIL",
        suffix: "HEAD" + "abcdefghij".repeat(5),
      },
      v: "1",
    };

    const decoded = decodeAnchor(encodeAnchor(anchor)) as TextAnchorPayload;
    expect(Array.from(decoded.q.prefix ?? "").length).toBe(32);
    expect(decoded.q.prefix?.endsWith("TAIL")).toBe(true);
    expect(Array.from(decoded.q.suffix ?? "").length).toBe(32);
    expect(decoded.q.suffix?.startsWith("HEAD")).toBe(true);
  });

  it("should trim quote prefix/suffix first when near the 2048-char cap while preserving exact verbatim", () => {
    // Verify the fixture actually needs context trimming (raw > 2048, no-context <= 2048)
    const untrimmedBytes = new TextEncoder().encode(JSON.stringify(NEAR_CAP_CONTEXT_TRIM_ANCHOR));
    const untrimmedLen = 3 + Math.ceil((untrimmedBytes.length * 4) / 3);
    expect(untrimmedLen).toBeGreaterThan(MAX_SECTION_KEY_LENGTH);

    const result = tryEncodeAnchor(NEAR_CAP_CONTEXT_TRIM_ANCHOR);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.sectionKey.length).toBeLessThanOrEqual(MAX_SECTION_KEY_LENGTH);
    expect(result.truncated).toBe(true);

    const decoded = decodeAnchor(result.sectionKey) as TextAnchorPayload;
    expect(decoded.q.exact).toBe(NEAR_CAP_CONTEXT_TRIM_ANCHOR.q.exact);
    expect((decoded.q.prefix ?? "").length).toBeLessThan(32);
    expect((decoded.q.suffix ?? "").length).toBeLessThan(32);
    expect(decoded.pos).toEqual(NEAR_CAP_CONTEXT_TRIM_ANCHOR.pos);
    expect(decoded.aid).toBe(NEAR_CAP_CONTEXT_TRIM_ANCHOR.aid);
  });

  it("should drop prefix/suffix and truncate exact while keeping pos when exact exceeds the 2048-char cap", () => {
    const encoded = encodeAnchor(OVER_CAP_EXACT_TRUNCATE_ANCHOR);
    expect(encoded.length).toBeLessThanOrEqual(MAX_SECTION_KEY_LENGTH);
    expect(encoded.length).toBeGreaterThan(MAX_SECTION_KEY_LENGTH - 32);

    const decoded = decodeAnchor(encoded) as TextAnchorPayload;
    expect(decoded.q.prefix).toBeUndefined();
    expect(decoded.q.suffix).toBeUndefined();
    expect(decoded.q.exact.length).toBeGreaterThan(0);
    expect(decoded.q.exact.length).toBeLessThan(OVER_CAP_EXACT_TRUNCATE_ANCHOR.q.exact.length);
    expect(OVER_CAP_EXACT_TRUNCATE_ANCHOR.q.exact.startsWith(decoded.q.exact)).toBe(true);
    expect(decoded.pos).toEqual(OVER_CAP_EXACT_TRUNCATE_ANCHOR.pos);
    expect(decoded.sel).toBe(OVER_CAP_EXACT_TRUNCATE_ANCHOR.sel);
    expect(decoded.v).toBe(OVER_CAP_EXACT_TRUNCATE_ANCHOR.v);
  });

  it("should never split UTF-16 surrogate pairs when truncating multi-byte emoji quotes to fit 2048 chars", () => {
    const encoded = encodeAnchor(OVER_CAP_EMOJI_ANCHOR);
    expect(encoded.length).toBeLessThanOrEqual(MAX_SECTION_KEY_LENGTH);

    const decoded = decodeAnchor(encoded) as TextAnchorPayload;
    expect(hasLoneSurrogate(decoded.q.exact)).toBe(false);
    expect(decoded.q.exact.length).toBeGreaterThan(0);
    expect(Array.from(decoded.q.exact).every((ch) => ch === "🚀")).toBe(true);
    expect(decoded.pos).toEqual(OVER_CAP_EMOJI_ANCHOR.pos);
  });

  it("should refuse anchors whose minimal encoding still exceeds 2048 characters", () => {
    expect(() => encodeAnchor(UNENCODABLE_OVER_CAP_TEXT_ANCHOR)).toThrow(AnchorTooLongError);
    expect(() => encodeAnchor(UNENCODABLE_OVER_CAP_ELEMENT_ANCHOR)).toThrow(AnchorTooLongError);

    const tried = tryEncodeAnchor(UNENCODABLE_OVER_CAP_TEXT_ANCHOR);
    expect(tried.ok).toBe(false);
    if (!tried.ok && tried.code === "ANCHOR_TOO_LONG") {
      expect(tried.maxLength).toBe(MAX_SECTION_KEY_LENGTH);
      expect(tried.actualLength).toBeGreaterThan(MAX_SECTION_KEY_LENGTH);
    } else {
      throw new Error("Expected ANCHOR_TOO_LONG failure result");
    }
  });

  it("should accept an anchor at the exact maximal valid a1:+base64url length <= 2048 (2047 chars) and truncate on +1 byte", () => {
    // Unpadded base64url length is never 1 mod 4, so with 3-char 'a1:' prefix,
    // 1533 UTF-8 JSON bytes -> 3 + 2044 = 2047 chars (the tightest valid <= 2048 boundary),
    // and 1534 bytes -> 3 + 2046 = 2049 chars (> 2048, forcing truncation).
    let boundaryLen = -1;
    for (let len = 1480; len <= 1520; len++) {
      const candidate: TextAnchorPayload = { t: "text", q: { exact: "x".repeat(len) }, v: "1" };
      const res = tryEncodeAnchor(candidate);
      if (res.ok && !res.truncated && res.sectionKey.length === 2047) {
        boundaryLen = len;
        expect(decodeAnchor(res.sectionKey)).toEqual(candidate);
        break;
      }
    }
    expect(boundaryLen).toBeGreaterThan(0);

    // One additional byte crosses 2048 (would be 2049) and must truncate back <= 2048
    const plusOne = tryEncodeAnchor({ t: "text", q: { exact: "x".repeat(boundaryLen + 1) }, v: "1" });
    expect(plusOne.ok).toBe(true);
    if (plusOne.ok) {
      expect(plusOne.truncated).toBe(true);
      expect(plusOne.sectionKey.length).toBeLessThanOrEqual(MAX_SECTION_KEY_LENGTH);
      expect(plusOne.payload.t === "text" ? plusOne.payload.q.exact.length : 0).toBe(boundaryLen);
    }
  });

  it("should reject structurally invalid payloads at encode time", () => {
    expect(() =>
      encodeAnchor({ t: "text", q: { exact: "" }, v: "1" }),
    ).toThrow(AnchorValidationError);
    expect(() =>
      encodeAnchor({ t: "element", sel: "", v: "1" }),
    ).toThrow(AnchorValidationError);
    expect(() =>
      encodeAnchor({ t: "region", rect: { x: -0.1, y: 0, width: 0.5, height: 0.5 }, v: "1" }),
    ).toThrow(AnchorValidationError);
    expect(() =>
      encodeAnchor({ t: "region", rect: { x: 0.5, y: 0.5, width: 0, height: 0.2 }, v: "1" }),
    ).toThrow(AnchorValidationError);
    expect(() =>
      encodeAnchor({ t: "element", sel: "p:nth-of-type(1)", v: "" }),
    ).toThrow(AnchorValidationError);
  });

  it("should return null (never throw) when decoding malformed, unknown-version, or over-cap sectionKeys", () => {
    expect(decodeAnchor("")).toBeNull();
    expect(decodeAnchor("a2:e30")).toBeNull();
    expect(decodeAnchor("not-an-anchor")).toBeNull();
    expect(decodeAnchor("a1:!!!invalid!!!")).toBeNull();
    expect(decodeAnchor("a1:e30=")).toBeNull(); // padding '=' not allowed in canonical base64url
    expect(decodeAnchor("a1:" + "A".repeat(MAX_SECTION_KEY_LENGTH))).toBeNull();

    // Valid base64url of valid JSON, but unknown payload type
    const badJson = Buffer.from(JSON.stringify({ t: "unknown", v: "1" })).toString("base64url");
    expect(decodeAnchor(`a1:${badJson}`)).toBeNull();

    // Valid base64url of invalid UTF-8 bytes
    const badUtf8 = Buffer.from([0xff, 0xfe, 0xfd]).toString("base64url");
    expect(decodeAnchor(`a1:${badUtf8}`)).toBeNull();
  });
});
