<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge, type AreaChartDatum } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Jeux de données présentés en exemples statiques (le bac à sable interactif
  // a été figé pour permettre la bascule multi-framework).
  const serverData: AreaChartDatum[] = [
    { x: "Lun", y: 42 },
    { x: "Mar", y: 65 },
    { x: "Mer", y: 30 },
    { x: "Jeu", y: 85 },
    { x: "Ven", y: 55 },
    { x: "Sam", y: 20 },
    { x: "Dim", y: 15 }
  ];

  const salesData: AreaChartDatum[] = [
    { x: "Jan", y: 120 },
    { x: "Fév", y: 150 },
    { x: "Mar", y: 220 },
    { x: "Avr", y: 180 },
    { x: "Mai", y: 270 },
    { x: "Jui", y: 340 }
  ];

  const numericData: AreaChartDatum[] = [
    { x: 0, y: 10 },
    { x: 5, y: 25 },
    { x: 10, y: 15 },
    { x: 15, y: 45 },
    { x: 20, y: 30 },
    { x: 25, y: 60 }
  ];

  // Démos basculées dans le framework actif (arbre NodeSpec neutre).
  const serverDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "AreaChart",
          props: {
            data: serverData,
            tone: "category1",
            width: 520,
            height: 260,
            label: locale.value === "fr" ? "Activité serveur (hebdomadaire)" : "Server activity (weekly)"
          }
        }
      ]
    }
  ]);

  const smoothDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "AreaChart",
          props: {
            data: salesData,
            tone: "category3",
            smooth: true,
            width: 520,
            height: 260,
            label: locale.value === "fr" ? "Ventes mensuelles (k$)" : "Monthly sales (k$)"
          }
        }
      ]
    }
  ]);

  const numericDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "AreaChart",
          props: {
            data: numericData,
            tone: "category5",
            width: 520,
            height: 260,
            label: locale.value === "fr" ? "Axe X numérique (échelle linéaire)" : "Numeric X axis (linear scale)"
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "areaChartKicker")}</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "areaChartTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "areaChartIntro")}</p>
  </section>
  <TriRender nodes={getExample("areachart")?.nodes ?? []} label="Aperçu live" />


  <!-- Exemples (bascule multi-framework) -->
  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Quelques configurations typiques de l'AreaChart : séries ordinales, lissage Bézier et axe X numérique. Ces exemples basculent dans le framework actif (Svelte / React / Vue).
      {:else}
        A few typical AreaChart configurations: ordinal series, Bezier smoothing, and a numeric X axis. These examples render in the active framework (Svelte / React / Vue).
      {/if}
    </p>

    <h3 class="docs-demo-title">
      {locale.value === "fr" ? "Série ordinale" : "Ordinal series"}
    </h3>
    <p class="docs-demo-note">
      {locale.value === "fr" ? "Activité serveur hebdomadaire, axe X par libellés." : "Weekly server activity, label-based X axis."}
    </p>
    <TriRender nodes={serverDemo} label={locale.value === "fr" ? "Activité serveur (hebdomadaire)" : "Server activity (weekly)"} />

    <h3 class="docs-demo-title">
      {locale.value === "fr" ? "Lissage Bézier" : "Bezier smoothing"}
    </h3>
    <p class="docs-demo-note">
      {locale.value === "fr" ? "`smooth` active la courbe Bézier cubique." : "`smooth` enables the cubic Bezier curve."}
    </p>
    <TriRender nodes={smoothDemo} label={locale.value === "fr" ? "Ventes mensuelles (k$)" : "Monthly sales (k$)"} />

    <h3 class="docs-demo-title">
      {locale.value === "fr" ? "Axe X numérique" : "Numeric X axis"}
    </h3>
    <p class="docs-demo-note">
      {locale.value === "fr" ? "Quand tous les `x` sont numériques, l'axe utilise une échelle linéaire." : "When every `x` is numeric, the axis uses a linear scale."}
    </p>
    <TriRender nodes={numericDemo} label={locale.value === "fr" ? "Axe X numérique (échelle linéaire)" : "Numeric X axis (linear scale)"} />
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
          Le rendu visuel possède un rôle <code>img</code> avec le libellé <code>label</code> fourni. Les valeurs détaillées sont exposées dans une liste accessible hors SVG (ex. "Lun: 42") pour offrir une description alternative précise de chaque point.
        {:else}
          The visual rendering has an <code>img</code> role with the provided <code>label</code>. Detailed values are exposed in an accessible list outside the SVG (e.g. "Lun: 42") to provide accurate text alternatives for each data point.
        {/if}
      </li>
      <li>
        <strong>{#if locale.value === "fr"}Navigation au clavier{:else}Keyboard Navigation{/if} :</strong> 
        {#if locale.value === "fr"}
          Le graphique évite les arrêts de tabulation par point. Les lecteurs d'écran parcourent la liste de valeurs, tandis que l'infobulle reste réservée au survol visuel.
        {:else}
          The chart avoids one tab stop per point. Screen readers can browse the value list, while the tooltip stays reserved for visual hover.
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

  .docs-demo-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 1.5rem 0 0.25rem 0;
    color: var(--st-semantic-text-primary);
  }

  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.chart-wrapper) {
    width: 100%;
    max-width: 560px;
    margin-top: 0.75rem;
  }
</style>
