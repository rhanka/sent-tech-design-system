import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// No workflow-shaped guard reads `.github/workflows` at all, so a change to any
// workflow (the CI gate itself, publish credentials, the tag-safety check) is
// covered by nothing. This is the last known instance of "a guard that nothing
// runs / a file that nothing checks" found in this repository on 2026-09-25.
//
// Each assertion below maps to a defect actually found while measuring this
// repository's current workflows: it does not assert style preferences, only
// the four properties whose loss has a named, real consequence.

const workflowsDir = new URL("../.github/workflows/", import.meta.url).pathname;

// Cardinality floors. Measured on the current tree (2026-09-25):
// `.github/workflows` holds 15 workflow files, 12 of which match `*-publish.yml`
// (angular, canada, dataviz, graph, latex, npm, quebec, react, skills, svelte,
// themes, vue). The floors below are set clearly under both measured counts —
// enough to survive normal tree growth, but far above zero, so a directory that
// quietly returns no files (a bad path, a renamed folder) still trips the guard
// instead of letting the assertions below pass over an empty set.
const MIN_WORKFLOW_FILES = 12;
const MIN_PUBLISH_WORKFLOW_FILES = 9;

function workflowFiles() {
  let entries;
  try {
    entries = readdirSync(workflowsDir, { withFileTypes: true });
  } catch (error) {
    throw new Error(`expected a readable workflows directory at ${workflowsDir}: ${error.message}`);
  }
  return entries
    .filter((entry) => entry.isFile() && /\.ya?ml$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function publishWorkflowFiles() {
  return workflowFiles().filter((name) => /-publish\.ya?ml$/.test(name));
}

// --- shared structural scan -------------------------------------------------
//
// Nothing in this repository can parse real YAML without adding a dependency.
// `yaml` and `js-yaml` are not direct dependencies here: `yaml` appears only as
// an optional peerDependency of vite deep in package-lock.json, and a clean
// `npm ci` in this worktree leaves no `node_modules/yaml` at all (measured
// 2026-09-25). `require.resolve('yaml')` nonetheless succeeds in a local dev
// shell — it resolves to `/usr/share/nodejs/yaml/dist/index.js`, a Debian
// system package incidental to this machine, not to the project. GitHub's
// hosted runner installs Node through `actions/setup-node` (a standalone
// toolchain, no `/usr/share/nodejs` on its module path), so a guard built on
// that resolution would pass here and silently break in CI. Since adding a new
// npm dependency is out of scope, this scans the raw text instead.
//
// This is a structural sanity scan, not a YAML grammar parser: it tracks
// single/double-quote state and flow-bracket ([]/{}) depth across lines, is
// block-scalar aware (so a `run: |` shell/JS body is carried through verbatim
// and never lexed as YAML), and separates true YAML comments (a `#` preceded
// by whitespace or start-of-line, outside any quote or block scalar) from the
// code around them, returning both: `strippedText` (code only, comments
// removed) for assertions that must not be fooled by a comment merely
// mentioning a forbidden term, and `commentText` (comments only) for the one
// assertion below that specifically needs a human-written comment to exist.
// The separation is not cosmetic: without it, `latex-publish.yml`'s own
// comment ("quebec-publish.yml : aucun NPM_TOKEN n'est utilisé.") and
// `skills-publish.yml`'s comment about a removed bootstrap token both tripped
// the token guard on the clean tree — measured false positives from an
// earlier version of this scan that searched raw text.
function scanWorkflow(text) {
  const lines = text.split("\n");
  const errors = [];
  const strippedLines = [];
  const comments = [];
  let inBlockScalar = false;
  let blockScalarIndent = -1;
  let quoteChar = null;
  const bracketStack = [];
  const closerFor = { "[": "]", "{": "}" };

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];

    if (inBlockScalar) {
      const indent = line.match(/^[ \t]*/)[0].length;
      const isBlank = line.trim().length === 0;
      if (!isBlank && indent <= blockScalarIndent) {
        inBlockScalar = false; // dedent: fall through, this line is normal YAML again
      } else {
        strippedLines.push(line); // literal block-scalar content: kept, never lexed
        continue;
      }
    }

    const leading = line.match(/^[ \t]*/)[0];
    if (leading.includes("\t")) {
      errors.push(`${lineNo}: tab character used for indentation`);
    }

    let out = "";
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (quoteChar) {
        out += ch;
        if (ch === quoteChar) {
          if (quoteChar === "'" && line[c + 1] === "'") {
            out += line[++c]; // '' inside a single-quoted scalar: an escaped quote
          } else {
            quoteChar = null;
          }
        } else if (quoteChar === '"' && ch === "\\" && c + 1 < line.length) {
          out += line[++c]; // consume the escaped character, stay quoted
        }
        continue;
      }
      if (ch === "#" && (c === 0 || /\s/.test(line[c - 1]))) {
        comments.push(line.slice(c)); // a real YAML comment: kept aside, dropped from the code text
        break;
      }
      if (ch === "'" || ch === '"') {
        quoteChar = ch;
        out += ch;
        continue;
      }
      if (ch === "[" || ch === "{") {
        bracketStack.push(closerFor[ch]);
        out += ch;
        continue;
      }
      if (ch === "]" || ch === "}") {
        if (bracketStack.pop() !== ch) {
          errors.push(`${lineNo}: unbalanced "${ch}"`);
        }
        out += ch;
        continue;
      }
      out += ch;
    }
    strippedLines.push(out);

    if (!inBlockScalar && !quoteChar && /:\s*[|>][+-]?\d*$/.test(out.trimEnd())) {
      inBlockScalar = true;
      blockScalarIndent = leading.length;
    }
  }

  if (quoteChar) {
    errors.push(`unterminated ${quoteChar === "'" ? "single" : "double"}-quoted string (never closed before end of file)`);
  }
  if (bracketStack.length > 0) {
    errors.push(`unclosed "${bracketStack.join('", "')}"`);
  }

  return { errors, strippedText: strippedLines.join("\n"), commentText: comments.join("\n") };
}

