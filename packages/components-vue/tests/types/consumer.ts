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

// V8 public subpaths retain props and exposed capture handles in both builds.
import { RichTextEditor, ComposerEditor, type RichTextEditorProps, type ComposerEditorProps, type RichTextEditorHandle, type ComposerEditorHandle } from '@sentropic/design-system-vue/rich-text-editor';
import { RichTextEditor as VaporRichTextEditor, ComposerEditor as VaporComposerEditor } from '@sentropic/design-system-vue/vapor/rich-text-editor';
import { LockPresenceBadge, type LockPresenceBadgeProps } from '@sentropic/design-system-vue/presence-badge';
import { LockPresenceBadge as VaporLockPresenceBadge } from '@sentropic/design-system-vue/vapor/presence-badge';
import { LabelledIconButton, WebFrame, type LabelledIconButtonProps, type WebFrameProps } from '@sentropic/design-system-vue';
import { LabelledIconButton as VaporLabelledIconButton, WebFrame as VaporWebFrame } from '@sentropic/design-system-vue/vapor';
declare const rich: InstanceType<typeof RichTextEditor>;
declare const composer: InstanceType<typeof ComposerEditor>;
declare const vaporRich: InstanceType<typeof VaporRichTextEditor>;
declare const vaporComposer: InstanceType<typeof VaporComposerEditor>;
const richHandle: RichTextEditorHandle = rich;
const vaporRichHandle: RichTextEditorHandle = vaporRich;
const composerHandle: ComposerEditorHandle = composer;
const vaporComposerHandle: ComposerEditorHandle = vaporComposer;
type V8Props = [RichTextEditorProps, ComposerEditorProps, LockPresenceBadgeProps, LabelledIconButtonProps, WebFrameProps];
type RichPropsParity = Assert<Equal<InstanceType<typeof RichTextEditor>['$props'], InstanceType<typeof VaporRichTextEditor>['$props']>>;
type BadgePropsParity = Assert<Equal<InstanceType<typeof LockPresenceBadge>['$props'], InstanceType<typeof VaporLockPresenceBadge>['$props']>>;
const v8VaporComponents = [VaporRichTextEditor, VaporComposerEditor, VaporLockPresenceBadge, VaporLabelledIconButton, VaporWebFrame] as const satisfies readonly VaporComponent[];
void [richHandle, vaporRichHandle, composerHandle, vaporComposerHandle, v8VaporComponents, LabelledIconButton, WebFrame];
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

import { EmptyState, NavShell, Notification } from '@sentropic/design-system-vue';
import { EmptyState as VaporEmptyState, NavShell as VaporNavShell, Notification as VaporNotification } from '@sentropic/design-system-vue/vapor';
import type { CellDecorationIconProps } from '@sentropic/design-system-vue';
import type { CellDecorationIconProps as VaporDecorationProps } from '@sentropic/design-system-vue/vapor';
type DecorationParity = Assert<Equal<CellDecorationIconProps, VaporDecorationProps>>;
({} satisfies InstanceType<typeof EmptyState>['$props']);
({} satisfies InstanceType<typeof VaporEmptyState>['$props']);
type EmptySlotParity = Assert<Equal<InstanceType<typeof EmptyState>['$slots'], InstanceType<typeof VaporEmptyState>['$slots']>>;
type EmptyTitleSlot = Assert<Equal<'title' extends keyof InstanceType<typeof EmptyState>['$slots'] ? true : false, true>>;
type EmptyMessageSlot = Assert<Equal<'message' extends keyof InstanceType<typeof VaporEmptyState>['$slots'] ? true : false, true>>;
type EmptyActionSlot = Assert<Equal<'action' extends keyof InstanceType<typeof VaporEmptyState>['$slots'] ? true : false, true>>;
type NavSearchSlot = Assert<Equal<'search' extends keyof InstanceType<typeof NavShell>['$slots'] ? true : false, true>>;
type NavFooterSlot = Assert<Equal<'footer' extends keyof InstanceType<typeof VaporNavShell>['$slots'] ? true : false, true>>;
type NotificationActions = Assert<Equal<'actions' extends keyof InstanceType<typeof Notification>['$slots'] ? true : false, true>>;
type VaporNotificationActions = Assert<Equal<'actions' extends keyof InstanceType<typeof VaporNotification>['$slots'] ? true : false, true>>;
import type { BreadcrumbItem, AccordionItem, DataTableColumn, ChatThreadProps } from '@sentropic/design-system-vue';
const slotOnlyBreadcrumbs: BreadcrumbItem[] = [{ href: '/' }, { current: true }];
const slotOnlyPanels: AccordionItem[] = [{ id: 'one', title: 'Panel' }];
const slotOnlyColumns: DataTableColumn[] = [{ key: 'name' }];
const slotOnlyMessages: ChatThreadProps = { messages: [{ id: 'one' }] };
void [slotOnlyBreadcrumbs, slotOnlyPanels, slotOnlyColumns, slotOnlyMessages];
