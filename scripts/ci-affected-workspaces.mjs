import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getOrderedWorkspaces } from "./run-workspaces.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dependencyFields = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
const smokePackWorkspaces = new Set([
  "@sentropic/design-system-tokens",
  "@sentropic/design-system-themes",
  "@sentropic/design-system-svelte",
  "@sentropic/design-system-react",
  "@sentropic/design-system-skills",
  "@sentropic/design-system-vue",
]);

function arg(name, fallback = undefined) {
  const prefix = `--${name}=`;
  const found = process.argv.find((value) => value.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function flag(name) {
  return process.argv.includes(`--${name}`);
}

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function changedFiles(base, head) {
  const range = base ? [base, head ?? "HEAD"] : [head ?? "HEAD"];
  const output = git(["diff", "--name-only", ...range]);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function localDeps(manifest, names) {
  const deps = new Set();
  for (const field of dependencyFields) {
    for (const name of Object.keys(manifest[field] ?? {})) {
      if (names.has(name)) deps.add(name);
    }
  }
  return deps;
}

function buildGraph(workspaces) {
  const names = new Set(workspaces.map((workspace) => workspace.name));
  const byName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));
  const dependents = new Map(workspaces.map((workspace) => [workspace.name, new Set()]));

  for (const workspace of workspaces) {
    for (const dep of localDeps(workspace.manifest, names)) {
      dependents.get(dep)?.add(workspace.name);
    }
  }

  return { byName, dependents };
}

function workspaceForFile(file, workspaces) {
  const normalized = file.replace(/\\/g, "/");
  let best = null;
  for (const workspace of workspaces) {
    const rel = relative(root, workspace.dir).replace(/\\/g, "/");
    if (normalized === rel || normalized.startsWith(`${rel}/`)) {
      if (!best || rel.length > relative(root, best.dir).length) best = workspace;
    }
  }
  return best;
}

function expandDependents(seedNames, dependents) {
  const result = new Set(seedNames);
  const queue = [...seedNames];
  for (let i = 0; i < queue.length; i += 1) {
    const current = queue[i];
    for (const dependent of dependents.get(current) ?? []) {
      if (!result.has(dependent)) {
        result.add(dependent);
        queue.push(dependent);
      }
    }
  }
  return result;
}

function shard(names, shardCount) {
  const shards = Array.from({ length: shardCount }, () => []);
  names.forEach((name, index) => shards[index % shardCount].push(name));
  return shards.filter((items) => items.length > 0);
}

const base = arg("base", process.env.BASE_SHA || "");
const head = arg("head", process.env.HEAD_SHA || "HEAD");
const shardCount = Math.max(1, Number(arg("shards", process.env.SHARDS || "10")) || 10);
const includeApps = flag("include-apps") || process.env.INCLUDE_APPS === "1";
const format = arg("format", "text");

const allWorkspaces = getOrderedWorkspaces(root);
const ciWorkspaces = allWorkspaces.filter((workspace) => includeApps || relative(root, workspace.dir).startsWith("packages/"));
const { dependents } = buildGraph(ciWorkspaces);
const filesArg = arg("files", "");
const files = filesArg
  ? filesArg.split(",").map((value) => value.trim()).filter(Boolean)
  : changedFiles(base, head);

const fullScanPatterns = [
  /^package-lock\.json$/,
  /^package\.json$/,
  /^scripts\//,
  /^\.github\/workflows\/verify\.yml$/,
];

const fullScan = files.length === 0 || files.some((file) => fullScanPatterns.some((pattern) => pattern.test(file)));
const seeds = new Set();

if (fullScan) {
  for (const workspace of ciWorkspaces) seeds.add(workspace.name);
} else {
  for (const file of files) {
    const workspace = workspaceForFile(file, ciWorkspaces);
    if (workspace) seeds.add(workspace.name);
  }
}

const affected = [...expandDependents(seeds, dependents)].filter((name) =>
  ciWorkspaces.some((workspace) => workspace.name === name),
);

const ordered = ciWorkspaces.map((workspace) => workspace.name).filter((name) => affected.includes(name));
const shards = shard(ordered, shardCount);

if (format === "github-matrix") {
  const tasks = (arg("tasks", "check,test,pack-smoke") ?? "check,test,pack-smoke")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const include = shards.flatMap((items, index) =>
    tasks
      .filter((task) => task !== "pack-smoke" || items.some((name) => smokePackWorkspaces.has(name)))
      .map((task) => ({ task, shard: index + 1, workspaces: items.join(",") })),
  );
  process.stdout.write(JSON.stringify({ include }));
} else if (format === "json") {
  process.stdout.write(JSON.stringify({ fullScan, files, affected: ordered, shards }, null, 2));
} else {
  for (const name of ordered) console.log(name);
}
