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
    /** Parent layout/viewport width threshold (px) for `"auto"` mode (default 520). */
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
  let measuredWidth: number | null = $state(null);

  function readViewportWidth(): number | null {
    if (typeof window === "undefined") return null;
    return window.innerWidth > 0 ? window.innerWidth : null;
  }

  $effect(() => {
    if (mode !== "auto" || !rootEl) {
      measuredWidth = null;
      return;
    }

    const host = rootEl.parentElement;
    const updateWidth = (width: number) => {
      if (width > 0) {
        measuredWidth = width;
      } else {
        const viewport = readViewportWidth();
        if (viewport !== null) measuredWidth = viewport;
      }
    };

    updateWidth(host ? host.getBoundingClientRect().width : 0);

    let observer: ResizeObserver | undefined;
    if (host && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          updateWidth(entry.contentRect.width);
        }
      });
      observer.observe(host);
    }

    const onResize = () => {
      updateWidth(host ? host.getBoundingClientRect().width : 0);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
    }

    return () => {
      observer?.disconnect();
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", onResize);
      }
    };
  });

  const fallbackCompact = $derived.by(() => {
    const viewport = readViewportWidth();
    return viewport === null ? true : viewport <= compactBreakpoint;
  });

  const autoCompact = $derived(
    measuredWidth !== null ? measuredWidth <= compactBreakpoint : fallbackCompact
  );

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

<aside
  {...rest}
  aria-label={rest["aria-labelledby"] ? undefined : (rest["aria-label"] ?? title)}
  bind:this={rootEl}
  class={classes}
>
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
