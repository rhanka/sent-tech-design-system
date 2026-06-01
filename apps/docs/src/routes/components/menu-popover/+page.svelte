<script lang="ts">
  import {
    Badge,
    Menu,
    MenuPopover,
    MenuTriggerButton
  } from "@sentropic/design-system-svelte";
  import { Archive, Copy, Pencil, Share2, Trash2 } from "@lucide/svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let actionsTrigger: HTMLElement | null = $state(null);
  let actionsOpen = $state(false);
  let lastAction = $state<string | null>(null);

  let bottomStartTrigger: HTMLElement | null = $state(null);
  let bottomEndTrigger: HTMLElement | null = $state(null);
  let topStartTrigger: HTMLElement | null = $state(null);
  let topEndTrigger: HTMLElement | null = $state(null);
  let bottomStartOpen = $state(false);
  let bottomEndOpen = $state(false);
  let topStartOpen = $state(false);
  let topEndOpen = $state(false);

  const actionItems = [
    { kind: "group" as const, label: fr("Édition", "Edit") },
    { label: fr("Éditer", "Edit"), value: "edit", icon: Pencil },
    { label: fr("Dupliquer", "Duplicate"), value: "duplicate", icon: Copy },
    { kind: "divider" as const },
    { kind: "group" as const, label: fr("Distribuer", "Distribute") },
    { label: fr("Partager", "Share"), value: "share", icon: Share2 },
    { label: fr("Archiver", "Archive"), value: "archive", icon: Archive },
    { kind: "divider" as const },
    { label: fr("Supprimer", "Delete"), value: "delete", icon: Trash2, danger: true }
  ];

  function selectAction(value: string) {
    lastAction = value;
    actionsOpen = false;
  }

  const placementItems = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C", value: "c" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Overlay", "Component · Overlay")}</p>
    <div class="docs-hero-title">
      <h1>MenuPopover</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Panneau flottant ancré à un déclencheur externe, positionné en absolu d'après le rectangle du déclencheur. Il gère le placement, la fermeture au clic extérieur et sur Escape, et recalcule sa position au scroll et au resize. Combiné à MenuTriggerButton + Menu, il forme un menu d'actions ancré complet.",
        "Floating panel anchored to an external trigger, absolutely positioned from the trigger's bounding rectangle. It manages placement, outside-click and Escape close, and recomputes position on scroll and resize. Combined with MenuTriggerButton + Menu, it forms a complete anchored actions menu."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Ancrer un Menu (ou tout contenu) à un bouton, avec fermeture extérieure et Escape intégrées.", "Anchor a Menu (or any content) to a button, with built-in outside-click and Escape close.")}</li>
      <li>{fr("Quand le déclencheur et le panneau ne partagent pas le même parent positionné.", "When the trigger and the panel do not share the same positioned parent.")}</li>
      <li>{fr("Pour un détail simple inline sans ancrage externe, préférez Popover.", "For simple inline detail without external anchoring, prefer Popover.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand ne pas l'utiliser", "When not to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour une décision bloquante : utilisez Modal.", "For a blocking decision: use Modal.")}</li>
      <li>{fr("Pour un workflow secondaire long : utilisez Drawer.", "For a long secondary workflow: use Drawer.")}</li>
      <li>{fr("Pour un menu de débordement clé en main : OverflowMenu intègre déjà déclencheur et panneau.", "For a turnkey overflow menu: OverflowMenu already bundles trigger and panel.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label="MenuTriggerButton + MenuPopover + Menu">
      <div class="docs-mp-anchor" bind:this={actionsTrigger}>
        <MenuTriggerButton
          aria-label={fr("Ouvrir le menu d'actions", "Open actions menu")}
          expanded={actionsOpen}
          onclick={() => (actionsOpen = !actionsOpen)}
        />
      </div>
      <MenuPopover
        bind:open={actionsOpen}
        trigger={actionsTrigger}
        placement="bottom-start"
        label={fr("Actions", "Actions")}
      >
        <Menu label={fr("Actions", "Actions")} items={actionItems} onselect={selectAction} />
      </MenuPopover>
      <p class="docs-demo-note">
        {fr("Dernière action", "Last action")} : <code>{lastAction ?? fr("Aucune", "None")}</code>
      </p>
    </div>

    <div class="docs-example docs-mp-placements" aria-label="Placements">
      <div class="docs-mp-row">
        <div class="docs-mp-anchor" bind:this={bottomStartTrigger}>
          <MenuTriggerButton
            aria-label="bottom-start"
            expanded={bottomStartOpen}
            onclick={() => (bottomStartOpen = !bottomStartOpen)}
          />
        </div>
        <MenuPopover
          bind:open={bottomStartOpen}
          trigger={bottomStartTrigger}
          placement="bottom-start"
          label="bottom-start"
        >
          <Menu label="bottom-start" items={placementItems} />
        </MenuPopover>
        <code>bottom-start</code>
      </div>

      <div class="docs-mp-row">
        <div class="docs-mp-anchor" bind:this={bottomEndTrigger}>
          <MenuTriggerButton
            aria-label="bottom-end"
            expanded={bottomEndOpen}
            onclick={() => (bottomEndOpen = !bottomEndOpen)}
          />
        </div>
        <MenuPopover
          bind:open={bottomEndOpen}
          trigger={bottomEndTrigger}
          placement="bottom-end"
          label="bottom-end"
        >
          <Menu label="bottom-end" items={placementItems} />
        </MenuPopover>
        <code>bottom-end</code>
      </div>

      <div class="docs-mp-row">
        <div class="docs-mp-anchor" bind:this={topStartTrigger}>
          <MenuTriggerButton
            aria-label="top-start"
            expanded={topStartOpen}
            onclick={() => (topStartOpen = !topStartOpen)}
          />
        </div>
        <MenuPopover
          bind:open={topStartOpen}
          trigger={topStartTrigger}
          placement="top-start"
          label="top-start"
        >
          <Menu label="top-start" items={placementItems} />
        </MenuPopover>
        <code>top-start</code>
      </div>

      <div class="docs-mp-row">
        <div class="docs-mp-anchor" bind:this={topEndTrigger}>
          <MenuTriggerButton
            aria-label="top-end"
            expanded={topEndOpen}
            onclick={() => (topEndOpen = !topEndOpen)}
          />
        </div>
        <MenuPopover
          bind:open={topEndOpen}
          trigger={topEndTrigger}
          placement="top-end"
          label="top-end"
        >
          <Menu label="top-end" items={placementItems} />
        </MenuPopover>
        <code>top-end</code>
      </div>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Déclencheur : élément externe référencé par la prop trigger (HTMLElement).", "Trigger: external element referenced by the trigger prop (HTMLElement).")}</li>
      <li>{fr("Panneau (.st-menuPopover, role=\"dialog\") : surface flottante positionnée en absolu.", "Panel (.st-menuPopover, role=\"dialog\"): floating surface, absolutely positioned.")}</li>
      <li>{fr("Contenu : fourni via children, typiquement un Menu dont il partage la surface visuelle.", "Content: supplied via children, typically a Menu whose visual surface it shares.")}</li>
      <li>{fr("Modificateurs de placement (--bottom-start, --top-end…) et d'alignement (--alignEnd, --alignCenter).", "Placement modifiers (--bottom-start, --top-end…) and alignment ones (--alignEnd, --alignCenter).")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le panneau a role=\"dialog\" et un aria-label fourni par la prop label.", "The panel has role=\"dialog\" and an aria-label supplied by the label prop.")}</li>
      <li>{fr("closeOnEscape ferme sur Escape ; closeOnOutside ferme au clic ou pointeur extérieur.", "closeOnEscape closes on Escape; closeOnOutside closes on outside click or pointer.")}</li>
      <li>{fr("Câblez aria-haspopup et aria-expanded sur le déclencheur (MenuTriggerButton le fait via expanded).", "Wire aria-haspopup and aria-expanded on the trigger (MenuTriggerButton does it via expanded).")}</li>
      <li>{fr("La détection du clic extérieur traverse le shadow DOM via composedPath.", "Outside-click detection traverses the shadow DOM via composedPath.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Lier le déclencheur au panneau via la même variable open (bind:open).", "Link the trigger and panel via the same open variable (bind:open).")}</li>
          <li>{fr("Choisir le placement selon l'espace disponible autour du déclencheur.", "Choose the placement based on the space available around the trigger.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Oublier de fournir un trigger : le positionnement en dépend.", "Forget to provide a trigger: positioning relies on it.")}</li>
          <li>{fr("Y loger un long workflow : préférez Drawer ou une page.", "Host a long workflow: prefer Drawer or a page.")}</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{fr("Défaut", "Default")}</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>open</code></td><td><code>boolean</code> ({fr("bindable", "bindable")})</td><td><code>false</code></td><td>{fr("Affiche le panneau.", "Renders the panel.")}</td></tr>
        <tr><td><code>trigger</code></td><td><code>HTMLElement | null</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Élément servant d'ancre au positionnement.", "Element used to anchor positioning.")}</td></tr>
        <tr><td><code>placement</code></td><td><code>"bottom-start" | "bottom-end" | "top-start" | "top-end"</code></td><td><code>"bottom-start"</code></td><td>{fr("Position du panneau par rapport au déclencheur.", "Panel position relative to the trigger.")}</td></tr>
        <tr><td><code>align</code></td><td><code>"start" | "end" | "center"</code></td><td><em>{fr("dérivé du placement", "derived from placement")}</em></td><td>{fr("Surcharge l'alignement horizontal.", "Overrides horizontal alignment.")}</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("aria-label du panneau.", "aria-label of the panel.")}</td></tr>
        <tr><td><code>closeOnOutside</code></td><td><code>boolean</code></td><td><code>true</code></td><td>{fr("Ferme au clic/pointeur extérieur.", "Closes on outside click/pointer.")}</td></tr>
        <tr><td><code>closeOnEscape</code></td><td><code>boolean</code></td><td><code>true</code></td><td>{fr("Ferme sur Escape.", "Closes on Escape.")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Contenu du panneau.", "Panel content.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le panneau.", "Class(es) on the panel.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLDivElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur le <div> panneau.", "Spread onto the <div> panel.")}</td></tr>
      </tbody>
    </table>
    <p>
      {fr(
        "Le composant se positionne en absolu via getBoundingClientRect() sur le déclencheur et recalcule sa position lors du scroll et du resize de la fenêtre.",
        "The component positions itself absolutely via getBoundingClientRect() on the trigger and recomputes its position on window scroll and resize."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-menu-background</code></li>
      <li><code>--st-component-menu-border</code></li>
      <li><code>--st-component-menu-radius</code></li>
      <li><code>--st-component-menu-text</code></li>
      <li><code>--st-component-menu-shadow</code></li>
      <li><code>--st-component-menu-minWidth</code></li>
      <li><code>--st-component-menu-maxWidth</code></li>
      <li><code>--st-component-popover-zIndex</code></li>
    </ul>
  </section>
</div>

<style>
  .docs-mp-anchor {
    display: inline-flex;
  }

  .docs-mp-placements {
    display: grid;
    gap: 1rem;
  }

  .docs-mp-row {
    align-items: center;
    display: flex;
    gap: 0.75rem;
  }
</style>
