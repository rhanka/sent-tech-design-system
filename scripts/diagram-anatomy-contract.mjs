import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { CARD_GEOMETRY, ZONE_GEOMETRY, layoutCard, layoutZone, defaultCardMeasure } from '../packages/diagram-canvas/dist/presentation/diagramCardModel.js';
import { getDiagramGlyph } from '../packages/diagram-canvas/dist/presentation/registry.js';
import { component } from '../packages/tokens/dist/component.js';
const props={entityId:'contract',kicker:'KICKER',title:'Title',body:['Body','Detail'],detailCount:1,footer:'Footer',icon:'base',iconGlyph:getDiagramGlyph('base'),autoSize:true,toggle:{collapsed:true,label:'Expand'}};
const paths=['packages/components-svelte/src/lib/DiagramCard.svelte','packages/components-svelte/src/lib/DiagramZone.svelte','packages/components-svelte/src/lib/DiagramCardHeader.svelte','packages/components-svelte/src/lib/DiagramZoneHeader.svelte','packages/components-vue/src/DiagramCard.vue','packages/components-vue/src/DiagramZone.vue','packages/components-vue/src/DiagramCardHeader.vue','packages/components-vue/src/DiagramZoneHeader.vue'];
const hostStyles=Object.fromEntries(paths.map(path=>[path,createHash('sha256').update(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8').match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1]??'').digest('hex')]));
const contract={contractId:'diagram-anatomy/v1',source:'MemoryContainerFigureR14 slot anatomy; owner A7 equal toggle inset, A10 neutral accent',appliesTo:['svelte','vue','react','angular','preact'],cardGeometry:CARD_GEOMETRY,zoneGeometry:ZONE_GEOMETRY,
 card:layoutCard(props,defaultCardMeasure),zones:[true,false].map(collapsed=>layoutZone({entityId:'contract-zone',kicker:'KICKER',title:'Zone',subtitle:'Subtitle',footer:'Footer',icon:'cluster',iconGlyph:getDiagramGlyph('cluster'),collapsed,toggleLabel:'Toggle',width:600},defaultCardMeasure)),
 tokens:{card:component.diagramCard,zone:component.diagramZone,icon:component.diagramIcon},hostStyles,colors:{edge:'#64748b',labelSurface:'#ffffff',labelBorder:'#cbd5e1',labelText:'#172033'},fontFamily:'Inter, system-ui, sans-serif'};
const path=new URL('../packages/diagram-canvas/contracts/diagram-anatomy.v1.json',import.meta.url);
const output=JSON.stringify(contract,null,2)+'\n';
if(process.argv.includes('--write'))fs.writeFileSync(path,output);
else if(fs.readFileSync(path,'utf8')!==output)throw new Error('Diagram anatomy changed. Update the golden, add the anatomy change PR label, and describe it for owner review.');
