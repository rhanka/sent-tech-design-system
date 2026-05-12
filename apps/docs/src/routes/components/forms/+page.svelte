<script lang="ts">
  import {
    Alert,
    Badge,
    Checkbox,
    Input,
    Radio,
    Select,
    Switch,
    Textarea
  } from "@sent-tech/components-svelte";
  import { t, type Locale } from "$lib/i18n";

  let locale = $state<Locale>("fr");

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

  const text = () => copy[locale];
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <h1>
      {text().showcaseTitle}
      <Badge tone="success">{t(locale, "statusStable")}</Badge>
    </h1>
    <p>{text().showcaseIntro}</p>
    <p>{text().sizeVariants}</p>
    <p>{text().alertTones}</p>
  </section>

  <section class="docs-section">
    <h2>{text().inputSection}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{text().defaultState}</h3>
      <Input label="Project title" placeholder="Sent Tech Forge" />
      <h3>{text().disabledState}</h3>
      <Input label="Project title" placeholder="Read-only" disabled />
      <h3>{text().errorState}</h3>
      <Input
        label="Contact email"
        placeholder="user@domain"
        invalid
        errorText="Invalid email address"
      />
      <h3>{text().validState}</h3>
      <Input label="Workspace slug" value="forge-playground" helperText={text().noDedicatedValid} />
    </div>
    <div class="docs-example docs-example--stack">
      <h3>{text().variants}</h3>
      <Input label="Small" size="sm" placeholder="sm" />
      <Input label="Medium" size="md" placeholder="md" />
      <Input label="Large" size="lg" placeholder="lg" />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().textareaSection}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{text().defaultState}</h3>
      <Textarea label="Description" placeholder="Short operational context" />
      <h3>{text().disabledState}</h3>
      <Textarea label="Archived description" placeholder="Read only note" disabled />
      <h3>{text().errorState}</h3>
      <Textarea
        label="Feedback"
        rows={4}
        invalid
        errorText="Feedback is required before submission"
      />
      <h3>{text().validState}</h3>
      <Textarea label="Summary" value="Resolved within bounds." helperText={text().noDedicatedValid} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().selectSection}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{text().defaultState}</h3>
      <Select label="Tenant">
        <option value="">Select a tenant</option>
        <option value="forge">Forge</option>
        <option value="entropic">Entropic</option>
        <option value="graphify">Graphify</option>
      </Select>
      <h3>{text().disabledState}</h3>
      <Select label="Tenant" disabled>
        <option value="">Select a tenant</option>
        <option value="forge">Forge</option>
      </Select>
      <h3>{text().errorState}</h3>
      <Select label="Tenant" invalid errorText="Tenant is required">
        <option value="">Select a tenant</option>
        <option value="forge">Forge</option>
      </Select>
      <h3>{text().validState}</h3>
      <Select label="Tenant">
        <option value="forge">Forge</option>
        <option value="entropic">Entropic</option>
      </Select>
    </div>
    <div class="docs-example docs-example--stack">
      <h3>{text().variants}</h3>
      <Select label="Small" size="sm">
        <option>sm</option>
      </Select>
      <Select label="Medium" size="md">
        <option>md</option>
      </Select>
      <Select label="Large" size="lg">
        <option>lg</option>
      </Select>
    </div>
    <p class="docs-note">
      {text().notePrefix} {text().noDedicatedValid}
    </p>
  </section>

  <section class="docs-section">
    <h2>{text().checkboxSection}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{text().defaultState}</h3>
      <Checkbox label="Enable workspace templates" helperText="Default state" />
      <h3>{text().disabledState}</h3>
      <Checkbox label="Enable workspace templates" disabled helperText="Disabled checkbox" />
      <h3>{text().errorState}</h3>
      <Checkbox label="Enable workspace templates" invalid helperText="Conflicts with policy" />
      <h3>{text().validState}</h3>
      <Checkbox label="Enable workspace templates" checked helperText={text().noDedicatedValid} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().radioSection}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{text().defaultState}</h3>
      <Radio label="Primary runtime" name="runtime-default" checked />
      <Radio label="Secondary runtime" name="runtime-default" />
      <h3>{text().disabledState}</h3>
      <Radio label="Primary runtime" name="runtime-disabled" disabled />
      <Radio label="Secondary runtime" name="runtime-disabled" disabled />
      <h3>{text().errorState}</h3>
      <Radio label="Primary runtime" name="runtime-error" invalid />
      <Radio label="Secondary runtime" name="runtime-error" />
      <h3>{text().validState}</h3>
      <Radio
        label="Primary runtime"
        name="runtime-valid"
        checked
        helperText={text().noDedicatedValid}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().switchSection}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{text().defaultState}</h3>
      <Switch label="Notifications" helperText="Default state" />
      <h3>{text().disabledState}</h3>
      <Switch label="Notifications" disabled helperText="Disabled switch" />
      <h3>{text().validState}</h3>
      <Switch label="Notifications" checked helperText={text().noDedicatedValid} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().alertSection}</h2>
    <div class="docs-example">
      <Alert title="Info" message="Default alert state." />
      <Alert tone="success" title="Success" message={text().validState} />
      <Alert tone="warning" title="Warning" message="Warning state for confirmation flows." />
      <Alert tone="error" title="Error" message={text().errorState} />
    </div>
    <p class="docs-note">
      {text().notePrefix} {text().noteAlert}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "apiTitle")}</h2>
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
    <h2>{t(locale, "tokensTitle")}</h2>
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

  h3 {
    font-size: 0.9rem;
    margin: 0;
  }
</style>
