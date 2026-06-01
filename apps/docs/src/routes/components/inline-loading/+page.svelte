<script lang="ts">
  import { Badge, Button, InlineLoading } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  type Status = "active" | "success" | "error" | "inactive";

  let cycleStatus = $state<Status>("active");
  const cycleOrder: Status[] = ["active", "success", "error", "inactive"];

  function nextStatus() {
    const idx = cycleOrder.indexOf(cycleStatus);
    cycleStatus = cycleOrder[(idx + 1) % cycleOrder.length];
  }

  const cycleLabels: Record<Status, { fr: string; en: string }> = {
    active: { fr: "Chargement en cours…", en: "Loading…" },
    success: { fr: "Enregistré.", en: "Saved." },
    error: { fr: "Échec de l’enregistrement.", en: "Save failed." },
    inactive: { fr: "En attente.", en: "Idle." }
  };
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Feedback</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "inlineLoadingTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "inlineLoadingIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label={t(locale.value, "states")}>
      <InlineLoading status="active" label="Chargement en cours…" />
      <InlineLoading status="success" label="Modification enregistrée." />
      <InlineLoading status="error" label="Impossible d’enregistrer." />
      <InlineLoading status="inactive" label="En attente d’action." />
    </div>

    <div class="docs-example" aria-label="Sans libellé">
      <InlineLoading status="active" />
      <InlineLoading status="success" />
      <InlineLoading status="error" />
      <InlineLoading status="inactive" />
    </div>

    <div class="docs-example" aria-label="Transition de statut">
      <InlineLoading status={cycleStatus} label={cycleLabels[cycleStatus][locale.value]} />
      <Button variant="secondary" onclick={nextStatus}>
        {locale.value === "fr" ? "Statut suivant" : "Next status"} ({cycleStatus})
      </Button>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>status</code></td><td><code>"active" | "success" | "error" | "inactive"</code></td><td><code>"active"</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend un <code>&lt;div role="status"&gt;</code> (ou
      <code>role="alert"</code> en statut <code>error</code>) avec
      <code>aria-live="polite"</code>. L’icône Lucide affichée dépend du statut :
      <code>LoaderCircle</code> (active, animé via une keyframe CSS qui respecte
      <code>prefers-reduced-motion</code>), <code>CircleCheck</code> (success),
      <code>CircleAlert</code> (error). Le statut <code>inactive</code> n’affiche
      pas d’icône et grise le libellé. Toutes les autres props HTML
      <code>&lt;div&gt;</code> sont transmises via spread.
    </p>
  </section>
</div>
