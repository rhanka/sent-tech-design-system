import { evaluateVisibility, relationVerdict } from "../visibility.js";
/** Flow-only layout metadata and mark placement. No host or DOM state. */
import { flowIndex, representativeOf, resolveSummaries, type FlowIndex, type FlowStep, type OccurrenceRef, type ProfileRegistry, type SemanticDocument, type ViewDocument } from "@sentropic/diagram-core";
import type { Rect, Vec2 } from "../transform.js";
import { placePackedLabel } from "./labels.js";
import type { LineMeasurer } from "./measure.js";
import type { LayoutOptions, LayoutWarning } from "./types.js";

export interface FlowTokens {
  readonly flowBadgeSize: number;
  readonly flowBadgePaddingX: number;
  readonly flowArrowLength: number;
  readonly flowArrowWidth: number;
  readonly flowTargetMinSize: number;
  readonly flowFanOutMax: number;
  readonly flowArrowPath: string;
}
export const FLOW_BADGE_FONT_SIZE = 16;
export const FLOW_BADGE_LINE_HEIGHT = 20;
export const DEFAULT_FLOW_TOKENS: FlowTokens = Object.freeze({ flowBadgeSize: 28, flowBadgePaddingX: 6, flowArrowLength: 10, flowArrowWidth: 10, flowTargetMinSize: 24, flowFanOutMax: 4, flowArrowPath: "M0 0L10 5L0 10Z" });
export interface FlowArrow { readonly tip: Vec2; readonly angle: 0 | 90 | 180 | 270; readonly box: Rect }
export interface FlowBundle {
  readonly id: string;
  readonly reason: "fold" | "fan-out" | "obstructed";
  readonly carrier: OccurrenceRef;
  readonly members: readonly { readonly occurrence: OccurrenceRef; readonly relation: string; readonly direction: "forward" | "backward"; readonly source: string; readonly target: string }[];
  readonly forward: number;
  readonly backward: number;
  readonly summaries: readonly string[];
}
export type FlowVisibleTarget = { readonly kind: "edge"; readonly occurrence: OccurrenceRef; readonly badge: boolean }
  | { readonly kind: "bundle"; readonly id: string; readonly occurrence: OccurrenceRef; readonly badge: boolean }
  | { readonly kind: "internal"; readonly box: OccurrenceRef };
export interface FlowMember { readonly occurrence: OccurrenceRef; readonly step: FlowStep; readonly source: OccurrenceRef; readonly target: OccurrenceRef; readonly retargeted: boolean; readonly key: string; readonly rank: number }
export interface FlowPlan {
  readonly index: FlowIndex;
  readonly members: readonly FlowMember[];
  readonly groups: ReadonlyMap<string, readonly FlowMember[]>;
  readonly bundles: readonly FlowBundle[];
  readonly suppressed: ReadonlySet<string>;
  readonly targets: Readonly<Record<string, FlowVisibleTarget>>;
  readonly ranks: ReadonlyMap<string, number>;
}
const cmp = (a: string,b: string) => a < b ? -1 : a > b ? 1 : 0;

export function planFlows(document: SemanticDocument, view: ViewDocument, registry: ProfileRegistry, options: LayoutOptions, forced: ReadonlySet<string>): FlowPlan {
  const index=flowIndex(document), targets: Record<string,FlowVisibleTarget>={}, suppressed=new Set<string>();
  const ranks=new Map<string,number>(), members: FlowMember[]=[], groups=new Map<string,FlowMember[]>();
  const ordered=index.scenarios.flatMap((s)=>s.steps); const rank=new Map(ordered.map((s,i)=>[s.relation,i]));
  const visible=evaluateVisibility({document,view}).visible;
  const collapsed=new Set<string>(options.collapsed ?? Object.values(view.groups).filter((g)=>g.collapsed).map((g)=>g.occurrence!));
  const boxOf=(id: OccurrenceRef): OccurrenceRef => representativeOf(view,collapsed,view.portOccurrences[id]?.ownerOccurrence ?? id);
  for(const occurrence of Object.values(view.relationOccurrences).sort((a,b)=> (rank.get(a.relation) ?? Infinity)-(rank.get(b.relation) ?? Infinity)||cmp(a.id,b.id))) {
    const step=index.byRelation[occurrence.relation]; if(step===undefined) continue;
    suppressed.add(occurrence.id);
    if (!relationVerdict(view, document.relations[occurrence.relation]!, document).visible) continue;
    const sourceEnd=occurrence.endpoints.find((e)=>e.role==="source"), targetEnd=occurrence.endpoints.find((e)=>e.role==="target");
    if(sourceEnd===undefined||targetEnd===undefined) continue;
    const source=boxOf(sourceEnd.occurrence),target=boxOf(targetEnd.occurrence);
    if (!visible.has(source) || !visible.has(target)) continue;
    if(source===target || step.self) { suppressed.add(occurrence.id); targets[step.relation]={kind:"internal",box:source}; continue; }
    const key="flow:"+[source,target].sort().join("|")+"|"+(occurrence.strokeStyle ?? "solid");
    const member={ occurrence:occurrence.id,step,source,target,retargeted:occurrence.endpoints.some((e)=>e.semanticTarget!==undefined),key,rank:rank.get(step.relation)! };
    suppressed.delete(occurrence.id);
    members.push(member); ranks.set(occurrence.id,member.rank);
    (groups.get(key) ?? groups.set(key,[]).get(key)!).push(member);
    targets[step.relation]={kind:"edge",occurrence:occurrence.id,badge:false};
  }
  const bundles: FlowBundle[]=[];
  const summaries=members.length===0?new Map():resolveSummaries(view,document,{registry});
  const cap=options.flows?.fanOutMax ?? options.flowTokens?.flowFanOutMax ?? DEFAULT_FLOW_TOKENS.flowFanOutMax;
  for(const [key,group] of groups) {
    const reason=group.length>=2&&group.some((m)=>m.retargeted)?"fold":group.length>cap?"fan-out":group.length>=2&&forced.has(key)?"obstructed":undefined;
    if(reason===undefined) continue;
    const carrier=group[0]!;
    const entries=group.map((m)=>({occurrence:m.occurrence,relation:m.step.relation,direction:m.source===carrier.source?"forward" as const:"backward" as const,source:m.step.source,target:m.step.target}));
    const bundle:FlowBundle={id:key,reason,carrier:carrier.occurrence,members:entries,forward:entries.filter((m)=>m.direction==="forward").length,backward:entries.filter((m)=>m.direction==="backward").length,
      summaries:[...summaries].filter(([,s])=>s.members.some((m: string)=>group.some((g)=>g.occurrence===m))).map(([,summary])=>summary.definitionId).sort(cmp)};
    bundles.push(bundle);
    for(const m of group) { if(m!==carrier) suppressed.add(m.occurrence); targets[m.step.relation]={kind:"bundle",id:key,occurrence:carrier.occurrence,badge:false}; }
  }
  return {index,members,groups,bundles,suppressed,targets,ranks};
}

