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
    /* Anatomy typography (additive): size/line-height/letter-spacing follow the
       link role per theme. Base/DSFR use `inherit`/`normal` fallbacks → no visible
       change; Carbon poses 14px / 18px / 0.16px to match the real .bx--link. */
    font-size: var(--st-component-link-anatomy-typography-size, inherit);
    line-height: var(--st-component-link-anatomy-typography-lineHeight, normal);
    letter-spacing: var(--st-component-link-anatomy-typography-letterSpacing, normal);
    text-decoration: var(--st-component-link-anatomy-typography-textDecoration, underline);
    text-decoration-thickness: var(--st-component-link-anatomy-typography-decorationThickness, auto);
    text-underline-offset: var(--st-component-link-anatomy-typography-decorationOffset, 0.18em);
    transition-property: color, text-decoration-thickness, text-underline-offset;
    transition-duration: var(--st-motion-normal, 180ms);
    transition-timing-function: var(--st-motion-easing, cubic-bezier(0.4, 0, 0.2, 1));
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
       underline → underline (no-op). The DSFR animated underline now
       transitions thickness/offset via anatomy-hover vars when provided. */
    text-decoration-line: var(--st-component-link-anatomy-states-hover-decoration, underline);
    text-decoration-thickness: var(--st-component-link-anatomy-typography-decorationThicknessHover, var(--st-component-link-anatomy-typography-decorationThickness, auto));
    text-underline-offset: var(--st-component-link-anatomy-typography-decorationOffsetHover, var(--st-component-link-anatomy-typography-decorationOffset, 0.18em));
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
