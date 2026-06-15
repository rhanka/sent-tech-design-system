<script lang="ts" module>
  import type { Snippet } from "svelte";

  /** Hiérarchie ENCODÉE DANS LE TYPE : une seule action `primary` est légitime
   * dans une pile. `secondary` = action secondaire ; `ghost` = action discrète.
   * La couleur sémantique (danger) n'est PAS un `kind` — elle vit dans
   * `dangerZone`, rendue à part. Le mauvais chemin (4 « primaires » arc-en-ciel)
   * devient ainsi impossible à exprimer proprement. */
  export type NavActionKind = "primary" | "secondary" | "ghost";

  export type NavAction = {
    label: string;
    icon?: Snippet;
    onClick?: () => void;
    href?: string;
    kind?: NavActionKind;
    disabled?: boolean;
  };

  /** Action destructrice, isolée sous un séparateur + un overline « Zone
   * sensible ». Toujours en ton danger, jamais alignée avec les actions
   * normales. Pas de `kind` : c'est une zone, pas une catégorie de couleur. */
  export type NavActionDangerZone = {
    label: string;
    icon?: Snippet;
    onClick?: () => void;
    href?: string;
  };

  export type NavActionStackOrientation = "vertical" | "horizontal";
</script>

<script lang="ts">
  // NavActionStack — empile des actions en ENCODANT la hiérarchie dans le type.
  // Au plus UN `kind:"primary"` (les suivants sont dégradés en secondary +
  // console.warn). La couleur sémantique « danger » n'est pas détournée en
  // catégorie : la `dangerZone` est rendue séparément, sous un Divider + un
  // overline, en ton danger pleine largeur. Réutilise le Button du DS — aucun
  // bouton n'est réimplémenté. Style token-only scopé, aucun hex en dur.
  import Button from "./Button.svelte";
  import Divider from "./Divider.svelte";

  type NavActionStackProps = {
    actions?: NavAction[];
    dangerZone?: NavActionDangerZone;
    /** Libellé de l'overline de la zone sensible. Défaut « Zone sensible ». */
    dangerLabel?: string;
    orientation?: NavActionStackOrientation;
    /** Étiquette a11y du groupe d'actions. */
    label?: string;
    class?: string;
  };

  let {
    actions = [],
    dangerZone,
    dangerLabel = "Zone sensible",
    orientation = "vertical",
    label = "Actions",
    class: className
  }: NavActionStackProps = $props();

  // La règle (un seul primary) appliquée AU RUNTIME en miroir du type : on garde
  // le premier `primary`, on dégrade les suivants en `secondary` et on prévient.
  const normalizedActions = $derived.by(() => {
    let primarySeen = false;
    return actions.map((action) => {
      const kind: NavActionKind = action.kind ?? "secondary";
      if (kind === "primary") {
        if (primarySeen) {
          console.warn(
            `[NavActionStack] Plusieurs actions « primary » fournies — « ${action.label} » dégradée en « secondary ». Une pile n'a qu'une action primaire.`
          );
          return { ...action, kind: "secondary" as NavActionKind };
        }
        primarySeen = true;
      }
      return { ...action, kind };
    });
  });

  // kind → variant Button : primary→primary, secondary→secondary, ghost→ghost.
  const variantFor = (kind: NavActionKind): "primary" | "secondary" | "ghost" =>
    kind;

  const rootClasses = $derived(
    ["st-navActionStack", `st-navActionStack--${orientation}`, className]
      .filter(Boolean)
      .join(" ")
  );
</script>

<div class={rootClasses} role="group" aria-label={label}>
  <div class="st-navActionStack__actions">
    {#each normalizedActions as action (action.label)}
      {#if action.href && !action.disabled}
        <!-- Action-lien : porte les classes Button (réutilisation du style, pas
             de réimplémentation de la logique bouton). -->
        <a
          class="st-button st-button--{variantFor(action.kind)} st-button--md st-navActionStack__item"
          href={action.href}
          onclick={action.onClick}
        >
          {@render action.icon?.()}
          {action.label}
        </a>
      {:else}
        <Button
          variant={variantFor(action.kind)}
          disabled={action.disabled}
          onclick={action.onClick}
          class="st-navActionStack__item"
        >
          {@render action.icon?.()}
          {action.label}
        </Button>
      {/if}
    {/each}
  </div>

  {#if dangerZone}
    <!-- Zone sensible : SÉPARÉE des actions normales par un Divider, coiffée d'un
         overline token-only, rendue en ton danger pleine largeur. Jamais alignée
         avec la pile au-dessus. -->
    <div class="st-navActionStack__danger" role="group" aria-label={dangerLabel}>
      <Divider />
      <span class="st-navActionStack__dangerLabel">{dangerLabel}</span>
      {#if dangerZone.href}
        <a
          class="st-button st-button--danger st-button--md st-navActionStack__item st-navActionStack__dangerAction"
          href={dangerZone.href}
          onclick={dangerZone.onClick}
        >
          {@render dangerZone.icon?.()}
          {dangerZone.label}
        </a>
      {:else}
        <Button
          variant="danger"
          onclick={dangerZone.onClick}
          class="st-navActionStack__item st-navActionStack__dangerAction"
        >
          {@render dangerZone.icon?.()}
          {dangerZone.label}
        </Button>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Token-only scopé. Vertical = pile pleine largeur (chaque action prend toute
     la largeur) ; horizontal = rangée (boutons à leur largeur naturelle). */
  .st-navActionStack {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
    inline-size: 100%;
  }

  .st-navActionStack__actions {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-navActionStack--vertical .st-navActionStack__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .st-navActionStack--horizontal .st-navActionStack__actions {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  /* Pleine largeur en pile verticale ; largeur naturelle en rangée. */
  .st-navActionStack--vertical :global(.st-navActionStack__item) {
    inline-size: 100%;
  }

  .st-navActionStack__danger {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-navActionStack__dangerLabel {
    color: var(--st-component-overline-color, var(--st-semantic-text-secondary, inherit));
    display: inline-block;
    font-size: var(--st-component-overline-fontSize, 0.6875rem);
    font-weight: var(--st-component-overline-fontWeight, 600);
    letter-spacing: var(--st-component-overline-letterSpacing, 0.04em);
    line-height: var(--st-component-overline-lineHeight, 1.3);
    text-transform: var(--st-component-overline-textTransform, uppercase);
  }

  /* La zone sensible est pleine largeur quelle que soit l'orientation : c'est une
     zone à part, pas un item de la rangée. */
  .st-navActionStack :global(.st-navActionStack__dangerAction) {
    inline-size: 100%;
  }
</style>