function readWorkflow(name) {
  return readFileSync(join(workflowsDir, name), "utf8");
}

// --- 1. every workflow must parse ------------------------------------------
// PR #65-class defect this prevents: a workflow file broken by a bad edit
// (an unclosed quote, an unbalanced flow bracket, a tab in its indentation)
// fails silently at the YAML layer with no repository guard to say which file.
test("every workflow under .github/workflows is structurally readable", () => {
  const files = workflowFiles();
  assert.ok(
    files.length >= MIN_WORKFLOW_FILES,
    `expected at least ${MIN_WORKFLOW_FILES} workflow files under .github/workflows, but only saw ${files.length} — the directory may be missing or unreachable`,
  );
  const offenders = [];
  for (const name of files) {
    const { errors } = scanWorkflow(readWorkflow(name));
    if (errors.length > 0) offenders.push(`${name}: ${errors.join("; ")}`);
  }
  assert.deepEqual(offenders, [], `unreadable workflow file(s):\n  ${offenders.join("\n  ")}`);
});

test("the guard actually sees the known publish workflows", () => {
  const files = publishWorkflowFiles();
  for (const expected of ["npm-publish.yml", "svelte-publish.yml", "dataviz-publish.yml"]) {
    assert.ok(files.includes(expected), `expected ${expected} among the inspected publish workflows`);
  }
});

// --- 2. the repository-guards gate cannot disappear in silence -------------
// Wired into verify.yml's `licensing` job today as a single `run:` step. Its
// accidental removal would make all `scripts/*.test.mjs` guards (63 at the
// time this step was added) inert again with nothing to say so.
test("verify.yml keeps the repository guards wired to scripts/run-script-guards.mjs", () => {
  const { strippedText } = scanWorkflow(readWorkflow("verify.yml"));
  assert.ok(
    /run-script-guards\.mjs/.test(strippedText),
    "verify.yml must run scripts/run-script-guards.mjs outside a comment — its removal silently makes every scripts/*.test.mjs guard inert in CI",
  );
});

// --- 3. every publish workflow is Trusted Publishing (OIDC); a token secret,
// when it appears, is declared three times over ---------------------------
//
// The property that matters is not "no token secret" — it is "no token secret
// slipped in by accident or drift". Measured on 2026-09-25: `dataviz-publish.yml`
// deliberately references `secrets.NPM_TOKEN`, gated behind
// `if: ${{ env.NPM_TOKEN != '' }}`, because `@sentropic/dataviz-angular` has
// never been published (confirmed live: `npm view @sentropic/dataviz-angular`
// returns a 404 from the real registry) and npm Trusted Publishing can only be
// configured for a package that already exists on the registry — `docs/release.md`
// documents this exact bootstrap and its own removal step. A guard that turns
// this red would demand fixing intentional, documented code — the sign the
// guard's property was wrong, not the code (this is the same check this
// repository has already applied twice today).
//
// So a token secret is allowed in a *-publish.yml workflow only if all three
// hold, and any one missing turns the guard red:
//   1. conditioned — an `if:` guard disables the step when the secret is empty;
//   2. commented   — a real YAML comment (not a step `name:`) names the
//      bootstrap and the package it exists for;
//   3. declared    — the filename is listed in DECLARED_TOKEN_BOOTSTRAPS below,
//      with the condition for removing the entry.
// A token reference in a workflow that is not listed here — for instance one
// added by accident or by copy-paste drift into a workflow that has no
// business needing it — still turns the guard red on all three counts at
// once, exactly as it did before this list existed.

