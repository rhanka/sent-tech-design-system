# ui@1 ontology — L0

The DS owns the `ui@1` profile (`sentropic-ds:ui@1`) and the future **index ui**
skill. Each application owns its instances; `ds-catalog` is one producer alongside
`app-<appId>`. The profile has 20 node types and 30 relation types.

This private workspace commits the approved r3 profile in engram YAML format,
node identities, profile pins, a read-only `--check` command and a skill skeleton.
Extraction passes, generated fragments and manifests start in L1. No catalog
entry, release tag or publication is created by L0.

## Ownership and format dependency

Engram owns the format, validation and admission. This draft depends on released
**engram 0.27.0**, tag `v0.27.0`, commit `566cbbd4`. Its pending additive format
amendment must include relation cardinalities in `profile_hash` and separate node
and relation presentation into `presentation_hash`. The current validator accepts
the extra draft fields without enforcing all their semantics. Re-pin once when
the amendment lands; passing today's validator does not establish qualification.

Publication is gated on that amendment. Engram catalog registration also waits
for the third-party registration contract and cluster-mesh discovery, per the
owner decision. The future bridge `ui-bridge@1` belongs to engram; its declarations
in `x_ui` are design metadata, not registered relations.

## Pins and V1 correction

`profile-pin.json` distinguishes the approved study pins from the committed YAML
pins. Study r3 normalized hash is `90aa6438…42de`, parsed-document hash is
`cf1b524c…1fd8`, bundle digest is `dd6298d0…d798`, and source JSON byte hash is
`cf2f6894…4e06`. The parsed-document hash is distinct from the file-byte hash.

The sole document change is review V1: one ui element has at most one app-context
Component; one app-context Component may have several ui elements. Cardinalities
remain `{ source: "0..1", target: "0..n", status: "provisional" }`. YAML formatting
changes the byte hash; V1 changes the parsed-document and bundle digests. The
normalized `profile_hash` remains unchanged because `x_ui` is outside that hash.
The historical proposed `.json` path in draft metadata records the study; the
actual profile is [profiles/ui/v1/profile.yaml](profiles/ui/v1/profile.yaml).

The provenance helper restores only the pre-V1 sentence to reproduce the study's
parsed-document and bundle hashes without retaining a duplicate profile. Its
reserialized JSON byte hash is pinned separately: the original draft used mixed
array formatting. The original source-byte hash is recorded as provenance.

## Checks

Run from the repository root, with the task's `npm_config_cache` exported:

```sh
npm run check -w @sentropic/ui-ontology
npm run test -w @sentropic/ui-ontology
```

The ordinary checks verify committed bytes, provenance and identity behavior
offline. No runtime dependency on engram or graphify is introduced. Engram 0.27.0
publishes `bundleProfile`, but its parsing/normalization/validator functions are
exposed through the full application entrypoint rather than an isolated validator
subpath. L0 therefore uses release sources for the complete digest check and
vendors no implementation. `esbuild`, `yaml` and TypeScript are workspace-only
development tools.

Reproduce the full pin test with the released sources, as in STUDY §10.3:

```sh
mkdir -p /tmp/ds-ui-engram-027
git -C /path/to/engram archive v0.27.0 | tar -x -C /tmp/ds-ui-engram-027
# Make the installed yaml dependency available to the extracted sources.
ln -s "$PWD/node_modules" /tmp/ds-ui-engram-027/node_modules
npm run profile:verify -w @sentropic/ui-ontology -- /tmp/ds-ui-engram-027
ENGRAM_SOURCE_DIR=/tmp/ds-ui-engram-027 npm run test -w @sentropic/ui-ontology
```

This verification command checks release identity and SHA-256 of every engram TS
source in the validator closure, compiles into a temporary directory, then runs
the released `parseOntologyProfile`, `validateOntologyProfile`,
`normalizeOntologyProfile`, `hashOntologyProfile` and `bundleProfile` logic.
It requires zero errors and warnings and exact study/corrected digest matches.
`bundleProfile` receives no second argument (bindings-only). No pins are updated
by the command. `ENGRAM_SOURCE_DIR` can supply the source directory instead.

For engram's CLI validation, create a temporary `engram.yaml` containing:

```yaml
profile:
  path: /absolute/path/to/packages/ui-ontology/profiles/ui/v1/profile.yaml
inputs:
  corpus: [/absolute/path/to/packages/ui-ontology/README.md]
```

Then run `engram profile validate --root /path/to/temporary-directory --config
/path/to/temporary-directory/engram.yaml --profile-out /tmp/ui-normalized.json`
using engram 0.27.0. Its CLI validates/normalizes; use `profile:verify` above to
recompute all digest pins, including the bindings-only bundle digest.

## Node identities

`uiNodeId(repoKey, nodeType, seedTuple)` hashes the UTF-8 canonical string tuple
`["ui@1", repoKey, nodeType, ...seedTuple]` with SHA-256, takes its first 32 hex
characters and prepends the approved type prefix. String-array JSON matches JCS
for well-formed Unicode strings; malformed surrogate strings are rejected.
Tuple encoding prevents delimiter ambiguity. Truncated hashes retain a theoretical
collision risk. Follow the per-type seeds in `x_ui.node_id.seeds`; locators and
display labels are attributes. Shared-vocabulary consumers reference owner-minted
IDs rather than minting their own copies.
