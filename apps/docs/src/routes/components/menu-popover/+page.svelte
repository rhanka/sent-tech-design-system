<script lang="ts">
  import {
    Badge,
    Menu,
    MenuPopover,
    MenuTriggerButton
  } from "@sentropic/design-system-svelte";
  import { Archive, Copy, Pencil, Share2, Trash2 } from "@lucide/svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  let actionsTrigger: HTMLElement | null = $state(null);
  let actionsOpen = $state(false);
  let lastAction = $state<string | null>(null);

  let bottomStartTrigger: HTMLElement | null = $state(null);
  let bottomEndTrigger: HTMLElement | null = $state(null);
  let topStartTrigger: HTMLElement | null = $state(null);
  let topEndTrigger: HTMLElement | null = $state(null);
  let bottomStartOpen = $state(false);
  let bottomEndOpen = $state(false);
  let topStartOpen = $state(false);
  let topEndOpen = $state(false);

  const actionItems = [
    { kind: "group" as const, label: "Edit" },
    { label: "Edit", value: "edit", icon: Pencil },
    { label: "Duplicate", value: "duplicate", icon: Copy },
    { kind: "divider" as const },
    { kind: "group" as const, label: "Distribute" },
    { label: "Share", value: "share", icon: Share2 },
    { label: "Archive", value: "archive", icon: Archive },
    { kind: "divider" as const },
    { label: "Delete", value: "delete", icon: Trash2, danger: true }
  ];

  function selectAction(value: string) {
    lastAction = value;
    actionsOpen = false;
  }

  const placementItems = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C", value: "c" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Overlays</p>
    <h1>
      {t(locale.value, "menuPopoverTitle")}
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{t(locale.value, "menuPopoverIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label="MenuTriggerButton + MenuPopover + Menu">
      <div class="docs-mp-anchor" bind:this={actionsTrigger}>
        <MenuTriggerButton
          aria-label="Open actions menu"
          expanded={actionsOpen}
          onclick={() => (actionsOpen = !actionsOpen)}
        />
      </div>
      <MenuPopover
        bind:open={actionsOpen}
        trigger={actionsTrigger}
        placement="bottom-start"
        label="Actions"
      >
        <Menu label="Actions" items={actionItems} onselect={selectAction} />
      </MenuPopover>
      <p class="docs-demo-note">
        Last action: <code>{lastAction ?? "—"}</code>
      </p>
    </div>

    <div class="docs-example docs-mp-placements" aria-label="Placements">
      <div class="docs-mp-row">
        <div class="docs-mp-anchor" bind:this={bottomStartTrigger}>
          <MenuTriggerButton
            aria-label="bottom-start"
            expanded={bottomStartOpen}
            onclick={() => (bottomStartOpen = !bottomStartOpen)}
          />
        </div>
        <MenuPopover
          bind:open={bottomStartOpen}
          trigger={bottomStartTrigger}
          placement="bottom-start"
          label="bottom-start"
        >
          <Menu label="bottom-start" items={placementItems} />
        </MenuPopover>
        <code>bottom-start</code>
      </div>

      <div class="docs-mp-row">
        <div class="docs-mp-anchor" bind:this={bottomEndTrigger}>
          <MenuTriggerButton
            aria-label="bottom-end"
            expanded={bottomEndOpen}
            onclick={() => (bottomEndOpen = !bottomEndOpen)}
          />
        </div>
        <MenuPopover
          bind:open={bottomEndOpen}
          trigger={bottomEndTrigger}
          placement="bottom-end"
          label="bottom-end"
        >
          <Menu label="bottom-end" items={placementItems} />
        </MenuPopover>
        <code>bottom-end</code>
      </div>

      <div class="docs-mp-row">
        <div class="docs-mp-anchor" bind:this={topStartTrigger}>
          <MenuTriggerButton
            aria-label="top-start"
            expanded={topStartOpen}
            onclick={() => (topStartOpen = !topStartOpen)}
          />
        </div>
        <MenuPopover
          bind:open={topStartOpen}
          trigger={topStartTrigger}
          placement="top-start"
          label="top-start"
        >
          <Menu label="top-start" items={placementItems} />
        </MenuPopover>
        <code>top-start</code>
      </div>

      <div class="docs-mp-row">
        <div class="docs-mp-anchor" bind:this={topEndTrigger}>
          <MenuTriggerButton
            aria-label="top-end"
            expanded={topEndOpen}
            onclick={() => (topEndOpen = !topEndOpen)}
          />
        </div>
        <MenuPopover
          bind:open={topEndOpen}
          trigger={topEndTrigger}
          placement="top-end"
          label="top-end"
        >
          <Menu label="top-end" items={placementItems} />
        </MenuPopover>
        <code>top-end</code>
      </div>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>open</code></td><td><code>boolean</code> (bindable)</td><td><code>false</code></td></tr>
        <tr><td><code>trigger</code></td><td><code>HTMLElement | null</code></td><td><em>required</em></td></tr>
        <tr><td><code>placement</code></td><td><code>"bottom-start" | "bottom-end" | "top-start" | "top-end"</code></td><td><code>"bottom-start"</code></td></tr>
        <tr><td><code>align</code></td><td><code>"start" | "end" | "center"</code></td><td><em>derived from placement</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>required</em></td></tr>
        <tr><td><code>closeOnOutside</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>closeOnEscape</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optional</em></td></tr>
      </tbody>
    </table>
    <p>
      Le composant se positionne en absolu via <code>getBoundingClientRect()</code> sur le déclencheur,
      et recalcule sa position lors du <code>scroll</code> et du <code>resize</code> de la fenêtre.
      Il consomme <code>--st-component-popover-zIndex</code>, <code>--st-component-menu-minWidth</code>,
      <code>--st-component-menu-maxWidth</code> et la même surface visuelle que <code>Menu</code>.
    </p>
  </section>
</div>

<style>
  .docs-mp-anchor {
    display: inline-flex;
  }

  .docs-mp-placements {
    display: grid;
    gap: 1rem;
  }

  .docs-mp-row {
    align-items: center;
    display: flex;
    gap: 0.75rem;
  }
</style>
