<script lang="ts">
  import DiagramSceneFigure, { type DiagramSceneFigureProps } from "./DiagramSceneFigure.svelte";
  import type { DiagramSceneSize } from "@sentropic/diagram-canvas/diagramSceneModel";
  let { figureProps, publish }: { figureProps: DiagramSceneFigureProps; publish: (size: DiagramSceneSize) => void } = $props();
  let contentSize = $state<DiagramSceneSize>({ width: 0, height: 0 });
  $effect(() => publish(contentSize));
</script>
<DiagramSceneFigure {...figureProps} bind:contentSize />
