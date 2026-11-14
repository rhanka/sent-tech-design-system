// Probe of another Preact major on the same source (`npm run probe:preact`).
//
// The workspace hoists one `preact` (10.x, shared with the BPMN canvas), so a
// second major cannot be tried in place: `@preact/signals`, `lucide-preact`
// and the testing library would still bind to the hoisted one. This script
// builds an isolated project OUTSIDE the repository, with the exact pins of
// this package and `preact` replaced by the probed version, copies `src/`
// into it, and runs the Preact tests and the type-check there.
//
//   node scripts/probe-preact-major.mjs                    probe preact 11.2.0
//   node scripts/probe-preact-major.mjs --preact=11.2.0 --write
//   node scripts/probe-preact-major.mjs --dir=<empty directory to keep>
//
// It installs from the npm registry (network needed) and never touches the
// workspace `node_modules` or lockfile. `--write` records the result in
// `measurements/preact-major-probe.txt`.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const repoDir = dirname(dirname(packageDir));

const option = (name, fallback) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const preactVersion = option("preact", "11.2.0");
const keepDir = option("dir", null);
const projectDir = keepDir ? resolve(keepDir) : mkdtempSync(join(tmpdir(), "preact-major-probe-"));

if (projectDir.startsWith(repoDir + "/") || projectDir === repoDir) {
  throw new Error("The probe project must live outside the repository, or npm resolves the hoisted preact.");
}
mkdirSync(projectDir, { recursive: true });
if (readdirSync(projectDir).length > 0) throw new Error(`${projectDir} is not empty`);

const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
const pick = (source, names) => Object.fromEntries(names.map((name) => [name, source[name]]));
const devDependencies = {
  ...pick(manifest.devDependencies, ["@babel/core", "@preact/preset-vite", "@preact/signals", "@testing-library/preact", "jsdom", "typescript", "vite", "vitest"]),
  preact: preactVersion,
};
const project = {
  name: "preact-major-probe",
  private: true,
  type: "module",
  dependencies: manifest.dependencies,
  devDependencies,
  // `lucide-preact` declares `preact ^10`: force the probed version everywhere.
  overrides: { preact: preactVersion },
};
writeFileSync(join(projectDir, "package.json"), JSON.stringify(project, null, 2) + "\n");
cpSync(join(packageDir, "src"), join(projectDir, "src"), { recursive: true });
cpSync(join(packageDir, "vite.config.ts"), join(projectDir, "vite.config.ts"));
const base = JSON.parse(readFileSync(join(repoDir, "tsconfig.base.json"), "utf8"));
const own = JSON.parse(readFileSync(join(packageDir, "tsconfig.json"), "utf8"));
writeFileSync(
  join(projectDir, "tsconfig.json"),
  JSON.stringify({ compilerOptions: { ...base.compilerOptions, ...own.compilerOptions, noEmit: true }, include: own.include, exclude: own.exclude }, null, 2) + "\n",
);

function run(command, args) {
  const result = spawnSync(command, args, { cwd: projectDir, encoding: "utf8", maxBuffer: 1 << 28 });
  if (result.error) throw result.error;
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

const lines = [];
const say = (line = "") => lines.push(line);

try {
  const install = run("npm", ["install", "--legacy-peer-deps", "--no-audit", "--no-fund", "--loglevel=error"]);
  if (install.status !== 0) throw new Error(`npm install failed:\n${install.stderr}`);

  const installed = (name) => JSON.parse(readFileSync(join(projectDir, "node_modules", name, "package.json"), "utf8")).version;
  const nestedPreact = run("npm", ["ls", "preact", "--all", "--parseable"]).stdout.split("\n").filter(Boolean);

  const reportFile = join(projectDir, "vitest-report.json");
  const tests = run("npx", ["vitest", "run", "--reporter=json", `--outputFile=${reportFile}`]);
  if (!existsSync(reportFile)) throw new Error(`vitest produced no report:\n${tests.stdout}\n${tests.stderr}`);
  const report = JSON.parse(readFileSync(reportFile, "utf8"));
  const types = run("npx", ["tsc", "-p", "tsconfig.json"]);

  say(`Probe of preact ${preactVersion} on the source of packages/components-preact/src`);
  say("Isolated project outside the repository; recipe: scripts/probe-preact-major.mjs");
  say("");
  say("== Installed ==");
  for (const name of ["preact", ...Object.keys(devDependencies).filter((name) => name !== "preact"), ...Object.keys(manifest.dependencies)]) {
    say(`${name} ${installed(name)}`);
  }
  say(`preact instances in node_modules: ${nestedPreact.length}`);
  say("");
  say("== Preact tests (vitest run) ==");
  const failedFiles = report.testResults.filter((suite) => suite.assertionResults.some((assertion) => assertion.status !== "passed"));
  say(`test files: ${report.testResults.length - failedFiles.length} passed, ${failedFiles.length} failed, ${report.testResults.length} total`);
  say(`tests: ${report.numPassedTests} passed, ${report.numFailedTests} failed, ${report.numTotalTests} total`);
  for (const suite of report.testResults) {
    for (const assertion of suite.assertionResults) {
      if (assertion.status === "passed") continue;
      const message = (assertion.failureMessages?.[0] ?? "").split("\n")[0];
      say(`FAILED ${suite.name.slice(projectDir.length + 1)} > ${assertion.fullName}`);
      say(`       ${message}`);
    }
  }
  say("");
  say("== Type-check (tsc --noEmit) ==");
  const errors = types.stdout.split("\n").filter((line) => /error TS\d+/.test(line));
  say(`exit code ${types.status}, ${errors.length} error(s)`);
  for (const error of errors) say(error.length > 260 ? `${error.slice(0, 260)}...` : error);

  const text = lines.join("\n") + "\n";
  process.stdout.write(text);
  if (process.argv.includes("--write")) {
    mkdirSync(join(packageDir, "measurements"), { recursive: true });
    writeFileSync(join(packageDir, "measurements", "preact-major-probe.txt"), text);
  }
} finally {
  if (!keepDir) rmSync(projectDir, { recursive: true, force: true });
}
