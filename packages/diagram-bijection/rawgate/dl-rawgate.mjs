// dl-rawgate/1 (§2.7 of SPEC_EVOL_DL01_BIJECTION_HARNESS): the raw-label gate.
// One plain ESM file, zero npm dependency (node builtins only), shared by the
// generator (src/anon/cli.ts) and the CI gate. The repository never holds raw
// labels: only HMAC-SHA-256 digests keyed by a secret, so the committed list
// reveals nothing without the key. The matched text is never printed.
//
// CLI: node rawgate/dl-rawgate.mjs scan --tree [--commits=<a>..<b>|<b>]
//        [--repo <root>] [--digests <path>]
// Exit 0 pass, 1 hit / invalid file / key mismatch / required key absent,
// 3 « not run (key absent) ».
import { createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const RAWGATE_SCHEMA = "dl-rawgate/1";

const RUN_RE = /[\p{L}\p{N}]+/gu;
const HEX64_RE = /^[0-9a-f]{64}$/;
const DIGESTS_REL_FROM_MODULE = join("rawgate", "digests.json");

function codePoints(s) {
  return [...s].length;
}

/** Maximal runs of [\p{L}\p{N}] of one line, in order. */
function lineRuns(line) {
  const runs = [];
  RUN_RE.lastIndex = 0;
  let m;
  while ((m = RUN_RE.exec(line)) !== null) runs.push(m[0]);
  return runs;
}

/**
 * §2.7 item 1: lines split on LF and numbered from 1; each line NFKC-normalised.
 * Runs of >= minWordLength code points give lower-cased `word` items; runs of
 * >= minIdLength code points give case-kept `id` items. The lower-cased runs of
 * the whole file, across line breaks, give `ngram` items: every window of n
 * consecutive runs for n in rule.ngramSizes, joined by one space. Every item
 * carries the line where its first character sits.
 */
export function tokenise(text, rule) {
  const items = [];
  const allRuns = []; // { token: lower-cased run, line }
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const norm = lines[i].normalize("NFKC");
    for (const run of lineRuns(norm)) {
      const lower = run.toLowerCase();
      allRuns.push({ token: lower, line: i + 1 });
      if (codePoints(run) >= rule.minWordLength) items.push({ kind: "word", token: lower, line: i + 1 });
      if (codePoints(run) >= rule.minIdLength) items.push({ kind: "id", token: run, line: i + 1 });
    }
  }
  for (const n of rule.ngramSizes) {
    for (let i = 0; i + n <= allRuns.length; i++) {
      items.push({
        kind: "ngram",
        token: allRuns.slice(i, i + n).map((r) => r.token).join(" "),
        line: allRuns[i].line,
      });
    }
  }
  return items;
}

/** First 32 hex of HMAC-SHA-256(K, "dl-rawgate/1\0" + class + "\0" + token). */
export function digest(key, kind, token) {
  return createHmac("sha256", key)
    .update(`${RAWGATE_SCHEMA}\u0000${kind}\u0000${token}`)
    .digest("hex")
    .slice(0, 32);
}

/** First 16 hex of HMAC-SHA-256(K, "dl-rawgate/1 key-id"). */
export function keyId(key) {
  return createHmac("sha256", key).update(`${RAWGATE_SCHEMA} key-id`).digest("hex").slice(0, 16);
}

/** K = 32 random bytes. */
export function newKey() {
  return new Uint8Array(randomBytes(32));
}

function keyFromHex(hex) {
  const t = String(hex).trim().toLowerCase();
  if (!HEX64_RE.test(t)) return null;
  return new Uint8Array(Buffer.from(t, "hex"));
}

function defaultAnonHome(env) {
  if (env.DL_ANON_HOME !== undefined && env.DL_ANON_HOME !== "" && isAbsolute(env.DL_ANON_HOME)) return env.DL_ANON_HOME;
  if (env.XDG_DATA_HOME !== undefined && env.XDG_DATA_HOME !== "" && isAbsolute(env.XDG_DATA_HOME))
    return join(env.XDG_DATA_HOME, "sentropic", "dl-anon");
  return join(env.HOME ?? "", ".local", "share", "sentropic", "dl-anon");
}

/**
 * Fail closed: the key comes from DL_RAWGATE_KEY (CI secret, hex), else
 * DL_RAWGATE_KEY_FILE, else <anon home>/rawgate/key.hex. Returns null when no
 * usable key is present (absent or malformed).
 */
