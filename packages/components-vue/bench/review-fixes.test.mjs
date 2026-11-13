import { spawnSync } from 'node:child_process';
import { sfcSafety, files } from '../../../scripts/vue-vapor-source.mjs';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { bench, src, installSourceLoader, normalizeHtml } from './lib.mjs';
const mode = process.env.REVIEW_MODE ?? 'vapor';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
for (const key of ['window','document','Node','Element','HTMLElement','SVGElement','Text','Comment','Document','DocumentFragment','MutationObserver','Event','CustomEvent']) Object.defineProperty(globalThis,key,{ value:dom.window[key], configurable:true });
installSourceLoader(mode);
const vue = await import('vue');
const temporary = mkdtempSync(resolve(bench,'.tmp-review-'));
let sequence = 0;
after(()=>{ dom.window.close(); rmSync(temporary,{recursive:true,force:true}); });
const flush = async()=>{ await vue.nextTick(); await new Promise(done=>setTimeout(done,0)); await vue.nextTick(); };
async function mount(name, props={}, slots='') {
 const element=document.createElement('div'); document.body.append(element);
 const state=vue.reactive({props, show:true}); globalThis.__reviewState=state;
 const file=resolve(temporary,`host-${sequence++}.vue`);
 writeFileSync(file,`<script setup lang="ts">import Target from '${pathToFileURL(resolve(src,name+'.vue')).href}';const state=(globalThis as any).__reviewState;</script><template><Target v-bind="state.props">${slots}</Target></template>`);
 const {default:Host}=await import(pathToFileURL(file).href); const app=(mode==='vapor'?vue.createVaporApp:vue.createApp)(Host);
 const errors=[]; app.config.warnHandler=e=>errors.push(String(e));app.config.errorHandler=e=>errors.push(String(e)); app.mount(element);await flush();
 return {element,state,props:state.props,async close(){app.unmount();await flush();element.remove();assert.deepEqual(errors,[]);}};
}
const source=name=>readFileSync(resolve(src,name+'.vue'),'utf8');
test('B1: built Vapor barrel should export every classic runtime value',async()=>{
 const child=spawnSync(process.execPath,['--input-type=module','-e',`import {installSourceLoader} from './packages/components-vue/bench/lib.mjs';installSourceLoader('vapor');const c=await import('./packages/components-vue/dist/index.js');const v=await import('./packages/components-vue/dist/vapor/index.js');(await import('node:assert/strict')).default.deepEqual(Object.keys(v).sort(),Object.keys(c).sort());`],{cwd:resolve(bench,'../../..'),encoding:'utf8'});
 assert.equal(child.status,0,child.stdout+child.stderr);
});
test('B4/M2/M3: all SFCs should satisfy attrs, identity and single notification rules',()=>{
 const errors=[];
 for(const file of files(src).filter(f=>f.endsWith('.vue'))){const s=readFileSync(resolve(src,file),'utf8');
 if(/\$attrs|useAttrs\s*\(/.test(s)&&!/inheritAttrs\s*:\s*false/.test(s))errors.push(file+': inheritAttrs');
 if(/\.\.\.attrs/.test(s.split('</script>')[0]))errors.push(file+': cached attrs');
 if(/\b(?:next\w*Id|\+\+\w*[Uu]id)/.test(s))errors.push(file+': counter');
 errors.push(...sfcSafety(s,file).map(e=>file+": "+e));
 }
 assert.deepEqual(errors,[]);
});
for(const [name,prop,slot]of [['Alert','title','title'],['Switch','label','label'],['Toggle','label','label'],['Toggletip','label','label'],['FormGroup','legend','legend'],['Tooltip','content','content']])test(`B3/M5: ${name} should render slot-only ${slot} without requiring ${prop}`,async()=>{
 assert.match(source(name),new RegExp(prop+'\\?:'));
 const h=await mount(name,{},`<template #${slot}><strong>Rich</strong></template>`);try{assert.equal(h.element.querySelector('strong')?.textContent,'Rich');}finally{await h.close();}
});
for(const [name,slots,props,selector]of [
 ['Header','<template #title><strong>Rich</strong></template>',{},'.st-header__title strong'],
 ['Icon','<path d="M1 1L2 2" />',{},'svg path'],
 ['Quote','<template #author><strong>Rich</strong></template><template #source><em>Source</em></template>',{},'.st-quote__author strong'],
 ['StructuredList','<template #term="{item}"><strong>{{item.term}}</strong></template><template #definition="{item}"><em>{{item.value}}</em></template>',{items:[{term:'Rich',value:'Definition'}]},'dt strong'],
 ['ProgressBar','<template #label><strong>Rich</strong></template>',{},'.st-progressBar__label strong'],
 ['ProgressIndicator','<template #item-label="{item}"><strong>{{item.label}}</strong></template><template #item-description><em>Description</em></template>',{items:[{label:'Rich'}]},'.st-progressIndicator__label strong'],
 ['StreamingMessage','<template #text><strong>Rich</strong></template><template #event-label="{event}"><em>{{event.label}}</em></template>',{events:[{id:'a',label:'Event'}]},'.st-streamingMessage__text strong'],
 ['StreamingMessage','<template #placeholder><strong>Rich</strong></template>',{},'.st-streamingMessage__text strong'],
 ['Footer','<template #column-title><strong>Rich</strong></template><template #link-label="{link}"><em>{{link.label}}</em></template>',{columns:[{links:[{label:'Link',href:'/'}]}]},'h2 strong'],
 ['ChatThread','<template #message-content="{message}"><strong>{{message.content}}</strong></template>',{messages:[{id:'a',content:'Rich'}]},'.st-chatMessage__content strong'],
])test(`B2/M1/Astra2,4: ${name} should render rich replacement slots (${selector})`,async()=>{const h=await mount(name,props,slots);try{assert.ok(h.element.querySelector(selector));}finally{await h.close();}});
for(const name of ['Input','Textarea','PasswordInput','NumberInput','Select','Combobox','MultiSelect','DatePicker'])test(`M4/M5/Astra5: ${name} should keep label/help/error markup and react to error slot removal`,async()=>{
 const h=await mount(name,{options:[]},'<template #label><b>Label</b></template><template #helper-text><i>Help</i></template><template v-if="state.show" #error-text><strong>Error</strong></template>');
 try{const control=h.element.querySelector('input,textarea,select,button');assert.ok(h.element.querySelector('b'));assert.ok(h.element.querySelector('strong'));assert.equal(control.getAttribute('aria-invalid'),'true');h.state.show=false;await flush();assert.notEqual(control.getAttribute('aria-invalid'),'true');assert.ok(h.element.querySelector('i'));}finally{await h.close();}
});
for(const name of ['Input','Textarea','PasswordInput','NumberInput','Select','Checkbox','Radio','Search','Toggle','Switch'])test(`B4/Astra3: ${name} should add/change/remove initially absent control attrs and invoke a native listener once`,async()=>{
 const h=await mount(name,{label:'Label'});try{
 const c=h.element.querySelector('input,textarea,select');assert.ok(c);h.props['data-late']='one';await flush();assert.equal(c.getAttribute('data-late'),'one');h.props['data-late']='two';await flush();assert.equal(c.getAttribute('data-late'),'two');delete h.props['data-late'];await flush();assert.equal(c.hasAttribute('data-late'),false);
 let calls=0;h.props.onKeydown=()=>calls++;await flush();c.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'a',bubbles:true}));assert.equal(calls,1);
 h.props['aria-describedby']='late-help';await flush();assert.equal(c.getAttribute('aria-describedby'),'late-help');assert.equal(h.element.querySelectorAll('[aria-describedby="late-help"]').length,1);
 }finally{await h.close();}
});
for(const name of ['CheckboxGroup','RadioGroup','Rating'])test(`M3: ${name} should emit change exactly once`,async()=>{
 let calls=0;const h=await mount(name,{legend:'Choose',name:'group',options:[{value:'a',label:'A'}],onChange:()=>calls++});try{const c=h.element.querySelector('input,button');assert.ok(c);if(c.tagName==='INPUT'){c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));}else c.click();await flush();assert.equal(calls,1);}finally{await h.close();}
});
test('Astra1: inline Popper should keep native attrs and listeners',async()=>{let calls=0;const anchor=document.createElement('button');document.body.append(anchor);const h=await mount('Popper',{anchor,open:true,portal:false,id:'inline',role:'dialog','aria-label':'Panel',onClick:()=>calls++},'Panel');try{const p=h.element.querySelector('#inline');assert.ok(p);assert.equal(p.getAttribute('role'),'dialog');p.click();assert.equal(calls,1);}finally{await h.close();anchor.remove();}});
test('Astra minor: Popover should preserve empty string prop precedence',async()=>{const h=await mount('Popover',{open:true,content:''},'<template #content><strong>Hidden</strong></template>');try{const panel=h.element.querySelector('.st-popover');assert.ok(panel);assert.equal(panel.textContent,'');assert.equal(panel.querySelector('strong'),null);}finally{await h.close();}});
test('M6: G5 should compare every mounted fixture against classic HTML and check all unmounts',()=>{const s=readFileSync(resolve(bench,'worker.mjs'),'utf8');assert.match(s,/classic-mount/);assert.match(s,/assert.*(?:deepEqual|equal)/);assert.doesNotMatch(s,/\['Portal', 'Popper', 'Dropdown'\]\.includes\(name\)/);});
for(const [name,props,selector]of [['Icon',{name:'settings'},'svg'],['Combobox',{options:[]},'svg'],['MultiSelect',{options:[]},'svg']])test(`m4: ${name} should emit each SVG class token once`,async()=>{const h=await mount(name,props);try{for(const svg of h.element.querySelectorAll(selector)){const tokens=svg.getAttribute('class').split(/\s+/);assert.equal(tokens.length,new Set(tokens).size);}}finally{await h.close();}});
for(const name of ['Select','Textarea','NumberInput','PasswordInput'])test(`B4/M2: ${name} should preserve an explicit control ID and its label relationship`,async()=>{const h=await mount(name,{id:'caller-id',label:'Label'});try{assert.equal(h.element.querySelector('input,select,textarea')?.id,'caller-id');assert.equal(h.element.querySelector('label').htmlFor,'caller-id');assert.equal(h.element.querySelectorAll('#caller-id').length,1);}finally{await h.close();}});
for(const [name,props,slots,selector]of [
 ['ChatComposer',{value:'Hi'},'<template #submit-label><strong>Send</strong></template>','button strong'],
 ['ChatMessage',{},'<template #timestamp><strong>Now</strong></template>','.st-chatMessage__timestamp strong'],
 ['MessageActions',{actions:[{id:'a',label:'Action'}]},'<template #action-content="{action}"><strong>{{action.label}}</strong></template>','button strong'],
 ['NavRail',{items:[{id:'a',label:'A'}]},'<template #item-icon><strong>Icon</strong></template><template #item-badge><em>New</em></template>','.st-navRail__icon strong'],
])test(`M5 class audit: ${name} should expose rich collection/control content`,async()=>{const h=await mount(name,props,slots);try{assert.ok(h.element.querySelector(selector));}finally{await h.close();}});
test('m3: DatePicker should name its dialog when the scalar label is empty',async()=>{const h=await mount('DatePicker',{label:'',openLabel:'Choose date'});try{h.element.querySelector('.st-datepicker__trigger').click();await flush();assert.equal(h.element.querySelector('[role="dialog"]').getAttribute('aria-label'),'Choose date');}finally{await h.close();}});
test('m1: internal recursion state should be marked and the decoration helper should be public',()=>{for(const n of ['OrderedList','UnorderedList'])assert.match(source(n),/@internal[^\n]*\n\s*path\?/);assert.match(readFileSync(resolve(src,'index.ts'),'utf8'),/default as CellDecorationIcon/);});
test('m2: NavDrawer should forward scoped-slot payloads',async()=>{
 const child=resolve(temporary,'scope-child.vue');writeFileSync(child,'<script setup lang="ts">defineSlots<{footer:(scope:{value:string})=>unknown}>();</script><template><slot name="footer" value="Forwarded" /></template>');
 const target=resolve(temporary,'scope-target.vue');writeFileSync(target,source('NavDrawer').replace("'./NavShell.vue'",JSON.stringify(pathToFileURL(child).href)));
 const host=resolve(temporary,'scope-host.vue');writeFileSync(host,`<script setup lang="ts">import Target from '${pathToFileURL(target).href}';</script><template><Target><template #footer="scope"><strong>{{scope.value}}</strong></template></Target></template>`);
 const{default:Host}=await import(pathToFileURL(host).href);const element=document.createElement('div');document.body.append(element);const app=(mode==='vapor'?vue.createVaporApp:vue.createApp)(Host);try{app.mount(element);await flush();assert.equal(element.querySelector('strong').textContent,'Forwarded');}finally{app.unmount();element.remove();}
});
test('M2: identities should restart for each SSR request and remain unique among siblings',()=>{
 const child=spawnSync(process.execPath,['--input-type=module','-e',`import {JSDOM} from 'jsdom';const dom=new JSDOM('<body/>');for(const key of ['window','document','Node','Element','HTMLElement','SVGElement','MutationObserver'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});const{installSourceLoader}=await import('./packages/components-vue/bench/lib.mjs');installSourceLoader('classic');const{createSSRApp,h,Fragment}=await import('vue');const{renderToString}=await import('@vue/server-renderer');const{default:assert}=await import('node:assert/strict');for(const name of ['Combobox','DatePicker','NumberInput','PasswordInput','Textarea','TimePicker','TimeRangePicker','Menu','MenuPopover','OverflowMenu']){const{default:T}=await import('./packages/components-vue/src/'+name+'.vue');const props={options:[],items:[{id:'a',label:'A'}],open:true};const render=async()=>{const html=await renderToString(createSSRApp({render:()=>h(Fragment,null,[h(T,props),h(T,props)])}));return [...html.matchAll(/\\bid="([^"]+)"/g)].map(m=>m[1]);};const one=await render(),two=await render();assert.ok(one.length,name);assert.deepEqual(one,two,name);assert.equal(new Set(one).size,one.length,name);}dom.window.close();`],{cwd:resolve(bench,'../../..'),encoding:'utf8'});assert.equal(child.status,0,child.stdout+child.stderr);
});
test('M6: G5 should reject a changed Vapor DOM while the classic fixture still mounts',()=>{
 const worker=resolve(bench,`.tmp-parity-${process.pid}.mjs`);const original=readFileSync(resolve(bench,'worker.mjs'),'utf8');
 writeFileSync(worker,original.replace('const html = mountedHtml(document.body, JSDOM);',`const html = mountedHtml(document.body, JSDOM) + (operation === 'vapor' ? '<b>Broken parity</b>' : '');`));
 try{const result=spawnSync(process.execPath,[worker,'vapor','Button'],{encoding:'utf8'});assert.equal(result.status,1);assert.match(result.stdout,/Vapor\/Classic DOM differ/);}finally{rmSync(worker,{force:true});}
});
test('M5 state audit: a StreamingMessage text slot should not use placeholder styling',async()=>{const h=await mount('StreamingMessage',{},'<template #text><strong>Live</strong></template>');try{assert.equal(h.element.querySelector('.st-streamingMessage__text').classList.contains('st-streamingMessage__text--muted'),false);}finally{await h.close();}});
test('M5 state audit: InlineLoading should derive its name from a slot-only label',async()=>{const h=await mount('InlineLoading',{},'<template #label><strong>Loading entries</strong></template>');try{assert.equal(h.element.firstElementChild.hasAttribute('aria-label'),false);}finally{await h.close();}});
for(const name of ['AppShell','DashboardGrid','PanelStack'])test(`B4/M6: ${name} should merge caller style with its owned root style`,async()=>{const h=await mount(name,{style:'color:red',tiles:[],sections:[]});try{assert.equal(h.element.firstElementChild.style.color,'red');}finally{await h.close();}});
