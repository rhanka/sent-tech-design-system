<script lang="ts">
  import { Badge, Button } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let loading = $state(false);
  function fakeSubmit() {
    loading = true;
    setTimeout(() => (loading = false), 1600);
  }
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Action", "Component · Action")}</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "buttonTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "buttonIntro")}</p>
    <p>
      {fr(
        "Le Button déclenche une action immédiate dans la même page (soumettre, enregistrer, supprimer). Pour une navigation vers une autre URL, utilisez plutôt le composant Link.",
        "Button triggers an immediate action on the current page (submit, save, delete). For navigation to another URL, use the Link component instead."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Soumettre un formulaire ou confirmer un dialogue.", "Submit a form or confirm a dialog.")}</li>
      <li>{fr("Déclencher une opération (enregistrer, publier, recalculer).", "Trigger an operation (save, publish, recompute).")}</li>
      <li>{fr("Une seule action primaire par zone : hiérarchisez avec secondary / ghost.", "A single primary action per zone: rank the rest with secondary / ghost.")}</li>
      <li>{fr("Pour aller vers une page, préférez Link — pas un Button stylé en lien.", "To go to a page, prefer Link — not a Button styled as a link.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Variantes", "Variants")}</h2>
    <p>
      {fr(
        "Quatre variantes hiérarchisent l'action : primary (action principale), secondary (action de soutien), ghost (action discrète), danger (action destructive).",
        "Four variants rank actions: primary (main action), secondary (supporting action), ghost (low-emphasis action), danger (destructive action)."
      )}
    </p>
    <div class="docs-example" aria-label={t(locale.value, "variants")}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Tailles", "Sizes")}</h2>
    <p>
      {fr(
        "Trois tailles : sm (2 rem de haut, barres d'outils denses), md (2,5 rem, défaut), lg (3 rem, écrans tactiles ou hero).",
        "Three sizes: sm (2 rem tall, dense toolbars), md (2.5 rem, default), lg (3 rem, touch targets or hero CTAs)."
      )}
    </p>
    <div class="docs-example" aria-label={t(locale.value, "sizes")}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "states")}</h2>
    <p>
      {fr(
        "Le focus clavier est toujours visible (outline ou box-shadow selon le thème). L'état désactivé baisse l'opacité et bloque le pointeur.",
        "Keyboard focus is always visible (outline or box-shadow depending on theme). The disabled state lowers opacity and blocks the pointer."
      )}
    </p>
    <div class="docs-example" aria-label={fr("Désactivé par variante", "Disabled per variant")}>
      <Button disabled>Primary disabled</Button>
      <Button variant="secondary" disabled>Secondary disabled</Button>
      <Button variant="ghost" disabled>Ghost disabled</Button>
      <Button variant="danger" disabled>Danger disabled</Button>
    </div>
    <div class="docs-example" aria-label={fr("Action asynchrone", "Async action")}>
      <Button onclick={fakeSubmit} disabled={loading}>
        {loading ? fr("Enregistrement…", "Saving…") : fr("Enregistrer", "Save")}
      </Button>
      <p class="docs-demo-note">
        {fr(
          "Pendant une opération asynchrone, désactivez le bouton et changez son libellé pour signaler l'attente.",
          "During an async operation, disable the button and change its label to signal the wait."
        )}
      </p>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Types de bouton (HTML)", "Button types (HTML)")}</h2>
    <p>
      {fr(
        "Dans un formulaire, choisissez le bon type : submit envoie le formulaire, reset le réinitialise, button n'a aucun comportement implicite.",
        "Inside a form, pick the right type: submit sends the form, reset clears it, button has no implicit behavior."
      )}
    </p>
    <div class="docs-example" aria-label="Form types">
      <Button type="submit">Submit</Button>
      <Button type="reset" variant="secondary">Reset</Button>
      <Button type="button" variant="ghost">Button</Button>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Élément racine : un ", "Root element: a native ")}<code>&lt;button&gt;</code>{fr(" natif (classe st-button).", " (class st-button).")}</li>
      <li>{fr("Libellé : le contenu enfant (children), centré, avec un gap réservé pour une éventuelle icône.", "Label: the child content (children), centered, with a reserved gap for an optional icon.")}</li>
      <li>{fr("Boîte : hauteur, padding et rayon issus des tokens d'anatomie de la variante/taille.", "Box: height, padding, and radius come from the variant/size anatomy tokens.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Élément natif ", "Native ")}<code>&lt;button&gt;</code>{fr(" : focusable au clavier, activable avec Entrée et Espace.", " element: keyboard-focusable, activated with Enter and Space.")}</li>
      <li>{fr("Focus toujours visible via :focus-visible (outline 2px ou box-shadow selon le thème).", "Focus always visible via :focus-visible (2px outline or box-shadow depending on theme).")}</li>
      <li>{fr("Un bouton sans texte (icône seule) doit recevoir un aria-label — sinon utilisez IconButton.", "An icon-only button must carry an aria-label — otherwise use IconButton.")}</li>
      <li>{fr("disabled retire le bouton de l'ordre de tabulation : ne placez pas d'info essentielle uniquement dessus.", "disabled removes the button from the tab order: don't put essential information only there.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Une seule action primaire par contexte.", "One primary action per context.")}</li>
          <li>{fr("Libellés à l'impératif, orientés verbe (« Enregistrer », « Supprimer »).", "Imperative, verb-led labels (\"Save\", \"Delete\").")}</li>
          <li>{fr("Réserver danger aux actions destructives.", "Reserve danger for destructive actions.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Empiler plusieurs boutons primaires côte à côte.", "Stack several primary buttons side by side.")}</li>
          <li>{fr("Utiliser un Button pour une simple navigation de page.", "Use a Button for plain page navigation.")}</li>
          <li>{fr("Des libellés vagues comme « OK » ou « Cliquez ici ».", "Vague labels like \"OK\" or \"Click here\".")}</li>
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
        <tr><td><code>variant</code></td><td><code>"primary" | "secondary" | "ghost" | "danger"</code></td><td><code>"primary"</code></td><td>{fr("Niveau d'emphase visuelle de l'action.", "Visual emphasis level of the action.")}</td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td><td>{fr("Hauteur et densité du bouton.", "Button height and density.")}</td></tr>
        <tr><td><code>type</code></td><td><code>"button" | "submit" | "reset"</code></td><td><code>"button"</code></td><td>{fr("Type HTML natif, important dans un formulaire.", "Native HTML type, important inside a form.")}</td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Désactive le bouton et le retire du focus.", "Disables the button and removes it from focus.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) CSS supplémentaire(s).", "Additional CSS class(es).")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("libellé", "label")}</em></td><td>{fr("Contenu du bouton (texte / icône).", "Button content (text / icon).")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLButtonAttributes</code></td><td>—</td><td>{fr("Propagés sur l'élément <button> (onclick, aria-*, name…).", "Spread onto the <button> element (onclick, aria-*, name…).")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-button-primaryBackground</code></li>
      <li><code>--st-component-button-primaryText</code></li>
      <li><code>--st-component-button-secondaryBackground</code></li>
      <li><code>--st-component-button-secondaryBorder</code></li>
      <li><code>--st-component-button-anatomy-shape-radius</code></li>
      <li><code>--st-component-button-anatomy-density-md-controlHeight</code></li>
      <li><code>--st-component-button-anatomy-states-hover-bg</code></li>
      <li><code>--st-component-button-anatomy-states-disabled-opacity</code></li>
      <li><code>--st-component-button-anatomy-focus-outline</code></li>
      <li><code>--st-semantic-action-danger</code></li>
    </ul>
  </section>
</div>
