import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { afterEach,describe,expect,it,vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { cleanup,render } from '@testing-library/svelte';
import { tick } from 'svelte';
import SvelteScene from '../../components-svelte/src/lib/DiagramSceneFigure.svelte';
import VueScene from './DiagramSceneFigure.vue';
import { hCondInput } from '../../diagram-canvas/tests/layout/dc2a/h-cond.js';
import { ownerInput,ownerFixture,ownerFixtureNames } from '../../diagram-canvas/tests/layout/dc2a/owner-fixtures.js';
import { CARD_GEOMETRY,ZONE_GEOMETRY,layoutCard,layoutZone,defaultCardMeasure } from '@sentropic/diagram-canvas/diagramCardModel';
import { getDiagramGlyph } from './diagram-icons/registry.js';
const contract=JSON.parse(readFileSync(new URL('../../diagram-canvas/contracts/diagram-anatomy.v1.json',import.meta.url).pathname.replace(/^\/@fs/,' ' ).trim(),'utf8'));
const hosts=[{name:'Svelte',async mount(props:Record<string,unknown>){const view=render(SvelteScene,props as never);await tick();return {element:view.container,dispose:()=>view.unmount()};}},
{name:'Vue',async mount(props:Record<string,unknown>){const view=mount(VueScene,{props:props as never});await nextTick();return {element:view.element,dispose:()=>view.unmount()};}}];
afterEach(()=>{cleanup();vi.restoreAllMocks();});
for(const host of hosts)describe(`${host.name} owner addendum`,()=>{
 for(const name of ['architecture','ontology'] as const)for(const folded of [true,false])it(`should render default icons and text in ${name}/${folded} (A2–A5/A12)`,async()=>{
  const input=hCondInput(name,folded);const view=await host.mount({...input,measureLines:undefined});
  for(const node of view.element.querySelectorAll('[data-scene-kind="card"],[data-scene-kind="zone"]'))expect(node.querySelector('[data-diagram-icon]')).not.toBeNull();
  for(const label of view.element.querySelectorAll('[data-scene-label]'))expect(label.textContent?.trim()).toBeTruthy();
  for(const group of view.element.querySelectorAll('[data-bundle-relation]'))expect(group.textContent?.replace('•','').trim()).toBeTruthy();
  if(folded&&name==='architecture')expect(view.element.querySelectorAll('[data-bundle-relation]').length).toBeGreaterThan(1);
  view.dispose();
 });
 for(const name of ownerFixtureNames().filter(n=>n.startsWith('readme')))it(`should render every visible ${name} card without refusal and keep footers (A11)`,async()=>{
  const input=ownerInput(name),fixture=ownerFixture(name),view=await host.mount({...input,measureLines:undefined});
  expect(view.element.querySelectorAll('[data-card-refused],[data-zone-refused]')).toHaveLength(0);
  for(const node of view.element.querySelectorAll<HTMLElement>('[data-scene-occurrence]')){
   expect(node.querySelector('[data-diagram-icon]')).not.toBeNull();
   const source=fixture.cards.find(c=>'occurrence:e.'+c.id===node.dataset.sceneOccurrence)!;
   if(source.footer){const footer=[...node.querySelectorAll('.st-diagramCard-footerLine,.st-diagramZone-footerLine')].map(el=>el.textContent).join('');expect(footer.replace(/\s+/g,'')).toBe(source.footer.replace(/\s+/g,''));}
  }
  view.dispose();
 });
 it('should display unknown for unresolved presentation icons (A2)',async()=>{
  const input=ownerInput('vue-globale',true);const presentation={...input.presentation,entities:Object.fromEntries(Object.entries(input.presentation.entities).map(([id,entry])=>[id,{...entry,icon:'no-glyph'}]))};
  const view=await host.mount({...input,presentation,measureLines:undefined});
  expect(view.element.querySelectorAll('[data-diagram-icon="unknown"]').length).toBeGreaterThan(0);view.dispose();
 });
 it('should inherit the frozen slot geometry and equal toggle insets (A7/A8)',async()=>{
  expect(CARD_GEOMETRY).toEqual(contract.cardGeometry);expect(ZONE_GEOMETRY).toEqual(contract.zoneGeometry);
  const props={entityId:'contract',kicker:'KICKER',title:'Title',body:['Body','Detail'],detailCount:1,footer:'Footer',icon:'base',iconGlyph:getDiagramGlyph('base'),autoSize:true,toggle:{collapsed:true,label:'Expand'}};
  expect(layoutCard(props,defaultCardMeasure)).toEqual(contract.card);
  for(const collapsed of [true,false]){
   const layout=layoutZone({entityId:'contract-zone',kicker:'KICKER',title:'Zone',subtitle:'Subtitle',footer:'Footer',icon:'cluster',iconGlyph:getDiagramGlyph('cluster'),collapsed,toggleLabel:'Toggle',width:600},defaultCardMeasure);
   expect(layout).toEqual(contract.zones[collapsed?0:1]);
   const box=layout.collapsed?layout.card!.toggleBox!:layout.header!.toggleBox!;
   expect(Math.abs(box.y-(layout.box.width-box.x-box.size))).toBeLessThanOrEqual(.5);
  }
  const view=await host.mount({...ownerInput('vue-globale',true),measureLines:undefined});
  for(const toggle of view.element.querySelectorAll<HTMLElement>('.st-diagramCard-toggle')){ expect(toggle.querySelector('button')).not.toBeNull(); expect(toggle.style.top).toBe(toggle.style.right); }view.dispose();
 });
});

it('should bind every host anatomy stylesheet and slot token to the approved contract (A8)',()=>{
 execFileSync(process.execPath,[new URL('../../../scripts/diagram-anatomy-contract.mjs',import.meta.url).pathname.replace(/^\/@fs(?=\/)/,'')],{stdio:'pipe'});
});
