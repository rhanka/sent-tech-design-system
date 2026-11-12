/** Shared logical flow interaction; framework hosts bind events and attributes only. */
import type { FlowStep } from "@sentropic/diagram-core";
import { DEFAULT_FLOW_TOKENS, type FlowTokens } from "../layout/flows.js";
import type { SceneModel } from "./diagramSceneModel.js";

export type Selection = { readonly kind: "step"; readonly relation: string } | { readonly kind: "node"; readonly entity: string } | null;
export type Visible = { readonly kind: "edge"; readonly occurrence: string } | { readonly kind: "bundle"; readonly id: string } | { readonly kind: "box"; readonly occurrence: string };
export interface FlowState { readonly selection: Selection; readonly hover: Visible|null; readonly focus: Visible|null; readonly scenario?: string; readonly muted: boolean }
export interface EffectiveTarget { readonly visible: Visible; readonly step?: string }
export const INITIAL_FLOW_STATE: FlowState = Object.freeze({selection:null,hover:null,focus:null,muted:false});
export type FlowAction = { readonly type:"activate"; readonly target:Visible } | { readonly type:"hover"|"focus"; readonly target:Visible|null } | { readonly type:"next"|"previous"|"first"|"last"|"escape"|"repair" } | {readonly type:"scenario";readonly id?:string};
export interface StepChange { readonly relation:string; readonly scenario:string; readonly ordinal:number; readonly realises?:string; readonly visible:Visible }
export interface FlowStrings { readonly step:string; readonly scenario:string; readonly count:string; readonly node:string; readonly "navigator":string; readonly previous:string; readonly next:string; readonly allScenarios:string }
export const DEFAULT_FLOW_STRINGS: FlowStrings = Object.freeze({step:"Step",scenario:"Scenario",count:"{n}",node:"Component","navigator":"Flow navigation",previous:"Previous step",next:"Next step",allScenarios:"All scenarios"});
const same=(a:unknown,b:unknown):boolean=>JSON.stringify(a)===JSON.stringify(b);
export const stepsOf=(scene:SceneModel):readonly FlowStep[]=>scene.flows.scenarios.flatMap((s)=>s.steps);
export function visibleOf(scene:SceneModel,selection:Selection):Visible|null {
  if(selection===null)return null;
  if(selection.kind==="node") { const box=scene.flowRepresentatives[selection.entity];return box===undefined?null:{kind:"box",occurrence:box}; }
  const target=scene.flowTargets[selection.relation];
  return target===undefined?null:target.kind==="internal"?{kind:"box",occurrence:target.box}:target.kind==="bundle"?{kind:"bundle",id:target.id}:{kind:"edge",occurrence:target.occurrence};
}
export function effectiveTarget(scene:SceneModel,state:FlowState):EffectiveTarget|null {
  const selected=visibleOf(scene,state.selection);
  const visible=(!state.muted&&(state.hover??state.focus))||selected;
  if(visible===null)return null;
  const own=visible.kind==="edge"?scene.edges.find((e)=>e.occurrence===visible.occurrence)?.flow?.relation:undefined;
  const step=own??(state.selection?.kind==="step"&&same(selected,visible)?state.selection.relation:undefined);
  return {visible,...(step===undefined?{}:{step})};
}
export function stepChange(scene:SceneModel,selection:Selection):StepChange|null {
  if(selection?.kind!=="step")return null;
  const step=scene.flows.byRelation[selection.relation],visible=visibleOf(scene,selection);
  return step===undefined||visible===null?null:{relation:step.relation,scenario:step.scenario,ordinal:step.ordinal,...(step.realises===undefined?{}:{realises:step.realises}),visible};
}
export function reduce(scene:SceneModel,state:FlowState,action:FlowAction):{state:FlowState;emit:("step"|"scenario"|"highlight")[]} {
  let next=state;
  const filtered=stepsOf(scene).filter((s)=>state.scenario===undefined||s.scenario===state.scenario);
  if(action.type==="hover"||action.type==="focus") {
    if(!same(state[action.type],action.target))next={...state,[action.type]:action.target,muted:false};
  } else if(action.type==="escape")next={...state,selection:null,muted:true};
  else if(action.type==="scenario") {
    const {scenario:_previous,...rest}=state;
    const selection=state.selection?.kind==="step"&&action.id!==undefined&&scene.flows.byRelation[state.selection.relation]?.scenario!==action.id?null:state.selection;
    next={...rest,...(action.id===undefined?{}:{scenario:action.id}),selection};
  } else if(action.type==="repair") {
    const valid=(v:Visible|null):Visible|null=>v!==null&&(v.kind==="box"?scene.nodes.some((n)=>n.occurrence===v.occurrence):v.kind==="bundle"?scene.edges.some((e)=>e.bundle?.id===v.id):scene.edges.some((e)=>e.occurrence===v.occurrence))?v:null;
    next={...state,selection:visibleOf(scene,state.selection)===null?null:state.selection,hover:valid(state.hover),focus:valid(state.focus)};
  } else if(action.type==="activate") {
    const target=action.target;let selection:Selection=null;
    if(target.kind==="box") {const node=scene.nodes.find((n)=>n.occurrence===target.occurrence);if(node!==undefined)selection={kind:"node",entity:node.entity};}
    else if(target.kind==="edge") {const step=scene.edges.find((e)=>e.occurrence===target.occurrence)?.flow;if(step!==undefined)selection={kind:"step",relation:step.relation};}
    else {
      const bundle=scene.edges.find((e)=>e.bundle?.id===target.id)?.bundle;
      if(bundle!==undefined) {
        const selected=state.selection?.kind==="step"?bundle.members.findIndex((m)=>m.relation===(state.selection as {relation:string}).relation):-1;
        const member=selected>=0?bundle.members[(selected+1)%bundle.members.length]:bundle.members.find((m)=>state.scenario!==undefined&&scene.flows.byRelation[m.relation]?.scenario===state.scenario)??bundle.members[0];
        if(member!==undefined)selection={kind:"step",relation:member.relation};
      }
    }
    next={...state,selection:target.kind!=="bundle"&&same(selection,state.selection)?null:selection,muted:false};
  } else {
    const position=state.selection?.kind==="step"?filtered.findIndex((s)=>s.relation===(state.selection as {relation:string}).relation):-1;
    const index=action.type==="first"?0:action.type==="last"?filtered.length-1:action.type==="next"?Math.min(filtered.length-1,position+1):position<0?filtered.length-1:Math.max(0,position-1);
    const step=filtered[index];if(step!==undefined)next={...state,selection:{kind:"step",relation:step.relation},muted:false};
  }
  const emit:("step"|"scenario"|"highlight")[]=[];
  if(!same(state.selection,next.selection))emit.push("step");
  if(state.scenario!==next.scenario)emit.push("scenario");
  if(!same(effectiveTarget(scene,state),effectiveTarget(scene,next)))emit.push("highlight");
  return {state:next,emit};
}
export function highlightOf(scene:SceneModel,state:FlowState):{primary:ReadonlySet<string>;related:ReadonlySet<string>;dimmed:ReadonlySet<string>} {
  const primary=new Set<string>(),related=new Set<string>(),dimmed=new Set<string>();
  const universe=new Set([...scene.nodes.map((n)=>n.occurrence as string),...scene.edges.map((e)=>e.occurrence as string),...scene.edges.flatMap((e)=>e.bundle===undefined?[]:[e.bundle.id])]);
  const ancestors=(id:string,set:Set<string>)=>{for(const parent of scene.flowAncestors[id]??[])set.add(parent);};
  const addStep=(step:FlowStep,set:Set<string>,ends:boolean)=> {
    const target=scene.flowTargets[step.relation];if(target===undefined)return;
    if(target.kind==="internal"){set.add(target.box);if(ends)ancestors(target.box,set);return;}
    set.add(target.occurrence);if(target.kind==="bundle")set.add(target.id);
    if(ends)for(const id of scene.flowEnds[step.relation]??[]){set.add(id);}
  };
  const effective=effectiveTarget(scene,state);
  if(effective===null&&state.scenario===undefined)return {primary,related,dimmed};
  if(effective===null){
    const kept=new Set<string>();for(const step of stepsOf(scene).filter((s)=>s.scenario===state.scenario)) {addStep(step,kept,true);for(const id of scene.flowEnds[step.relation]??[])ancestors(id,kept);}
    for(const id of universe)if(!kept.has(id))dimmed.add(id);return {primary,related,dimmed};
  }
  const step=effective.step===undefined?undefined:scene.flows.byRelation[effective.step];
  const scenarios=new Set<string>();
  if(step!==undefined){addStep(step,primary,true);scenarios.add(step.scenario);for(const id of scene.flowEnds[step.relation]??[])ancestors(id,related);}
  else if(effective.visible.kind==="bundle"){
    const bundle=scene.edges.find((e)=>e.bundle?.id===(effective.visible as {id:string}).id)?.bundle;
    for(const m of bundle?.members??[]){const member=scene.flows.byRelation[m.relation];if(member!==undefined){addStep(member,primary,true);scenarios.add(member.scenario);for(const id of scene.flowEnds[m.relation]??[])ancestors(id,related);}}
  } else if(effective.visible.kind==="box") {
    const box=effective.visible.occurrence;primary.add(box);ancestors(box,related);
    for(const s of stepsOf(scene))if((scene.flowEnds[s.relation]??[]).some((id)=>id===box||(scene.flowAncestors[id]??[]).includes(box))) {
      addStep(s,primary,false);for(const id of scene.flowEnds[s.relation]??[])if(id!==box){related.add(id);ancestors(id,related);}
    }
  }
  for(const s of stepsOf(scene))if(scenarios.has(s.scenario))addStep(s,related,false);
  for(const id of primary)related.delete(id);
  for(const id of universe)if(!primary.has(id)&&!related.has(id))dimmed.add(id);
  return {primary,related,dimmed};
}
export function flowStateOf(highlight:ReturnType<typeof highlightOf>,id:string):"primary"|"related"|"dim"|undefined {
  return highlight.primary.has(id)?"primary":highlight.related.has(id)?"related":highlight.dimmed.has(id)?"dim":undefined;
}
const nameOf=(scene:SceneModel,entity:string):string=>scene.nodes.find((n)=>n.entity===entity)?.text||entity;
export function describeTarget(scene:SceneModel,visible:Visible,strings:FlowStrings=DEFAULT_FLOW_STRINGS):string {
  const describe=(step:FlowStep)=>[strings.step+" "+step.badge,scene.flows.scenarios.find((s)=>s.id===step.scenario)?.label,nameOf(scene,step.source)+" → "+nameOf(scene,step.target),step.label,step.realises].filter(Boolean).join(". ");
  if(visible.kind==="edge"){const step=scene.edges.find((e)=>e.occurrence===visible.occurrence)?.flow;return step===undefined?"":describe(step);}
  if(visible.kind==="bundle"){
    const bundle=scene.edges.find((e)=>e.bundle?.id===visible.id)?.bundle;if(bundle===undefined)return "";
    return [strings.count.replaceAll("{n}",String(bundle.members.length)),...bundle.members.map((m)=>scene.flows.byRelation[m.relation]).filter((s):s is FlowStep=>s!==undefined).map(describe),...bundle.summaries.map((id)=>scene.flowSummaryLabels[id]??id)].join(". ");
  }
  const node=scene.nodes.find((n)=>n.occurrence===visible.occurrence);if(node===undefined)return "";
  const steps=stepsOf(scene).filter((s)=>(scene.flowEnds[s.relation]??[]).some((id)=>id===node.occurrence||(scene.flowAncestors[id]??[]).includes(node.occurrence)));
  return [strings.node+" "+node.text,...steps.map(describe)].join(". ");
}
export function announce(scene:SceneModel,state:FlowState,strings:FlowStrings=DEFAULT_FLOW_STRINGS):string {
  if(state.selection?.kind==="step"){const step=scene.flows.byRelation[state.selection.relation];return step===undefined?"":strings.step+" "+step.badge+(step.label?". "+step.label:"");}
  return "";
}
export function flowHitSize(zoom:number,tokens:Pick<FlowTokens,"flowBadgeSize"|"flowTargetMinSize">=DEFAULT_FLOW_TOKENS):number { return Math.max(tokens.flowBadgeSize,tokens.flowTargetMinSize/zoom); }
const escape=(s:string)=>s.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
export function flowMarksSvg(scene:SceneModel,tokens:FlowTokens=DEFAULT_FLOW_TOKENS):string {
  return scene.edges.flatMap((edge)=>edge.arrows.map((arrow)=>'<path data-flow-arrow="'+escape(edge.occurrence)+'" d="'+escape(tokens.flowArrowPath)+'" transform="translate('+arrow.tip.x+' '+arrow.tip.y+') rotate('+arrow.angle+') translate('+(-tokens.flowArrowLength)+' '+(-tokens.flowArrowWidth/2)+')" fill="var(--st-component-diagramScene-flowStroke)"/>')).join("")+scene.badges.map((badge)=>'<g data-flow-badge="'+escape(badge.id)+'"><rect x="'+badge.box.x+'" y="'+badge.box.y+'" width="'+badge.box.width+'" height="'+badge.box.height+'" rx="var(--st-component-diagramScene-flowBadgeRadius)" fill="var(--st-component-diagramScene-flowBadgeBackground)"/><text x="'+(badge.box.x+badge.box.width/2)+'" y="'+(badge.box.y+badge.box.height/2)+'" text-anchor="middle" dominant-baseline="central" fill="var(--st-component-diagramScene-flowBadgeText)" font-size="var(--st-component-diagramScene-flowBadgeFontSize)">'+escape(badge.text)+'</text></g>').join("");
}
