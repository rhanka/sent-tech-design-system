// Out-of-repo directory convention and refusal (§2.6). The anonymised
// mapping and the raw token sources live only under $DL_ANON_HOME, outside
// every git work tree, with 0700/0600 modes.
import { existsSync, lstatSync, mkdirSync, realpathSync, statSync, writeFileSync, renameSync, openSync, closeSync, chmodSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

export type OutOfRepoCode = "anon-path-in-git-work-tree" | "anon-home-not-absolute" | "anon-home-permissions";
export type OutOfRepoCheck =
  | { readonly ok: true; readonly realPath: string }
  | { readonly ok: false; readonly code: OutOfRepoCode; readonly message: string };

/** Home = $DL_ANON_HOME, else $XDG_DATA_HOME/sentropic/dl-anon (absolute), else $HOME/.local/share/sentropic/dl-anon. */
export function resolveAnonHome(env: Readonly<Record<string, string | undefined>>): string {
  const dl = env.DL_ANON_HOME;
  if (dl !== undefined && dl !== "") return dl;
  const xdg = env.XDG_DATA_HOME;
  if (xdg !== undefined && xdg !== "" && isAbsolute(xdg)) return join(xdg, "sentropic", "dl-anon");
  const home = env.HOME ?? "";
  return join(home, ".local", "share", "sentropic", "dl-anon");
}

function nearestExistingAncestor(path: string): string {
  let current = resolve(path);
  for (;;) {
    if (existsSync(current)) return current;
    const parent = dirname(current);
    if (parent === current) return current;
    current = parent;
  }
}

function realOfNearest(path: string): string {
  try {
    return realpathSync(nearestExistingAncestor(path));
  } catch {
    return resolve(path);
  }
}

/** True when the directory itself or any ancestor up to / holds an entry named `.git` (directory, file or link). */
function holdsGitEntry(realPath: string): boolean {
  let current = realPath;
  for (;;) {
    if (existsSync(join(current, ".git"))) {
      try {
        lstatSync(join(current, ".git"));
        return true;
      } catch {
        /* not present */
      }
    }
    const parent = dirname(current);
    if (parent === current) return false;
    current = parent;
  }
}

function gitSaysInsideWorkTree(ancestor: string): boolean {
  try {
    const out = execFileSync("git", ["-C", ancestor, "rev-parse", "--is-inside-work-tree"], {
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.toString("utf8").trim() === "true";
  } catch {
    return false;
  }
}

/** Group/other permission bits on any existing directory of the home chain (home and below), and on the target itself. */
function homeChainPermissionProblem(home: string, target: string): string | undefined {
  const from = resolve(home);
  const to = resolve(target);
  const problemAt = (dir: string): string | undefined => {
    if (existsSync(dir) && statSync(dir).isDirectory()) {
      const mode = statSync(dir).mode & 0o777;
      if ((mode & 0o077) !== 0) return dir;
    }
    return undefined;
  };
  let current = from;
  for (;;) {
    const bad = problemAt(current);
    if (bad !== undefined) return bad;
    if (current === to || !to.startsWith(current + "/")) break;
    const next = join(current, to.slice(current.length + 1).split("/")[0] as string);
    if (next === current) break;
    current = next;
  }
  // The target itself is checked even when it lies outside the home chain.
  if (to !== from) return problemAt(to);
  return undefined;
}

/**
 * Refusal check before every write (§2.6 steps 1–5). Step 6 (re-check after
 * creation) is `assertOutsideGitWorkTreesAfterCreate`.
 */
export function assertOutsideGitWorkTrees(
  path: string,
  env: Readonly<Record<string, string | undefined>>,
): OutOfRepoCheck {
  if (!isAbsolute(path)) {
    return { ok: false, code: "anon-home-not-absolute", message: "the anon home path is not absolute" };
  }
  if (env.GIT_DIR !== undefined || env.GIT_WORK_TREE !== undefined || env.GIT_COMMON_DIR !== undefined) {
    return { ok: false, code: "anon-path-in-git-work-tree", message: "a GIT_* variable is set in the environment" };
  }
  const real = realOfNearest(path);
  if (holdsGitEntry(real)) {
    return { ok: false, code: "anon-path-in-git-work-tree", message: "the path or an ancestor holds a .git entry" };
  }
  // Step 4 runs on the real path of step 3, so a link into a work tree is caught.
  if (gitSaysInsideWorkTree(real)) {
    return { ok: false, code: "anon-path-in-git-work-tree", message: "git reports the path inside a work tree" };
  }
  const home = resolveAnonHome(env);
  if (isAbsolute(home)) {
    const bad = homeChainPermissionProblem(home, resolve(path));
    if (bad !== undefined) {
      return { ok: false, code: "anon-home-permissions", message: `directory of the home chain is group/other accessible: ${bad}` };
    }
  }
  return { ok: true, realPath: real };
}

/** §2.6 step 6: the same .git checks again on the final real path after creation. */
export function assertOutsideGitWorkTreesAfterCreate(path: string): OutOfRepoCheck {
  const real = realpathSync(path);
  if (holdsGitEntry(real)) {
    return { ok: false, code: "anon-path-in-git-work-tree", message: "the created path or an ancestor holds a .git entry" };
  }
  if (gitSaysInsideWorkTree(real)) {
    return { ok: false, code: "anon-path-in-git-work-tree", message: "git reports the created path inside a work tree" };
  }
  return { ok: true, realPath: real };
}

/** mkdir -p with 0700 (recursive mode applies to every created directory), then the §2.6 step-6 re-check. */
export function makePrivateDir(path: string, env: Readonly<Record<string, string | undefined>>): OutOfRepoCheck {
  const check = assertOutsideGitWorkTrees(path, env);
  if (!check.ok) return check;
  mkdirSync(path, { recursive: true, mode: 0o700 });
  return assertOutsideGitWorkTreesAfterCreate(path);
}

/** Exclusive create (0600) then rename, so a partial file is never visible. */
export function writePrivateFile(path: string, data: Uint8Array | string): void {
  const tmp = `${path}.tmp-${process.pid}`;
  const fd = openSync(tmp, "wx", 0o600);
  try {
    writeFileSync(fd, data);
  } finally {
    closeSync(fd);
  }
  chmodSync(tmp, 0o600);
  renameSync(tmp, path);
}
