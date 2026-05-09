<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type LinkProps = Omit<HTMLAnchorAttributes, "class" | "href" | "target" | "rel" | "onclick"> & {
    href: string;
    variant?: "inline" | "standalone" | "muted";
    disabled?: boolean;
    external?: boolean;
    class?: string;
    target?: HTMLAnchorAttributes["target"];
    rel?: string;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  };

  let {
    href,
    variant = "inline",
    disabled = false,
    external = false,
    class: className,
    target,
    rel,
    onclick,
    children,
    ...rest
  }: LinkProps = $props();

  const classes = () =>
    ["st-link", `st-link--${variant}`, disabled ? "st-link--disabled" : undefined, className]
      .filter(Boolean)
      .join(" ");
  const linkTarget = () => target ?? (external ? "_blank" : undefined);
  const linkRel = () => rel ?? (external ? "noreferrer" : undefined);
  const handleClick = (event: MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onclick?.(event);
  };
</script>

<a
  {...rest}
  class={classes()}
  href={disabled ? undefined : href}
  target={linkTarget()}
  rel={linkRel()}
  aria-disabled={disabled ? "true" : undefined}
  onclick={handleClick}
>
  {@render children?.()}
</a>

<style>
  .st-link {
    color: var(--st-component-link-text, var(--st-semantic-text-link));
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }

  .st-link--standalone {
    display: inline-flex;
    font-weight: 600;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-link--muted {
    color: var(--st-semantic-text-secondary);
  }

  .st-link:hover {
    color: var(--st-component-link-hoverText, var(--st-semantic-action-primary));
  }

  .st-link:focus-visible {
    border-radius: var(--st-radius-small, 0.375rem);
    outline: 2px solid var(--st-component-link-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }

  .st-link--disabled {
    color: var(--st-component-link-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
    text-decoration: none;
  }
</style>
