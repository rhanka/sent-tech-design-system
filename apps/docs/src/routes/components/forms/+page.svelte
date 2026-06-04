<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      showcaseTitle: "Showcase des primitives de formulaire",
      showcaseIntro:
        "Cette page couvre les états clés des contrôles du DS: défaut, désactivé, erreur et variantes principales.",
      inputSection: "Input",
      textareaSection: "Textarea",
      selectSection: "Select",
      checkboxSection: "Checkbox",
      radioSection: "Radio",
      switchSection: "Switch",
      alertSection: "Alert",
      defaultState: "Défaut",
      disabledState: "Désactivé",
      errorState: "Erreur",
      validState: "Valide",
      variants: "Variantes",
      noDedicatedValid: "Aucun etat/prop \"valid\" dedie dans l'API courante; l'absence d'erreur reste l'etat valide.",
      sizeVariants: "Input / Select: sm, md, lg",
      alertTones: "Alert: info, success, warning, error",
      notePrefix: "Note:",
      noteAlert: "Alert ne supporte pas d’état disabled ni de message inline lié au contrôle."
    },
    en: {
      showcaseTitle: "Form primitives showcase",
      showcaseIntro:
        "This page covers core visual states for form primitives: default, disabled, error and supported variants.",
      inputSection: "Input",
      textareaSection: "Textarea",
      selectSection: "Select",
      checkboxSection: "Checkbox",
      radioSection: "Radio",
      switchSection: "Switch",
      alertSection: "Alert",
      defaultState: "Default",
      disabledState: "Disabled",
      errorState: "Error",
      validState: "Valid",
      variants: "Variants",
      noDedicatedValid: "There is no dedicated \"valid\" prop in the current API; a non-error state is the valid baseline.",
      sizeVariants: "Input / Select: sm, md, lg",
      alertTones: "Alert: info, success, warning, error",
      notePrefix: "Note:",
      noteAlert: "Alert does not support a disabled state or inline message text by itself."
    }
  } as const;

  const text = () => copy[locale.value];

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »). Les sous-titres
  // d'état sont portés par des <h3> neutres au sein de la pile pour préserver la
  // structure entre frameworks. Les contrôles natifs restent interactifs localement.
  const h3 = (label: string): NodeSpec => ({ el: "h3", children: [label] });
  const stack = (children: NodeSpec[]): NodeSpec => ({
    el: "div",
    props: { class: "docs-demo-stack" },
    children
  });

  const tenantOptions = [
    { value: "", label: "Select a tenant" },
    { value: "forge", label: "Forge" },
    { value: "entropic", label: "Entropic" },
    { value: "graphify", label: "Graphify" }
  ];

  const inputStatesDemo = $derived<NodeSpec[]>([
    stack([
      h3(text().defaultState),
      { comp: "Input", props: { label: "Project title", placeholder: "Sent Tech Forge" } },
      h3(text().disabledState),
      { comp: "Input", props: { label: "Project title", placeholder: "Read-only", disabled: true } },
      h3(text().errorState),
      { comp: "Input", props: { label: "Contact email", placeholder: "user@domain", invalid: true, errorText: "Invalid email address" } },
      h3(text().validState),
      { comp: "Input", props: { label: "Workspace slug", value: "forge-playground", helperText: text().noDedicatedValid } }
    ])
  ]);

  const inputVariantsDemo = $derived<NodeSpec[]>([
    stack([
      h3(text().variants),
      { comp: "Input", props: { label: "Small", size: "sm", placeholder: "sm" } },
      { comp: "Input", props: { label: "Medium", size: "md", placeholder: "md" } },
      { comp: "Input", props: { label: "Large", size: "lg", placeholder: "lg" } }
    ])
  ]);

  const textareaDemo = $derived<NodeSpec[]>([
    stack([
      h3(text().defaultState),
      { comp: "Textarea", props: { label: "Description", placeholder: "Short operational context" } },
      h3(text().disabledState),
      { comp: "Textarea", props: { label: "Archived description", placeholder: "Read only note", disabled: true } },
      h3(text().errorState),
      { comp: "Textarea", props: { label: "Feedback", rows: 4, invalid: true, errorText: "Feedback is required before submission" } },
      h3(text().validState),
      { comp: "Textarea", props: { label: "Summary", value: "Resolved within bounds.", helperText: text().noDedicatedValid } }
    ])
  ]);

  const selectStatesDemo = $derived<NodeSpec[]>([
    stack([
      h3(text().defaultState),
      { comp: "Select", props: { label: "Tenant", options: tenantOptions } },
      h3(text().disabledState),
      { comp: "Select", props: { label: "Tenant", disabled: true, options: tenantOptions } },
      h3(text().errorState),
      { comp: "Select", props: { label: "Tenant", invalid: true, errorText: "Tenant is required", options: tenantOptions } },
      h3(text().validState),
      { comp: "Select", props: { label: "Tenant", options: [{ value: "forge", label: "Forge" }, { value: "entropic", label: "Entropic" }] } }
    ])
  ]);

  const selectVariantsDemo = $derived<NodeSpec[]>([
    stack([
      h3(text().variants),
      { comp: "Select", props: { label: "Small", size: "sm", options: [{ value: "sm", label: "sm" }] } },
      { comp: "Select", props: { label: "Medium", size: "md", options: [{ value: "md", label: "md" }] } },
      { comp: "Select", props: { label: "Large", size: "lg", options: [{ value: "lg", label: "lg" }] } }
    ])
  ]);

  const checkboxDemo = $derived<NodeSpec[]>([
    stack([
      h3(text().defaultState),
      { comp: "Checkbox", props: { label: "Enable workspace templates", helperText: "Default state" } },
      h3(text().disabledState),
      { comp: "Checkbox", props: { label: "Enable workspace templates", disabled: true, helperText: "Disabled checkbox" } },
      h3(text().errorState),
      { comp: "Checkbox", props: { label: "Enable workspace templates", invalid: true, helperText: "Conflicts with policy" } },
      h3(text().validState),
      { comp: "Checkbox", props: { label: "Enable workspace templates", checked: true, helperText: text().noDedicatedValid } }
    ])
  ]);

  const radioDemo = $derived<NodeSpec[]>([
    stack([
      h3(text().defaultState),
      { comp: "Radio", props: { label: "Primary runtime", name: "runtime-default", checked: true } },
      { comp: "Radio", props: { label: "Secondary runtime", name: "runtime-default" } },
      h3(text().disabledState),
      { comp: "Radio", props: { label: "Primary runtime", name: "runtime-disabled", disabled: true } },
      { comp: "Radio", props: { label: "Secondary runtime", name: "runtime-disabled", disabled: true } },
      h3(text().errorState),
      { comp: "Radio", props: { label: "Primary runtime", name: "runtime-error", invalid: true } },
      { comp: "Radio", props: { label: "Secondary runtime", name: "runtime-error" } },
      h3(text().validState),
      { comp: "Radio", props: { label: "Primary runtime", name: "runtime-valid", checked: true, helperText: text().noDedicatedValid } }
    ])
  ]);

  const switchDemo = $derived<NodeSpec[]>([
    stack([
      h3(text().defaultState),
      { comp: "Switch", props: { label: "Notifications", helperText: "Default state" } },
      h3(text().disabledState),
      { comp: "Switch", props: { label: "Notifications", disabled: true, helperText: "Disabled switch" } },
      h3(text().validState),
      { comp: "Switch", props: { label: "Notifications", checked: true, helperText: text().noDedicatedValid } }
    ])
  ]);

  const alertDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Alert", props: { title: "Info", message: "Default alert state." } },
        { comp: "Alert", props: { tone: "success", title: "Success", message: text().validState } },
        { comp: "Alert", props: { tone: "warning", title: "Warning", message: "Warning state for confirmation flows." } },
        { comp: "Alert", props: { tone: "error", title: "Error", message: text().errorState } }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Famille · Formulaires</p>
    <div class="docs-hero-title">
      <h1>{text().showcaseTitle}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().showcaseIntro}</p>
    <p>{text().sizeVariants}</p>
    <p>{text().alertTones}</p>
  </section>

  <section class="docs-section">
    <h2>{text().inputSection}</h2>
    <FrameworkDemo nodes={inputStatesDemo} label={text().inputSection} />
    <FrameworkDemo nodes={inputVariantsDemo} label={text().variants} />
  </section>

  <section class="docs-section">
    <h2>{text().textareaSection}</h2>
    <FrameworkDemo nodes={textareaDemo} label={text().textareaSection} />
  </section>

  <section class="docs-section">
    <h2>{text().selectSection}</h2>
    <FrameworkDemo nodes={selectStatesDemo} label={text().selectSection} />
    <FrameworkDemo nodes={selectVariantsDemo} label={text().variants} />
    <p class="docs-note">
      {text().notePrefix} {text().noDedicatedValid}
    </p>
  </section>

  <section class="docs-section">
    <h2>{text().checkboxSection}</h2>
    <FrameworkDemo nodes={checkboxDemo} label={text().checkboxSection} />
  </section>

  <section class="docs-section">
    <h2>{text().radioSection}</h2>
    <FrameworkDemo nodes={radioDemo} label={text().radioSection} />
  </section>

  <section class="docs-section">
    <h2>{text().switchSection}</h2>
    <FrameworkDemo nodes={switchDemo} label={text().switchSection} />
  </section>

  <section class="docs-section">
    <h2>{text().alertSection}</h2>
    <FrameworkDemo nodes={alertDemo} label={text().alertSection} />
    <p class="docs-note">
      {text().notePrefix} {text().noteAlert}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Component</th>
          <th>Supported states</th>
          <th>Variants</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><code>Input</code></td><td>default, disabled, error</td><td>sm / md / lg</td></tr>
        <tr><td><code>Textarea</code></td><td>default, disabled, error</td><td>n/a</td></tr>
        <tr><td><code>Select</code></td><td>default, disabled, error</td><td>sm / md / lg</td></tr>
        <tr><td><code>Checkbox</code></td><td>default, disabled, error (via <code>invalid</code>)</td><td>n/a</td></tr>
        <tr><td><code>Radio</code></td><td>default, disabled, error (via <code>invalid</code>)</td><td>n/a</td></tr>
        <tr><td><code>Switch</code></td><td>default, disabled</td><td>n/a</td></tr>
        <tr><td><code>Alert</code></td><td>default, success, warning, error</td><td>tone</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-component-control-background</code></li>
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-invalidBorder</code></li>
      <li><code>--st-component-control-disabledBackground</code></li>
      <li><code>--st-component-selection-switchTrackChecked</code></li>
      <li><code>--st-component-alert-infoBorder</code></li>
      <li><code>--st-component-alert-successBorder</code></li>
      <li><code>--st-component-alert-warningBorder</code></li>
      <li><code>--st-component-alert-errorBorder</code></li>
    </ul>
  </section>
</div>

<style>
  .docs-note {
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.875rem;
    margin: 0;
  }

  /* Les sous-titres d'état sont désormais rendus dans .docs-example (markup global
     porté par FrameworkDemo) : on cible donc en :global. */
  :global(.docs-page .docs-example h3) {
    font-size: 0.9rem;
    margin: 0;
  }
</style>
