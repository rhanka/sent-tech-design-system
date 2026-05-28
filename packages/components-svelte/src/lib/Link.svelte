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
    cursor: var(--st-cursor-interactive, pointer);
    text-decoration: var(--st-component-link-anatomy-typography-textDecoration, underline);
    text-decoration-thickness: var(--st-component-link-anatomy-typography-decorationThickness, auto);
    text-underline-offset: var(--st-component-link-anatomy-typography-decorationOffset, 0.18em);
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
    color: var(--st-component-link-anatomy-states-hover-text, var(--st-component-link-hoverText, var(--st-semantic-action-primary)));
    /* Anatomy v1.1.0: hover decoration sourced from states.hover.decoration
       (= link typography textDecorationHover). Carbon: none → underline; DSFR/base:
       underline → underline (no-op). The DSFR animated underline stays an escape. */
    text-decoration-line: var(--st-component-link-anatomy-states-hover-decoration, underline);
  }

  /* Focus = shared mixin. --st-radius-* fixed to the valid `sm` token (was the
     phantom --st-radius-small). */
  .st-link:focus-visible {
    border-radius: var(--st-component-link-anatomy-shape-radius, var(--st-radius-sm, 0.25rem));
    outline: var(--st-component-link-anatomy-focus-outline, 2px solid var(--st-semantic-border-interactive));
    outline-offset: var(--st-component-link-anatomy-focus-offset, 2px);
    box-shadow: var(--st-component-link-anatomy-focus-boxShadow, none);
  }

  .st-link--disabled {
    color: var(--st-component-link-anatomy-states-disabled-text, var(--st-component-link-disabledText, var(--st-semantic-text-muted)));
    cursor: var(--st-cursor-disabled, not-allowed);
    text-decoration: var(--st-component-link-anatomy-states-disabled-decoration, none);
  }
</style>
