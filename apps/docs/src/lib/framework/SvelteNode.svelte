<!--
  Rendu récursif d'un NodeSpec avec les composants Svelte du design system.
  Pendant Svelte de react-island / vue-island : même arbre déclaratif, rendu
  inline (pas d'island, donc aucun coût runtime supplémentaire côté Svelte).

  - chaîne   → texte brut
  - { comp } → composant DS (Button, Input, …), enfants passés en children snippet
  - { el }   → élément HTML neutre (wrapper), enfants récursifs
-->
<script lang="ts">
  import {
    Button,
    Input,
    Card,
    Badge,
    Checkbox,
    Radio,
    Alert,
    Tag,
    Select,
    Textarea,
    Toggle,
    Switch,
    Link,
    Breadcrumb,
    Tooltip,
    ProgressBar,
    Pagination,
    IconButton,
    NumberInput,
    Search,
    Tabs,
    Accordion,
    Slider,
    Quote,
    Highlight,
    EmptyState,
    Tile,
    ContentSwitcher,
    SkeletonText,
    ProgressIndicator,
    InlineLoading,
    LoadingState,
    CodeSnippet,
    CopyButton,
    OrderedList,
    UnorderedList,
    StructuredList,
    SkipLink,
    Header,
    SideNav,
    Form,
    FormGroup,
    FileUploader,
    LanguageSelector,
    Table,
    DataTable,
    TreeView,
    Combobox,
    MultiSelect,
    DatePicker,
    Toast,
    Dropdown,
    Footer
  } from "@sentropic/design-system-svelte";
  import Self from "./SvelteNode.svelte";
  import type { Component } from "svelte";
  import type { ComponentName, NodeSpec } from "./examples";
  import { isComponentNode, isElementNode } from "./examples";

  // Table de composants indexée par nom. Le rendu est dynamique : on type chaque
  // entrée en composant à props arbitraires (les props proviennent du registre
  // d'exemples, validé à l'écriture) pour éviter une intersection impossible des
  // signatures des huit composants.
  const COMPONENTS: Record<ComponentName, Component<Record<string, unknown>>> = {
    Button,
    Input,
    Card,
    Badge,
    Checkbox,
    Radio,
    Alert,
    Tag,
    Select,
    Textarea,
    Toggle,
    Switch,
    Link,
    Breadcrumb,
    Tooltip,
    ProgressBar,
    Pagination,
    IconButton,
    NumberInput,
    Search,
    Tabs,
    Accordion,
    Slider,
    Quote,
    Highlight,
    EmptyState,
    Tile,
    ContentSwitcher,
    SkeletonText,
    ProgressIndicator,
    InlineLoading,
    LoadingState,
    CodeSnippet,
    CopyButton,
    OrderedList,
    UnorderedList,
    StructuredList,
    SkipLink,
    Header,
    SideNav,
    Form,
    FormGroup,
    FileUploader,
    LanguageSelector,
    Table,
    DataTable,
    TreeView,
    Combobox,
    MultiSelect,
    DatePicker,
    Toast,
    Dropdown,
    Footer
  } as unknown as Record<ComponentName, Component<Record<string, unknown>>>;

  let { node }: { node: NodeSpec } = $props();
</script>

{#if typeof node === "string"}
  {node}
{:else if isComponentNode(node)}
  {@const Comp = COMPONENTS[node.comp]}
  {#if node.children && node.children.length}
    <Comp {...node.props}>
      {#each node.children as child, i (i)}
        <Self node={child} />
      {/each}
    </Comp>
  {:else}
    <Comp {...node.props} />
  {/if}
{:else if isElementNode(node)}
  <svelte:element this={node.el} {...node.props}>
    {#each node.children ?? [] as child, i (i)}
      <Self node={child} />
    {/each}
  </svelte:element>
{/if}
