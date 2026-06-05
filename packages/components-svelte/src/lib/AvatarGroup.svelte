<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { AvatarSize } from "./Avatar.svelte";

  type AvatarGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Nombre maximum d'avatars visibles. Au-delà, un jeton « +N » est affiché. */
    max?: number;
    /** Taille appliquée au jeton de débordement (doit refléter les Avatar). */
    size?: AvatarSize;
    /** Nombre total réel d'éléments (sert à calculer le « +N » si > max). */
    total?: number;
    class?: string;
    children?: Snippet;
  };

  let {
    max,
    size = "md",
    total,
    class: className,
    children,
    ...rest
  }: AvatarGroupProps = $props();

  const overflow = $derived(
    max != null && total != null && total > max ? total - max : 0
  );

  const classes = $derived(
    ["st-avatarGroup", `st-avatarGroup--${size}`, className].filter(Boolean).join(" ")
  );
</script>

<div {...rest} class={classes} style:--st-avatar-group-max={max ?? ""}>
  {@render children?.()}
  {#if overflow > 0}
    <span class="st-avatarGroup__overflow" aria-label={`+${overflow}`}>+{overflow}</span>
  {/if}
</div>

<style>
  /* Avatars empilés avec recouvrement ; un anneau de surface sépare chaque
     vignette pour la lisibilité. Le recouvrement est porté par les marges
     négatives sur les enfants directs. */
  .st-avatarGroup {
    align-items: center;
    display: inline-flex;
    flex-direction: row;
  }

  .st-avatarGroup > :global(*) {
    box-shadow: 0 0 0 2px var(--st-semantic-surface-default, #ffffff);
    position: relative;
  }

  .st-avatarGroup > :global(* + *) {
    margin-inline-start: -0.5rem;
  }

  .st-avatarGroup--sm > :global(* + *) {
    margin-inline-start: -0.375rem;
  }

  .st-avatarGroup--lg > :global(* + *) {
    margin-inline-start: -0.625rem;
  }

  .st-avatarGroup--xl > :global(* + *) {
    margin-inline-start: -0.875rem;
  }

  .st-avatarGroup__overflow {
    align-items: center;
    background: var(--st-semantic-surface-subtle, #eef2f7);
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--st-semantic-surface-default, #ffffff);
    color: var(--st-semantic-text-secondary, #64748b);
    display: inline-flex;
    flex: 0 0 auto;
    font-weight: 700;
    justify-content: center;
    margin-inline-start: -0.5rem;
    position: relative;
    user-select: none;
  }

  .st-avatarGroup--sm .st-avatarGroup__overflow {
    font-size: 0.6875rem;
    height: 1.5rem;
    margin-inline-start: -0.375rem;
    width: 1.5rem;
  }

  .st-avatarGroup--md .st-avatarGroup__overflow {
    font-size: 0.75rem;
    height: 2rem;
    width: 2rem;
  }

  .st-avatarGroup--lg .st-avatarGroup__overflow {
    font-size: 0.875rem;
    height: 2.5rem;
    margin-inline-start: -0.625rem;
    width: 2.5rem;
  }

  .st-avatarGroup--xl .st-avatarGroup__overflow {
    font-size: 1.125rem;
    height: 3.5rem;
    margin-inline-start: -0.875rem;
    width: 3.5rem;
  }
</style>
