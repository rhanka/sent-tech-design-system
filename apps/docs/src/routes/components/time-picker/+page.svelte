<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const baseDemo: NodeSpec[] = [
    {
      comp: "TimePicker",
      props: { value: "09:30", step: 15, label: fr ? "Heure du rendez-vous" : "Appointment time" }
    }
  ];
  const boundedDemo: NodeSpec[] = [
    {
      comp: "TimePicker",
      props: {
        value: "14:00",
        step: 30,
        min: "08:00",
        max: "18:00",
        label: fr ? "Créneau" : "Slot"
      }
    }
  ];
  const twelveDemo: NodeSpec[] = [
    {
      comp: "TimePicker",
      props: { value: "13:45", step: 15, format: "12", label: fr ? "Format 12h" : "12h format" }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Formulaire" : "Component · Form"}</p>
    <div class="docs-hero-title">
      <h1>TimePicker</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Sélection d'une heure parmi des créneaux générés par pas (step). La valeur émise reste au format \"HH:mm\" 24h, avec affichage 24h ou 12h."
        : "Time selection from slots generated at a fixed step. The emitted value stays in 24h \"HH:mm\" format, with 24h or 12h display."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={baseDemo} title={fr ? "Pas de 15 min" : "15-min step"} />
    <TabbedExample nodes={boundedDemo} title="min / max" />
    <TabbedExample nodes={twelveDemo} title="format=&quot;12&quot;" />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>string</code> ("HH:mm")</td><td><code>""</code></td></tr>
        <tr><td><code>onChange</code></td><td><code>(value: string) =&gt; void</code></td><td><em>–</em></td></tr>
        <tr><td><code>step</code></td><td><code>number</code> ({fr ? "minutes" : "minutes"})</td><td><code>15</code></td></tr>
        <tr><td><code>min</code></td><td><code>string</code> ("HH:mm")</td><td><em>–</em></td></tr>
        <tr><td><code>max</code></td><td><code>string</code> ("HH:mm")</td><td><em>–</em></td></tr>
        <tr><td><code>format</code></td><td><code>"24" | "12"</code></td><td><code>"24"</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>–</em></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Les créneaux sont générés entre min et max selon step. Quel que soit le format d'affichage, onChange reçoit \"HH:mm\" sur 24 heures." : "Slots are generated between min and max by step. Regardless of display format, onChange receives 24h \"HH:mm\"."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
  </section>
</div>
