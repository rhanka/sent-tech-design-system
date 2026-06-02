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
  | "Slider";

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
  }
};

export function getExample(id: string): FrameworkExample | undefined {
  return EXAMPLES[id];
}
