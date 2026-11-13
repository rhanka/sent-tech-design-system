# Dataviz bench decisions

Target: feat/vapor-lane-dataviz; reversible harness extension of the existing six gates.

1. Share the checker, worker, compiler/normalizer and capture engine through scripts/vue-conversion-bench; package wrappers supply roots and fixture discovery. Keep src/index.ts separate from src/lib.
2. Capture selected originals only; refuse overwrite; keep source revision, source/fixture hashes and public export manifests. Preserve byte-for-byte golden comparisons.
3. Route DS imports to its native Vapor entry during Vapor compilation; eligibility follows the selected named DS exports. Keep unsupported legacy children excluded.
4. Prove CrossfilteredBarChart (selection/aggregation), DrillBarChart (hierarchy), SmallMultiples (faceting/shared domains), then handle FieldPane and PalettePicker.
5. Preserve the DS Grid markup locally in SmallMultiples so its only runtime child is the existing native BarChart. Separate BarChart's pure scale calculations from the legacy accessibility renderer to make the published BarChart export eligible.

Two independent read-only design reviews were reconciled: correctness review required distinct roots, selected captures, shared build hash, multi-export mapping and built-entry verification; fidelity review required computed store subscriptions and preserving FieldPane's two different DOM branches plus palette layout/order. All accepted. Alternative geometry chart proofs would need larger DS presenter ports, so the three chosen stateful chart adapters minimize prerequisite changes.

Formal author-complementary h2a review is unavailable in this session: no h2a launch tool is exposed. No consensus review claim is made. No harness recorder or Track write is used under the task restrictions.