// Deliberate, conditional npm-token bootstraps. This list is not an exemption
// switch: an entry here still has to satisfy conditions 1 and 2 above, and the
// vacuity test right after this one checks that every entry documents a real
// removal condition and still corresponds to an actual token reference (so a
// forgotten entry does not quietly outlive the bootstrap it was written for).
const DECLARED_TOKEN_BOOTSTRAPS = {
  "dataviz-publish.yml": {
    // Remove this entry — and the bootstrap step/secret it names in the
    // workflow — the day @sentropic/dataviz-angular has a first successful
    // `npm publish`. Measured 404 (never published) on 2026-09-25.
    removeWhen: "@sentropic/dataviz-angular has had a first successful npm publish",
  },
  "latex-publish.yml": {
    // Same shape, same reason as the dataviz entry: npm only lets a trusted
    // publisher be configured on a package that already exists, so the very
    // first publish of a new name cannot come from OIDC alone.
    // Remove this entry — and the bootstrap step/secret it names in the
    // workflow — the day @sentropic/design-system-theme-latex has a first
    // successful `npm publish`. Measured 404 (never published) on 2026-09-25.
    removeWhen: "@sentropic/design-system-theme-latex has had a first successful npm publish",
  },
  "quebec-publish.yml": {
    // Remove this entry — and the bootstrap step/secret it names in the
    // workflow — the day @sentropic/design-system-theme-quebec has a first
    // successful `npm publish`. Measured 404 (never published) on 2026-09-25,
    // although apps/docs already shows its import on the getting-started page.
    removeWhen: "@sentropic/design-system-theme-quebec has had a first successful npm publish",
  },
  "rich-text-publish.yml": {
    // Remove this entry — and the bootstrap step/secret it names in the
    // workflow — the day @sentropic/design-system-rich-text has a first
    // successful `npm publish`. Measured 404 (never published) on 2026-10-30.
    removeWhen: "@sentropic/design-system-rich-text has had a first successful npm publish",
  },
  "elements-publish.yml": {
    // Remove this entry — and the bootstrap step/secret it names in the
    // workflow — the day @sentropic/design-system-elements has a first
    // successful `npm publish`. Measured 404 (never published) on 2026-11-01.
    removeWhen: "@sentropic/design-system-elements has had a first successful npm publish",
  },
  "diagram-core-publish.yml": {
    // Remove this entry — and the bootstrap step/secret it names in the
    // workflow — the day @sentropic/diagram-core has a first successful
    // `npm publish`. Measured E404 (never published) on 2026-11-03.
    removeWhen: "@sentropic/diagram-core has had a first successful npm publish",
  },
};

const BOOTSTRAP_COMMENT_PATTERN = /bootstrap|amor[cç]age/i;
const PACKAGE_MENTION_PATTERN = /@sentropic\/[a-zA-Z0-9._-]+/;

function escapeRegExp(literal) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function referencedTokenNames(strippedText) {
  const names = new Set();
  if (/\bNODE_AUTH_TOKEN\b/.test(strippedText)) names.add("NODE_AUTH_TOKEN");
  if (/\bNPM_TOKEN\b/.test(strippedText)) names.add("NPM_TOKEN");
  for (const match of strippedText.matchAll(/secrets\.(NPM[A-Z0-9_]*)/g)) names.add(match[1]);
  return [...names];
}

// Tolerant of reformatting (either operand order), not of the inverted
// condition: the step must be skipped — not run — when the secret is empty.
function hasEmptyStringGuardFor(strippedText, varName) {
  const v = escapeRegExp(varName);
  const guard = new RegExp(
    `if:[^\\n]*\\b${v}\\b[^\\n]*!=\\s*['"]{2}|if:[^\\n]*['"]{2}\\s*!=[^\\n]*\\b${v}\\b`,
  );
  return guard.test(strippedText);
}

function hasBootstrapNamingComment(commentText) {
  return BOOTSTRAP_COMMENT_PATTERN.test(commentText) && PACKAGE_MENTION_PATTERN.test(commentText);
}

test("every *-publish.yml workflow publishes via Trusted Publishing (OIDC); a token secret is allowed only if conditioned, commented, and declared", () => {
  const files = publishWorkflowFiles();
  assert.ok(
    files.length >= MIN_PUBLISH_WORKFLOW_FILES,
    `expected at least ${MIN_PUBLISH_WORKFLOW_FILES} *-publish.yml workflows, but only saw ${files.length} — the filter may be matching nothing`,
  );
  const offenders = [];
  for (const name of files) {
    const { strippedText, commentText } = scanWorkflow(readWorkflow(name));
    const problems = [];
    if (!/id-token:\s*write/.test(strippedText)) {
      problems.push("missing `id-token: write` in its permissions");
    }
    // All three conditions are checked independently, regardless of whether
    // the file is declared: a token slipped into an undeclared workflow must
    // fail on all three counts at once (conditioned, commented, declared),
    // not stop reporting at the first missing one.
    const tokenNames = referencedTokenNames(strippedText);
    if (tokenNames.length > 0) {
      if (!DECLARED_TOKEN_BOOTSTRAPS[name]) {
        problems.push(
          `references a token secret (${tokenNames.join(", ")}) that is not declared in DECLARED_TOKEN_BOOTSTRAPS`,
        );
      }
      if (!hasBootstrapNamingComment(commentText)) {
        problems.push("no comment in the workflow names the bootstrap and the package it serves");
      }
      for (const varName of tokenNames) {
        if (!hasEmptyStringGuardFor(strippedText, varName)) {
          problems.push(`token secret ${varName} has no \`if:\` guard disabling it when empty`);
        }
      }
    }
    if (problems.length > 0) offenders.push(`${name}: ${problems.join("; ")}`);
  }
  assert.deepEqual(
    offenders,
    [],
    `publish workflow(s) not on declared Trusted Publishing:\n  ${offenders.join("\n  ")}`,
  );
});

