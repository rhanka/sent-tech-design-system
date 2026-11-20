// Compact versioned anchor codec stored in `CommentTarget.sectionKey` (SPEC-r5 §2).
// Format: `"a1:" + base64url(utf8(JSON.stringify(payload)))`
// Hard cap: 2048 chars on the final encoded string; trims quote context first,
// then truncates `exact` while keeping `pos`; refuses minimal encodings > 2048.

import {
  MAX_SECTION_KEY_LENGTH,
  type AnchorPayload,
  type ElementAnchorPayload,
  type RegionAnchorPayload,
  type RegionRect,
  type TextAnchorPayload,
  type TextPositionSelector,
  type TextQuoteSelector,
} from "./types.js";

export const ANCHOR_KEY_PREFIX = "a1:";
export const MAX_QUOTE_CONTEXT_LENGTH = 32;

const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const BASE64URL_LOOKUP = (() => {
  const table = new Int16Array(128).fill(-1);
  for (let i = 0; i < BASE64URL_ALPHABET.length; i++) {
    table[BASE64URL_ALPHABET.charCodeAt(i)] = i;
  }
  return table;
})();

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

export class AnchorValidationError extends Error {
  readonly code = "INVALID_ANCHOR" as const;

  constructor(message: string) {
    super(message);
    this.name = "AnchorValidationError";
  }
}

export class AnchorTooLongError extends Error {
  readonly code = "ANCHOR_TOO_LONG" as const;
  readonly actualLength: number;
  readonly maxLength: number;

  constructor(actualLength: number, maxLength: number) {
    super(
      `Encoded anchor length (${actualLength}) exceeds the ${maxLength}-character sectionKey cap.`,
    );
    this.name = "AnchorTooLongError";
    this.actualLength = actualLength;
    this.maxLength = maxLength;
  }
}

export interface EncodeAnchorOptions {
  /** Override maximum encoded `sectionKey` length (defaults to 2048). */
  maxLength?: number;
}

export interface DecodeAnchorOptions {
  /** Override maximum accepted `sectionKey` length (defaults to 2048). */
  maxLength?: number;
}

export type TryEncodeAnchorResult =
  | {
      ok: true;
      sectionKey: string;
      payload: AnchorPayload;
      truncated: boolean;
    }
  | {
      ok: false;
      code: "ANCHOR_TOO_LONG";
      message: string;
      actualLength: number;
      maxLength: number;
    }
  | {
      ok: false;
      code: "INVALID_ANCHOR";
      message: string;
      maxLength: number;
    };

/** Encodes raw UTF-8 bytes to unpadded RFC 4648 §5 base64url (never uses `btoa`). */
function bytesToBase64Url(bytes: Uint8Array): string {
  const len = bytes.length;
  if (len === 0) return "";
  const chunks: string[] = [];
  let i = 0;
  for (; i + 2 < len; i += 3) {
    const n = (bytes[i]! << 16) | (bytes[i + 1]! << 8) | bytes[i + 2]!;
    chunks.push(
      BASE64URL_ALPHABET[(n >>> 18) & 63]!,
      BASE64URL_ALPHABET[(n >>> 12) & 63]!,
      BASE64URL_ALPHABET[(n >>> 6) & 63]!,
      BASE64URL_ALPHABET[n & 63]!,
    );
  }
  const rem = len - i;
  if (rem === 1) {
    const n = bytes[i]!;
    chunks.push(BASE64URL_ALPHABET[(n >>> 2) & 63]!, BASE64URL_ALPHABET[(n << 4) & 63]!);
  } else if (rem === 2) {
    const n = (bytes[i]! << 8) | bytes[i + 1]!;
    chunks.push(
      BASE64URL_ALPHABET[(n >>> 10) & 63]!,
      BASE64URL_ALPHABET[(n >>> 4) & 63]!,
      BASE64URL_ALPHABET[(n << 2) & 63]!,
    );
  }
  return chunks.join("");
}

