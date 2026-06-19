<script lang="ts">
  // ───────────────────────────────────────────────────────────────────────────
  // DiagramAnnotator — « Cerclage » (WP17)
  //
  // Annotation visuelle par-dessus une image de composant : encercler un bug,
  // cadrer une zone. Canvas HTML5 superposé à une <img>.
  //
  // CLIENT-ONLY : tout le rendu interactif est gardé par `browser` (le site docs
  // est prérendu via adapter-static, pas de DOM/Canvas au build).
  //
  // Outils : « cercle » (ellipse rouge) et « rect » (rectangle rouge), tracés au
  // click+drag. Bouton « Effacer ». Export PNG via canvas.toDataURL en
  // composant les annotations sur l'image source.
  // ───────────────────────────────────────────────────────────────────────────
  import { browser } from "$app/environment";

  type Tool = "circle" | "rect";
  type Shape = {
    tool: Tool;
    x: number;
    y: number;
    w: number;
    h: number;
  };

  let {
    src = "",
    alt = "Capture de composant à annoter",
    width = 640,
    height = 400,
    stroke = "#e11d48",
    lineWidth = 3
  }: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    stroke?: string;
    lineWidth?: number;
  } = $props();

  let tool = $state<Tool>("circle");
  let shapes = $state<Shape[]>([]);
  let draft = $state<Shape | null>(null);
  let drawing = $state(false);

  let canvas = $state<HTMLCanvasElement | null>(null);
  let img = $state<HTMLImageElement | null>(null);

  function pointer(ev: PointerEvent): { x: number; y: number } {
    const rect = (ev.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const sx = width / rect.width;
    const sy = height / rect.height;
    return {
      x: (ev.clientX - rect.left) * sx,
      y: (ev.clientY - rect.top) * sy
    };
  }

  function onPointerDown(ev: PointerEvent) {
    (ev.currentTarget as HTMLCanvasElement).setPointerCapture(ev.pointerId);
    const p = pointer(ev);
    draft = { tool, x: p.x, y: p.y, w: 0, h: 0 };
    drawing = true;
  }

  function onPointerMove(ev: PointerEvent) {
    if (!drawing || !draft) return;
    const p = pointer(ev);
    draft = { ...draft, w: p.x - draft.x, h: p.y - draft.y };
    redraw();
  }

  function onPointerUp(ev: PointerEvent) {
    if (!drawing || !draft) return;
    (ev.currentTarget as HTMLCanvasElement).releasePointerCapture(ev.pointerId);
    // ignore les clics sans glissement
    if (Math.abs(draft.w) > 2 || Math.abs(draft.h) > 2) {
      shapes = [...shapes, draft];
    }
    draft = null;
    drawing = false;
    redraw();
  }

  function drawShape(ctx: CanvasRenderingContext2D, s: Shape) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    if (s.tool === "rect") {
      ctx.rect(s.x, s.y, s.w, s.h);
    } else {
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;
      ctx.ellipse(
        cx,
        cy,
        Math.abs(s.w / 2),
        Math.abs(s.h / 2),
        0,
        0,
        Math.PI * 2
      );
    }
    ctx.stroke();
  }

  function redraw() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    for (const s of shapes) drawShape(ctx, s);
    if (draft) drawShape(ctx, draft);
  }

  export function clear() {
    shapes = [];
    draft = null;
    redraw();
  }

  // Export PNG : compose image source (si chargée) + annotations sur un canvas
  // hors-écran, retourne un data URL.
  export function toPNG(): string {
    const out = document.createElement("canvas");
    out.width = width;
    out.height = height;
    const ctx = out.getContext("2d");
    if (!ctx) return "";
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, width, height);
    }
    for (const s of shapes) drawShape(ctx, s);
    return out.toDataURL("image/png");
  }

  $effect(() => {
    // re-trace quand la liste change ou au montage
    void shapes;
    redraw();
  });
</script>

<div class="annotator">
  <div class="toolbar" role="toolbar" aria-label="Outils d'annotation">
    <button
      type="button"
      class="tool"
      class:active={tool === "circle"}
      aria-pressed={tool === "circle"}
      onclick={() => (tool = "circle")}
    >
      Cercle
    </button>
    <button
      type="button"
      class="tool"
      class:active={tool === "rect"}
      aria-pressed={tool === "rect"}
      onclick={() => (tool = "rect")}
    >
      Rectangle
    </button>
    <button type="button" class="tool" onclick={clear}>Effacer</button>
  </div>

  <div class="stage" style="aspect-ratio: {width} / {height};">
    {#if src}
      <img bind:this={img} {src} {alt} crossorigin="anonymous" draggable="false" />
    {:else}
      <div class="placeholder">Aucune image — passez la prop <code>src</code></div>
    {/if}
    {#if browser}
      <canvas
        bind:this={canvas}
        {width}
        {height}
        class:rect-cursor={tool === "rect"}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerUp}
        onpointerleave={onPointerUp}
      ></canvas>
    {/if}
  </div>
</div>

<style>
  .annotator {
    display: flex;
    flex-direction: column;
    gap: var(--st-space-3, 0.75rem);
  }

  .toolbar {
    display: flex;
    gap: var(--st-space-2, 0.5rem);
    flex-wrap: wrap;
  }

  .tool {
    font: inherit;
    padding: 0.35rem 0.75rem;
    border-radius: var(--st-radius-sm, 6px);
    border: 1px solid var(--st-color-border, #d4d4d8);
    background: var(--st-color-surface, #fff);
    color: var(--st-color-text, #18181b);
    cursor: pointer;
  }

  .tool:hover {
    border-color: var(--st-color-border-strong, #a1a1aa);
  }

  .tool.active {
    background: var(--st-color-accent, #e11d48);
    border-color: var(--st-color-accent, #e11d48);
    color: #fff;
  }

  .stage {
    position: relative;
    width: 100%;
    max-width: 100%;
    border: 1px solid var(--st-color-border, #d4d4d8);
    border-radius: var(--st-radius-md, 8px);
    overflow: hidden;
    background: var(--st-color-surface-muted, #f4f4f5);
  }

  .stage img,
  .stage canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .stage img {
    object-fit: contain;
    user-select: none;
  }

  .stage canvas {
    cursor: crosshair;
    touch-action: none;
  }

  .placeholder {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--st-color-text-muted, #71717a);
    font-size: 0.9rem;
    text-align: center;
    padding: 1rem;
  }
</style>
