<script lang="ts">
  import { Badge, Button, AreaChart, type AreaChartDatum, type AreaChartTone } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  // State variables for the interactive playground
  let smooth = $state(false);
  let tone = $state<AreaChartTone>("category1");
  let width = $state(480);
  let height = $state(240);
  let label = $state("Statistiques d'utilisation");

  // Predefined datasets
  const datasets = {
    server: {
      nameFr: "Activité serveur (Hebdomadaire)",
      nameEn: "Server Activity (Weekly)",
      data: [
        { x: "Lun", y: 42 },
        { x: "Mar", y: 65 },
        { x: "Mer", y: 30 },
        { x: "Jeu", y: 85 },
        { x: "Ven", y: 55 },
        { x: "Sam", y: 20 },
        { x: "Dim", y: 15 }
      ]
    },
    sales: {
      nameFr: "Ventes mensuelles (k$)",
      nameEn: "Monthly Sales (k$)",
      data: [
        { x: "Jan", y: 120 },
        { x: "Fév", y: 150 },
        { x: "Mar", y: 220 },
        { x: "Avr", y: 180 },
        { x: "Mai", y: 270 },
        { x: "Jui", y: 340 }
      ]
    },
    numeric: {
      nameFr: "Axe X numérique (Échelle linéaire)",
      nameEn: "Numeric X Axis (Linear Scale)",
      data: [
        { x: 0, y: 10 },
        { x: 5, y: 25 },
        { x: 10, y: 15 },
        { x: 15, y: 45 },
        { x: 20, y: 30 },
        { x: 25, y: 60 }
      ]
    },
    numbers: {
      nameFr: "Nombres bruts normalisés",
      nameEn: "Raw Normalized Numbers",
      data: [15, 35, 20, 50, 40, 75, 60]
    }
  };

  let activeDatasetKey = $state<keyof typeof datasets>("server");
  const activeDataset = $derived(datasets[activeDatasetKey]);

  // Dynamic code generation for the playground
  const generatedCode = $derived.by(() => {
    let dataStr = "";
    if (activeDatasetKey === "numbers") {
      dataStr = "[15, 35, 20, 50, 40, 75, 60]";
    } else {
      const items = activeDataset.data as AreaChartDatum[];
      dataStr = `[\n    ` + items.map(d => `{ x: ${typeof d.x === 'string' ? `"${d.x}"` : d.x}, y: ${d.y} }`).join(",\n    ") + `\n  ]`;
    }

    return `<script lang="ts">
  import { AreaChart } from "@sentropic/design-system-svelte";

  const chartData = ${dataStr};
<\/script>

<AreaChart
  data={chartData}
  label="${label}"
  tone="${tone}"
  width={${width}}
  height={${height}}
  smooth={${smooth}}
/>`;
  });

  const tones: AreaChartTone[] = [
    "category1",
    "category2",
    "category3",
    "category4",
    "category5",
    "category6",
    "category7",
    "category8"
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "areaChartKicker")}</p>
    <h1>
      {t(locale.value, "areaChartTitle")}
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{t(locale.value, "areaChartIntro")}</p>
  </section>

  <!-- Interactive Playground -->
  <section class="docs-section">
    <h2>
      {#if locale.value === "fr"}Bac à sable interactif{:else}Interactive Playground{/if}
    </h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Expérimentez en temps réel avec les propriétés du composant AreaChart. Modifiez les dimensions, activez le lissage Bézier et changez de thème de couleur sémantique.
      {:else}
        Experiment in real time with the AreaChart component properties. Modify dimensions, toggle Bezier smoothing, and change semantic color themes.
      {/if}
    </p>

    <div class="playground-layout">
      <!-- Chart Render Box -->
      <div class="playground-render-box">
        <div class="chart-wrapper" style="max-width: {width}px;">
          <AreaChart
            data={activeDataset.data}
            {width}
            {height}
            {tone}
            {smooth}
            {label}
          />
        </div>
      </div>

      <!-- Controls Panel -->
      <div class="playground-controls">
        <h3>{#if locale.value === "fr"}Configuration{:else}Configuration{/if}</h3>
        
        <!-- Dataset Selector -->
        <div class="control-group">
          <span class="control-label">
            {#if locale.value === "fr"}Série de données{:else}Data Series{/if}
          </span>
          <div class="dataset-buttons">
            {#each Object.entries(datasets) as [key, ds]}
              <button
                type="button"
                class="dataset-btn"
                class:active={activeDatasetKey === key}
                onclick={() => activeDatasetKey = key as keyof typeof datasets}
              >
                {locale.value === "fr" ? ds.nameFr : ds.nameEn}
              </button>
            {/each}
          </div>
        </div>

        <div class="control-grid-2col">
          <!-- Width Slider -->
          <div class="control-group">
            <label for="slider-width" class="control-label">
              {#if locale.value === "fr"}Largeur (px) : {width}{:else}Width (px): {width}{/if}
            </label>
            <input
              id="slider-width"
              type="range"
              min="300"
              max="800"
              step="10"
              bind:value={width}
              class="control-slider"
            />
          </div>

          <!-- Height Slider -->
          <div class="control-group">
            <label for="slider-height" class="control-label">
              {#if locale.value === "fr"}Hauteur (px) : {height}{:else}Height (px): {height}{/if}
            </label>
            <input
              id="slider-height"
              type="range"
              min="150"
              max="450"
              step="10"
              bind:value={height}
              class="control-slider"
            />
          </div>
        </div>

        <div class="control-grid-2col">
          <!-- Tone Selector -->
          <div class="control-group">
            <label for="select-tone" class="control-label">
              {#if locale.value === "fr"}Tonalité (Tone){:else}Tone{/if}
            </label>
            <select id="select-tone" bind:value={tone} class="control-select">
              {#each tones as t}
                <option value={t}>{t}</option>
              {/each}
            </select>
          </div>

          <!-- Smooth Toggle -->
          <div class="control-group check-group">
            <label class="control-label checkbox-label">
              <input type="checkbox" bind:checked={smooth} class="control-checkbox" />
              <span>{#if locale.value === "fr"}Lissage Bézier (smooth){:else}Bezier Smoothing (smooth){/if}</span>
            </label>
          </div>
        </div>

        <!-- Label Input -->
        <div class="control-group">
          <label for="input-label" class="control-label">
            {#if locale.value === "fr"}Libellé d'accessibilité (label){:else}Accessibility Label (label){/if}
          </label>
          <input
            id="input-label"
            type="text"
            bind:value={label}
            placeholder="Aria-label du graphique..."
            class="control-text-input"
          />
        </div>
      </div>
    </div>

    <!-- Live Code Block -->
    <div class="playground-code-section">
      <div class="code-header">
        <span>{#if locale.value === "fr"}Code Svelte généré{:else}Generated Svelte Code{/if}</span>
      </div>
      <pre class="code-pre"><code>{generatedCode}</code></pre>
    </div>
  </section>

  <!-- Component API Details -->
  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><code>data</code></td>
          <td><code>(number | AreaChartDatum)[]</code></td>
          <td><code>[]</code></td>
          <td>
            {#if locale.value === "fr"}
              Tableau de données. Peut contenir des objets <code>{`{ x: string | number, y: number }`}</code> ou des nombres purs (normalisés avec index X).
            {:else}
              Data array. Can contain <code>{`{ x: string | number, y: number }`}</code> objects or raw numbers (automatically normalized with X index).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>width</code></td>
          <td><code>number</code></td>
          <td><code>480</code></td>
          <td>
            {#if locale.value === "fr"}
              Largeur brute du graphique en pixels (utilisée pour le viewBox SVG réactif).
            {:else}
              Raw width of the chart in pixels (used for the responsive SVG viewBox).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td><code>number</code></td>
          <td><code>240</code></td>
          <td>
            {#if locale.value === "fr"}
              Hauteur brute du graphique en pixels (utilisée pour le viewBox SVG réactif).
            {:else}
              Raw height of the chart in pixels (used for the responsive SVG viewBox).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>tone</code></td>
          <td><code>AreaChartTone</code></td>
          <td><code>"category1"</code></td>
          <td>
            {#if locale.value === "fr"}
              Gamme de couleur sémantique du graphique (<code>category1</code> à <code>category8</code>).
            {:else}
              Semantic color scheme of the chart (<code>category1</code> to <code>category8</code>).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>smooth</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>
            {#if locale.value === "fr"}
              Active la courbe de lissage Bézier cubique au lieu d'une ligne brisée linéaire.
            {:else}
              Enables cubic Bezier curve interpolation instead of straight linear path segments.
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><em>required</em></td>
          <td>
            {#if locale.value === "fr"}
              Libellé obligatoire décrivant le graphique pour les lecteurs d'écran (<code>aria-label</code>).
            {:else}
              Mandatory label describing the chart for screen readers (maps to <code>aria-label</code>).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td><em>optionnel</em></td>
          <td>
            {#if locale.value === "fr"}
              Classe CSS personnalisée passée au conteneur principal.
            {:else}
              Custom CSS class applied to the root wrapper.
            {/if}
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- White Label & Styling Tokens -->
  <section class="docs-section">
    <h2>{#if locale.value === "fr"}Contrat Marque Blanche et CSS Custom Properties{:else}White Labeling & CSS Custom Properties{/if}</h2>
    <p>
      {#if locale.value === "fr"}
        Le composant respecte les principes de modularité et n'utilise pas de couleurs codées en dur. Il hérite de l'écurie de variables CSS sémantiques et expose des tokens spécifiques pour ajuster précisément le style.
      {:else}
        The component follows modular principles and uses no hardcoded colors. It inherits semantic CSS variables and exposes specific component tokens for fine-grained style overrides.
      {/if}
    </p>
    
    <table class="docs-table">
      <thead>
        <tr><th>{#if locale.value === "fr"}Variable CSS / Token{:else}CSS Variable / Token{/if}</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><code>--st-semantic-data-category1</code> à <code>...8</code></td>
          <td>
            {#if locale.value === "fr"}
              Couleurs sémantiques par défaut de la palette de données (catégorie 1 à 8).
            {:else}
              Default semantic palette colors for data visualization (category 1 to 8).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>--st-component-areaChart-gridStroke</code></td>
          <td>
            {#if locale.value === "fr"}
              Couleur des lignes pointillées de la grille d'arrière-plan (défaut : <code>--st-semantic-border-subtle</code>).
            {:else}
              Color of the dotted gridlines in the background (default: <code>--st-semantic-border-subtle</code>).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>--st-component-areaChart-axisStroke</code></td>
          <td>
            {#if locale.value === "fr"}
              Couleur des axes principaux X et Y (défaut : <code>--st-semantic-border-subtle</code>).
            {:else}
              Color of the main X and Y axis lines (default: <code>--st-semantic-border-subtle</code>).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>--st-component-areaChart-labelColor</code></td>
          <td>
            {#if locale.value === "fr"}
              Couleur de police des étiquettes des axes (défaut : <code>--st-semantic-text-secondary</code>).
            {:else}
              Font color of the axis tick labels (default: <code>--st-semantic-text-secondary</code>).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>--st-component-areaChart-tooltipBackground</code></td>
          <td>
            {#if locale.value === "fr"}
              Couleur d'arrière-plan de l'infobulle flottante au survol (défaut : <code>--st-semantic-surface-inverse</code>).
            {:else}
              Background color of the floating hover tooltip (default: <code>--st-semantic-surface-inverse</code>).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>--st-component-areaChart-tooltipText</code></td>
          <td>
            {#if locale.value === "fr"}
              Couleur du texte de l'infobulle flottante (défaut : <code>--st-semantic-text-inverse</code>).
            {:else}
              Text color of the floating tooltip (default: <code>--st-semantic-text-inverse</code>).
            {/if}
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- Accessibility & Interactions -->
  <section class="docs-section">
    <h2>{#if locale.value === "fr"}Accessibilité & Interactions{:else}Accessibility & Interactions{/if}</h2>
    <p>
      {#if locale.value === "fr"}
        Le composant a été conçu avec soin pour garantir une accessibilité optimale :
      {:else}
        The component was designed with care to ensure optimal accessibility:
      {/if}
    </p>
    <ul>
      <li>
        <strong>{#if locale.value === "fr"}Lecteurs d'écran{:else}Screen Readers{/if} :</strong> 
        {#if locale.value === "fr"}
          Le conteneur possède un rôle <code>img</code> avec le libellé <code>label</code> fourni. Les cercles de données individuels possèdent également leur propre <code>aria-label</code> (ex. "Lun: 42") pour offrir une description alternative précise de chaque point.
        {:else}
          The main SVG container features an <code>img</code> role with the provided <code>label</code>. Individual data dots also have their own <code>aria-label</code> (e.g. "Lun: 42") to provide accurate text alternatives for each data point.
        {/if}
      </li>
      <li>
        <strong>{#if locale.value === "fr"}Navigation au clavier{:else}Keyboard Navigation{/if} :</strong> 
        {#if locale.value === "fr"}
          Chaque point est navigable au clavier grâce à un attribut <code>tabindex="0"</code>. L'infobulle d'information s'affiche automatiquement lorsque le point reçoit le focus (<code>focus-visible</code>), avec un indicateur visuel de focus conforme aux normes de contraste.
        {:else}
          Every data point is focusable via keyboard navigation with <code>tabindex="0"</code>. The detailed tooltip automatically displays when a point receives focus (<code>focus-visible</code>), utilizing a high-contrast focus indicator ring.
        {/if}
      </li>
      <li>
        <strong>{#if locale.value === "fr"}Animations respectueuses{:else}Respectful Animations{/if} :</strong> 
        {#if locale.value === "fr"}
          Les transitions et l'agrandissement des points respectent la préférence utilisateur <code>prefers-reduced-motion</code> pour éviter les effets d'inconfort visuel.
        {:else}
          Transitions and point magnification transitions respect user preferences like <code>prefers-reduced-motion</code> to prevent any visual motion discomfort.
        {/if}
      </li>
    </ul>
  </section>
</div>

<style>
  .section-desc {
    color: var(--st-semantic-text-secondary);
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: 800px;
  }

  .playground-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 1024px) {
    .playground-layout {
      grid-template-columns: 1.2fr 1fr;
    }
  }

  .playground-render-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--st-semantic-surface-sunken, #f8f9fa);
    border-radius: var(--st-radius-sm, 0.25rem);
    padding: 2rem;
    min-height: 320px;
    border: 1px dashed var(--st-semantic-border-subtle);
  }

  .chart-wrapper {
    width: 100%;
    height: auto;
  }

  .playground-controls {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .playground-controls h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    padding-bottom: 0.5rem;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .control-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--st-semantic-text-primary);
  }

  .dataset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .dataset-btn {
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    color: var(--st-semantic-text-secondary);
    padding: 0.375rem 0.75rem;
    border-radius: var(--st-radius-sm, 0.25rem);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .dataset-btn:hover {
    background: var(--st-semantic-surface-sunken);
    color: var(--st-semantic-text-primary);
  }

  .dataset-btn.active {
    background: var(--st-semantic-action-primary, #005fb8);
    color: var(--st-semantic-text-inverse, #ffffff);
    border-color: var(--st-semantic-action-primary, #005fb8);
  }

  .control-grid-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .control-slider {
    width: 100%;
    accent-color: var(--st-semantic-action-primary);
  }

  .control-select {
    width: 100%;
    padding: 0.5rem;
    border-radius: var(--st-radius-sm, 0.25rem);
    border: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
  }

  .check-group {
    justify-content: center;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: normal;
  }

  .control-checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: var(--st-semantic-action-primary);
  }

  .control-text-input {
    padding: 0.5rem;
    border-radius: var(--st-radius-sm, 0.25rem);
    border: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
  }

  .playground-code-section {
    background: #1e1e1e;
    border-radius: var(--st-radius-md, 0.5rem);
    overflow: hidden;
    color: #e3e3e3;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.875rem;
    margin-top: 1.5rem;
  }

  .code-header {
    background: #2d2d2d;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: bold;
    border-bottom: 1px solid #3d3d3d;
    color: #a0a0a0;
  }

  .code-pre {
    margin: 0;
    padding: 1.25rem;
    overflow-x: auto;
    line-height: 1.5;
  }
</style>
