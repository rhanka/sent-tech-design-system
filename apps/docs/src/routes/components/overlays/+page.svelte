<script lang="ts">
  import {
    Badge,
    Button,
    Modal,
    OverflowMenu,
    Toast,
    Tooltip
  } from "@sentropic/design-system-svelte";
  import { t, type Locale } from "$lib/i18n";

  let locale = $state<Locale>("fr");
  let open = $state(false);

  const copy = {
    fr: {
      modalSection: "Modal",
      tooltipSection: "Tooltip",
      overflowSection: "OverflowMenu",
      toastSection: "Toast",
      openModal: "Ouvrir la modale",
      modalTitle: "Confirmer l'action",
      modalDescription: "Les surfaces de modale utilisent les tokens d'overlay.",
      modalBody: "Le contenu de modale reste neutre au produit et est fourni par l'application hote.",
      tooltipTrigger: "Survoler ou focus",
      tooltipContent: "Information contextuelle",
      rowActions: "Actions de ligne",
      rename: "Renommer",
      duplicate: "Dupliquer",
      delete: "Supprimer",
      savedTitle: "Enregistre",
      savedMessage: "Le theme tenant a ete compile.",
      failedTitle: "Echec",
      failedMessage: "Le mapping d'adaptateur est incomplet."
    },
    en: {
      modalSection: "Modal",
      tooltipSection: "Tooltip",
      overflowSection: "OverflowMenu",
      toastSection: "Toast",
      openModal: "Open modal",
      modalTitle: "Confirm action",
      modalDescription: "Modal surfaces use overlay tokens.",
      modalBody: "Modal content remains product-neutral and is supplied by the host application.",
      tooltipTrigger: "Hover or focus",
      tooltipContent: "Contextual information",
      rowActions: "Row actions",
      rename: "Rename",
      duplicate: "Duplicate",
      delete: "Delete",
      savedTitle: "Saved",
      savedMessage: "The tenant theme was compiled.",
      failedTitle: "Failed",
      failedMessage: "The adapter mapping is incomplete."
    }
  } as const;

  const text = () => copy[locale];
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <p class="docs-hero-kicker">Famille · Overlays et feedback</p>
    <h1>
      {t(locale, "overlaysTitle")}
      <Badge tone="success">{t(locale, "statusStable")}</Badge>
    </h1>
    <p>{t(locale, "overlaysIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{text().modalSection}</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>{text().modalSection}</h3>
        <div class="docs-demo-inline">
          <Button onclick={() => (open = true)}>{text().openModal}</Button>
        </div>
        <Modal open={open} title={text().modalTitle} description={text().modalDescription} onclose={() => (open = false)}>
          <p>{text().modalBody}</p>
        </Modal>
      </article>
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().tooltipSection}</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>{text().tooltipSection}</h3>
        <div class="docs-demo-inline">
          <Tooltip content={text().tooltipContent}>
            <Button variant="secondary">{text().tooltipTrigger}</Button>
          </Tooltip>
        </div>
      </article>
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().overflowSection}</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>{text().overflowSection}</h3>
        <div class="docs-demo-inline">
          <OverflowMenu
            triggerLabel={text().rowActions}
            placement="bottom-start"
            items={[
              { value: "rename", label: text().rename },
              { value: "duplicate", label: text().duplicate },
              { value: "delete", label: text().delete, danger: true }
            ]}
          />
        </div>
      </article>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "feedback")}</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>{text().toastSection}</h3>
        <div class="docs-demo-stack">
          <Toast tone="success" title={text().savedTitle} message={text().savedMessage} />
          <Toast tone="error" title={text().failedTitle} message={text().failedMessage} />
        </div>
      </article>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "apiTitle")}</h2>
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
    <h2>{t(locale, "tokensTitle")}</h2>
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
