// Mutation harness for the repository guards.
//
// WHAT IT ANSWERS. A guard that is merely green says nothing about itself: it may be
// evaluating nothing, or asserting something other than what its name claims. Mutation
// is the only check of the correspondence between a guard's NAME and its BODY —
// reintroduce the defect the name announces, and a guard that stays green has a name
// that lies. Greenness is not truthfulness.
//
// HOW. It mutates the SUBJECT, never the test: it damages the repository in a way the
// guard's name says it should catch, runs the guards, and records which tests went red.
// Every touched file is snapshotted before and restored after, with an md5 comparison
// proving the restoration is byte-identical.
//
// A test that no mutation can redden is reported as UNREACHED. That is not proof of a
// lie — the harness may simply not reach it — which is why it is named as the harness's
// limit and not as the guard's fault.
//
// FOUR MEASURED CONSTRAINTS, each from a fault observed rather than imagined:
//
//  1. The environment is purged before every spawn. `NODE_TEST_CONTEXT=child-v8` makes a
//     FAILING suite exit 0, and a runner invoked from inside a test inherits it: measured,
//     a nested run reported `# pass 1 / # fail 0` for a suite that failed.
//  2. Each child's OWN output is read — its own `# fail`, its own exit code — never the
//     parent's aggregate. Read at the parent, `rc` and `# fail` lie together and in the
//     same direction, so requiring them to agree protects nothing.
//  3. The number of files actually executed is counted, and zero is a failure. An empty
//     or mistyped glob exits 0 with nothing run: `node --test /tmp/nomatch-zzz*.mjs`
//     returns rc=0. An empty glob is the purest form of a vacuous guard.
//  4. Three outcomes, not two. The invalid one names THE HARNESS, not the guards,
//     because a control whose precondition can be false must be able to say "I could not
//     measure" without that reading as a defect of its subject.
//
// AND IT FALLS UNDER ITS OWN JURISDICTION. A harness that can never fail would turn its
// own silence into an absence of measurement that looks like one. So it runs a self-test
// first: a guard file whose test name promises a check and whose body asserts nothing.
// The harness must report that test as UNREACHED. If it does not, it cannot distinguish
// a real guard from an empty one, and it stops before judging anything else.

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, unlinkSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const REPO = resolve(new URL("..", import.meta.url).pathname);
const GUARD_GLOB_DIR = join(REPO, "scripts");
const SELF_TEST = join(GUARD_GLOB_DIR, "zz-harness-self-test.test.mjs");

const argv = process.argv.slice(2);
const only = argv.filter((a) => !a.startsWith("--"));
const verbose = argv.includes("--verbose");

// ── plumbing ────────────────────────────────────────────────────────────────────────

function md5(p) {
  return createHash("md5").update(readFileSync(p)).digest("hex");
}

function guardFiles() {
  return readdirSync(GUARD_GLOB_DIR)
    .filter((f) => f.endsWith(".test.mjs"))
    .map((f) => join(GUARD_GLOB_DIR, f))
    .sort();
}

// Constraint 1 and 2: a purged environment, and the child's own output.
function runGuard(file) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_TEST_WORKER_ID;
  const r = spawnSync(process.execPath, ["--test", file], {
    cwd: REPO,
    env,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const num = (k) => {
    const m = out.match(new RegExp(`^# ${k} (\\d+)$`, "m"));
    return m ? Number(m[1]) : null;
  };
  const failedNames = [...out.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1].trim());
  return { rc: r.status, tests: num("tests"), fail: num("fail"), pass: num("pass"), failedNames, out };
}

// The child's rc and its own `# fail` must agree. Disagreement means the reading itself
// is unsound, which is the harness's problem and not the guard's.
function readGuard(file) {
  const g = runGuard(file);
  if (g.tests === null || g.fail === null) {
    return { ...g, unsound: `no TAP counters in the output of ${file}` };
  }
  const rcSaysFail = g.rc !== 0;
  const tapSaysFail = g.fail > 0;
  if (rcSaysFail !== tapSaysFail) {
    return { ...g, unsound: `${file}: rc=${g.rc} disagrees with '# fail ${g.fail}'` };
  }
  return g;
}

