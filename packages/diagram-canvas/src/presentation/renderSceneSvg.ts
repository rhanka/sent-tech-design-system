import { renderErdCardSvg } from './erd.js';
/** Standalone server-side SVG, consuming exactly the scene model used by the framework hosts. */
import {
  LINK_EMPHASIS_STROKE,
  LINK_EMPHASIS_STROKE_FALLBACK,
} from './connectorStyle.js';
import {
  connectorDashArray,
  connectorMarkerIds,
  connectorMarkerRef,
  connectorPath,
  DEFAULT_EDGE_CORNER_RADIUS,
  DEFAULT_EDGE_LABEL_SIZE,
  DEFAULT_LINK_EMPHASIS_STROKE_WIDTH,
  DEFAULT_LINK_STROKE_WIDTH,
  extraConnectorMarkers,
  layoutScene,
  linkLegendSwatchGeometry,
  resolveScene,
  sceneConnectorMask,
  sceneFit,
  sceneNodesOnPlane,
  type SceneLayoutInput,
  type SceneNodeModel,
} from './diagramSceneModel.js';
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure, projectCardProps, projectZoneProps, type CardLineMeasure } from './diagramCardModel.js';
import { renderCardSvg } from './renderCardSvg.js';
import { renderZoneSvg } from './renderZoneSvg.js';
import { getDiagramGlyph } from './registry.js';
const escape = (text:string) => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function renderSceneSvg(input: SceneLayoutInput, options: { measure?: CardLineMeasure; title?: string; fitToWindow?: boolean } = {}) {
  const fallback=sceneCardMeasure(defaultCardMeasure);
  const measureFor=(folded:boolean):CardLineMeasure=>options.measure??(input.measureLines===undefined?fallback:(text,role,availableWidth,allocatedLines)=>{
    const measured=input.measureLines!({text,role,availableWidth,allocatedLines,folded});
    return {lines:measured.lines,tooWide:measured.width>availableWidth,lineWidths:measured.lines.map(()=>measured.width)};
  });
  const measure=measureFor(false);
  const measuredInput={...input,measureLines:options.measure===undefined?input.measureLines??cardLineMeasurer(measure):cardLineMeasurer(measure)};
  const result=layoutScene(measuredInput);
  if(result.status!=='laid-out') throw new Error('Scene refused: '+JSON.stringify(result.refusals));
  const scene=resolveScene(result,measuredInput),box=scene.bounds??{x:0,y:0,width:1,height:1};
  const viewportWidth=input.targetWidth??1440;
  const fit=sceneFit({bounds:box,viewWidth:viewportWidth,windowHeight:900,...(options.fitToWindow===undefined?{}:{fitToWindow:options.fitToWindow})});
  const cornerRadius=input.metrics?.edgeCornerRadius??DEFAULT_EDGE_CORNER_RADIUS;
  const linkStrokeWidth=input.metrics?.linkStrokeWidth??DEFAULT_LINK_STROKE_WIDTH;
  const linkEmphasisStrokeWidth=input.metrics?.linkEmphasisStrokeWidth??DEFAULT_LINK_EMPHASIS_STROKE_WIDTH;
  const edgeLabelSize=input.metrics?.edgeLabelSize??DEFAULT_EDGE_LABEL_SIZE;
  const markerIds=connectorMarkerIds('scene-arrow');
  const extraMarkers=extraConnectorMarkers(scene.edges,markerIds);
  const extraMarkerDefs=extraMarkers.map(marker=>{
    const strokeAttrs=marker.stroke===undefined?'':` stroke="${escape(marker.stroke)}" stroke-width="${marker.strokeWidth??1.5}"`;
    return `<marker id="${escape(marker.id)}" data-arrowhead-kind="${escape(marker.kind)}" data-arrowhead-emphasis="${escape(marker.emphasis)}" viewBox="${marker.viewBox}" refX="${marker.refX}" refY="${marker.refY}" markerUnits="${marker.markerUnits}" markerWidth="${marker.markerWidth}" markerHeight="${marker.markerHeight}" orient="${marker.orient}"><path d="${marker.path}" fill="${escape(marker.fill)}"${strokeAttrs}/></marker>`;
  }).join('');
  const edges=scene.edges.map(edge=>{
    const emphasized=edge.emphasis==='emphasis';
    const stroke=emphasized?LINK_EMPHASIS_STROKE:'var(--st-component-diagramScene-edgeStroke, #64748b)';
    const strokeWidth=emphasized?linkEmphasisStrokeWidth:linkStrokeWidth;
    const dash=connectorDashArray(edge.strokeStyle);
    const markerRef=connectorMarkerRef(edge,markerIds);
    const attrs=[
      `data-scene-edge="${escape(edge.occurrence)}"`,
      `d="${connectorPath(edge.points,cornerRadius)}"`,
      ...(edge.strokeStyle===undefined?[]:[`data-edge-stroke="${escape(edge.strokeStyle)}"`]),
      ...(edge.arrowhead===undefined?[]:[`data-edge-arrowhead="${escape(edge.arrowhead)}"`]),
      ...(edge.emphasis===undefined?[]:[`data-edge-emphasis="${escape(edge.emphasis)}"`]),
      'fill="none"',
      `stroke="${stroke}"`,
      `stroke-width="${strokeWidth}"`,
      'vector-effect="non-scaling-stroke"',
      'stroke-linejoin="round"',
      ...(dash===undefined?[]:[`stroke-dasharray="${dash}"`]),
      ...(markerRef===undefined?[]:[`marker-end="${markerRef}"`]),
    ].join(' ');
    return `<path ${attrs}/>${edge.markers??''}`;
  }).join('');
  const drawNode=(node:SceneNodeModel)=>{
    const measure=measureFor(node.collapsed);
    if(node.kind==='erd'&&node.erd!==undefined)return `<g data-scene-occurrence="${escape(node.occurrence)}" transform="translate(${node.rect.x} ${node.rect.y})">${renderErdCardSvg(node.erd)}</g>`;
    const props={entityId:node.entity,resolveGlyph:input.resolveGlyph??getDiagramGlyph};
    const projected=node.kind==='zone'?projectZoneProps(node.presentation,{...props,collapsed:node.collapsed,...(input.metrics?.containerPadding===undefined?{}:{containerPadding:input.metrics.containerPadding}),width:node.rect.width,height:node.rect.height,toggleLabel:node.collapsed?'Expand':'Collapse'}):projectCardProps(node.presentation,props);
    if(projected.kind==='label')return `<text x="${node.rect.x}" y="${node.rect.y+24}">${escape(node.text)}</text>`;
    const rendered=projected.kind==='zone'?renderZoneSvg({...projected.props,autoSize:true},{measure}):renderCardSvg({...projected.props,autoSize:true,height:node.rect.height},measure);
    if(rendered.kind!=='rendered')throw new Error('Content must never refuse a component');
    return `<g data-scene-occurrence="${escape(node.occurrence)}" transform="translate(${node.rect.x} ${node.rect.y})">${rendered.svg}</g>`;
  };
  // Expanded zone surfaces are opaque: they paint under the connectors, the boxes above them.
  // The connector layer is masked over the footer text the frames paint themselves.
  const mask=sceneConnectorMask(scene);
  const box4=(r:{x:number;y:number;width:number;height:number})=>`x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}"`;
  const maskDef=mask===undefined?'':`<mask id="scene-connector-mask" maskUnits="userSpaceOnUse" ${box4(mask.region)}><rect ${box4(mask.region)} fill="#fff"/>${mask.cutouts.map(cutout=>`<rect data-scene-cutout="" ${box4(cutout)} fill="#000"/>`).join('')}</mask>`;
  const connectors=`<g data-scene-connectors=""${mask===undefined?'':' mask="url(#scene-connector-mask)"'}>${edges}</g>`;
  const frames=sceneNodesOnPlane(scene.nodes,'frame').map(drawNode).join('');
  const boxes=sceneNodesOnPlane(scene.nodes,'box').map(drawNode).join('');
  const labels=scene.labels.map(label=>{
    const b=label.box;
    const labelLineHeight=Math.round(22*(edgeLabelSize/DEFAULT_EDGE_LABEL_SIZE));
    const firstBaseline=Math.round(edgeLabelSize);
    let text='';
    if(label.bundle){
      text=`<text x="${b.width/2}" y="${labelLineHeight}" text-anchor="middle">${escape(label.bundle.header)}</text>`;
      label.bundle.groups.forEach((group,index)=>{
        text+=`<g data-bundle-relation="${index}"><path d="M0 ${group.top}H${b.width}" stroke="var(--st-component-diagramScene-labelBorder, #cbd5e1)"/><text x="5" y="${group.top+labelLineHeight}">•</text>`;
        group.lines.forEach((line,i)=>{text+=`<text x="22" y="${group.top+labelLineHeight+i*labelLineHeight}">${escape(line)}</text>`;});text+='</g>';
      });
    }else label.lines.forEach((line,i)=>{text+=`<text x="${b.width/2}" y="${firstBaseline+i*labelLineHeight}" text-anchor="middle">${escape(line)}</text>`;});
    const leader=label.leader===undefined?'':`<path data-scene-leader="${escape(label.occurrence)}" d="${connectorPath(label.leader,cornerRadius)}" fill="none" stroke="var(--st-component-diagramScene-edgeStroke, #64748b)" stroke-width="${linkStrokeWidth}" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`;
    return leader+`<g data-scene-label="${escape(label.occurrence)}" transform="translate(${b.x} ${b.y})" font-size="${edgeLabelSize}" fill="var(--st-component-diagramScene-labelText, #172033)"><rect width="${b.width}" height="${b.height}" fill="var(--st-component-diagramScene-labelSurface, #ffffff)" stroke="var(--st-component-diagramScene-labelBorder, #cbd5e1)"/>${text}</g>`;
  }).join('');
  const legend=(()=>{
    const l=scene.linkLegend;
    if(l===undefined)return '';
    const r=l.rect;
    const ruleY=l.padding+l.headerHeight-6;
    const rows=l.entries.map(entry=>{
      const swatch=linkLegendSwatchGeometry(entry,{linkStrokeWidth,linkEmphasisStrokeWidth});
      const swatchY=entry.rowY+(entry.rowHeight-swatch.height)/2;
      const lineAttrs=[
        `data-legend-swatch="${escape(entry.key)}"`,
        `d="${swatch.linePath}"`,
        'fill="none"',
        `stroke="${escape(swatch.stroke)}"`,
        `stroke-width="${swatch.strokeWidth}"`,
        'vector-effect="non-scaling-stroke"',
        ...(swatch.dashArray===undefined?[]:[`stroke-dasharray="${escape(swatch.dashArray)}"`]),
      ].join(' ');
      const arrow=swatch.arrowPath===undefined?'':`<path d="${swatch.arrowPath}" fill="${escape(swatch.arrowFill??swatch.stroke)}"${swatch.arrowStroke===undefined?'':` stroke="${escape(swatch.arrowStroke)}" stroke-width="${swatch.arrowStrokeWidth??1.5}"`}/>`;
      const textX=l.padding+l.swatchWidth+l.swatchGap;
      const textY=entry.rowY+entry.rowHeight/2+l.fontSize*0.35;
      return `<g data-legend-style="${escape(entry.key)}" data-edge-stroke="${escape(entry.strokeStyle)}" data-edge-arrowhead="${escape(entry.arrowhead)}" data-edge-emphasis="${escape(entry.emphasis)}"><g transform="translate(${l.padding} ${swatchY})"><path ${lineAttrs}/>${arrow}</g><text x="${textX}" y="${textY}" font-size="${l.fontSize}" fill="var(--st-component-diagramScene-labelText, #172033)">${escape(entry.label)}</text></g>`;
    }).join('');
    return `<g data-scene-legend="" data-legend-anchor="${escape(l.anchor)}" transform="translate(${r.x} ${r.y})"><rect width="${r.width}" height="${r.height}" fill="var(--st-component-diagramScene-labelSurface, #ffffff)" stroke="var(--st-component-diagramScene-labelBorder, #cbd5e1)"/><text x="${l.padding}" y="${l.padding+l.fontSize}" font-size="${l.fontSize}" font-weight="700" fill="var(--st-component-diagramScene-labelText, #172033)">${escape(l.title)}</text><path d="M${l.padding} ${ruleY}H${r.width-l.padding}" stroke="var(--st-component-diagramScene-labelBorder, #cbd5e1)"/>${rows}</g>`;
  })();
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x-2} ${box.y-2} ${box.width+4} ${box.height+4}" width="${(box.width+4)*fit.zoom}" height="${(box.height+4)*fit.zoom}" data-viewport-width="${viewportWidth}" data-display-scale="${fit.zoom}" role="img" aria-label="${escape(options.title??input.document.documentId)}" font-family="Inter, system-ui, sans-serif"><title>${escape(options.title??input.document.documentId)}</title><style>@font-face{font-family:Inter;src:local('Inter');font-weight:100 900}svg:root{--st-font-sans:Inter,system-ui,sans-serif;--st-semantic-surface-raised:#fff;--st-semantic-surface-subtle:#f8fafc;--st-component-diagramZone-surface1:#fff;--st-component-diagramZone-surface2:#f8fafc;--st-semantic-text-primary:#172033;--st-semantic-text-secondary:#475569;--st-semantic-border-strong:#64748b;--st-semantic-border-subtle:#cbd5e1;--st-semantic-border-interactive:#2563eb;--st-semantic-feedback-info:#2563eb;--st-component-diagramScene-edgeStroke:#64748b;--st-component-diagramScene-linkStrokeWidth:2.5px;--st-component-diagramScene-linkRelatedStrokeWidth:3px;--st-component-diagramScene-linkPrimaryStrokeWidth:3.5px;--st-component-diagramScene-linkEmphasisStroke:${LINK_EMPHASIS_STROKE_FALLBACK};--st-component-diagramScene-linkEmphasisStrokeWidth:3.5px;--st-component-diagramScene-linkDashDashed:8 6;--st-component-diagramScene-linkDashDotted:2 5;--st-component-diagramScene-edgeCornerRadius:12px;--st-component-diagramScene-edgeLabelSize:18px}</style><defs><marker id="scene-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10.5" markerHeight="10.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="var(--st-component-diagramScene-edgeStroke, #64748b)"/></marker>${extraMarkerDefs}${maskDef}</defs>${frames}${connectors}${boxes}${labels}${legend}</svg>`;
  return {svg,result,scene};
}
