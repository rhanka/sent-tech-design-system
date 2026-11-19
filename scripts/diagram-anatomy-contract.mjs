import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { CARD_GEOMETRY, CARD_GEOMETRY_V2, ZONE_GEOMETRY, ZONE_GEOMETRY_V2, layoutCard, layoutZone, defaultCardMeasure } from '../packages/diagram-canvas/dist/presentation/diagramCardModel.js';
import { getDiagramGlyph } from '../packages/diagram-canvas/dist/presentation/registry.js';
import { component } from '../packages/tokens/dist/component.js';
const props={entityId:'contract',kicker:'KICKER',title:'Title',body:['Body','Detail'],detailCount:1,footer:'Footer',icon:'base',iconGlyph:getDiagramGlyph('base'),autoSize:true,toggle:{collapsed:true,label:'Expand'}};
const propsV2={...props,anatomy:'v2'};
const paths=['packages/components-svelte/src/lib/DiagramCard.svelte','packages/components-svelte/src/lib/DiagramZone.svelte','packages/components-svelte/src/lib/DiagramCardHeader.svelte','packages/components-svelte/src/lib/DiagramZoneHeader.svelte','packages/components-vue/src/DiagramCard.vue','packages/components-vue/src/DiagramZone.vue','packages/components-vue/src/DiagramCardHeader.vue','packages/components-vue/src/DiagramZoneHeader.vue'];
paths.push('packages/components-svelte/src/lib/IconButton.svelte');
const hostStyles=Object.fromEntries(paths.map(path=>[path,createHash('sha256').update(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8').match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1]??'').digest('hex')]));
const buttonCss=fs.readFileSync(new URL('../packages/components-vue/src/styles.css',import.meta.url),'utf8').match(/\.st-iconButton[^{}]*\{[^}]*\}/g)??[];
const diagramCardCssText=fs.readFileSync(new URL('../packages/components-vue/src/styles.css',import.meta.url),'utf8').replaceAll(/\/\*[\s\S]*?\*\//g,'');
const diagramCardCss=diagramCardCssText.match(/\.st-diagramCard[^{}]*\{[^}]*\}/g)??[];
const existing=JSON.parse(fs.readFileSync(new URL('../packages/diagram-canvas/contracts/diagram-anatomy.v1.json',import.meta.url),'utf8'));
const contract={contractId:'diagram-anatomy/v1',source:'MemoryContainerFigureR14 slot anatomy; owner A7 equal toggle inset, A10 neutral accent',appliesTo:['svelte','vue','react','angular','preact'],cardGeometry:CARD_GEOMETRY,zoneGeometry:ZONE_GEOMETRY,
 card:layoutCard(props,defaultCardMeasure),zones:[true,false].map(collapsed=>layoutZone({entityId:'contract-zone',kicker:'KICKER',title:'Zone',subtitle:'Subtitle',footer:'Footer',icon:'cluster',iconGlyph:getDiagramGlyph('cluster'),collapsed,toggleLabel:'Toggle',width:600},defaultCardMeasure)),
 tokens:{card:component.diagramCard,zone:component.diagramZone,icon:component.diagramIcon,button:component.button,iconButton:component.iconButton},hostStyles,colors:{edge:'#64748b',labelSurface:'#ffffff',labelBorder:'#cbd5e1',labelText:'#172033'},fontFamily:'Inter, system-ui, sans-serif',buttonCss,diagramCardCss,renderedAnatomy:existing.renderedAnatomy};
const path=new URL('../packages/diagram-canvas/contracts/diagram-anatomy.v1.json',import.meta.url);
const output=JSON.stringify(contract,null,2)+'\n';
if(process.argv.includes('--write'))fs.writeFileSync(path,output);
else if(fs.readFileSync(path,'utf8')!==output)throw new Error('Diagram anatomy changed. Update the golden, add the anatomy change PR label, and describe it for owner review.');
// DE-1 compact anatomy (`diagram-anatomy/v2`, 352 × 154): same contract shape,
// v2 geometries, the same card/zone layouts at the compact box, and the
// compact token block. Regenerated with the same `--write` labelled path.
const contractV2={contractId:'diagram-anatomy/v2',source:'DE-1 compact card anatomy; padding 6, header inset 12, accent 6, icon 52 / gap 4, type scale unchanged',appliesTo:['svelte','vue','react','angular','preact'],cardGeometry:CARD_GEOMETRY_V2,zoneGeometry:ZONE_GEOMETRY_V2,
 card:layoutCard(propsV2,defaultCardMeasure),zones:[true,false].map(collapsed=>layoutZone({entityId:'contract-zone',kicker:'KICKER',title:'Zone',subtitle:'Subtitle',footer:'Footer',icon:'cluster',iconGlyph:getDiagramGlyph('cluster'),collapsed,toggleLabel:'Toggle',width:600,anatomy:'v2'},defaultCardMeasure)),
 tokens:{card:component.diagramCardCompact,zone:component.diagramZone,icon:component.diagramIcon},hostStyles,colors:{edge:'#64748b',labelSurface:'#ffffff',labelBorder:'#cbd5e1',labelText:'#172033'},fontFamily:'Inter, system-ui, sans-serif',buttonCss,diagramCardCss};
const pathV2=new URL('../packages/diagram-canvas/contracts/diagram-anatomy.v2.json',import.meta.url);
const outputV2=JSON.stringify(contractV2,null,2)+'\n';
if(process.argv.includes('--write'))fs.writeFileSync(pathV2,outputV2);
else if(!fs.existsSync(pathV2)||fs.readFileSync(pathV2,'utf8')!==outputV2)throw new Error('Diagram anatomy v2 changed. Update the golden, add the anatomy change PR label, and describe it for owner review.');
