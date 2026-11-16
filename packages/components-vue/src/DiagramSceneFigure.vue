<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import DiagramSceneFigureBase from './DiagramSceneFigureBase.vue';
import NumberedScene from './DiagramNumberedScene.vue';
import type { DiagramSceneFigureProps as SceneFigureProps, DiagramSceneCamera } from './DiagramSceneFigure.types.js';
import type { LayoutResult } from '@sentropic/diagram-canvas';
import type { StepChange, EffectiveTarget } from '@sentropic/diagram-canvas/flowModel';
import type { SceneCollapsedOccurrences } from './DiagramSceneFigure.types.js';
import type { DiagramSceneSize, SceneOccurrenceRef } from '@sentropic/diagram-canvas/diagramSceneModel';

export type DiagramSceneFigureProps = SceneFigureProps;
const props = withDefaults(defineProps<DiagramSceneFigureProps>(), { strictIcons: true });
const emit = defineEmits<{
  'update:contentSize': [size: DiagramSceneSize];
  foldChange: [collapsed: SceneCollapsedOccurrences, change: { occurrence: SceneOccurrenceRef; collapsed: boolean }];
  select: [event: { entityId: string }];
  layout: [result: LayoutResult];
  cameraChange: [camera: DiagramSceneCamera];
  sizeChange: [size: DiagramSceneSize];
  stepChange: [change: StepChange | null];
  scenarioChange: [scenario: string | null];
  highlightChange: [target: EffectiveTarget | null];
}>();
const hostEvents = {
  onFoldChange: (collapsed: SceneCollapsedOccurrences, change: { occurrence: SceneOccurrenceRef; collapsed: boolean }) => emit('foldChange', collapsed, change),
  onSelect: (event: { entityId: string }) => emit('select', event),
  onLayout: (result: LayoutResult) => emit('layout', result),
  onCameraChange: (camera: DiagramSceneCamera) => emit('cameraChange', camera),
  onSizeChange: (size: DiagramSceneSize) => emit('sizeChange', size),
  onStepChange: (change: StepChange | null) => emit('stepChange', change),
  onScenarioChange: (scenario: string | null) => emit('scenarioChange', scenario),
  onHighlightChange: (target: EffectiveTarget | null) => emit('highlightChange', target),
};
// Retain the SFC camera/transition host for existing diagrams, and the shared
// flow binding for documents carrying flow definitions or explicit flow inputs.
// Both hosts share viewport measurement, ERD rendering and accessible text fallbacks.
const sceneHost = computed(() => props.document.typeDefinitions['flow-step'] !== undefined
  || props.flows !== undefined
  ? NumberedScene : DiagramSceneFigureBase);
const scene = shallowRef<{
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToFrame: () => void;
  getCamera: () => DiagramSceneCamera;
}>();
function setZoom(zoom: number) { scene.value?.setZoom(zoom); }
function zoomIn() { scene.value?.zoomIn(); }
function zoomOut() { scene.value?.zoomOut(); }
function fitToFrame() { scene.value?.fitToFrame(); }
function getCamera() { return scene.value!.getCamera(); }
defineExpose({ setZoom, zoomIn, zoomOut, fitToFrame, getCamera });
</script>

<template>
  <component :is="sceneHost" ref="scene" v-bind="{ ...props, ...hostEvents }" @update:content-size="emit('update:contentSize', $event)" />
</template>
