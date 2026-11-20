<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";
  import type { CollaborationActor } from "@sentropic/design-system-review-core";
  import type { AvatarSize } from "./Avatar.svelte";

  export type CommentAuthorshipProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** True author (human, agent, or NHI). */
    author: CollaborationActor;
    /** Sponsoring human owner when the true author is an agent/NHI. */
    sponsor?: CollaborationActor;
    /** Vignette size matching AvatarGroup scale. */
    size?: AvatarSize;
    /** Whether to render the textual attribution line beside the icon stack. */
    showLabel?: boolean;
    class?: string;
  };
</script>

<script lang="ts">
  import { Bot, Cpu } from "@lucide/svelte";
  import AvatarGroup from "./AvatarGroup.svelte";
  import Badge from "./Badge.svelte";
  import { deriveInitials } from "./Header.svelte";
  import { sanitizeActorColor } from "./review-markdown.js";

  let {
    author,
    sponsor,
    size = "sm",
    showLabel = true,
    class: className,
    ...rest
  }: CommentAuthorshipProps = $props();

  const isNonHuman = $derived(author.kind !== "human");
  const authorColor = $derived(sanitizeActorColor(author.color));
  const sponsorColor = $derived(sponsor ? sanitizeActorColor(sponsor.color) : undefined);
  const authorInitials = $derived(deriveInitials(author.displayLabel));
  const sponsorInitials = $derived(sponsor ? deriveInitials(sponsor.displayLabel) : "");
  const iconSize = $derived(
    size === "sm" ? 13 : size === "md" ? 16 : size === "lg" ? 18 : 22,
  );
  const kindBadgeLabel = $derived(author.kind === "nhi" ? "NHI" : "Agent");

  const accessibleName = $derived.by(() => {
    if (sponsor) {
      return `Comment by ${author.displayLabel}, ${author.kind}, on behalf of ${sponsor.displayLabel}`;
    }
    if (isNonHuman) {
      return `Comment by ${author.displayLabel}, ${author.kind}`;
    }
    return `Comment by ${author.displayLabel}`;
  });

  const classes = $derived(
    ["st-review-authorship", `st-review-authorship--${size}`, className]
      .filter(Boolean)
      .join(" "),
  );
</script>

<div {...rest} class={classes} data-author-kind={author.kind}>
  <!-- Composed on AvatarGroup (not bare Avatar) so inner vignettes stay aria-hidden
       under a single role="img" carrying the full attribution name (SPEC-r6 §3). -->
  <AvatarGroup
    {size}
    class="st-review-authorship__stack"
    role="img"
    aria-label={accessibleName}
  >
    <span
      class="st-review-authorship__vignette st-review-authorship__vignette--{size}"
      class:st-review-authorship__vignette--agent={isNonHuman}
      data-actor-kind={author.kind}
      style:--st-review-actor-color={authorColor}
      aria-hidden="true"
    >
      {#if author.kind === "agent"}
        <Bot size={iconSize} strokeWidth={2} aria-hidden="true" />
      {:else if author.kind === "nhi"}
        <Cpu size={iconSize} strokeWidth={2} aria-hidden="true" />
      {:else}
        <span class="st-review-authorship__initials">{authorInitials}</span>
      {/if}
    </span>

    {#if sponsor}
      <span
        class="st-review-authorship__vignette st-review-authorship__vignette--{size} st-review-authorship__vignette--sponsor"
        data-actor-kind="sponsor"
        style:--st-review-actor-color={sponsorColor}
        aria-hidden="true"
      >
        <span class="st-review-authorship__initials">{sponsorInitials}</span>
      </span>
    {/if}
  </AvatarGroup>

  {#if showLabel}
    <span class="st-review-authorship__label">
      <span class="st-review-authorship__name">{author.displayLabel}</span>
      {#if isNonHuman}
        <Badge size="sm" tone="info" class="st-review-authorship__kind">{kindBadgeLabel}</Badge>
      {/if}
      {#if sponsor}
        <span class="st-review-authorship__sponsor"> · on behalf of {sponsor.displayLabel}</span>
      {/if}
    </span>
  {/if}
</div>

<style>
  .st-review-authorship {
    align-items: center;
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--st-component-review-authorship-gap, var(--st-spacing-2, 0.5rem));
    min-width: 0;
  }

  .st-review-authorship__vignette {
    align-items: center;
    background: var(--st-review-actor-color, var(--st-semantic-action-primary, #2563eb));
    border-radius: 999px;
    color: var(--st-semantic-text-inverse, #ffffff);
    display: inline-flex;
    flex: 0 0 auto;
    font-weight: 700;
    justify-content: center;
    letter-spacing: 0.01em;
    line-height: 1;
    user-select: none;
  }

  .st-review-authorship__vignette--sm {
    font-size: 0.625rem;
    height: 1.5rem;
    width: 1.5rem;
  }

  .st-review-authorship__vignette--md {
    font-size: 0.75rem;
    height: 2rem;
    width: 2rem;
  }

  .st-review-authorship__vignette--lg {
    font-size: 0.875rem;
    height: 2.5rem;
    width: 2.5rem;
  }

  .st-review-authorship__vignette--xl {
    font-size: 1.125rem;
    height: 3.5rem;
    width: 3.5rem;
  }

  .st-review-authorship__vignette--agent {
    border-radius: var(--st-radius-sm, 0.375rem);
  }

  .st-review-authorship__initials {
    pointer-events: none;
  }

  .st-review-authorship__label {
    align-items: center;
    color: var(--st-component-review-text, var(--st-semantic-text-primary));
    display: inline-flex;
    flex-wrap: wrap;
    font-size: 0.8125rem;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1.3;
    min-width: 0;
  }

  .st-review-authorship__name {
    font-weight: 600;
  }

  .st-review-authorship__sponsor {
    color: var(--st-component-review-mutedText, var(--st-semantic-text-secondary));
    font-weight: 400;
  }
</style>