export function arrowAt(route: readonly Vec2[], start: boolean, tokens: FlowTokens): FlowArrow | undefined {
  const points=start?[...route].reverse():route; const tip=points.at(-1); if(tip===undefined) return undefined;
  const previous=[...points].reverse().find((p)=>p.x!==tip.x||p.y!==tip.y); if(previous===undefined) return undefined;
  const angle=previous.y===tip.y?(previous.x<tip.x?0:180):(previous.y<tip.y?90:270);
  const length=tokens.flowArrowLength, width=tokens.flowArrowWidth;
  const box=angle===0?{x:tip.x-length,y:tip.y-width/2,width:length,height:width}:angle===180?{x:tip.x,y:tip.y-width/2,width:length,height:width}:angle===90?{x:tip.x-width/2,y:tip.y-length,width,height:length}:{x:tip.x-width/2,y:tip.y,width,height:length};
  return {tip,angle,box};
}
export function placeFlowMarks(input: { plan: FlowPlan; routes: ReadonlyMap<string,readonly Vec2[]>; shapes: readonly Rect[]; within: ReadonlyMap<string,Rect>; limit?: Rect; measure: LineMeasurer; options: LayoutOptions; margin: number }) {
  const {plan}=input, tokens={...DEFAULT_FLOW_TOKENS,...input.options.flowTokens};
  const arrows:Record<string,FlowArrow[]>={}, badges:Record<string,Rect>={}, targets={...plan.targets};
  const warnings:LayoutWarning[]=[], taken:Rect[]=[];
  for(const m of plan.members) {
    if(plan.suppressed.has(m.occurrence)) continue;
    const route=input.routes.get(m.occurrence); if(route===undefined) continue;
    const bundle=plan.bundles.find((b)=>b.carrier===m.occurrence);
    const atEnd=arrowAt(route,false,tokens), atStart=bundle!==undefined&&bundle.backward>0?arrowAt(route,true,tokens):undefined;
    arrows[m.occurrence]=[atEnd,atStart].filter((a):a is FlowArrow=>a!==undefined);
    taken.push(...arrows[m.occurrence]!.map((a)=>a.box));
  }
  for(const m of plan.members) {
    if(plan.suppressed.has(m.occurrence)) continue;
    const route=input.routes.get(m.occurrence); if(route===undefined) continue;
    const bundle=plan.bundles.find((b)=>b.carrier===m.occurrence);
    const text=bundle===undefined?m.step.badge:(input.options.flows?.countTemplate ?? "{n}").replaceAll("{n}",String(bundle.members.length));
    const measured=input.measure({text,role:"flow-badge",availableWidth:Number.MAX_SAFE_INTEGER,allocatedLines:1,folded:false});
    const size={width:Math.max(tokens.flowBadgeSize,measured.width+2*tokens.flowBadgePaddingX),height:tokens.flowBadgeSize};
    const within=input.within.get(m.occurrence);
    const entry={id:m.occurrence,route,size,segmentOrder:"route-order" as const,...(within===undefined?{}:{within}),...(input.limit===undefined?{}:{limit:input.limit})};
    const placement=placePackedLabel(entry,input.shapes,taken,input.margin);
    if(placement!==undefined) { badges[m.occurrence]=placement.box; taken.push(placement.box); }
    else warnings.push({code:"badge-unplaced",refs:[m.occurrence],message:"no segment holds the flow badge"});
    for(const member of bundle?.members ?? [{relation:m.step.relation}]) { const target=targets[member.relation]; if(target!==undefined&&target.kind!=="internal") targets[member.relation]={...target,badge:placement!==undefined}; }
  }
  for(const b of plan.bundles) warnings.push({code:"flow-bundled",refs:b.members.map((m)=>m.occurrence),message:b.reason});
  return {arrows,badges,targets,warnings,taken};
}
