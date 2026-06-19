<script lang="ts">
  // ───────────────────────────────────────────────────────────────────────────
  // Page de démo « Cerclage / Diagram Annotation » (WP17).
  //
  // Charge une image de démonstration et expose les actions du DiagramAnnotator :
  // export PNG (ouvre/télécharge le data URL) et effacement.
  // ───────────────────────────────────────────────────────────────────────────
  import DiagramAnnotator from "$lib/feedback/DiagramAnnotator.svelte";

  // Réutilise un screenshot déjà versionné dans les statiques docs si présent ;
  // un placeholder SVG data-URL sinon (toujours rendable, build-safe).
  const demoSrc =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">
        <rect width="640" height="400" fill="#f4f4f5"/>
        <rect x="40" y="40" width="560" height="80" rx="8" fill="#e4e4e7"/>
        <rect x="40" y="160" width="260" height="160" rx="8" fill="#e4e4e7"/>
        <rect x="340" y="160" width="260" height="160" rx="8" fill="#d4d4d8"/>
        <text x="320" y="370" text-anchor="middle" font-family="sans-serif"
          font-size="16" fill="#71717a">Capture de composant (démo)</text>
      </svg>`
    );

  let annotator = $state<DiagramAnnotator | null>(null);
  let exported = $state<string | null>(null);

  function exportPng() {
    if (!annotator) return;
    exported = annotator.toPNG();
  }

  function download() {
    if (!exported) return;
    const a = document.createElement("a");
    a.href = exported;
    a.download = "annotation.png";
    a.click();
  }
</script>

<svelte:head>
  <title>Cerclage — Annotation de diagramme</title>
</svelte:head>

<main class="page">
  <header>
    <h1>Cerclage</h1>
    <p>
      Annotez visuellement une capture de composant : encerclez un bug ou cadrez
      une zone, puis exportez l'image annotée en PNG.
    </p>
  </header>

  <DiagramAnnotator
    bind:this={annotator}
    src={demoSrc}
    alt="Capture de composant de démonstration"
    width={640}
    height={400}
  />

  <div class="actions">
    <button type="button" onclick={exportPng}>Exporter en PNG</button>
    {#if exported}
      <button type="button" onclick={download}>Télécharger</button>
    {/if}
  </div>

  {#if exported}
    <figure class="result">
      <figcaption>Aperçu de l'export</figcaption>
      <img src={exported} alt="Annotation exportée" />
    </figure>
  {/if}
</main>

<style>
  .page {
    max-width: 760px;
    margin: 0 auto;
    padding: var(--st-space-6, 2rem) var(--st-space-4, 1rem);
    display: flex;
    flex-direction: column;
    gap: var(--st-space-5, 1.5rem);
  }

  header h1 {
    margin: 0 0 0.25rem;
  }

  header p {
    margin: 0;
    color: var(--st-color-text-muted, #71717a);
  }

  .actions {
    display: flex;
    gap: var(--st-space-2, 0.5rem);
  }

  .actions button {
    font: inherit;
    padding: 0.45rem 0.9rem;
    border-radius: var(--st-radius-sm, 6px);
    border: 1px solid var(--st-color-border, #d4d4d8);
    background: var(--st-color-surface, #fff);
    color: var(--st-color-text, #18181b);
    cursor: pointer;
  }

  .actions button:hover {
    border-color: var(--st-color-border-strong, #a1a1aa);
  }

  .result {
    margin: 0;
    border: 1px solid var(--st-color-border, #d4d4d8);
    border-radius: var(--st-radius-md, 8px);
    padding: var(--st-space-3, 0.75rem);
  }

  .result figcaption {
    font-size: 0.85rem;
    color: var(--st-color-text-muted, #71717a);
    margin-bottom: 0.5rem;
  }

  .result img {
    max-width: 100%;
    display: block;
  }
</style>