export function loadKeyFromEnv(env) {
  if (env.DL_RAWGATE_KEY !== undefined && env.DL_RAWGATE_KEY !== "") return keyFromHex(env.DL_RAWGATE_KEY);
  if (env.DL_RAWGATE_KEY_FILE !== undefined && env.DL_RAWGATE_KEY_FILE !== "") {
    try {
      return keyFromHex(readFileSync(env.DL_RAWGATE_KEY_FILE, "utf8"));
    } catch {
      return null;
    }
  }
  try {
    return keyFromHex(readFileSync(join(defaultAnonHome(env), "rawgate", "key.hex"), "utf8"));
  } catch {
    return null;
  }
}

/**
 * §2.7 items 2-5: build the committed digest file.
 * R_text = words of every raw string + each whole raw string of 2..6 runs +
 * the 6-run windows of longer strings; ngramSizes = the run counts occurring in
 * R_text. R_id = case-kept runs of >= 2 code points of the raw identifiers.
 * D = (R_text \ baseline text items) ∪ (R_id \ baseline id items); digests are
 * sorted unique digest(K, class, t) over D.
 */
export function buildDigestFile(input) {
  const { key, rawStrings, rawIdentifiers, baseline } = input;
  const minWordLength = 4;
  const minIdLength = 2;
  const textTokens = new Set();
  const ngramSizesSet = new Set();
  for (const s of rawStrings) {
    const runsAll = [];
    for (const line of String(s).split("\n")) {
      for (const run of lineRuns(line.normalize("NFKC"))) {
        const lower = run.toLowerCase();
        runsAll.push(lower);
        if (codePoints(run) >= minWordLength) textTokens.add(lower);
      }
    }
    const n = runsAll.length;
    if (n >= 2 && n <= 6) {
      textTokens.add(runsAll.join(" "));
      ngramSizesSet.add(n);
    } else if (n > 6) {
      for (let i = 0; i + 6 <= n; i++) textTokens.add(runsAll.slice(i, i + 6).join(" "));
      ngramSizesSet.add(6);
    }
  }
  const ngramSizes = [...ngramSizesSet].sort((a, b) => a - b);
  const rule = { minWordLength, minIdLength, ngramSizes };
  const idTokens = new Set();
  for (const ident of rawIdentifiers) {
    for (const run of lineRuns(String(ident).normalize("NFKC"))) {
      if (codePoints(run) >= minIdLength) idTokens.add(run);
    }
  }
  const baseText = new Set();
  const baseId = new Set();
  for (const t of baseline.texts) {
    for (const item of tokenise(String(t), rule)) {
      if (item.kind === "id") baseId.add(item.token);
      else baseText.add(item.token);
    }
  }
  let baselinePresent = 0;
  const digests = new Set();
  for (const t of textTokens) {
    if (baseText.has(t)) baselinePresent++;
    else digests.add(digest(key, "text", t));
  }
  for (const t of idTokens) {
    if (baseId.has(t)) baselinePresent++;
    else digests.add(digest(key, "id", t));
  }
  const sorted = [...digests].sort();
  return {
    file: {
      schema: RAWGATE_SCHEMA,
      keyId: keyId(key),
      baselineCommit: baseline.commit,
      minWordLength,
      minIdLength,
      ngramSizes,
      count: sorted.length,
      digests: sorted,
      allow: [],
    },
    baselinePresent,
  };
}

/** "<a>..<b>" -> { base: "<a>", head: "<b>" }; "<b>" -> { base: null, head: "<b>" }. */
export function parseRange(spec) {
  const i = spec.indexOf("..");
  if (i === -1) return { base: null, head: spec.trim() };
  const base = spec.slice(0, i).trim();
  return { base, head: spec.slice(i + 2).trim() };
}

function isBinary(buf) {
  return buf.subarray(0, 8000).includes(0);
}

function ruleOf(file) {
  return { minWordLength: file.minWordLength, minIdLength: file.minIdLength, ngramSizes: file.ngramSizes };
}

function hitSort(a, b) {
  if (a.file !== b.file) return a.file < b.file ? -1 : 1;
  if (a.line !== b.line) return a.line - b.line;
  if (a.kind !== b.kind) return a.kind < b.kind ? -1 : 1;
  if (a.digestPrefix !== b.digestPrefix) return a.digestPrefix < b.digestPrefix ? -1 : 1;
  return 0;
}

/**
 * §2.7 item 6: tokenise every tracked text file of the checkout (git ls-files,
 * binary rule: a NUL in the first 8000 bytes; the digest file itself excluded),
 * digest each distinct item in its class, report a hit for any digest in
 * `digests` and not in `allow`. One hit per path, line and digest, sorted.
 */
