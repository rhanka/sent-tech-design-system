/** Resolve document relation refinements and diagram-presentation@2 at the boundary of the frozen presentation adapter. */
import {
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  isPresentationContractV2Pin,
  type PresentationPin,
} from "./presentation.js";
import { validateDiagramPresentation as validatePinnedPresentation } from "./presentation-validate.js";
import { relationBaseType } from "./relation-types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeV2View(view: Parameters<typeof validatePinnedPresentation>[1]): Parameters<typeof validatePinnedPresentation>[1] {
  const diagram = view.presentation.diagram as unknown;
  if (!isRecord(diagram) || !isRecord(diagram["contractPin"])) return view;
  if (!isPresentationContractV2Pin(diagram["contractPin"] as unknown as PresentationPin)) return view;
  const rawEntities = diagram["entities"];
  if (!isRecord(rawEntities)) {
    return {
      ...view,
      presentation: {
        ...view.presentation,
        diagram: { ...diagram, contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN } } as never,
      },
    };
  }
  const entities: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(rawEntities)) {
    if (isRecord(entry) && "align" in entry) {
      const align = entry["align"];
      if (align === undefined || align === "left" || align === "center") {
        const { align: _validAlign, ...rest } = entry;
        void _validAlign;
        entities[key] = rest;
        continue;
      }
    }
    entities[key] = entry;
  }
  return {
    ...view,
    presentation: {
      ...view.presentation,
      diagram: {
        ...diagram,
        contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
        entities,
      } as never,
    },
  };
}

export function validateDiagramPresentation(...args: Parameters<typeof validatePinnedPresentation>): ReturnType<typeof validatePinnedPresentation> {
  const [document,view,options]=args;
  let changed=false;
  const relations=Object.fromEntries(Object.entries(document.relations).map(([id,relation])=>{
    const profile=options.registry.get(relation.profile);
    const type=profile===undefined?relation.type:relationBaseType(document,profile,relation);
    if(type===relation.type)return[id,relation];
    changed=true;return[id,{...relation,type}];
  }));
  return validatePinnedPresentation(changed?{...document,relations}:document,normalizeV2View(view),options);
}
