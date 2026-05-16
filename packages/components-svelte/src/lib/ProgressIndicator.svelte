<script lang="ts" module>
  export type ProgressIndicatorStatus =
    | "complete"
    | "current"
    | "upcoming"
    | "invalid"
    | "disabled";

  export interface ProgressIndicatorItem {
    value: string;
    label: string;
    description?: string;
    status?: ProgressIndicatorStatus;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type ProgressIndicatorProps = Omit<HTMLAttributes<HTMLOListElement>, "class"> & {
    items: ProgressIndicatorItem[];
    vertical?: boolean;
    label?: string;
    class?: string;
  };

  let {
    items,
    vertical = false,
    label = "Progress",
    class: className,
    ...rest
  }: ProgressIndicatorProps = $props();

  const classes = () =>
    [
      "st-progressIndicator",
      vertical ? "st-progressIndicator--vertical" : "st-progressIndicator--horizontal",
      className
    ]
      .filter(Boolean)
      .join(" ");

  const resolvedStatus = (item: ProgressIndicatorItem): ProgressIndicatorStatus =>
    item.status ?? "upcoming";
</script>

<ol {...rest} class={classes()} aria-label={label}>
  {#each items as item, index (item.value)}
    {@const status = resolvedStatus(item)}
    {@const isLast = index === items.length - 1}
    <li
      class={["st-progressIndicator__step", `st-progressIndicator__step--${status}`].join(" ")}
      aria-current={status === "current" ? "step" : undefined}
    >
      <span class="st-progressIndicator__indicator" aria-hidden="true">
        <span class="st-progressIndicator__circle">
          {#if status === "complete"}
            <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
              <path
                d="m3 8 3.5 3.5L13 5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          {:else if status === "invalid"}
            <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
              <path
                d="M4 4l8 8M12 4l-8 8"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          {:else if status === "current"}
            <span class="st-progressIndicator__dot"></span>
          {:else}
            <span class="st-progressIndicator__index">{index + 1}</span>
          {/if}
        </span>
        {#if !isLast}
          <span class="st-progressIndicator__connector"></span>
        {/if}
      </span>
      <span class="st-progressIndicator__text">
        <span class="st-progressIndicator__label">{item.label}</span>
        {#if item.description}
          <span class="st-progressIndicator__description">{item.description}</span>
        {/if}
      </span>
    </li>
  {/each}
</ol>

<style>
  .st-progressIndicator {
    color: var(--st-component-progressIndicator-text, var(--st-semantic-text-primary));
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-progressIndicator--horizontal {
    align-items: flex-start;
    flex-direction: row;
    gap: 0;
  }

  .st-progressIndicator--vertical {
    flex-direction: column;
    gap: 0;
  }

  .st-progressIndicator__step {
    display: flex;
    flex: 1 1 0;
    gap: var(--st-spacing-2, 0.5rem);
    min-width: 0;
    position: relative;
  }

  .st-progressIndicator--horizontal .st-progressIndicator__step {
    align-items: flex-start;
    flex-direction: column;
  }

  .st-progressIndicator--vertical .st-progressIndicator__step {
    align-items: flex-start;
    flex: 0 0 auto;
    flex-direction: row;
  }

  .st-progressIndicator__indicator {
    align-items: center;
    color: var(--st-component-progressIndicator-iconText, var(--st-semantic-text-secondary));
    display: flex;
    flex: 0 0 auto;
    justify-content: center;
    position: relative;
  }

  .st-progressIndicator--horizontal .st-progressIndicator__indicator {
    flex-direction: row;
    width: 100%;
  }

  .st-progressIndicator--vertical .st-progressIndicator__indicator {
    flex-direction: column;
    min-height: 3rem;
  }

  .st-progressIndicator__circle {
    align-items: center;
    background: var(--st-component-progressIndicator-circleBackground, var(--st-semantic-surface-default));
    border: 1.5px solid
      var(--st-component-progressIndicator-circleBorder, var(--st-semantic-border-strong));
    border-radius: 50%;
    color: var(--st-component-progressIndicator-iconText, var(--st-semantic-text-secondary));
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.75rem;
    font-weight: 600;
    height: 1.5rem;
    justify-content: center;
    line-height: 1;
    width: 1.5rem;
    z-index: 1;
  }

  .st-progressIndicator__index {
    line-height: 1;
  }

  .st-progressIndicator__dot {
    background: currentColor;
    border-radius: 50%;
    height: 0.5rem;
    width: 0.5rem;
  }

  .st-progressIndicator__connector {
    background: var(--st-component-progressIndicator-connector, var(--st-semantic-border-subtle));
    flex: 1 1 auto;
  }

  .st-progressIndicator--horizontal .st-progressIndicator__connector {
    height: 2px;
    margin-top: calc(0.75rem - 1px);
  }

  .st-progressIndicator--vertical .st-progressIndicator__connector {
    margin-left: calc(0.75rem - 1px);
    min-height: 1.5rem;
    width: 2px;
  }

  .st-progressIndicator__text {
    display: grid;
    gap: 0.125rem;
    min-width: 0;
  }

  .st-progressIndicator--horizontal .st-progressIndicator__text {
    padding-right: var(--st-spacing-3, 0.75rem);
    padding-top: var(--st-spacing-2, 0.5rem);
  }

  .st-progressIndicator--vertical .st-progressIndicator__text {
    padding-bottom: var(--st-spacing-3, 0.75rem);
  }

  .st-progressIndicator__label {
    color: var(--st-component-progressIndicator-text, var(--st-semantic-text-primary));
    font-size: 0.875rem;
    font-weight: 600;
  }

  .st-progressIndicator__description {
    color: var(--st-component-progressIndicator-descriptionText, var(--st-semantic-text-secondary));
    font-size: 0.8125rem;
  }

  /* Status: complete */
  .st-progressIndicator__step--complete .st-progressIndicator__circle {
    background: var(
      --st-component-progressIndicator-completeBackground,
      var(--st-semantic-action-primary)
    );
    border-color: var(
      --st-component-progressIndicator-completeBackground,
      var(--st-semantic-action-primary)
    );
    color: var(--st-component-progressIndicator-completeIcon, var(--st-semantic-action-primaryText));
  }

  .st-progressIndicator__step--complete .st-progressIndicator__connector {
    background: var(
      --st-component-progressIndicator-completeConnector,
      var(--st-semantic-action-primary)
    );
  }

  /* Status: current */
  .st-progressIndicator__step--current .st-progressIndicator__circle {
    border-color: var(
      --st-component-progressIndicator-currentBorder,
      var(--st-semantic-action-primary)
    );
    color: var(--st-component-progressIndicator-currentText, var(--st-semantic-action-primary));
  }

  .st-progressIndicator__step--current .st-progressIndicator__label {
    color: var(--st-component-progressIndicator-currentText, var(--st-semantic-action-primary));
  }

  /* Status: invalid */
  .st-progressIndicator__step--invalid .st-progressIndicator__circle {
    border-color: var(
      --st-component-progressIndicator-invalidBorder,
      var(--st-semantic-feedback-error)
    );
    color: var(--st-component-progressIndicator-invalidText, var(--st-semantic-feedback-error));
  }

  .st-progressIndicator__step--invalid .st-progressIndicator__label {
    color: var(--st-component-progressIndicator-invalidText, var(--st-semantic-feedback-error));
  }

  /* Status: disabled */
  .st-progressIndicator__step--disabled {
    opacity: 0.55;
  }

  .st-progressIndicator__step--disabled .st-progressIndicator__label,
  .st-progressIndicator__step--disabled .st-progressIndicator__description {
    color: var(--st-component-progressIndicator-disabledText, var(--st-semantic-text-muted));
  }
</style>
