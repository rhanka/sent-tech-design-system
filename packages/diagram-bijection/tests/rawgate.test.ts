/**
 * §2.9 W-DL0.10: the raw-label gate dl-rawgate/1 (§2.7). Canary tokens are
 * generated at test time. A planted canary word, a canary phrase split across
 * two lines, a 2-character case-sensitive canary identifier and a canary
 * commit message each fail with the expected path and line; a clean tree
 * passes; the range fallbacks each scan the head alone; a key-id mismatch
 * fails; no key with DL_RAWGATE_REQUIRED=1 exits 1, without it exits 3
 * « not run (key absent) »; an allowed digest passes.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import * as rawgate from "../rawgate/dl-rawgate.mjs";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const rawgatePath = join(pkgRoot, "rawgate", "dl-rawgate.mjs");

const tmpDirs: string[] = [];
afterEach(() => {
  while (tmpDirs.length > 0) rmSync(tmpDirs.pop() as string, { recursive: true, force: true });
});
function tempDir(): string {
  const dir = mkdtempSync(join(homedir(), ".dl0-rawgate-test-"));
  tmpDirs.push(dir);
  return dir;
}

function git(dir: string, args: string[]): string {
  return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8" }).trim();
}

interface Repo {
  dir: string;
  commits: string[];
}

function makeRepo(files: Record<string, string>, messages: string[]): Repo {
  const dir = tempDir();
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["config", "user.email", "test@example.invalid"]);
  git(dir, ["config", "user.name", "test"]);
  const commits: string[] = [];
  for (const [path, content] of Object.entries(files)) {
    writeFileSync(join(dir, path), content);
  }
  for (const message of messages) {
    git(dir, ["add", "-A"]);
    git(dir, ["commit", "-q", "--allow-empty", "-m", message]);
    commits.push(git(dir, ["rev-parse", "HEAD"]));
  }
  return { dir, commits };
}

/** Canary tokens generated at test time (random, so never in any baseline). */
function canaries(): { word: string; w1: string; w2: string; id: string; commitWord: string } {
  return {
    word: randomBytes(8).toString("hex"),
    // single code points: they join n-grams but are below both minimums, so
    // they produce no word or id item of their own
    w1: randomBytes(1).toString("hex").slice(0, 1),
    w2: randomBytes(1).toString("hex").slice(1, 2) || "q",
    id: `Z${randomBytes(1).toString("hex").toUpperCase()}`,
    commitWord: randomBytes(8).toString("hex"),
  };
}

function buildFile(key: Uint8Array, c: ReturnType<typeof canaries>, extraRawStrings: string[] = []) {
  return rawgate.buildDigestFile({
    key,
    rawStrings: [
      `intro ${c.word} outro`,
      `${c.w1}\n${c.w2}`, // 2-run raw string: gives the cross-line 2-gram
      `commit ${c.commitWord}`,
      ...extraRawStrings,
    ],
    rawIdentifiers: [c.id],
    baseline: { commit: "0".repeat(40), texts: ["nothing relevant in the baseline at all"] },
  });
}

function writeDigests(dir: string, file: rawgate.RawgateDigestFile): string {
  const p = join(dir, "digests.json");
  writeFileSync(p, `${JSON.stringify(file, null, 2)}\n`);
  return p;
}

