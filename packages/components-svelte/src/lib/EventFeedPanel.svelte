<script lang="ts" module>
  /**
   * EventFeedPanel — flux d'événements datés, scrollable (façon New Relic /
   * observabilité). PANNEAU (liste), pas un graphe SVG : une liste verticale
   * scrollable d'événements horodatés, chacun teinté/iconé par sa SÉVÉRITÉ
   * (tons sémantiques --st-semantic-feedback-*). Distinct de TimelineChart
   * (axe temporel SVG) : ici la temporalité est un simple tri décroissant, le
   * rendu est du DOM (rôle `feed` / `list`) défilable.
   * API canonique (référence Svelte, React/Vue/Angular doivent s'aligner).
   *
   * Modèle : items triés par `at` DÉCROISSANT (le plus récent en tête), badge
   * de sévérité (pastille + libellé), horodatage formaté (heure locale) et
   * message. Défilement vertical borné par `maxHeight`/`height`. a11y :
   * `role="feed"` sur la liste, `role="article"` par item.
   *
   * Props obligatoires :
   *   data   EventFeedPanelEvent[]  - tableau d'événements
   *
   * Props optionnelles :
   *   label      string  - libellé accessible du flux
   *   maxHeight  number  - hauteur max en px (déclenche le scroll)
   *   height     number  - alias de maxHeight (hauteur fixe)
   *   class      string
   */
  export type EventFeedPanelSeverity =
    | "info"
    | "success"
    | "warning"
    | "error"
    | (string & {});

  export type EventFeedPanelEvent = {
    /** Horodatage en millisecondes epoch (ou tout nombre croissant). */
    at: number;
    /** Catégorie libre de l'événement (« deploy », « alert »…). */
    type: string;
    /** Sévérité : pilote la couleur/pastille (sémantique feedback). */
    severity: EventFeedPanelSeverity;
    /** Message principal affiché. */
    message: string;
  };

  export type EventFeedPanelProps = {
    data: EventFeedPanelEvent[];
    label?: string;
    maxHeight?: number;
    height?: number;
    class?: string;
  };
</script>

<script lang="ts">
  let {
    data = [],
    label,
    maxHeight,
    height,
    class: className
  }: EventFeedPanelProps = $props();

  // Sévérités connues (tons sémantiques) ; toute autre valeur retombe sur
  // « neutral » (bordure forte) pour rester tokenisée sans casser le rendu.
  const KNOWN_SEVERITIES = ["info", "success", "warning", "error"] as const;

  function severityTone(severity: string): string {
    return (KNOWN_SEVERITIES as readonly string[]).includes(severity) ? severity : "neutral";
  }

  // Horodatage lisible : heure locale (HH:MM) ; tombe sur la valeur brute si
  // le nombre n'est pas un epoch plausible.
  function formatTime(at: number): string {
    if (!Number.isFinite(at)) return "";
    const date = new Date(at);
    if (Number.isNaN(date.getTime())) return String(at);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Items valides triés par `at` DÉCROISSANT (le plus récent en tête).
  const items = $derived(
    data
      .filter((d) => d && Number.isFinite(d.at) && typeof d.message === "string")
      .map((d, index) => ({
        index,
        datum: d,
        tone: severityTone(String(d.severity)),
        time: formatTime(d.at)
      }))
      .sort((a, b) => b.datum.at - a.datum.at)
  );

  const resolvedMaxHeight = $derived(maxHeight ?? height);

  const scrollStyle = $derived(
    typeof resolvedMaxHeight === "number" && Number.isFinite(resolvedMaxHeight)
      ? `max-height: ${resolvedMaxHeight}px;`
      : undefined
  );

  const classes = () => ["st-eventFeedPanel", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  {#if label}
    <p class="st-eventFeedPanel__label" id="st-eventFeedPanel-label">{label}</p>
  {/if}
  <ul
    class="st-eventFeedPanel__list"
    role="feed"
    aria-label={label}
    aria-busy="false"
    style={scrollStyle}
  >
    {#each items as item (item.index)}
      <li
        class="st-eventFeedPanel__item st-eventFeedPanel__item--{item.tone}"
        role="article"
        aria-label={`${item.datum.type} — ${item.datum.message}`}
      >
        <span class="st-eventFeedPanel__badge st-eventFeedPanel__badge--{item.tone}" aria-hidden="true"></span>
        <div class="st-eventFeedPanel__body">
          <div class="st-eventFeedPanel__meta">
            <span class="st-eventFeedPanel__type">{item.datum.type}</span>
            <time class="st-eventFeedPanel__time">{item.time}</time>
          </div>
          <p class="st-eventFeedPanel__message">{item.datum.message}</p>
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .st-eventFeedPanel {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    width: 100%;
  }

  .st-eventFeedPanel__label {
    color: var(--st-semantic-text-primary);
    font-size: 0.75rem;
    font-weight: 600;
    margin: 0 0 var(--st-spacing-2, 0.5rem) 0;
  }

  .st-eventFeedPanel__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-1, 0.25rem);
    list-style: none;
    margin: 0;
    overflow-y: auto;
    padding: 0;
  }

  .st-eventFeedPanel__item {
    align-items: flex-start;
    background: var(--st-semantic-surface-subtle);
    border-left: 3px solid var(--st-semantic-border-strong);
    border-radius: var(--st-radius-sm, 0.25rem);
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
  }

  .st-eventFeedPanel__item--info { border-left-color: var(--st-semantic-feedback-info, var(--st-semantic-action-primary)); }
  .st-eventFeedPanel__item--success { border-left-color: var(--st-semantic-feedback-success); }
  .st-eventFeedPanel__item--warning { border-left-color: var(--st-semantic-feedback-warning); }
  .st-eventFeedPanel__item--error { border-left-color: var(--st-semantic-feedback-error); }
  .st-eventFeedPanel__item--neutral { border-left-color: var(--st-semantic-border-strong); }

  .st-eventFeedPanel__badge {
    border-radius: var(--st-radius-full, 9999px);
    flex: none;
    height: 0.5rem;
    margin-top: 0.3125rem;
    width: 0.5rem;
  }

  .st-eventFeedPanel__badge--info { background: var(--st-semantic-feedback-info, var(--st-semantic-action-primary)); }
  .st-eventFeedPanel__badge--success { background: var(--st-semantic-feedback-success); }
  .st-eventFeedPanel__badge--warning { background: var(--st-semantic-feedback-warning); }
  .st-eventFeedPanel__badge--error { background: var(--st-semantic-feedback-error); }
  .st-eventFeedPanel__badge--neutral { background: var(--st-semantic-border-strong); }

  .st-eventFeedPanel__body {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .st-eventFeedPanel__meta {
    align-items: baseline;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-eventFeedPanel__type {
    color: var(--st-semantic-text-primary);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .st-eventFeedPanel__time {
    color: var(--st-semantic-text-secondary);
    flex: none;
    font-size: 0.6875rem;
    font-variant-numeric: tabular-nums;
  }

  .st-eventFeedPanel__message {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.35;
    margin: 0;
  }
</style>
