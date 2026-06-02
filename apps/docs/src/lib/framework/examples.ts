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
  | "Tag";

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
  }
};

export function getExample(id: string): FrameworkExample | undefined {
  return EXAMPLES[id];
}