// Anti-vacuity for the allowlist itself: a declared entry that no longer
// matches a real token reference, or that carries no removal condition, is
// exactly the kind of permanent, unread hole this design was built to avoid.
test("DECLARED_TOKEN_BOOTSTRAPS has no stale or undocumented entries", () => {
  const files = workflowFiles();
  for (const [name, entry] of Object.entries(DECLARED_TOKEN_BOOTSTRAPS)) {
    assert.ok(
      typeof entry.removeWhen === "string" && entry.removeWhen.trim().length > 0,
      `${name}: DECLARED_TOKEN_BOOTSTRAPS entry must document its removal condition`,
    );
    assert.ok(files.includes(name), `${name}: declared bootstrap does not match any workflow file — stale entry`);
    const { strippedText } = scanWorkflow(readWorkflow(name));
    assert.ok(
      referencedTokenNames(strippedText).length > 0,
      `${name}: declared as a token bootstrap but references no token secret — stale entry, remove it`,
    );
  }
});

// --- 4. every publish workflow refuses to publish an unmerged commit -------
// Measured mechanism (release-guard job, all 12 files today): `git merge-base
// --is-ancestor "$GITHUB_SHA" "origin/${RELEASE_BRANCH}"`. Asserting both
// terms rather than the literal command tolerates reformatting without
// requiring an exact string match.
test("every *-publish.yml workflow refuses to publish a commit that is not an ancestor of the default branch", () => {
  const files = publishWorkflowFiles();
  const offenders = [];
  for (const name of files) {
    const { strippedText } = scanWorkflow(readWorkflow(name));
    if (!/merge-base/.test(strippedText) || !/is-ancestor/.test(strippedText)) {
      offenders.push(name);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `publish workflow(s) missing the tag-is-ancestor-of-default-branch guard:\n  ${offenders.join("\n  ")}`,
  );
});

// --- 5. every file a guard reads can trigger the workflow that runs the guards
// Measured 2026-09-26: a change to `.ds-scrap/METHOD-fr-top50.md` (PR #145) ran
// NO workflow at all, although `verify-theme-invariants.test.mjs` reads that file
// to scope its checks — and only `.github/workflows/verify.yml` was listed, so a
// PR touching nothing but a `*-publish.yml` would have skipped this very file.
// A file a guard reads that cannot trigger the guards is a file whose changes
// land unguarded. The inputs are taken from the guards themselves (every
// `new URL("../<path>", import.meta.url)` in scripts/*.test.mjs), so a guard that
// starts reading a new file brings its trigger requirement with it.
const scriptsDir = new URL("./", import.meta.url).pathname;

function pullRequestPathFilters(verifyText) {
  const lines = verifyText.split("\n");
  const start = lines.findIndex((l) => /^ {2}pull_request:\s*$/.test(l));
  assert.ok(start >= 0, "verify.yml: no `pull_request:` trigger found");
  const pathsAt = lines.findIndex((l, i) => i > start && /^ {4}paths:\s*$/.test(l));
  assert.ok(pathsAt > start, "verify.yml: no `paths:` under `pull_request:`");
  const globs = [];
  for (let i = pathsAt + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*#/.test(line) || line.trim() === "") continue;
    const m = line.match(/^ {6}- ["']?([^"'#]+?)["']?\s*$/);
    if (!m) break;
    globs.push(m[1]);
  }
  return globs;
}

function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*\*/g, "\u0000").replace(/\*/g, "[^/]*").replace(/\u0000/g, ".*")}$`);
}

function filesGuardsRead() {
  const inputs = new Set();
  for (const name of readdirSync(scriptsDir).filter((f) => f.endsWith(".test.mjs"))) {
    const text = readFileSync(join(scriptsDir, name), "utf8");
    for (const m of text.matchAll(/new URL\(\s*["']\.\.\/([A-Za-z0-9._\/-]+)["']/g)) inputs.add(m[1]);
  }
  return [...inputs].sort();
}

test("every file a guard reads can trigger the workflow that runs the guards", () => {
  const globs = pullRequestPathFilters(readWorkflow("verify.yml"));
  const inputs = filesGuardsRead();
  // Vacuity floors, measured 2026-09-26: 8 pull_request globs, 5 guard inputs.
  assert.ok(globs.length >= 6, `expected verify.yml pull_request path filters, found ${globs.length}`);
  assert.ok(inputs.length >= 4, `expected repository files read by the guards, found ${inputs.length}`);
  const patterns = globs.map(globToRegExp);
  const uncovered = inputs.filter((input) => {
    // A directory input (trailing slash) must be covered for a file inside it.
    const probe = input.endsWith("/") ? `${input}any-file` : input;
    return !patterns.some((re) => re.test(probe));
  });
  assert.deepEqual(
    uncovered,
    [],
    `file(s) read by a repository guard that cannot trigger verify.yml on a pull request — ` +
      `a change to them would land with no guard running:\n  ${uncovered.join("\n  ")}`,
  );
});

// --- 6. the AC-L7a tarball guard runs where elements is built ----------------
// Measured 2026-11-01 (Argon B2-1): the guard only ran in the unbuilt
// `licensing` job (where it reports NOT RUN) and in the tag-only `publish`
// job, so a bad tarball passed every PR and push to `main` unchecked. It must
// stay wired into a built job: the `verify` shards of verify.yml (where the
// workspace is built above the step) and the `verify` job of
// elements-publish.yml (the only job that also runs on workflow_dispatch).
// The pack-smoke shards must select the packages smoke-pack actually covers:
// ci-affected-workspaces.mjs omitted `@sentropic/design-system-elements` (and
// `@sentropic/design-system-rich-text`, packed since L7a's smoke-pack wiring
// but never shard-selected), so their shards ran no pack-smoke task at all.
test("the AC-L7a tarball guard runs in a built CI job and pack-smoke shards cover elements and rich-text", () => {
  const { strippedText: verifyText } = scanWorkflow(readWorkflow("verify.yml"));
  assert.ok(
    /node --test scripts\/elements-publish-tarball\.test\.mjs/.test(verifyText),
    "verify.yml must run scripts/elements-publish-tarball.test.mjs in a built shard job — otherwise the AC-L7a guard only ever reports NOT RUN on PR/main CI",
  );
  assert.ok(
    /contains\(matrix\.workspaces,\s*'@sentropic\/design-system-elements'\)/.test(verifyText),
    "verify.yml must condition the tarball guard on the shard selecting @sentropic/design-system-elements (the dataviz lot gate pattern) — the licensing job runs it unbuilt",
  );
  const { strippedText: elementsText } = scanWorkflow(readWorkflow("elements-publish.yml"));
  const runs = elementsText.match(/node --test scripts\/elements-publish-tarball\.test\.mjs/g) ?? [];
  assert.ok(
    runs.length >= 2,
    `elements-publish.yml must run the tarball guard in both verify and publish jobs (found ${runs.length}) — the verify job is the only one that runs on workflow_dispatch`,
  );
  const planner = readFileSync(join(scriptsDir, "ci-affected-workspaces.mjs"), "utf8");
  for (const name of ["@sentropic/design-system-elements", "@sentropic/design-system-rich-text", "@sentropic/diagram-core"]) {
    assert.ok(
      planner.includes(`"${name}"`),
      `scripts/ci-affected-workspaces.mjs must list ${name} in smokePackWorkspaces — otherwise its shards never run a pack-smoke task`,
    );
  }
});

// --- 7. every job that runs a scripts/ step checks out the repository first -
// Measured 2026-11-03 (L7b-a B1): the post-publish-check jobs of
// diagram-core-publish.yml and elements-publish.yml ran
// `node scripts/verify-jsdelivr-published.mjs ...` on a fresh runner with no
// `actions/checkout` step, so every release tag push failed with
// ERR_MODULE_NOT_FOUND after a successful publish. A job that references a
// repository script must check it out first, in the same job.
function jobsWithScriptSteps(strippedText) {
  const lines = strippedText.split("\n");
  const jobsStart = lines.findIndex((line) => /^jobs:\s*$/.test(line));
  if (jobsStart < 0) return [];
  const jobs = [];
  let current = null;
  for (let i = jobsStart + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^[A-Za-z].*:\s*$/.test(line)) break; // next top-level key ends jobs:
    const header = line.match(/^  ([A-Za-z0-9_-]+):\s*$/);
    if (header) {
      current = { name: header[1], lines: [] };
      jobs.push(current);
      continue;
    }
    if (current) current.lines.push(line);
  }
  return jobs;
}

test("every job that runs a scripts/ step checks out the repository first", () => {
  const files = workflowFiles();
  const offenders = [];
  for (const name of files) {
    const { strippedText } = scanWorkflow(readWorkflow(name));
    for (const job of jobsWithScriptSteps(strippedText)) {
      let checkoutAt = -1;
      const scriptSteps = [];
      job.lines.forEach((line, index) => {
        if (checkoutAt < 0 && /actions\/checkout@/.test(line)) checkoutAt = index;
        if (/scripts\/[A-Za-z0-9_.-]+\.mjs/.test(line)) scriptSteps.push({ index, line: line.trim() });
      });
      if (scriptSteps.length === 0) continue;
      if (checkoutAt < 0) {
        offenders.push(`${name} job ${job.name}: runs ${scriptSteps.length} scripts/ step(s) with no actions/checkout in the job`);
      } else {
        const before = scriptSteps.filter((step) => step.index < checkoutAt);
        if (before.length > 0) {
          offenders.push(`${name} job ${job.name}: ${before.length} scripts/ step(s) run before actions/checkout`);
        }
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `job(s) running repository scripts without checking them out:\n  ${offenders.join("\n  ")}`,
  );
});

// --- 8. every remote action reference is pinned to a full commit SHA -------
// Measured 2026-11-03 (lot CI-H): 112 `uses:` references across the 19
// workflows, 7 distinct remote actions, all floating on major tags
// (`actions/checkout@v4`, …). A floating tag resolves to whatever the
// upstream owner last moved it to, so a compromised or mistaken upstream
// retag changes what CI executes with no repository diff to review.
// Pinning `owner/repo@<40-hex-sha>` (human tag kept as a trailing comment,
// refreshed by Dependabot's github-actions ecosystem) makes the executed
// code content-addressed. Local actions (`./…`, `../…`) carry no remote code
// and are excluded; every other `uses:` value must be one of the pinned
// forms accepted by `isPinnedRef` below.
function stripSurroundingQuotes(value) {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}

function usesRefs(strippedText) {
  const refs = [];
  let inBlockScalar = false;
  let blockScalarIndent = -1;
  for (const line of strippedText.split("\n")) {
    if (inBlockScalar) {
      const indent = line.match(/^[ \t]*/)[0].length;
      if (line.trim().length === 0 || indent > blockScalarIndent) {
        continue; // still inside a `run: |` body: never a step ref
      }
      inBlockScalar = false; // dedent: normal YAML again
    }
    if (/:\s*[|>][\d+-]*$/.test(line.trimEnd())) {
      inBlockScalar = true;
      blockScalarIndent = line.match(/^[ \t]*/)[0].length;
      continue;
    }
    if (line.includes("{") && line.includes("}")) {
      let found = false;
      for (const m of line.matchAll(/uses\s*:\s*([^\s,}]+)/g)) {
        found = true;
        const ref = stripSurroundingQuotes(m[1].trim());
        refs.push(ref === "" ? "<empty>" : ref);
      }
      if (found) continue; // a flow line cannot also be a plain `uses:` line
      if (/uses\s*:/.test(line)) {
        refs.push("<empty>"); // flow `uses:` with no value
        continue;
      }
    }
    const match = line.match(/^\s*(?:-\s+)?uses\s*:\s*([^\s,}]+)?/);
    if (match) {
      if (match[1] === undefined) {
        refs.push("<empty>");
      } else {
        const ref = stripSurroundingQuotes(match[1].trim());
        refs.push(ref === "" ? "<empty>" : ref);
      }
    }
  }
  return refs;
}

// Pinned forms: `owner/repo(/path)*@<40 lowercase hex>` (plain, subpath and
// reusable-workflow refs; no `.`/`..` segment) and
// `docker://<image>@sha256:<64 lowercase hex>`. Uppercase hex is rejected.
const PINNED_ACTION_RE =
  /^(?!\.{1,2}(?:[/@]|$))[A-Za-z0-9_.-]+\/(?!\.{1,2}(?:[/@]|$))[A-Za-z0-9_.-]+(?:\/(?!\.{1,2}(?:[/@]|$))[A-Za-z0-9_.-]+)*@[0-9a-f]{40}$/;
