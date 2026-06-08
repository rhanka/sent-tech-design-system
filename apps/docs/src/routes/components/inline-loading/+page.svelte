<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos en arbre NodeSpec neutre -> rendues dans le framework actif.
  const statesDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "InlineLoading", props: { status: "active", label: "Chargement en cours…" } },
        { comp: "InlineLoading", props: { status: "success", label: "Modification enregistrée." } },
        { comp: "InlineLoading", props: { status: "error", label: "Impossible d’enregistrer." } },
        { comp: "InlineLoading", props: { status: "inactive", label: "En attente d’action." } }
      ]
    }
  ]);

  const noLabelDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "InlineLoading", props: { status: "active" } },
        { comp: "InlineLoading", props: { status: "success" } },
        { comp: "InlineLoading", props: { status: "error" } },
        { comp: "InlineLoading", props: { status: "inactive" } }
      ]
    }
  ]);

  // Démo « transition de statut » : version statique représentative (status active
  // figé). Le cycle interactif n'a pas d'équivalent neutre cross-framework.
  const transitionDemo: NodeSpec[] = $derived([
    {
      comp: "InlineLoading",
      props: { status: "active", label: locale.value === "fr" ? "Chargement en cours…" : "Loading…" }
    }
  ]);
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
  <FrameworkPreview example="inlineloading" title="Aperçu live" />


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <FrameworkDemo nodes={statesDemo} label={t(locale.value, "states")} />

    <FrameworkDemo nodes={noLabelDemo} label="Sans libellé" />

    <FrameworkDemo nodes={transitionDemo} label="Transition de statut" />
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "En usage réel, le `status` change selon l’état de la requête (active → success / error)."
        : "In real usage, `status` changes with the request state (active → success / error)."}
    </p>
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