function allTestNames() {
  const names = new Map(); // name -> file
  for (const f of guardFiles()) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/^\s*(?:test|it)\(\s*(["'`])((?:(?!\1).)*)\1/gm)) {
      const n = m[2].trim();
      if (!names.has(n)) names.set(n, []);
      names.get(n).push(f);
    }
  }
  return names;
}

// ── snapshot / restore, with proof ──────────────────────────────────────────────────

function snapshot(paths) {
  return paths.map((p) => ({
    path: p,
    existed: existsSync(p),
    body: existsSync(p) ? readFileSync(p) : null,
    md5: existsSync(p) ? md5(p) : null
  }));
}

function restore(snap) {
  const problems = [];
  for (const s of snap) {
    if (s.existed) {
      writeFileSync(s.path, s.body);
      if (md5(s.path) !== s.md5) problems.push(`${s.path} did not restore byte-identically`);
    } else if (existsSync(s.path)) {
      unlinkSync(s.path);
      if (existsSync(s.path)) problems.push(`${s.path} could not be removed`);
    }
  }
  return problems;
}

// ── mutations: each damages the SUBJECT in the way a guard's name says it catches ────

const T = (id) => join(REPO, "packages", `theme-${id}`);

// A brace-matched block finder, because a bare regex takes the FIRST match and the first
// match is a candidate, not the target. Measured the hard way: a mutation meant for
// `semantic.text.link` hit the `foundation.link` GROUP thirty lines earlier, destroyed a
// token group, and left the contrast test it was written for completely unexercised — so
// the run reported that test as unreached when the mutation had simply missed.
function blockOf(src, opener, from = 0) {
  const i = src.indexOf(opener, from);
  if (i === -1) return null;
  const j = src.indexOf("{", i);
  if (j === -1) return null;
  let depth = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === "{") depth++;
    else if (src[k] === "}") {
      depth--;
      if (depth === 0) return { start: j + 1, end: k };
    }
  }
  return null;
}

// Replace a leaf inside a nested path, e.g. ["const semantic", "text:", "link:"].
function patchLeaf(p, trail, replacement) {
  let src = readFileSync(p, "utf8");
  let lo = 0, hi = src.length;
  for (const step of trail.slice(0, -1)) {
    const b = blockOf(src.slice(lo, hi), step);
    if (!b) throw new Error(`no block "${step}" in ${p}`);
    const base = lo;
    hi = base + b.end;
    lo = base + b.start;
  }
  const leaf = trail[trail.length - 1];
  const region = src.slice(lo, hi);
  const m = region.match(new RegExp(`^([ \\t]*)${leaf.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&")}[^\\n]*$`, "m"));
  if (!m) throw new Error(`no leaf "${leaf}" inside ${trail.slice(0, -1).join(" > ")} in ${p}`);
  const abs = lo + region.indexOf(m[0]);
  writeFileSync(p, src.slice(0, abs) + m[1] + replacement + src.slice(abs + m[0].length));
}
const patch = (p, from, to) => {
  const t = readFileSync(p, "utf8");
  if (t.split(from).length - 1 < 1) throw new Error(`anchor absent in ${p}: ${from.slice(0, 60)}`);
  writeFileSync(p, t.replace(from, () => to)); // replacer function: no $ substitution
};

