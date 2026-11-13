# Focus 0.6.0 installation source

The root lockfile resolves `@sentropic/focus@0.6.0` to the adjacent tarball.
The Elements manifest keeps its exact `0.6.0` dependency for consumers.
`npm ci` can therefore install this checkout without an unpublished npm URL
or a dependency on an external worktree.

This archive was packed from the existing owner build at
`rhanka/h2a` commit `e49612b3811dc40b501c54400ebf086d74ec4839`, in
`tmp/worktrees/focus-060-publish/packages/focus`, using
`npm pack <owner-package-directory> --ignore-scripts --pack-destination <destination>`.
The owner worktree was clean and was only read. No owner sources, schema
bytes, compiled files or package version were changed.

- Archive SHA-256: `6f32b9aba3b895bd82427f87663f66fabaa9477b7e33432bc721c2d9747c4558`.
- Archive npm integrity: `sha512-xcp3N6V65FWf1kqNKr5ehCsz5xukCys0WTRltTjXz5G2OVQLBoLB/YH51/gbDw95oozdioX4/OPCa4JjtgFwxQ==`.
- Embedded v1 schema id: `urn:sentropic:focus:DecisionDossierDocument:1.1.0`.
- Schema SHA-256: `f4b5247f025e99081c20fd9a8b0ed98b32a061c4a98597010be0264e5e564c6c`.

This is an owner build archive, not a registry publication. On 2026-11-12,
the public registry and its `focus-0.6.0.tgz` URL returned 404. Before
publishing Elements 0.3.0, the owner must publish Focus 0.6.0 and the
lockfile must be refreshed against that registry artifact, retaining the
schema pin and rerunning the package checks. The `vendor` directory is
excluded from the published Elements package by its `files` allow-list.
