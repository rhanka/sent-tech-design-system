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
