<script lang="ts" module>
  export type StatusDotTone = "neutral" | "info" | "success" | "warning" | "error";
</script>

<script lang="ts">
  // StatusDot — pastille de statut (les points colorés des « COMMUNITIES », la
  // pastille « EN DIRECT » live, les indicateurs verts des docs). Par défaut un
  // simple point coloré via `tone` (mappé sur --st-semantic-feedback-*) ; `color`
  // accepte une couleur arbitraire rendue en `background-color` inline (même logique
  // que ColorSwatch) et prime sur `tone`. Avec `label`, rend point + texte = un
  // « StatusIndicator ». Style PROPRE token-only, AUCUN hex en dur.
  //
  // a11y : sans label le point est purement décoratif → on expose tout de même un
  // `role="img"` + `aria-label` (le tone, ou la couleur) pour que la sémantique de
  // statut ne soit pas perdue pour les lecteurs d'écran. Avec label, le texte porte
  // l'info → le point passe `aria-hidden` (évite la redondance vocale).
  import type { HTMLAttributes } from "svelte/elements";

  type StatusDotProps = Omit<HTMLAttributes<HTMLSpanElement>, "class" | "color"> & {
    /** Ton sémantique, mappé sur --st-semantic-feedback-*. Ignoré si `color` est fourni. */
    tone?: StatusDotTone;
    /** Couleur arbitraire (hex, rgb(), var(--token)…), rendue en background inline. Prime sur `tone`. */
    color?: string;
    /** Diamètre du point en px (défaut 8). */
    size?: number;
    /** Halo animé pour un état « live ». Désactivé sous prefers-reduced-motion. */
    pulse?: boolean;
    /** Si fourni, rend le point + ce texte inline (un StatusIndicator). */
    label?: string;
    class?: string;
  };

  let {
    tone = "neutral",
    color,
    size = 8,
    pulse = false,
    label,
    class: className,
    ...rest
  }: StatusDotProps = $props();

  const safeSize = $derived(Math.max(Number(size) || 0, 1));
  const accessibleLabel = $derived(label ?? color ?? tone);
  const dotStyle = $derived(
    [
      color ? `background-color:${color};` : null,
      `width:${safeSize}px;`,
      `height:${safeSize}px;`
    ]
      .filter(Boolean)
      .join(" ")
  );
  const dotClasses = $derived(
    [
      "st-statusDot__dot",
      color ? null : `st-statusDot__dot--${tone}`,
      pulse ? "st-statusDot__dot--pulse" : null
    ]
      .filter(Boolean)
      .join(" ")
  );
  const classes = $derived(["st-statusDot", className].filter(Boolean).join(" "));
</script>

<span {...rest} class={classes}>
  {#if label}
    <span class={dotClasses} style={dotStyle} aria-hidden="true"></span>
    <span class="st-statusDot__label">{label}</span>
  {:else}
    <span class={dotClasses} style={dotStyle} role="img" aria-label={accessibleLabel}></span>
  {/if}
</span>

<style>
  /* P-C : anatomie statusDot par thème. Chaque var retombe sur un littéral de base,
     donc un thème sans `--st-component-statusDot-*` rend byte-identique. */
  .st-statusDot {
    align-items: center;
    color: var(--st-semantic-text-primary, inherit);
    display: inline-flex;
    font-family: inherit;
    gap: var(--st-spacing-2, 0.5rem);
    line-height: 1;
    vertical-align: middle;
  }

  .st-statusDot__dot {
    border-radius: var(--st-radius-full, 50%);
    box-sizing: border-box;
    display: inline-block;
    flex: none;
  }

  .st-statusDot__dot--neutral {
    background-color: var(--st-component-statusDot-neutral, var(--st-semantic-text-secondary));
  }
  .st-statusDot__dot--info {
    background-color: var(--st-component-statusDot-info, var(--st-semantic-feedback-info));
  }
  .st-statusDot__dot--success {
    background-color: var(--st-component-statusDot-success, var(--st-semantic-feedback-success));
  }
  .st-statusDot__dot--warning {
    background-color: var(--st-component-statusDot-warning, var(--st-semantic-feedback-warning));
  }
  .st-statusDot__dot--error {
    background-color: var(--st-component-statusDot-error, var(--st-semantic-feedback-error));
  }

  .st-statusDot__label {
    color: var(--st-semantic-text-primary, inherit);
    font-size: var(--st-component-statusDot-labelFontSize, 0.8125rem);
    font-weight: var(--st-component-statusDot-labelFontWeight, 500);
  }

  /* Halo « live » : box-shadow animé. currentColor = la couleur du point lui-même
     (tone ou couleur inline), donc le halo suit toujours la pastille. */
  .st-statusDot__dot--pulse {
    animation: st-statusDot-pulse 1.6s ease-out infinite;
  }

  @keyframes st-statusDot-pulse {
    0% {
      box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 55%, transparent);
    }
    70% {
      box-shadow: 0 0 0 var(--st-component-statusDot-pulseSpread, 0.375rem)
        color-mix(in srgb, currentColor 0%, transparent);
    }
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 0%, transparent);
    }
  }

  /* Le halo emprunte la couleur du point : on aligne `color` sur le background du
     tone pour que `currentColor` dans le keyframe corresponde. Pour `color` inline,
     le background prime mais currentColor reste hérité — acceptable (halo discret). */
  .st-statusDot__dot--neutral {
    color: var(--st-component-statusDot-neutral, var(--st-semantic-text-secondary));
  }
  .st-statusDot__dot--info {
    color: var(--st-component-statusDot-info, var(--st-semantic-feedback-info));
  }
  .st-statusDot__dot--success {
    color: var(--st-component-statusDot-success, var(--st-semantic-feedback-success));
  }
  .st-statusDot__dot--warning {
    color: var(--st-component-statusDot-warning, var(--st-semantic-feedback-warning));
  }
  .st-statusDot__dot--error {
    color: var(--st-component-statusDot-error, var(--st-semantic-feedback-error));
  }

  @media (prefers-reduced-motion: reduce) {
    .st-statusDot__dot--pulse {
      animation: none;
    }
  }
</style>