const MUTATIONS = [
  {
    id: "id-mismatch",
    why: "a theme whose id no longer matches its folder",
    files: () => [join(T("michelin"), "src/index.ts")],
    apply: () => patch(join(T("michelin"), "src/index.ts"), 'id: "michelin"', 'id: "michelin-x"')
  },
  {
    id: "package-name-mismatch",
    why: "a theme package no longer named after its folder",
    files: () => [join(T("michelin"), "package.json")],
    apply: () => patch(join(T("michelin"), "package.json"), "design-system-theme-michelin", "design-system-theme-michelin-x")
  },
  {
    id: "lockfile-entry-removed",
    why: "a theme workspace with no lockfile entry",
    files: () => [join(REPO, "package-lock.json")],
    apply: () => {
      const p = join(REPO, "package-lock.json");
      const j = JSON.parse(readFileSync(p, "utf8"));
      delete j.packages["packages/theme-michelin"];
      writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`);
    }
  },
  {
    id: "docs-dependency-removed",
    why: "a theme workspace that is not a docs dependency",
    files: () => [join(REPO, "apps/docs/package.json")],
    apply: () => {
      const p = join(REPO, "apps/docs/package.json");
      const j = JSON.parse(readFileSync(p, "utf8"));
      delete j.dependencies["@sentropic/design-system-theme-michelin"];
      writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`);
    }
  },
  {
    id: "stale-lockfile-entry",
    why: "a lockfile entry pointing at a theme folder that is gone",
    files: () => [join(REPO, "package-lock.json")],
    apply: () => {
      const p = join(REPO, "package-lock.json");
      const j = JSON.parse(readFileSync(p, "utf8"));
      j.packages["packages/theme-a-brand-that-never-existed"] = { name: "@sentropic/design-system-theme-a-brand-that-never-existed", version: "0.1.0" };
      writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`);
    }
  },
  {
    id: "semantic-leaf-dropped",
    why: "a theme missing a semantic leaf the base declares",
    files: () => [join(T("michelin"), "src/index.ts")],
    apply: () => {
      const p = join(T("michelin"), "src/index.ts");
      const t = readFileSync(p, "utf8");
      const m = t.match(/\n(\s*)muted: [^\n]*\n/);
      if (!m) throw new Error("no semantic muted leaf found to drop");
      writeFileSync(p, t.replace(m[0], () => "\n"));
    }
  },
  {
    id: "token-group-dropped",
    why: "a theme dropping a whole token group the others all declare",
    files: () => [join(T("michelin"), "src/index.ts")],
    // This mutation exists because of a second-order finding: while the contrast mutation
    // was imprecise it destroyed the `foundation.link` GROUP by accident, which reddened
    // this test and made it look covered. Making that mutation precise turned this test
    // from reached to unreached — so an imprecise mutation had been certifying a coverage
    // that did not exist. A false "reached" is worse than a reported gap.
    apply: () => {
      const p = join(T("michelin"), "src/index.ts");
      const src = readFileSync(p, "utf8");
      const b = blockOf(src, "  link: {");
      if (!b) throw new Error("no foundation.link group found to drop");
      // remove the whole group, opener and closing brace included
      const open = src.lastIndexOf("link: {", b.start);
      const lineStart = src.lastIndexOf("\n", open) + 1;
      const after = src.indexOf("\n", b.end);
      writeFileSync(p, src.slice(0, lineStart) + src.slice(after + 1));
    },
    expect: (src) => !/^\s*link: \{/m.test(src)
  },
  {
    id: "hex-without-mapping-row",
    why: "a colour shipped with no row in MAPPING.md",
    files: () => [join(T("michelin"), "src/index.ts")],
    apply: () => patch(join(T("michelin"), "src/index.ts"), "const michelinColor = {", 'const michelinColor = {\n  harnessProbe: "#a1b2c3",')
  },
  {
    id: "unpinned-font-family",
    why: "a font family the theme declares and its own test does not pin",
    files: () => [join(T("michelin"), "src/index.ts")],
    // The first attempt added a key called `harnessProbeFamily`, which the guard rightly
    // ignores — its pattern requires `family` not preceded by a word character. A
    // mutation must produce a GENUINE instance of the defect, so this one rewrites the
    // value of a real `family` declaration to a face no test pins.
    // The families live in INLINE objects (`control: { family: … }`), which a
    // line-anchored leaf finder cannot reach — measured by watching it throw. The value
    // is unique in that position, so it is the anchor.
    apply: () => patch(join(T("michelin"), "src/index.ts"), `control: { family: "'Noto Sans', Arial, system-ui, sans-serif"`, 'control: { family: "Harness Probe Sans"'),
    expect: (src) => src.includes('family: "Harness Probe Sans"')
  },
  {
    id: "license-on-a-brand-theme",
    why: "a brand theme package carrying a license field",
    files: () => [join(T("michelin"), "package.json")],
    apply: () => {
      const p = join(T("michelin"), "package.json");
      const j = JSON.parse(readFileSync(p, "utf8"));
      j.license = "MIT";
      writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`);
    }
  },
  {
    id: "contrast-floor-broken",
    why: "an interactive colour below its WCAG floor on the theme's own surface",
    files: () => [join(T("michelin"), "src/index.ts")],
    apply: () => patchLeaf(join(T("michelin"), "src/index.ts"), ["const semantic", "text:", "link:"], 'link: "#fafafa" // harness probe: 1.07:1 on white'),
    expect: (src) => /link: "#fafafa"/.test(src)
  },
  {
    id: "borrowed-geometry-unlabelled",
    why: "a theme whose easing equals the reference package's, with neither label nor coincidence note",
    files: () => [join(T("michelin"), "src/index.ts"), join(T("michelin"), "MAPPING.md")],
    apply: () => {
      // The premise is asserted, not assumed: this theme's easing must already equal the
      // reference package's, otherwise removing the label proves nothing about the guard.
      const ref = join(REPO, "packages/theme-schneider-electric/src/index.ts");
      const refEasing = (readFileSync(ref, "utf8").match(/easing: "([^"]+)"/) || [])[1];
      const ours = (readFileSync(join(T("michelin"), "src/index.ts"), "utf8").match(/easing: "([^"]+)"/) || [])[1];
      if (!refEasing || !ours) throw new Error("could not read an easing on both sides");
      if (refEasing !== ours) throw new Error(`premise fails: this theme's easing "${ours}" already differs from the reference's "${refEasing}", so the label is not what makes the guard green`);
      // A mutation that removes a declaration must remove EXACTLY what the guard accepts,
      // not a longer phrase that looks like it. Measured: stripping "aligned with the
      // reference theme package's geometry" left three occurrences of "aligned with the
      // reference theme package's" untouched, the guard's own pattern is the shorter one,
      // and it went on accepting them — so the run reported the test unreached when the
      // declaration had never actually been removed. The patterns below are the guard's,
      // copied from it rather than paraphrased.
      // Third correction of this one mutation, and the reason is the sharpest of the three.
      // The guard FLATTENS newlines and comment markers before matching, because the label
      // is prose and wraps across two lines in an 80-column comment. A strip written
      // against the raw text therefore removes only the unwrapped occurrences, and the
      // guard goes on seeing the wrapped ones. Measured: after such a strip,
      // `label.test(flatten(mapping))` and `label.test(flatten(source))` were both still
      // true, so the guard was right and the mutation was blind.
      //
      // Worse, the first `expect()` shared that blindness: it tested the raw text too, so
      // it certified a mutation that had not landed. A self-check built on the same
      // assumption as the thing it checks cannot catch that assumption failing. So both
      // the strip and its check now work in the guard's own flattened space.
      const wrapTolerant = (phrase) =>
        new RegExp(phrase.split(" ").map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*(?:\\/\\/|\\*)?\\s*"), "gi");
      const ACCEPTED = [
        wrapTolerant("aligned with the reference theme package"),
        /coincid(?:e|es|ence|entally)/gi,
        /happens to\s*(?:\/\/|\*)?\s*(?:be|match)/gi,
        wrapTolerant("same value as the reference")
      ];
      for (const p of [join(T("michelin"), "src/index.ts"), join(T("michelin"), "MAPPING.md")]) {
        let s = readFileSync(p, "utf8");
        for (const re of ACCEPTED) s = s.replace(re, () => "harness-probe-removed");
        writeFileSync(p, s);
      }
    },
    // Checked in the guard's own flattened space, not in the raw text.
    expect: (src) => {
      const flat = src.replace(/\n\s*(?:\/\/|\*)?\s*/g, " ");
      return !/aligned with the reference theme package/i.test(flat) &&
        !/coincid(?:e|es|ence|entally)|happens to (?:be|match)|same value as the reference/i.test(flat);
    }
  }
];