/** Decodes canonical unpadded RFC 4648 §5 base64url into bytes, or `null` if invalid. */
function base64UrlToBytes(encoded: string): Uint8Array | null {
  const len = encoded.length;
  if (len === 0) return new Uint8Array(0);
  const rem = len % 4;
  if (rem === 1) return null;

  const fullGroups = (len - rem) / 4;
  const byteLen = fullGroups * 3 + (rem === 2 ? 1 : rem === 3 ? 2 : 0);
  const out = new Uint8Array(byteLen);

  let outIdx = 0;
  let inIdx = 0;
  for (let g = 0; g < fullGroups; g++) {
    const c0 = encoded.charCodeAt(inIdx++);
    const c1 = encoded.charCodeAt(inIdx++);
    const c2 = encoded.charCodeAt(inIdx++);
    const c3 = encoded.charCodeAt(inIdx++);
    if (c0 >= 128 || c1 >= 128 || c2 >= 128 || c3 >= 128) return null;
    const v0 = BASE64URL_LOOKUP[c0]!;
    const v1 = BASE64URL_LOOKUP[c1]!;
    const v2 = BASE64URL_LOOKUP[c2]!;
    const v3 = BASE64URL_LOOKUP[c3]!;
    if (v0 < 0 || v1 < 0 || v2 < 0 || v3 < 0) return null;
    const n = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;
    out[outIdx++] = (n >>> 16) & 0xff;
    out[outIdx++] = (n >>> 8) & 0xff;
    out[outIdx++] = n & 0xff;
  }

  if (rem === 2) {
    const c0 = encoded.charCodeAt(inIdx++);
    const c1 = encoded.charCodeAt(inIdx++);
    if (c0 >= 128 || c1 >= 128) return null;
    const v0 = BASE64URL_LOOKUP[c0]!;
    const v1 = BASE64URL_LOOKUP[c1]!;
    if (v0 < 0 || v1 < 0 || (v1 & 0x0f) !== 0) return null;
    out[outIdx++] = ((v0 << 2) | (v1 >>> 4)) & 0xff;
  } else if (rem === 3) {
    const c0 = encoded.charCodeAt(inIdx++);
    const c1 = encoded.charCodeAt(inIdx++);
    const c2 = encoded.charCodeAt(inIdx++);
    if (c0 >= 128 || c1 >= 128 || c2 >= 128) return null;
    const v0 = BASE64URL_LOOKUP[c0]!;
    const v1 = BASE64URL_LOOKUP[c1]!;
    const v2 = BASE64URL_LOOKUP[c2]!;
    if (v0 < 0 || v1 < 0 || v2 < 0 || (v2 & 0x03) !== 0) return null;
    const n = (v0 << 10) | (v1 << 4) | (v2 >>> 2);
    out[outIdx++] = (n >>> 8) & 0xff;
    out[outIdx++] = n & 0xff;
  }

  return out;
}

function encodeRaw(payload: AnchorPayload): string {
  const bytes = utf8Encoder.encode(JSON.stringify(payload));
  return ANCHOR_KEY_PREFIX + bytesToBase64Url(bytes);
}

function isValidRect(rect: unknown): rect is RegionRect {
  if (!rect || typeof rect !== "object") return false;
  const r = rect as Record<string, unknown>;
  const { x, y, width, height } = r;
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof width !== "number" ||
    typeof height !== "number"
  ) {
    return false;
  }
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
    return false;
  }
  const eps = 1e-9;
  return (
    x >= 0 &&
    y >= 0 &&
    width > 0 &&
    height > 0 &&
    x <= 1 &&
    y <= 1 &&
    x + width <= 1 + eps &&
    y + height <= 1 + eps
  );
}

