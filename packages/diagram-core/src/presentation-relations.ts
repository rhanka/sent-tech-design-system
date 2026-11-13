/** Resolve document relation refinements at the boundary of the frozen presentation adapter. */
import { validateDiagramPresentation as validatePinnedPresentation } from "./presentation-validate.js";
import { relationBaseType } from "./relation-types.js";

export function validateDiagramPresentation(...args: Parameters<typeof validatePinnedPresentation>): ReturnType<typeof validatePinnedPresentation> {
  const [document,view,options]=args;
  let changed=false;
  const relations=Object.fromEntries(Object.entries(document.relations).map(([id,relation])=>{
    const profile=options.registry.get(relation.profile);
    const type=profile===undefined?relation.type:relationBaseType(document,profile,relation);
    if(type===relation.type)return[id,relation];
    changed=true;return[id,{...relation,type}];
  }));
  return validatePinnedPresentation(changed?{...document,relations}:document,view,options);
}
