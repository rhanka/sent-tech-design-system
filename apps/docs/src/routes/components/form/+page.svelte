<script lang="ts">
  import { Badge, Button, Form, Input } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Wrapper `<form>` qui prend en charge la soumission asynchrone, suit un statut interne idle/submitting/submitted/error et affiche un message d’aide, de succès ou d’erreur sous les champs.",
      contactTitle: "Formulaire de contact (succès)",
      failingTitle: "Soumission qui échoue (erreur interne)",
      explicitTitle: "Message d’erreur explicite",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`onsubmit` peut être asynchrone : le composant appelle `event.preventDefault()`, passe en `submitting`, puis en `submitted` (ou `error` si la promesse rejette).",
      usageNote2:
        "`errorText` fourni en prop prime sur l’erreur capturée en interne ; `successText` s’affiche après une soumission réussie et `helperText` seulement à l’état idle.",
      usageNote3:
        "Un `<noscript>` d’avertissement est rendu par défaut ; passez `noNoscript` pour le supprimer.",
      submit: "Envoyer",
      sending: "Envoi…",
      nameLabel: "Nom",
      emailLabel: "Courriel",
      helper: "Tous les champs sont requis.",
      success: "Message envoyé, merci.",
      errorExplicit: "Le service est momentanément indisponible.",
      triggerFail: "Tenter une soumission en échec"
    },
    en: {
      intro:
        "`<form>` wrapper that handles async submission, tracks an internal idle/submitting/submitted/error status and renders a helper, success or error message below the fields.",
      contactTitle: "Contact form (success)",
      failingTitle: "Failing submission (internal error)",
      explicitTitle: "Explicit error message",
      usageTitle: "Usage notes",
      usageNote1:
        "`onsubmit` can be async: the component calls `event.preventDefault()`, switches to `submitting`, then `submitted` (or `error` if the promise rejects).",
      usageNote2:
        "An `errorText` prop takes precedence over the internally caught error; `successText` shows after a successful submit and `helperText` only in the idle state.",
      usageNote3:
        "A `<noscript>` warning is rendered by default; pass `noNoscript` to remove it.",
      submit: "Send",
      sending: "Sending…",
      nameLabel: "Name",
      emailLabel: "Email",
      helper: "All fields are required.",
      success: "Message sent, thank you.",
      errorExplicit: "The service is temporarily unavailable.",
      triggerFail: "Try a failing submission"
    }
  } as const;

  const text = () => copy[locale.value];

  let contactSubmitting = $state(false);
  let failSubmitting = $state(false);

  async function handleContact(_event: SubmitEvent) {
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  async function handleFailing(_event: SubmitEvent) {
    await new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Network error")), 600)
    );
  }
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <h1>
      Form
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example docs-demo-block" aria-label={text().contactTitle}>
      <h3>{text().contactTitle}</h3>
      <Form
        onsubmit={handleContact}
        bind:submitting={contactSubmitting}
        helperText={text().helper}
        successText={text().success}
      >
        <Input label={text().nameLabel} name="name" />
        <Input label={text().emailLabel} name="email" type="email" />
        <Button type="submit" disabled={contactSubmitting}>
          {contactSubmitting ? text().sending : text().submit}
        </Button>
      </Form>
    </div>

    <div class="docs-example docs-demo-block" aria-label={text().failingTitle}>
      <h3>{text().failingTitle}</h3>
      <Form onsubmit={handleFailing} bind:submitting={failSubmitting}>
        <Input label={text().emailLabel} name="email" type="email" />
        <Button type="submit" variant="danger" disabled={failSubmitting}>
          {failSubmitting ? text().sending : text().triggerFail}
        </Button>
      </Form>
    </div>

    <div class="docs-example docs-demo-block" aria-label={text().explicitTitle}>
      <h3>{text().explicitTitle}</h3>
      <Form errorText={text().errorExplicit}>
        <Input label={text().emailLabel} name="email" type="email" />
        <Button type="submit">{text().submit}</Button>
      </Form>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>onsubmit</code></td><td><code>(event: SubmitEvent) =&gt; void | Promise&lt;void&gt;</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>successText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>submitting</code></td><td><code>boolean</code> (<code>$bindable</code>)</td><td><code>false</code></td></tr>
        <tr><td><code>noNoscript</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>requis</em></td></tr>
        <tr><td><code>...rest</code></td><td><code>HTMLFormAttributes</code> (sauf <code>class</code> / <code>onsubmit</code>)</td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
    <p class="docs-demo-note">{text().usageNote3}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-form-gap</code></li>
      <li><code>--st-component-form-fieldGap</code></li>
      <li><code>--st-component-form-helpText</code></li>
      <li><code>--st-component-form-errorText</code></li>
      <li><code>--st-component-form-successText</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-semantic-feedback-success</code></li>
    </ul>
  </section>
</div>