const PINNED_DOCKER_RE = /^docker:\/\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*@sha256:[0-9a-f]{64}$/;

function isPinnedRef(ref) {
  return PINNED_ACTION_RE.test(ref) || PINNED_DOCKER_RE.test(ref);
}

test("every remote uses: reference is pinned to a full 40-hex commit SHA", () => {
  const files = workflowFiles();
  const offenders = [];
  for (const name of files) {
    const { strippedText } = scanWorkflow(readWorkflow(name));
    for (const ref of usesRefs(strippedText)) {
      if (ref.startsWith("./") || ref.startsWith("../")) continue; // local action: no remote code
      if (!isPinnedRef(ref)) {
        offenders.push(`${name}: uses: ${ref}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `unpinned remote action reference(s) — pin to owner/repo@<40-hex-sha>:\n  ${offenders.join("\n  ")}`,
  );
});

// --- 9. every workflow declares a least-privilege top-level permissions -----
// Measured 2026-11-03 (lot CI-H): `verify.yml` and
// `design-quality-gate.yml` declared no `permissions:` at all, so their jobs
// ran with the repository-default token scope instead of an explicit
// least-privilege grant. Every workflow must carry one top-level
// `permissions:` key; any broader scope a job really needs
// (`id-token: write` for OIDC publish, `pages: write` for the Pages deploy)
// stays on that job, never at the top level. Accepted top-level forms:
// a block whose every scope is `read`/`none` (default `contents: read`),
// `permissions: {}`, and the scalar `permissions: read-all`. Rejected:
// a missing key, an empty block, `write-all`, and any block scope granting
// more than `read`/`none`. The check is column-0 anchored on the
// comment-stripped text, so a commented-out block or a job-level-only grant
// does not satisfy it.
function hasAcceptableTopLevelPermissions(strippedText) {
  const lines = strippedText.split("\n");
  const idx = lines.findIndex((line) => /^permissions\s*:(.*)$/.test(line));
  if (idx < 0) return false; // missing key
  const rest = lines[idx].replace(/^permissions\s*:(.*)$/, "$1").trim();
  if (/^\{\s*\}$/.test(rest)) return true; // permissions: {}
  if (/^['"]?read-all['"]?$/.test(rest)) return true;
  if (rest !== "") return false; // write-all and every other inline form
  const entries = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    if (/^\S/.test(line)) break; // next top-level key ends the block
    entries.push(line.trim());
  }
  if (entries.length === 0) return false; // empty block
  return entries.every((entry) => /^[a-z-]+\s*:\s*['"]?(?:read|none)['"]?$/.test(entry));
}

test("every workflow declares a top-level permissions: key", () => {
  const files = workflowFiles();
  const offenders = files.filter((name) => {
    const { strippedText } = scanWorkflow(readWorkflow(name));
    return !hasAcceptableTopLevelPermissions(strippedText);
  });
  assert.deepEqual(
    offenders,
    [],
    `workflow(s) without an acceptable least-privilege top-level permissions: grant:\n  ${offenders.join("\n  ")}`,
  );
});

// --- fixtures: item 1, flow-style steps and `uses :` spacing ----------------
test("guard fixture (item 1): flow-style and spaced uses: with pinned SHAs pass", () => {
  const snippet = [
    "jobs:",
    "  build:",
    "    steps:",
    "      - {uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262}",
    "      - { name: x, uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 }",
    "      - uses : actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830",
    "",
  ].join("\n");
  const { strippedText } = scanWorkflow(snippet);
  const refs = usesRefs(strippedText);
  assert.deepEqual(refs, [
    "actions/checkout@11d5960a326750d5838078e36cf38b85af677262",
    "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020",
    "actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830",
  ]);
  assert.ok(refs.every((ref) => isPinnedRef(ref)), `expected every flow/spaced ref pinned, got: ${refs.join(", ")}`);
});

test("guard fixture (item 1): flow-style and spaced uses: with floating tags fail", () => {
  const snippet = [
    "jobs:",
    "  build:",
    "    steps:",
    "      - {uses: actions/checkout@v4}",
    "      - { name: x, uses: actions/setup-node@v4 }",
    "      - uses : actions/cache@v4",
    "",
  ].join("\n");
  const { strippedText } = scanWorkflow(snippet);
  const refs = usesRefs(strippedText);
  assert.deepEqual(refs, ["actions/checkout@v4", "actions/setup-node@v4", "actions/cache@v4"]);
  assert.ok(refs.every((ref) => !isPinnedRef(ref)), "expected every flow/spaced floating ref to be unpinned");
});

// --- fixtures: item 2, block-scalar bodies are not step refs ----------------
test("guard fixture (item 2): uses: inside run: | bodies is not a step ref", () => {
  const snippet = [
    "jobs:",
    "  build:",
    "    steps:",
    "      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262",
    "      - name: script",
    "        run: |",
    "          echo hello",
    "          uses: evil/action@v1",
    "          echo done",
    "        run2: outer",
    "      - name: folded",
    "        run: >",
    "          uses: evil/other@v1",
    "      - name: stripped",
    "        run: |-",
    "          uses: evil/third@v1",
    "      - name: kept",
    "        run: >+2",
    "            uses: evil/fourth@v1",
    "",
  ].join("\n");
  const { strippedText } = scanWorkflow(snippet);
  assert.deepEqual(usesRefs(strippedText), ["actions/checkout@11d5960a326750d5838078e36cf38b85af677262"]);
});

test("guard fixture (item 2): real uses: after a block scalar is still checked", () => {
  const snippet = [
    "jobs:",
    "  build:",
    "    steps:",
    "      - name: script",
    "        run: |",
    "          echo hi",
    "      - uses: evil/action@v1",
    "",
  ].join("\n");
  const { strippedText } = scanWorkflow(snippet);
  const refs = usesRefs(strippedText);
  assert.deepEqual(refs, ["evil/action@v1"]);
  assert.ok(!isPinnedRef(refs[0]), "expected the real ref after the scalar body to fail the pin check");
});

// --- fixtures: item 3, quotes stripped and local refs skipped ----------------
test("guard fixture (item 3): quoted pinned refs pass and local ./ ../ refs are skipped", () => {
  const snippet = [
    "jobs:",
    "  build:",
    "    steps:",
    '      - uses: "actions/checkout@11d5960a326750d5838078e36cf38b85af677262"',
    "      - uses: './.github/actions/local'",
    '      - uses: "../shared/action"',
    "",
  ].join("\n");
  const { strippedText } = scanWorkflow(snippet);
  const refs = usesRefs(strippedText);
  assert.deepEqual(refs, [
    "actions/checkout@11d5960a326750d5838078e36cf38b85af677262",
    "./.github/actions/local",
    "../shared/action",
  ]);
  const remote = refs.filter((ref) => !ref.startsWith("./") && !ref.startsWith("../"));
  assert.deepEqual(remote, ["actions/checkout@11d5960a326750d5838078e36cf38b85af677262"]);
  assert.ok(remote.every((ref) => isPinnedRef(ref)));
});

test("guard fixture (item 3): quoted floating refs fail", () => {
  const snippet = [
    "jobs:",
    "  build:",
    "    steps:",
    '      - uses: "actions/checkout@v4"',
    "      - uses: 'actions/setup-node@v4'",
    "",
  ].join("\n");
  const { strippedText } = scanWorkflow(snippet);
  const refs = usesRefs(strippedText);
  assert.deepEqual(refs, ["actions/checkout@v4", "actions/setup-node@v4"]);
  assert.ok(refs.every((ref) => !isPinnedRef(ref)), "expected quoted floating refs to stay unpinned after quote stripping");
});

// --- fixtures: item 4, subpath / reusable / docker pinned forms --------------
test("guard fixture (item 4): pinned subpath, reusable-workflow and docker digest refs pass", () => {
  const sha40 = "11d5960a326750d5838078e36cf38b85af677262";
  const sha64 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const snippet = [
    "jobs:",
    "  build:",
    "    steps:",
    `      - uses: github/codeql-action/init@${sha40}`,
    `      - uses: myorg/myrepo/.github/workflows/reusable.yml@${sha40}`,
    `      - uses: docker://ghcr.io/myorg/myimage@sha256:${sha64}`,
    "",
  ].join("\n");
  const { strippedText } = scanWorkflow(snippet);
  const refs = usesRefs(strippedText);
  assert.equal(refs.length, 3);
  assert.ok(refs.every((ref) => isPinnedRef(ref)), `expected subpath/reusable/docker refs pinned, got: ${refs.join(", ")}`);
});

test("guard fixture (item 4): uppercase SHAs, dot-segments and floating docker refs fail", () => {
  const sha40upper = "11D5960A326750D5838078E36CF38B85AF677262";
  const sha40 = "11d5960a326750d5838078e36cf38b85af677262";
  const sha64upper = "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855";
  const snippet = [
    "jobs:",
    "  build:",
    "    steps:",
    `      - uses: actions/checkout@${sha40upper}`,
    `      - uses: myorg/myrepo/../evil@${sha40}`,
    "      - uses: docker://alpine:latest",
    `      - uses: docker://alpine@sha256:${sha64upper}`,
    "",
  ].join("\n");
  const { strippedText } = scanWorkflow(snippet);
  const refs = usesRefs(strippedText);
  assert.equal(refs.length, 4);
  assert.ok(refs.every((ref) => !isPinnedRef(ref)), `expected every bad pin shape rejected, got: ${refs.join(", ")}`);
});

// --- fixtures: item 5, least-privilege top-level permissions -----------------
test("guard fixture (item 5): block, {} and read-all top-level permissions pass", () => {
  const block = ["permissions:", "  contents: read", "jobs:", "  build:", "    runs-on: ubuntu-latest", ""].join("\n");
  const emptyMap = ["permissions: {}", "jobs:", "  build:", "    runs-on: ubuntu-latest", ""].join("\n");
  const readAll = ["permissions: read-all", "jobs:", "  build:", "    runs-on: ubuntu-latest", ""].join("\n");
  for (const snippet of [block, emptyMap, readAll]) {
    const { strippedText } = scanWorkflow(snippet);
    assert.ok(hasAcceptableTopLevelPermissions(strippedText), `expected acceptable permissions, got:\n${snippet}`);
  }
});

test("guard fixture (item 5): missing, empty, write-all and write scopes fail", () => {
  const missing = ["jobs:", "  build:", "    runs-on: ubuntu-latest", ""].join("\n");
  const emptyBlock = ["permissions:", "jobs:", "  build:", "    runs-on: ubuntu-latest", ""].join("\n");
  const writeAll = ["permissions: write-all", "jobs:", "  build:", "    runs-on: ubuntu-latest", ""].join("\n");
  const writeScope = ["permissions:", "  contents: write", "jobs:", "  build:", "    runs-on: ubuntu-latest", ""].join("\n");
  for (const snippet of [missing, emptyBlock, writeAll, writeScope]) {
    const { strippedText } = scanWorkflow(snippet);
    assert.ok(!hasAcceptableTopLevelPermissions(strippedText), `expected rejected permissions, got:\n${snippet}`);
  }
});

// --- W-DL0.11 (§2.9 of SPEC_EVOL_DL01_BIJECTION_HARNESS): raw-label-gate.yml -
// The CI raw-label gate must run on every pull request and every push to main
// with no path filter (a raw label can land in any file), must install no npm
// package (the only code that sees the secret is the dependency-free gate), and
// must expose DL_RAWGATE_KEY to the gate step only.
test("raw-label-gate.yml has no paths/paths-ignore filter and triggers on pull_request and push to main", () => {
  const { strippedText } = scanWorkflow(readWorkflow("raw-label-gate.yml"));
  assert.ok(
    !/^\s*paths(-ignore)?\s*:/m.test(strippedText),
    "raw-label-gate.yml must not carry a paths or paths-ignore filter: a raw label can land in any file",
  );
  assert.ok(/^ {2}pull_request:\s*$/m.test(strippedText), "raw-label-gate.yml must trigger on pull_request");
  assert.ok(/^ {2}push:\s*$/m.test(strippedText), "raw-label-gate.yml must trigger on push");
  assert.ok(
    /branches\s*:\s*\[\s*"main"\s*\]/.test(strippedText),
    "raw-label-gate.yml must scope its push trigger to main",
  );
});

test("raw-label-gate.yml installs no npm package and checks out with full history", () => {
  const { strippedText } = scanWorkflow(readWorkflow("raw-label-gate.yml"));
  assert.ok(
    !/\bnpm\s+(ci|install|i)\b/.test(strippedText),
    "raw-label-gate.yml must not run npm ci/install: the gate is dependency-free",
  );
  assert.ok(
    !/cache\s*:\s*["']?npm/.test(strippedText),
    "raw-label-gate.yml must not cache npm: no npm install happens in this workflow",
  );
  assert.ok(/fetch-depth:\s*0/.test(strippedText), "raw-label-gate.yml must fetch full history for the commit ranges");
});

test("raw-label-gate.yml exposes DL_RAWGATE_KEY to the gate step only and fails closed", () => {
  const { strippedText } = scanWorkflow(readWorkflow("raw-label-gate.yml"));
  const occurrences = strippedText.match(/DL_RAWGATE_KEY\s*:/g) ?? [];
  assert.equal(
    occurrences.length,
    1,
    `DL_RAWGATE_KEY must be set exactly once (the gate step env), saw ${occurrences.length}`,
  );
  assert.ok(
    /DL_RAWGATE_KEY:\s*\$\{\{\s*secrets\.DL_RAWGATE_KEY\s*\}\}/.test(strippedText),
    "the gate step must read the secret from secrets.DL_RAWGATE_KEY",
  );
  assert.ok(/DL_RAWGATE_REQUIRED:\s*"1"/.test(strippedText), "the gate must fail closed when the secret is absent");
  assert.ok(
    /dl-rawgate\.mjs\s+scan\s+--tree\s+--commits=/.test(strippedText),
    "the gate step must run the tree scan and the commit-message scan",
  );
});
