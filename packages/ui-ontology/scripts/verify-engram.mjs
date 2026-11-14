import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { pin, readProfile, sha256, studyBytes } from "./profile.mjs";

// Compile only the released validator closure into an ephemeral directory.
// No engram implementation is copied into the DS or installed at runtime.
const sourceRoot = process.argv[2] ?? process.env.ENGRAM_SOURCE_DIR;
assert.ok(sourceRoot, "Pass an extracted engram v0.27.0 source directory");
const root = resolve(sourceRoot);
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
assert.equal(manifest.name, pin.validator.name);
assert.equal(manifest.version, pin.validator.version);
for (const [file, digest] of Object.entries(pin.validator.sources)) {
  assert.equal(sha256(readFileSync(join(root, file))), digest, `Released source mismatch: ${file}`);
}
const scratch = mkdtempSync(join(tmpdir(), "ds-ui-pin-"));
try {
  const outfile = join(scratch, "validator.cjs");
  const built = await build({
    stdin: {
      contents: `export { parseOntologyProfile, validateOntologyProfile, normalizeOntologyProfile, hashOntologyProfile } from ${JSON.stringify(join(root, "src/ontology-profile.ts"))}; export { bundleProfile } from ${JSON.stringify(join(root, "src/profile-bundle.ts"))};`,
      resolveDir: root,
    },
    bundle: true, platform: "node", format: "cjs", outfile, metafile: true,
  });
  // Refuse an unpinned local TS dependency added to the validator closure.
  for (const file of Object.keys(built.metafile.inputs).filter(file => file.endsWith(".ts"))) {
    const absolute = resolve(file);
    assert.ok(Object.keys(pin.validator.sources).some(source => join(root, source) === absolute), `Unpinned source: ${file}`);
  }
  const api = createRequire(import.meta.url)(outfile);
  function measure(raw) {
    const parsed = api.parseOntologyProfile(raw);
    const errors = api.validateOntologyProfile(parsed);
    assert.deepEqual(errors, []);
    const bundled = api.bundleProfile(parsed); // No second argument: bindings-only.
    assert.equal(bundled.ok, true, JSON.stringify(bundled));
    return {
      profileHash: api.normalizeOntologyProfile(parsed).profile_hash,
      parsedHash: api.hashOntologyProfile(parsed),
      bundleDigest: bundled.bundle.digest,
      rawSha256: sha256(raw),
      nodeTypes: Object.keys(parsed.node_types).length,
      relationTypes: Object.keys(parsed.relation_types).length,
      errors, warnings: bundled.warnings,
    };
  }
  const { raw, parsed } = readProfile();
  assert.deepEqual(measure(studyBytes(parsed)), { ...pin.study, rawSha256: pin.studyReserializedSha256 }, "Study release pins (reserialized JSON)");
  assert.deepEqual(measure(raw), pin.committed, "V1-corrected YAML release pins");
  console.log("engram 0.27.0: study and committed pins match; 0 errors, 0 warnings");
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
