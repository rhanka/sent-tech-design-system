<script lang="ts" module>
  import type { Snippet } from "svelte";

  /** Profondeur dans l'arbre de nav → échelle typographique DÉCROISSANTE.
   * L0 = racine (base/600), chaque palier descend en taille ET en graisse pour
   * que la hiérarchie se LISE sans indentation seule. */
  export type NavItemDepth = 0 | 1 | 2 | 3;

  /** Ton sémantique de la rangée. `error` est un VRAI état (un « HTTP 403 »
   * devient rouge sémantique), pas une teinte décorative. */
  export type NavItemStatus = "neutral" | "info" | "success" | "warning" | "error";

  export type NavItemSwatch = {
    /** Couleur arbitraire (hex/rgb/var) → rendue par ColorSwatch. */
    color?: string;
    /** Ton sémantique → rendu par StatusDot (un point). Ignoré si `color`. */
    tone?: "neutral" | "info" | "success" | "warning" | "error";
    /** Forme de la pastille couleur (ColorSwatch). Défaut « square ». */
    shape?: "square" | "circle" | "pill";
  };

  export type NavItemProps = {
    /** Clé de sélection, passée telle quelle à SelectableRow (data-value). */
    value?: string;
    /** Libellé principal (1ʳᵉ ligne). */
    title: string;
    /** 2ᵉ ligne MUETTE, ellipsée indépendamment du titre. */
    caption?: string;
    /** Profondeur (défaut 0) → échelle typo + indentation de la tête. */
    depth?: NavItemDepth;
    /** Pastille de tête : couleur arbitraire (ColorSwatch) ou ton (StatusDot). */
    swatch?: NavItemSwatch;
    /** Bulle de compte en queue (Badge circle/sm, tabular-nums). */
    count?: number;
    /** Ton sémantique de la rangée. */
    status?: NavItemStatus;
    /** Sélection (bindable, honorée en standalone ; la liste prime si encadrée). */
    selected?: boolean;
    /** Non-interactif. */
    disabled?: boolean;
    /** Rend la rangée comme un lien (ancre) — anatomie identique. */
    href?: string;
    /** Tête personnalisée (prime sur `swatch`). MUST NOT être interactif en option. */
    leading?: Snippet;
    /** Queue personnalisée (prime sur `count`). MUST NOT être interactif en option. */
    trailing?: Snippet;
    /** Séparateur token-only rendu APRÈS la rangée. */
    divider?: boolean;
    class?: string;
  };
</script>

