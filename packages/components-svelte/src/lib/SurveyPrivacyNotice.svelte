<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export type SurveyPrivacyNoticeMode = "auto" | "card" | "collapsible";

  export type SurveyPrivacyNoticeProps = Omit<HTMLAttributes<HTMLElement>, "class" | "title"> & {
    /** Heading for card mode and disclosure trigger text for collapsible mode. */
    title: string;
    /** Short one-line anonymity badge shown alongside the title. */
    summaryBadge?: string;
    /** Privacy and anonymity rules displayed as a bulleted list. */
    items: string[];
    /**
     * Layout presentation:
     * - `"auto"` (default): switches to compact `Collapsible` at `<= compactBreakpoint` px (phone)
     *   and expanded `Card` above it (tablet/desktop).
     * - `"card"`: always renders the expanded desktop card.
     * - `"collapsible"`: always renders the compact collapsible disclosure.
     */
    mode?: SurveyPrivacyNoticeMode;
    /** Container width threshold (px) for `"auto"` mode (default 520). */
    compactBreakpoint?: number;
    /** Bindable disclosure state when rendered as `Collapsible`. */
    open?: boolean;
    /** Makes the card sticky when placed in a desktop side rail. */
    sticky?: boolean;
    /** Heading tag used in card mode (default "h2"). */
    headingAs?: "h2" | "h3" | "h4";
    onToggle?: (open: boolean) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import Badge from "./Badge.svelte";
  import Card from "./Card.svelte";
  import Collapsible from "./Collapsible.svelte";
  import Typography from "./Typography.svelte";
  import UnorderedList from "./UnorderedList.svelte";

  let {
    title,
    summaryBadge,
    items,
    mode = "auto",
    compactBreakpoint = 520,
    open = $bindable(false),
    sticky = false,
    headingAs = "h2",
    onToggle,
    class: className,
    ...rest
  }: SurveyPrivacyNoticeProps = $props();

  let rootEl: HTMLElement | undefined = $state();
  let autoCompact = $state(false);

  $effect(() => {
    if (mode !== "auto" || !rootEl || typeof ResizeObserver === "undefined") {
      autoCompact = false;
      return;
    }

    const updateWidth = (width: number) => {
      if (width > 0) {
        autoCompact = width <= compactBreakpoint;
      }
    };

    updateWidth(rootEl.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        updateWidth(entry.contentRect.width);
      }
    });
    observer.observe(rootEl);

    return () => observer.disconnect();
  });

  const isCollapsible = $derived(mode === "collapsible" || (mode === "auto" && autoCompact));

  const classes = $derived(
    [
      "st-surveyPrivacy",
      isCollapsible ? "st-surveyPrivacy--collapsible" : "st-surveyPrivacy--card",
      sticky && !isCollapsible ? "st-surveyPrivacy--sticky" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );
</script>

<aside {...rest} bind:this={rootEl} class={classes}>
  {#if isCollapsible}
    <Card class="st-surveyPrivacy__card st-surveyPrivacy__card--compact">
      {#if summaryBadge}
        {#snippet trailingBadge()}
          <Badge tone="info" size="sm">{summaryBadge}</Badge>
        {/snippet}
        <Collapsible bind:open {title} {onToggle} trailing={trailingBadge}>
          <div class="st-surveyPrivacy__list">
            <UnorderedList {items} />
          </div>
        </Collapsible>
      {:else}
        <Collapsible bind:open {title} {onToggle}>
          <div class="st-surveyPrivacy__list">
            <UnorderedList {items} />
          </div>
        </Collapsible>
      {/if}
    </Card>
  {:else}
    <Card class="st-surveyPrivacy__card">
      <div class="st-surveyPrivacy__content">
        <header class="st-surveyPrivacy__header">
          <Typography variant="h5" as={headingAs} class="st-surveyPrivacy__title">
            {title}
          </Typography>
          {#if summaryBadge}
            <Badge tone="info" size="sm">{summaryBadge}</Badge>
          {/if}
        </header>
        <div class="st-surveyPrivacy__list">
          <UnorderedList {items} />
        </div>
      </div>
    </Card>
  {/if}
</aside>

<style>
  .st-surveyPrivacy {
    width: 100%;
  }

  .st-surveyPrivacy--sticky {
    align-self: start;
    position: sticky;
    top: var(--st-spacing-4, 1rem);
  }

  .st-surveyPrivacy :global(.st-surveyPrivacy__card--compact) {
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
  }

  .st-surveyPrivacy :global(.st-collapsible__trigger) {
    min-height: 2.75rem;
  }

  .st-surveyPrivacy__content {
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-surveyPrivacy__header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-surveyPrivacy__list {
    font-size: 0.875rem;
  }

  .st-surveyPrivacy__list :global(.st-unorderedList) {
    color: var(--st-semantic-text-secondary, #444455);
    gap: var(--st-spacing-2, 0.5rem);
  }
</style>
