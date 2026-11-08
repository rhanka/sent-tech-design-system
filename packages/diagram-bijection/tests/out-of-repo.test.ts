/**
 * §2.9 W-DL0.9: the out-of-repo directory convention (§2.6). Any path inside
 * a git work tree is refused; a plain temporary directory is accepted, a
 * missing parent chain does not throw, and created directories are 0700.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertOutsideGitWorkTrees,
  assertOutsideGitWorkTreesAfterCreate,
  makePrivateDir,
  resolveAnonHome,
  writePrivateFile,
} from "../src/anon/out-of-repo.js";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = execFileSync("git", ["-C", pkgRoot, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

const tmpDirs: string[] = [];
afterEach(() => {
  while (tmpDirs.length > 0) rmSync(tmpDirs.pop() as string, { recursive: true, force: true });
});
function tempDir(): string {
  // Base under $HOME, not os.tmpdir(): a .git entry anywhere above the base
  // (some hosts carry /tmp/.git) must refuse the path, per §2.6.
  const dir = mkdtempSync(join(homedir(), ".dl0-anon-test-"));
  tmpDirs.push(dir);
  return dir;
}
/** Env with the anon home inside a fresh temp dir (0700 chain). */
function envWithHome(home: string): Record<string, string | undefined> {
  return { DL_ANON_HOME: home, HOME: undefined, XDG_DATA_HOME: undefined };
}

describe("W-DL0.9 assertOutsideGitWorkTrees", () => {
  it("refuses a path in the DS checkout", () => {
    const home = join(tempDir(), "anon");
    const result = assertOutsideGitWorkTrees(join(repoRoot, "packages", "diagram-bijection"), envWithHome(home));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("anon-path-in-git-work-tree");
  });

  it("refuses a path in a temporary git init repository", () => {
    const dir = tempDir();
    execFileSync("git", ["init", "-q", dir]);
    const home = join(tempDir(), "anon");
    const result = assertOutsideGitWorkTrees(join(dir, "sub"), envWithHome(home));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("anon-path-in-git-work-tree");
  });

  it("refuses a path through a symlink into a work tree", () => {
    const dir = tempDir();
    const link = join(dir, "into-repo");
    symlinkSync(join(repoRoot, "packages"), link);
    const home = join(tempDir(), "anon");
    const result = assertOutsideGitWorkTrees(join(link, "diagram-bijection"), envWithHome(home));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("anon-path-in-git-work-tree");
  });

  it("refuses a path under a directory holding a .git file", () => {
    const dir = tempDir();
    writeFileSync(join(dir, ".git"), "gitdir: /elsewhere\n");
    const home = join(tempDir(), "anon");
    const result = assertOutsideGitWorkTrees(join(dir, "sub"), envWithHome(home));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("anon-path-in-git-work-tree");
  });

  it("refuses when GIT_DIR is set in the environment", () => {
    const dir = tempDir();
    const home = join(dir, "anon");
    const result = assertOutsideGitWorkTrees(join(dir, "target"), { ...envWithHome(home), GIT_DIR: join(dir, ".git") });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("anon-path-in-git-work-tree");
  });

  it("refuses a relative path", () => {
    const result = assertOutsideGitWorkTrees("relative/path", envWithHome(join(tempDir(), "anon")));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("anon-home-not-absolute");
  });

  it("accepts a plain temporary directory", () => {
    const dir = tempDir();
    const home = join(dir, "anon");
    const result = assertOutsideGitWorkTrees(join(dir, "target"), envWithHome(home));
    expect(result.ok).toBe(true);
  });

  it("accepts a home whose whole parent chain does not exist yet (no ENOENT)", () => {
    const base = tempDir();
    const deep = join(base, "no", "such", "chain", "yet", "anon");
    const result = assertOutsideGitWorkTrees(join(deep, "run-1"), envWithHome(deep));
    expect(result.ok).toBe(true);
    expect(existsSync(deep)).toBe(false); // the check did not create anything
  });

  it("refuses a group/other-accessible directory in the home chain", () => {
    const base = tempDir();
    const home = join(base, "anon");
    mkdirSync(home, { recursive: true, mode: 0o755 });
    const result = assertOutsideGitWorkTrees(join(home, "run-1"), envWithHome(home));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("anon-home-permissions");
  });
});

describe("W-DL0.9 makePrivateDir / writePrivateFile", () => {
  it("creates the directory 0700 and re-checks after creation", () => {
    const base = tempDir();
    const home = join(base, "anon");
    const target = join(home, "s2-target-anon", "abcdef123456");
    const made = makePrivateDir(target, envWithHome(home));
    expect(made.ok).toBe(true);
    expect(existsSync(target)).toBe(true);
    expect(statSync(target).mode & 0o777).toBe(0o700);
    expect(statSync(home).mode & 0o777).toBe(0o700);
    const recheck = assertOutsideGitWorkTreesAfterCreate(target);
    expect(recheck.ok).toBe(true);
  });

  it("writePrivateFile creates a 0600 file", () => {
    const base = tempDir();
    const home = join(base, "anon");
    const target = join(home, "run.json");
    expect(makePrivateDir(home, envWithHome(home)).ok).toBe(true);
    writePrivateFile(target, "{}\n");
    expect(statSync(target).mode & 0o777).toBe(0o600);
    expect(readFileSync(target, "utf8")).toBe("{}\n");
  });

  it("resolveAnonHome prefers DL_ANON_HOME, then XDG_DATA_HOME, then HOME", () => {
    expect(resolveAnonHome({ DL_ANON_HOME: "/a", XDG_DATA_HOME: "/b", HOME: "/c" })).toBe("/a");
    expect(resolveAnonHome({ XDG_DATA_HOME: "/b", HOME: "/c" })).toBe(join("/b", "sentropic", "dl-anon"));
    expect(resolveAnonHome({ HOME: "/c" })).toBe(join("/c", ".local", "share", "sentropic", "dl-anon"));
  });
});
