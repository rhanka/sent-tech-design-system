<script lang="ts" module>
  export type TypographyVariant =
    | "display"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"
    | "body-sm"
    | "caption"
    | "overline";

  export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";
  export type TypographyTone = "primary" | "secondary" | "muted" | "inverse" | "link";
  export type TypographyAlign = "start" | "center" | "end" | "justify";

  /** Balise HTML par défaut pour chaque variante. */
  const VARIANT_TAG: Record<TypographyVariant, string> = {
    display: "h1",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    body: "p",
    "body-sm": "p",
    caption: "span",
    overline: "span"
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type TypographyProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    variant?: TypographyVariant;
    /** Surcharge la balise déduite de la variante. */
    as?: string;
    weight?: TypographyWeight;
    tone?: TypographyTone;
    align?: TypographyAlign;
    /** Tronque sur une ligne avec ellipsis. */
    truncate?: boolean;
    class?: string;
    children?: Snippet;
  };

  let {
    variant = "body",
    as,
    weight,
    tone,
    align,
    truncate = false,
    class: className,
    children,
    ...rest
  }: TypographyProps = $props();

  const tag = $derived(as ?? VARIANT_TAG[variant]);

  const classes = $derived(
    [
      "st-typography",
      `st-typography--${variant}`,
      weight ? `st-typography--weight-${weight}` : null,
      tone ? `st-typography--tone-${tone}` : null,
      align ? `st-typography--align-${align}` : null,
      truncate ? "st-typography--truncate" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );
</script>

<svelte:element this={tag} {...rest} class={classes}>
  {@render children?.()}
</svelte:element>

<style>
  .st-typography {
    color: var(--st-semantic-text-primary);
    margin: 0;
  }

  /* Échelle typographique : pas de token d'échelle global dans le DS — les
     tailles sont littérales en rem comme partout ailleurs (Badge, Tag, Header).
     La famille reste héritée de la fondation (var --st-font-family si présente). */
  .st-typography--display {
    font-size: 2.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .st-typography--h1 {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.015em;
    line-height: 1.15;
  }

  .st-typography--h2 {
    font-size: 1.625rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .st-typography--h3 {
    font-size: 1.375rem;
    font-weight: 650;
    letter-spacing: -0.01em;
    line-height: 1.25;
  }

  .st-typography--h4 {
    font-size: 1.125rem;
    font-weight: 650;
    line-height: 1.3;
  }

  .st-typography--h5 {
    font-size: 1rem;
    font-weight: 650;
    line-height: 1.35;
  }

  .st-typography--h6 {
    font-size: 0.875rem;
    font-weight: 650;
    line-height: 1.4;
  }

  .st-typography--body {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.55;
  }

  .st-typography--body-sm {
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
  }

  .st-typography--caption {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1.4;
  }

  .st-typography--overline {
    color: var(--st-semantic-text-secondary);
    font-size: 0.6875rem;
    font-weight: 650;
    letter-spacing: 0.08em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  /* Weight overrides */
  .st-typography--weight-regular {
    font-weight: 400;
  }
  .st-typography--weight-medium {
    font-weight: 500;
  }
  .st-typography--weight-semibold {
    font-weight: 650;
  }
  .st-typography--weight-bold {
    font-weight: 700;
  }

  /* Tone overrides */
  .st-typography--tone-primary {
    color: var(--st-semantic-text-primary);
  }
  .st-typography--tone-secondary {
    color: var(--st-semantic-text-secondary);
  }
  .st-typography--tone-muted {
    color: var(--st-semantic-text-muted);
  }
  .st-typography--tone-inverse {
    color: var(--st-semantic-text-inverse);
  }
  .st-typography--tone-link {
    color: var(--st-semantic-text-link, var(--st-semantic-action-primary));
  }

  /* Alignment */
  .st-typography--align-start {
    text-align: start;
  }
  .st-typography--align-center {
    text-align: center;
  }
  .st-typography--align-end {
    text-align: end;
  }
  .st-typography--align-justify {
    text-align: justify;
  }

  /* Truncate : ellipsis sur une seule ligne. */
  .st-typography--truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
