<script lang="ts">
  // Test-only fixture: a SelectableList wrapping real SelectableRow children so
  // the context wiring (roving tabindex, selection, navigation) can be exercised
  // end-to-end. Not exported from the package.
  import SelectableList from "./lib/SelectableList.svelte";
  import SelectableRow from "./lib/SelectableRow.svelte";

  type Item = { value: string; label: string; disabled?: boolean };

  let {
    items,
    multiple = false,
    value,
    onchange,
    label = "Fixture list"
  }: {
    items: Item[];
    multiple?: boolean;
    value?: string | string[] | null;
    onchange?: (v: string | string[] | null) => void;
    label?: string;
  } = $props();
</script>

<SelectableList {label} {multiple} {value} {onchange}>
  {#each items as item (item.value)}
    <SelectableRow value={item.value} disabled={item.disabled}>
      {item.label}
    </SelectableRow>
  {/each}
</SelectableList>