function isValidPos(pos: unknown): pos is TextPositionSelector {
  if (!pos || typeof pos !== "object") return false;
  const p = pos as Record<string, unknown>;
  return (
    typeof p["start"] === "number" &&
    typeof p["end"] === "number" &&
    Number.isInteger(p["start"]) &&
    Number.isInteger(p["end"]) &&
    p["start"] >= 0 &&
    p["end"] >= p["start"]
  );
}

function validateAndSanitize(raw: unknown): { ok: true; payload: AnchorPayload } | { ok: false; message: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, message: "Anchor payload must be an object." };
  }
  const obj = raw as Record<string, unknown>;
  const v = obj["v"];
  if (typeof v !== "string" || v.length === 0) {
    return { ok: false, message: "Anchor payload requires a non-empty string version `v`." };
  }

  switch (obj["t"]) {
    case "text": {
      const qRaw = obj["q"];
      if (!qRaw || typeof qRaw !== "object") {
        return { ok: false, message: "Text anchor requires quote object `q`." };
      }
      const qObj = qRaw as Record<string, unknown>;
      if (typeof qObj["exact"] !== "string" || qObj["exact"].length === 0) {
        return { ok: false, message: "Text anchor requires non-empty `q.exact`." };
      }
      if (qObj["prefix"] !== undefined && typeof qObj["prefix"] !== "string") {
        return { ok: false, message: "Text anchor `q.prefix` must be a string." };
      }
      if (qObj["suffix"] !== undefined && typeof qObj["suffix"] !== "string") {
        return { ok: false, message: "Text anchor `q.suffix` must be a string." };
      }
      if (obj["pos"] !== undefined && !isValidPos(obj["pos"])) {
        return { ok: false, message: "Text anchor `pos` must be valid non-negative integer offsets." };
      }
      if (obj["sel"] !== undefined && (typeof obj["sel"] !== "string" || obj["sel"].length === 0)) {
        return { ok: false, message: "Text anchor `sel` must be a non-empty string when present." };
      }
      if (obj["aid"] !== undefined && (typeof obj["aid"] !== "string" || obj["aid"].length === 0)) {
        return { ok: false, message: "Text anchor `aid` must be a non-empty string when present." };
      }

      const q: TextQuoteSelector = { exact: qObj["exact"] };
      if (typeof qObj["prefix"] === "string" && qObj["prefix"].length > 0) {
        q.prefix = qObj["prefix"];
      }
      if (typeof qObj["suffix"] === "string" && qObj["suffix"].length > 0) {
        q.suffix = qObj["suffix"];
      }

      const payload: TextAnchorPayload = { t: "text", q, v };
      if (obj["pos"] !== undefined) {
        const pos = obj["pos"] as TextPositionSelector;
        payload.pos = { start: pos.start, end: pos.end };
      }
      if (typeof obj["sel"] === "string") {
        payload.sel = obj["sel"];
      }
      if (typeof obj["aid"] === "string") {
        payload.aid = obj["aid"];
      }
      return { ok: true, payload };
    }

    case "element": {
      if (typeof obj["sel"] !== "string" || obj["sel"].length === 0) {
        return { ok: false, message: "Element anchor requires non-empty `sel`." };
      }
      if (obj["aid"] !== undefined && (typeof obj["aid"] !== "string" || obj["aid"].length === 0)) {
        return { ok: false, message: "Element anchor `aid` must be a non-empty string when present." };
      }
      const payload: ElementAnchorPayload = { t: "element", sel: obj["sel"], v };
      if (typeof obj["aid"] === "string") {
        payload.aid = obj["aid"];
      }
      return { ok: true, payload };
    }

    case "region": {
      if (!isValidRect(obj["rect"])) {
        return {
          ok: false,
          message: "Region anchor `rect` must have finite coordinates inside [0, 1] with positive width and height.",
        };
      }
      const rect = obj["rect"];
      const payload: RegionAnchorPayload = {
        t: "region",
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        v,
      };
      return { ok: true, payload };
    }

    default:
      return { ok: false, message: `Unsupported anchor type: ${String(obj["t"])}` };
  }
}

