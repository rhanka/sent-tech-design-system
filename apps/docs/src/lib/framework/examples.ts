// Registre déclaratif des exemples « live » multi-frameworks.
//
// Un exemple est décrit une seule fois sous forme d'arbre de nœuds neutres
// (NodeSpec). Trois moteurs de rendu (Svelte inline, React via createRoot, Vue
// via createApp) consomment ce même arbre, garantissant une parité stricte
// entre les frameworks sans dupliquer la structure.
//
// - `comp` référence un composant du design system (Button, Input, …) résolu
//   dans la table de composants propre à chaque framework.
// - `el` référence un élément HTML neutre (wrapper de mise en page).
// - Les enfants peuvent être des chaînes (texte) ou d'autres NodeSpec.
//
// Les snippets de code par framework sont stockés tels quels : ils servent de
// documentation « copier-coller » et n'ont pas besoin d'être générés.

export type FrameworkId = "svelte" | "react" | "vue";

/** Nom d'un composant du design system, commun aux trois packages. */
export type ComponentName =
  | "Button"
  | "Input"
  | "Card"
  | "Badge"
  | "Checkbox"
  | "Radio"
  | "Alert"
  | "Tag"
  | "Select"
  | "Textarea"
  | "Toggle"
  | "Switch"
  | "Link"
  | "Breadcrumb"
  | "Tooltip"
  | "ProgressBar"
  | "Pagination"
  | "IconButton"
  | "NumberInput"
  | "Search"
  | "Tabs"
  | "Accordion"
  | "Slider"
  | "Quote"
  | "Highlight"
  | "EmptyState"
  | "Tile"
  | "ContentSwitcher"
  | "SkeletonText"
  | "ProgressIndicator"
  | "InlineLoading"
  | "LoadingState"
  | "CodeSnippet"
  | "CopyButton"
  | "OrderedList"
  | "UnorderedList"
  | "StructuredList"
  | "SkipLink"
  | "Header"
  | "SideNav"
  | "Form"
  | "FormGroup"
  | "FileUploader"
  | "LanguageSelector"
  | "Table"
  | "DataTable"
  | "TreeView"
  | "Combobox"
  | "MultiSelect"
  | "DatePicker"
  | "Toast"
  | "Dropdown"
  | "Footer"
  | "AreaChart"
  | "AreaRangeChart"
  | "BarChart"
  | "LineChart"
  | "DonutChart"
  | "ScatterPlot"
  | "Sparkline"
  | "StackedBarChart"
  | "HeatmapChart"
  | "HistogramChart"
  | "BoxPlotChart"
  | "RadarChart"
  | "RoseChart"
  | "SankeyChart"
  | "SunburstChart"
  | "ViolinChart"
  | "ChatThread"
  | "ChatMessage"
  | "StreamingMessage"
  | "MessageActions"
  | "MessageStatusBadge"
  | "ChatComposer"
  | "Menu"
  | "MenuPopover"
  | "OverflowMenu"
  | "Popover"
  | "AspectRatio"
  | "BackToTop"
  | "DisplaySettings"
  | "MediaContent"
  | "Embed"
  | "DataImage"
  | "Notification"
  | "TableOfContents"
  | "Transcription"
  | "ForceGraph"
  | "GeoMap"
  | "PasswordInput"
  | "PaginationNav"
  | "MenuTriggerButton"
  | "TileGroup"
  | "Toggletip"
  | "Flex"
  | "Stack"
  | "Inline"
  | "Container"
  | "Row"
  | "Col"
  | "Hidden"
  | "Divider"
  | "Avatar"
  | "AvatarGroup"
  | "ButtonGroup"
  | "CheckboxGroup"
  | "RadioGroup"
  | "Typography"
  | "Collapsible"
  | "Stepper"
  | "Rating"
  | "TimePicker"
  | "Calendar"
  | "SlideIndicator"
  | "Autosave"
  | "Portal"
  | "Popper"
  | "SelectableRow"
  | "SelectableList"
  | "KpiCard"
  | "ComboChart"
  | "GaugeChart"
  | "FunnelChart"
  | "WaterfallChart"
  | "TreemapChart"
  | "BulletChart"
  | "MarimekkoChart"
  | "ParallelCoordinatesChart"
  | "CandlestickChart"
  | "CalendarHeatmapChart"
  | "BumpChart"
  | "StepLineChart"
  | "DivergentBarChart"
  | "FilterPill"
  | "FilterBar"
  | "SelectionChip"
  | "LollipopChart"
  | "ColumnRangeChart"
  | "ParetoChart"
  | "ChordDiagram"
  | "PackedBubblesChart"
  | "RangeSlider"
  | "Drawer";

export interface ComponentNodeSpec {
  comp: ComponentName;
  props?: Record<string, unknown>;
  children?: NodeSpec[];
}

export interface ElementNodeSpec {
  el: keyof HTMLElementTagNameMap;
  props?: Record<string, unknown>;
  children?: NodeSpec[];
}

export type NodeSpec = string | ComponentNodeSpec | ElementNodeSpec;

export function isComponentNode(node: NodeSpec): node is ComponentNodeSpec {
  return typeof node === "object" && "comp" in node;
}

export function isElementNode(node: NodeSpec): node is ElementNodeSpec {
  return typeof node === "object" && "el" in node;
}

export interface FrameworkExample {
  /** Identifiant stable (clé du registre). */
  id: string;
  /** Composant documentaire associé (slug de route). */
  slug: string;
  /** Arbre de rendu partagé par les trois frameworks. */
  nodes: NodeSpec[];
  /** Snippets d'usage, un par framework. */
  code: Record<FrameworkId, string>;
}

const wrap = (children: NodeSpec[]): NodeSpec => ({
  el: "div",
  props: { class: "fp-row" },
  children
});

const stack = (children: NodeSpec[]): NodeSpec => ({
  el: "div",
  props: { class: "fp-stack" },
  children
});

export const EXAMPLES: Record<string, FrameworkExample> = {
  button: {
    id: "button",
    slug: "button",
    nodes: [
      wrap([
        { comp: "Button", props: { variant: "primary" }, children: ["Primary"] },
        { comp: "Button", props: { variant: "secondary" }, children: ["Secondary"] },
        { comp: "Button", props: { variant: "ghost" }, children: ["Ghost"] },
        { comp: "Button", props: { variant: "danger" }, children: ["Danger"] }
      ])
    ],
    code: {
      svelte: `<script>
  import { Button } from "@sentropic/design-system-svelte";
</script>

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>`,
      react: `import { Button } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </>
  );
}`,
      vue: `<script setup>
import { Button } from "@sentropic/design-system-vue";
</script>

<template>
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="danger">Danger</Button>
</template>`
    }
  },

  input: {
    id: "input",
    slug: "input",
    nodes: [
      wrap([
        {
          comp: "Input",
          props: { label: "Titre du projet", placeholder: "Sent Tech Forge" }
        },
        {
          comp: "Input",
          props: {
            label: "Adresse e-mail",
            type: "email",
            helperText: "Nous ne partagerons jamais votre adresse.",
            placeholder: "vous@exemple.com"
          }
        },
        {
          comp: "Input",
          props: {
            label: "Identifiant",
            errorText: "Cet identifiant est déjà pris.",
            value: "forge",
            invalid: true
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Input } from "@sentropic/design-system-svelte";
</script>

<Input label="Titre du projet" placeholder="Sent Tech Forge" />
<Input label="Adresse e-mail" type="email" helperText="Nous ne partagerons jamais votre adresse." />
<Input label="Identifiant" errorText="Cet identifiant est déjà pris." value="forge" invalid />`,
      react: `import { Input } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Input label="Titre du projet" placeholder="Sent Tech Forge" />
      <Input label="Adresse e-mail" type="email" helperText="Nous ne partagerons jamais votre adresse." />
      <Input label="Identifiant" errorText="Cet identifiant est déjà pris." defaultValue="forge" invalid />
    </>
  );
}`,
      vue: `<script setup>
import { Input } from "@sentropic/design-system-vue";
</script>

<template>
  <Input label="Titre du projet" placeholder="Sent Tech Forge" />
  <Input label="Adresse e-mail" type="email" helperText="Nous ne partagerons jamais votre adresse." />
  <Input label="Identifiant" errorText="Cet identifiant est déjà pris." :modelValue="'forge'" invalid />
</template>`
    }
  },

  card: {
    id: "card",
    slug: "card",
    nodes: [
      wrap([
        {
          comp: "Card",
          children: [
            { el: "h3", props: { class: "fp-card-title" }, children: ["Espace Forge"] },
            {
              el: "p",
              props: { class: "fp-card-text" },
              children: ["Un conteneur neutre pour regrouper un contenu cohérent."]
            }
          ]
        },
        {
          comp: "Card",
          props: { interactive: true },
          children: [
            { el: "h3", props: { class: "fp-card-title" }, children: ["Carte interactive"] },
            {
              el: "p",
              props: { class: "fp-card-text" },
              children: ["Survolez : élévation et curseur signalent l'interactivité."]
            }
          ]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Card } from "@sentropic/design-system-svelte";
</script>

<Card>
  <h3>Espace Forge</h3>
  <p>Un conteneur neutre pour regrouper un contenu cohérent.</p>
</Card>

<Card interactive>
  <h3>Carte interactive</h3>
  <p>Survolez : élévation et curseur signalent l'interactivité.</p>
</Card>`,
      react: `import { Card } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Card>
        <h3>Espace Forge</h3>
        <p>Un conteneur neutre pour regrouper un contenu cohérent.</p>
      </Card>
      <Card interactive>
        <h3>Carte interactive</h3>
        <p>Survolez : élévation et curseur signalent l'interactivité.</p>
      </Card>
    </>
  );
}`,
      vue: `<script setup>
import { Card } from "@sentropic/design-system-vue";
</script>

<template>
  <Card>
    <h3>Espace Forge</h3>
    <p>Un conteneur neutre pour regrouper un contenu cohérent.</p>
  </Card>
  <Card interactive>
    <h3>Carte interactive</h3>
    <p>Survolez : élévation et curseur signalent l'interactivité.</p>
  </Card>
</template>`
    }
  },

  badge: {
    id: "badge",
    slug: "badge",
    nodes: [
      wrap([
        { comp: "Badge", children: ["Neutral"] },
        { comp: "Badge", props: { tone: "success" }, children: ["Success"] },
        { comp: "Badge", props: { tone: "warning" }, children: ["Warning"] },
        { comp: "Badge", props: { tone: "error" }, children: ["Error"] },
        { comp: "Badge", props: { tone: "info" }, children: ["Info"] }
      ])
    ],
    code: {
      svelte: `<script>
  import { Badge } from "@sentropic/design-system-svelte";
</script>

<Badge>Neutral</Badge>
<Badge tone="success">Success</Badge>
<Badge tone="warning">Warning</Badge>
<Badge tone="error">Error</Badge>
<Badge tone="info">Info</Badge>`,
      react: `import { Badge } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Badge>Neutral</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="error">Error</Badge>
      <Badge tone="info">Info</Badge>
    </>
  );
}`,
      vue: `<script setup>
import { Badge } from "@sentropic/design-system-vue";
</script>

<template>
  <Badge>Neutral</Badge>
  <Badge tone="success">Success</Badge>
  <Badge tone="warning">Warning</Badge>
  <Badge tone="error">Error</Badge>
  <Badge tone="info">Info</Badge>
</template>`
    }
  },

  checkbox: {
    id: "checkbox",
    slug: "checkbox",
    nodes: [
      wrap([
        { comp: "Checkbox", props: { label: "Activer les modèles d'espace" } },
        { comp: "Checkbox", props: { label: "Synchronisation automatique", checked: true } },
        {
          comp: "Checkbox",
          props: {
            label: "Notifications",
            helperText: "Recevez un e-mail à chaque déploiement.",
            checked: true
          }
        },
        { comp: "Checkbox", props: { label: "Verrouillé par la politique", disabled: true } }
      ])
    ],
    code: {
      svelte: `<script>
  import { Checkbox } from "@sentropic/design-system-svelte";
</script>

<Checkbox label="Activer les modèles d'espace" />
<Checkbox label="Synchronisation automatique" checked />
<Checkbox label="Notifications" helperText="Recevez un e-mail à chaque déploiement." checked />
<Checkbox label="Verrouillé par la politique" disabled />`,
      react: `import { Checkbox } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Checkbox label="Activer les modèles d'espace" />
      <Checkbox label="Synchronisation automatique" defaultChecked />
      <Checkbox label="Notifications" helperText="Recevez un e-mail à chaque déploiement." defaultChecked />
      <Checkbox label="Verrouillé par la politique" disabled />
    </>
  );
}`,
      vue: `<script setup>
import { Checkbox } from "@sentropic/design-system-vue";
</script>

<template>
  <Checkbox label="Activer les modèles d'espace" />
  <Checkbox label="Synchronisation automatique" :checked="true" />
  <Checkbox label="Notifications" helperText="Recevez un e-mail à chaque déploiement." :checked="true" />
  <Checkbox label="Verrouillé par la politique" disabled />
</template>`
    }
  },

  radio: {
    id: "radio",
    slug: "radio",
    nodes: [
      wrap([
        {
          comp: "Radio",
          props: { label: "Runtime principal", name: "fp-runtime", value: "primary", checked: true }
        },
        {
          comp: "Radio",
          props: { label: "Runtime secondaire", name: "fp-runtime", value: "secondary" }
        },
        {
          comp: "Radio",
          props: {
            label: "Runtime expérimental",
            name: "fp-runtime",
            value: "experimental",
            helperText: "Peut changer sans préavis."
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Radio } from "@sentropic/design-system-svelte";
</script>

<Radio label="Runtime principal" name="runtime" value="primary" checked />
<Radio label="Runtime secondaire" name="runtime" value="secondary" />
<Radio label="Runtime expérimental" name="runtime" value="experimental" helperText="Peut changer sans préavis." />`,
      react: `import { Radio } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Radio label="Runtime principal" name="runtime" value="primary" defaultChecked />
      <Radio label="Runtime secondaire" name="runtime" value="secondary" />
      <Radio label="Runtime expérimental" name="runtime" value="experimental" helperText="Peut changer sans préavis." />
    </>
  );
}`,
      vue: `<script setup>
import { Radio } from "@sentropic/design-system-vue";
</script>

<template>
  <Radio label="Runtime principal" name="runtime" value="primary" :checked="true" />
  <Radio label="Runtime secondaire" name="runtime" value="secondary" />
  <Radio label="Runtime expérimental" name="runtime" value="experimental" helperText="Peut changer sans préavis." />
</template>`
    }
  },

  alert: {
    id: "alert",
    slug: "alert",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Alert",
            props: { tone: "info", title: "Info", message: "Une synchronisation est planifiée pour ce soir." }
          },
          {
            comp: "Alert",
            props: { tone: "success", title: "Succès", message: "Les modifications ont été enregistrées." }
          },
          {
            comp: "Alert",
            props: { tone: "warning", title: "Avertissement", message: "Votre quota approche de la limite." }
          },
          {
            comp: "Alert",
            props: { tone: "error", title: "Erreur", message: "Impossible de contacter le serveur." }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Alert } from "@sentropic/design-system-svelte";
</script>

<Alert tone="info" title="Info" message="Une synchronisation est planifiée pour ce soir." />
<Alert tone="success" title="Succès" message="Les modifications ont été enregistrées." />
<Alert tone="warning" title="Avertissement" message="Votre quota approche de la limite." />
<Alert tone="error" title="Erreur" message="Impossible de contacter le serveur." />`,
      react: `import { Alert } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Alert tone="info" title="Info" message="Une synchronisation est planifiée pour ce soir." />
      <Alert tone="success" title="Succès" message="Les modifications ont été enregistrées." />
      <Alert tone="warning" title="Avertissement" message="Votre quota approche de la limite." />
      <Alert tone="error" title="Erreur" message="Impossible de contacter le serveur." />
    </>
  );
}`,
      vue: `<script setup>
import { Alert } from "@sentropic/design-system-vue";
</script>

<template>
  <Alert tone="info" title="Info" message="Une synchronisation est planifiée pour ce soir." />
  <Alert tone="success" title="Succès" message="Les modifications ont été enregistrées." />
  <Alert tone="warning" title="Avertissement" message="Votre quota approche de la limite." />
  <Alert tone="error" title="Erreur" message="Impossible de contacter le serveur." />
</template>`
    }
  },

  tag: {
    id: "tag",
    slug: "tag",
    nodes: [
      wrap([
        { comp: "Tag", props: { tone: "neutral" }, children: ["Neutral"] },
        { comp: "Tag", props: { tone: "success" }, children: ["Success"] },
        { comp: "Tag", props: { tone: "warning" }, children: ["Warning"] },
        { comp: "Tag", props: { tone: "error" }, children: ["Error"] },
        { comp: "Tag", props: { tone: "info" }, children: ["Info"] }
      ])
    ],
    code: {
      svelte: `<script>
  import { Tag } from "@sentropic/design-system-svelte";
</script>

<Tag tone="neutral">Neutral</Tag>
<Tag tone="success">Success</Tag>
<Tag tone="warning">Warning</Tag>
<Tag tone="error">Error</Tag>
<Tag tone="info">Info</Tag>`,
      react: `import { Tag } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Tag tone="neutral">Neutral</Tag>
      <Tag tone="success">Success</Tag>
      <Tag tone="warning">Warning</Tag>
      <Tag tone="error">Error</Tag>
      <Tag tone="info">Info</Tag>
    </>
  );
}`,
      vue: `<script setup>
import { Tag } from "@sentropic/design-system-vue";
</script>

<template>
  <Tag tone="neutral">Neutral</Tag>
  <Tag tone="success">Success</Tag>
  <Tag tone="warning">Warning</Tag>
  <Tag tone="error">Error</Tag>
  <Tag tone="info">Info</Tag>
</template>`
    }
  },

  select: {
    id: "select",
    slug: "select",
    nodes: [
      wrap([
        {
          comp: "Select",
          props: {
            label: "Environnement",
            options: [
              { value: "prod", label: "Production" },
              { value: "staging", label: "Staging" },
              { value: "dev", label: "Développement" }
            ]
          }
        },
        {
          comp: "Select",
          props: {
            label: "Région",
            helperText: "Choisissez la région la plus proche.",
            options: [
              { value: "ca-qc", label: "Canada — Québec" },
              { value: "ca-on", label: "Canada — Ontario" },
              { value: "us-east", label: "États-Unis — Est" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Select } from "@sentropic/design-system-svelte";
</script>

<Select
  label="Environnement"
  options={[
    { value: "prod", label: "Production" },
    { value: "staging", label: "Staging" },
    { value: "dev", label: "Développement" }
  ]}
/>
<Select
  label="Région"
  helperText="Choisissez la région la plus proche."
  options={[
    { value: "ca-qc", label: "Canada — Québec" },
    { value: "ca-on", label: "Canada — Ontario" },
    { value: "us-east", label: "États-Unis — Est" }
  ]}
/>`,
      react: `import { Select } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Select
        label="Environnement"
        options={[
          { value: "prod", label: "Production" },
          { value: "staging", label: "Staging" },
          { value: "dev", label: "Développement" }
        ]}
      />
      <Select
        label="Région"
        helperText="Choisissez la région la plus proche."
        options={[
          { value: "ca-qc", label: "Canada — Québec" },
          { value: "ca-on", label: "Canada — Ontario" },
          { value: "us-east", label: "États-Unis — Est" }
        ]}
      />
    </>
  );
}`,
      vue: `<script setup>
import { Select } from "@sentropic/design-system-vue";
</script>

<template>
  <Select
    label="Environnement"
    :options="[
      { value: 'prod', label: 'Production' },
      { value: 'staging', label: 'Staging' },
      { value: 'dev', label: 'Développement' }
    ]"
  />
  <Select
    label="Région"
    helperText="Choisissez la région la plus proche."
    :options="[
      { value: 'ca-qc', label: 'Canada — Québec' },
      { value: 'ca-on', label: 'Canada — Ontario' },
      { value: 'us-east', label: 'États-Unis — Est' }
    ]"
  />
</template>`
    }
  },

  textarea: {
    id: "textarea",
    slug: "textarea",
    nodes: [
      wrap([
        {
          comp: "Textarea",
          props: {
            label: "Description du projet",
            placeholder: "Décrivez votre projet en quelques phrases…",
            rows: 4
          }
        },
        {
          comp: "Textarea",
          props: {
            label: "Message d'erreur",
            errorText: "Ce champ est obligatoire.",
            invalid: true,
            rows: 3
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Textarea } from "@sentropic/design-system-svelte";
</script>

<Textarea
  label="Description du projet"
  placeholder="Décrivez votre projet en quelques phrases…"
  rows={4}
/>
<Textarea
  label="Message d'erreur"
  errorText="Ce champ est obligatoire."
  invalid
  rows={3}
/>`,
      react: `import { Textarea } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Textarea
        label="Description du projet"
        placeholder="Décrivez votre projet en quelques phrases…"
        rows={4}
      />
      <Textarea
        label="Message d'erreur"
        errorText="Ce champ est obligatoire."
        invalid
        rows={3}
      />
    </>
  );
}`,
      vue: `<script setup>
import { Textarea } from "@sentropic/design-system-vue";
</script>

<template>
  <Textarea
    label="Description du projet"
    placeholder="Décrivez votre projet en quelques phrases…"
    :rows="4"
  />
  <Textarea
    label="Message d'erreur"
    errorText="Ce champ est obligatoire."
    invalid
    :rows="3"
  />
</template>`
    }
  },

  toggle: {
    id: "toggle",
    slug: "toggle",
    nodes: [
      wrap([
        { comp: "Toggle", props: { label: "Mode sombre" } },
        { comp: "Toggle", props: { label: "Notifications push", defaultChecked: true } },
        {
          comp: "Toggle",
          props: {
            label: "Synchronisation automatique",
            helperText: "Synchronise toutes les 5 minutes.",
            defaultChecked: true
          }
        },
        { comp: "Toggle", props: { label: "Fonctionnalité bêta", disabled: true } }
      ])
    ],
    code: {
      svelte: `<script>
  import { Toggle } from "@sentropic/design-system-svelte";
</script>

<Toggle label="Mode sombre" />
<Toggle label="Notifications push" checked />
<Toggle label="Synchronisation automatique" helperText="Synchronise toutes les 5 minutes." checked />
<Toggle label="Fonctionnalité bêta" disabled />`,
      react: `import { Toggle } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Toggle label="Mode sombre" />
      <Toggle label="Notifications push" defaultChecked />
      <Toggle label="Synchronisation automatique" helperText="Synchronise toutes les 5 minutes." defaultChecked />
      <Toggle label="Fonctionnalité bêta" disabled />
    </>
  );
}`,
      vue: `<script setup>
import { Toggle } from "@sentropic/design-system-vue";
</script>

<template>
  <Toggle label="Mode sombre" />
  <Toggle label="Notifications push" :checked="true" />
  <Toggle label="Synchronisation automatique" helperText="Synchronise toutes les 5 minutes." :checked="true" />
  <Toggle label="Fonctionnalité bêta" disabled />
</template>`
    }
  },

  switch: {
    id: "switch",
    slug: "switch",
    nodes: [
      wrap([
        { comp: "Switch", props: { label: "Activer le service" } },
        { comp: "Switch", props: { label: "Accès public", defaultChecked: true } },
        {
          comp: "Switch",
          props: {
            label: "Journal d'audit",
            helperText: "Enregistre toutes les actions utilisateurs.",
            defaultChecked: true
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Switch } from "@sentropic/design-system-svelte";
</script>

<Switch label="Activer le service" />
<Switch label="Accès public" checked />
<Switch label="Journal d'audit" helperText="Enregistre toutes les actions utilisateurs." checked />`,
      react: `import { Switch } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Switch label="Activer le service" />
      <Switch label="Accès public" defaultChecked />
      <Switch label="Journal d'audit" helperText="Enregistre toutes les actions utilisateurs." defaultChecked />
    </>
  );
}`,
      vue: `<script setup>
import { Switch } from "@sentropic/design-system-vue";
</script>

<template>
  <Switch label="Activer le service" />
  <Switch label="Accès public" :checked="true" />
  <Switch label="Journal d'audit" helperText="Enregistre toutes les actions utilisateurs." :checked="true" />
</template>`
    }
  },

  link: {
    id: "link",
    slug: "link",
    nodes: [
      wrap([
        { comp: "Link", props: { href: "#" }, children: ["Lien standard"] },
        { comp: "Link", props: { href: "#", standalone: true }, children: ["Lien autonome"] },
        { comp: "Link", props: { href: "#", muted: true }, children: ["Lien discret"] },
        { comp: "Link", props: { href: "#", disabled: true }, children: ["Lien désactivé"] }
      ])
    ],
    code: {
      svelte: `<script>
  import { Link } from "@sentropic/design-system-svelte";
</script>

<Link href="#">Lien standard</Link>
<Link href="#" standalone>Lien autonome</Link>
<Link href="#" muted>Lien discret</Link>
<Link href="#" disabled>Lien désactivé</Link>`,
      react: `import { Link } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Link href="#">Lien standard</Link>
      <Link href="#" standalone>Lien autonome</Link>
      <Link href="#" muted>Lien discret</Link>
      <Link href="#" disabled>Lien désactivé</Link>
    </>
  );
}`,
      vue: `<script setup>
import { Link } from "@sentropic/design-system-vue";
</script>

<template>
  <Link href="#">Lien standard</Link>
  <Link href="#" standalone>Lien autonome</Link>
  <Link href="#" muted>Lien discret</Link>
  <Link href="#" disabled>Lien désactivé</Link>
</template>`
    }
  },

  breadcrumb: {
    id: "breadcrumb",
    slug: "breadcrumb",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Breadcrumb",
            props: {
              items: [
                { label: "Accueil", href: "/" },
                { label: "Composants", href: "/components" },
                { label: "Breadcrumb", current: true }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Breadcrumb } from "@sentropic/design-system-svelte";
</script>

<Breadcrumb
  items={[
    { label: "Accueil", href: "/" },
    { label: "Composants", href: "/components" },
    { label: "Breadcrumb", current: true }
  ]}
/>`,
      react: `import { Breadcrumb } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Breadcrumb
      items={[
        { label: "Accueil", href: "/" },
        { label: "Composants", href: "/components" },
        { label: "Breadcrumb", current: true }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { Breadcrumb } from "@sentropic/design-system-vue";
</script>

<template>
  <Breadcrumb
    :items="[
      { label: 'Accueil', href: '/' },
      { label: 'Composants', href: '/components' },
      { label: 'Breadcrumb', current: true }
    ]"
  />
</template>`
    }
  },

  tooltip: {
    id: "tooltip",
    slug: "tooltip",
    nodes: [
      wrap([
        {
          comp: "Tooltip",
          props: { content: "Créer un nouvel espace de travail" },
          children: [{ comp: "Button", props: { variant: "secondary" }, children: ["Nouveau"] }]
        },
        {
          comp: "Tooltip",
          props: { content: "Cette action est irréversible", placement: "bottom" },
          children: [{ comp: "Button", props: { variant: "danger" }, children: ["Supprimer"] }]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Tooltip, Button } from "@sentropic/design-system-svelte";
</script>

<Tooltip content="Créer un nouvel espace de travail">
  <Button variant="secondary">Nouveau</Button>
</Tooltip>
<Tooltip content="Cette action est irréversible" placement="bottom">
  <Button variant="danger">Supprimer</Button>
</Tooltip>`,
      react: `import { Tooltip, Button } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Tooltip content="Créer un nouvel espace de travail">
        <Button variant="secondary">Nouveau</Button>
      </Tooltip>
      <Tooltip content="Cette action est irréversible" placement="bottom">
        <Button variant="danger">Supprimer</Button>
      </Tooltip>
    </>
  );
}`,
      vue: `<script setup>
import { Tooltip, Button } from "@sentropic/design-system-vue";
</script>

<template>
  <Tooltip content="Créer un nouvel espace de travail">
    <Button variant="secondary">Nouveau</Button>
  </Tooltip>
  <Tooltip content="Cette action est irréversible" placement="bottom">
    <Button variant="danger">Supprimer</Button>
  </Tooltip>
</template>`
    }
  },

  progressbar: {
    id: "progressbar",
    slug: "progress-bar",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          { comp: "ProgressBar", props: { label: "Téléchargement", value: 65 } },
          { comp: "ProgressBar", props: { label: "Déploiement", value: 100, tone: "success" } },
          { comp: "ProgressBar", props: { label: "Quota disque", value: 82, tone: "warning" } },
          { comp: "ProgressBar", props: { label: "Chargement…", indeterminate: true } }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { ProgressBar } from "@sentropic/design-system-svelte";
</script>

<ProgressBar label="Téléchargement" value={65} />
<ProgressBar label="Déploiement" value={100} tone="success" />
<ProgressBar label="Quota disque" value={82} tone="warning" />
<ProgressBar label="Chargement…" indeterminate />`,
      react: `import { ProgressBar } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <ProgressBar label="Téléchargement" value={65} />
      <ProgressBar label="Déploiement" value={100} tone="success" />
      <ProgressBar label="Quota disque" value={82} tone="warning" />
      <ProgressBar label="Chargement…" indeterminate />
    </>
  );
}`,
      vue: `<script setup>
import { ProgressBar } from "@sentropic/design-system-vue";
</script>

<template>
  <ProgressBar label="Téléchargement" :value="65" />
  <ProgressBar label="Déploiement" :value="100" tone="success" />
  <ProgressBar label="Quota disque" :value="82" tone="warning" />
  <ProgressBar label="Chargement…" :indeterminate="true" />
</template>`
    }
  },

  pagination: {
    id: "pagination",
    slug: "pagination",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          { comp: "Pagination", props: { page: 3, totalItems: 120, pageSize: 10 } }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Pagination } from "@sentropic/design-system-svelte";
  let page = 3;
</script>

<Pagination {page} totalItems={120} pageSize={10} onPageChange={(p) => page = p} />`,
      react: `import { useState } from "react";
import { Pagination } from "@sentropic/design-system-react";

export function Demo() {
  const [page, setPage] = useState(3);
  return <Pagination page={page} totalItems={120} pageSize={10} onPageChange={setPage} />;
}`,
      vue: `<script setup>
import { ref } from "vue";
import { Pagination } from "@sentropic/design-system-vue";
const page = ref(3);
</script>

<template>
  <Pagination :page="page" :totalItems="120" :pageSize="10" @pageChange="p => page = p" />
</template>`
    }
  },

  iconbutton: {
    id: "iconbutton",
    slug: "icon-button",
    nodes: [
      wrap([
        { comp: "IconButton", props: { "aria-label": "Copier", variant: "secondary" }, children: ["⧉"] },
        { comp: "IconButton", props: { "aria-label": "Modifier", variant: "ghost" }, children: ["✎"] },
        { comp: "IconButton", props: { "aria-label": "Supprimer", variant: "danger" }, children: ["✕"] },
        { comp: "IconButton", props: { "aria-label": "Ajouter", disabled: true }, children: ["＋"] }
      ])
    ],
    code: {
      svelte: `<script>
  import { IconButton } from "@sentropic/design-system-svelte";
</script>

<IconButton aria-label="Copier" variant="secondary">⧉</IconButton>
<IconButton aria-label="Modifier" variant="ghost">✎</IconButton>
<IconButton aria-label="Supprimer" variant="danger">✕</IconButton>
<IconButton aria-label="Ajouter" disabled>＋</IconButton>`,
      react: `import { IconButton } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <IconButton aria-label="Copier" variant="secondary">⧉</IconButton>
      <IconButton aria-label="Modifier" variant="ghost">✎</IconButton>
      <IconButton aria-label="Supprimer" variant="danger">✕</IconButton>
      <IconButton aria-label="Ajouter" disabled>＋</IconButton>
    </>
  );
}`,
      vue: `<script setup>
import { IconButton } from "@sentropic/design-system-vue";
</script>

<template>
  <IconButton aria-label="Copier" variant="secondary">⧉</IconButton>
  <IconButton aria-label="Modifier" variant="ghost">✎</IconButton>
  <IconButton aria-label="Supprimer" variant="danger">✕</IconButton>
  <IconButton aria-label="Ajouter" disabled>＋</IconButton>
</template>`
    }
  },

  numberinput: {
    id: "numberinput",
    slug: "number-input",
    nodes: [
      wrap([
        {
          comp: "NumberInput",
          props: { label: "Nombre de réplicas", defaultValue: 3, min: 1, max: 10 }
        },
        {
          comp: "NumberInput",
          props: {
            label: "Délai d'expiration (s)",
            defaultValue: 30,
            helperText: "Entre 1 et 3600 secondes.",
            min: 1,
            max: 3600
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { NumberInput } from "@sentropic/design-system-svelte";
</script>

<NumberInput label="Nombre de réplicas" value={3} min={1} max={10} />
<NumberInput label="Délai d'expiration (s)" value={30} helperText="Entre 1 et 3600 secondes." min={1} max={3600} />`,
      react: `import { NumberInput } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <NumberInput label="Nombre de réplicas" defaultValue={3} min={1} max={10} />
      <NumberInput label="Délai d'expiration (s)" defaultValue={30} helperText="Entre 1 et 3600 secondes." min={1} max={3600} />
    </>
  );
}`,
      vue: `<script setup>
import { NumberInput } from "@sentropic/design-system-vue";
</script>

<template>
  <NumberInput label="Nombre de réplicas" :modelValue="3" :min="1" :max="10" />
  <NumberInput label="Délai d'expiration (s)" :modelValue="30" helperText="Entre 1 et 3600 secondes." :min="1" :max="3600" />
</template>`
    }
  },

  search: {
    id: "search",
    slug: "search",
    nodes: [
      wrap([
        {
          comp: "Search",
          props: { label: "Rechercher", placeholder: "Rechercher un composant…" }
        },
        {
          comp: "Search",
          props: { label: "Filtrer", placeholder: "Filtrer par nom…", size: "sm" }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Search } from "@sentropic/design-system-svelte";
</script>

<Search label="Rechercher" placeholder="Rechercher un composant…" />
<Search label="Filtrer" placeholder="Filtrer par nom…" size="sm" />`,
      react: `import { Search } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Search label="Rechercher" placeholder="Rechercher un composant…" />
      <Search label="Filtrer" placeholder="Filtrer par nom…" size="sm" />
    </>
  );
}`,
      vue: `<script setup>
import { Search } from "@sentropic/design-system-vue";
</script>

<template>
  <Search label="Rechercher" placeholder="Rechercher un composant…" />
  <Search label="Filtrer" placeholder="Filtrer par nom…" size="sm" />
</template>`
    }
  },

  tabs: {
    id: "tabs",
    slug: "tabs",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Tabs",
            props: {
              items: [
                { id: "overview", label: "Vue d'ensemble", content: "Contenu de la vue d'ensemble." },
                { id: "settings", label: "Paramètres", content: "Contenu des paramètres." },
                { id: "logs", label: "Journaux", content: "Contenu des journaux.", disabled: false }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Tabs } from "@sentropic/design-system-svelte";
</script>

<Tabs
  items={[
    { id: "overview", label: "Vue d'ensemble", content: "Contenu de la vue d'ensemble." },
    { id: "settings", label: "Paramètres", content: "Contenu des paramètres." },
    { id: "logs", label: "Journaux", content: "Contenu des journaux." }
  ]}
/>`,
      react: `import { Tabs } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Tabs
      items={[
        { id: "overview", label: "Vue d'ensemble", content: "Contenu de la vue d'ensemble." },
        { id: "settings", label: "Paramètres", content: "Contenu des paramètres." },
        { id: "logs", label: "Journaux", content: "Contenu des journaux." }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { Tabs } from "@sentropic/design-system-vue";
</script>

<template>
  <Tabs
    :items="[
      { id: 'overview', label: 'Vue d\\'ensemble', content: 'Contenu de la vue d\\'ensemble.' },
      { id: 'settings', label: 'Paramètres', content: 'Contenu des paramètres.' },
      { id: 'logs', label: 'Journaux', content: 'Contenu des journaux.' }
    ]"
  />
</template>`
    }
  },

  accordion: {
    id: "accordion",
    slug: "accordion",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Accordion",
            props: {
              items: [
                {
                  id: "install",
                  title: "Installation",
                  content: "Installez le paquet via npm install @sentropic/design-system."
                },
                {
                  id: "usage",
                  title: "Utilisation",
                  content: "Importez les composants depuis le package correspondant à votre framework."
                },
                {
                  id: "theming",
                  title: "Thématisation",
                  content: "Enveloppez votre application dans ThemeProvider pour personnaliser le thème."
                }
              ],
              defaultOpenIds: ["install"]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Accordion } from "@sentropic/design-system-svelte";
</script>

<Accordion
  items={[
    { id: "install", title: "Installation", content: "Installez le paquet via npm install." },
    { id: "usage", title: "Utilisation", content: "Importez les composants depuis le package." },
    { id: "theming", title: "Thématisation", content: "Enveloppez dans ThemeProvider." }
  ]}
  defaultOpenIds={["install"]}
/>`,
      react: `import { Accordion } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Accordion
      items={[
        { id: "install", title: "Installation", content: "Installez le paquet via npm install." },
        { id: "usage", title: "Utilisation", content: "Importez les composants depuis le package." },
        { id: "theming", title: "Thématisation", content: "Enveloppez dans ThemeProvider." }
      ]}
      defaultOpenIds={["install"]}
    />
  );
}`,
      vue: `<script setup>
