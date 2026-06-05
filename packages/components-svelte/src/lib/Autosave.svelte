<script lang="ts" module>
  export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

  export type AutosaveLabels = {
    idle?: string;
    saving?: string;
    saved?: string;
    error?: string;
  };
</script>

<script lang="ts">
  import { LoaderCircle, CircleCheck, CircleAlert } from "@lucide/svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type AutosaveProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    status?: AutosaveStatus;
    /** Horodatage de la dernière sauvegarde réussie. */
    lastSaved?: string | Date;
    /** Affiche un bouton « Réessayer » sur le statut `error`. */
    onRetry?: () => void;
    /** Surcharge des libellés par statut. */
    labels?: AutosaveLabels;
    /** Étiquette du bouton de relance. */
    retryLabel?: string;
    locale?: string;
    class?: string;
  };

  let {
    status = "idle",
    lastSaved,
    onRetry,
    labels,
    retryLabel,
    locale = "fr-FR",
    class: className,
    ...rest
  }: AutosaveProps = $props();

  const isFr = $derived((locale ?? "fr-FR").toLowerCase().startsWith("fr"));

  const DEFAULT_LABELS = $derived<Required<AutosaveLabels>>(
    isFr
      ? {
          idle: "Modifications enregistrées",
          saving: "Enregistrement…",
          saved: "Enregistré",
          error: "Échec de l'enregistrement"
        }
      : {
          idle: "All changes saved",
          saving: "Saving…",
          saved: "Saved",
          error: "Failed to save"
        }
  );

  const resolvedRetryLabel = $derived(retryLabel ?? (isFr ? "Réessayer" : "Retry"));

  const statusLabel = $derived(labels?.[status] ?? DEFAULT_LABELS[status]);

  const classes = $derived(
    ["st-autosave", `st-autosave--${status}`, className].filter(Boolean).join(" ")
  );

  const role = $derived(status === "error" ? "alert" : "status");

  // Heure relative de la dernière sauvegarde (rendu uniquement sur idle/saved).
  const relativeTime = $derived.by(() => {
    if (!lastSaved) return "";
    const date = lastSaved instanceof Date ? lastSaved : new Date(lastSaved);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, "second");
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute");
    const diffHour = Math.round(diffMin / 60);
    if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, "hour");
    const diffDay = Math.round(diffHour / 24);
    return rtf.format(-diffDay, "day");
  });

  const showRelative = $derived(
    (status === "saved" || status === "idle") && relativeTime !== ""
  );
</script>

<div {...rest} class={classes} role={role} aria-live="polite">
  <span class="st-autosave__icon" aria-hidden="true">
    {#if status === "saving"}
      <span class="st-autosave__spinner">
        <LoaderCircle size={16} strokeWidth={2} aria-hidden="true" />
      </span>
    {:else if status === "saved"}
      <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
    {:else if status === "error"}
      <CircleAlert size={16} strokeWidth={2} aria-hidden="true" />
    {/if}
  </span>
  <span class="st-autosave__label">{statusLabel}</span>
  {#if showRelative}
    <span class="st-autosave__time">{relativeTime}</span>
  {/if}
  {#if status === "error" && onRetry}
    <button type="button" class="st-autosave__retry" onclick={() => onRetry?.()}>
      {resolvedRetryLabel}
    </button>
  {/if}
</div>

<style>
  .st-autosave {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.875rem;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-autosave__icon {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    line-height: 0;
  }

  .st-autosave__spinner {
    align-items: center;
    animation: st-autosave-spin 0.9s linear infinite;
    display: inline-flex;
    justify-content: center;
    line-height: 0;
  }

  .st-autosave--saving .st-autosave__icon {
    color: var(--st-semantic-action-primary);
  }

  .st-autosave--saved {
    color: var(--st-semantic-feedback-success);
  }

  .st-autosave--error {
    color: var(--st-semantic-feedback-error);
  }

  .st-autosave--idle {
    color: var(--st-semantic-text-muted);
  }

  .st-autosave__time {
    color: var(--st-semantic-text-muted);
  }

  .st-autosave__retry {
    background: transparent;
    border: 0;
    color: var(--st-semantic-feedback-error);
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    padding: 0;
    text-decoration: underline;
  }

  .st-autosave__retry:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }

  @keyframes st-autosave-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .st-autosave__spinner {
      animation: none;
    }
  }
</style>
