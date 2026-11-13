import { mkdirSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { expect,it } from 'vitest';
import { renderSceneSvg } from '../../../src/presentation/renderSceneSvg.js';
import { hCondInput } from './h-cond.js';
import { ownerInput } from './owner-fixtures.js';
const scenes=[
 ['appctx-architecture-unfolded',()=>hCondInput('architecture',false)],
 ['vue-globale-compact',()=>ownerInput('vue-globale',false)],
 ['vue-globale-folded-390',()=>({...ownerInput('vue-globale',true),targetWidth:390})],
 ['readme-frame-cluster-mesh',()=>ownerInput('readme-frame-cluster-mesh',false)],
 ['readme-frame-cat-mcp',()=>ownerInput('readme-frame-cat-mcp',false)],
] as const;
for(const [name,input] of scenes)it(`should render ${name} as a complete standalone DS SVG without a browser`,()=>{
 const rendered=renderSceneSvg(input(),{title:name});
 const dom=new JSDOM(rendered.svg,{contentType:'image/svg+xml'}).window.document;
 expect(dom.querySelector('parsererror')).toBeNull();
 expect(dom.documentElement.getAttribute('font-family')).toContain('Inter');
 expect(dom.querySelectorAll('[data-scene-occurrence]')).toHaveLength(rendered.scene.nodes.length);
 expect(dom.querySelectorAll('[data-diagram-icon]')).toHaveLength(rendered.scene.nodes.filter(n=>n.kind==='card'||n.kind==='zone').length);
 for(const label of dom.querySelectorAll('[data-scene-label]'))expect(label.querySelector('text')?.textContent?.trim()).toBeTruthy();
 for(const edge of dom.querySelectorAll('[data-scene-edge]'))expect(edge.getAttribute('stroke')).toBe('var(--st-component-diagramScene-edgeStroke, #64748b)');
 expect(rendered.svg).not.toMatch(/semantic-data-category|semantic-accent|#(?:f97316|ea580c|ff6b00)/i);
 if(process.env.DC2A_WRITE_RENDERS==='1'){
  const folder=process.env.DC2A_RENDER_DIR??'/tmp/dc2a-owner-renders';mkdirSync(folder,{recursive:true});writeFileSync(folder+'/'+name+'.svg',rendered.svg+'\n');
 }
});