// ── the self-test: proof the harness can still fail ─────────────────────────────────

const SELF_TEST_BODY = `// Written and removed by scripts/mutate-guards.mjs. If this file is left behind, the
// harness crashed between writing it and cleaning up.
import { test } from "node:test";
test("the harness self-test: this name promises a check its body does not make", () => {
  // deliberately asserts nothing
});
`;

function selfTest() {
  writeFileSync(SELF_TEST, SELF_TEST_BODY);
  try {
    const names = allTestNames();
    const probe = [...names.keys()].find((n) => n.startsWith("the harness self-test:"));
    if (!probe) return { ok: false, why: "the harness could not even see its own probe test" };
    const reddened = new Set();
    for (const m of MUTATIONS) {
      const snap = snapshot(m.files());
      try {
        try {
          m.apply();
        } catch (e) {
          // A mutation that cannot even apply is a harness defect, not a reason to abort
          // the whole run before anything has been measured.
          return { ok: false, why: `mutation "${m.id}" could not be applied during the self-test — ${e.message}` };
        }
        for (const f of guardFiles()) {
          const g = readGuard(f);
          if (g.unsound) return { ok: false, why: `unsound reading during self-test: ${g.unsound}` };
          for (const n of g.failedNames) reddened.add(n);
        }
      } finally {
        const problems = restore(snap);
        if (problems.length) return { ok: false, why: `self-test could not restore: ${problems.join("; ")}` };
      }
    }
    if (reddened.has(probe)) {
      return { ok: false, why: "a test that asserts nothing was reported as reached, so the harness cannot tell an empty guard from a real one" };
    }
    return { ok: true, probe, reddenedDuringSelfTest: reddened.size };
  } finally {
    if (existsSync(SELF_TEST)) unlinkSync(SELF_TEST);
  }
}

