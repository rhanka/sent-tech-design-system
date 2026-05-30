<script lang="ts">
  import { Badge, Switch } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Formulaire", "Component · Form")}</p>
    <h1>
      Switch
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>
      {fr(
        "Interrupteur on/off pour un réglage appliqué immédiatement. Case <input type=\"checkbox\" role=\"switch\"> avec piste et pastille, libellé à droite et texte d'aide optionnel.",
        "On/off switch for an immediately applied setting. Native <input type=\"checkbox\" role=\"switch\"> with a track and thumb, label on the right, and optional helper text."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Activer/désactiver un réglage qui prend effet immédiatement (sans Enregistrer).", "Turn a setting on/off that takes effect immediately (no Save).")}</li>
      <li>{fr("Pour un choix validé plus tard avec le formulaire, préférez Checkbox.", "For a choice committed later with the form, prefer Checkbox.")}</li>
      <li>{fr("Switch (avec label intégré à droite) vs Toggle (avec libellé d'état On/Off) selon le besoin.", "Switch (label on the right) vs Toggle (with On/Off state caption) depending on the need.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "states")}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{fr("Désactivé / activé (off / on)", "Off / on")}</h3>
      <Switch label={fr("Notifications", "Notifications")} />
      <Switch label={fr("Notifications", "Notifications")} checked />
      <h3>{fr("Avec texte d'aide", "With helper text")}</h3>
      <Switch
        label={fr("Mode sombre", "Dark mode")}
        helperText={fr("S'applique immédiatement à toute l'interface.", "Applies immediately across the interface.")}
      />
      <h3>{fr("Désactivé (non interactif)", "Disabled (non-interactive)")}</h3>
      <Switch label={fr("Verrouillé", "Locked")} disabled />
      <Switch label={fr("Verrouillé (on)", "Locked (on)")} checked disabled />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Élément racine : un <label> englobant (classe st-switch).", "Root element: a wrapping <label> (class st-switch).")}</li>
      <li>{fr("Piste (.st-switch__track) + pastille (.st-switch__thumb), purement visuelles (aria-hidden).", "Track (.st-switch__track) + thumb (.st-switch__thumb), purely visual (aria-hidden).")}</li>
      <li>{fr("Input natif <checkbox role=\"switch\"> superposé, qui porte l'état et le focus.", "Overlaid native <checkbox role=\"switch\"> input carrying state and focus.")}</li>
      <li>{fr("Contenu : libellé (requis) + texte d'aide optionnel.", "Content: label (required) + optional helper text.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("L'input expose role=\"switch\" et aria-checked reflète l'état.", "The input exposes role=\"switch\" and aria-checked reflects the state.")}</li>
      <li>{fr("Focusable au clavier, basculé avec Espace ; le focus est visible sur la piste.", "Keyboard-focusable, toggled with Space; focus is visible on the track.")}</li>
      <li>{fr("Piste et pastille sont aria-hidden : l'état est porté par l'input natif.", "Track and thumb are aria-hidden: state is carried by the native input.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Réserver Switch aux réglages instantanés.", "Reserve Switch for instant settings.")}</li>
          <li>{fr("Libellé décrivant ce qui est activé, pas l'état.", "Label describing what gets enabled, not the state.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Mettre un Switch dans un formulaire validé par bouton : Checkbox.", "Put a Switch in a button-committed form: use Checkbox.")}</li>
          <li>{fr("Demander une confirmation après chaque bascule.", "Require confirmation after every toggle.")}</li>
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
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Libellé visible à droite.", "Visible label on the right.")}</td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte d'aide sous le libellé.", "Helper text below the label.")}</td></tr>
        <tr><td><code>checked</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("État on/off (attribut natif).", "On/off state (native attribute).")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le <label>.", "Class(es) on the <label>.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLInputAttributes</code></td><td>—</td><td>{fr("Propagés sur l'<input> (disabled, name, onchange…).", "Spread onto the <input> (disabled, name, onchange…).")}</td></tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {fr(
        "Note : Switch lit checked en attribut natif (non bindable). Pour un état piloté avec bind:checked et une taille sm/md, utilisez le composant Toggle.",
        "Note: Switch reads checked as a native attribute (not bindable). For a state driven via bind:checked and an sm/md size, use the Toggle component."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-selection-switchTrack</code></li>
      <li><code>--st-component-selection-switchTrackChecked</code></li>
      <li><code>--st-component-selection-switchThumb</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-helpText</code></li>
    </ul>
  </section>
</div>
