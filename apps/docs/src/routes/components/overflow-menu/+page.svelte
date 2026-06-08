<script lang="ts">
  import { Badge, OverflowMenu } from "@sentropic/design-system-svelte";
  import type { OverflowMenuItem } from "@sentropic/design-system-svelte";
  import { Pencil, Copy, Share2, Trash2 } from "@lucide/svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  const copy = {
    fr: {
      intro:
        "Menu d’actions secondaires ouvert via un déclencheur compact (icône `Ellipsis`). Les items typés couvrent actions, séparateurs et libellés de groupe ; le placement contrôle la direction d’ouverture.",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`items` est une union discriminée par `kind` : `\"item\"` (défaut), `\"divider\"` et `\"group\"`. Un item action porte `value`, `label`, et optionnellement `icon`, `disabled`, `danger`, `onclick`.",
      usageNote2:
        "Quand le déclencheur est à gauche, préférez `placement=\"bottom-start\"` pour que la liste s’ouvre vers la droite (alignée à gauche du déclencheur). `bottom-end` (défaut) aligne la liste à droite.",
      usageNote3:
        "Le menu se ferme sur Escape et sur pointerdown extérieur (géré via `svelte:window`). `onselect` reçoit la `value` de l’item, après l’`onclick` de l’item.",
      usageNote4:
        "Navigation clavier : Enter/Espace/ArrowDown ouvre et focus le premier item; puis flèches Haut/Bas, Home/End et Enter/Espace pour naviguer/activer; les items désactivés sont ignorés.",
      basicLabel: "Menu de base (déclencheur à gauche, ouverture à droite)",
      placementLabel: "Placements",
      stateLabel: "Items désactivés et danger"
    },
    en: {
      intro:
        "Secondary actions menu opened from a compact trigger (`Ellipsis` icon). Typed items cover actions, dividers, and group labels; placement controls the open direction.",
      usageTitle: "Usage notes",
      usageNote1:
        "`items` is a discriminated union on `kind`: `\"item\"` (default), `\"divider\"`, and `\"group\"`. An action item carries `value`, `label`, and optionally `icon`, `disabled`, `danger`, `onclick`.",
      usageNote2:
        "When the trigger sits on the left, use `placement=\"bottom-start\"` so the list opens to the right (left-aligned to the trigger). `bottom-end` (default) right-aligns the list.",
      usageNote3:
        "The menu closes on Escape and outside pointerdown (handled via `svelte:window`). `onselect` receives the item `value`, after the item `onclick`.",
      usageNote4:
        "Keyboard support: Enter/Space/ArrowDown opens and focuses the first item, then Up/Down arrows, Home/End and Enter/Space navigate/activate (disabled items are skipped).",
      basicLabel: "Basic menu (left trigger, opens to the right)",
      placementLabel: "Placements",
      stateLabel: "Disabled and danger items"
    }
  } as const;

  const text = () => copy[locale.value];

  let lastSelected = $state("N/A");

  const rowItems: OverflowMenuItem[] = [
    { kind: "group", label: locale.value === "fr" ? "Actions" : "Actions" },
    { value: "edit", label: locale.value === "fr" ? "Modifier" : "Edit", icon: Pencil },
    { value: "duplicate", label: locale.value === "fr" ? "Dupliquer" : "Duplicate", icon: Copy },
    { kind: "divider" },
    { value: "share", label: locale.value === "fr" ? "Partager" : "Share", icon: Share2 },
    {
      value: "delete",
      label: locale.value === "fr" ? "Supprimer" : "Delete",
      icon: Trash2,
      danger: true
    }
  ];

  const stateItems: OverflowMenuItem[] = [
    { value: "open", label: locale.value === "fr" ? "Ouvrir" : "Open" },
    { value: "rename", label: locale.value === "fr" ? "Renommer" : "Rename", disabled: true },
    { kind: "divider" },
    {
      value: "remove",
      label: locale.value === "fr" ? "Supprimer définitivement" : "Delete permanently",
      danger: true
    }
  ];

  function handleSelect(value: string) {
    lastSelected = value;
  }
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · {t(locale.value, "navigation")}</p>
    <div class="docs-hero-title">
      <h1>OverflowMenu</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <FrameworkPreview example="overflowmenu" title="Aperçu live" />


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example docs-example--stack" aria-label={text().basicLabel}>
      <OverflowMenu
        items={rowItems}
        placement="bottom-start"
        label={locale.value === "fr" ? "Actions de ligne" : "Row actions"}
        triggerLabel={locale.value === "fr" ? "Plus d’actions" : "More actions"}
        onselect={handleSelect}
      />
      <p class="docs-demo-note">
        {locale.value === "fr" ? "Dernière action sélectionnée" : "Last selected action"}
        : <code>{lastSelected}</code>
      </p>
    </div>

    <div class="docs-example docs-example--stack" aria-label={text().placementLabel}>
      <OverflowMenu
        items={rowItems}
        placement="bottom-end"
        label={locale.value === "fr" ? "Aligné à droite" : "Right aligned"}
        triggerLabel={locale.value === "fr" ? "Menu (bottom-end)" : "Menu (bottom-end)"}
      />
      <OverflowMenu
        items={rowItems}
        placement="top-start"
        label={locale.value === "fr" ? "Ouverture vers le haut" : "Opens upward"}
        triggerLabel={locale.value === "fr" ? "Menu (top-start)" : "Menu (top-start)"}
      />
    </div>

    <div class="docs-example docs-example--stack" aria-label={text().stateLabel}>
      <OverflowMenu
        items={stateItems}
        placement="bottom-start"
        dense
        label={locale.value === "fr" ? "Menu dense" : "Dense menu"}
        triggerLabel={locale.value === "fr" ? "Menu dense" : "Dense menu"}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>items</code></td><td><code>OverflowMenuItem[]</code></td><td><em>{locale.value === "fr" ? "requis" : "required"}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Menu"</code></td></tr>
        <tr><td><code>open</code></td><td><code>boolean</code> (<code>$bindable</code>)</td><td><code>false</code></td></tr>
        <tr><td><code>placement</code></td><td><code>"bottom-start" | "bottom-end" | "top-start" | "top-end"</code></td><td><code>"bottom-end"</code></td></tr>
        <tr><td><code>triggerLabel</code></td><td><code>string</code></td><td><code>"More actions"</code></td></tr>
        <tr><td><code>dense</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>onselect</code></td><td><code>(value: string) =&gt; void</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td colspan="3"><em>{locale.value === "fr" ? "+ attributs HTMLDivElement transmis (...rest)" : "+ forwarded HTMLDivElement attributes (...rest)"}</em></td></tr>
      </tbody>
    </table>

    <h3>OverflowMenuItem</h3>
    <table class="docs-table">
      <thead>
        <tr><th>{locale.value === "fr" ? "Variante (kind)" : "Variant (kind)"}</th><th>{locale.value === "fr" ? "Champs" : "Fields"}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>"item"</code> ({locale.value === "fr" ? "défaut" : "default"})</td><td><code>value</code>, <code>label</code>, <code>disabled?</code>, <code>danger?</code>, <code>icon?</code>, <code>onclick?</code></td></tr>
        <tr><td><code>"divider"</code></td><td>N/A</td></tr>
        <tr><td><code>"group"</code></td><td><code>label</code></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
    <p class="docs-demo-note">{text().usageNote3}</p>
    <p class="docs-demo-note">{text().usageNote4}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-overflowMenu-triggerRadius</code></li>
      <li><code>--st-component-overflowMenu-triggerText</code></li>
      <li><code>--st-component-overflowMenu-triggerHoverBackground</code></li>
      <li><code>--st-component-overflowMenu-dangerText</code></li>
      <li><code>--st-component-overflowMenu-dangerHoverBackground</code></li>
      <li><code>--st-component-overflowMenu-dangerHoverText</code></li>
      <li><code>--st-component-menu-background</code></li>
      <li><code>--st-component-menu-border</code></li>
      <li><code>--st-component-menu-radius</code></li>
      <li><code>--st-component-menu-shadow</code></li>
      <li><code>--st-component-menu-minWidth</code></li>
      <li><code>--st-component-menu-maxWidth</code></li>
      <li><code>--st-component-menu-text</code></li>
      <li><code>--st-component-menu-itemHoverBackground</code></li>
      <li><code>--st-component-menu-disabledText</code></li>
      <li><code>--st-component-menu-groupText</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-popover-zIndex</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-surface-raised</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-semantic-action-primaryText</code></li>
      <li><code>--st-spacing-1</code></li>
      <li><code>--st-spacing-2</code></li>
      <li><code>--st-spacing-3</code></li>
      <li><code>--st-radius-small</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>
</div>