export function scanTree(input) {
  const { key, file, repoRoot } = input;
  const rule = ruleOf(file);
  const wanted = new Set(file.digests);
  const allowed = new Set(file.allow.map((a) => a.digest));
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const selfRel = relative(repoRoot, join(moduleDir, "digests.json"));
  const list = execFileSync("git", ["-C", repoRoot, "ls-files", "-z"], { maxBuffer: 1 << 28 })
    .toString("utf8")
    .split("\0")
    .filter((e) => e.length > 0);
  const hits = [];
  let files = 0;
  for (const rel of list) {
    if (rel === selfRel || rel === DIGESTS_REL_FROM_MODULE) continue;
    let buf;
    try {
      buf = readFileSync(join(repoRoot, rel));
    } catch {
      continue;
    }
    if (isBinary(buf)) continue;
    files++;
    // §2.7 item 6: one hit per path, line and digest — the dedupe key carries
    // the line, so a token occurring on several lines is reported per line.
    const seen = new Set();
    for (const item of tokenise(buf.toString("utf8"), rule)) {
      const cls = item.kind === "id" ? "id" : "text";
      const d = digest(key, cls, item.token);
      if (!wanted.has(d) || allowed.has(d)) continue;
      const key_ = `${item.line}\u0000${d}`;
      if (seen.has(key_)) continue;
      seen.add(key_);
      hits.push({ file: rel, line: item.line, kind: item.kind, digestPrefix: d.slice(0, 8) });
    }
  }
  hits.sort(hitSort);
  return { hits, files };
}

/**
 * §2.7 item 7: scan every commit message of the range. An empty, all-zero or
 * unknown base falls back to the head alone, with a notice. The tree scan
 * always runs separately, so the content side never depends on the range.
 */
export function scanCommitMessages(input) {
  const { key, file, repoRoot, range } = input;
  const rule = ruleOf(file);
  const { base, head } = parseRange(range);
  let notice = null;
  let revRange;
  if (base === null) {
    revRange = head;
  } else {
    let okBase = base.length > 0 && !/^0+$/.test(base);
    if (okBase) {
      try {
        okBase = execFileSync("git", ["-C", repoRoot, "cat-file", "-t", base], {
          stdio: ["ignore", "pipe", "ignore"],
        })
          .toString()
          .trim() === "commit";
      } catch {
        okBase = false;
      }
    }
    if (!okBase) {
      notice = `base ${base === "" ? "(empty)" : base} is empty, all-zero or unknown: scanning ${head} alone`;
      revRange = head;
    } else {
      revRange = `${base}..${head}`;
    }
  }
  const wanted = new Set(file.digests);
  const allowed = new Set(file.allow.map((a) => a.digest));
  // A single head (explicit "<b>" or the fallback) scans that one commit only.
  const logArgs =
    revRange === head
      ? ["log", "-1", "--format=%H%x00%B%x00", head]
      : ["log", "--format=%H%x00%B%x00", revRange];
  const out = execFileSync("git", ["-C", repoRoot, ...logArgs], {
    maxBuffer: 1 << 28,
  }).toString("utf8");
  const parts = out.split("\0");
  const hits = [];
  let commits = 0;
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const sha = parts[i];
    const message = parts[i + 1];
    if (sha.length === 0) continue;
    commits++;
    // One hit per commit, line and digest (§2.7 item 6).
    const seen = new Set();
    for (const item of tokenise(message, rule)) {
      const cls = item.kind === "id" ? "id" : "text";
      const d = digest(key, cls, item.token);
      if (!wanted.has(d) || allowed.has(d)) continue;
      const key_ = `${item.line}\u0000${d}`;
      if (seen.has(key_)) continue;
      seen.add(key_);
      hits.push({ file: sha, line: item.line, kind: "commit-message", digestPrefix: d.slice(0, 8) });
    }
  }
  hits.sort(hitSort);
  return { hits, commits, notice };
}