function buildTextPayload(
  base: TextAnchorPayload,
  exact: string,
  prefix: string,
  suffix: string,
): TextAnchorPayload {
  const q: TextQuoteSelector = { exact };
  if (prefix.length > 0) q.prefix = prefix;
  if (suffix.length > 0) q.suffix = suffix;

  const out: TextAnchorPayload = { t: "text", q, v: base.v };
  if (base.pos !== undefined) out.pos = { start: base.pos.start, end: base.pos.end };
  if (base.sel !== undefined) out.sel = base.sel;
  if (base.aid !== undefined) out.aid = base.aid;
  return out;
}

/**
 * Attempts to encode an `AnchorPayload` into `sectionKey` (`a1:<base64url(utf8(json))>`),
 * applying SPEC-r5 §2 cap & shortening rules:
 * 1. Clamp `prefix` (tail) and `suffix` (head) to <= 32 Unicode code points.
 * 2. If final length > `maxLength` (2048): trim `prefix`/`suffix` first.
 * 3. If still > `maxLength`: drop `prefix`/`suffix` and truncate `exact` by code points
 *    while preserving `pos`, `sel`, `aid`, `v`.
 * 4. If minimal encoding still exceeds `maxLength`, return `{ ok: false, code: "ANCHOR_TOO_LONG" }`.
 */
