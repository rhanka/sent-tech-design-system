# DC-2a acceptance fixtures

Clearance line (SPEC_EVOL_DC2A_ROWPACK_AUTOLAYOUT §9.2): the only dossier
content copied into this repository for DC-2a is the semantic and views JSON of
the ten non-confidential cases below. No anonymised dossier and no other source
is copied here.

| Case | Views | Intent |
| --- | --- | --- |
| `vue-globale` | `before`, `intermediate`, `after`, `folded` | Largest scene; four independent source views. |
| `ajout-preprod` | `before`, `intermediate`, `after`, `folded` | Transition scene: a pre-production stage is added. |
| `migration-cluster-mesh` | `before`, `intermediate`, `after`, `folded` | Transition scene: topology change toward a cluster mesh. |
| `case-a` | `unfolded`, `pkg-folded`, `track-folded` | Regression scene (owner verdict: ok). |
| `case-b` | `unfolded`, `mesh-engram-folded`, `folded` | Vertical spacing and zoom defect. |
| `case-c` | `unfolded`, `lib-folded`, `folded` | Vertical spacing reserve. |
| `case-d` | `unfolded`, `folded` | Vertical spacing reserve. |
| `case-skills-r9` | `unfolded`, `skills-unfolded`, `folded` | Ten sibling cards in one group: both-axis gutter witness. |
| `case-integration-r9` | `unfolded`, `folded` | Four root zones with cross-zone links. |
| `case-trackfocus-r9` | `unfolded`, `inner-folded`, `folded` | Orientation must follow the fold state. |

Each folder holds `<case>.semantic.json` (`archi@1` source of record) and
`<case>.views.json` (cards, edges, summaries and the exported `view@2` per
view). The harness (`../scenes.ts`) derives one `generic@1` document per view
from `cards[]` and `edges[]`; reading order is the `cards[]` array order.
The exported grid geometry inside `view` is input documentation only and is
never pinned as layout output. Legends are not part of `cards[]` and are not
drawn by the harness.

`../baseline.json` records the §7 metrics of the column placement (the engine
without the `rowPack` option) at the 1440 × 810 frame.