function validateDigestFile(file) {
  if (file === null || typeof file !== "object") return "not an object";
  if (file.schema !== RAWGATE_SCHEMA) return `schema ${String(file.schema)} != ${RAWGATE_SCHEMA}`;
  if (typeof file.keyId !== "string" || !/^[0-9a-f]{16}$/.test(file.keyId)) return "keyId is not 16 hex";
  if (file.minWordLength !== 4 || file.minIdLength !== 2) return "rule constants differ from dl-rawgate/1";
  if (!Array.isArray(file.ngramSizes) || file.ngramSizes.some((n) => typeof n !== "number" || n < 1)) return "bad ngramSizes";
  if (!Array.isArray(file.digests) || file.digests.some((d) => typeof d !== "string" || !/^[0-9a-f]{32}$/.test(d))) return "bad digests";
  // §2.7: digests are ascending and unique.
  for (let i = 1; i < file.digests.length; i++) {
    if (file.digests[i - 1] >= file.digests[i]) return "digests are not ascending and unique";
  }
  if (file.count !== file.digests.length) return "count != digests.length";
  if (
    !Array.isArray(file.allow) ||
    file.allow.some((a) => typeof a?.digest !== "string" || !/^[0-9a-f]{32}$/.test(a.digest) || typeof a?.reason !== "string" || a.reason.length === 0)
  )
    return "bad allow";
  return null;
}

/**
 * §2.7: « The `reason` text must not digest to the allowed digest. » With the
 * key in hand, tokenise every allow reason and refuse when any of its tokens
 * digests to the entry's own digest or to any digest of the file — a reason
 * that carries a raw token would write that token into the repository.
 * Returns a problem description, or null when every reason is clean.
 */
export function validateAllowReasons(key, file) {
  const rule = ruleOf(file);
  const wanted = new Set(file.digests);
  for (const a of file.allow) {
    for (const item of tokenise(a.reason, rule)) {
      const cls = item.kind === "id" ? "id" : "text";
      const d = digest(key, cls, item.token);
      if (d === a.digest || wanted.has(d)) {
        return `allow entry ${a.digest.slice(0, 8)}: its reason text digests to a guarded digest (line ${item.line})`;
      }
    }
  }
  return null;
}

async function main(argv) {
  const args = argv.slice(2);
  const env = process.env;
  if (args[0] !== "scan") {
    process.stderr.write("usage: dl-rawgate.mjs scan --tree [--commits=<a>..<b>|<b>] [--repo <root>] [--digests <path>]\n");
    return 2;
  }
  const opt = (name) => {
    const i = args.indexOf(name);
    if (i !== -1) return args[i + 1];
    const prefixed = args.find((a) => a.startsWith(`${name}=`));
    return prefixed?.slice(name.length + 1);
  };
  const tree = args.includes("--tree");
  const commits = opt("--commits");
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const digestsPath = opt("--digests") ?? join(moduleDir, "digests.json");
  const repoRoot =
    opt("--repo") ??
    execFileSync("git", ["-C", moduleDir, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

  const key = loadKeyFromEnv(env);
  if (key === null) {
    if (env.DL_RAWGATE_REQUIRED === "1") {
      process.stderr.write("dl-rawgate: key absent and DL_RAWGATE_REQUIRED=1 (fail closed)\n");
      return 1;
    }
    process.stderr.write("not run (key absent)\n");
    return 3;
  }
  let file;
  try {
    file = JSON.parse(readFileSync(digestsPath, "utf8"));
  } catch (e) {
    process.stderr.write(`dl-rawgate: cannot read digests file ${digestsPath}: ${e.message}\n`);
    return 1;
  }
  const invalid = validateDigestFile(file);
  if (invalid !== null) {
    process.stderr.write(`dl-rawgate: invalid digests file: ${invalid}\n`);
    return 1;
  }
  if (keyId(key) !== file.keyId) {
    process.stderr.write("dl-rawgate: key-id mismatch (the key does not match the committed digests)\n");
    return 1;
  }
  const allowProblem = validateAllowReasons(key, file);
  if (allowProblem !== null) {
    process.stderr.write(`dl-rawgate: ${allowProblem}\n`);
    return 1;
  }

  const hits = [];
  if (tree) {
    const r = scanTree({ key, file, repoRoot });
    process.stderr.write(`tree: ${r.files} text files scanned\n`);
    hits.push(...r.hits);
  }
  if (commits !== undefined) {
    const r = scanCommitMessages({ key, file, repoRoot, range: commits });
    if (r.notice !== null && r.notice !== undefined) process.stderr.write(`commits: ${r.notice}\n`);
    process.stderr.write(`commits: ${r.commits} commit message(s) scanned\n`);
    hits.push(...r.hits);
  }
  for (const h of hits) {
    process.stdout.write(`hit ${h.file}:${h.line} kind=${h.kind} digest=${h.digestPrefix}\n`);
  }
  if (hits.length > 0) {
    process.stderr.write(`dl-rawgate: ${hits.length} hit(s); the matched text is never printed\n`);
    return 1;
  }
  process.stdout.write("pass\n");
  return 0;
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(await main(process.argv));
}
