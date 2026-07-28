<script lang="ts">
  // Test-only fixture: a PanelStack wrapping real PanelSection children so the
  // context wiring (shape, expansion, scroll ownership) can be exercised
  // end-to-end. Not exported from the package.
  import PanelStack, { type PanelStackShape } from "./PanelStack.svelte";
  import PanelSection from "./PanelSection.svelte";

  type Section = { id: string; label: string; content?: string; action?: string; class?: string };

  let {
    shape = "sticky-item",
    label = "Fixture stack",
    expanded,
    defaultExpanded = null,
    onExpandedChange,
    primary,
    primaryMinHeight,
    sections,
    class: className
  }: {
    shape?: PanelStackShape;
    label?: string;
    expanded?: string | null;
    defaultExpanded?: string | null;
    onExpandedChange?: (id: string | null) => void;
    primary?: string;
    primaryMinHeight?: number;
    sections: Section[];
    class?: string;
  } = $props();
</script>

<PanelStack
  {shape}
  {label}
  {expanded}
  {defaultExpanded}
  {onExpandedChange}
  {primary}
  {primaryMinHeight}
  class={className}
>
  {#each sections as section (section.id)}
    <PanelSection id={section.id} label={section.label} class={section.class}>
      {#snippet actions()}
        {#if section.action}
          <button type="button" data-testid={`action-${section.id}`}>{section.action}</button>
        {/if}
      {/snippet}
      <p data-testid={`content-${section.id}`}>{section.content ?? section.label}</p>
    </PanelSection>
  {/each}
</PanelStack>
