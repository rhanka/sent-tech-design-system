<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const singleDemo: NodeSpec[] = [
    {
      comp: "Calendar",
      props: { value: "2026-06-12", month: "2026-06" }
    }
  ];
  const rangeDemo: NodeSpec[] = [
    {
      comp: "Calendar",
      props: { range: true, value: ["2026-06-10", "2026-06-18"], month: "2026-06" }
    }
  ];
  const boundedDemo: NodeSpec[] = [
    {
      comp: "Calendar",
      props: { value: "2026-06-15", month: "2026-06", min: "2026-06-08", max: "2026-06-22" }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Formulaire" : "Component · Form"}</p>
    <div class="docs-hero-title">
      <h1>Calendar</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Calendrier mensuel : sélection d'une date unique (\"YYYY-MM-DD\") ou d'une plage [début, fin]. Bornes min/max, premier jour de semaine et locale configurables."
        : "Monthly calendar: pick a single date (\"YYYY-MM-DD\") or a range [start, end]. Configurable min/max bounds, week start and locale."}
    </p>
  </section>

  <FrameworkPreview example="calendar" title={fr ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <FrameworkDemo nodes={singleDemo} label={fr ? "Date unique" : "Single date"} />
    <FrameworkDemo nodes={rangeDemo} label="range" />
    <FrameworkDemo nodes={boundedDemo} label="min / max" />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>string | null | [string | null, string | null]</code></td><td><code>null</code></td></tr>
        <tr><td><code>onChange</code></td><td><code>(value: CalendarValue) =&gt; void</code></td><td><em>—</em></td></tr>
        <tr><td><code>min</code></td><td><code>string</code> ("YYYY-MM-DD")</td><td><em>—</em></td></tr>
        <tr><td><code>max</code></td><td><code>string</code> ("YYYY-MM-DD")</td><td><em>—</em></td></tr>
        <tr><td><code>range</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>weekStartsOn</code></td><td><code>0 | 1</code></td><td><code>1</code></td></tr>
        <tr><td><code>month</code></td><td><code>string</code> ("YYYY-MM")</td><td><em>—</em></td></tr>
        <tr><td><code>locale</code></td><td><code>string</code></td><td><code>"fr-FR"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "En mode plage, onChange reçoit le tuple [début, fin]. Le mois affiché est contrôlable via month ; les dates hors min/max sont désactivées." : "In range mode, onChange receives the [start, end] tuple. The visible month is controllable via month; dates outside min/max are disabled."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
  </section>
</div>
