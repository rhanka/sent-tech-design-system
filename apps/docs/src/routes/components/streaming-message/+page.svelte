<script lang="ts">
  import { Badge, StreamingMessage, type StreamingMessageEvent } from "@sentropic/design-system-svelte";
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
      statusTitle: "API",
      token1: "--st-streamingMessage-text-muted",
      token2: "--st-streamingMessage-trail",
      token3: "--st-streamingMessage-trailToggle",
      emptyText: "En attente d’événement de stream…",
      finalText: "Résumé final prêt.",
      events: "Events suivis",
      showTrail: "Trail visible (mode live)"
    },
    en: {
      kicker: "Component · Chat",
      status: "Stable",
      intro:
        "Assistant-focused streaming bubble with events: deltas, tool call lifecycle, permissions and checkpoints.",
      liveTitle: "Active streaming",
      passiveTitle: "Final content snapshot",
      detailTitle: "Detailed trail",
      statusTitle: "API",
      token1: "--st-streamingMessage-text-muted",
      token2: "--st-streamingMessage-trail",
      token3: "--st-streamingMessage-trailToggle",
      emptyText: "Waiting for stream events…",
      finalText: "Final summary ready.",
      events: "Tracked events",
      showTrail: "Trail visible in live mode"
    }
  } as const;

  const text = () => copy[locale.value];

  const liveEvents: StreamingMessageEvent[] = [
    { type: "tool.started", toolCallId: "tool_search_01", toolName: "search-files", messageId: "m-1" },
    { type: "message.delta", messageId: "m-1", delta: "Je vérifie la demande..." },
    { type: "permission.requested", toolCallId: "tool_search_01", choices: ["allow once", "allow always", "deny"], messageId: "m-1" },
    { type: "tool.completed", toolCallId: "tool_search_01", status: "success", toolName: "search-files", messageId: "m-1" },
    { type: "message.delta", messageId: "m-1", delta: "Le résumé est disponible." }
  ];

  const completedTrailEvents: StreamingMessageEvent[] = [
    { type: "message.delta", messageId: "m-2", delta: "Premier passage validé. " },
    { type: "message.completed", messageId: "m-2" },
  ];

  const checkpointEvents: StreamingMessageEvent[] = [
    { type: "checkpoint.requested", checkpointId: "cp-1", label: "point de contrôle", messageId: "m-3" },
    { type: "message.delta", messageId: "m-3", delta: "Action de validation prise en compte." },
  ];

  // Reasoning : le raisonnement précède la réponse, dans un bloc repliable.
  const reasoningEvents: StreamingMessageEvent[] = [
    { type: "reasoning.delta", messageId: "m-4", delta: "L'utilisateur demande la météo. " },
    { type: "reasoning.delta", messageId: "m-4", delta: "Je vérifie la ville, puis j'appelle l'outil." },
    { type: "reasoning.completed", messageId: "m-4" },
    { type: "tool.started", toolCallId: "tool_weather_01", toolName: "get-weather", messageId: "m-4" },
    { type: "tool.completed", toolCallId: "tool_weather_01", status: "success", toolName: "get-weather", messageId: "m-4" },
    { type: "message.delta", messageId: "m-4", delta: "Il fera 18°C et ensoleillé." }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <h1>
      StreamingMessage
      <Badge tone="success">{text().status}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().liveTitle}</h2>
    <div class="docs-example docs-example--stack">
      <StreamingMessage
        role="assistant"
        streamId="msg-live-demo"
        status="processing"
        finalContent={undefined}
        mode="live"
        placeholder={text().emptyText}
        initialEvents={liveEvents}
        showTrail
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>Reasoning</h2>
    <p class="docs-demo-context">
      Le raisonnement (events <code>reasoning.delta</code> / <code>reasoning.completed</code>)
      s'affiche dans un bloc <strong>repliable</strong> au-dessus de la réponse — ouvert
      pendant la réflexion, replié une fois terminé.
    </p>
    <div class="docs-example docs-example--stack">
      <StreamingMessage
        role="assistant"
        status="completed"
        streamId="msg-reasoning-demo"
        mode="live"
        initialEvents={reasoningEvents}
        showTrail
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().passiveTitle}</h2>
    <div class="docs-example docs-example--stack">
      <StreamingMessage
        role="assistant"
        status="completed"
        streamId="msg-passive-demo"
        mode="passive"
        finalContent={text().finalText}
        events={completedTrailEvents}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().detailTitle}</h2>
    <div class="docs-example docs-example--stack">
      <StreamingMessage
        role="assistant"
        status="processing"
        streamId="msg-checkpoint-demo"
        finalContent="Checkpoint demandé pour valider la prochaine étape."
        events={checkpointEvents}
        showTrail
      />
    </div>
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
      <li>Input target: <code>role</code> defaults to <code>assistant</code>.</li>
      <li><code>streamId</code> + <code>events</code> / <code>initialEvents</code> compose la source.</li>
      <li><code>mode=&quot;live&quot;</code> montre les détails d’événements quand présents.</li>
      <li><code>mode=&quot;passive&quot;</code> expose surtout le contenu final.</li>
    </ul>
  </section>
</div>
