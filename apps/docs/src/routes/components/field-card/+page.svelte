<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "card-demo-row" },
      children: [
        {
          comp: "FieldCard",
          props: { label: locale.value === "fr" ? "Coordonnées" : "Contact" },
          children: [
            {
              el: "p",
              props: { class: "field-demo-text" },
              children: [locale.value === "fr" ? "12 rue des Lilas, Montréal" : "12 Lilac St, Montreal"]
            }
          ]
        },
        {
          comp: "FieldCard",
          props: {
            label: locale.value === "fr" ? "Notes" : "Notes",
            variant: "plain",
            commentCount: 3,
            onOpenComments: () => {}
          },
          children: [
            {
              el: "p",
              props: { class: "field-demo-text" },
              children: [locale.value === "fr" ? "À relire avant validation." : "Review before approval."]
            }
          ]
        },
        {
          comp: "FieldCard",
          props: {
            label: locale.value === "fr" ? "Priorité" : "Priority",
            variant: "accent",
            tone: "category3"
          },
          children: [
            {
              el: "p",
              props: { class: "field-demo-text" },
              children: [locale.value === "fr" ? "Élevée — échéance proche." : "High — deadline soon."]
            }
          ]
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Disposition" : "Component · Layout"}
    </p>
    <div class="docs-hero-title">
      <h1>FieldCard</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Carte de groupe de champs : un en-tête titré avec pastille de commentaires optionnelle, et un
        corps libre. Trois variantes : <code>bordered</code> (filet sous l'en-tête), <code>plain</code>
        (cadre simple) et <code>accent</code> (liseré catégoriel à gauche, conteneur à angles nets).
      {:else}
        Field group card: a titled header with an optional comment pill, and a free-form body. Three
        variants: <code>bordered</code> (header underline), <code>plain</code> (simple frame) and
        <code>accent</code> (categorical left border on a square-cornered container).
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Les trois variantes, dont une avec pastille de commentaires interactive et une à liseré
        catégoriel.
      {:else}
        The three variants, including one with an interactive comment pill and one with a categorical
        accent border.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Groupes de champs" : "Field groups"}
    />
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{locale.value === "fr" ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Titre du groupe de champs." : "Field group title."}</td>
        </tr>
        <tr>
          <td><code>variant</code></td>
          <td><code>"plain" | "bordered" | "accent"</code></td>
          <td><code>"bordered"</code></td>
          <td>{locale.value === "fr" ? "Variante visuelle." : "Visual variant."}</td>
        </tr>
        <tr>
          <td><code>tone</code></td>
          <td><code>FieldCardTone</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Couleur catégorielle du liseré (variante accent, category1…8)." : "Categorical accent color (accent variant, category1…8)."}</td>
        </tr>
        <tr>
          <td><code>commentCount</code></td>
          <td><code>number</code></td>
          <td><code>0</code></td>
          <td>{locale.value === "fr" ? "Nombre de commentaires affiché dans la pastille." : "Comment count shown in the pill."}</td>
        </tr>
        <tr>
          <td><code>onOpenComments</code></td>
          <td><code>() =&gt; void</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Rend la pastille interactive et ouvre le fil." : "Makes the pill interactive and opens the thread."}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Tokens CSS" : "CSS Tokens"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>{locale.value === "fr" ? "Variable CSS" : "CSS Variable"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>--st-component-card-background</code></td>
          <td>{locale.value === "fr" ? "Fond de la carte (défaut : surface-raised)." : "Card background (default: surface-raised)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-card-border</code></td>
          <td>{locale.value === "fr" ? "Couleur de la bordure (défaut : border-subtle)." : "Border color (default: border-subtle)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Palette catégorielle du liseré accent." : "Categorical palette for the accent border."}</td>
        </tr>
      </tbody>
    </table>
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

  :global(.card-demo-row) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-4, 1rem);
    width: 100%;
  }

  :global(.card-demo-row > *) {
    flex: 1 1 220px;
    max-width: 320px;
    min-width: 200px;
  }

  :global(.field-demo-text) {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin: 0;
  }
</style>