// ── main ────────────────────────────────────────────────────────────────────────────

function invalid(reason) {
  console.log(`\nMUTATION_HARNESS_INVALID: ${reason}`);
  console.log("Nothing in this run is evidence about any guard.");
  process.exit(2);
}

const files = guardFiles();
if (files.length === 0) invalid("no guard files matched scripts/*.test.mjs");
console.log(`harness: ${files.length} guard files in ${GUARD_GLOB_DIR}`);

// Constraint 3: a baseline that actually executed something.
//
// A guard that is already red before any mutation cannot be mutation-tested — nothing can
// be learned from turning red something that is red. But one environment-dependent guard
// must not block the measurement of all the others, so such a file is EXCLUDED BY NAME
// with its baseline failures quoted, rather than invalidating the run. If every file is
// excluded there is nothing left to measure, and then the run is invalid.
let baselineTests = 0;
const measurable = [];
const excluded = [];
for (const f of files) {
  const g = readGuard(f);
  if (g.unsound) invalid(g.unsound);
  if (g.fail !== 0) {
    excluded.push({ file: f, fail: g.fail, names: g.failedNames });
    continue;
  }
  measurable.push(f);
  baselineTests += g.tests;
}
if (measurable.length === 0) invalid("every guard file is already red before mutation, so there is nothing a mutation could teach");
if (baselineTests === 0) invalid("the measurable baseline executed zero tests, which an empty glob also does");
console.log(`harness: baseline green on ${measurable.length}/${files.length} files, ${baselineTests} tests executed`);
if (excluded.length) {
  console.log("harness: EXCLUDED, red before any mutation — not measured, and not accused:");
  for (const e of excluded) {
    console.log(`  x ${e.file.split("/").pop()} (${e.fail} failing)`);
    for (const n of e.names.slice(0, 3)) console.log(`      ${n}`);
    if (e.names.length > 3) console.log(`      … and ${e.names.length - 3} more`);
  }
}