export function tryEncodeAnchor(
  payload: AnchorPayload,
  options?: EncodeAnchorOptions,
): TryEncodeAnchorResult {
  const maxLength = options?.maxLength ?? MAX_SECTION_KEY_LENGTH;
  const validated = validateAndSanitize(payload);
  if (!validated.ok) {
    return {
      ok: false,
      code: "INVALID_ANCHOR",
      message: validated.message,
      maxLength,
    };
  }

  const clean = validated.payload;

  if (clean.t !== "text") {
    const encoded = encodeRaw(clean);
    if (encoded.length > maxLength) {
      return {
        ok: false,
        code: "ANCHOR_TOO_LONG",
        message: `Encoded anchor length (${encoded.length}) exceeds the ${maxLength}-character cap.`,
        actualLength: encoded.length,
        maxLength,
      };
    }
    return { ok: true, sectionKey: encoded, payload: clean, truncated: false };
  }

  // Normalize prefix (tail <= 32 code points) and suffix (head <= 32 code points)
  const rawPrefixCPs = Array.from(clean.q.prefix ?? "");
  const rawSuffixCPs = Array.from(clean.q.suffix ?? "");
  let truncated = false;

  const clampedPrefixCPs =
    rawPrefixCPs.length > MAX_QUOTE_CONTEXT_LENGTH
      ? ((truncated = true), rawPrefixCPs.slice(-MAX_QUOTE_CONTEXT_LENGTH))
      : rawPrefixCPs;
  const clampedSuffixCPs =
    rawSuffixCPs.length > MAX_QUOTE_CONTEXT_LENGTH
      ? ((truncated = true), rawSuffixCPs.slice(0, MAX_QUOTE_CONTEXT_LENGTH))
      : rawSuffixCPs;

  const initialPayload = buildTextPayload(
    clean,
    clean.q.exact,
    clampedPrefixCPs.join(""),
    clampedSuffixCPs.join(""),
  );
  const initialEncoded = encodeRaw(initialPayload);
  if (initialEncoded.length <= maxLength) {
    return {
      ok: true,
      sectionKey: initialEncoded,
      payload: initialPayload,
      truncated,
    };
  }

  // Stage 1: trim quote context (prefix/suffix) first while keeping exact verbatim
  const noContextPayload = buildTextPayload(clean, clean.q.exact, "", "");
  const noContextEncoded = encodeRaw(noContextPayload);
  if (noContextEncoded.length <= maxLength) {
    let low = 0;
    let high = Math.max(clampedPrefixCPs.length, clampedSuffixCPs.length);
    let bestPayload = noContextPayload;
    let bestEncoded = noContextEncoded;

    while (low <= high) {
      const mid = (low + high) >>> 1;
      const candidatePrefix =
        mid > 0 ? clampedPrefixCPs.slice(-Math.min(mid, clampedPrefixCPs.length)).join("") : "";
      const candidateSuffix =
        mid > 0 ? clampedSuffixCPs.slice(0, Math.min(mid, clampedSuffixCPs.length)).join("") : "";
      const candidatePayload = buildTextPayload(
        clean,
        clean.q.exact,
        candidatePrefix,
        candidateSuffix,
      );
      const candidateEncoded = encodeRaw(candidatePayload);
      if (candidateEncoded.length <= maxLength) {
        bestPayload = candidatePayload;
        bestEncoded = candidateEncoded;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return {
      ok: true,
      sectionKey: bestEncoded,
      payload: bestPayload,
      truncated: true,
    };
  }

  // Stage 2: prefix/suffix dropped; truncate `exact` by Unicode code points, keeping `pos`
  const exactCPs = Array.from(clean.q.exact);
  const minimalPayload = buildTextPayload(clean, exactCPs[0]!, "", "");
  const minimalEncoded = encodeRaw(minimalPayload);
  if (minimalEncoded.length > maxLength) {
    return {
      ok: false,
      code: "ANCHOR_TOO_LONG",
      message: `Minimal encoded anchor length (${minimalEncoded.length}) exceeds the ${maxLength}-character cap.`,
      actualLength: minimalEncoded.length,
      maxLength,
    };
  }

  let low = 1;
  let high = exactCPs.length - 1;
  let bestPayload = minimalPayload;
  let bestEncoded = minimalEncoded;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const candidatePayload = buildTextPayload(clean, exactCPs.slice(0, mid).join(""), "", "");
    const candidateEncoded = encodeRaw(candidatePayload);
    if (candidateEncoded.length <= maxLength) {
      bestPayload = candidatePayload;
      bestEncoded = candidateEncoded;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return {
    ok: true,
    sectionKey: bestEncoded,
    payload: bestPayload,
    truncated: true,
  };
}

/**
 * Encodes an `AnchorPayload` to `"a1:" + base64url(utf8(JSON))` within 2048 chars.
 * Throws `AnchorValidationError` on invalid input or `AnchorTooLongError` if the
 * minimal encoding still exceeds the cap.
 */
export function encodeAnchor(
  payload: AnchorPayload,
  options?: EncodeAnchorOptions,
): string {
  const result = tryEncodeAnchor(payload, options);
  if (!result.ok) {
    if (result.code === "ANCHOR_TOO_LONG") {
      throw new AnchorTooLongError(result.actualLength, result.maxLength);
    }
    throw new AnchorValidationError(result.message);
  }
  return result.sectionKey;
}

/**
 * Decodes an `"a1:" + base64url(utf8(JSON))` `sectionKey` into a validated
 * `AnchorPayload`, returning `null` (never throwing) on malformed, over-cap,
 * or unknown-version strings.
 */
export function decodeAnchor(
  sectionKey: string,
  options?: DecodeAnchorOptions,
): AnchorPayload | null {
  const maxLength = options?.maxLength ?? MAX_SECTION_KEY_LENGTH;
  if (
    typeof sectionKey !== "string" ||
    sectionKey.length === 0 ||
    sectionKey.length > maxLength ||
    !sectionKey.startsWith(ANCHOR_KEY_PREFIX)
  ) {
    return null;
  }

  const b64 = sectionKey.slice(ANCHOR_KEY_PREFIX.length);
  const bytes = base64UrlToBytes(b64);
  if (!bytes) {
    return null;
  }

  let jsonText: string;
  try {
    jsonText = utf8Decoder.decode(bytes);
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return null;
  }

  const validated = validateAndSanitize(parsed);
  return validated.ok ? validated.payload : null;
}
