<script lang="ts">
  import { Badge, LoadingState } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Feedback", "Component · Feedback")}</p>
    <h1>
      LoadingState
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>
      {fr(
        "Indicateur de chargement inline accompagné d'un libellé, en deux variantes : un spinner qui tourne, ou un squelette animé. Il signale qu'une zone est occupée (aria-busy) et annonce poliment l'attente aux lecteurs d'écran.",
        "Inline loading indicator paired with a label, in two variants: a spinning spinner, or an animated skeleton. It signals that an area is busy (aria-busy) and politely announces the wait to screen readers."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Indiquer qu'une zone charge des données sans en connaître la durée.", "Indicate that an area is loading data of unknown duration.")}</li>
      <li>{fr("Accompagner un libellé court décrivant ce qui charge.", "Pair it with a short label describing what is loading.")}</li>
      <li>{fr("Pour une progression chiffrée, utilisez ProgressBar ; pour un retour d'action inline, InlineLoading.", "For measured progress, use ProgressBar; for inline action feedback, InlineLoading.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand ne pas l'utiliser", "When not to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour reproduire la forme du contenu attendu : utilisez SkeletonText.", "To mimic the shape of the expected content: use SkeletonText.")}</li>
      <li>{fr("Pour une progression déterminée en pourcentage : utilisez ProgressBar.", "For determinate percentage progress: use ProgressBar.")}</li>
      <li>{fr("Pour un chargement très bref (sous ~300 ms) : évitez tout indicateur.", "For a very brief load (under ~300 ms): avoid any indicator.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Variantes", "Variants")}</h2>
    <p>{fr("La variante spinner (défaut) tourne ; la variante skeleton anime une barre dégradée.", "The spinner variant (default) spins; the skeleton variant animates a gradient bar.")}</p>
    <div class="docs-example docs-example--stack">
      <LoadingState label={fr("Chargement des services", "Loading services")} />
      <LoadingState label={fr("Préparation du squelette", "Preparing skeleton")} variant="skeleton" />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Libellé par défaut", "Default label")}</h2>
    <p>{fr("Sans label, l'indicateur affiche « Loading ». Fournissez toujours un libellé explicite.", "With no label, the indicator shows \"Loading\". Always provide an explicit label.")}</p>
    <div class="docs-example docs-example--stack">
      <LoadingState />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-loading, role=\"status\", aria-busy) : enveloppe inline-flex.", "Container (.st-loading, role=\"status\", aria-busy): inline-flex wrapper.")}</li>
      <li>{fr("Indicateur (.st-loading__spinner ou .st-loading__skeleton) : animé, aria-hidden.", "Indicator (.st-loading__spinner or .st-loading__skeleton): animated, aria-hidden.")}</li>
      <li>{fr("Libellé (.st-loading__label) : texte visible décrivant le chargement.", "Label (.st-loading__label): visible text describing the load.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le conteneur a role=\"status\" et aria-busy=\"true\" : l'attente est annoncée poliment.", "The container has role=\"status\" and aria-busy=\"true\": the wait is announced politely.")}</li>
      <li>{fr("aria-label reprend le libellé fourni par la prop label.", "aria-label mirrors the text supplied by the label prop.")}</li>
      <li>{fr("L'indicateur visuel est aria-hidden : seul le libellé porte le sens.", "The visual indicator is aria-hidden: only the label carries meaning.")}</li>
      <li>{fr("Fournissez un libellé concret (« Chargement des services ») plutôt que générique.", "Provide a concrete label (\"Loading services\") rather than a generic one.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Nommer ce qui charge dans le libellé.", "Name what is loading in the label.")}</li>
          <li>{fr("Choisir le squelette pour un bloc de contenu, le spinner pour une action.", "Choose skeleton for a content block, spinner for an action.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Afficher un indicateur pour un délai imperceptible.", "Show an indicator for an imperceptible delay.")}</li>
          <li>{fr("Laisser le libellé vide ou trop générique.", "Leave the label empty or too generic.")}</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{fr("Défaut", "Default")}</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Loading"</code></td><td>{fr("Libellé visible et aria-label.", "Visible label and aria-label.")}</td></tr>
        <tr><td><code>variant</code></td><td><code>"spinner" | "skeleton"</code></td><td><code>"spinner"</code></td><td>{fr("Type d'indicateur affiché.", "Type of indicator displayed.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le conteneur.", "Class(es) on the container.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>—</td><td>{fr("Propagés sur le <section> conteneur.", "Spread onto the <section> container.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-loadingState-text</code></li>
      <li><code>--st-component-loadingState-track</code></li>
      <li><code>--st-component-loadingState-indicator</code></li>
      <li><code>--st-component-loadingState-radius</code></li>
    </ul>
  </section>
</div>
