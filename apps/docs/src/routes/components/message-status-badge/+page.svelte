<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import type { NodeSpec } from "$lib/framework/examples";
  import { type ChatMessageStatus } from "@sentropic/design-system-svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import { t } from "$lib/i18n";

  const copy = {
    fr: {
      kicker: "Composant · Chat",
      status: "Stable",
      intro:
        "Expose visuellement un statut standardisé d’un message, incluant une tonalité dérivée.",
      title: "Badges de statut",
      neutralTitle: "Overrides",
      toneTitle: "API",
      tokens: ["--st-semantic-feedback-info", "--st-semantic-feedback-success", "--st-semantic-feedback-warning", "--st-semantic-feedback-error", "--st-radius-pill"],
      mapHeader: "Mapping recommandé"
    },
    en: {
      kicker: "Component · Chat",
      status: "Stable",
      intro:
        "Display message status with DS tone mapping and optional tone override.",
      title: "Status badges",
      neutralTitle: "Overrides",
      toneTitle: "API",
      tokens: ["--st-semantic-feedback-info", "--st-semantic-feedback-success", "--st-semantic-feedback-warning", "--st-semantic-feedback-error", "--st-radius-pill"],
      mapHeader: "Recommended mapping"
    }
  } as const;

  const text = () => copy[locale.value];

  const statuses = [
    "pending",
    "processing",
    "completed",
    "failed"
  ] as const satisfies ReadonlyArray<ChatMessageStatus>;

  // Démos NodeSpec neutres -> rendues dans le framework actif (onglets svelte/react/vue).
  const statusDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "fp-row" },
      children: statuses.map((status) => ({ comp: "MessageStatusBadge", props: { status } }))
    }
  ];

  const overridesDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "fp-row" },
      children: [
        { comp: "MessageStatusBadge", props: { status: "pending", tone: "neutral" } },
        { comp: "MessageStatusBadge", props: { status: "completed", tone: "info" } },
        { comp: "MessageStatusBadge", props: { status: "failed", tone: "error" } },
        { comp: "MessageStatusBadge", props: { status: "processing", tone: "success" } }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>MessageStatusBadge</h1>
      <Badge tone="success">{text().status}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <TabbedExample nodes={getExample("messagestatusbadge")?.nodes ?? []} />


  <section class="docs-section">
    <h2>{text().title}</h2>
    <TabbedExample nodes={statusDemo} />
  </section>

  <section class="docs-section">
    <h2>{text().neutralTitle}</h2>
    <TabbedExample nodes={overridesDemo} />
  </section>

  <section class="docs-section">
    <h2>{text().mapHeader}</h2>
    <ul class="docs-token-list">
      <li><strong>pending</strong> → label <code>En attente</code> / tone <code>warning</code></li>
      <li><strong>processing</strong> → label <code>En cours</code> / tone <code>info</code></li>
      <li><strong>completed</strong> → label <code>Terminé</code> / tone <code>success</code></li>
      <li><strong>failed</strong> → label <code>Échec</code> / tone <code>error</code></li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{text().toneTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>status</code></td><td>Requis. <code>pending | processing | completed | failed</code>.</td></tr>
        <tr><td><code>tone</code></td><td>Override visuel: neutral / success / warning / error / info.</td></tr>
        <tr><td><code>labels</code></td><td>Surcharge i18n des libellés par statut (défaut : FR).</td></tr>
        <tr><td><code>class</code></td><td>Classes additionnelles.</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <p>
      Le rendu est délégué à <code>Tag</code> : la tonalité consomme les tokens
      sémantiques de feedback ci-dessous (la pastille hérite de <code>currentColor</code>).
    </p>
    <ul class="docs-token-list">
      {#each text().tokens as token}
        <li><code>{token}</code></li>
      {/each}
    </ul>
  </section>
</div>
