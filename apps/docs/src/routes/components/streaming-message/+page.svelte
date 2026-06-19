<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      kicker: "Composant · Chat",
      status: "Stable",
      intro:
        "Vue assistant enrichie avec les events de stream: deltas, tool.started/completed, permissions et checkpoints.",
      liveTitle: "Streaming actif",
      passiveTitle: "Snapshot de contenu final",
      detailTitle: "Trail détaillé",
      reasoningTitle: "Reasoning + outil",
      reasoningContext: "Le raisonnement s’affiche dans un bloc repliable au-dessus de la réponse, puis le trail expose l’outil et la permission associés.",
      statusTitle: "API",
      token1: "--st-streamingMessage-text-muted",
      token2: "--st-streamingMessage-trail",
      token3: "--st-streamingMessage-trailToggle",
      events: "Events suivis",
      api1: "Cible d’entrée : <code>role</code> vaut <code>assistant</code> par défaut.",
      api2: "<code>streamId</code> + <code>events</code> / <code>initialEvents</code> composent la source.",
      api3: "<code>mode=\"live\"</code> montre les détails d’événements quand ils sont présents.",
      api4: "<code>mode=\"passive\"</code> expose surtout le contenu final."
    },
    en: {
      kicker: "Component · Chat",
      status: "Stable",
      intro:
        "Assistant-focused streaming bubble with events: deltas, tool call lifecycle, permissions and checkpoints.",
      liveTitle: "Active streaming",
      passiveTitle: "Final content snapshot",
      detailTitle: "Detailed trail",
      reasoningTitle: "Reasoning + tool",
      reasoningContext: "Reasoning appears in a collapsible block above the answer, then the trail exposes the related tool and permission.",
      statusTitle: "API",
      token1: "--st-streamingMessage-text-muted",
      token2: "--st-streamingMessage-trail",
      token3: "--st-streamingMessage-trailToggle",
      events: "Tracked events",
      api1: "Input target: <code>role</code> defaults to <code>assistant</code>.",
      api2: "<code>streamId</code> + <code>events</code> / <code>initialEvents</code> compose the source.",
      api3: "<code>mode=\"live\"</code> shows event details when present.",
      api4: "<code>mode=\"passive\"</code> mostly exposes the final content."
    }
  } as const;

  const text = () => copy[locale.value];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>StreamingMessage</h1>
      <Badge tone="success">{text().status}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <TabbedExample nodes={getExample("streamingmessage")?.nodes ?? []} />


  <section class="docs-section">
    <h2>{text().liveTitle}</h2>
    <TabbedExample nodes={getExample("streamingmessage-live")?.nodes ?? []} />
  </section>

  <section class="docs-section">
    <h2>{text().reasoningTitle}</h2>
    <p class="docs-demo-context">{text().reasoningContext}</p>
    <TabbedExample nodes={getExample("streamingmessage-reasoning")?.nodes ?? []} />
  </section>

  <section class="docs-section">
    <h2>{text().passiveTitle}</h2>
    <TabbedExample nodes={getExample("streamingmessage-passive")?.nodes ?? []} />
  </section>

  <section class="docs-section">
    <h2>{text().detailTitle}</h2>
    <TabbedExample nodes={getExample("streamingmessage-detail")?.nodes ?? []} />
  </section>

  <section class="docs-section">
    <h2>{text().events}</h2>
    <ul class="docs-token-list">
      <li><code>message.delta</code></li>
      <li><code>message.completed</code></li>
      <li><code>reasoning.delta</code></li>
      <li><code>reasoning.completed</code></li>
      <li><code>tool.started</code></li>
      <li><code>tool.completed</code></li>
      <li><code>permission.requested</code></li>
      <li><code>checkpoint.requested</code></li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{text().statusTitle}</h2>
    <ul class="docs-token-list">
      <li>{@html text().api1}</li>
      <li>{@html text().api2}</li>
      <li>{@html text().api3}</li>
      <li>{@html text().api4}</li>
    </ul>
  </section>
</div>
