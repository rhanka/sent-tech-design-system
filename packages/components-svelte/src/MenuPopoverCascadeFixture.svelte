<script lang="ts">
  import Menu from "./lib/Menu.svelte";
  import MenuPopover from "./lib/MenuPopover.svelte";
  import type { MenuItem, MenuSelectDetail, MenuSubmenuSide } from "./lib/Menu.svelte";

  type FixtureProps = {
    open?: boolean;
    trigger?: HTMLElement | null;
    label?: string;
    popoverLabel?: string;
    items?: MenuItem[];
    submenuSide?: MenuSubmenuSide;
    dismissOnSelect?: boolean;
    onselect?: (value: string, detail?: MenuSelectDetail) => void;
  };

  let {
    open = $bindable(false),
    trigger = null,
    label = "Actions",
    popoverLabel = "Options",
    items = [],
    submenuSide = "auto",
    dismissOnSelect = false,
    onselect
  }: FixtureProps = $props();
</script>

<MenuPopover bind:open {trigger} label={popoverLabel}>
  <Menu {label} {items} {submenuSide} {dismissOnSelect} {onselect} />
</MenuPopover>