<script lang="ts">
  // NavItem — l'ANATOMIE DE RANGÉE CANONIQUE du système de navigation (vague 2).
  // C'est la brique que tout rail/drawer instancie : tête (pastille/icône) +
  // titre + caption muette + queue (bulle de compte) + sélection + profondeur
  // typographique + séparateur optionnel.
  //
  // Zéro-entropie : NavItem NE RÉIMPLÉMENTE RIEN. Il COMPOSE SelectableRow (qui
  // possède déjà leading/trailing, la caption à ellipse indépendante, la
  // sélection à 2 signaux, l'accentBar opt-in, le rôle ARIA dérivé du conteneur
  // et la propagation du roving-tabindex) et réutilise les primitives vague 1 :
  //   • ColorSwatch  → tête quand `swatch.color` (couleur arbitraire inline)
  //   • StatusDot    → tête quand `swatch.tone` (point sémantique)
  //   • Badge        → queue (shape="circle" size="sm", tabular-nums) pour `count`
  // Style PROPRE token-only scopé : chaque --st-component-navItem-* retombe sur
  // un littéral de base, AUCUN hex en dur. Un thème qui n'émet rien rend
  // byte-identique.
  //
  // a11y : NavItem N'INTRODUIT AUCUN interactif dans la rangée — pastille, badge
  // et caption sont décoratifs/textuels. Le href passe par l'ancre native de
  // SelectableRow… mais SelectableRow rend un <div role=button/option> : pour un
  // lien réel on enveloppe via la tête. Ici `href` est exposé comme intention de
  // navigation transmise au consommateur (onselect) — la rangée reste UN seul
  // tab stop, conforme au rôle « option » dérivé du conteneur.
  import SelectableRow from "./SelectableRow.svelte";
  import ColorSwatch from "./ColorSwatch.svelte";
  import StatusDot from "./StatusDot.svelte";
  import Badge from "./Badge.svelte";

  let {
    value,
    title,
    caption,
    depth = 0,
    swatch,
    count,
    status = "neutral",
    selected = $bindable(false),
    disabled = false,
    href,
    leading,
    trailing,
    divider = false,
    class: className
  }: NavItemProps = $props();

  // Profondeur bornée [0..3] : une valeur hors-borne ne doit pas casser la classe.
  const safeDepth = $derived(
    (Math.min(Math.max(Math.trunc(Number(depth) || 0), 0), 3)) as NavItemDepth
  );

  // status → tone Badge : Badge ne connaît pas "neutral"+"info"+… exactement de
  // la même façon, mais ses tons couvrent neutral/info/success/warning/error.
  const badgeTone = $derived(status);

  // Le count alimente un aria-label explicite « N title » (un compte nu est
  // ambigu pour un lecteur d'écran — cf. la doc de Badge).
  const countLabel = $derived(
    count != null ? `${count} ${title}` : undefined
  );

  // Classes posées sur le WRAPPER NavItem (la rangée elle-même est SelectableRow).
  // Le wrapper porte la profondeur (échelle typo + indentation) et le ton de
  // rangée — ainsi SelectableRow reste inchangé et son rôle ARIA dérivé du
  // conteneur (option/button) est préservé.
  const wrapperClasses = $derived(
    [
      "st-navItem",
      `st-navItem--depth${safeDepth}`,
      status !== "neutral" ? `st-navItem--status-${status}` : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  // Indentation de profondeur : un CSS var additif sur le wrapper, à fallback
  // littéral par palier (aucun hex). SelectableRow ne forwarde pas `style` ; on
  // pose donc la var sur le wrapper et la rangée hérite via la cascade.
  const depthStyle = $derived(
    `--st-navItem-indent: var(--st-component-navItem-depth${safeDepth}-indent, ${
      ["0rem", "0.75rem", "1.5rem", "2.25rem"][safeDepth]
    });`
  );

</script>

<!-- Snippet de caption déclaré HORS de SelectableRow : il n'est passé en prop
     `caption` QUE lorsque `caption` est fournie, pour préserver l'invariant
     byte-identité de SelectableRow (sans caption → rangée single-line). -->
{#snippet captionSnippet()}
  <span class="st-navItem__caption">{caption}</span>
{/snippet}

<div class={wrapperClasses} style={depthStyle}>
  <SelectableRow
    bind:selected
    {value}
    {disabled}
    role={href ? "link" : undefined}
    caption={caption ? captionSnippet : undefined}
  >
    {#snippet leading()}
      {#if leading}
        {@render leading()}
      {:else if swatch}
        <!-- Tête : ColorSwatch pour une couleur arbitraire, sinon StatusDot pour
             un ton sémantique. Décoratif → aria géré par la primitive. -->
        {#if swatch.color}
          <ColorSwatch color={swatch.color} shape={swatch.shape ?? "square"} size={14} />
        {:else}
          <StatusDot tone={swatch.tone ?? "neutral"} size={8} />
        {/if}
      {/if}
    {/snippet}

    {#snippet children()}
      <span class="st-navItem__title">{title}</span>
    {/snippet}

    {#snippet trailing()}
      {#if trailing}
        {@render trailing()}
      {:else if count != null}
        <!-- Queue : bulle de compte. Badge shape="circle" size="sm" (tabular-nums),
             ton sémantique aligné sur le `status` de la rangée. aria-label explicite. -->
        <Badge shape="circle" size="sm" tone={badgeTone} aria-label={countLabel}>
          {count}
        </Badge>
      {/if}
    {/snippet}
  </SelectableRow>

  {#if divider}
    <!-- Séparateur token-only APRÈS la rangée (anatomie de liste de nav). -->
    <hr class="st-navItem__divider" aria-hidden="true" />
  {/if}
</div>

<style>
  .st-navItem {
    display: block;
    inline-size: 100%;
  }

  /* Indentation de PROFONDEUR : décale la rangée SelectableRow (sa tête comprise)
     par un padding inline-start ADDITIF à son padding de base (0.75rem). On cible
     la rangée via :global car c'est le DOM de SelectableRow (composé, pas inline).
     La var --st-navItem-indent est posée sur le wrapper et héritée par cascade. */
  .st-navItem :global(.st-selectableRow) {
    padding-inline-start: calc(0.75rem + var(--st-navItem-indent, 0rem));
  }

  /* Échelle typographique : la graisse ET la taille DÉCROISSENT avec la
     profondeur, pour que la hiérarchie se lise sans relief de couleur. Le wrapper
     et le titre sont tous deux NavItem-authored (scope identique) → pas de
     :global nécessaire. Chaque token retombe sur un littéral → thème silencieux =
     byte-identique. */
  .st-navItem--depth0 .st-navItem__title {
    font-size: var(--st-component-navItem-depth0-fontSize, 0.875rem);
    font-weight: var(--st-component-navItem-depth0-fontWeight, 600);
  }
  .st-navItem--depth1 .st-navItem__title {
    font-size: var(--st-component-navItem-depth1-fontSize, 0.8125rem);
    font-weight: var(--st-component-navItem-depth1-fontWeight, 500);
  }
  .st-navItem--depth2 .st-navItem__title {
    font-size: var(--st-component-navItem-depth2-fontSize, 0.8125rem);
    font-weight: var(--st-component-navItem-depth2-fontWeight, 400);
  }
  /* L3 — muted : même métrique que L2, couleur atténuée. */
  .st-navItem--depth3 .st-navItem__title {
    font-size: var(--st-component-navItem-depth3-fontSize, 0.8125rem);
    font-weight: var(--st-component-navItem-depth3-fontWeight, 400);
    color: var(--st-component-navItem-depth3-color, var(--st-semantic-text-muted));
  }

  .st-navItem__title {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-navItem__caption {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Ton sémantique de la RANGÉE : teinte le titre par le feedback correspondant.
     Un « HTTP 403 » error devient rouge sémantique réel. Chaque ton retombe sur
     son token --st-semantic-feedback-*. */
  .st-navItem--status-info .st-navItem__title {
    color: var(--st-component-navItem-status-info, var(--st-semantic-feedback-info));
  }
  .st-navItem--status-success .st-navItem__title {
    color: var(--st-component-navItem-status-success, var(--st-semantic-feedback-success));
  }
  .st-navItem--status-warning .st-navItem__title {
    color: var(--st-component-navItem-status-warning, var(--st-semantic-feedback-warning));
  }
  .st-navItem--status-error .st-navItem__title {
    color: var(--st-component-navItem-status-error, var(--st-semantic-feedback-error));
  }

  /* Séparateur token-only : une fine règle pleine largeur après la rangée. */
  .st-navItem__divider {
    border: 0;
    border-top: var(--st-border-width-thin, 1px) solid
      var(--st-component-navItem-dividerColor, var(--st-semantic-border-subtle, rgba(0, 0, 0, 0.08)));
    margin-block: var(--st-component-navItem-dividerGap, 0.375rem);
  }
</style>
