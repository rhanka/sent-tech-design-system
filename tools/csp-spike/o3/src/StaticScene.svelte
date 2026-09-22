<script>
  // Repli « SVG statique » : consomme une vue déjà placée, n'embarque aucun placeur.
  // Aucun attribut style : la géométrie passe par des attributs SVG, la peinture par des classes.
  let { view } = $props();
  const pathOf = (e) => (e.sections ?? []).map((s) => {
    const pts = [s.startPoint, ...(s.bendPoints ?? []), s.endPoint];
    return 'M' + pts.map((p) => `${p.x} ${p.y}`).join(' L');
  }).join(' ');
</script>

<svg class="st-scene" viewBox="0 0 {Math.ceil(view.width)} {Math.ceil(view.height)}" role="img" aria-label="Scène statique">
  <g class="st-scene-edges">
    {#each view.edges as e (e.id)}<path class="st-scene-edge" d={pathOf(e)} />{/each}
  </g>
  {#each view.children as n (n.id)}
    <g class="st-scene-node" transform="translate({n.x} {n.y})">
      <rect width={n.width} height={n.height} rx="6" />
      <text x="10" y={n.height / 2 + 4}>{n.labels?.[0]?.text ?? n.id}</text>
    </g>
  {/each}
</svg>
