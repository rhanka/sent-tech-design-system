import { DiagramSceneFigure, GraphCanvas, DiagramZone } from '@sentropic/design-system-vue';
import type { CardDiagnostic, CardLineMeasure, DiagramCardToggle, DiagramGlyphPaths, DiagramZoneToggle, ZoneDiagnostic, ZoneChildSpec, SceneDocument, SceneOccurrenceRef, ScenePresentation, SceneView, ForceGraphProps } from '@sentropic/design-system-vue';
import { DiagramIcon } from '@sentropic/design-system-vue/diagram-icons';
import type { DiagramIconProps } from '@sentropic/design-system-vue/diagram-icons';
import type { DiagramIconProps as RootIconProps } from '@sentropic/design-system-vue';
import type { DiagramIconProps as VaporIconProps } from '@sentropic/design-system-vue/vapor/diagram-icons';
import type { DiagramIconProps as VaporRootIconProps } from '@sentropic/design-system-vue/vapor';
import { renderCardSvg, renderZoneSvg } from '@sentropic/design-system-vue/diagram-render';
import { BpmnCanvas } from '@sentropic/design-system-vue/bpmn';
import { DiagramSceneFigure as VaporScene, GraphCanvas as VaporGraph, DiagramZone as VaporZone, DiagramCard as VaporCard, ForceGraph as VaporForceGraph, GraphLegend as VaporLegend } from '@sentropic/design-system-vue/vapor';
import { createVaporApp, createVaporSSRApp, createComponent, defineVaporAsyncComponent, type VaporComponent } from 'vue';
import type * as Vapor from '@sentropic/design-system-vue/vapor';
import { DiagramIcon as VaporIcon } from '@sentropic/design-system-vue/vapor/diagram-icons';
import { BpmnCanvas as VaporBpmn } from '@sentropic/design-system-vue/vapor/bpmn';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type IconContract = { name: string; size?: number; class?: string };
type IconProps = Assert<Equal<DiagramIconProps, IconContract>>;
type RootIconParity = Assert<Equal<RootIconProps, DiagramIconProps>>;
type VaporIconParity = Assert<Equal<VaporIconProps, DiagramIconProps>>;
type VaporRootIconParity = Assert<Equal<VaporRootIconProps, DiagramIconProps>>;
const iconProps: DiagramIconProps = { name: 'server', size: 48, class: 'custom-icon' };
const minimalIconProps: VaporIconProps = { name: 'server' };
iconProps satisfies InstanceType<typeof DiagramIcon>['$props'];
iconProps satisfies InstanceType<typeof VaporIcon>['$props'];
minimalIconProps satisfies InstanceType<typeof DiagramIcon>['$props'];
minimalIconProps satisfies InstanceType<typeof VaporIcon>['$props'];
// @ts-expect-error A glyph name is required.
const missingIconName: DiagramIconProps = {};
// @ts-expect-error Icon size is a number.
const invalidIconSize: VaporIconProps = { name: 'server', size: '48' };
type Contracts = [CardDiagnostic, CardLineMeasure, DiagramCardToggle, DiagramGlyphPaths, DiagramZoneToggle, ZoneDiagnostic, ZoneChildSpec, SceneDocument, SceneOccurrenceRef, ScenePresentation, SceneView];
type VaporContracts = [Vapor.CardDiagnostic, Vapor.CardLineMeasure, Vapor.DiagramCardToggle, Vapor.DiagramGlyphPaths, Vapor.DiagramZoneToggle, Vapor.ZoneDiagnostic, Vapor.ZoneChildSpec, Vapor.SceneDocument, Vapor.SceneOccurrenceRef, Vapor.ScenePresentation, Vapor.SceneView];
type Parity = Assert<Equal<Contracts, VaporContracts>>;
type LabelRequired = Assert<Equal<{} extends Pick<ForceGraphProps, 'label'> ? true : false, false>>;
declare const scene: InstanceType<typeof VaporScene>;
scene.setZoom(1); scene.getCamera(); scene.fitToFrame();
declare const graph: InstanceType<typeof VaporGraph>;
graph.invalidateGraph();
declare const bpmn: InstanceType<typeof VaporBpmn>;
bpmn.ready.then(() => { const state: 'idle' | 'rendering' | 'rendered' | 'refused' = bpmn.state; return [state, bpmn.diagnostics]; });
type ZoneSlots = Assert<Equal<InstanceType<typeof VaporZone>['$slots'], InstanceType<typeof DiagramZone>['$slots']>>;
type BpmnSlots = Assert<Equal<InstanceType<typeof VaporBpmn>['$slots'], InstanceType<typeof BpmnCanvas>['$slots']>>;
void [DiagramSceneFigure, GraphCanvas, DiagramIcon, VaporIcon, renderCardSvg, renderZoneSvg];

// Every published Vapor entry must work directly with the Vue 3.6 APIs.
const vaporComponents = [VaporScene, VaporGraph, VaporZone, VaporCard, VaporForceGraph, VaporLegend, VaporIcon, VaporBpmn] as const satisfies readonly VaporComponent[];
for (const component of vaporComponents) {
  createVaporApp(component);
  createVaporSSRApp(component);
  createComponent(component);
}
defineVaporAsyncComponent(async () => VaporScene);
defineVaporAsyncComponent(() => import('@sentropic/design-system-vue/vapor/bpmn'));
type NoVdomInstance = Assert<Equal<'$data' extends keyof InstanceType<typeof VaporScene> ? true : false, false>>;
type SceneProps = Assert<Equal<InstanceType<typeof VaporScene>['$props'], InstanceType<typeof DiagramSceneFigure>['$props']>>;
type ZoneEmit = Assert<Equal<InstanceType<typeof VaporZone>['$emit'], InstanceType<typeof DiagramZone>['$emit']>>;
// @ts-expect-error Exposed methods retain their argument types.
scene.setZoom('large');
// @ts-expect-error Required component props must remain required.
const missingLabel: InstanceType<typeof VaporForceGraph>['$props'] = { nodes: [], edges: [] };

// Rich-content migrations support slot-only callers in both published modes.
import { Alert, Switch, Toggle, Toggletip, FormGroup, Tooltip } from '@sentropic/design-system-vue';
import { Alert as VaporAlert, Switch as VaporSwitch, Toggle as VaporToggle, Toggletip as VaporToggletip, FormGroup as VaporFormGroup, Tooltip as VaporTooltip } from '@sentropic/design-system-vue/vapor';
({} satisfies InstanceType<typeof Alert>['$props']);
({} satisfies InstanceType<typeof Switch>['$props']);
({} satisfies InstanceType<typeof Toggle>['$props']);
({} satisfies InstanceType<typeof Toggletip>['$props']);
({} satisfies InstanceType<typeof FormGroup>['$props']);
({} satisfies InstanceType<typeof Tooltip>['$props']);
({} satisfies InstanceType<typeof VaporAlert>['$props']);
({} satisfies InstanceType<typeof VaporSwitch>['$props']);
({} satisfies InstanceType<typeof VaporToggle>['$props']);
({} satisfies InstanceType<typeof VaporToggletip>['$props']);
({} satisfies InstanceType<typeof VaporFormGroup>['$props']);
({} satisfies InstanceType<typeof VaporTooltip>['$props']);
