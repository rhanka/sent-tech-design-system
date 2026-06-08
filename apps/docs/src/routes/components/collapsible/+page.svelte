<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const openDemo: NodeSpec[] = [
    {
      comp: "Collapsible",
      props: { title: fr ? "Conditions générales" : "Terms & conditions", open: true },
      children: [
        {
          el: "p",
          props: { class: "fp-card-text" },
          children: [fr ? "Ouvert par défaut. Cliquez l'en-tête pour replier." : "Open by default. Click the header to collapse."]
        }
      ]
    }
  ];
  const disabledDemo: NodeSpec[] = [
    {
      comp: "Collapsible",
      props: { title: fr ? "Section verrouillée" : "Locked section", disabled: true },
      children: [
        {
          el: "p",
          props: { class: "fp-card-text" },
          children: [fr ? "Contenu indisponible." : "Unavailable content."]
        }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Structure" : "Component · Layout"}</p>
    <div class="docs-hero-title">
      <h1>Collapsible</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "En-tête cliquable qui révèle ou masque une région de contenu. État ouvert bindable, gestion clavier et aria-expanded/region intégrés."
        : "A clickable header that reveals or hides a content region. Bindable open state, with built-in keyboard handling and aria-expanded/region."}
    </p>
  </section>

  <TriRender nodes={getExample("collapsible")?.nodes ?? []} label={fr ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TriRender nodes={openDemo} label={fr ? "Ouvert par défaut" : "Open by default"} />
    <TriRender nodes={disabledDemo} label={fr ? "disabled" : "disabled"} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>{fr ? "requis" : "required"}</em></td></tr>
        <tr><td><code>open</code></td><td><code>boolean</code> ({fr ? "bindable" : "bindable"})</td><td><code>false</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>onToggle</code></td><td><code>(open: boolean) =&gt; void</code></td><td><em>—</em></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Svelte/Vue utilisent bind:open / v-model:open ; React utilise defaultOpen. Le déclencheur porte aria-expanded et aria-controls." : "Svelte/Vue use bind:open / v-model:open; React uses defaultOpen. The trigger carries aria-expanded and aria-controls."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
  </section>
</div>
