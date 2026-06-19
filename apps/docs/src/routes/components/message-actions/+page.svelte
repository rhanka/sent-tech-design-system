<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      kicker: "Composant · Chat",
      status: "Stable",
      intro: "Rendu d’un panel d’actions liées au message avec overflow optionnel.",
      hoverTitle: "Actions en hover",
      alwaysTitle: "Actions always-visible",
      overflowTitle: "Overflow",
      actionsTitle: "API"
    },
    en: {
      kicker: "Component · Chat",
      status: "Stable",
      intro: "Message action row with icon buttons and optional overflow.",
      hoverTitle: "Hover-only actions",
      alwaysTitle: "Always-visible actions",
      overflowTitle: "Overflow",
      actionsTitle: "API"
    }
  } as const;

  const text = () => copy[locale.value];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>MessageActions</h1>
      <Badge tone="success">{text().status}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <TabbedExample nodes={getExample("messageactions")?.nodes ?? []} />


  <section class="docs-section">
    <h2>{text().hoverTitle}</h2>
    <TabbedExample nodes={getExample("messageactions-hover")?.nodes ?? []} code={getExample("messageactions-hover")?.code} />
  </section>

  <section class="docs-section">
    <h2>{text().alwaysTitle}</h2>
    <TabbedExample nodes={getExample("messageactions-always")?.nodes ?? []} code={getExample("messageactions-always")?.code} />
  </section>

  <section class="docs-section">
    <h2>{text().overflowTitle}</h2>
    <TabbedExample nodes={getExample("messageactions-overflow")?.nodes ?? []} code={getExample("messageactions-overflow")?.code} />
  </section>

  <section class="docs-section">
    <h2>{text().actionsTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>actions</code></td><td>Liste d’objets <code>MessageAction</code>.</td></tr>
        <tr><td><code>visibility</code></td><td><code>hover</code> (défaut) ou <code>always</code>.</td></tr>
        <tr><td><code>overflow</code></td><td>Snippet affiché en queue de ligne si fourni.</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>Types clés</h2>
    <pre class="docs-pre">{`export type MessageAction = {
  id: string;
  label: string;
  icon: Snippet;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
};`}</pre>
  </section>
</div>

<style>
  .docs-pre {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border-radius: 0.5rem;
    margin: 0;
    overflow-x: auto;
    padding: 0.75rem;
  }
</style>
