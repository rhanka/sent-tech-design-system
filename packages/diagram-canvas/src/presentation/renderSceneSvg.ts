/** Standalone server-side SVG, consuming exactly the scene model used by the framework hosts. */
import { layoutScene, resolveScene, sceneFit, type SceneLayoutInput } from './diagramSceneModel.js';
import { defaultCardMeasure, sceneCardMeasure, projectCardProps, projectZoneProps, type CardLineMeasure } from './diagramCardModel.js';
import { renderCardSvg } from './renderCardSvg.js';
import { renderZoneSvg } from './renderZoneSvg.js';
import { getDiagramGlyph } from './registry.js';
const escape = (text:string) => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function renderSceneSvg(input: SceneLayoutInput, options: { measure?: CardLineMeasure; title?: string } = {}) {
  const result=layoutScene(input);
  if(result.status!=='laid-out') throw new Error('Scene refused: '+JSON.stringify(result.refusals));
  const scene=resolveScene(result,input),box=scene.bounds??{x:0,y:0,width:1,height:1};
  const measure=options.measure??sceneCardMeasure(defaultCardMeasure);
  const viewportWidth=input.targetWidth??1440;
  const fit=sceneFit({bounds:box,viewWidth:viewportWidth,windowHeight:900});
  const edges=scene.edges.map(edge=>`<polyline data-scene-edge="${escape(edge.occurrence)}" points="${edge.points.map(p=>p.x+','+p.y).join(' ')}" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linejoin="round" marker-end="url(#scene-arrow)"/>`).join('');
  const nodes=scene.nodes.map(node=>{
    const props={entityId:node.entity,resolveGlyph:input.resolveGlyph??getDiagramGlyph};
    const projected=node.kind==='zone'?projectZoneProps(node.presentation,{...props,collapsed:node.collapsed,width:node.rect.width,height:node.rect.height,toggleLabel:node.collapsed?'Expand':'Collapse'}):projectCardProps(node.presentation,props);
    if(projected.kind==='label')return `<text x="${node.rect.x}" y="${node.rect.y+24}">${escape(node.text)}</text>`;
    const rendered=projected.kind==='zone'?renderZoneSvg({...projected.props,autoSize:true},{measure}):renderCardSvg({...projected.props,autoSize:true,height:node.rect.height},measure);
    if(rendered.kind!=='rendered')throw new Error('Content must never refuse a component');
    return `<g data-scene-occurrence="${escape(node.occurrence)}" transform="translate(${node.rect.x} ${node.rect.y})">${rendered.svg}</g>`;
  }).join('');
  const labels=scene.labels.map(label=>{
    const b=label.box;
    let text='';
    if(label.bundle){
      text=`<text x="${b.width/2}" y="22" text-anchor="middle">${escape(label.bundle.header)}</text>`;
      label.bundle.groups.forEach((group,index)=>{
        text+=`<g data-bundle-relation="${index}"><path d="M0 ${group.top}H${b.width}" stroke="#cbd5e1"/><text x="5" y="${group.top+22}">•</text>`;
        group.lines.forEach((line,i)=>{text+=`<text x="22" y="${group.top+22+i*22}">${escape(line)}</text>`;});text+='</g>';
      });
    }else label.lines.forEach((line,i)=>{text+=`<text x="${b.width/2}" y="${18+i*22}" text-anchor="middle">${escape(line)}</text>`;});
    return `<g data-scene-label="${escape(label.occurrence)}" transform="translate(${b.x} ${b.y})" font-size="18" fill="#172033"><rect width="${b.width}" height="${b.height}" fill="#ffffff" stroke="#cbd5e1"/>${text}</g>`;
  }).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x-2} ${box.y-2} ${box.width+4} ${box.height+4}" width="${(box.width+4)*fit.zoom}" height="${(box.height+4)*fit.zoom}" data-viewport-width="${viewportWidth}" data-display-scale="${fit.zoom}" role="img" aria-label="${escape(options.title??input.document.documentId)}" font-family="Inter, system-ui, sans-serif"><title>${escape(options.title??input.document.documentId)}</title><style>@font-face{font-family:Inter;src:local('Inter');font-weight:100 900}svg{--st-font-sans:Inter,system-ui,sans-serif;--st-semantic-surface-raised:#fff;--st-semantic-text-primary:#172033;--st-semantic-text-secondary:#475569;--st-semantic-border-strong:#64748b;--st-semantic-border-subtle:#cbd5e1;--st-semantic-feedback-info:#2563eb}</style><defs><marker id="scene-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#64748b"/></marker></defs>${edges}${nodes}${labels}</svg>`;
  return {svg,result,scene};
}
