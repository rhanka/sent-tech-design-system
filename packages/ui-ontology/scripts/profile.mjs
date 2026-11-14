import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { parse } from "yaml";

export const profileUrl = new URL("../profiles/ui/v1/profile.yaml", import.meta.url);
export const pin = JSON.parse(readFileSync(new URL("../profile-pin.json", import.meta.url), "utf8"));
export const sha256 = value => createHash("sha256").update(value).digest("hex");
export const correctedSentence = "One ui code element has at most one app-context Component (source: 0..1); one app-context Component may have several ui code elements (target: 0..n), hence provisional.";
// Review-r3 provenance only: restore the exact pre-V1 sentence to verify study pins.
const studySentence = "One app-context Component maps to 0..1 ui code elements (0..1 on the source side: one code symbol has at most one ui view/layout/component grain; 0..n on the target side: one ui code element may be seen as component and as view in different projections until the grain split settles, hence provisional).";
export function readProfile() {
  const raw = readFileSync(profileUrl, "utf8");
  return { raw, parsed: parse(raw) };
}
export function studyBytes(parsed) {
  const study = structuredClone(parsed);
  const bridge = study.x_ui.bridges.relation_types.implementsUiElement;
  if (!bridge.asserted_by.includes(correctedSentence)) throw new Error("Missing V1 correction");
  bridge.asserted_by = bridge.asserted_by.replace(correctedSentence, studySentence);
  return JSON.stringify(study, null, 2) + "\n";
}