import { Accordion } from "@sentropic/design-system-vue";
</script>

<template>
  <Accordion
    :items="[
      { id: 'install', title: 'Installation', content: 'Installez le paquet via npm install.' },
      { id: 'usage', title: 'Utilisation', content: 'Importez les composants depuis le package.' },
      { id: 'theming', title: 'Thématisation', content: 'Enveloppez dans ThemeProvider.' }
    ]"
    :defaultOpenIds="['install']"
  />
</template>`
    }
  },

  slider: {
    id: "slider",
    slug: "slider",
    nodes: [
      wrap([
        {
          comp: "Slider",
          props: { label: "Volume", defaultValue: 70, min: 0, max: 100 }
        },
        {
          comp: "Slider",
          props: { label: "Délai (ms)", defaultValue: 250, min: 0, max: 1000 }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Slider } from "@sentropic/design-system-svelte";
</script>

<Slider label="Volume" value={70} min={0} max={100} />
<Slider label="Délai (ms)" value={250} min={0} max={1000} />`,
      react: `import { Slider } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Slider label="Volume" defaultValue={70} min={0} max={100} />
      <Slider label="Délai (ms)" defaultValue={250} min={0} max={1000} />
    </>
  );
}`,
      vue: `<script setup>
import { Slider } from "@sentropic/design-system-vue";
</script>

<template>
  <Slider label="Volume" :modelValue="70" :min="0" :max="100" />
  <Slider label="Délai (ms)" :modelValue="250" :min="0" :max="1000" />
</template>`
    }
  },

  quote: {
    id: "quote",
    slug: "quote",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Quote",
            props: { author: "Fabien Antoine", source: "Sent Tech Blog" },
            children: ["Un bon système de design réduit la friction entre l'idée et l'interface."]
          },
          {
            comp: "Quote",
            props: { author: "Équipe Forge" },
            children: ["La cohérence visuelle est la première forme d'accessibilité."]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Quote } from "@sentropic/design-system-svelte";
</script>

<Quote author="Fabien Antoine" source="Sent Tech Blog">
  Un bon système de design réduit la friction entre l'idée et l'interface.
</Quote>
<Quote author="Équipe Forge">
  La cohérence visuelle est la première forme d'accessibilité.
</Quote>`,
      react: `import { Quote } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Quote author="Fabien Antoine" source="Sent Tech Blog">
        Un bon système de design réduit la friction entre l'idée et l'interface.
      </Quote>
      <Quote author="Équipe Forge">
        La cohérence visuelle est la première forme d'accessibilité.
      </Quote>
    </>
  );
}`,
      vue: `<script setup>
import { Quote } from "@sentropic/design-system-vue";
</script>

<template>
  <Quote author="Fabien Antoine" source="Sent Tech Blog">
    Un bon système de design réduit la friction entre l'idée et l'interface.
  </Quote>
  <Quote author="Équipe Forge">
    La cohérence visuelle est la première forme d'accessibilité.
  </Quote>
</template>`
    }
  },

  highlight: {
    id: "highlight",
    slug: "highlight",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Highlight",
            props: { tone: "info", title: "Conseil" },
            children: ["Utilisez ThemeProvider pour personnaliser les tokens de couleur."]
          },
          {
            comp: "Highlight",
            props: { tone: "warning", title: "Attention" },
            children: ["Cette API est en version bêta et peut changer sans préavis."]
          },
          {
            comp: "Highlight",
            props: { tone: "success", title: "Bonne pratique" },
            children: ["Déclarez vos dépendances dans peerDependencies."]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Highlight } from "@sentropic/design-system-svelte";
</script>

<Highlight tone="info" title="Conseil">
  Utilisez ThemeProvider pour personnaliser les tokens de couleur.
</Highlight>
<Highlight tone="warning" title="Attention">
  Cette API est en version bêta et peut changer sans préavis.
</Highlight>
<Highlight tone="success" title="Bonne pratique">
  Déclarez vos dépendances dans peerDependencies.
</Highlight>`,
      react: `import { Highlight } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Highlight tone="info" title="Conseil">
        Utilisez ThemeProvider pour personnaliser les tokens de couleur.
      </Highlight>
      <Highlight tone="warning" title="Attention">
        Cette API est en version bêta et peut changer sans préavis.
      </Highlight>
      <Highlight tone="success" title="Bonne pratique">
        Déclarez vos dépendances dans peerDependencies.
      </Highlight>
    </>
  );
}`,
      vue: `<script setup>
import { Highlight } from "@sentropic/design-system-vue";
</script>

<template>
  <Highlight tone="info" title="Conseil">
    Utilisez ThemeProvider pour personnaliser les tokens de couleur.
  </Highlight>
  <Highlight tone="warning" title="Attention">
    Cette API est en version bêta et peut changer sans préavis.
  </Highlight>
  <Highlight tone="success" title="Bonne pratique">
    Déclarez vos dépendances dans peerDependencies.
  </Highlight>
</template>`
    }
  },

  emptystate: {
    id: "emptystate",
    slug: "empty-state",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "EmptyState",
            props: {
              title: "Aucun composant trouvé",
              message: "Essayez d'ajuster vos filtres ou d'effacer votre recherche."
            }
          },
          {
            comp: "EmptyState",
            props: {
              title: "Aucun déploiement récent",
              message: "Votre première mise en production apparaîtra ici."
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { EmptyState } from "@sentropic/design-system-svelte";
</script>

<EmptyState
  title="Aucun composant trouvé"
  message="Essayez d'ajuster vos filtres ou d'effacer votre recherche."
/>
<EmptyState
  title="Aucun déploiement récent"
  message="Votre première mise en production apparaîtra ici."
/>`,
      react: `import { EmptyState } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <EmptyState
        title="Aucun composant trouvé"
        message="Essayez d'ajuster vos filtres ou d'effacer votre recherche."
      />
      <EmptyState
        title="Aucun déploiement récent"
        message="Votre première mise en production apparaîtra ici."
      />
    </>
  );
}`,
      vue: `<script setup>
import { EmptyState } from "@sentropic/design-system-vue";
</script>

<template>
  <EmptyState
    title="Aucun composant trouvé"
    message="Essayez d'ajuster vos filtres ou d'effacer votre recherche."
  />
  <EmptyState
    title="Aucun déploiement récent"
    message="Votre première mise en production apparaîtra ici."
  />
</template>`
    }
  },

  tile: {
    id: "tile",
    slug: "tile",
    nodes: [
      wrap([
        {
          comp: "Tile",
          props: {
            title: "Plan Starter",
            description: "Idéal pour explorer le design system.",
            variant: "static"
          }
        },
        {
          comp: "Tile",
          props: {
            title: "Plan Pro",
            description: "Accès complet aux composants avancés.",
            variant: "clickable"
          }
        },
        {
          comp: "Tile",
          props: {
            title: "Plan Entreprise",
            description: "Support prioritaire et SLA garanti.",
            variant: "selectable",
            selected: true
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Tile } from "@sentropic/design-system-svelte";
</script>

<Tile title="Plan Starter" description="Idéal pour explorer le design system." variant="static" />
<Tile title="Plan Pro" description="Accès complet aux composants avancés." variant="clickable" />
<Tile title="Plan Entreprise" description="Support prioritaire et SLA garanti." variant="selectable" selected />`,
      react: `import { Tile } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Tile title="Plan Starter" description="Idéal pour explorer le design system." variant="static" />
      <Tile title="Plan Pro" description="Accès complet aux composants avancés." variant="clickable" />
      <Tile title="Plan Entreprise" description="Support prioritaire et SLA garanti." variant="selectable" selected />
    </>
  );
}`,
      vue: `<script setup>
import { Tile } from "@sentropic/design-system-vue";
</script>

<template>
  <Tile title="Plan Starter" description="Idéal pour explorer le design system." variant="static" />
  <Tile title="Plan Pro" description="Accès complet aux composants avancés." variant="clickable" />
  <Tile title="Plan Entreprise" description="Support prioritaire et SLA garanti." variant="selectable" :selected="true" />
</template>`
    }
  },

  contentswitcher: {
    id: "contentswitcher",
    slug: "content-switcher",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "ContentSwitcher",
            props: {
              items: [
                { id: "list", label: "Liste" },
                { id: "grid", label: "Grille" },
                { id: "table", label: "Tableau" }
              ]
            }
          },
          {
            comp: "ContentSwitcher",
            props: {
              size: "sm",
              items: [
                { id: "day", label: "Jour" },
                { id: "week", label: "Semaine" },
                { id: "month", label: "Mois" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { ContentSwitcher } from "@sentropic/design-system-svelte";
</script>

<ContentSwitcher
  items={[
    { id: "list", label: "Liste" },
    { id: "grid", label: "Grille" },
    { id: "table", label: "Tableau" }
  ]}
/>
<ContentSwitcher
  size="sm"
  items={[
    { id: "day", label: "Jour" },
    { id: "week", label: "Semaine" },
    { id: "month", label: "Mois" }
  ]}
/>`,
      react: `import { ContentSwitcher } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <ContentSwitcher
        items={[
          { id: "list", label: "Liste" },
          { id: "grid", label: "Grille" },
          { id: "table", label: "Tableau" }
        ]}
      />
      <ContentSwitcher
        size="sm"
        items={[
          { id: "day", label: "Jour" },
          { id: "week", label: "Semaine" },
          { id: "month", label: "Mois" }
        ]}
      />
    </>
  );
}`,
      vue: `<script setup>
import { ContentSwitcher } from "@sentropic/design-system-vue";
</script>

<template>
  <ContentSwitcher
    :items="[
      { id: 'list', label: 'Liste' },
      { id: 'grid', label: 'Grille' },
      { id: 'table', label: 'Tableau' }
    ]"
  />
  <ContentSwitcher
    size="sm"
    :items="[
      { id: 'day', label: 'Jour' },
      { id: 'week', label: 'Semaine' },
      { id: 'month', label: 'Mois' }
    ]"
  />
</template>`
    }
  },

  skeletontext: {
    id: "skeletontext",
    slug: "skeleton-text",
    nodes: [
      wrap([
        { comp: "SkeletonText", props: { lines: 3, label: "Chargement du contenu…" } },
        { comp: "SkeletonText", props: { lines: 5, label: "Chargement de l'article…" } }
      ])
    ],
    code: {
      svelte: `<script>
  import { SkeletonText } from "@sentropic/design-system-svelte";
</script>

<SkeletonText lines={3} label="Chargement du contenu…" />
<SkeletonText lines={5} label="Chargement de l'article…" />`,
      react: `import { SkeletonText } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <SkeletonText lines={3} label="Chargement du contenu…" />
      <SkeletonText lines={5} label="Chargement de l'article…" />
    </>
  );
}`,
      vue: `<script setup>
import { SkeletonText } from "@sentropic/design-system-vue";
</script>

<template>
  <SkeletonText :lines="3" label="Chargement du contenu…" />
  <SkeletonText :lines="5" label="Chargement de l'article…" />
</template>`
    }
  },

  progressindicator: {
    id: "progressindicator",
    slug: "progress-indicator",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "ProgressIndicator",
            props: {
              items: [
                { id: "account", label: "Compte", status: "complete" },
                { id: "project", label: "Projet", status: "current" },
                { id: "deploy", label: "Déploiement", status: "incomplete" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { ProgressIndicator } from "@sentropic/design-system-svelte";
</script>

<ProgressIndicator
  items={[
    { id: "account", label: "Compte", status: "complete" },
    { id: "project", label: "Projet", status: "current" },
    { id: "deploy", label: "Déploiement", status: "incomplete" }
  ]}
/>`,
      react: `import { ProgressIndicator } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ProgressIndicator
      items={[
        { id: "account", label: "Compte", status: "complete" },
        { id: "project", label: "Projet", status: "current" },
        { id: "deploy", label: "Déploiement", status: "incomplete" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { ProgressIndicator } from "@sentropic/design-system-vue";
</script>

<template>
  <ProgressIndicator
    :items="[
      { id: 'account', label: 'Compte', status: 'complete' },
      { id: 'project', label: 'Projet', status: 'current' },
      { id: 'deploy', label: 'Déploiement', status: 'incomplete' }
    ]"
  />
</template>`
    }
  },

  inlineloading: {
    id: "inlineloading",
    slug: "inline-loading",
    nodes: [
      wrap([
        { comp: "InlineLoading", props: { label: "Enregistrement…", status: "active" } },
        { comp: "InlineLoading", props: { label: "Enregistré", status: "success" } },
        { comp: "InlineLoading", props: { label: "Échec de l'enregistrement", status: "error" } }
      ])
    ],
    code: {
      svelte: `<script>
  import { InlineLoading } from "@sentropic/design-system-svelte";
</script>

<InlineLoading label="Enregistrement…" status="active" />
<InlineLoading label="Enregistré" status="success" />
<InlineLoading label="Échec de l'enregistrement" status="error" />`,
      react: `import { InlineLoading } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <InlineLoading label="Enregistrement…" status="active" />
      <InlineLoading label="Enregistré" status="success" />
      <InlineLoading label="Échec de l'enregistrement" status="error" />
    </>
  );
}`,
      vue: `<script setup>
import { InlineLoading } from "@sentropic/design-system-vue";
</script>

<template>
  <InlineLoading label="Enregistrement…" status="active" />
  <InlineLoading label="Enregistré" status="success" />
  <InlineLoading label="Échec de l'enregistrement" status="error" />
</template>`
    }
  },

  loadingstate: {
    id: "loadingstate",
    slug: "loading-state",
    nodes: [
      wrap([
        { comp: "LoadingState", props: { label: "Chargement des composants…", variant: "spinner" } },
        { comp: "LoadingState", props: { label: "Chargement du contenu…", variant: "skeleton" } }
      ])
    ],
    code: {
      svelte: `<script>
  import { LoadingState } from "@sentropic/design-system-svelte";
</script>

<LoadingState label="Chargement des composants…" variant="spinner" />
<LoadingState label="Chargement du contenu…" variant="skeleton" />`,
      react: `import { LoadingState } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <LoadingState label="Chargement des composants…" variant="spinner" />
      <LoadingState label="Chargement du contenu…" variant="skeleton" />
    </>
  );
}`,
      vue: `<script setup>
import { LoadingState } from "@sentropic/design-system-vue";
</script>

<template>
  <LoadingState label="Chargement des composants…" variant="spinner" />
  <LoadingState label="Chargement du contenu…" variant="skeleton" />
</template>`
    }
  },

  codesnippet: {
    id: "codesnippet",
    slug: "code-snippet",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "CodeSnippet",
            props: { code: "npm install @sentropic/design-system-react" }
          },
          {
            comp: "CodeSnippet",
            props: { code: "import { Button } from \"@sentropic/design-system-react\";" }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { CodeSnippet } from "@sentropic/design-system-svelte";
</script>

<CodeSnippet code="npm install @sentropic/design-system-react" />
<CodeSnippet code={'import { Button } from "@sentropic/design-system-react";'} />`,
      react: `import { CodeSnippet } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <CodeSnippet code="npm install @sentropic/design-system-react" />
      <CodeSnippet code={'import { Button } from "@sentropic/design-system-react";'} />
    </>
  );
}`,
      vue: `<script setup>
import { CodeSnippet } from "@sentropic/design-system-vue";
</script>

<template>
  <CodeSnippet code="npm install @sentropic/design-system-react" />
  <CodeSnippet code='import { Button } from &quot;@sentropic/design-system-react&quot;;' />
</template>`
    }
  },

  copybutton: {
    id: "copybutton",
    slug: "copy-button",
    nodes: [
      wrap([
        { comp: "CopyButton", props: { text: "npm install @sentropic/design-system-react", label: "Copier" } },
        { comp: "CopyButton", props: { text: "https://sent-tech.ca", label: "Copier l'URL", size: "sm" } }
      ])
    ],
    code: {
      svelte: `<script>
  import { CopyButton } from "@sentropic/design-system-svelte";
</script>

<CopyButton text="npm install @sentropic/design-system-react" label="Copier" />
<CopyButton text="https://sent-tech.ca" label="Copier l'URL" size="sm" />`,
      react: `import { CopyButton } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <CopyButton text="npm install @sentropic/design-system-react" label="Copier" />
      <CopyButton text="https://sent-tech.ca" label="Copier l'URL" size="sm" />
    </>
  );
}`,
      vue: `<script setup>
import { CopyButton } from "@sentropic/design-system-vue";
</script>

<template>
  <CopyButton text="npm install @sentropic/design-system-react" label="Copier" />
  <CopyButton text="https://sent-tech.ca" label="Copier l'URL" size="sm" />
</template>`
    }
  },

  orderedlist: {
    id: "orderedlist",
    slug: "ordered-list",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "OrderedList",
            props: {
              items: [
                "Installer les dépendances",
                "Importer le ThemeProvider",
                "Utiliser les composants"
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { OrderedList } from "@sentropic/design-system-svelte";
</script>

<OrderedList
  items={[
    "Installer les dépendances",
    "Importer le ThemeProvider",
    "Utiliser les composants"
  ]}
/>`,
      react: `import { OrderedList } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <OrderedList
      items={[
        "Installer les dépendances",
        "Importer le ThemeProvider",
        "Utiliser les composants"
      ]}
    />
  );
}`,
      vue: `<script setup>
import { OrderedList } from "@sentropic/design-system-vue";
</script>

<template>
  <OrderedList
    :items="[
      'Installer les dépendances',
      'Importer le ThemeProvider',
      'Utiliser les composants'
    ]"
  />
</template>`
    }
  },

  unorderedlist: {
    id: "unorderedlist",
    slug: "unordered-list",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "UnorderedList",
            props: {
              items: [
                "Svelte",
                "React",
                "Vue"
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { UnorderedList } from "@sentropic/design-system-svelte";
</script>

<UnorderedList items={["Svelte", "React", "Vue"]} />`,
      react: `import { UnorderedList } from "@sentropic/design-system-react";

export function Demo() {
  return <UnorderedList items={["Svelte", "React", "Vue"]} />;
}`,
      vue: `<script setup>
import { UnorderedList } from "@sentropic/design-system-vue";
</script>

<template>
  <UnorderedList :items="['Svelte', 'React', 'Vue']" />
</template>`
    }
  },

  structuredlist: {
    id: "structuredlist",
    slug: "structured-list",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "StructuredList",
            props: {
              items: [
                { term: "Framework", description: "Svelte, React, Vue" },
                { term: "Version", description: "1.0.0" },
                { term: "Licence", description: "MIT" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { StructuredList } from "@sentropic/design-system-svelte";
</script>

<StructuredList
  items={[
    { term: "Framework", description: "Svelte, React, Vue" },
    { term: "Version", description: "1.0.0" },
    { term: "Licence", description: "MIT" }
  ]}
/>`,
      react: `import { StructuredList } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <StructuredList
      items={[
        { term: "Framework", description: "Svelte, React, Vue" },
        { term: "Version", description: "1.0.0" },
        { term: "Licence", description: "MIT" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { StructuredList } from "@sentropic/design-system-vue";
</script>

<template>
  <StructuredList
    :items="[
      { term: 'Framework', description: 'Svelte, React, Vue' },
      { term: 'Version', description: '1.0.0' },
      { term: 'Licence', description: 'MIT' }
    ]"
  />
</template>`
    }
  },

  skiplink: {
    id: "skiplink",
    slug: "skip-link",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          { comp: "SkipLink", props: { href: "#main" }, children: ["Aller au contenu principal"] },
          { comp: "SkipLink", props: { href: "#nav" }, children: ["Aller à la navigation"] }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { SkipLink } from "@sentropic/design-system-svelte";
</script>

<!-- Les SkipLink sont visibles uniquement au focus (Tab) -->
<SkipLink href="#main">Aller au contenu principal</SkipLink>
<SkipLink href="#nav">Aller à la navigation</SkipLink>`,
      react: `import { SkipLink } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      {/* Les SkipLink sont visibles uniquement au focus (Tab) */}
      <SkipLink href="#main">Aller au contenu principal</SkipLink>
      <SkipLink href="#nav">Aller à la navigation</SkipLink>
    </>
  );
}`,
      vue: `<script setup>