const self = selfTest();
if (!self.ok) invalid(`self-test failed — ${self.why}`);
console.log(`harness: self-test passed (a test asserting nothing was correctly reported unreached)`);

const names = allTestNames();
const reddenedBy = new Map(); // test name -> [mutation ids]
const failures = [];

for (const m of MUTATIONS) {
  if (only.length && !only.includes(m.id)) continue;
  const snap = snapshot(m.files());
  let applied = false;
  try {
    m.apply();
    applied = true;
    // Constraint 5, learned by running: a mutation that silently misses its target turns
    // every test it was written for into a false "unreached". So a mutation may declare
    // what its own effect looks like, and the harness checks that the effect is there
    // before it believes anything the guards say about it.
    if (m.expect) {
      const touched = m.files().map((p) => readFileSync(p, "utf8")).join("\n");
      if (!m.expect(touched)) {
        failures.push(`${m.id}: applied but its own expect() does not see the defect — this mutation measures nothing`);
        console.log(`  MISS  ${m.id.padEnd(26)} applied, but the defect it claims is not in the file`);
        continue;
      }
    }
    const red = new Set();
    for (const f of measurable) {
      const g = readGuard(f);
      if (g.unsound) { failures.push(`${m.id}: ${g.unsound}`); continue; }
      for (const n of g.failedNames) red.add(n);
    }
    for (const n of red) {
      if (!reddenedBy.has(n)) reddenedBy.set(n, []);
      reddenedBy.get(n).push(m.id);
    }
    console.log(`  ${red.size ? "RED " : "none"}  ${m.id.padEnd(26)} ${m.why}${red.size ? `\n          -> ${[...red].join("\n          -> ")}` : ""}`);
  } catch (e) {
    failures.push(`${m.id}: could not apply — ${e.message}`);
    console.log(`  ERR   ${m.id.padEnd(26)} ${e.message}`);
  } finally {
    const problems = restore(snap);
    if (problems.length) invalid(`restoration failed after ${m.id}: ${problems.join("; ")} — the tree may be dirty`);
    if (!applied && verbose) console.log(`          (mutation never applied, nothing to restore)`);
  }
}

// ── verdict ─────────────────────────────────────────────────────────────────────────

const excludedFiles = new Set(excluded.map((e) => e.file));
const inExcludedOnly = (n) => (names.get(n) || []).every((f) => excludedFiles.has(f));
const unreached = [...names.keys()].filter((n) => !reddenedBy.has(n) && !inExcludedOnly(n));
const unmeasured = [...names.keys()].filter((n) => !reddenedBy.has(n) && inExcludedOnly(n));
console.log(`\nreached   : ${reddenedBy.size} of ${names.size} test names`);
for (const [n, ms] of [...reddenedBy].sort()) console.log(`  + ${n}\n      by ${ms.join(", ")}`);
console.log(`\nunreached : ${unreached.length} of ${names.size}`);
for (const n of unreached.sort()) console.log(`  ? ${n}   [${(names.get(n) || []).map((f) => f.split("/").pop()).join(", ")}]`);

if (unmeasured.length) {
  console.log(`\nunmeasured: ${unmeasured.length} test name(s) live only in excluded files, so this run says nothing about them`);
  for (const n of unmeasured.sort()) console.log(`  - ${n}`);
}
if (failures.length) {
  console.log(`\nharness problems:\n${failures.map((f) => `  - ${f}`).join("\n")}`);
}
console.log(
  "\nAn unreached test is the HARNESS's limit, not proof that the guard lies: this run\n" +
    "applied " + MUTATIONS.length + " mutations, and a test no mutation touches is simply unverified."
);
const verdict = failures.length === 0 ? "MUTATION_HARNESS_MEASURED" : "MUTATION_HARNESS_PARTIAL";
console.log(`\n${verdict}: ${reddenedBy.size} reached, ${unreached.length} unreached, ${failures.length} harness problem(s)`);
process.exit(failures.length === 0 ? 0 : 1);
