# diagram-icons — provenance ledger (DC-1)

Spec: `spec/SPEC_EVOL_DS_DIAGRAM_CARDS.md` §9.3. One row per shipped glyph:
shipped name, source repository + commit + file, canonical-base redraw
(yes/no), layer notes.

Family contract (§9.1): `viewBox="0 0 64 64"`, canonical base diamond
`M8 53L32 44L56 53L32 62Z`, layers base (info 18 %) / face (info 75 % +
stroke 1.5) / line (surface, 2.5; dark variant info). Layer colours resolve
through the `diagramIcon` component tokens. No per-glyph colour, no raw hex.

No name collides across the two sources (radar 19 vs kit 9 are disjoint),
so no collision alias was recorded.

## radar-immobilier (19)

Source: `~/src/radar-immobilier`, commit `fa8133c2`,
`docs/architecture/focus/service-icons.js`. Header: "Original, local
pictograms. These are service symbols, not vendor logos." MIT package —
no third-party notice (original Sentropic pictograms, §9.3).

Redraw: **base-only**. The radar viewBox is already 64-unit and the
interiors are preserved verbatim; only the base diamond is replaced by the
canonical #711 base (radar `M7 54L32 42L57 54L32 64Z` differs by 1–2 units,
DIF-12). The radar fixed palette (`#dceaff` / `#639dff` / `#3f7ae0` /
`#e6f0ff` / `#3575d9`) is a provenance note only and is not shipped (DIF-13).

| Shipped name | Source name | Redraw | Layer notes |
| --- | --- | --- | --- |
| `s3` | `s3` | base-only | text `S3` (13 units, weight 750, surface fill) kept as glyph asset |
| `postgres` | `postgres` | base-only | face + line |
| `cluster` | `cluster` | base-only | face + line |
| `web` | `web` | base-only | face + line |
| `api` | `api` | base-only | face + line |
| `cronjob` | `cronjob` | base-only | face + line (empty source text dropped) |
| `identity` | `identity` | base-only | face + line |
| `workstation` | `workstation` | base-only | face + line |
| `document` | `document` | base-only | face + line |
| `map` | `map` | base-only | face + line |
| `join` | `join` | base-only | face + line, **dark line** (info accent stroke) |
| `graph` | `graph` | base-only | face + line, **dark line** (info accent stroke) |
| `check` | `check` | base-only | face + line |
| `release` | `release` | base-only | face + line |
| `user` | `user` | base-only | face + line |
| `url` | `url` | base-only | face + line |
| `llm` | `llm` | base-only | face + line |
| `network` | `network` | base-only | face + line, **dark line** (info accent stroke) |
| `unknown` | `unknown` | base-only | face + line |

## sentropic #711 via the hrpolnav kit (9)

Source: `~/src/sentropic`, merge `4138a0ecba9c5b37409abb5ac00f732d02b7dc8d`,
`docs/governance/kit/src/architecture-icons.js` (byte-identical copy at
`/home/antoinefa/src/airbus-genair-hrpolnav/docs/ard/decision/focus/governance-kit/src/architecture-icons.js`,
sha256 `7a6b5c95fdc90dddf6340a2fc7f9aecce5010c393101b42a7d97826fe2ad1209`).

Redraw: **no** (verbatim geometry — already on the canonical base).

| Shipped name | Source name | Redraw | Layer notes |
| --- | --- | --- | --- |
| `people` | `people` | no | face only (no detail line) |
| `window` | `window` | no | face + line |
| `server` | `server` | no | face + line |
| `brain` | `brain` | no | face + line — mandatory frozen addition (AI) |
| `robot` | `robot` | no | face + line — mandatory frozen addition (agents) |
| `link` | `link` | no | face + line, **dark line** flag |
| `db` | `db` | no | face + line |
| `shield` | `shield` | no | face + line |
| `cloud` | `cloud` | no | face only (no detail line) |

The kit `groupIcons` zone→glyph table is scene content of those diagrams,
not part of the shipped set: the DS names the glyph per entity (§9.2, DH-11).