import { SkipLink } from "@sentropic/design-system-vue";
</script>

<template>
  <!-- Les SkipLink sont visibles uniquement au focus (Tab) -->
  <SkipLink href="#main">Aller au contenu principal</SkipLink>
  <SkipLink href="#nav">Aller à la navigation</SkipLink>
</template>`
    }
  },

  header: {
    id: "header",
    slug: "header",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Header",
            props: {
              title: "Sent Tech",
              navItems: [
                { label: "Composants", href: "/components" },
                { label: "Documentation", href: "/docs" },
                { label: "Blog", href: "/blog" }
              ],
              account: { name: "Fabien Antoine", email: "fabien@sent-tech.ca" }
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Header } from "@sentropic/design-system-svelte";
</script>

<Header
  title="Sent Tech"
  navItems={[
    { label: "Composants", href: "/components" },
    { label: "Documentation", href: "/docs" },
    { label: "Blog", href: "/blog" }
  ]}
  account={{ name: "Fabien Antoine", email: "fabien@sent-tech.ca" }}
/>`,
      react: `import { Header } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Header
      title="Sent Tech"
      navItems={[
        { label: "Composants", href: "/components" },
        { label: "Documentation", href: "/docs" },
        { label: "Blog", href: "/blog" }
      ]}
      account={{ name: "Fabien Antoine", email: "fabien@sent-tech.ca" }}
    />
  );
}`,
      vue: `<script setup>
import { Header } from "@sentropic/design-system-vue";
</script>

<template>
  <Header
    title="Sent Tech"
    :navItems="[
      { label: 'Composants', href: '/components' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Blog', href: '/blog' }
    ]"
    :account="{ name: 'Fabien Antoine', email: 'fabien@sent-tech.ca' }"
  />
</template>`
    }
  },

  sidenav: {
    id: "sidenav",
    slug: "side-nav",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "SideNav",
            props: {
              items: [
                { label: "Vue d'ensemble", href: "/overview", active: true },
                { label: "Composants", href: "/components" },
                { label: "Tokens", href: "/tokens" },
                { label: "Documentation", href: "/docs" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { SideNav } from "@sentropic/design-system-svelte";
</script>

<SideNav
  items={[
    { label: "Vue d'ensemble", href: "/overview", active: true },
    { label: "Composants", href: "/components" },
    { label: "Tokens", href: "/tokens" },
    { label: "Documentation", href: "/docs" }
  ]}
/>`,
      react: `import { SideNav } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <SideNav
      items={[
        { label: "Vue d'ensemble", href: "/overview", active: true },
        { label: "Composants", href: "/components" },
        { label: "Tokens", href: "/tokens" },
        { label: "Documentation", href: "/docs" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { SideNav } from "@sentropic/design-system-vue";
</script>

<template>
  <SideNav
    :items="[
      { label: 'Vue d\\'ensemble', href: '/overview', active: true },
      { label: 'Composants', href: '/components' },
      { label: 'Tokens', href: '/tokens' },
      { label: 'Documentation', href: '/docs' }
    ]"
  />
</template>`
    }
  },

  form: {
    id: "form",
    slug: "form",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Form",
            props: { status: "idle" },
            children: [
              { comp: "Input", props: { label: "Nom du projet", placeholder: "Sent Forge" } },
              { comp: "Input", props: { label: "URL", placeholder: "https://", type: "url" } },
              { comp: "Button", props: { variant: "primary", type: "submit" }, children: ["Créer"] }
            ]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Form, Input, Button } from "@sentropic/design-system-svelte";
</script>

<Form status="idle">
  <Input label="Nom du projet" placeholder="Sent Forge" />
  <Input label="URL" placeholder="https://" type="url" />
  <Button variant="primary" type="submit">Créer</Button>
</Form>`,
      react: `import { Form, Input, Button } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Form status="idle">
      <Input label="Nom du projet" placeholder="Sent Forge" />
      <Input label="URL" placeholder="https://" type="url" />
      <Button variant="primary" type="submit">Créer</Button>
    </Form>
  );
}`,
      vue: `<script setup>
import { Form, Input, Button } from "@sentropic/design-system-vue";
</script>

<template>
  <Form status="idle">
    <Input label="Nom du projet" placeholder="Sent Forge" />
    <Input label="URL" placeholder="https://" type="url" />
    <Button variant="primary" type="submit">Créer</Button>
  </Form>
</template>`
    }
  },

  formgroup: {
    id: "formgroup",
    slug: "form-group",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "FormGroup",
            props: { legend: "Préférences de notification", helperText: "Choisissez comment recevoir les alertes." },
            children: [
              { comp: "Checkbox", props: { label: "Par e-mail", checked: true } },
              { comp: "Checkbox", props: { label: "Par SMS" } },
              { comp: "Checkbox", props: { label: "Dans l'application", checked: true } }
            ]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { FormGroup, Checkbox } from "@sentropic/design-system-svelte";
</script>

<FormGroup legend="Préférences de notification" helperText="Choisissez comment recevoir les alertes.">
  <Checkbox label="Par e-mail" checked />
  <Checkbox label="Par SMS" />
  <Checkbox label="Dans l'application" checked />
</FormGroup>`,
      react: `import { FormGroup, Checkbox } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <FormGroup legend="Préférences de notification" helperText="Choisissez comment recevoir les alertes.">
      <Checkbox label="Par e-mail" defaultChecked />
      <Checkbox label="Par SMS" />
      <Checkbox label="Dans l'application" defaultChecked />
    </FormGroup>
  );
}`,
      vue: `<script setup>
import { FormGroup, Checkbox } from "@sentropic/design-system-vue";
</script>

<template>
  <FormGroup legend="Préférences de notification" helperText="Choisissez comment recevoir les alertes.">
    <Checkbox label="Par e-mail" :checked="true" />
    <Checkbox label="Par SMS" />
    <Checkbox label="Dans l'application" :checked="true" />
  </FormGroup>
</template>`
    }
  },

  fileuploader: {
    id: "fileuploader",
    slug: "file-uploader",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "FileUploader",
            props: {
              label: "Glisser-déposer ou cliquer pour importer",
              // Forme compatible avec les 3 moteurs : React/Vue lisent `name`/`size`
              // au niveau racine ; Svelte lit `file.name`/`file.size`. On fournit
              // donc les deux (le même fichier, dupliqué) pour une parité stricte.
              items: [
                {
                  name: "design-tokens.json",
                  size: 18432,
                  file: { name: "design-tokens.json", size: 18432 },
                  status: "complete"
                },
                {
                  name: "composants.zip",
                  size: 524288,
                  file: { name: "composants.zip", size: 524288 },
                  status: "uploading"
                },
                {
                  name: "fichier-invalide.exe",
                  size: 9216,
                  file: { name: "fichier-invalide.exe", size: 9216 },
                  status: "error",
                  error: "Format non supporté"
                }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { FileUploader } from "@sentropic/design-system-svelte";

  // Le composant Svelte attend des entrées { file, status } (file: File).
  const items = [
    { file: new File([], "design-tokens.json"), status: "complete" },
    { file: new File([], "composants.zip"), status: "uploading" },
    { file: new File([], "fichier-invalide.exe"), status: "error", error: "Format non supporté" }
  ];
</script>

<FileUploader label="Glisser-déposer ou cliquer pour importer" {items} />`,
      react: `import { FileUploader } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <FileUploader
      label="Glisser-déposer ou cliquer pour importer"
      items={[
        { name: "design-tokens.json", status: "complete" },
        { name: "composants.zip", status: "uploading" },
        { name: "fichier-invalide.exe", status: "error", error: "Format non supporté" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { FileUploader } from "@sentropic/design-system-vue";
</script>

<template>
  <FileUploader
    label="Glisser-déposer ou cliquer pour importer"
    :items="[
      { name: 'design-tokens.json', status: 'complete' },
      { name: 'composants.zip', status: 'uploading' },
      { name: 'fichier-invalide.exe', status: 'error', error: 'Format non supporté' }
    ]"
  />
</template>`
    }
  },

  languageselector: {
    id: "languageselector",
    slug: "language-selector",
    nodes: [
      wrap([
        {
          comp: "LanguageSelector",
          props: {
            value: "fr",
            options: [
              { value: "fr", label: "Français" },
              { value: "en", label: "English" },
              { value: "es", label: "Español" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { LanguageSelector } from "@sentropic/design-system-svelte";
</script>

<LanguageSelector
  value="fr"
  options={[
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" }
  ]}
/>`,
      react: `import { LanguageSelector } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <LanguageSelector
      value="fr"
      options={[
        { value: "fr", label: "Français" },
        { value: "en", label: "English" },
        { value: "es", label: "Español" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { LanguageSelector } from "@sentropic/design-system-vue";
</script>

<template>
  <LanguageSelector
    value="fr"
    :options="[
      { value: 'fr', label: 'Français' },
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' }
    ]"
  />
</template>`
    }
  },

  table: {
    id: "table",
    slug: "table",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Table",
            props: {
              caption: "Composants du design system",
              columns: [
                { key: "name", label: "Composant" },
                { key: "category", label: "Catégorie" },
                { key: "status", label: "Statut" }
              ],
              rows: [
                { id: "1", name: "Button", category: "Action", status: "Stable" },
                { id: "2", name: "Input", category: "Formulaire", status: "Stable" },
                { id: "3", name: "DataTable", category: "Données", status: "Stable" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Table } from "@sentropic/design-system-svelte";
</script>

<Table
  caption="Composants du design system"
  columns={[
    { key: "name", label: "Composant" },
    { key: "category", label: "Catégorie" },
    { key: "status", label: "Statut" }
  ]}
  rows={[
    { id: "1", name: "Button", category: "Action", status: "Stable" },
    { id: "2", name: "Input", category: "Formulaire", status: "Stable" },
    { id: "3", name: "DataTable", category: "Données", status: "Stable" }
  ]}
/>`,
      react: `import { Table } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Table
      caption="Composants du design system"
      columns={[
        { key: "name", label: "Composant" },
        { key: "category", label: "Catégorie" },
        { key: "status", label: "Statut" }
      ]}
      rows={[
        { id: "1", name: "Button", category: "Action", status: "Stable" },
        { id: "2", name: "Input", category: "Formulaire", status: "Stable" },
        { id: "3", name: "DataTable", category: "Données", status: "Stable" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { Table } from "@sentropic/design-system-vue";
</script>

<template>
  <Table
    caption="Composants du design system"
    :columns="[
      { key: 'name', label: 'Composant' },
      { key: 'category', label: 'Catégorie' },
      { key: 'status', label: 'Statut' }
    ]"
    :rows="[
      { id: '1', name: 'Button', category: 'Action', status: 'Stable' },
      { id: '2', name: 'Input', category: 'Formulaire', status: 'Stable' },
      { id: '3', name: 'DataTable', category: 'Données', status: 'Stable' }
    ]"
  />
</template>`
    }
  },

  datatable: {
    id: "datatable",
    slug: "data-table",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "DataTable",
            props: {
              caption: "Déploiements récents",
              columns: [
                { key: "env", label: "Environnement" },
                { key: "version", label: "Version" },
                { key: "date", label: "Date" },
                { key: "status", label: "Statut" }
              ],
              rows: [
                { id: "1", env: "Production", version: "v1.4.2", date: "2026-06-01", status: "Succès" },
                { id: "2", env: "Staging", version: "v1.4.3-rc1", date: "2026-06-02", status: "En cours" },
                { id: "3", env: "Dev", version: "v1.5.0-alpha", date: "2026-06-02", status: "Échoué" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { DataTable } from "@sentropic/design-system-svelte";
</script>

<DataTable
  caption="Déploiements récents"
  columns={[
    { key: "env", label: "Environnement" },
    { key: "version", label: "Version" },
    { key: "date", label: "Date" },
    { key: "status", label: "Statut" }
  ]}
  rows={[
    { id: "1", env: "Production", version: "v1.4.2", date: "2026-06-01", status: "Succès" },
    { id: "2", env: "Staging", version: "v1.4.3-rc1", date: "2026-06-02", status: "En cours" },
    { id: "3", env: "Dev", version: "v1.5.0-alpha", date: "2026-06-02", status: "Échoué" }
  ]}
/>`,
      react: `import { DataTable } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <DataTable
      caption="Déploiements récents"
      columns={[
        { key: "env", label: "Environnement" },
        { key: "version", label: "Version" },
        { key: "date", label: "Date" },
        { key: "status", label: "Statut" }
      ]}
      rows={[
        { id: "1", env: "Production", version: "v1.4.2", date: "2026-06-01", status: "Succès" },
        { id: "2", env: "Staging", version: "v1.4.3-rc1", date: "2026-06-02", status: "En cours" },
        { id: "3", env: "Dev", version: "v1.5.0-alpha", date: "2026-06-02", status: "Échoué" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { DataTable } from "@sentropic/design-system-vue";
</script>

<template>
  <DataTable
    caption="Déploiements récents"
    :columns="[
      { key: 'env', label: 'Environnement' },
      { key: 'version', label: 'Version' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Statut' }
    ]"
    :rows="[
      { id: '1', env: 'Production', version: 'v1.4.2', date: '2026-06-01', status: 'Succès' },
      { id: '2', env: 'Staging', version: 'v1.4.3-rc1', date: '2026-06-02', status: 'En cours' },
      { id: '3', env: 'Dev', version: 'v1.5.0-alpha', date: '2026-06-02', status: 'Échoué' }
    ]"
  />
</template>`
    }
  },

  treeview: {
    id: "treeview",
    slug: "tree-view",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "TreeView",
            props: {
              defaultExpanded: ["components", "forms"],
              selected: "button",
              nodes: [
                {
                  id: "components",
                  label: "Composants",
                  children: [
                    { id: "button", label: "Button" },
                    { id: "input", label: "Input" }
                  ]
                },
                {
                  id: "forms",
                  label: "Formulaires",
                  children: [
                    { id: "form", label: "Form" },
                    { id: "formgroup", label: "FormGroup" }
                  ]
                },
                { id: "tokens", label: "Tokens" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { TreeView } from "@sentropic/design-system-svelte";
</script>

<TreeView
  defaultExpanded={["components", "forms"]}
  selected="button"
  nodes={[
    {
      id: "components",
      label: "Composants",
      children: [
        { id: "button", label: "Button" },
        { id: "input", label: "Input" }
      ]
    },
    {
      id: "forms",
      label: "Formulaires",
      children: [
        { id: "form", label: "Form" },
        { id: "formgroup", label: "FormGroup" }
      ]
    },
    { id: "tokens", label: "Tokens" }
  ]}
/>`,
      react: `import { TreeView } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <TreeView
      defaultExpandedIds={["components", "forms"]}
      selectedId="button"
      nodes={[
        {
          id: "components",
          label: "Composants",
          children: [
            { id: "button", label: "Button" },
            { id: "input", label: "Input" }
          ]
        },
        {
          id: "forms",
          label: "Formulaires",
          children: [
            { id: "form", label: "Form" },
            { id: "formgroup", label: "FormGroup" }
          ]
        },
        { id: "tokens", label: "Tokens" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { TreeView } from "@sentropic/design-system-vue";
</script>

<template>
  <TreeView
    :defaultExpandedIds="['components', 'forms']"
    selectedId="button"
    :nodes="[
      {
        id: 'components',
        label: 'Composants',
        children: [
          { id: 'button', label: 'Button' },
          { id: 'input', label: 'Input' }
        ]
      },
      {
        id: 'forms',
        label: 'Formulaires',
        children: [
          { id: 'form', label: 'Form' },
          { id: 'formgroup', label: 'FormGroup' }
        ]
      },
      { id: 'tokens', label: 'Tokens' }
    ]"
  />
</template>`
    }
  },

  combobox: {
    id: "combobox",
    slug: "combobox",
    nodes: [
      wrap([
        {
          comp: "Combobox",
          props: {
            label: "Framework",
            placeholder: "Choisir ou saisir…",
            options: [
              { value: "svelte", label: "Svelte" },
              { value: "react", label: "React" },
              { value: "vue", label: "Vue" },
              { value: "angular", label: "Angular" }
            ]
          }
        },
        {
          comp: "Combobox",
          props: {
            label: "Région",
            placeholder: "Choisir une région…",
            value: "ca-qc",
            options: [
              { value: "ca-qc", label: "Canada — Québec" },
              { value: "ca-on", label: "Canada — Ontario" },
              { value: "us-east", label: "États-Unis — Est" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Combobox } from "@sentropic/design-system-svelte";
</script>

<Combobox
  label="Framework"
  placeholder="Choisir ou saisir…"
  options={[
    { value: "svelte", label: "Svelte" },
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" }
  ]}
/>
<Combobox
  label="Région"
  value="ca-qc"
  options={[
    { value: "ca-qc", label: "Canada — Québec" },
    { value: "ca-on", label: "Canada — Ontario" },
    { value: "us-east", label: "États-Unis — Est" }
  ]}
/>`,
      react: `import { Combobox } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Combobox
        label="Framework"
        placeholder="Choisir ou saisir…"
        options={[
          { value: "svelte", label: "Svelte" },
          { value: "react", label: "React" },
          { value: "vue", label: "Vue" }
        ]}
      />
      <Combobox
        label="Région"
        value="ca-qc"
        options={[
          { value: "ca-qc", label: "Canada — Québec" },
          { value: "ca-on", label: "Canada — Ontario" },
          { value: "us-east", label: "États-Unis — Est" }
        ]}
      />
    </>
  );
}`,
      vue: `<script setup>
import { Combobox } from "@sentropic/design-system-vue";
</script>

<template>
  <Combobox
    label="Framework"
    placeholder="Choisir ou saisir…"
    :options="[
      { value: 'svelte', label: 'Svelte' },
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' }
    ]"
  />
  <Combobox
    label="Région"
    value="ca-qc"
    :options="[
      { value: 'ca-qc', label: 'Canada — Québec' },
      { value: 'ca-on', label: 'Canada — Ontario' },
      { value: 'us-east', label: 'États-Unis — Est' }
    ]"
  />
</template>`
    }
  },

  multiselect: {
    id: "multiselect",
    slug: "multi-select",
    nodes: [
      wrap([
        {
          comp: "MultiSelect",
          props: {
            label: "Frameworks supportés",
            placeholder: "Sélectionner…",
            values: ["svelte", "react"],
            selected: ["svelte", "react"],
            options: [
              { value: "svelte", label: "Svelte" },
              { value: "react", label: "React" },
              { value: "vue", label: "Vue" },
              { value: "angular", label: "Angular" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { MultiSelect } from "@sentropic/design-system-svelte";
</script>

<MultiSelect
  label="Frameworks supportés"
  placeholder="Sélectionner…"
  selected={["svelte", "react"]}
  options={[
    { value: "svelte", label: "Svelte" },
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" }
  ]}
/>`,
      react: `import { MultiSelect } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <MultiSelect
      label="Frameworks supportés"
      values={["svelte", "react"]}
      options={[
        { value: "svelte", label: "Svelte" },
        { value: "react", label: "React" },
        { value: "vue", label: "Vue" },
        { value: "angular", label: "Angular" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { MultiSelect } from "@sentropic/design-system-vue";
</script>

<template>
  <MultiSelect
    label="Frameworks supportés"
    :values="['svelte', 'react']"
    :options="[
      { value: 'svelte', label: 'Svelte' },
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' }
    ]"
  />
</template>`
    }
  },

  datepicker: {
    id: "datepicker",
    slug: "date-picker",
    nodes: [
      wrap([
        {
          comp: "DatePicker",
          props: { label: "Date de déploiement", value: "2026-06-15" }
        },
        {
          comp: "DatePicker",
          props: { label: "Date d'expiration", value: "2026-12-31", size: "sm" }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { DatePicker } from "@sentropic/design-system-svelte";
</script>

<DatePicker label="Date de déploiement" value="2026-06-15" />
<DatePicker label="Date d'expiration" value="2026-12-31" size="sm" />`,
      react: `import { DatePicker } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <DatePicker label="Date de déploiement" value="2026-06-15" />
      <DatePicker label="Date d'expiration" value="2026-12-31" size="sm" />
    </>
  );
}`,
      vue: `<script setup>
import { DatePicker } from "@sentropic/design-system-vue";
</script>

<template>
  <DatePicker label="Date de déploiement" value="2026-06-15" />
  <DatePicker label="Date d'expiration" value="2026-12-31" size="sm" />
</template>`
    }
  },

  toast: {
    id: "toast",
    slug: "toast",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Toast",
            props: { tone: "success", title: "Déploiement réussi", message: "La version v1.4.2 est en production." }
          },
          {
            comp: "Toast",
            props: { tone: "error", title: "Erreur de déploiement", message: "Impossible de contacter le serveur." }
          },
          {
            comp: "Toast",
            props: { tone: "info", title: "Synchronisation en cours", message: "Les modifications seront disponibles dans quelques instants." }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Toast } from "@sentropic/design-system-svelte";
</script>

<Toast tone="success" title="Déploiement réussi" message="La version v1.4.2 est en production." />
<Toast tone="error" title="Erreur de déploiement" message="Impossible de contacter le serveur." />
<Toast tone="info" title="Synchronisation en cours" message="Les modifications seront disponibles dans quelques instants." />`,
      react: `import { Toast } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Toast tone="success" title="Déploiement réussi" message="La version v1.4.2 est en production." />
      <Toast tone="error" title="Erreur de déploiement" message="Impossible de contacter le serveur." />
      <Toast tone="info" title="Synchronisation en cours" message="Les modifications seront disponibles dans quelques instants." />
    </>
  );
}`,
      vue: `<script setup>
import { Toast } from "@sentropic/design-system-vue";
</script>

<template>
  <Toast tone="success" title="Déploiement réussi" message="La version v1.4.2 est en production." />
  <Toast tone="error" title="Erreur de déploiement" message="Impossible de contacter le serveur." />
  <Toast tone="info" title="Synchronisation en cours" message="Les modifications seront disponibles dans quelques instants." />
</template>`
    }
  },

  dropdown: {
    id: "dropdown",
    slug: "dropdown",
    nodes: [
      wrap([
        {
          comp: "Dropdown",
          props: {
            label: "Environnement",
            value: "staging",
            options: [
              { value: "prod", label: "Production" },
              { value: "staging", label: "Staging" },
              { value: "dev", label: "Développement" }
            ]
          }
        },
        {
          comp: "Dropdown",
          props: {
            label: "Taille",
            options: [
              { value: "sm", label: "Petite" },
              { value: "md", label: "Moyenne" },
              { value: "lg", label: "Grande" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Dropdown } from "@sentropic/design-system-svelte";
</script>

<Dropdown
  label="Environnement"
  value="staging"
  options={[
    { value: "prod", label: "Production" },
    { value: "staging", label: "Staging" },
    { value: "dev", label: "Développement" }
  ]}
/>
<Dropdown
  label="Taille"
  options={[
    { value: "sm", label: "Petite" },
    { value: "md", label: "Moyenne" },
    { value: "lg", label: "Grande" }
  ]}
/>`,
      react: `import { Dropdown } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Dropdown
        label="Environnement"
        value="staging"
        options={[
          { value: "prod", label: "Production" },
          { value: "staging", label: "Staging" },
          { value: "dev", label: "Développement" }
        ]}
      />
      <Dropdown
        label="Taille"
        options={[
          { value: "sm", label: "Petite" },
          { value: "md", label: "Moyenne" },
          { value: "lg", label: "Grande" }
        ]}
      />
    </>
  );
}`,
      vue: `<script setup>
import { Dropdown } from "@sentropic/design-system-vue";
</script>

<template>
  <Dropdown
    label="Environnement"
    value="staging"
    :options="[
      { value: 'prod', label: 'Production' },
      { value: 'staging', label: 'Staging' },
      { value: 'dev', label: 'Développement' }
    ]"
  />
  <Dropdown
    label="Taille"
    :options="[
      { value: 'sm', label: 'Petite' },
      { value: 'md', label: 'Moyenne' },
      { value: 'lg', label: 'Grande' }
    ]"
  />
</template>`
    }
  },

  areachart: {
    id: "areachart",
    slug: "area-chart",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "AreaChart",
            props: {
              label: "Visites mensuelles",
              data: [
                { x: "Jan", y: 40 },
                { x: "Fév", y: 65 },
                { x: "Mar", y: 55 },
                { x: "Avr", y: 80 },
                { x: "Mai", y: 72 }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { AreaChart } from "@sentropic/design-system-svelte";
</script>

<AreaChart
  label="Visites mensuelles"
  data={[
    { x: "Jan", y: 40 },
    { x: "Fév", y: 65 },
    { x: "Mar", y: 55 },
    { x: "Avr", y: 80 },
    { x: "Mai", y: 72 }
  ]}
/>`,
      react: `import { AreaChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <AreaChart
      label="Visites mensuelles"
      data={[
        { x: "Jan", y: 40 },
        { x: "Fév", y: 65 },
        { x: "Mar", y: 55 },
        { x: "Avr", y: 80 },
        { x: "Mai", y: 72 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { AreaChart } from "@sentropic/design-system-vue";
</script>

<template>
  <AreaChart
    label="Visites mensuelles"
    :data="[
      { x: 'Jan', y: 40 },
      { x: 'Fév', y: 65 },
      { x: 'Mar', y: 55 },
      { x: 'Avr', y: 80 },
      { x: 'Mai', y: 72 }
    ]"
  />
</template>`
    }
  },

  arearangechart: {
    id: "arearangechart",
    slug: "area-range-chart",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "AreaRangeChart",
            props: {
              label: "Fourchette de température par jour",
              data: [
                { x: "Lun", low: 8, high: 17 },
                { x: "Mar", low: 9, high: 19 },
                { x: "Mer", low: 11, high: 22 },
                { x: "Jeu", low: 10, high: 20 },
                { x: "Ven", low: 7, high: 16 }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { AreaRangeChart } from "@sentropic/design-system-svelte";
</script>

<AreaRangeChart
  label="Fourchette de température par jour"
  data={[
    { x: "Lun", low: 8, high: 17 },
    { x: "Mar", low: 9, high: 19 },
    { x: "Mer", low: 11, high: 22 },
    { x: "Jeu", low: 10, high: 20 },
    { x: "Ven", low: 7, high: 16 }
  ]}
/>`,
      react: `import { AreaRangeChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <AreaRangeChart
      label="Fourchette de température par jour"
      data={[
        { x: "Lun", low: 8, high: 17 },
        { x: "Mar", low: 9, high: 19 },
        { x: "Mer", low: 11, high: 22 },
        { x: "Jeu", low: 10, high: 20 },
        { x: "Ven", low: 7, high: 16 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { AreaRangeChart } from "@sentropic/design-system-vue";
</script>

<template>
  <AreaRangeChart
    label="Fourchette de température par jour"
    :data="[
      { x: 'Lun', low: 8, high: 17 },
      { x: 'Mar', low: 9, high: 19 },
      { x: 'Mer', low: 11, high: 22 },
      { x: 'Jeu', low: 10, high: 20 },
      { x: 'Ven', low: 7, high: 16 }
    ]"
  />
</template>`
    }
  },

  barchart: {
    id: "barchart",
    slug: "bar-chart",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "BarChart",
            props: {
              label: "Déploiements par environnement",
              data: [
                { x: "Production", y: 12 },
                { x: "Staging", y: 28 },
                { x: "Dev", y: 45 },
                { x: "Test", y: 19 }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { BarChart } from "@sentropic/design-system-svelte";
</script>

<BarChart
  label="Déploiements par environnement"
  data={[
    { x: "Production", y: 12 },
    { x: "Staging", y: 28 },
    { x: "Dev", y: 45 },
    { x: "Test", y: 19 }
  ]}
/>`,
      react: `import { BarChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <BarChart
      label="Déploiements par environnement"
      data={[
        { x: "Production", y: 12 },
        { x: "Staging", y: 28 },
        { x: "Dev", y: 45 },
        { x: "Test", y: 19 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { BarChart } from "@sentropic/design-system-vue";
</script>

<template>
  <BarChart
    label="Déploiements par environnement"
    :data="[
      { x: 'Production', y: 12 },
      { x: 'Staging', y: 28 },
      { x: 'Dev', y: 45 },
      { x: 'Test', y: 19 }
    ]"
  />
</template>`
    }
  },

  linechart: {
    id: "linechart",
    slug: "line-chart",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "LineChart",
            props: {
              label: "Temps de réponse (ms)",
              data: [
                { x: "00h", y: 120 },
                { x: "06h", y: 95 },
                { x: "12h", y: 180 },
                { x: "18h", y: 145 },
                { x: "24h", y: 110 }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { LineChart } from "@sentropic/design-system-svelte";
</script>

<LineChart
  label="Temps de réponse (ms)"
  data={[
    { x: "00h", y: 120 },
    { x: "06h", y: 95 },
    { x: "12h", y: 180 },
    { x: "18h", y: 145 },
    { x: "24h", y: 110 }
  ]}
/>`,
      react: `import { LineChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <LineChart
      label="Temps de réponse (ms)"
      data={[
        { x: "00h", y: 120 },
        { x: "06h", y: 95 },
        { x: "12h", y: 180 },
        { x: "18h", y: 145 },
        { x: "24h", y: 110 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { LineChart } from "@sentropic/design-system-vue";
</script>

<template>
  <LineChart
    label="Temps de réponse (ms)"
    :data="[
      { x: '00h', y: 120 },
      { x: '06h', y: 95 },
      { x: '12h', y: 180 },
      { x: '18h', y: 145 },
      { x: '24h', y: 110 }
    ]"
  />
</template>`
    }
  },

  donutchart: {
    id: "donutchart",
    slug: "donut-chart",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "DonutChart",
            props: {
              label: "Répartition des composants",
              data: [
                { label: "Formulaires", value: 18 },
                { label: "Navigation", value: 12 },
                { label: "Données", value: 9 },
                { label: "Feedback", value: 15 }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { DonutChart } from "@sentropic/design-system-svelte";
</script>

<DonutChart
  label="Répartition des composants"
  data={[
    { label: "Formulaires", value: 18 },
    { label: "Navigation", value: 12 },
    { label: "Données", value: 9 },
    { label: "Feedback", value: 15 }
  ]}
/>`,
      react: `import { DonutChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <DonutChart
      label="Répartition des composants"
      data={[
        { label: "Formulaires", value: 18 },
        { label: "Navigation", value: 12 },
        { label: "Données", value: 9 },
        { label: "Feedback", value: 15 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { DonutChart } from "@sentropic/design-system-vue";
</script>

<template>
  <DonutChart
    label="Répartition des composants"
    :data="[
      { label: 'Formulaires', value: 18 },
      { label: 'Navigation', value: 12 },
      { label: 'Données', value: 9 },
      { label: 'Feedback', value: 15 }
    ]"
  />
</template>`
    }
  },

  scatterplot: {
    id: "scatterplot",
    slug: "scatter-plot",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "ScatterPlot",
            props: {
              label: "Performance vs complexité",
              data: [
                { x: 1, y: 9, label: "Button" },
                { x: 3, y: 7, label: "Input" },
                { x: 5, y: 5, label: "DataTable" },
                { x: 2, y: 8, label: "Badge" },
                { x: 6, y: 3, label: "TreeView" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { ScatterPlot } from "@sentropic/design-system-svelte";
</script>

<ScatterPlot
  label="Performance vs complexité"
  data={[
    { x: 1, y: 9, label: "Button" },
    { x: 3, y: 7, label: "Input" },
    { x: 5, y: 5, label: "DataTable" },
    { x: 2, y: 8, label: "Badge" },
    { x: 6, y: 3, label: "TreeView" }
  ]}
/>`,
      react: `import { ScatterPlot } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ScatterPlot
      label="Performance vs complexité"
      data={[
        { x: 1, y: 9, label: "Button" },
        { x: 3, y: 7, label: "Input" },
        { x: 5, y: 5, label: "DataTable" },
        { x: 2, y: 8, label: "Badge" },
        { x: 6, y: 3, label: "TreeView" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { ScatterPlot } from "@sentropic/design-system-vue";
</script>

<template>
  <ScatterPlot
    label="Performance vs complexité"
    :data="[
      { x: 1, y: 9, label: 'Button' },
      { x: 3, y: 7, label: 'Input' },
      { x: 5, y: 5, label: 'DataTable' },
      { x: 2, y: 8, label: 'Badge' },
      { x: 6, y: 3, label: 'TreeView' }
    ]"
  />
</template>`
    }
  },

  geomap: {
    id: "geomap",
    slug: "geo-map",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "GeoMap",
            props: {
              label: "Bureaux et flux",
              layers: [
                {
                  type: "points",
                  label: "Bureaux",
                  points: [
                    { latitude: 48.85, longitude: 2.35, label: "Paris", value: 12 },
                    { latitude: 45.5, longitude: -73.55, label: "Montréal", value: 8 },
                    { latitude: 35.68, longitude: 139.69, label: "Tokyo", value: 5 }
                  ]
                },
                {
                  type: "flow",
                  flows: [
                    {
                      source: { latitude: 48.85, longitude: 2.35 },
                      target: { latitude: 45.5, longitude: -73.55 },
                      value: 7,
                      label: "Paris → Montréal"
                    },
                    {
                      source: { latitude: 48.85, longitude: 2.35 },
                      target: { latitude: 35.68, longitude: 139.69 },
                      value: 3,
                      label: "Paris → Tokyo"
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { GeoMap } from "@sentropic/design-system-svelte";
</script>

<GeoMap
  label="Bureaux et flux"
  layers={[
    {
      type: "points",
      label: "Bureaux",
      points: [
        { latitude: 48.85, longitude: 2.35, label: "Paris", value: 12 },
        { latitude: 45.5, longitude: -73.55, label: "Montréal", value: 8 },
        { latitude: 35.68, longitude: 139.69, label: "Tokyo", value: 5 }
      ]
    },
    {
      type: "flow",
      flows: [
        {
          source: { latitude: 48.85, longitude: 2.35 },
          target: { latitude: 45.5, longitude: -73.55 },
          value: 7,
          label: "Paris → Montréal"
        }
      ]
    }
  ]}
/>`,
      react: `import { GeoMap } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <GeoMap
      label="Bureaux et flux"
      layers={[
        {
          type: "points",
          label: "Bureaux",
          points: [
            { latitude: 48.85, longitude: 2.35, label: "Paris", value: 12 },
            { latitude: 45.5, longitude: -73.55, label: "Montréal", value: 8 },
            { latitude: 35.68, longitude: 139.69, label: "Tokyo", value: 5 }
          ]
        },
        {
          type: "flow",
          flows: [
            {
              source: { latitude: 48.85, longitude: 2.35 },
              target: { latitude: 45.5, longitude: -73.55 },
              value: 7,
              label: "Paris → Montréal"
            }
          ]
        }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { GeoMap } from "@sentropic/design-system-vue";
</script>

<template>
  <GeoMap
    label="Bureaux et flux"
    :layers="[
      {
        type: 'points',
        label: 'Bureaux',
        points: [
          { latitude: 48.85, longitude: 2.35, label: 'Paris', value: 12 },
          { latitude: 45.5, longitude: -73.55, label: 'Montréal', value: 8 },
          { latitude: 35.68, longitude: 139.69, label: 'Tokyo', value: 5 }
        ]
      },
      {
        type: 'flow',
        flows: [
          {
            source: { latitude: 48.85, longitude: 2.35 },
            target: { latitude: 45.5, longitude: -73.55 },
            value: 7,
            label: 'Paris → Montréal'
          }
        ]
      }
    ]"
  />
</template>`
    }
  },

  sparkline: {
    id: "sparkline",
    slug: "sparkline",
    nodes: [
      wrap([
        {
          comp: "Sparkline",
          props: { label: "Activité (neutre)", data: [4, 7, 5, 9, 6, 8, 10, 7], tone: "neutral" }
        },
        {
          comp: "Sparkline",
          props: { label: "Activité (succès)", data: [2, 5, 4, 8, 7, 9, 11, 10], tone: "success" }
        },
        {
          comp: "Sparkline",
          props: { label: "Activité (erreur)", data: [10, 8, 9, 6, 4, 3, 2, 1], tone: "error" }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Sparkline } from "@sentropic/design-system-svelte";
</script>

<Sparkline label="Activité" data={[4, 7, 5, 9, 6, 8, 10, 7]} tone="neutral" />
<Sparkline label="Activité" data={[2, 5, 4, 8, 7, 9, 11, 10]} tone="success" />
<Sparkline label="Activité" data={[10, 8, 9, 6, 4, 3, 2, 1]} tone="error" />`,
      react: `import { Sparkline } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Sparkline label="Activité" data={[4, 7, 5, 9, 6, 8, 10, 7]} tone="neutral" />
      <Sparkline label="Activité" data={[2, 5, 4, 8, 7, 9, 11, 10]} tone="success" />
      <Sparkline label="Activité" data={[10, 8, 9, 6, 4, 3, 2, 1]} tone="error" />
    </>
  );
}`,
      vue: `<script setup>
import { Sparkline } from "@sentropic/design-system-vue";
</script>

<template>
  <Sparkline label="Activité" :data="[4, 7, 5, 9, 6, 8, 10, 7]" tone="neutral" />
  <Sparkline label="Activité" :data="[2, 5, 4, 8, 7, 9, 11, 10]" tone="success" />
  <Sparkline label="Activité" :data="[10, 8, 9, 6, 4, 3, 2, 1]" tone="error" />
</template>`
    }
  },

  stackedbarchart: {
    id: "stackedbarchart",
    slug: "stacked-bar-chart",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "StackedBarChart",
            props: {
              label: "Composants par catégorie et framework",
              data: [
                {
                  label: "Svelte",
                  segments: [
                    { label: "Formulaires", value: 18 },
                    { label: "Navigation", value: 10 },
                    { label: "Données", value: 8 }
                  ]
                },
                {
                  label: "React",
                  segments: [
                    { label: "Formulaires", value: 18 },
                    { label: "Navigation", value: 10 },
                    { label: "Données", value: 8 }
                  ]
                },
                {
                  label: "Vue",
                  segments: [
                    { label: "Formulaires", value: 18 },
                    { label: "Navigation", value: 10 },
                    { label: "Données", value: 8 }
                  ]
                }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { StackedBarChart } from "@sentropic/design-system-svelte";
</script>

<StackedBarChart
  label="Composants par catégorie et framework"
  data={[
    { label: "Svelte", segments: [{ label: "Formulaires", value: 18 }, { label: "Navigation", value: 10 }] },
    { label: "React",  segments: [{ label: "Formulaires", value: 18 }, { label: "Navigation", value: 10 }] },
    { label: "Vue",    segments: [{ label: "Formulaires", value: 18 }, { label: "Navigation", value: 10 }] }
  ]}
/>`,
      react: `import { StackedBarChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <StackedBarChart
      label="Composants par catégorie et framework"
      data={[
        { label: "Svelte", segments: [{ label: "Formulaires", value: 18 }, { label: "Navigation", value: 10 }] },
        { label: "React",  segments: [{ label: "Formulaires", value: 18 }, { label: "Navigation", value: 10 }] },
        { label: "Vue",    segments: [{ label: "Formulaires", value: 18 }, { label: "Navigation", value: 10 }] }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { StackedBarChart } from "@sentropic/design-system-vue";
</script>

<template>
  <StackedBarChart
    label="Composants par catégorie et framework"
    :data="[
      { label: 'Svelte', segments: [{ label: 'Formulaires', value: 18 }, { label: 'Navigation', value: 10 }] },
      { label: 'React',  segments: [{ label: 'Formulaires', value: 18 }, { label: 'Navigation', value: 10 }] },
      { label: 'Vue',    segments: [{ label: 'Formulaires', value: 18 }, { label: 'Navigation', value: 10 }] }
    ]"
  />
</template>`
    }
  },

  heatmapchart: {
    id: "heatmapchart",
    slug: "heatmap-chart",
    nodes: [
      stack([
        {
          comp: "HeatmapChart",
          props: {
            label: "Charge par canal et trimestre",
            legend: true,
            data: [
              { x: "Web", y: "Q1", value: 12 },
              { x: "Web", y: "Q2", value: 30, tone: "category5" },
              { x: "Sales", y: "Q1", value: 18 },
              { x: "Sales", y: "Q2", value: 24 }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { HeatmapChart } from "@sentropic/design-system-svelte";
</script>

<HeatmapChart
  label="Charge par canal et trimestre"
  legend
  data={[
    { x: "Web", y: "Q1", value: 12 },
    { x: "Web", y: "Q2", value: 30, tone: "category5" },
    { x: "Sales", y: "Q1", value: 18 },
    { x: "Sales", y: "Q2", value: 24 }
  ]}
/>`,
      react: `import { HeatmapChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <HeatmapChart
      label="Charge par canal et trimestre"
      legend
      data={[
        { x: "Web", y: "Q1", value: 12 },
        { x: "Web", y: "Q2", value: 30, tone: "category5" },
        { x: "Sales", y: "Q1", value: 18 },
        { x: "Sales", y: "Q2", value: 24 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { HeatmapChart } from "@sentropic/design-system-vue";
</script>

<template>
  <HeatmapChart
    label="Charge par canal et trimestre"
    legend
    :data="[
      { x: 'Web', y: 'Q1', value: 12 },
      { x: 'Web', y: 'Q2', value: 30, tone: 'category5' },
      { x: 'Sales', y: 'Q1', value: 18 },
      { x: 'Sales', y: 'Q2', value: 24 }
    ]"
  />
</template>`
    }
  },

  histogramchart: {
    id: "histogramchart",
    slug: "histogram-chart",
    nodes: [
      stack([
        {
          comp: "HistogramChart",
          props: {
            label: "Tailles de requête",
            data: [
              { label: "0-10", value: 4 },
              { label: "10-20", value: 9, tone: "category6" },
              { label: "20-30", value: 3 }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { HistogramChart } from "@sentropic/design-system-svelte";
</script>

<HistogramChart
  label="Tailles de requête"
  data={[
    { label: "0-10", value: 4 },
    { label: "10-20", value: 9, tone: "category6" },
    { label: "20-30", value: 3 }
  ]}
/>`,
      react: `import { HistogramChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <HistogramChart
      label="Tailles de requête"
      data={[
        { label: "0-10", value: 4 },
        { label: "10-20", value: 9, tone: "category6" },
        { label: "20-30", value: 3 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { HistogramChart } from "@sentropic/design-system-vue";
</script>

<template>
  <HistogramChart
    label="Tailles de requête"
    :data="[
      { label: '0-10', value: 4 },
      { label: '10-20', value: 9, tone: 'category6' },
      { label: '20-30', value: 3 }
    ]"
  />
</template>`
    }
  },

  boxplotchart: {
    id: "boxplotchart",
    slug: "box-plot-chart",
    nodes: [
      stack([
        {
          comp: "BoxPlotChart",
          props: {
            label: "Distribution de latence",
            data: [
              { label: "API", min: 10, q1: 20, median: 28, q3: 40, max: 60, outliers: [90], tone: "category3" },
              { label: "Jobs", min: 15, q1: 24, median: 34, q3: 50, max: 80 }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { BoxPlotChart } from "@sentropic/design-system-svelte";
</script>

<BoxPlotChart
  label="Distribution de latence"
  data={[
    { label: "API", min: 10, q1: 20, median: 28, q3: 40, max: 60, outliers: [90], tone: "category3" },
    { label: "Jobs", min: 15, q1: 24, median: 34, q3: 50, max: 80 }
  ]}
/>`,
      react: `import { BoxPlotChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <BoxPlotChart
      label="Distribution de latence"
      data={[
        { label: "API", min: 10, q1: 20, median: 28, q3: 40, max: 60, outliers: [90], tone: "category3" },
        { label: "Jobs", min: 15, q1: 24, median: 34, q3: 50, max: 80 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { BoxPlotChart } from "@sentropic/design-system-vue";
</script>

<template>
  <BoxPlotChart
    label="Distribution de latence"
    :data="[
      { label: 'API', min: 10, q1: 20, median: 28, q3: 40, max: 60, outliers: [90], tone: 'category3' },
      { label: 'Jobs', min: 15, q1: 24, median: 34, q3: 50, max: 80 }
    ]"
  />
</template>`
    }
  },

  rosechart: {
    id: "rosechart",
    slug: "rose-chart",
    nodes: [
      stack([
        {
          comp: "RoseChart",
          props: {
            label: "Activité par mois",
            data: [
              { label: "Jan", value: 40 },
              { label: "Fév", value: 22, tone: "category5" },
              { label: "Mar", value: 80 },
              { label: "Avr", value: 55 }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { RoseChart } from "@sentropic/design-system-svelte";
</script>

<RoseChart
  label="Activité par mois"
  data={[
    { label: "Jan", value: 40 },
    { label: "Fév", value: 22, tone: "category5" },
    { label: "Mar", value: 80 },
    { label: "Avr", value: 55 }
  ]}
/>`,
      react: `import { RoseChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <RoseChart
      label="Activité par mois"
      data={[
        { label: "Jan", value: 40 },
        { label: "Fév", value: 22, tone: "category5" },
        { label: "Mar", value: 80 },
        { label: "Avr", value: 55 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { RoseChart } from "@sentropic/design-system-vue";
</script>

<template>
  <RoseChart
    label="Activité par mois"
    :data="[
      { label: 'Jan', value: 40 },
      { label: 'Fév', value: 22, tone: 'category5' },
      { label: 'Mar', value: 80 },
      { label: 'Avr', value: 55 }
    ]"
  />
</template>`
    }
  },

  violinchart: {
    id: "violinchart",
    slug: "violin-chart",
    nodes: [
      stack([
        {
          comp: "ViolinChart",
          props: {
            label: "Distribution de latence",
            data: [
              { label: "API", values: [10, 12, 14, 18, 20, 22, 28, 30, 31, 33] },
              { label: "Jobs", values: [5, 8, 9, 11, 12, 15, 18, 40], tone: "category4" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { ViolinChart } from "@sentropic/design-system-svelte";
</script>

<ViolinChart
  label="Distribution de latence"
  data={[
    { label: "API", values: [10, 12, 14, 18, 20, 22, 28, 30, 31, 33] },
    { label: "Jobs", values: [5, 8, 9, 11, 12, 15, 18, 40], tone: "category4" }
  ]}
/>`,
      react: `import { ViolinChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ViolinChart
      label="Distribution de latence"
      data={[
        { label: "API", values: [10, 12, 14, 18, 20, 22, 28, 30, 31, 33] },
        { label: "Jobs", values: [5, 8, 9, 11, 12, 15, 18, 40], tone: "category4" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { ViolinChart } from "@sentropic/design-system-vue";
</script>

<template>
  <ViolinChart
    label="Distribution de latence"
    :data="[
      { label: 'API', values: [10, 12, 14, 18, 20, 22, 28, 30, 31, 33] },
      { label: 'Jobs', values: [5, 8, 9, 11, 12, 15, 18, 40], tone: 'category4' }
    ]"
  />
</template>`
    }
  },

  radarchart: {
    id: "radarchart",
    slug: "radar-chart",
    nodes: [
      stack([
        {
          comp: "RadarChart",
          props: {
            label: "Capacités produit",
            axes: ["Vitesse", "Qualité", "Coût", "Portée"],
            series: [
              { label: "Actuel", values: [80, 65, 45, 70] },
              { label: "Cible", values: [90, 85, 70, 86], tone: "category7" }
            ],
            legend: true
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { RadarChart } from "@sentropic/design-system-svelte";
</script>

<RadarChart
  label="Capacités produit"
  axes={["Vitesse", "Qualité", "Coût", "Portée"]}
  series={[
    { label: "Actuel", values: [80, 65, 45, 70] },
    { label: "Cible", values: [90, 85, 70, 86], tone: "category7" }
  ]}
  legend
/>`,
      react: `import { RadarChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <RadarChart
      label="Capacités produit"
      axes={["Vitesse", "Qualité", "Coût", "Portée"]}
      series={[
        { label: "Actuel", values: [80, 65, 45, 70] },
        { label: "Cible", values: [90, 85, 70, 86], tone: "category7" }
      ]}
      legend
    />
  );
}`,
      vue: `<script setup>
import { RadarChart } from "@sentropic/design-system-vue";
</script>

<template>
  <RadarChart
    label="Capacités produit"
    :axes="['Vitesse', 'Qualité', 'Coût', 'Portée']"
    :series="[
      { label: 'Actuel', values: [80, 65, 45, 70] },
      { label: 'Cible', values: [90, 85, 70, 86], tone: 'category7' }
    ]"
    legend
  />
</template>`
    }
  },

  sankeychart: {
    id: "sankeychart",
    slug: "sankey-chart",
    nodes: [
      stack([
        {
          comp: "SankeyChart",
          props: {
            label: "Flux d'acquisition",
            nodes: [
              { id: "visit", label: "Visites" },
              { id: "trial", label: "Essais", tone: "category4" },
              { id: "paid", label: "Payants" }
            ],
            links: [
              { source: "visit", target: "trial", value: 120 },
              { source: "trial", target: "paid", value: 48 }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { SankeyChart } from "@sentropic/design-system-svelte";
</script>

<SankeyChart
  label="Flux d'acquisition"
  nodes={[
    { id: "visit", label: "Visites" },
    { id: "trial", label: "Essais", tone: "category4" },
    { id: "paid", label: "Payants" }
  ]}
  links={[
    { source: "visit", target: "trial", value: 120 },
    { source: "trial", target: "paid", value: 48 }
  ]}
/>`,
      react: `import { SankeyChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <SankeyChart
      label="Flux d'acquisition"
      nodes={[
        { id: "visit", label: "Visites" },
        { id: "trial", label: "Essais", tone: "category4" },
        { id: "paid", label: "Payants" }
      ]}
      links={[
        { source: "visit", target: "trial", value: 120 },
        { source: "trial", target: "paid", value: 48 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { SankeyChart } from "@sentropic/design-system-vue";
</script>

<template>
  <SankeyChart
    label="Flux d'acquisition"
    :nodes="[
      { id: 'visit', label: 'Visites' },
      { id: 'trial', label: 'Essais', tone: 'category4' },
      { id: 'paid', label: 'Payants' }
    ]"
    :links="[
      { source: 'visit', target: 'trial', value: 120 },
      { source: 'trial', target: 'paid', value: 48 }
    ]"
  />
</template>`
    }
  },

  sunburstchart: {
    id: "sunburstchart",
    slug: "sunburst-chart",
    nodes: [
      stack([
        {
          comp: "SunburstChart",
          props: {
            label: "Hiérarchie de revenus",
            legend: true,
            data: {
              label: "Revenus",
              children: [
                { label: "Produit", children: [{ label: "Core", value: 40 }, { label: "Addons", value: 20 }] },
                { label: "Services", value: 30, tone: "category8" }
              ]
            }
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { SunburstChart } from "@sentropic/design-system-svelte";
</script>

<SunburstChart
  label="Hiérarchie de revenus"
  legend
  data={{
    label: "Revenus",
    children: [
      { label: "Produit", children: [{ label: "Core", value: 40 }, { label: "Addons", value: 20 }] },
      { label: "Services", value: 30, tone: "category8" }
    ]
  }}
/>`,
      react: `import { SunburstChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <SunburstChart
      label="Hiérarchie de revenus"
      legend
      data={{
        label: "Revenus",
        children: [
          { label: "Produit", children: [{ label: "Core", value: 40 }, { label: "Addons", value: 20 }] },
          { label: "Services", value: 30, tone: "category8" }
        ]
      }}
    />
  );
}`,
      vue: `<script setup>
import { SunburstChart } from "@sentropic/design-system-vue";
</script>

<template>
  <SunburstChart
    label="Hiérarchie de revenus"
    legend
    :data="{
      label: 'Revenus',
      children: [
        { label: 'Produit', children: [{ label: 'Core', value: 40 }, { label: 'Addons', value: 20 }] },
        { label: 'Services', value: 30, tone: 'category8' }
      ]
    }"
  />
</template>`
    }
  },

  chatthread: {
    id: "chatthread",
    slug: "chat-thread",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "ChatThread",
            props: {
              messages: [
                { id: "1", role: "user", content: "Comment puis-je installer le design system ?" },
                { id: "2", role: "assistant", content: "Lancez `npm install @sentropic/design-system-react` puis importez vos composants.", status: "completed" },
                { id: "3", role: "user", content: "Merci ! Et pour Vue ?" },
                { id: "4", role: "assistant", content: "Le paquet Vue s'installe de la même façon : `@sentropic/design-system-vue`.", status: "completed" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { ChatThread } from "@sentropic/design-system-svelte";
</script>

<ChatThread
  messages={[
    { id: "1", role: "user", content: "Comment puis-je installer le design system ?" },
    { id: "2", role: "assistant", content: "Lancez npm install @sentropic/design-system-react.", status: "completed" }
  ]}
/>`,
      react: `import { ChatThread } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ChatThread
      messages={[
        { id: "1", role: "user", content: "Comment puis-je installer le design system ?" },
        { id: "2", role: "assistant", content: "Lancez npm install.", status: "completed" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { ChatThread } from "@sentropic/design-system-vue";
</script>

<template>
  <ChatThread
    :messages="[
      { id: '1', role: 'user', content: 'Comment puis-je installer le design system ?' },
      { id: '2', role: 'assistant', content: 'Lancez npm install.', status: 'completed' }
    ]"
  />
</template>`
    }
  },

  chatmessage: {
    id: "chatmessage",
    slug: "chat-message",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "ChatMessage",
            props: { role: "user" },
            children: ["Quelle est la différence entre Badge et Tag ?"]
          },
          {
            comp: "ChatMessage",
            props: {
              role: "assistant",
              status: "completed",
              timestamp: "14:32"
            },
            children: [
              "Badge est statique (indicateur) ; Tag est interactif (filtrable, supprimable)."
            ]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { ChatMessage } from "@sentropic/design-system-svelte";
</script>

<!-- Le composant Svelte rend le texte via le slot children. -->
<ChatMessage role="user">Quelle est la différence entre Badge et Tag ?</ChatMessage>
<ChatMessage role="assistant" status="completed" timestamp="14:32">
  Badge est statique ; Tag est interactif.
</ChatMessage>`,
      react: `import { ChatMessage } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <ChatMessage role="user" content="Quelle est la différence entre Badge et Tag ?" />
      <ChatMessage
        role="assistant"
        content="Badge est statique ; Tag est interactif."
        status="completed"
        timestamp="14:32"
      />
    </>
  );
}`,
      vue: `<script setup>
import { ChatMessage } from "@sentropic/design-system-vue";
</script>

<template>
  <ChatMessage role="user" content="Quelle est la différence entre Badge et Tag ?" />
  <ChatMessage
    role="assistant"
    content="Badge est statique ; Tag est interactif."
    status="completed"
    timestamp="14:32"
  />
</template>`
    }
  },

  streamingmessage: {
    id: "streamingmessage",
    slug: "streaming-message",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "StreamingMessage",
            props: {
              text: "Génération de la réponse en cours…",
              mode: "live",
              events: [
                { id: "e1", label: "Lecture du contexte" },
                { id: "e2", label: "Raisonnement" }
              ]
            }
          },
          {
            comp: "StreamingMessage",
            props: {
              text: "Le design system est prêt.",
              mode: "passive"
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { StreamingMessage } from "@sentropic/design-system-svelte";
</script>

<StreamingMessage
  text="Génération de la réponse en cours…"
  mode="live"
  events={[
    { id: "e1", label: "Lecture du contexte" },
    { id: "e2", label: "Raisonnement" }
  ]}
/>
<StreamingMessage text="Le design system est prêt." mode="passive" />`,
      react: `import { StreamingMessage } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <StreamingMessage
        text="Génération de la réponse en cours…"
        mode="live"
        events={[
          { id: "e1", label: "Lecture du contexte" },
          { id: "e2", label: "Raisonnement" }
        ]}
      />
      <StreamingMessage text="Le design system est prêt." mode="passive" />
    </>
  );
}`,
      vue: `<script setup>
import { StreamingMessage } from "@sentropic/design-system-vue";
</script>

<template>
  <StreamingMessage
    text="Génération de la réponse en cours…"
    mode="live"
    :events="[
      { id: 'e1', label: 'Lecture du contexte' },
      { id: 'e2', label: 'Raisonnement' }
    ]"
  />
  <StreamingMessage text="Le design system est prêt." mode="passive" />
</template>`
    }
  },

  messageactions: {
    id: "messageactions",
    slug: "message-actions",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "MessageActions",
            props: {
              // `icon` est un glyphe texte : SvelteNode le convertit en snippet
              // (le composant Svelte rend `{@render action.icon()}`). React/Vue
              // ignorent `icon` et rendent `label`.
              actions: [
                { id: "copy", label: "Copier", icon: "⧉" },
                { id: "regen", label: "Régénérer", icon: "↻" },
                { id: "delete", label: "Supprimer", variant: "danger", icon: "✕" }
              ],
              visibility: "always"
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { MessageActions } from "@sentropic/design-system-svelte";
</script>

<MessageActions
  actions={[
    { id: "copy", label: "Copier" },
    { id: "regen", label: "Régénérer" },
    { id: "delete", label: "Supprimer", variant: "danger" }
  ]}
  visibility="always"
/>`,
      react: `import { MessageActions } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <MessageActions
      actions={[
        { id: "copy", label: "Copier" },
        { id: "regen", label: "Régénérer" },
        { id: "delete", label: "Supprimer", variant: "danger" }
      ]}
      visibility="always"
    />
  );
}`,
      vue: `<script setup>
import { MessageActions } from "@sentropic/design-system-vue";
</script>

<template>
  <MessageActions
    :actions="[
      { id: 'copy', label: 'Copier' },
      { id: 'regen', label: 'Régénérer' },
      { id: 'delete', label: 'Supprimer', variant: 'danger' }
    ]"
    visibility="always"
  />
</template>`
    }
  },

  messagestatusbadge: {
    id: "messagestatusbadge",
    slug: "message-status-badge",
    nodes: [
      wrap([
        { comp: "MessageStatusBadge", props: { status: "pending" } },
        { comp: "MessageStatusBadge", props: { status: "processing" } },
        { comp: "MessageStatusBadge", props: { status: "completed" } },
        { comp: "MessageStatusBadge", props: { status: "failed" } }
      ])
    ],
    code: {
      svelte: `<script>
  import { MessageStatusBadge } from "@sentropic/design-system-svelte";
</script>

<MessageStatusBadge status="pending" />
<MessageStatusBadge status="processing" />
<MessageStatusBadge status="completed" />
<MessageStatusBadge status="failed" />`,
      react: `import { MessageStatusBadge } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <MessageStatusBadge status="pending" />
      <MessageStatusBadge status="processing" />
      <MessageStatusBadge status="completed" />
      <MessageStatusBadge status="failed" />
    </>
  );
}`,
      vue: `<script setup>
import { MessageStatusBadge } from "@sentropic/design-system-vue";
</script>

<template>
  <MessageStatusBadge status="pending" />
  <MessageStatusBadge status="processing" />
  <MessageStatusBadge status="completed" />
  <MessageStatusBadge status="failed" />
</template>`
    }
  },

  chatcomposer: {
    id: "chatcomposer",
    slug: "chat-composer",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "ChatComposer",
            props: {
              placeholder: "Posez votre question…",
              submitLabel: "Envoyer"
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { ChatComposer } from "@sentropic/design-system-svelte";
</script>

<ChatComposer
  placeholder="Posez votre question…"
  submitLabel="Envoyer"
/>`,
      react: `import { ChatComposer } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ChatComposer
      placeholder="Posez votre question…"
      submitLabel="Envoyer"
    />
  );
}`,
      vue: `<script setup>
import { ChatComposer } from "@sentropic/design-system-vue";
</script>

<template>
  <ChatComposer
    placeholder="Posez votre question…"
    submitLabel="Envoyer"
  />
</template>`
    }
  },

  menu: {
    id: "menu",
    slug: "menu",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Menu",
            props: {
              items: [
                { id: "edit", label: "Modifier" },
                { id: "duplicate", label: "Dupliquer" },
                { type: "divider" },
                { id: "delete", label: "Supprimer", variant: "danger" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Menu } from "@sentropic/design-system-svelte";
</script>

<Menu
  items={[
    { id: "edit", label: "Modifier" },
    { id: "duplicate", label: "Dupliquer" },
    { type: "divider" },
    { id: "delete", label: "Supprimer", variant: "danger" }
  ]}
/>`,
      react: `import { Menu } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Menu
      items={[
        { id: "edit", label: "Modifier" },
        { id: "duplicate", label: "Dupliquer" },
        { type: "divider" },
        { id: "delete", label: "Supprimer", variant: "danger" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { Menu } from "@sentropic/design-system-vue";
</script>

<template>
  <Menu
    :items="[
      { id: 'edit', label: 'Modifier' },
      { id: 'duplicate', label: 'Dupliquer' },
      { type: 'divider' },
      { id: 'delete', label: 'Supprimer', variant: 'danger' }
    ]"
  />
</template>`
    }
  },

  menupopover: {
    id: "menupopover",
    slug: "menu-popover",
    nodes: [
      wrap([
        {
          comp: "MenuPopover",
          props: {
            open: true,
            placement: "bottom-start",
            items: [
              { id: "view", label: "Voir les détails" },
              { id: "edit", label: "Modifier" },
              { type: "divider" },
              { id: "archive", label: "Archiver" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { MenuPopover } from "@sentropic/design-system-svelte";
</script>

<MenuPopover
  open={true}
  placement="bottom-start"
  items={[
    { id: "view", label: "Voir les détails" },
    { id: "edit", label: "Modifier" },
    { type: "divider" },
    { id: "archive", label: "Archiver" }
  ]}
/>`,
      react: `import { MenuPopover } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <MenuPopover
      open={true}
      placement="bottom-start"
      items={[
        { id: "view", label: "Voir les détails" },
        { id: "edit", label: "Modifier" },
        { type: "divider" },
        { id: "archive", label: "Archiver" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { MenuPopover } from "@sentropic/design-system-vue";
</script>

<template>
  <MenuPopover
    :open="true"
    placement="bottom-start"
    :items="[
      { id: 'view', label: 'Voir les détails' },
      { id: 'edit', label: 'Modifier' },
      { type: 'divider' },
      { id: 'archive', label: 'Archiver' }
    ]"
  />
</template>`
    }
  },

  overflowmenu: {
    id: "overflowmenu",
    slug: "overflow-menu",
    nodes: [
      wrap([
        {
          comp: "OverflowMenu",
          props: {
            label: "⋮",
            open: true,
            placement: "bottom-start",
            items: [
              { id: "rename", label: "Renommer" },
              { id: "move", label: "Déplacer" },
              { id: "delete", label: "Supprimer" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { OverflowMenu } from "@sentropic/design-system-svelte";
</script>

<OverflowMenu
  label="⋮"
  :open="true"
  placement="bottom-start"
  items={[
    { id: "rename", label: "Renommer" },
    { id: "move", label: "Déplacer" },
    { id: "delete", label: "Supprimer" }
  ]}
/>`,
      react: `import { OverflowMenu } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <OverflowMenu
      label="⋮"
      open={true}
      placement="bottom-start"
      items={[
        { id: "rename", label: "Renommer" },
        { id: "move", label: "Déplacer" },
        { id: "delete", label: "Supprimer" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { OverflowMenu } from "@sentropic/design-system-vue";
</script>

<template>
  <OverflowMenu
    label="⋮"
    :open="true"
    placement="bottom-start"
    :items="[
      { id: 'rename', label: 'Renommer' },
      { id: 'move', label: 'Déplacer' },
      { id: 'delete', label: 'Supprimer' }
    ]"
  />
</template>`
    }
  },

  popover: {
    id: "popover",
    slug: "popover",
    nodes: [
      wrap([
        {
          comp: "Popover",
          props: {
            open: true,
            placement: "bottom",
            content: "Cliquez pour copier l'identifiant du composant."
          },
          children: [
            { comp: "Button", props: { variant: "secondary" }, children: ["Info"] }
          ]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Popover, Button } from "@sentropic/design-system-svelte";
</script>

<Popover content="Cliquez pour copier l'identifiant." placement="bottom">
  <Button variant="secondary">Info</Button>
</Popover>`,
      react: `import { Popover, Button } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Popover content="Cliquez pour copier l'identifiant." placement="bottom" open>
      <Button variant="secondary">Info</Button>
    </Popover>
  );
}`,
      vue: `<script setup>
import { Popover, Button } from "@sentropic/design-system-vue";
</script>

<template>
  <Popover content="Cliquez pour copier l'identifiant." placement="bottom" :open="true">
    <Button variant="secondary">Info</Button>
  </Popover>
</template>`
    }
  },

  aspectratio: {
    id: "aspectratio",
    slug: "aspect-ratio",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "AspectRatio",
            props: { ratio: "16 / 9" },
            children: [
              {
                el: "div",
                props: { style: "background:var(--st-color-surface-subtle,#f0f0f0);width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:4px" },
                children: ["16 / 9"]
              }
            ]
          },
          {
            comp: "AspectRatio",
            props: { ratio: "1 / 1" },
            children: [
              {
                el: "div",
                props: { style: "background:var(--st-color-surface-subtle,#f0f0f0);width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:4px" },
                children: ["1 / 1"]
              }
            ]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { AspectRatio } from "@sentropic/design-system-svelte";
</script>

<AspectRatio ratio="16 / 9">
  <div style="background:#f0f0f0;width:100%;height:100%;">16 / 9</div>
</AspectRatio>
<AspectRatio ratio="1 / 1">
  <div style="background:#f0f0f0;width:100%;height:100%;">1 / 1</div>
</AspectRatio>`,
      react: `import { AspectRatio } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <AspectRatio ratio="16 / 9">
        <div style={{ background: "#f0f0f0", width: "100%", height: "100%" }}>16 / 9</div>
      </AspectRatio>
      <AspectRatio ratio="1 / 1">
        <div style={{ background: "#f0f0f0", width: "100%", height: "100%" }}>1 / 1</div>
      </AspectRatio>
    </>
  );
}`,
      vue: `<script setup>
import { AspectRatio } from "@sentropic/design-system-vue";
</script>

<template>
  <AspectRatio ratio="16 / 9">
    <div style="background:#f0f0f0;width:100%;height:100%;">16 / 9</div>
  </AspectRatio>
  <AspectRatio ratio="1 / 1">
    <div style="background:#f0f0f0;width:100%;height:100%;">1 / 1</div>
  </AspectRatio>
</template>`
    }
  },

  footer: {
    id: "footer",
    slug: "footer",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "Footer",
            props: {
              brand: "Sent Tech",
              columns: [
                {
                  title: "Produit",
                  links: [
                    { label: "Composants", href: "/components" },
                    { label: "Tokens", href: "/tokens" },
                    { label: "Documentation", href: "/docs" }
                  ]
                },
                {
                  title: "Entreprise",
                  links: [
                    { label: "À propos", href: "/about" },
                    { label: "Blog", href: "/blog" },
                    { label: "Contact", href: "/contact" }
                  ]
                }
              ],
              copyright: "© 2026 Sent Tech. Tous droits réservés."
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Footer } from "@sentropic/design-system-svelte";
</script>

<!-- Le Footer Svelte est piloté par des snippets nommés. -->
<Footer copyright="© 2026 Sent Tech. Tous droits réservés.">
  {#snippet brand()}Sent Tech{/snippet}
  {#snippet columns()}
    <nav>
      <h2>Produit</h2>
      <a href="/components">Composants</a>
      <a href="/tokens">Tokens</a>
    </nav>
    <nav>
      <h2>Entreprise</h2>
      <a href="/about">À propos</a>
      <a href="/blog">Blog</a>
    </nav>
  {/snippet}
</Footer>`,
      react: `import { Footer } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Footer
      brand="Sent Tech"
      columns={[
        {
          title: "Produit",
          links: [
            { label: "Composants", href: "/components" },
            { label: "Tokens", href: "/tokens" }
          ]
        },
        {
          title: "Entreprise",
          links: [
            { label: "À propos", href: "/about" },
            { label: "Blog", href: "/blog" }
          ]
        }
      ]}
      copyright="© 2026 Sent Tech. Tous droits réservés."
    />
  );
}`,
      vue: `<script setup>
import { Footer } from "@sentropic/design-system-vue";
</script>

<template>
  <Footer
    brand="Sent Tech"
    :columns="[
      {
        title: 'Produit',
        links: [
          { label: 'Composants', href: '/components' },
          { label: 'Tokens', href: '/tokens' }
        ]
      },
      {
        title: 'Entreprise',
        links: [
          { label: 'À propos', href: '/about' },
          { label: 'Blog', href: '/blog' }
        ]
      }
    ]"
    copyright="© 2026 Sent Tech. Tous droits réservés."
  />
</template>`
    }
  },
  notification: {
    id: "notification",
    slug: "notification",
    nodes: [
      stack([
        {
          comp: "Notification",
          props: {
            tone: "success",
            title: "Modifications enregistrées",
            message: "Vos préférences ont été mises à jour."
          }
        },
        {
          comp: "Notification",
          props: {
            tone: "warning",
            title: "Espace presque plein",
            message: "Il reste 2 Go disponibles sur votre tenant."
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Notification } from "@sentropic/design-system-svelte";
</script>

<Notification tone="success" title="Modifications enregistrées" message="Vos préférences ont été mises à jour." />
<Notification tone="warning" title="Espace presque plein" message="Il reste 2 Go disponibles sur votre tenant." />`,
      react: `import { Notification } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Notification tone="success" title="Modifications enregistrées" message="Vos préférences ont été mises à jour." />
      <Notification tone="warning" title="Espace presque plein" message="Il reste 2 Go disponibles sur votre tenant." />
    </>
  );
}`,
      vue: `<script setup>
import { Notification } from "@sentropic/design-system-vue";
</script>

<template>
  <Notification tone="success" title="Modifications enregistrées" message="Vos préférences ont été mises à jour." />
  <Notification tone="warning" title="Espace presque plein" message="Il reste 2 Go disponibles sur votre tenant." />
</template>`
    }
  },
  displaysettings: {
    id: "displaysettings",
    slug: "display-settings",
    nodes: [
      wrap([{ comp: "DisplaySettings", props: { title: "Paramètres d'affichage" } }])
    ],
    code: {
      svelte: `<script>
  import { DisplaySettings } from "@sentropic/design-system-svelte";
</script>

<DisplaySettings title="Paramètres d'affichage" onChange={(s) => console.log(s)} />`,
      react: `import { DisplaySettings } from "@sentropic/design-system-react";

export function Demo() {
  return <DisplaySettings title="Paramètres d'affichage" onChange={(s) => console.log(s)} />;
}`,
      vue: `<script setup>
import { DisplaySettings } from "@sentropic/design-system-vue";
</script>

<template>
  <DisplaySettings title="Paramètres d'affichage" @change="onChange" />
</template>`
    }
  },
  mediacontent: {
    id: "mediacontent",
    slug: "media-content",
    nodes: [
      wrap([
        {
          comp: "MediaContent",
          props: {
            media: "https://picsum.photos/seed/sentforge/640/360",
            mediaAlt: "Illustration de chantier",
            title: "Atelier Forge",
            caption: "Aperçu du chantier livré.",
            byline: "Crédit : Sent Tech"
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { MediaContent } from "@sentropic/design-system-svelte";
</script>

<MediaContent
  media="/forge.jpg"
  mediaAlt="Illustration de chantier"
  title="Atelier Forge"
  caption="Aperçu du chantier livré."
  byline="Crédit : Sent Tech"
/>`,
      react: `import { MediaContent } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <MediaContent
      media="/forge.jpg"
      mediaAlt="Illustration de chantier"
      title="Atelier Forge"
      caption="Aperçu du chantier livré."
      byline="Crédit : Sent Tech"
    />
  );
}`,
      vue: `<script setup>
import { MediaContent } from "@sentropic/design-system-vue";
</script>

<template>
  <MediaContent
    media="/forge.jpg"
    media-alt="Illustration de chantier"
    title="Atelier Forge"
    caption="Aperçu du chantier livré."
    byline="Crédit : Sent Tech"
  />
</template>`
    }
  },
  embed: {
    id: "embed",
    slug: "embed",
    nodes: [
      wrap([
        {
          comp: "Embed",
          props: {
            src: "https://www.openstreetmap.org/export/embed.html?bbox=2.29%2C48.85%2C2.31%2C48.86&layer=mapnik",
            title: "Carte du quartier",
            aspectRatio: "16/9"
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Embed } from "@sentropic/design-system-svelte";
</script>

<Embed
  src="https://www.example.com/widget"
  title="Carte du quartier"
  aspectRatio="16/9"
/>`,
      react: `import { Embed } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Embed
      src="https://www.example.com/widget"
      title="Carte du quartier"
      aspectRatio="16/9"
    />
  );
}`,
      vue: `<script setup>
import { Embed } from "@sentropic/design-system-vue";
</script>

<template>
  <Embed
    src="https://www.example.com/widget"
    title="Carte du quartier"
    aspect-ratio="16/9"
  />
</template>`
    }
  },
  dataimage: {
    id: "dataimage",
    slug: "data-image",
    nodes: [
      wrap([
        {
          comp: "DataImage",
          props: {
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 240'%3E%3Crect width='360' height='240' fill='%23eef2f7'/%3E%3Cpath d='M42 174h276L250 91l-54 63-37-43z' fill='%234e79a7'/%3E%3Ccircle cx='108' cy='82' r='24' fill='%23f28e2b'/%3E%3C/svg%3E",
            alt: "Aperçu de graphique produit",
            width: 320,
            height: 200,
            fit: "cover",
            radius: 8
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { DataImage } from "@sentropic/design-system-svelte";
</script>

<DataImage
  src="/produit.jpg"
  alt="Aperçu de graphique produit"
  width={320}
  height={200}
  fit="cover"
  radius={8}
/>`,
      react: `import { DataImage } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <DataImage
      src="/produit.jpg"
      alt="Aperçu de graphique produit"
      width={320}
      height={200}
      fit="cover"
      radius={8}
    />
  );
}`,
      vue: `<script setup>
import { DataImage } from "@sentropic/design-system-vue";
</script>

<template>
  <DataImage
    src="/produit.jpg"
    alt="Aperçu de graphique produit"
    :width="320"
    :height="200"
    fit="cover"
    :radius="8"
  />
</template>`
    }
  },
  tableofcontents: {
    id: "tableofcontents",
    slug: "table-of-contents",
    nodes: [
      wrap([
        {
          comp: "TableOfContents",
          props: {
            title: "Sur cette page",
            activeId: "usage",
            items: [
              { id: "intro", label: "Introduction" },
              { id: "usage", label: "Utilisation" },
              { id: "api", label: "API", level: 2 },
              { id: "a11y", label: "Accessibilité" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { TableOfContents } from "@sentropic/design-system-svelte";
  const items = [
    { id: "intro", label: "Introduction" },
    { id: "usage", label: "Utilisation" },
    { id: "api", label: "API", level: 2 },
    { id: "a11y", label: "Accessibilité" }
  ];
</script>

<TableOfContents title="Sur cette page" activeId="usage" {items} />`,
      react: `import { TableOfContents } from "@sentropic/design-system-react";

const items = [
  { id: "intro", label: "Introduction" },
  { id: "usage", label: "Utilisation" },
  { id: "api", label: "API", level: 2 },
  { id: "a11y", label: "Accessibilité" }
];

export function Demo() {
  return <TableOfContents title="Sur cette page" activeId="usage" items={items} />;
}`,
      vue: `<script setup>
import { TableOfContents } from "@sentropic/design-system-vue";
const items = [
  { id: "intro", label: "Introduction" },
  { id: "usage", label: "Utilisation" },
  { id: "api", label: "API", level: 2 },
  { id: "a11y", label: "Accessibilité" }
];
</script>

<template>
  <TableOfContents title="Sur cette page" active-id="usage" :items="items" />
</template>`
    }
  },
  transcription: {
    id: "transcription",
    slug: "transcription",
    nodes: [
      wrap([
        {
          comp: "Transcription",
          props: {
            open: true,
            title: "Transcription de l'épisode",
            segments: [
              { speaker: "Animatrice", startTime: "0:00", endTime: "0:06", text: "Bienvenue dans cet épisode." },
              { speaker: "Invité", startTime: "0:07", endTime: "0:14", text: "Merci de m'accueillir aujourd'hui." }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Transcription } from "@sentropic/design-system-svelte";
  const segments = [
    { speaker: "Animatrice", startTime: "0:00", endTime: "0:06", text: "Bienvenue dans cet épisode." },
    { speaker: "Invité", startTime: "0:07", endTime: "0:14", text: "Merci de m'accueillir aujourd'hui." }
  ];
</script>

<Transcription open title="Transcription de l'épisode" {segments} />`,
      react: `import { Transcription } from "@sentropic/design-system-react";

const segments = [
  { speaker: "Animatrice", startTime: "0:00", endTime: "0:06", text: "Bienvenue dans cet épisode." },
  { speaker: "Invité", startTime: "0:07", endTime: "0:14", text: "Merci de m'accueillir aujourd'hui." }
];

export function Demo() {
  return <Transcription open title="Transcription de l'épisode" segments={segments} />;
}`,
      vue: `<script setup>
import { Transcription } from "@sentropic/design-system-vue";
const segments = [
  { speaker: "Animatrice", startTime: "0:00", endTime: "0:06", text: "Bienvenue dans cet épisode." },
  { speaker: "Invité", startTime: "0:07", endTime: "0:14", text: "Merci de m'accueillir aujourd'hui." }
];
</script>

<template>
  <Transcription open title="Transcription de l'épisode" :segments="segments" />
</template>`
    }
  },
  forcegraph: {
    id: "forcegraph",
    slug: "force-graph",
    nodes: [
      wrap([
        {
          comp: "ForceGraph",
          props: {
            label: "Ontologie de démo",
            width: 460,
            height: 300,
            edgeCurve: 0.2,
            repulsion: 1.4,
            nodes: [
              { id: "auteur", label: "Auteur", shape: "box", tone: "category1" },
              { id: "oeuvre", label: "Œuvre", shape: "diamond", tone: "category2" },
              { id: "lieu", label: "Lieu", shape: "triangle", tone: "category3" },
              { id: "perso", label: "Personnage", shape: "star", tone: "category4" },
              { id: "indice", label: "Indice", shape: "square", tone: "category5" },
              { id: "manuscrit", label: "Manuscrit", shape: "roundedbox", tone: "category6" }
            ],
            edges: [
              { source: "auteur", target: "oeuvre", relation: "a écrit", emphasis: true },
              { source: "oeuvre", target: "lieu", relation: "se déroule à", dash: "dashed" },
              { source: "oeuvre", target: "perso", relation: "présente" },
              { source: "perso", target: "indice", relation: "laisse", dash: "dotted" },
              { source: "oeuvre", target: "manuscrit", relation: "conservé dans", dash: "long-dash" }
            ],
            legend: [
              { label: "Auteur", shape: "box", tone: "category1" },
              { label: "Œuvre", shape: "diamond", tone: "category2" },
              { label: "Manuscrit", shape: "roundedbox", tone: "category6" },
              { label: "Relation faible", dash: "dashed" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { ForceGraph } from "@sentropic/design-system-svelte";
  const nodes = [
    { id: "auteur", label: "Auteur", shape: "box", tone: "category1" },
    { id: "oeuvre", label: "Œuvre", shape: "diamond", tone: "category2" },
    { id: "manuscrit", label: "Manuscrit", shape: "roundedbox", tone: "category6" }
  ];
  const edges = [
    // emphasis -> arête en gras (2×) ; dash -> pointillé typé
    { source: "auteur", target: "oeuvre", relation: "a écrit", emphasis: true },
    { source: "oeuvre", target: "manuscrit", relation: "conservé dans", dash: "long-dash" }
  ];
</script>

<!-- repulsion>1 = plus aéré ; survole un nœud : voisins + arêtes incidentes restent nets -->
<ForceGraph {nodes} {edges} label="Ontologie de démo" width={460} height={300} edgeCurve={0.2} repulsion={1.4} />`,
      react: `import { ForceGraph } from "@sentropic/design-system-react";

const nodes = [
  { id: "auteur", label: "Auteur", shape: "box", tone: "category1" },
  { id: "oeuvre", label: "Œuvre", shape: "diamond", tone: "category2" },
  { id: "manuscrit", label: "Manuscrit", shape: "roundedbox", tone: "category6" }
];
const edges = [
  { source: "auteur", target: "oeuvre", relation: "a écrit", emphasis: true },
  { source: "oeuvre", target: "manuscrit", relation: "conservé dans", dash: "long-dash" }
];

export function Demo() {
  return <ForceGraph nodes={nodes} edges={edges} label="Ontologie de démo" width={460} height={300} edgeCurve={0.2} repulsion={1.4} />;
}`,
      vue: `<script setup>
import { ForceGraph } from "@sentropic/design-system-vue";
const nodes = [
  { id: "auteur", label: "Auteur", shape: "box", tone: "category1" },
  { id: "oeuvre", label: "Œuvre", shape: "diamond", tone: "category2" },
  { id: "manuscrit", label: "Manuscrit", shape: "roundedbox", tone: "category6" }
];
const edges = [
  { source: "auteur", target: "oeuvre", relation: "a écrit", emphasis: true },
  { source: "oeuvre", target: "manuscrit", relation: "conservé dans", dash: "long-dash" }
];
</script>

<template>
  <ForceGraph :nodes="nodes" :edges="edges" label="Ontologie de démo" :width="460" :height="300" :edge-curve="0.2" :repulsion="1.4" />
</template>`
    }
  },
  passwordinput: {
    id: "passwordinput",
    slug: "password-input",
    nodes: [
      wrap([{ comp: "PasswordInput", props: { label: "Mot de passe", placeholder: "••••••••" } }])
    ],
    code: {
      svelte: `<script>
  import { PasswordInput } from "@sentropic/design-system-svelte";
  let value = $state("");
</script>

<PasswordInput label="Mot de passe" placeholder="••••••••" bind:value />`,
      react: `import { useState } from "react";
import { PasswordInput } from "@sentropic/design-system-react";

export function Demo() {
  const [value, setValue] = useState("");
  return (
    <PasswordInput
      label="Mot de passe"
      placeholder="••••••••"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { PasswordInput } from "@sentropic/design-system-vue";
const value = ref("");
</script>

<template>
  <PasswordInput label="Mot de passe" placeholder="••••••••" v-model="value" />
</template>`
    }
  },
  paginationnav: {
    id: "paginationnav",
    slug: "pagination-nav",
    nodes: [
      wrap([
        {
          comp: "PaginationNav",
          props: {
            page: 2,
            pageCount: 5,
            label: "Pagination",
            previousLabel: "Page précédente",
            nextLabel: "Page suivante"
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { PaginationNav } from "@sentropic/design-system-svelte";
  let page = $state(2);
</script>

<PaginationNav bind:page pageCount={5} label="Pagination" previousLabel="Page précédente" nextLabel="Page suivante" />`,
      react: `import { useState } from "react";
import { PaginationNav } from "@sentropic/design-system-react";

export function Demo() {
  const [page, setPage] = useState(2);
  return (
    <PaginationNav
      page={page}
      pageCount={5}
      label="Pagination"
      previousLabel="Page précédente"
      nextLabel="Page suivante"
      onPageChange={setPage}
    />
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { PaginationNav } from "@sentropic/design-system-vue";
const page = ref(2);
</script>

<template>
  <PaginationNav v-model:page="page" :page-count="5" label="Pagination" previous-label="Page précédente" next-label="Page suivante" />
</template>`
    }
  },
  tilegroup: {
    id: "tilegroup",
    slug: "tile-group",
    nodes: [
      wrap([
        {
          comp: "TileGroup",
          props: {
            legend: "Choisir une formule",
            value: "pro",
            items: [
              { value: "free", label: "Gratuit", description: "Pour démarrer." },
              { value: "pro", label: "Pro", description: "Pour les équipes." },
              { value: "ent", label: "Entreprise", description: "Sur devis.", disabled: true }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { TileGroup } from "@sentropic/design-system-svelte";
  const items = [
    { value: "free", label: "Gratuit", description: "Pour démarrer." },
    { value: "pro", label: "Pro", description: "Pour les équipes." },
    { value: "ent", label: "Entreprise", description: "Sur devis.", disabled: true }
  ];
  let value = $state("pro");
</script>

<TileGroup {items} bind:value legend="Choisir une formule" />`,
      react: `import { useState } from "react";
import { TileGroup } from "@sentropic/design-system-react";

const items = [
  { value: "free", label: "Gratuit", description: "Pour démarrer." },
  { value: "pro", label: "Pro", description: "Pour les équipes." },
  { value: "ent", label: "Entreprise", description: "Sur devis.", disabled: true }
];

export function Demo() {
  const [value, setValue] = useState("pro");
  return <TileGroup items={items} value={value} legend="Choisir une formule" onChange={setValue} />;
}`,
      vue: `<script setup>
import { ref } from "vue";
import { TileGroup } from "@sentropic/design-system-vue";
const items = [
  { value: "free", label: "Gratuit", description: "Pour démarrer." },
  { value: "pro", label: "Pro", description: "Pour les équipes." },
  { value: "ent", label: "Entreprise", description: "Sur devis.", disabled: true }
];
const value = ref("pro");
</script>

<template>
  <TileGroup :items="items" v-model="value" legend="Choisir une formule" />
</template>`
    }
  },
  menutriggerbutton: {
    id: "menutriggerbutton",
    slug: "menu-trigger-button",
    nodes: [
      wrap([
        { comp: "MenuTriggerButton", props: { "aria-label": "Plus d'options" }, children: ["⋯"] },
        { comp: "MenuTriggerButton", props: { "aria-label": "Paramètres", variant: "secondary" }, children: ["⚙"] }
      ])
    ],
    code: {
      svelte: `<script>
  import { MenuTriggerButton } from "@sentropic/design-system-svelte";
  import { Ellipsis } from "@lucide/svelte";
</script>

<MenuTriggerButton aria-label="Plus d'options">
  <Ellipsis size={18} aria-hidden="true" />
</MenuTriggerButton>`,
      react: `import { MenuTriggerButton } from "@sentropic/design-system-react";
import { Ellipsis } from "lucide-react";

export function Demo() {
  return (
    <MenuTriggerButton aria-label="Plus d'options">
      <Ellipsis size={18} aria-hidden="true" />
    </MenuTriggerButton>
  );
}`,
      vue: `<script setup>
import { MenuTriggerButton } from "@sentropic/design-system-vue";
import { Ellipsis } from "lucide-vue-next";
</script>

<template>
  <MenuTriggerButton aria-label="Plus d'options">
    <Ellipsis :size="18" aria-hidden="true" />
  </MenuTriggerButton>
</template>`
    }
  },
  toggletip: {
    id: "toggletip",
    slug: "toggletip",
    nodes: [
      wrap([
        {
          comp: "Toggletip",
          props: {
            label: "Aide",
            content: "La bulle reste ouverte jusqu'à un nouveau clic ou la touche Escape.",
            triggerLabel: "Plus d'informations"
          },
          children: [{ el: "span", children: ["Quota mensuel"] }]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Toggletip } from "@sentropic/design-system-svelte";
  let open = $state(false);
</script>

<Toggletip bind:open label="Aide" content="La bulle reste ouverte jusqu'à un nouveau clic ou Escape." triggerLabel="Plus d'informations">
  <span>Quota mensuel</span>
</Toggletip>`,
      react: `import { useState } from "react";
import { Toggletip } from "@sentropic/design-system-react";

export function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <Toggletip
      open={open}
      onOpenChange={setOpen}
      label="Aide"
      content="La bulle reste ouverte jusqu'à un nouveau clic ou Escape."
      triggerLabel="Plus d'informations"
    >
      <span>Quota mensuel</span>
    </Toggletip>
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { Toggletip } from "@sentropic/design-system-vue";
const open = ref(false);
</script>

<template>
  <Toggletip v-model:open="open" label="Aide" content="La bulle reste ouverte jusqu'à un nouveau clic ou Escape." trigger-label="Plus d'informations">
    <span>Quota mensuel</span>
  </Toggletip>
</template>`
    }
  },
  flex: {
    id: "flex",
    slug: "flex",
    nodes: [
      {
        comp: "Flex",
        props: { gap: 4, justify: "between", align: "center" },
        children: [
          { comp: "Badge", props: { tone: "info" }, children: ["Étape 1"] },
          { comp: "Badge", props: { tone: "info" }, children: ["Étape 2"] },
          { comp: "Badge", props: { tone: "success" }, children: ["Étape 3"] }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Flex, Badge } from "@sentropic/design-system-svelte";
</script>

<Flex gap={4} justify="between" align="center">
  <Badge tone="info">Étape 1</Badge>
  <Badge tone="info">Étape 2</Badge>
  <Badge tone="success">Étape 3</Badge>
</Flex>`,
      react: `import { Flex, Badge } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Flex gap={4} justify="between" align="center">
      <Badge tone="info">Étape 1</Badge>
      <Badge tone="info">Étape 2</Badge>
      <Badge tone="success">Étape 3</Badge>
    </Flex>
  );
}`,
      vue: `<script setup>
import { Flex, Badge } from "@sentropic/design-system-vue";
</script>

<template>
  <Flex :gap="4" justify="between" align="center">
    <Badge tone="info">Étape 1</Badge>
    <Badge tone="info">Étape 2</Badge>
    <Badge tone="success">Étape 3</Badge>
  </Flex>
</template>`
    }
  },
  stack: {
    id: "stack",
    slug: "stack",
    nodes: [
      {
        comp: "Stack",
        props: { gap: 3 },
        children: [
          { comp: "Card", children: [{ el: "p", props: { class: "fp-card-text" }, children: ["Premier bloc empilé."] }] },
          { comp: "Card", children: [{ el: "p", props: { class: "fp-card-text" }, children: ["Deuxième bloc, sous le premier."] }] },
          { comp: "Card", children: [{ el: "p", props: { class: "fp-card-text" }, children: ["Troisième bloc, gap vertical constant."] }] }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Stack, Card } from "@sentropic/design-system-svelte";
</script>

<Stack gap={3}>
  <Card><p>Premier bloc empilé.</p></Card>
  <Card><p>Deuxième bloc, sous le premier.</p></Card>
  <Card><p>Troisième bloc, gap vertical constant.</p></Card>
</Stack>`,
      react: `import { Stack, Card } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Stack gap={3}>
      <Card><p>Premier bloc empilé.</p></Card>
      <Card><p>Deuxième bloc, sous le premier.</p></Card>
      <Card><p>Troisième bloc, gap vertical constant.</p></Card>
    </Stack>
  );
}`,
      vue: `<script setup>
import { Stack, Card } from "@sentropic/design-system-vue";
</script>

<template>
  <Stack :gap="3">
    <Card><p>Premier bloc empilé.</p></Card>
    <Card><p>Deuxième bloc, sous le premier.</p></Card>
    <Card><p>Troisième bloc, gap vertical constant.</p></Card>
  </Stack>
</template>`
    }
  },
  inline: {
    id: "inline",
    slug: "inline",
    nodes: [
      {
        comp: "Inline",
        props: { gap: 2 },
        children: [
          { comp: "Tag", children: ["svelte"] },
          { comp: "Tag", children: ["react"] },
          { comp: "Tag", children: ["vue"] },
          { comp: "Tag", children: ["tokens"] },
          { comp: "Tag", children: ["thèmes"] },
          { comp: "Tag", children: ["accessibilité"] },
          { comp: "Tag", children: ["white-label"] },
          { comp: "Tag", children: ["layout"] }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Inline, Tag } from "@sentropic/design-system-svelte";
</script>

<Inline gap={2}>
  <Tag>svelte</Tag>
  <Tag>react</Tag>
  <Tag>vue</Tag>
  <Tag>tokens</Tag>
  <Tag>thèmes</Tag>
  <Tag>accessibilité</Tag>
  <Tag>white-label</Tag>
  <Tag>layout</Tag>
</Inline>`,
      react: `import { Inline, Tag } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Inline gap={2}>
      <Tag>svelte</Tag>
      <Tag>react</Tag>
      <Tag>vue</Tag>
      <Tag>tokens</Tag>
      <Tag>thèmes</Tag>
      <Tag>accessibilité</Tag>
      <Tag>white-label</Tag>
      <Tag>layout</Tag>
    </Inline>
  );
}`,
      vue: `<script setup>
import { Inline, Tag } from "@sentropic/design-system-vue";
</script>

<template>
  <Inline :gap="2">
    <Tag>svelte</Tag>
    <Tag>react</Tag>
    <Tag>vue</Tag>
    <Tag>tokens</Tag>
    <Tag>thèmes</Tag>
    <Tag>accessibilité</Tag>
    <Tag>white-label</Tag>
    <Tag>layout</Tag>
  </Inline>
</template>`
    }
  },
  container: {
    id: "container",
    slug: "container",
    nodes: [
      {
        comp: "Container",
        props: { size: "sm" },
        children: [
          {
            comp: "Card",
            children: [
              { el: "h3", props: { class: "fp-card-title" }, children: ["Container size=\"sm\""] },
              { el: "p", props: { class: "fp-card-text" }, children: ["Largeur maximale bornée et centrée, pour garder une longueur de ligne lisible."] }
            ]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Container, Card } from "@sentropic/design-system-svelte";
</script>

<Container size="sm">
  <Card>
    <h3>Container size="sm"</h3>
    <p>Largeur maximale bornée et centrée, pour garder une longueur de ligne lisible.</p>
  </Card>
</Container>`,
      react: `import { Container, Card } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Container size="sm">
      <Card>
        <h3>Container size="sm"</h3>
        <p>Largeur maximale bornée et centrée, pour garder une longueur de ligne lisible.</p>
      </Card>
    </Container>
  );
}`,
      vue: `<script setup>
import { Container, Card } from "@sentropic/design-system-vue";
</script>

<template>
  <Container size="sm">
    <Card>
      <h3>Container size="sm"</h3>
      <p>Largeur maximale bornée et centrée, pour garder une longueur de ligne lisible.</p>
    </Card>
  </Container>
</template>`
    }
  },
  row: {
    id: "row",
    slug: "row",
    nodes: [
      {
        comp: "Row",
        props: { gutter: 4 },
        children: [
          {
            comp: "Col",
            props: { span: 4 },
            children: [{ comp: "Card", children: [{ el: "p", props: { class: "fp-card-text" }, children: ["span=4"] }] }]
          },
          {
            comp: "Col",
            props: { span: 4 },
            children: [{ comp: "Card", children: [{ el: "p", props: { class: "fp-card-text" }, children: ["span=4"] }] }]
          },
          {
            comp: "Col",
            props: { span: 4 },
            children: [{ comp: "Card", children: [{ el: "p", props: { class: "fp-card-text" }, children: ["span=4"] }] }]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Row, Col, Card } from "@sentropic/design-system-svelte";
</script>

<Row gutter={4}>
  <Col span={4}><Card><p>span=4</p></Card></Col>
  <Col span={4}><Card><p>span=4</p></Card></Col>
  <Col span={4}><Card><p>span=4</p></Card></Col>
</Row>`,
      react: `import { Row, Col, Card } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Row gutter={4}>
      <Col span={4}><Card><p>span=4</p></Card></Col>
      <Col span={4}><Card><p>span=4</p></Card></Col>
      <Col span={4}><Card><p>span=4</p></Card></Col>
    </Row>
  );
}`,
      vue: `<script setup>
import { Row, Col, Card } from "@sentropic/design-system-vue";
</script>

<template>
  <Row :gutter="4">
    <Col :span="4"><Card><p>span=4</p></Card></Col>
    <Col :span="4"><Card><p>span=4</p></Card></Col>
    <Col :span="4"><Card><p>span=4</p></Card></Col>
  </Row>
</template>`
    }
  },
  col: {
    id: "col",
    slug: "col",
    nodes: [
      {
        comp: "Row",
        props: { gutter: 4 },
        children: [
          {
            comp: "Col",
            props: { span: 8 },
            children: [{ comp: "Card", children: [{ el: "p", props: { class: "fp-card-text" }, children: ["span=8 — contenu principal"] }] }]
          },
          {
            comp: "Col",
            props: { span: 4 },
            children: [{ comp: "Card", children: [{ el: "p", props: { class: "fp-card-text" }, children: ["span=4 — colonne latérale"] }] }]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Row, Col, Card } from "@sentropic/design-system-svelte";
</script>

<Row gutter={4}>
  <Col span={8}><Card><p>span=8 — contenu principal</p></Card></Col>
  <Col span={4}><Card><p>span=4 — colonne latérale</p></Card></Col>
</Row>`,
      react: `import { Row, Col, Card } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Row gutter={4}>
      <Col span={8}><Card><p>span=8 — contenu principal</p></Card></Col>
      <Col span={4}><Card><p>span=4 — colonne latérale</p></Card></Col>
    </Row>
  );
}`,
      vue: `<script setup>
import { Row, Col, Card } from "@sentropic/design-system-vue";
</script>

<template>
  <Row :gutter="4">
    <Col :span="8"><Card><p>span=8 — contenu principal</p></Card></Col>
    <Col :span="4"><Card><p>span=4 — colonne latérale</p></Card></Col>
  </Row>
</template>`
    }
  },
  hidden: {
    id: "hidden",
    slug: "hidden",
    nodes: [
      {
        comp: "Inline",
        props: { gap: 2, align: "center" },
        children: [
          { comp: "Hidden", props: { below: "md" }, children: [{ comp: "Badge", props: { tone: "info" }, children: ["Visible ≥ md"] }] },
          { comp: "Hidden", props: { above: "md" }, children: [{ comp: "Badge", props: { tone: "warning" }, children: ["Visible < md"] }] },
          { el: "span", props: { class: "fp-card-text" }, children: ["Redimensionnez la fenêtre autour de 768 px."] }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Hidden, Badge } from "@sentropic/design-system-svelte";
</script>

<Hidden below="md">
  <Badge tone="info">Visible ≥ md</Badge>
</Hidden>
<Hidden above="md">
  <Badge tone="warning">Visible &lt; md</Badge>
</Hidden>`,
      react: `import { Hidden, Badge } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Hidden below="md">
        <Badge tone="info">Visible ≥ md</Badge>
      </Hidden>
      <Hidden above="md">
        <Badge tone="warning">Visible &lt; md</Badge>
      </Hidden>
    </>
  );
}`,
      vue: `<script setup>
import { Hidden, Badge } from "@sentropic/design-system-vue";
</script>

<template>
  <Hidden below="md">
    <Badge tone="info">Visible ≥ md</Badge>
  </Hidden>
  <Hidden above="md">
    <Badge tone="warning">Visible &lt; md</Badge>
  </Hidden>
</template>`
    }
  },
  divider: {
    id: "divider",
    slug: "divider",
    nodes: [
      {
        comp: "Stack",
        props: { gap: 3 },
        children: [
          { el: "span", props: { class: "fp-card-text" }, children: ["Section précédente"] },
          { comp: "Divider" },
          { el: "span", props: { class: "fp-card-text" }, children: ["Section suivante"] },
          { comp: "Divider", props: { label: "ou" } },
          { el: "span", props: { class: "fp-card-text" }, children: ["Alternative"] }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Divider } from "@sentropic/design-system-svelte";
</script>

<p>Section précédente</p>
<Divider />
<p>Section suivante</p>
<Divider label="ou" />
<p>Alternative</p>`,
      react: `import { Divider } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <p>Section précédente</p>
      <Divider />
      <p>Section suivante</p>
      <Divider label="ou" />
      <p>Alternative</p>
    </>
  );
}`,
      vue: `<script setup>
import { Divider } from "@sentropic/design-system-vue";
</script>

<template>
  <p>Section précédente</p>
  <Divider />
  <p>Section suivante</p>
  <Divider label="ou" />
  <p>Alternative</p>
</template>`
    }
  },
  avatar: {
    id: "avatar",
    slug: "avatar",
    nodes: [
      wrap([
        { comp: "Avatar", props: { name: "Ada Lovelace", size: "sm" } },
        { comp: "Avatar", props: { name: "Ada Lovelace", size: "md" } },
        { comp: "Avatar", props: { name: "Grace Hopper", size: "lg", tone: "category3" } },
        {
          comp: "Avatar",
          props: {
            name: "Sent Tech",
            size: "xl",
            src: "https://i.pravatar.cc/96?img=15"
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Avatar } from "@sentropic/design-system-svelte";
</script>

<Avatar name="Ada Lovelace" size="sm" />
<Avatar name="Ada Lovelace" size="md" />
<Avatar name="Grace Hopper" size="lg" tone="category3" />
<Avatar name="Sent Tech" size="xl" src="https://i.pravatar.cc/96?img=15" />`,
      react: `import { Avatar } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" size="md" />
      <Avatar name="Grace Hopper" size="lg" tone="category3" />
      <Avatar name="Sent Tech" size="xl" src="https://i.pravatar.cc/96?img=15" />
    </>
  );
}`,
      vue: `<script setup>
import { Avatar } from "@sentropic/design-system-vue";
</script>

<template>
  <Avatar name="Ada Lovelace" size="sm" />
  <Avatar name="Ada Lovelace" size="md" />
  <Avatar name="Grace Hopper" size="lg" tone="category3" />
  <Avatar name="Sent Tech" size="xl" src="https://i.pravatar.cc/96?img=15" />
</template>`
    }
  },
  "avatar-group": {
    id: "avatar-group",
    slug: "avatar-group",
    nodes: [
      wrap([
        {
          comp: "AvatarGroup",
          props: { max: 3, total: 6, size: "md" },
          children: [
            { comp: "Avatar", props: { name: "Ada Lovelace", tone: "category1" } },
            { comp: "Avatar", props: { name: "Grace Hopper", tone: "category3" } },
            { comp: "Avatar", props: { name: "Alan Turing", tone: "category5" } }
          ]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { AvatarGroup, Avatar } from "@sentropic/design-system-svelte";
</script>

<AvatarGroup max={3} total={6}>
  <Avatar name="Ada Lovelace" tone="category1" />
  <Avatar name="Grace Hopper" tone="category3" />
  <Avatar name="Alan Turing" tone="category5" />
</AvatarGroup>`,
      react: `import { AvatarGroup, Avatar } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <AvatarGroup max={3} total={6}>
      <Avatar name="Ada Lovelace" tone="category1" />
      <Avatar name="Grace Hopper" tone="category3" />
      <Avatar name="Alan Turing" tone="category5" />
    </AvatarGroup>
  );
}`,
      vue: `<script setup>
import { AvatarGroup, Avatar } from "@sentropic/design-system-vue";
</script>

<template>
  <AvatarGroup :max="3" :total="6">
    <Avatar name="Ada Lovelace" tone="category1" />
    <Avatar name="Grace Hopper" tone="category3" />
    <Avatar name="Alan Turing" tone="category5" />
  </AvatarGroup>
</template>`
    }
  },
  "button-group": {
    id: "button-group",
    slug: "button-group",
    nodes: [
      wrap([
        {
          comp: "ButtonGroup",
          props: { attached: true, label: "Alignement" },
          children: [
            { comp: "Button", props: { variant: "secondary" }, children: ["Gauche"] },
            { comp: "Button", props: { variant: "secondary" }, children: ["Centre"] },
            { comp: "Button", props: { variant: "secondary" }, children: ["Droite"] }
          ]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { ButtonGroup, Button } from "@sentropic/design-system-svelte";
</script>

<ButtonGroup attached label="Alignement">
  <Button variant="secondary">Gauche</Button>
  <Button variant="secondary">Centre</Button>
  <Button variant="secondary">Droite</Button>
</ButtonGroup>`,
      react: `import { ButtonGroup, Button } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ButtonGroup attached label="Alignement">
      <Button variant="secondary">Gauche</Button>
      <Button variant="secondary">Centre</Button>
      <Button variant="secondary">Droite</Button>
    </ButtonGroup>
  );
}`,
      vue: `<script setup>
import { ButtonGroup, Button } from "@sentropic/design-system-vue";
</script>

<template>
  <ButtonGroup attached label="Alignement">
    <Button variant="secondary">Gauche</Button>
    <Button variant="secondary">Centre</Button>
    <Button variant="secondary">Droite</Button>
  </ButtonGroup>
</template>`
    }
  },
  "checkbox-group": {
    id: "checkbox-group",
    slug: "checkbox-group",
    nodes: [
      wrap([
        {
          comp: "CheckboxGroup",
          props: {
            legend: "Notifications",
            helperText: "Choisissez les canaux à activer.",
            value: ["email"],
            options: [
              { label: "E-mail", value: "email" },
              { label: "SMS", value: "sms" },
              { label: "Push", value: "push" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { CheckboxGroup } from "@sentropic/design-system-svelte";

  let value = ["email"];
  const options = [
    { label: "E-mail", value: "email" },
    { label: "SMS", value: "sms" },
    { label: "Push", value: "push" }
  ];
</script>

<CheckboxGroup
  legend="Notifications"
  helperText="Choisissez les canaux à activer."
  {options}
  {value}
  onchange={(next) => (value = next)}
/>`,
      react: `import { useState } from "react";
import { CheckboxGroup } from "@sentropic/design-system-react";

const options = [
  { label: "E-mail", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Push", value: "push" }
];

export function Demo() {
  const [value, setValue] = useState(["email"]);
  return (
    <CheckboxGroup
      legend="Notifications"
      helperText="Choisissez les canaux à activer."
      options={options}
      value={value}
      onChange={setValue}
    />
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { CheckboxGroup } from "@sentropic/design-system-vue";

const value = ref(["email"]);
const options = [
  { label: "E-mail", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Push", value: "push" }
];
</script>

<template>
  <CheckboxGroup
    legend="Notifications"
    helper-text="Choisissez les canaux à activer."
    :options="options"
    :value="value"
    @change="value = $event"
  />
</template>`
    }
  },
  "radio-group": {
    id: "radio-group",
    slug: "radio-group",
    nodes: [
      wrap([
        {
          comp: "RadioGroup",
          props: {
            legend: "Forfait",
            name: "plan",
            value: "pro",
            options: [
              { label: "Découverte", value: "free" },
              { label: "Pro", value: "pro" },
              { label: "Entreprise", value: "enterprise" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { RadioGroup } from "@sentropic/design-system-svelte";

  let value = "pro";
  const options = [
    { label: "Découverte", value: "free" },
    { label: "Pro", value: "pro" },
    { label: "Entreprise", value: "enterprise" }
  ];
</script>

<RadioGroup
  legend="Forfait"
  name="plan"
  {options}
  {value}
  onchange={(next) => (value = next)}
/>`,
      react: `import { useState } from "react";
import { RadioGroup } from "@sentropic/design-system-react";

const options = [
  { label: "Découverte", value: "free" },
  { label: "Pro", value: "pro" },
  { label: "Entreprise", value: "enterprise" }
];

export function Demo() {
  const [value, setValue] = useState("pro");
  return (
    <RadioGroup
      legend="Forfait"
      name="plan"
      options={options}
      value={value}
      onChange={setValue}
    />
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { RadioGroup } from "@sentropic/design-system-vue";

const value = ref("pro");
const options = [
  { label: "Découverte", value: "free" },
  { label: "Pro", value: "pro" },
  { label: "Entreprise", value: "enterprise" }
];
</script>

<template>
  <RadioGroup
    legend="Forfait"
    name="plan"
    :options="options"
    :value="value"
    @change="value = $event"
  />
</template>`
    }
  },
  typography: {
    id: "typography",
    slug: "typography",
    nodes: [
      stack([
        { comp: "Typography", props: { variant: "h1" }, children: ["Titre h1"] },
        { comp: "Typography", props: { variant: "h3" }, children: ["Sous-titre h3"] },
        {
          comp: "Typography",
          props: { variant: "body" },
          children: ["Paragraphe courant : la base de la lecture, lisible et confortable."]
        },
        {
          comp: "Typography",
          props: { variant: "caption", tone: "muted" },
          children: ["Légende discrète · ton atténué"]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Typography } from "@sentropic/design-system-svelte";
</script>

<Typography variant="h1">Titre h1</Typography>
<Typography variant="h3">Sous-titre h3</Typography>
<Typography variant="body">Paragraphe courant : la base de la lecture.</Typography>
<Typography variant="caption" tone="muted">Légende discrète · ton atténué</Typography>`,
      react: `import { Typography } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <Typography variant="h1">Titre h1</Typography>
      <Typography variant="h3">Sous-titre h3</Typography>
      <Typography variant="body">Paragraphe courant : la base de la lecture.</Typography>
      <Typography variant="caption" tone="muted">Légende discrète · ton atténué</Typography>
    </>
  );
}`,
      vue: `<script setup>
import { Typography } from "@sentropic/design-system-vue";
</script>

<template>
  <Typography variant="h1">Titre h1</Typography>
  <Typography variant="h3">Sous-titre h3</Typography>
  <Typography variant="body">Paragraphe courant : la base de la lecture.</Typography>
  <Typography variant="caption" tone="muted">Légende discrète · ton atténué</Typography>
</template>`
    }
  },
  collapsible: {
    id: "collapsible",
    slug: "collapsible",
    nodes: [
      {
        comp: "Collapsible",
        props: { title: "Détails de facturation", open: true },
        children: [
          {
            el: "p",
            props: { class: "fp-card-text" },
            children: [
              "Contenu replié sous un en-tête cliquable. La région est annoncée aux lecteurs d'écran."
            ]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { Collapsible } from "@sentropic/design-system-svelte";

  let open = true;
</script>

<Collapsible title="Détails de facturation" bind:open>
  <p>Contenu replié sous un en-tête cliquable.</p>
</Collapsible>`,
      react: `import { Collapsible } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <Collapsible title="Détails de facturation" defaultOpen>
      <p>Contenu replié sous un en-tête cliquable.</p>
    </Collapsible>
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { Collapsible } from "@sentropic/design-system-vue";

const open = ref(true);
</script>

<template>
  <Collapsible title="Détails de facturation" v-model:open="open">
    <p>Contenu replié sous un en-tête cliquable.</p>
  </Collapsible>
</template>`
    }
  },
  stepper: {
    id: "stepper",
    slug: "stepper",
    nodes: [
      {
        comp: "Stepper",
        props: {
          current: 1,
          label: "Création du compte",
          steps: [
            { label: "Compte", description: "Identité" },
            { label: "Profil", description: "En cours" },
            { label: "Préférences" },
            { label: "Confirmation" }
          ]
        }
      }
    ],
    code: {
      svelte: `<script>
  import { Stepper } from "@sentropic/design-system-svelte";

  const steps = [
    { label: "Compte", description: "Identité" },
    { label: "Profil", description: "En cours" },
    { label: "Préférences" },
    { label: "Confirmation" }
  ];
</script>

<Stepper {steps} current={1} label="Création du compte" />`,
      react: `import { Stepper } from "@sentropic/design-system-react";

const steps = [
  { label: "Compte", description: "Identité" },
  { label: "Profil", description: "En cours" },
  { label: "Préférences" },
  { label: "Confirmation" }
];

export function Demo() {
  return <Stepper steps={steps} current={1} label="Création du compte" />;
}`,
      vue: `<script setup>
import { Stepper } from "@sentropic/design-system-vue";

const steps = [
  { label: "Compte", description: "Identité" },
  { label: "Profil", description: "En cours" },
  { label: "Préférences" },
  { label: "Confirmation" }
];
</script>

<template>
  <Stepper :steps="steps" :current="1" label="Création du compte" />
</template>`
    }
  },
  rating: {
    id: "rating",
    slug: "rating",
    nodes: [
      wrap([{ comp: "Rating", props: { value: 3, max: 5, label: "Note" } }])
    ],
    code: {
      svelte: `<script>
  import { Rating } from "@sentropic/design-system-svelte";

  let value = 3;
</script>

<Rating {value} max={5} label="Note" onChange={(next) => (value = next)} />`,
      react: `import { useState } from "react";
import { Rating } from "@sentropic/design-system-react";

export function Demo() {
  const [value, setValue] = useState(3);
  return <Rating value={value} max={5} label="Note" onChange={setValue} />;
}`,
      vue: `<script setup>
import { ref } from "vue";
import { Rating } from "@sentropic/design-system-vue";

const value = ref(3);
</script>

<template>
  <Rating :value="value" :max="5" label="Note" @change="value = $event" />
</template>`
    }
  },
  "time-picker": {
    id: "time-picker",
    slug: "time-picker",
    nodes: [
      wrap([
        { comp: "TimePicker", props: { value: "09:30", step: 15, label: "Heure du rendez-vous" } }
      ])
    ],
    code: {
      svelte: `<script>
  import { TimePicker } from "@sentropic/design-system-svelte";

  let value = "09:30";
</script>

<TimePicker
  {value}
  step={15}
  label="Heure du rendez-vous"
  onChange={(next) => (value = next)}
/>`,
      react: `import { useState } from "react";
import { TimePicker } from "@sentropic/design-system-react";

export function Demo() {
  const [value, setValue] = useState("09:30");
  return (
    <TimePicker
      value={value}
      step={15}
      label="Heure du rendez-vous"
      onChange={setValue}
    />
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { TimePicker } from "@sentropic/design-system-vue";

const value = ref("09:30");
</script>

<template>
  <TimePicker
    :value="value"
    :step="15"
    label="Heure du rendez-vous"
    @change="value = $event"
  />
</template>`
    }
  },
  calendar: {
    id: "calendar",
    slug: "calendar",
    nodes: [
      wrap([
        { comp: "Calendar", props: { value: "2026-06-12", month: "2026-06" } }
      ])
    ],
    code: {
      svelte: `<script>
  import { Calendar } from "@sentropic/design-system-svelte";

  let value = "2026-06-12";
</script>

<Calendar {value} month="2026-06" onChange={(next) => (value = next)} />`,
      react: `import { useState } from "react";
import { Calendar } from "@sentropic/design-system-react";

export function Demo() {
  const [value, setValue] = useState("2026-06-12");
  return <Calendar value={value} month="2026-06" onChange={setValue} />;
}`,
      vue: `<script setup>
import { ref } from "vue";
import { Calendar } from "@sentropic/design-system-vue";

const value = ref("2026-06-12");
</script>

<template>
  <Calendar :value="value" month="2026-06" @change="value = $event" />
</template>`
    }
  },
  "slide-indicator": {
    id: "slide-indicator",
    slug: "slide-indicator",
    nodes: [
      wrap([{ comp: "SlideIndicator", props: { count: 5, current: 1 } }])
    ],
    code: {
      svelte: `<script>
  import { SlideIndicator } from "@sentropic/design-system-svelte";

  let current = 1;
</script>

<SlideIndicator count={5} {current} onChange={(index) => (current = index)} />`,
      react: `import { useState } from "react";
import { SlideIndicator } from "@sentropic/design-system-react";

export function Demo() {
  const [current, setCurrent] = useState(1);
  return <SlideIndicator count={5} current={current} onChange={setCurrent} />;
}`,
      vue: `<script setup>
import { ref } from "vue";
import { SlideIndicator } from "@sentropic/design-system-vue";

const current = ref(1);
</script>

<template>
  <SlideIndicator :count="5" :current="current" @change="current = $event" />
</template>`
    }
  },
  autosave: {
    id: "autosave",
    slug: "autosave",
    nodes: [
      wrap([
        { comp: "Autosave", props: { status: "saved", lastSaved: "2026-06-04T12:00:00.000Z" } }
      ])
    ],
    code: {
      svelte: `<script>
  import { Autosave } from "@sentropic/design-system-svelte";
</script>

<Autosave status="saved" lastSaved={new Date()} />`,
      react: `import { Autosave } from "@sentropic/design-system-react";

export function Demo() {
  return <Autosave status="saved" lastSaved={new Date()} />;
}`,
      vue: `<script setup>
import { Autosave } from "@sentropic/design-system-vue";
</script>

<template>
  <Autosave status="saved" :lastSaved="new Date()" />
</template>`
    }
  },
  portal: {
    id: "portal",
    slug: "portal",
    nodes: [
      wrap([
        {
          comp: "Portal",
          props: { disabled: true },
          children: [
            { comp: "Badge", props: { tone: "info" }, children: ["Rendu en place"] }
          ]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Portal, Badge } from "@sentropic/design-system-svelte";
</script>

<!-- Téléporté dans <body> (target par défaut) -->
<Portal target="body">
  <div class="toast">Enregistré</div>
</Portal>

<!-- disabled : rendu en place, sans téléportation -->
<Portal disabled>
  <Badge tone="info">Rendu en place</Badge>
</Portal>`,
      react: `import { Portal, Badge } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      {/* Téléporté dans <body> (target par défaut) */}
      <Portal target="body">
        <div className="toast">Enregistré</div>
      </Portal>

      {/* disabled : rendu en place, sans téléportation */}
      <Portal disabled>
        <Badge tone="info">Rendu en place</Badge>
      </Portal>
    </>
  );
}`,
      vue: `<script setup>
import { Portal, Badge } from "@sentropic/design-system-vue";
</script>

<template>
  <!-- Téléporté dans <body> (target par défaut) -->
  <Portal target="body">
    <div class="toast">Enregistré</div>
  </Portal>

  <!-- disabled : rendu en place, sans téléportation -->
  <Portal :disabled="true">
    <Badge tone="info">Rendu en place</Badge>
  </Portal>
</template>`
    }
  },
  popper: {
    id: "popper",
    slug: "popper",
    // Sans `anchor` (impossible à exprimer dans un NodeSpec statique), Popper
    // ne rend rien même avec open=true : aperçu sûr au prérendu.
    nodes: [
      wrap([
        {
          comp: "Popper",
          props: { open: true, placement: "bottom" },
          children: [
            { comp: "Card", props: {}, children: ["Panneau positionné près de l'ancre"] }
          ]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { Popper, Button } from "@sentropic/design-system-svelte";

  let anchor = $state(null);
  let open = $state(false);
</script>

<Button bind:el={anchor} onclick={() => (open = !open)}>
  Ouvrir
</Button>

<Popper {anchor} {open} placement="bottom" offset={8} arrow>
  <div class="panel">Panneau flottant</div>
</Popper>`,
      react: `import { useRef, useState } from "react";
import { Popper, Button } from "@sentropic/design-system-react";

export function Demo() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button ref={setAnchor} onClick={() => setOpen((v) => !v)}>
        Ouvrir
      </Button>
      <Popper anchor={anchor} open={open} placement="bottom" offset={8} arrow>
        <div className="panel">Panneau flottant</div>
      </Popper>
    </>
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { Popper, Button } from "@sentropic/design-system-vue";

const anchor = ref(null);
const open = ref(false);
</script>

<template>
  <Button ref="anchor" @click="open = !open">Ouvrir</Button>

  <Popper :anchor="anchor" :open="open" placement="bottom" :offset="8" arrow>
    <div class="panel">Panneau flottant</div>
  </Popper>
</template>`
    }
  },

  "selectable-row": {
    id: "selectable-row",
    slug: "selectable-row",
    nodes: [
      stack([
        {
          comp: "SelectableList",
          props: { label: "Environnement", value: "staging" },
          children: [
            { comp: "SelectableRow", props: { value: "prod" }, children: ["Production"] },
            { comp: "SelectableRow", props: { value: "staging" }, children: ["Staging"] },
            { comp: "SelectableRow", props: { value: "dev" }, children: ["Développement"] }
          ]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { SelectableRow } from "@sentropic/design-system-svelte";

  let selected = true;
</script>

<SelectableRow bind:selected onselect={(s) => (selected = s)}>
  {#snippet leading()}<span aria-hidden="true">◆</span>{/snippet}
  Staging
  {#snippet trailing()}<span>v2.4</span>{/snippet}
</SelectableRow>`,
      react: `import { useState } from "react";
import { SelectableRow } from "@sentropic/design-system-react";

export function Demo() {
  const [selected, setSelected] = useState(true);
  return (
    <SelectableRow
      selected={selected}
      onSelect={setSelected}
      leading={<span aria-hidden="true">◆</span>}
      trailing={<span>v2.4</span>}
    >
      Staging
    </SelectableRow>
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { SelectableRow } from "@sentropic/design-system-vue";

const selected = ref(true);
</script>

<template>
  <SelectableRow :selected="selected" @select="selected = $event">
    <template #leading><span aria-hidden="true">◆</span></template>
    Staging
    <template #trailing><span>v2.4</span></template>
  </SelectableRow>
</template>`
    }
  },

  "selectable-list": {
    id: "selectable-list",
    slug: "selectable-list",
    nodes: [
      stack([
        {
          comp: "SelectableList",
          props: { label: "Région", value: "ca-qc" },
          children: [
            { comp: "SelectableRow", props: { value: "ca-qc" }, children: ["Canada — Québec"] },
            { comp: "SelectableRow", props: { value: "ca-on" }, children: ["Canada — Ontario"] },
            { comp: "SelectableRow", props: { value: "us-east" }, children: ["États-Unis — Est"] },
            { comp: "SelectableRow", props: { value: "eu-west" }, children: ["Europe — Ouest"] }
          ]
        },
        {
          comp: "SelectableList",
          props: { label: "Intégrations", multiple: true, value: ["github", "slack"] },
          children: [
            { comp: "SelectableRow", props: { value: "github" }, children: ["GitHub"] },
            { comp: "SelectableRow", props: { value: "slack" }, children: ["Slack"] },
            { comp: "SelectableRow", props: { value: "jira" }, children: ["Jira"] },
            { comp: "SelectableRow", props: { value: "figma" }, children: ["Figma"] }
          ]
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { SelectableList, SelectableRow } from "@sentropic/design-system-svelte";

  let region = "ca-qc";
</script>

<SelectableList label="Région" value={region} onchange={(v) => (region = v)}>
  <SelectableRow value="ca-qc">Canada — Québec</SelectableRow>
  <SelectableRow value="ca-on">Canada — Ontario</SelectableRow>
  <SelectableRow value="us-east">États-Unis — Est</SelectableRow>
  <SelectableRow value="eu-west">Europe — Ouest</SelectableRow>
</SelectableList>`,
      react: `import { useState } from "react";
import { SelectableList, SelectableRow } from "@sentropic/design-system-react";

export function Demo() {
  const [region, setRegion] = useState("ca-qc");
  return (
    <SelectableList label="Région" value={region} onChange={setRegion}>
      <SelectableRow value="ca-qc">Canada — Québec</SelectableRow>
      <SelectableRow value="ca-on">Canada — Ontario</SelectableRow>
      <SelectableRow value="us-east">États-Unis — Est</SelectableRow>
      <SelectableRow value="eu-west">Europe — Ouest</SelectableRow>
    </SelectableList>
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { SelectableList, SelectableRow } from "@sentropic/design-system-vue";

const region = ref("ca-qc");
</script>

<template>
  <SelectableList label="Région" :value="region" @change="region = $event">
    <SelectableRow value="ca-qc">Canada — Québec</SelectableRow>
    <SelectableRow value="ca-on">Canada — Ontario</SelectableRow>
    <SelectableRow value="us-east">États-Unis — Est</SelectableRow>
    <SelectableRow value="eu-west">Europe — Ouest</SelectableRow>
  </SelectableList>
</template>`
    }
  },

  kpicardbasic: {
    id: "kpicardbasic",
    slug: "kpi-card",
    nodes: [
      wrap([
        {
          comp: "KpiCard",
          props: {
            label: "Revenu mensuel",
            value: 48200,
            delta: 0.083,
            deltaFormat: "percent",
            tone: "category1",
            sparkline: [32000, 35000, 38000, 42000, 45000, 48200]
          }
        },
        {
          comp: "KpiCard",
          props: {
            label: "Taux de conversion",
            value: 0.072,
            format: "percent",
            delta: -0.005,
            deltaFormat: "percent",
            tone: "category3"
          }
        },
        {
          comp: "KpiCard",
          props: {
            label: "Transactions",
            value: 1240,
            delta: 94,
            deltaFormat: "absolute",
            tone: "category5",
            sparkline: [900, 980, 1050, 1100, 1180, 1240]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { KpiCard } from "@sentropic/design-system-svelte";
</script>

<KpiCard
  label="Revenu mensuel"
  value={48200}
  delta={0.083}
  deltaFormat="percent"
  tone="category1"
  sparkline={[32000, 35000, 38000, 42000, 45000, 48200]}
/>
<KpiCard
  label="Taux de conversion"
  value={0.072}
  format="percent"
  delta={-0.005}
  deltaFormat="percent"
  tone="category3"
/>
<KpiCard
  label="Transactions"
  value={1240}
  delta={94}
  deltaFormat="absolute"
  tone="category5"
  sparkline={[900, 980, 1050, 1100, 1180, 1240]}
/>`,
      react: `import { KpiCard } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <KpiCard
        label="Revenu mensuel"
        value={48200}
        delta={0.083}
        deltaFormat="percent"
        tone="category1"
        sparkline={[32000, 35000, 38000, 42000, 45000, 48200]}
      />
      <KpiCard
        label="Taux de conversion"
        value={0.072}
        format="percent"
        delta={-0.005}
        deltaFormat="percent"
        tone="category3"
      />
      <KpiCard
        label="Transactions"
        value={1240}
        delta={94}
        deltaFormat="absolute"
        tone="category5"
        sparkline={[900, 980, 1050, 1100, 1180, 1240]}
      />
    </>
  );
}`,
      vue: `<script setup>
import { KpiCard } from "@sentropic/design-system-vue";
</script>

<template>
  <KpiCard
    label="Revenu mensuel"
    :value="48200"
    :delta="0.083"
    deltaFormat="percent"
    tone="category1"
    :sparkline="[32000, 35000, 38000, 42000, 45000, 48200]"
  />
  <KpiCard
    label="Taux de conversion"
    :value="0.072"
    format="percent"
    :delta="-0.005"
    deltaFormat="percent"
    tone="category3"
  />
  <KpiCard
    label="Transactions"
    :value="1240"
    :delta="94"
    deltaFormat="absolute"
    tone="category5"
    :sparkline="[900, 980, 1050, 1100, 1180, 1240]"
  />
</template>`
    }
  },

  combochart: {
    id: "combochart",
    slug: "combo-chart",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "ComboChart",
            props: {
              label: "Ventes et marge par trimestre",
              categories: ["T1", "T2", "T3", "T4"],
              bars: [
                { label: "Ventes (k$)", data: [120, 145, 160, 190], tone: "category1" },
                { label: "Coûts (k$)", data: [80, 95, 105, 120], tone: "category3" }
              ],
              lines: [
                { label: "Marge (%)", data: [33, 34, 34, 37], tone: "category5", smooth: true }
              ],
              leftAxisLabel: "k$",
              rightAxisLabel: "%",
              legend: true
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { ComboChart } from "@sentropic/design-system-svelte";
</script>

<ComboChart
  label="Ventes et marge par trimestre"
  categories={["T1", "T2", "T3", "T4"]}
  bars={[
    { label: "Ventes (k$)", data: [120, 145, 160, 190], tone: "category1" },
    { label: "Coûts (k$)", data: [80, 95, 105, 120], tone: "category3" }
  ]}
  lines={[{ label: "Marge (%)", data: [33, 34, 34, 37], tone: "category5", smooth: true }]}
  leftAxisLabel="k$"
  rightAxisLabel="%"
/>`,
      react: `import { ComboChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ComboChart
      label="Ventes et marge par trimestre"
      categories={["T1", "T2", "T3", "T4"]}
      bars={[
        { label: "Ventes (k$)", data: [120, 145, 160, 190], tone: "category1" },
        { label: "Coûts (k$)", data: [80, 95, 105, 120], tone: "category3" }
      ]}
      lines={[{ label: "Marge (%)", data: [33, 34, 34, 37], tone: "category5", smooth: true }]}
      leftAxisLabel="k$"
      rightAxisLabel="%"
    />
  );
}`,
      vue: `<script setup>
import { ComboChart } from "@sentropic/design-system-vue";
</script>

<template>
  <ComboChart
    label="Ventes et marge par trimestre"
    :categories="['T1', 'T2', 'T3', 'T4']"
    :bars="[
      { label: 'Ventes (k$)', data: [120, 145, 160, 190], tone: 'category1' },
      { label: 'Coûts (k$)', data: [80, 95, 105, 120], tone: 'category3' }
    ]"
    :lines="[{ label: 'Marge (%)', data: [33, 34, 34, 37], tone: 'category5', smooth: true }]"
    leftAxisLabel="k$"
    rightAxisLabel="%"
  />
</template>`
    }
  },

  gaugechart: {
    id: "gaugechart",
    slug: "gauge-chart",
    nodes: [
      wrap([
        {
          comp: "GaugeChart",
          props: {
            value: 72,
            label: "Disponibilité SLA",
            thresholds: [
              { value: 0, tone: "error" },
              { value: 60, tone: "warning" },
              { value: 80, tone: "success" }
            ],
            unit: "%",
            size: 180
          }
        },
        {
          comp: "GaugeChart",
          props: {
            value: 42,
            label: "Charge CPU",
            thresholds: [
              { value: 0, tone: "success" },
              { value: 70, tone: "warning" },
              { value: 90, tone: "error" }
            ],
            unit: "%",
            size: 180
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { GaugeChart } from "@sentropic/design-system-svelte";
</script>

<GaugeChart
  value={72}
  label="Disponibilité SLA"
  thresholds={[
    { value: 0, tone: "error" },
    { value: 60, tone: "warning" },
    { value: 80, tone: "success" }
  ]}
  unit="%"
/>`,
      react: `import { GaugeChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <GaugeChart
      value={72}
      label="Disponibilité SLA"
      thresholds={[
        { value: 0, tone: "error" },
        { value: 60, tone: "warning" },
        { value: 80, tone: "success" }
      ]}
      unit="%"
    />
  );
}`,
      vue: `<script setup>
import { GaugeChart } from "@sentropic/design-system-vue";
</script>

<template>
  <GaugeChart
    :value="72"
    label="Disponibilité SLA"
    :thresholds="[
      { value: 0, tone: 'error' },
      { value: 60, tone: 'warning' },
      { value: 80, tone: 'success' }
    ]"
    unit="%"
  />
</template>`
    }
  },

  funnelchart: {
    id: "funnelchart",
    slug: "funnel-chart",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "FunnelChart",
            props: {
              label: "Entonnoir de conversion",
              data: [
                { label: "Visiteurs", value: 8400, tone: "category1" },
                { label: "Prospects", value: 3200, tone: "category2" },
                { label: "Leads qualifiés", value: 940, tone: "category3" },
                { label: "Clients", value: 210, tone: "category4" }
              ],
              showPercentages: true
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { FunnelChart } from "@sentropic/design-system-svelte";
</script>

<FunnelChart
  label="Entonnoir de conversion"
  data={[
    { label: "Visiteurs", value: 8400, tone: "category1" },
    { label: "Prospects", value: 3200, tone: "category2" },
    { label: "Leads qualifiés", value: 940, tone: "category3" },
    { label: "Clients", value: 210, tone: "category4" }
  ]}
  showPercentages
/>`,
      react: `import { FunnelChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <FunnelChart
      label="Entonnoir de conversion"
      data={[
        { label: "Visiteurs", value: 8400, tone: "category1" },
        { label: "Prospects", value: 3200, tone: "category2" },
        { label: "Leads qualifiés", value: 940, tone: "category3" },
        { label: "Clients", value: 210, tone: "category4" }
      ]}
      showPercentages
    />
  );
}`,
      vue: `<script setup>
import { FunnelChart } from "@sentropic/design-system-vue";
</script>

<template>
  <FunnelChart
    label="Entonnoir de conversion"
    :data="[
      { label: 'Visiteurs', value: 8400, tone: 'category1' },
      { label: 'Prospects', value: 3200, tone: 'category2' },
      { label: 'Leads qualifiés', value: 940, tone: 'category3' },
      { label: 'Clients', value: 210, tone: 'category4' }
    ]"
    :showPercentages="true"
  />
</template>`
    }
  },

  waterfallchart: {
    id: "waterfallchart",
    slug: "waterfall-chart",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "WaterfallChart",
            props: {
              label: "Résultat d'exploitation T3",
              data: [
                { label: "Début", value: 50000, type: "total" },
                { label: "Revenus abonnements", value: 32000, type: "increase" },
                { label: "Revenus services", value: 14500, type: "increase" },
                { label: "Coûts infra", value: -18000, type: "decrease" },
                { label: "Salaires", value: -22000, type: "decrease" },
                { label: "Marketing", value: -8500, type: "decrease" },
                { label: "Résultat net", value: 48000, type: "total" }
              ]
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { WaterfallChart } from "@sentropic/design-system-svelte";
</script>

<WaterfallChart
  label="Résultat d'exploitation T3"
  data={[
    { label: "Début", value: 50000, type: "total" },
    { label: "Revenus abonnements", value: 32000, type: "increase" },
    { label: "Revenus services", value: 14500, type: "increase" },
    { label: "Coûts infra", value: -18000, type: "decrease" },
    { label: "Salaires", value: -22000, type: "decrease" },
    { label: "Marketing", value: -8500, type: "decrease" },
    { label: "Résultat net", value: 48000, type: "total" }
  ]}
/>`,
      react: `import { WaterfallChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <WaterfallChart
      label="Résultat d'exploitation T3"
      data={[
        { label: "Début", value: 50000, type: "total" },
        { label: "Revenus abonnements", value: 32000, type: "increase" },
        { label: "Revenus services", value: 14500, type: "increase" },
        { label: "Coûts infra", value: -18000, type: "decrease" },
        { label: "Salaires", value: -22000, type: "decrease" },
        { label: "Marketing", value: -8500, type: "decrease" },
        { label: "Résultat net", value: 48000, type: "total" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { WaterfallChart } from "@sentropic/design-system-vue";
</script>

<template>
  <WaterfallChart
    label="Résultat d'exploitation T3"
    :data="[
      { label: 'Début', value: 50000, type: 'total' },
      { label: 'Revenus abonnements', value: 32000, type: 'increase' },
      { label: 'Revenus services', value: 14500, type: 'increase' },
      { label: 'Coûts infra', value: -18000, type: 'decrease' },
      { label: 'Salaires', value: -22000, type: 'decrease' },
      { label: 'Marketing', value: -8500, type: 'decrease' },
      { label: 'Résultat net', value: 48000, type: 'total' }
    ]"
  />
</template>`
    }
  },

  treemapchart: {
    id: "treemapchart",
    slug: "treemap-chart",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "TreemapChart",
            props: {
              label: "Répartition du budget par département",
              data: [
                {
                  label: "Ingénierie",
                  value: 0,
                  tone: "category1",
                  children: [
                    { label: "Frontend", value: 42000 },
                    { label: "Backend", value: 58000 },
                    { label: "Infra", value: 31000 }
                  ]
                },
                {
                  label: "Produit",
                  value: 0,
                  tone: "category2",
                  children: [
                    { label: "Design", value: 27000 },
                    { label: "PM", value: 22000 }
                  ]
                },
                {
                  label: "Marketing",
                  value: 0,
                  tone: "category3",
                  children: [
                    { label: "Growth", value: 18000 },
                    { label: "Contenu", value: 12000 }
                  ]
                }
              ],
              showLabels: true
            }
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { TreemapChart } from "@sentropic/design-system-svelte";
</script>

<TreemapChart
  label="Répartition du budget par département"
  data={[
    {
      label: "Ingénierie", tone: "category1",
      children: [
        { label: "Frontend", value: 42000 },
        { label: "Backend", value: 58000 },
        { label: "Infra", value: 31000 }
      ]
    },
    {
      label: "Produit", tone: "category2",
      children: [
        { label: "Design", value: 27000 },
        { label: "PM", value: 22000 }
      ]
    },
    {
      label: "Marketing", tone: "category3",
      children: [
        { label: "Growth", value: 18000 },
        { label: "Contenu", value: 12000 }
      ]
    }
  ]}
  showLabels
/>`,
      react: `import { TreemapChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <TreemapChart
      label="Répartition du budget par département"
      data={[
        {
          label: "Ingénierie", tone: "category1",
          children: [
            { label: "Frontend", value: 42000 },
            { label: "Backend", value: 58000 },
            { label: "Infra", value: 31000 }
          ]
        },
        {
          label: "Produit", tone: "category2",
          children: [
            { label: "Design", value: 27000 },
            { label: "PM", value: 22000 }
          ]
        },
        {
          label: "Marketing", tone: "category3",
          children: [
            { label: "Growth", value: 18000 },
            { label: "Contenu", value: 12000 }
          ]
        }
      ]}
      showLabels
    />
  );
}`,
      vue: `<script setup>
import { TreemapChart } from "@sentropic/design-system-vue";
</script>

<template>
  <TreemapChart
    label="Répartition du budget par département"
    :data="[
      {
        label: 'Ingénierie', tone: 'category1',
        children: [
          { label: 'Frontend', value: 42000 },
          { label: 'Backend', value: 58000 },
          { label: 'Infra', value: 31000 }
        ]
      },
      {
        label: 'Produit', tone: 'category2',
        children: [
          { label: 'Design', value: 27000 },
          { label: 'PM', value: 22000 }
        ]
      },
      {
        label: 'Marketing', tone: 'category3',
        children: [
          { label: 'Growth', value: 18000 },
          { label: 'Contenu', value: 12000 }
        ]
      }
    ]"
    :showLabels="true"
  />
</template>`
    }
  },

  bulletchart: {
    id: "bulletchart",
    slug: "bullet-chart",
    nodes: [
      stack([
        {
          comp: "BulletChart",
          props: {
            label: "Objectifs trimestriels",
            data: [
              { label: "Revenu", value: 82, target: 100, ranges: [50, 80, 110] },
              { label: "NPS", value: 67, target: 75, ranges: [40, 65, 90] },
              { label: "Uptime", value: 99.2, target: 99.5, ranges: [95, 99, 100] }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { BulletChart } from "@sentropic/design-system-svelte";
</script>

<BulletChart
  label="Objectifs trimestriels"
  data={[
    { label: "Revenu", value: 82, target: 100, ranges: [50, 80, 110] },
    { label: "NPS", value: 67, target: 75, ranges: [40, 65, 90] },
    { label: "Uptime", value: 99.2, target: 99.5, ranges: [95, 99, 100] }
  ]}
/>`,
      react: `import { BulletChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <BulletChart
      label="Objectifs trimestriels"
      data={[
        { label: "Revenu", value: 82, target: 100, ranges: [50, 80, 110] },
        { label: "NPS", value: 67, target: 75, ranges: [40, 65, 90] },
        { label: "Uptime", value: 99.2, target: 99.5, ranges: [95, 99, 100] }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { BulletChart } from "@sentropic/design-system-vue";
</script>

<template>
  <BulletChart
    label="Objectifs trimestriels"
    :data="[
      { label: 'Revenu', value: 82, target: 100, ranges: [50, 80, 110] },
      { label: 'NPS', value: 67, target: 75, ranges: [40, 65, 90] },
      { label: 'Uptime', value: 99.2, target: 99.5, ranges: [95, 99, 100] }
    ]"
  />
</template>`
    }
  },

  marimekkoChart: {
    id: "marimekkoChart",
    slug: "marimekko-chart",
    nodes: [
      stack([
        {
          comp: "MarimekkoChart",
          props: {
            label: "Parts de marché par segment",
            data: [
              {
                label: "Europe",
                width: 45,
                segments: [
                  { label: "PME", value: 55, tone: "category1" },
                  { label: "Grands comptes", value: 30, tone: "category2" },
                  { label: "Startups", value: 15, tone: "category3" }
                ]
              },
              {
                label: "Amérique",
                width: 35,
                segments: [
                  { label: "PME", value: 40, tone: "category1" },
                  { label: "Grands comptes", value: 50, tone: "category2" },
                  { label: "Startups", value: 10, tone: "category3" }
                ]
              },
              {
                label: "Asie",
                width: 20,
                segments: [
                  { label: "PME", value: 30, tone: "category1" },
                  { label: "Grands comptes", value: 20, tone: "category2" },
                  { label: "Startups", value: 50, tone: "category3" }
                ]
              }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { MarimekkoChart } from "@sentropic/design-system-svelte";
</script>

<MarimekkoChart
  label="Parts de marché par segment"
  data={[
    {
      label: "Europe", width: 45,
      segments: [
        { label: "PME", value: 55, tone: "category1" },
        { label: "Grands comptes", value: 30, tone: "category2" },
        { label: "Startups", value: 15, tone: "category3" }
      ]
    },
    {
      label: "Amérique", width: 35,
      segments: [
        { label: "PME", value: 40, tone: "category1" },
        { label: "Grands comptes", value: 50, tone: "category2" },
        { label: "Startups", value: 10, tone: "category3" }
      ]
    }
  ]}
/>`,
      react: `import { MarimekkoChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <MarimekkoChart
      label="Parts de marché par segment"
      data={[
        {
          label: "Europe", width: 45,
          segments: [
            { label: "PME", value: 55, tone: "category1" },
            { label: "Grands comptes", value: 30, tone: "category2" },
            { label: "Startups", value: 15, tone: "category3" }
          ]
        },
        {
          label: "Amérique", width: 35,
          segments: [
            { label: "PME", value: 40, tone: "category1" },
            { label: "Grands comptes", value: 50, tone: "category2" },
            { label: "Startups", value: 10, tone: "category3" }
          ]
        }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { MarimekkoChart } from "@sentropic/design-system-vue";
</script>

<template>
  <MarimekkoChart
    label="Parts de marché par segment"
    :data="[
      {
        label: 'Europe', width: 45,
        segments: [
          { label: 'PME', value: 55, tone: 'category1' },
          { label: 'Grands comptes', value: 30, tone: 'category2' },
          { label: 'Startups', value: 15, tone: 'category3' }
        ]
      },
      {
        label: 'Amérique', width: 35,
        segments: [
          { label: 'PME', value: 40, tone: 'category1' },
          { label: 'Grands comptes', value: 50, tone: 'category2' },
          { label: 'Startups', value: 10, tone: 'category3' }
        ]
      }
    ]"
  />
</template>`
    }
  },

  parallelcoordinateschart: {
    id: "parallelcoordinateschart",
    slug: "parallel-coordinates-chart",
    nodes: [
      stack([
        {
          comp: "ParallelCoordinatesChart",
          props: {
            label: "Comparaison de véhicules",
            axes: [
              { key: "puissance", label: "Puissance (ch)" },
              { key: "poids", label: "Poids (kg)" },
              { key: "conso", label: "Conso (L/100km)" },
              { key: "prix", label: "Prix (k€)" }
            ],
            data: [
              { puissance: 130, poids: 1200, conso: 6.5, prix: 22 },
              { puissance: 190, poids: 1580, conso: 8.2, prix: 38 },
              { puissance: 90, poids: 980, conso: 4.8, prix: 15 }
            ],
            tones: ["category1", "category3", "category5"]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { ParallelCoordinatesChart } from "@sentropic/design-system-svelte";
</script>

<ParallelCoordinatesChart
  label="Comparaison de véhicules"
  axes={[
    { key: "puissance", label: "Puissance (ch)" },
    { key: "poids", label: "Poids (kg)" },
    { key: "conso", label: "Conso (L/100km)" },
    { key: "prix", label: "Prix (k€)" }
  ]}
  data={[
    { puissance: 130, poids: 1200, conso: 6.5, prix: 22 },
    { puissance: 190, poids: 1580, conso: 8.2, prix: 38 },
    { puissance: 90, poids: 980, conso: 4.8, prix: 15 }
  ]}
  tones={["category1", "category3", "category5"]}
/>`,
      react: `import { ParallelCoordinatesChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ParallelCoordinatesChart
      label="Comparaison de véhicules"
      axes={[
        { key: "puissance", label: "Puissance (ch)" },
        { key: "poids", label: "Poids (kg)" },
        { key: "conso", label: "Conso (L/100km)" },
        { key: "prix", label: "Prix (k€)" }
      ]}
      data={[
        { puissance: 130, poids: 1200, conso: 6.5, prix: 22 },
        { puissance: 190, poids: 1580, conso: 8.2, prix: 38 },
        { puissance: 90, poids: 980, conso: 4.8, prix: 15 }
      ]}
      tones={["category1", "category3", "category5"]}
    />
  );
}`,
      vue: `<script setup>
import { ParallelCoordinatesChart } from "@sentropic/design-system-vue";
</script>

<template>
  <ParallelCoordinatesChart
    label="Comparaison de véhicules"
    :axes="[
      { key: 'puissance', label: 'Puissance (ch)' },
      { key: 'poids', label: 'Poids (kg)' },
      { key: 'conso', label: 'Conso (L/100km)' },
      { key: 'prix', label: 'Prix (k€)' }
    ]"
    :data="[
      { puissance: 130, poids: 1200, conso: 6.5, prix: 22 },
      { puissance: 190, poids: 1580, conso: 8.2, prix: 38 },
      { puissance: 90, poids: 980, conso: 4.8, prix: 15 }
    ]"
    :tones="['category1', 'category3', 'category5']"
  />
</template>`
    }
  },

  candlestickchart: {
    id: "candlestickchart",
    slug: "candlestick-chart",
    nodes: [
      stack([
        {
          comp: "CandlestickChart",
          props: {
            label: "Cours SENT — semaine",
            data: [
              { label: "Lun", open: 142, high: 148, low: 139, close: 146 },
              { label: "Mar", open: 146, high: 151, low: 144, close: 149 },
              { label: "Mer", open: 149, high: 152, low: 140, close: 143 },
              { label: "Jeu", open: 143, high: 147, low: 138, close: 145 },
              { label: "Ven", open: 145, high: 155, low: 144, close: 153 }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { CandlestickChart } from "@sentropic/design-system-svelte";
</script>

<CandlestickChart
  label="Cours SENT — semaine"
  data={[
    { label: "Lun", open: 142, high: 148, low: 139, close: 146 },
    { label: "Mar", open: 146, high: 151, low: 144, close: 149 },
    { label: "Mer", open: 149, high: 152, low: 140, close: 143 },
    { label: "Jeu", open: 143, high: 147, low: 138, close: 145 },
    { label: "Ven", open: 145, high: 155, low: 144, close: 153 }
  ]}
/>`,
      react: `import { CandlestickChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <CandlestickChart
      label="Cours SENT — semaine"
      data={[
        { label: "Lun", open: 142, high: 148, low: 139, close: 146 },
        { label: "Mar", open: 146, high: 151, low: 144, close: 149 },
        { label: "Mer", open: 149, high: 152, low: 140, close: 143 },
        { label: "Jeu", open: 143, high: 147, low: 138, close: 145 },
        { label: "Ven", open: 145, high: 155, low: 144, close: 153 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { CandlestickChart } from "@sentropic/design-system-vue";
</script>

<template>
  <CandlestickChart
    label="Cours SENT — semaine"
    :data="[
      { label: 'Lun', open: 142, high: 148, low: 139, close: 146 },
      { label: 'Mar', open: 146, high: 151, low: 144, close: 149 },
      { label: 'Mer', open: 149, high: 152, low: 140, close: 143 },
      { label: 'Jeu', open: 143, high: 147, low: 138, close: 145 },
      { label: 'Ven', open: 145, high: 155, low: 144, close: 153 }
    ]"
  />
</template>`
    }
  },

  calendarheatmapchart: {
    id: "calendarheatmapchart",
    slug: "calendar-heatmap-chart",
    nodes: [
      stack([
        {
          comp: "CalendarHeatmapChart",
          props: {
            label: "Activité de contribution",
            data: [
              { date: "2025-01-06", value: 3 },
              { date: "2025-01-07", value: 8 },
              { date: "2025-01-08", value: 5 },
              { date: "2025-01-09", value: 12 },
              { date: "2025-01-10", value: 2 },
              { date: "2025-01-13", value: 7 },
              { date: "2025-01-14", value: 15 },
              { date: "2025-01-15", value: 9 },
              { date: "2025-01-16", value: 4 },
              { date: "2025-01-17", value: 11 }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { CalendarHeatmapChart } from "@sentropic/design-system-svelte";
</script>

<CalendarHeatmapChart
  label="Activité de contribution"
  data={[
    { date: "2025-01-06", value: 3 },
    { date: "2025-01-07", value: 8 },
    { date: "2025-01-08", value: 5 },
    { date: "2025-01-09", value: 12 },
    { date: "2025-01-10", value: 2 },
    { date: "2025-01-13", value: 7 },
    { date: "2025-01-14", value: 15 },
    { date: "2025-01-15", value: 9 },
    { date: "2025-01-16", value: 4 },
    { date: "2025-01-17", value: 11 }
  ]}
/>`,
      react: `import { CalendarHeatmapChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <CalendarHeatmapChart
      label="Activité de contribution"
      data={[
        { date: "2025-01-06", value: 3 },
        { date: "2025-01-07", value: 8 },
        { date: "2025-01-08", value: 5 },
        { date: "2025-01-09", value: 12 },
        { date: "2025-01-10", value: 2 },
        { date: "2025-01-13", value: 7 },
        { date: "2025-01-14", value: 15 },
        { date: "2025-01-15", value: 9 },
        { date: "2025-01-16", value: 4 },
        { date: "2025-01-17", value: 11 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { CalendarHeatmapChart } from "@sentropic/design-system-vue";
</script>

<template>
  <CalendarHeatmapChart
    label="Activité de contribution"
    :data="[
      { date: '2025-01-06', value: 3 },
      { date: '2025-01-07', value: 8 },
      { date: '2025-01-08', value: 5 },
      { date: '2025-01-09', value: 12 },
      { date: '2025-01-10', value: 2 },
      { date: '2025-01-13', value: 7 },
      { date: '2025-01-14', value: 15 },
      { date: '2025-01-15', value: 9 },
      { date: '2025-01-16', value: 4 },
      { date: '2025-01-17', value: 11 }
    ]"
  />
</template>`
    }
  },

  filterpill: {
    id: "filterpill",
    slug: "filter-pill",
    nodes: [
      wrap([
        {
          comp: "FilterPill",
          props: { field: "Pays", operator: "in", value: "France, Italie, Espagne", active: true, removable: true }
        },
        {
          comp: "FilterPill",
          props: { field: "Statut", value: "Actif", active: false, removable: true }
        },
        {
          comp: "FilterPill",
          props: { field: "Montant", operator: ">", value: "1 000 €", active: true, removable: false, tone: "success" }
        },
        {
          comp: "FilterPill",
          props: { field: "Région", value: "Nord", active: true, removable: true, disabled: true }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { FilterPill } from "@sentropic/design-system-svelte";
</script>

<FilterPill field="Pays" operator="in" value="France, Italie, Espagne" active removable />
<FilterPill field="Statut" value="Actif" removable />
<FilterPill field="Montant" operator=">" value="1 000 €" active tone="success" />
<FilterPill field="Région" value="Nord" active removable disabled />`,
      react: `import { FilterPill } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <FilterPill field="Pays" operator="in" value="France, Italie, Espagne" active removable />
      <FilterPill field="Statut" value="Actif" removable />
      <FilterPill field="Montant" operator=">" value="1 000 €" active tone="success" />
      <FilterPill field="Région" value="Nord" active removable disabled />
    </>
  );
}`,
      vue: `<script setup>
import { FilterPill } from "@sentropic/design-system-vue";
</script>

<template>
  <FilterPill field="Pays" operator="in" value="France, Italie, Espagne" :active="true" :removable="true" />
  <FilterPill field="Statut" value="Actif" :removable="true" />
  <FilterPill field="Montant" operator=">" value="1 000 €" :active="true" tone="success" />
  <FilterPill field="Région" value="Nord" :active="true" :removable="true" disabled />
</template>`
    }
  },

  filterbar: {
    id: "filterbar",
    slug: "filter-bar",
    nodes: [
      {
        el: "div",
        props: { class: "fp-stack" },
        children: [
          {
            comp: "FilterBar",
            props: { label: "Filtres actifs" },
            children: [
              {
                comp: "FilterPill",
                props: { field: "Pays", operator: "in", value: "France, Italie", active: true, removable: true }
              },
              {
                comp: "FilterPill",
                props: { field: "Statut", value: "Actif", active: true, removable: true }
              },
              {
                comp: "FilterPill",
                props: { field: "Date", operator: ">=", value: "2025-01-01", active: true, removable: true }
              }
            ]
          }
        ]
      }
    ],
    code: {
      svelte: `<script>
  import { FilterBar, FilterPill } from "@sentropic/design-system-svelte";
</script>

<FilterBar label="Filtres actifs" onClearAll={() => {}}>
  <FilterPill field="Pays" operator="in" value="France, Italie" active removable />
  <FilterPill field="Statut" value="Actif" active removable />
  <FilterPill field="Date" operator=">=" value="2025-01-01" active removable />
</FilterBar>`,
      react: `import { FilterBar, FilterPill } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <FilterBar label="Filtres actifs" onClearAll={() => {}}>
      <FilterPill field="Pays" operator="in" value="France, Italie" active removable />
      <FilterPill field="Statut" value="Actif" active removable />
      <FilterPill field="Date" operator=">=" value="2025-01-01" active removable />
    </FilterBar>
  );
}`,
      vue: `<script setup>
import { FilterBar, FilterPill } from "@sentropic/design-system-vue";
</script>

<template>
  <FilterBar label="Filtres actifs" :onClearAll="() => {}">
    <FilterPill field="Pays" operator="in" value="France, Italie" :active="true" :removable="true" />
    <FilterPill field="Statut" value="Actif" :active="true" :removable="true" />
    <FilterPill field="Date" operator=">=" value="2025-01-01" :active="true" :removable="true" />
  </FilterBar>
</template>`
    }
  },

  selectionchip: {
    id: "selectionchip",
    slug: "selection-chip",
    nodes: [
      wrap([
        {
          comp: "SelectionChip",
          props: { label: "Sélection", count: 42 }
        },
        {
          comp: "SelectionChip",
          props: { label: "Catégorie", count: 5, tone: "success" }
        },
        {
          comp: "SelectionChip",
          props: { label: "Région", count: 3, tone: "info" }
        },
        {
          comp: "SelectionChip",
          props: { label: "Archivés", tone: "error" }
        },
        {
          comp: "SelectionChip",
          props: { label: "Verrouillé", count: 7, disabled: true }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { SelectionChip } from "@sentropic/design-system-svelte";
</script>

<SelectionChip label="Sélection" count={42} />
<SelectionChip label="Catégorie" count={5} tone="success" />
<SelectionChip label="Région" count={3} tone="info" />
<SelectionChip label="Archivés" tone="error" />
<SelectionChip label="Verrouillé" count={7} disabled />`,
      react: `import { SelectionChip } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <>
      <SelectionChip label="Sélection" count={42} />
      <SelectionChip label="Catégorie" count={5} tone="success" />
      <SelectionChip label="Région" count={3} tone="info" />
      <SelectionChip label="Archivés" tone="error" />
      <SelectionChip label="Verrouillé" count={7} disabled />
    </>
  );
}`,
      vue: `<script setup>
import { SelectionChip } from "@sentropic/design-system-vue";
</script>

<template>
  <SelectionChip label="Sélection" :count="42" />
  <SelectionChip label="Catégorie" :count="5" tone="success" />
  <SelectionChip label="Région" :count="3" tone="info" />
  <SelectionChip label="Archivés" tone="error" />
  <SelectionChip label="Verrouillé" :count="7" disabled />
</template>`
    }
  },

  bumpchart: {
    id: "bumpchart",
    slug: "bump-chart",
    nodes: [
      stack([
        {
          comp: "BumpChart",
          props: {
            label: "Classement des frameworks JS",
            categories: ["2022", "2023", "2024", "2025"],
            data: [
              { label: "React", ranks: [1, 1, 1, 1], tone: "category1" },
              { label: "Vue", ranks: [3, 2, 2, 2], tone: "category2" },
              { label: "Svelte", ranks: [5, 4, 3, 3], tone: "category3" },
              { label: "Angular", ranks: [2, 3, 4, 4], tone: "category4" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { BumpChart } from "@sentropic/design-system-svelte";
</script>

<BumpChart
  label="Classement des frameworks JS"
  categories={["2022", "2023", "2024", "2025"]}
  data={[
    { label: "React", ranks: [1, 1, 1, 1], tone: "category1" },
    { label: "Vue", ranks: [3, 2, 2, 2], tone: "category2" },
    { label: "Svelte", ranks: [5, 4, 3, 3], tone: "category3" },
    { label: "Angular", ranks: [2, 3, 4, 4], tone: "category4" }
  ]}
/>`,
      react: `import { BumpChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <BumpChart
      label="Classement des frameworks JS"
      categories={["2022", "2023", "2024", "2025"]}
      data={[
        { label: "React", ranks: [1, 1, 1, 1], tone: "category1" },
        { label: "Vue", ranks: [3, 2, 2, 2], tone: "category2" },
        { label: "Svelte", ranks: [5, 4, 3, 3], tone: "category3" },
        { label: "Angular", ranks: [2, 3, 4, 4], tone: "category4" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { BumpChart } from "@sentropic/design-system-vue";
</script>

<template>
  <BumpChart
    label="Classement des frameworks JS"
    :categories="['2022', '2023', '2024', '2025']"
    :data="[
      { label: 'React', ranks: [1, 1, 1, 1], tone: 'category1' },
      { label: 'Vue', ranks: [3, 2, 2, 2], tone: 'category2' },
      { label: 'Svelte', ranks: [5, 4, 3, 3], tone: 'category3' },
      { label: 'Angular', ranks: [2, 3, 4, 4], tone: 'category4' }
    ]"
  />
</template>`
    }
  },

  lollipopchart: {
    id: "lollipopchart",
    slug: "lollipop-chart",
    nodes: [
      stack([
        {
          comp: "LollipopChart",
          props: {
            label: "Score par équipe",
            orientation: "vertical",
            data: [
              { label: "Design", value: 82, tone: "category1" },
              { label: "Ingénierie", value: 74, tone: "category2" },
              { label: "Produit", value: 61, tone: "category3" },
              { label: "Ventes", value: 48, tone: "category4" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { LollipopChart } from "@sentropic/design-system-svelte";
</script>

<LollipopChart
  label="Score par équipe"
  orientation="vertical"
  data={[
    { label: "Design", value: 82, tone: "category1" },
    { label: "Ingénierie", value: 74, tone: "category2" },
    { label: "Produit", value: 61, tone: "category3" },
    { label: "Ventes", value: 48, tone: "category4" }
  ]}
/>`,
      react: `import { LollipopChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <LollipopChart
      label="Score par équipe"
      orientation="vertical"
      data={[
        { label: "Design", value: 82, tone: "category1" },
        { label: "Ingénierie", value: 74, tone: "category2" },
        { label: "Produit", value: 61, tone: "category3" },
        { label: "Ventes", value: 48, tone: "category4" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { LollipopChart } from "@sentropic/design-system-vue";
</script>

<template>
  <LollipopChart
    label="Score par équipe"
    orientation="vertical"
    :data="[
      { label: 'Design', value: 82, tone: 'category1' },
      { label: 'Ingénierie', value: 74, tone: 'category2' },
      { label: 'Produit', value: 61, tone: 'category3' },
      { label: 'Ventes', value: 48, tone: 'category4' }
    ]"
  />
</template>`
    }
  },

  columnrangechart: {
    id: "columnrangechart",
    slug: "column-range-chart",
    nodes: [
      stack([
        {
          comp: "ColumnRangeChart",
          props: {
            label: "Températures min/max par mois",
            orientation: "vertical",
            data: [
              { category: "Jan", low: -4, high: 3, tone: "category1" },
              { category: "Avr", low: 5, high: 16, tone: "category2" },
              { category: "Juil", low: 15, high: 28, tone: "category3" },
              { category: "Oct", low: 7, high: 18, tone: "category4" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { ColumnRangeChart } from "@sentropic/design-system-svelte";
</script>

<ColumnRangeChart
  label="Températures min/max par mois"
  orientation="vertical"
  data={[
    { category: "Jan", low: -4, high: 3, tone: "category1" },
    { category: "Avr", low: 5, high: 16, tone: "category2" },
    { category: "Juil", low: 15, high: 28, tone: "category3" },
    { category: "Oct", low: 7, high: 18, tone: "category4" }
  ]}
/>`,
      react: `import { ColumnRangeChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ColumnRangeChart
      label="Températures min/max par mois"
      orientation="vertical"
      data={[
        { category: "Jan", low: -4, high: 3, tone: "category1" },
        { category: "Avr", low: 5, high: 16, tone: "category2" },
        { category: "Juil", low: 15, high: 28, tone: "category3" },
        { category: "Oct", low: 7, high: 18, tone: "category4" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { ColumnRangeChart } from "@sentropic/design-system-vue";
</script>

<template>
  <ColumnRangeChart
    label="Températures min/max par mois"
    orientation="vertical"
    :data="[
      { category: 'Jan', low: -4, high: 3, tone: 'category1' },
      { category: 'Avr', low: 5, high: 16, tone: 'category2' },
      { category: 'Juil', low: 15, high: 28, tone: 'category3' },
      { category: 'Oct', low: 7, high: 18, tone: 'category4' }
    ]"
  />
</template>`
    }
  },

  paretochart: {
    id: "paretochart",
    slug: "pareto-chart",
    nodes: [
      stack([
        {
          comp: "ParetoChart",
          props: {
            label: "Causes d'incidents",
            data: [
              { label: "Réseau", value: 45, tone: "category1" },
              { label: "Déploiement", value: 30, tone: "category2" },
              { label: "Base de données", value: 15, tone: "category3" },
              { label: "Tiers", value: 7, tone: "category4" },
              { label: "Autre", value: 3, tone: "category5" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { ParetoChart } from "@sentropic/design-system-svelte";
</script>

<ParetoChart
  label="Causes d'incidents"
  data={[
    { label: "Réseau", value: 45, tone: "category1" },
    { label: "Déploiement", value: 30, tone: "category2" },
    { label: "Base de données", value: 15, tone: "category3" },
    { label: "Tiers", value: 7, tone: "category4" },
    { label: "Autre", value: 3, tone: "category5" }
  ]}
/>`,
      react: `import { ParetoChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ParetoChart
      label="Causes d'incidents"
      data={[
        { label: "Réseau", value: 45, tone: "category1" },
        { label: "Déploiement", value: 30, tone: "category2" },
        { label: "Base de données", value: 15, tone: "category3" },
        { label: "Tiers", value: 7, tone: "category4" },
        { label: "Autre", value: 3, tone: "category5" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { ParetoChart } from "@sentropic/design-system-vue";
</script>

<template>
  <ParetoChart
    label="Causes d'incidents"
    :data="[
      { label: 'Réseau', value: 45, tone: 'category1' },
      { label: 'Déploiement', value: 30, tone: 'category2' },
      { label: 'Base de données', value: 15, tone: 'category3' },
      { label: 'Tiers', value: 7, tone: 'category4' },
      { label: 'Autre', value: 3, tone: 'category5' }
    ]"
  />
</template>`
    }
  },

  chorddiagram: {
    id: "chorddiagram",
    slug: "chord-diagram",
    nodes: [
      stack([
        {
          comp: "ChordDiagram",
          props: {
            label: "Échanges entre régions",
            data: [
              { from: "Europe", to: "Asie", value: 24 },
              { from: "Asie", to: "Amérique", value: 18 },
              { from: "Amérique", to: "Europe", value: 12 },
              { from: "Europe", to: "Amérique", value: 9 }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { ChordDiagram } from "@sentropic/design-system-svelte";
</script>

<ChordDiagram
  label="Échanges entre régions"
  data={[
    { from: "Europe", to: "Asie", value: 24 },
    { from: "Asie", to: "Amérique", value: 18 },
    { from: "Amérique", to: "Europe", value: 12 },
    { from: "Europe", to: "Amérique", value: 9 }
  ]}
/>`,
      react: `import { ChordDiagram } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <ChordDiagram
      label="Échanges entre régions"
      data={[
        { from: "Europe", to: "Asie", value: 24 },
        { from: "Asie", to: "Amérique", value: 18 },
        { from: "Amérique", to: "Europe", value: 12 },
        { from: "Europe", to: "Amérique", value: 9 }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { ChordDiagram } from "@sentropic/design-system-vue";
</script>

<template>
  <ChordDiagram
    label="Échanges entre régions"
    :data="[
      { from: 'Europe', to: 'Asie', value: 24 },
      { from: 'Asie', to: 'Amérique', value: 18 },
      { from: 'Amérique', to: 'Europe', value: 12 },
      { from: 'Europe', to: 'Amérique', value: 9 }
    ]"
  />
</template>`
    }
  },

  packedbubbleschart: {
    id: "packedbubbleschart",
    slug: "packed-bubbles-chart",
    nodes: [
      stack([
        {
          comp: "PackedBubblesChart",
          props: {
            label: "Langages par usage",
            data: [
              { label: "TypeScript", value: 120, tone: "category1" },
              { label: "Python", value: 80, tone: "category2" },
              { label: "Rust", value: 45, tone: "category3" },
              { label: "Go", value: 30, tone: "category4" },
              { label: "Elixir", value: 14, tone: "category5" }
            ]
          }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { PackedBubblesChart } from "@sentropic/design-system-svelte";
</script>

<PackedBubblesChart
  label="Langages par usage"
  data={[
    { label: "TypeScript", value: 120, tone: "category1" },
    { label: "Python", value: 80, tone: "category2" },
    { label: "Rust", value: 45, tone: "category3" },
    { label: "Go", value: 30, tone: "category4" },
    { label: "Elixir", value: 14, tone: "category5" }
  ]}
/>`,
      react: `import { PackedBubblesChart } from "@sentropic/design-system-react";

export function Demo() {
  return (
    <PackedBubblesChart
      label="Langages par usage"
      data={[
        { label: "TypeScript", value: 120, tone: "category1" },
        { label: "Python", value: 80, tone: "category2" },
        { label: "Rust", value: 45, tone: "category3" },
        { label: "Go", value: 30, tone: "category4" },
        { label: "Elixir", value: 14, tone: "category5" }
      ]}
    />
  );
}`,
      vue: `<script setup>
import { PackedBubblesChart } from "@sentropic/design-system-vue";
</script>

<template>
  <PackedBubblesChart
    label="Langages par usage"
    :data="[
      { label: 'TypeScript', value: 120, tone: 'category1' },
      { label: 'Python', value: 80, tone: 'category2' },
      { label: 'Rust', value: 45, tone: 'category3' },
      { label: 'Go', value: 30, tone: 'category4' },
      { label: 'Elixir', value: 14, tone: 'category5' }
    ]"
  />
</template>`
    }
  },

  rangeslider: {
    id: "rangeslider",
    slug: "range-slider",
    nodes: [
      wrap([
        {
          comp: "RangeSlider",
          props: { label: "Plage de prix (€)", defaultValue: [20, 80], min: 0, max: 100 }
        },
        {
          comp: "RangeSlider",
          props: { label: "Latence (ms)", defaultValue: [100, 400], min: 0, max: 1000, step: 50 }
        }
      ])
    ],
    code: {
      svelte: `<script>
  import { RangeSlider } from "@sentropic/design-system-svelte";
  let range = $state([20, 80]);
</script>

<RangeSlider label="Plage de prix (€)" bind:value={range} min={0} max={100} />`,
      react: `import { useState } from "react";
import { RangeSlider } from "@sentropic/design-system-react";

export function Demo() {
  const [range, setRange] = useState<[number, number]>([20, 80]);
  return (
    <RangeSlider label="Plage de prix (€)" value={range} onChange={setRange} min={0} max={100} />
  );
}`,
      vue: `<script setup>
import { ref } from "vue";
import { RangeSlider } from "@sentropic/design-system-vue";
const range = ref([20, 80]);
</script>

<template>
  <RangeSlider label="Plage de prix (€)" v-model="range" :min="0" :max="100" />
</template>`
    }
  }
};

export function getExample(id: string): FrameworkExample | undefined {
  return EXAMPLES[id];
}
