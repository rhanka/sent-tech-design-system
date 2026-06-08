<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Button, Modal } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Modal s'ouvre au clic et rend un overlay position:fixed plein écran : aucune
  // représentation neutre encadrée n'a de sens, on garde donc une démo Svelte
  // interactive (bouton + Modal) pour cette section uniquement.
  let open = $state(false);

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »).
  const tooltipDemo: NodeSpec[] = [
    {
      comp: "Tooltip",
      props: { content: "Contextual information" },
      children: [{ comp: "Button", props: { variant: "secondary" }, children: ["Hover or focus"] }]
    }
  ];

  // OverflowMenu (Svelte) lit la shape kind/value/danger pour ses items.
  const overflowDemo: NodeSpec[] = [
    {
      comp: "OverflowMenu",
      props: {
        triggerLabel: "Row actions",
        open: true,
        placement: "bottom-start",
        items: [
          { kind: "group", label: "Edit" },
          { value: "rename", label: "Rename" },
          { value: "duplicate", label: "Duplicate" },
          { kind: "divider" },
          { kind: "group", label: "Distribute" },
          { value: "share", label: "Share" },
          { value: "archive", label: "Archive" },
          { kind: "divider" },
          { value: "delete", label: "Delete", danger: true }
        ]
      }
    }
  ];

  const feedbackDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Toast", props: { tone: "success", title: "Saved", message: "The tenant theme was compiled." } },
        { comp: "Toast", props: { tone: "error", title: "Failed", message: "The adapter mapping is incomplete." } }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Famille · Overlays et feedback</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "overlaysTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "overlaysIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>Modal</h2>
    <div class="docs-example docs-example--stack">
      <Button onclick={() => (open = true)}>Open modal</Button>
      <Modal open={open} title="Confirm action" description="Modal surfaces use overlay tokens." onclose={() => (open = false)}>
        <p>Modal content remains product-neutral and is supplied by the host application.</p>
      </Modal>
    </div>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Le Modal s’ouvre au clic sur un overlay plein écran (position: fixed) : cette démo reste interactive en Svelte, sans équivalent neutre encadré."
        : "The Modal opens on click as a full-screen overlay (position: fixed): this demo stays interactive in Svelte, with no framed neutral equivalent."}
    </p>
  </section>

  <section class="docs-section">
    <h2>Tooltip</h2>
    <TabbedExample nodes={tooltipDemo} title="Tooltip" />
  </section>

  <section class="docs-section">
    <h2>OverflowMenu</h2>
    <TabbedExample nodes={overflowDemo} title="OverflowMenu" />
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Panneau ouvert (open) et figé pour la démonstration."
        : "Panel opened (open) and frozen for the demo."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "feedback")}</h2>
    <TabbedExample nodes={feedbackDemo} title={t(locale.value, "feedback")} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Component</th><th>Props</th><th>Semantics</th></tr>
      </thead>
      <tbody>
        <tr><td><code>Modal</code></td><td><code>open</code>, <code>title</code>, <code>description</code>, <code>onclose</code></td><td><code>role="dialog"</code>, <code>aria-modal</code></td></tr>
        <tr><td><code>Tooltip</code></td><td><code>content</code>, <code>placement</code></td><td><code>role="tooltip"</code></td></tr>
        <tr><td><code>Toast</code></td><td><code>tone</code>, <code>title</code>, <code>message</code></td><td><code>role="status"</code> or <code>role="alert"</code></td></tr>
        <tr><td><code>OverflowMenu</code></td><td><code>items</code>, <code>open</code>, <code>placement</code>, <code>onselect</code></td><td><code>aria-haspopup="menu"</code>, <code>role="menu"</code></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-overlay-backdrop</code></li>
      <li><code>--st-component-overlay-surface</code></li>
      <li><code>--st-component-tooltip-background</code></li>
      <li><code>--st-component-tooltip-text</code></li>
      <li><code>--st-component-toast-background</code></li>
      <li><code>--st-component-toast-errorBorder</code></li>
    </ul>
  </section>
</div>