function scanCli(args: string[], env: Record<string, string>): { status: number | null; stdout: string; stderr: string } {
  const r = spawnSync(process.execPath, [rawgatePath, ...args], { env, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

describe("W-DL0.10 tokenise / digest / parseRange", () => {
  it("tokenise splits lines on LF, numbers from 1, NFKC-normalises, and builds cross-line n-grams", () => {
    const rule: rawgate.RawgateRule = { minWordLength: 4, minIdLength: 2, ngramSizes: [2] };
    const items = rawgate.tokenise("Abcd cd\nef Gh Ij", rule);
    const word = items.find((i) => i.kind === "word" && i.token === "abcd");
    expect(word).toBeDefined();
    expect(word?.line).toBe(1);
    const id = items.find((i) => i.kind === "id" && i.token === "Gh");
    expect(id?.line).toBe(2);
    const ngram = items.find((i) => i.kind === "ngram" && i.token === "cd ef");
    expect(ngram?.line).toBe(1); // line of the first character of the window
    // runs under the minimums produce no word/id items
    expect(items.some((i) => i.token === "cd" && i.kind === "word")).toBe(false);
  });

  it("digest is 32 hex and class-separated; keyId is 16 hex", () => {
    const key = rawgate.newKey();
    expect(key.length).toBe(32);
    const d1 = rawgate.digest(key, "text", "token");
    const d2 = rawgate.digest(key, "id", "token");
    expect(d1).toMatch(/^[0-9a-f]{32}$/);
    expect(d2).toMatch(/^[0-9a-f]{32}$/);
    expect(d1).not.toBe(d2);
    expect(rawgate.keyId(key)).toMatch(/^[0-9a-f]{16}$/);
  });

  it("parseRange accepts <a>..<b> and <b>", () => {
    expect(rawgate.parseRange("aaa..bbb")).toEqual({ base: "aaa", head: "bbb" });
    expect(rawgate.parseRange("bbb")).toEqual({ base: null, head: "bbb" });
    expect(rawgate.parseRange("..bbb")).toEqual({ base: "", head: "bbb" });
  });
});

describe("W-DL0.10 scanTree hits", () => {
  it("a canary word, a cross-line phrase, a 2-char case-sensitive id each hit with path and line; the lower-case id does not", () => {
    const key = rawgate.newKey();
    const c = canaries();
    const { file } = buildFile(key, c);
    const repo = makeRepo(
      {
        "canary.txt": [
          "first line",
          `prefix ${c.id} here`, // id hit, line 2
          `the ${c.word} token`, // word hit, line 3
          c.w1, // n-gram first char on line 4
          `${c.w2} trailing`, // n-gram completes across the line break
          `lower ${c.id.toLowerCase()} no hit`, // lower-case form of the id: no hit
        ].join("\n") + "\n",
      },
      ["clean message"],
    );
    const r = rawgate.scanTree({ key, file, repoRoot: repo.dir });
    expect(r.files).toBeGreaterThan(0);
    const byKind = (kind: string) => r.hits.filter((h) => h.kind === kind);
    expect(byKind("word")).toEqual([{ file: "canary.txt", line: 3, kind: "word", digestPrefix: expect.any(String) }]);
    expect(byKind("id")).toEqual([{ file: "canary.txt", line: 2, kind: "id", digestPrefix: expect.any(String) }]);
    expect(byKind("ngram")).toEqual([{ file: "canary.txt", line: 4, kind: "ngram", digestPrefix: expect.any(String) }]);
    expect(r.hits.every((h) => h.digestPrefix.length > 0 && h.digestPrefix.length <= 32)).toBe(true);
  });

  it("a tree without canaries passes", () => {
    const key = rawgate.newKey();
    const c = canaries();
    const { file } = buildFile(key, c);
    const repo = makeRepo({ "plain.txt": "perfectly ordinary content\n" }, ["clean message"]);
    const r = rawgate.scanTree({ key, file, repoRoot: repo.dir });
    expect(r.hits).toEqual([]);
  });

  it("an allowed digest passes", () => {
    const key = rawgate.newKey();
    const c = canaries();
    const built = buildFile(key, c);
    const canaryDigest = rawgate.digest(key, "text", c.word);
    expect(built.file.digests).toContain(canaryDigest);
    const file: rawgate.RawgateDigestFile = {
      ...built.file,
      allow: [{ digest: canaryDigest, reason: "operator-cleared token (test)" }],
    };
    const repo = makeRepo({ "canary.txt": `the ${c.word} token\n` }, ["clean message"]);
    const r = rawgate.scanTree({ key, file, repoRoot: repo.dir });
    expect(r.hits).toEqual([]);
  });
});

describe("W-DL0.10 scanCommitMessages", () => {
  it("a canary commit message hits; <b>, ..<b>, all-zero base and unknown base each scan <b> alone", () => {
    const key = rawgate.newKey();
    const c = canaries();
    const { file } = buildFile(key, c);
    const repo = makeRepo({ "a.txt": "clean\n" }, ["first clean", `second ${c.commitWord}`]);
    const first = repo.commits[0] as string;
    const head = repo.commits[1] as string;
    expect(repo.commits.length).toBe(2);

    const hit = (range: string) => rawgate.scanCommitMessages({ key, file, repoRoot: repo.dir, range });

    const full = hit(`${first}..${head}`);
    expect(full.commits).toBe(1);
    expect(full.hits).toEqual([{ file: head, line: 1, kind: "commit-message", digestPrefix: expect.any(String) }]);
    expect(full.notice ?? null).toBeNull();

    for (const range of [head, `..${head}`, `${"0".repeat(40)}..${head}`, `${"d".repeat(40)}..${head}`]) {
      const r = hit(range);
      expect(r.commits).toBe(1);
      expect(r.hits.length).toBe(1);
      expect(r.hits[0]?.file).toBe(head);
      if (range !== head) expect(r.notice).toBeTruthy();
    }
  });
});

describe("W-DL0.10 CLI exit codes", () => {
  it("hit exits 1 with path and line; key-id mismatch exits 1; no key exits 3, or 1 when required; clean tree exits 0", () => {
    const key = rawgate.newKey();
    const c = canaries();
    const { file } = buildFile(key, c);
    const dir = tempDir();
    const digestsPath = writeDigests(dir, file);
    const dirty = makeRepo({ "canary.txt": `the ${c.word} token\n` }, ["clean message"]);
    const clean = makeRepo({ "plain.txt": "ordinary\n" }, ["clean message"]);
    const emptyHome = join(dir, "empty-home");
    const baseEnv: Record<string, string> = {
      PATH: process.env.PATH ?? "",
      HOME: dir,
      DL_ANON_HOME: emptyHome, // isolates from any operator-host key file
    };

    // hit -> exit 1, output carries path:line and never the token
    const hitRun = scanCli(["scan", "--tree", "--repo", dirty.dir, "--digests", digestsPath], {
      ...baseEnv,
      DL_RAWGATE_KEY: Buffer.from(key).toString("hex"),
    });
    expect(hitRun.status).toBe(1);
    expect(hitRun.stdout).toContain("canary.txt:1");
    expect(hitRun.stdout).not.toContain(c.word);

    // clean tree -> exit 0
    const okRun = scanCli(["scan", "--tree", "--repo", clean.dir, "--digests", digestsPath], {
      ...baseEnv,
      DL_RAWGATE_KEY: Buffer.from(key).toString("hex"),
    });
    expect(okRun.status).toBe(0);

    // key-id mismatch -> exit 1
    const otherKey = rawgate.newKey();
    const mismatch = scanCli(["scan", "--tree", "--repo", clean.dir, "--digests", digestsPath], {
      ...baseEnv,
      DL_RAWGATE_KEY: Buffer.from(otherKey).toString("hex"),
    });
    expect(mismatch.status).toBe(1);
    expect(mismatch.stderr).toContain("key-id");

    // no key, not required -> exit 3 « not run (key absent) »
    const absent = scanCli(["scan", "--tree", "--repo", clean.dir, "--digests", digestsPath], baseEnv);
    expect(absent.status).toBe(3);
    expect(absent.stderr).toContain("not run (key absent)");

    // no key, required -> exit 1 (fail closed)
    const required = scanCli(["scan", "--tree", "--repo", clean.dir, "--digests", digestsPath], {
      ...baseEnv,
      DL_RAWGATE_REQUIRED: "1",
    });
    expect(required.status).toBe(1);
  });
});
