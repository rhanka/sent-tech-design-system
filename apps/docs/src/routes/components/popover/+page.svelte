<script lang="ts">
  import { Badge, Button, Popover } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let bottomOpen = $state(false);
  let topOpen = $state(false);
  let rightOpen = $state(false);
  let leftOpen = $state(false);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Overlay", "Component · Overlay")}</p>
    <div class="docs-hero-title">
      <h1>Popover</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Surface flottante compacte ancrée à un déclencheur, pour un détail contextuel ou une mini-tâche sans bloquer le flux. Contrairement au Tooltip, son contenu peut être interactif ; contrairement au Modal, il n'assombrit pas l'arrière-plan.",
        "Compact floating surface anchored to a trigger, for contextual detail or a micro-task without blocking the flow. Unlike Tooltip, its content can be interactive; unlike Modal, it does not dim the background."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Afficher un détail riche ou interactif au clic d'un déclencheur.", "Show rich or interactive detail on a trigger click.")}</li>
      <li>{fr("Présenter une mini-tâche (sélection, réglage rapide) sans quitter l'écran.", "Present a micro-task (selection, quick setting) without leaving the screen.")}</li>
      <li>{fr("Pour un simple texte d'aide non interactif, préférez Tooltip ou Toggletip.", "For plain non-interactive help text, prefer Tooltip or Toggletip.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand ne pas l'utiliser", "When not to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour un workflow long : utilisez Drawer ou une page dédiée.", "For a long workflow: use Drawer or a dedicated page.")}</li>
      <li>{fr("Pour une décision bloquante : utilisez Modal.", "For a blocking decision: use Modal.")}</li>
      <li>{fr("Pour une liste d'actions, préférez Menu (role=\"menu\").", "For a list of actions, prefer Menu (role=\"menu\").")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Placement", "Placement")}</h2>
    <p>{fr("Le panneau s'ancre au-dessus, en dessous, à gauche ou à droite du déclencheur via placement.", "The panel anchors above, below, left, or right of the trigger via placement.")}</p>
    <div class="docs-example docs-example--stack">
      <Popover open={bottomOpen} label={fr("Détail bas", "Bottom detail")} placement="bottom">
        {#snippet trigger()}
          <Button variant="secondary" onclick={() => (bottomOpen = !bottomOpen)}>{fr("Bas (défaut)", "Bottom (default)")}</Button>
        {/snippet}
        <p>{fr("Le contenu apparaît sous le déclencheur.", "Content appears below the trigger.")}</p>
      </Popover>
      <Popover open={topOpen} label={fr("Détail haut", "Top detail")} placement="top">
        {#snippet trigger()}
          <Button variant="secondary" onclick={() => (topOpen = !topOpen)}>{fr("Haut", "Top")}</Button>
        {/snippet}
        <p>{fr("Le contenu apparaît au-dessus du déclencheur.", "Content appears above the trigger.")}</p>
      </Popover>
      <Popover open={rightOpen} label={fr("Détail droite", "Right detail")} placement="right">
        {#snippet trigger()}
          <Button variant="secondary" onclick={() => (rightOpen = !rightOpen)}>{fr("Droite", "Right")}</Button>
        {/snippet}
        <p>{fr("Le contenu apparaît à droite du déclencheur.", "Content appears to the right of the trigger.")}</p>
      </Popover>
      <Popover open={leftOpen} label={fr("Détail gauche", "Left detail")} placement="left">
        {#snippet trigger()}
          <Button variant="secondary" onclick={() => (leftOpen = !leftOpen)}>{fr("Gauche", "Left")}</Button>
        {/snippet}
        <p>{fr("Le contenu apparaît à gauche du déclencheur.", "Content appears to the left of the trigger.")}</p>
      </Popover>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Hôte (.st-popover-host) : enveloppe inline positionnée en relatif, contient le déclencheur.", "Host (.st-popover-host): inline wrapper positioned relatively, holds the trigger.")}</li>
      <li>{fr("Déclencheur : fourni via le snippet trigger ; à vous de basculer open au clic.", "Trigger: supplied via the trigger snippet; you toggle open on click.")}</li>
      <li>{fr("Panneau (.st-popover, role=\"dialog\") : surface flottante, min 16 rem de large, positionnée selon placement.", "Panel (.st-popover, role=\"dialog\"): floating surface, min 16 rem wide, positioned per placement.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le panneau a role=\"dialog\" et un aria-label fourni par la prop label.", "The panel has role=\"dialog\" and an aria-label supplied by the label prop.")}</li>
      <li>{fr("Le déclencheur doit être un élément focusable (bouton) qui bascule l'état open.", "The trigger must be a focusable element (button) that toggles the open state.")}</li>
      <li>{fr("Ajoutez aria-haspopup=\"dialog\" et aria-expanded sur le déclencheur côté hôte.", "Add aria-haspopup=\"dialog\" and aria-expanded on the trigger in the host app.")}</li>
      <li>{fr("Pour une fermeture sur Escape ou clic extérieur intégrée, voir MenuPopover.", "For built-in Escape or outside-click close, see MenuPopover.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Garder le contenu compact et focalisé sur un seul sujet.", "Keep content compact and focused on a single topic.")}</li>
          <li>{fr("Câbler aria-expanded sur le déclencheur pour refléter l'état.", "Wire aria-expanded on the trigger to reflect the state.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Y loger un workflow complet ou un long formulaire.", "Host a full workflow or a long form inside it.")}</li>
          <li>{fr("Empiler plusieurs popovers ouverts simultanément.", "Stack multiple popovers open at once.")}</li>
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
        <tr><td><code>open</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Affiche le panneau flottant.", "Renders the floating panel.")}</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("aria-label du panneau (role=\"dialog\").", "aria-label of the panel (role=\"dialog\").")}</td></tr>
        <tr><td><code>placement</code></td><td><code>"top" | "right" | "bottom" | "left"</code></td><td><code>"bottom"</code></td><td>{fr("Position du panneau par rapport au déclencheur.", "Panel position relative to the trigger.")}</td></tr>
        <tr><td><code>trigger</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Élément déclencheur, rendu dans l'hôte.", "Trigger element, rendered in the host.")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Contenu du panneau.", "Panel content.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le panneau.", "Class(es) on the panel.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur le <section> panneau.", "Spread onto the <section> panel.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-popover-background</code></li>
      <li><code>--st-component-popover-border</code></li>
      <li><code>--st-component-popover-radius</code></li>
      <li><code>--st-component-popover-text</code></li>
      <li><code>--st-component-popover-shadow</code></li>
      <li><code>--st-component-popover-zIndex</code></li>
    </ul>
  </section>
</div>
