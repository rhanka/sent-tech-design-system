/**
 * Content hashing, with NO dependency and NO node builtin.
 *
 * WHAT THIS IS: a 64-bit FNV-1a over the UTF-8 bytes of a string, printed as
 * `fnv1a64:<16 hex digits>`. It is stable across processes and platforms, and it
 * is what makes drift in preserved extensions and resources DETECTABLE.
 *
 * WHAT THIS IS NOT: cryptographic. It is trivially collidable by an adversary
 * and must never gate trust. The package cannot use `node:crypto` (it must load
 * in a browser too) and takes no dependency, so a real digest would have to be
 * implemented here; that belongs to the codecs lot (GD-M4), which is where a
 * hash actually crosses a trust boundary. The prefix names the algorithm so a
 * stored hash stays readable when a stronger one is added next to it.
 */

const OFFSET_BASIS = 0xcbf2_9ce4_8422_2325n;
const PRIME = 0x0000_0100_0000_01b3n;
const MASK = 0xffff_ffff_ffff_ffffn;

/** UTF-8 bytes of a string, without TextEncoder (which is not in `lib: ES2022`). */
function utf8Bytes(text: string): readonly number[] {
  const bytes: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    let codePoint = text.charCodeAt(index);
    // Surrogate pair: combine into one code point, exactly as UTF-8 requires.
    if (codePoint >= 0xd800 && codePoint <= 0xdbff && index + 1 < text.length) {
      const low = text.charCodeAt(index + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        codePoint = (codePoint - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
        index += 1;
      }
    }
    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }
  return bytes;
}

export const HASH_ALGORITHM = "fnv1a64" as const;

/** `fnv1a64:<hex>`; the prefix is part of the value, so the algorithm is never guessed. */
export function hashContent(content: string): string {
  let hash = OFFSET_BASIS;
  for (const byte of utf8Bytes(content)) {
    hash = ((hash ^ BigInt(byte)) * PRIME) & MASK;
  }
  return `${HASH_ALGORITHM}:${hash.toString(16).padStart(16, "0")}`;
}

export const isHashOf = (content: string, hash: string): boolean => hashContent(content) === hash;
