import { diagnostic, type Diagnostic } from './diagnostics.js';
import type { SemanticDocument } from './document.js';
import type { Profile } from './profile.js';
export function validateErdKeys(document: SemanticDocument, profile: Profile, maxFields: number): Diagnostic[] {
  const out: Diagnostic[] = [];
  const report = (code: Diagnostic['code'], path: string, message: string) => out.push(diagnostic({ code, path, message }));
  for (const entity of Object.values(document.entities).filter(e => e.profile === profile.id)) {
    const fields = Object.values(document.ports).filter(p => p.owner === entity.id);
    const path = 'entities.' + entity.id;
    const keys = fields.filter(p => p.attributes.pk?.kind === 'boolean' && p.attributes.pk.value);
    if (keys.length !== 1)
      report(keys.length ? 'erd-multiple-pk' : 'erd-missing-pk', path, 'An entity requires exactly one primary key');
    if (fields.length > maxFields)
      report('limit-exceeded', path, 'Too many attribute rows: ' + fields.length);
    if (new Set(fields.map(p => p.name)).size !== fields.length || new Set(fields.map(p => p.attributes.ordinal?.kind === 'quantity' ? p.attributes.ordinal.value : -1)).size !== fields.length)
      report('erd-duplicate-field', path, 'Field names and ordinals must be distinct');
    for (const field of fields) {
      const fk = field.attributes.fk;
      if (fk?.kind !== 'reference')
        continue;
      const target = document.ports[fk.value];
      if (!target)
        report('erd-dangling-fk', 'ports.' + field.id, 'Foreign key target is missing: ' + fk.value);
      else if (target.profile !== profile.id || target.attributes.pk?.kind !== 'boolean' || !target.attributes.pk.value)
        report('erd-invalid-fk-target', 'ports.' + field.id, 'Foreign key must target a primary key');
    }
  }
  for (const relation of Object.values(document.relations).filter(r => r.profile === profile.id)) {
    for (const role of ['from', 'to'])
      if (!relation.endpoints.some(e => e.role === role))
        report('erd-missing-end', 'relations.' + relation.id, 'Missing relationship end: ' + role);
  }
  return out;
}
