<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type MenuPopoverProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    open?: boolean;
    trigger: HTMLElement | null;
    placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
    align?: "start" | "end" | "center";
    label: string;
    class?: string;
    closeOnOutside?: boolean;
    closeOnEscape?: boolean;
    children?: Snippet;
  };

  let {
    open = $bindable(false),
    trigger,
    placement = "bottom-start",
    align,
    label,
    class: className,
    closeOnOutside = true,
    closeOnEscape = true,
    children,
    ...rest
  }: MenuPopoverProps = $props();

  let panel: HTMLDivElement | undefined = $state();
  let top = $state(0);
  let left = $state(0);
  let maxHeight = $state(0);
  let alignmentRight = $state(false);
  let alignmentCenter = $state(false);

  const GAP = 4;
  // Marge anti-débordement entre le panneau et le bord du viewport.
  const VIEWPORT_MARGIN = 8;
  // Plancher de hauteur : sous ce seuil on garde une fenêtre scrollable utilisable
  // plutôt qu'un menu écrasé (cas rare d'un déclencheur collé au bord).
  const MIN_HEIGHT = 160;

  function computePosition() {
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const verticalUp = placement === "top-start" || placement === "top-end";
    const horizontalEnd = placement === "bottom-end" || placement === "top-end";

    // Resolve secondary alignment override (align prop overrides the placement's horizontal cue).
    const resolvedAlign: "start" | "end" | "center" = align
      ?? (horizontalEnd ? "end" : "start");

    alignmentRight = resolvedAlign === "end";
    alignmentCenter = resolvedAlign === "center";

    if (verticalUp) {
      // We don't know the panel height yet on first frame; position the panel's
      // bottom edge above the trigger using transform.
      top = rect.top + window.scrollY - GAP;
      // Espace réellement disponible AU-DESSUS du déclencheur (le panneau est
      // remonté de 100% de sa hauteur), borné pour rester dans le viewport.
      maxHeight = Math.max(rect.top - GAP - VIEWPORT_MARGIN, MIN_HEIGHT);
    } else {
      top = rect.bottom + window.scrollY + GAP;
      // Espace réellement disponible SOUS le déclencheur : c'est ce qui manquait —
      // `max-height: 100vh` ignorait l'offset du panneau et débordait par le bas.
      maxHeight = Math.max(
        window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN,
        MIN_HEIGHT
      );
    }

    if (resolvedAlign === "end") {
      left = rect.right + window.scrollX;
    } else if (resolvedAlign === "center") {
      left = rect.left + window.scrollX + rect.width / 2;
    } else {
      left = rect.left + window.scrollX;
    }
  }

  $effect(() => {
    if (!open) return;
    computePosition();
    const onScroll = () => computePosition();
    const onResize = () => computePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  });

  function isWithin(event: Event, node: HTMLElement | null | undefined): boolean {
    if (!node) return false;
    const path = typeof (event as Event & { composedPath?: () => EventTarget[] }).composedPath === "function"
      ? (event as Event & { composedPath: () => EventTarget[] }).composedPath()
      : [];
    if (path.includes(node)) return true;
    const target = event.target as Node | null;
    return Boolean(target && node.contains(target));
  }

  function onWindowPointerDown(event: PointerEvent) {
    if (!open || !closeOnOutside) return;
    if (isWithin(event, panel)) return;
    if (isWithin(event, trigger)) return;
    open = false;
  }

  function onWindowKeyDown(event: KeyboardEvent) {
    if (!open || !closeOnEscape) return;
    if (event.key === "Escape") {
      event.preventDefault();
      open = false;
    }
  }

  const classes = () =>
    [
      "st-menuPopover",
      `st-menuPopover--${placement}`,
      alignmentRight ? "st-menuPopover--alignEnd" : null,
      alignmentCenter ? "st-menuPopover--alignCenter" : null,
      className
    ]
      .filter(Boolean)
      .join(" ");
</script>

<svelte:window onpointerdown={onWindowPointerDown} onkeydown={onWindowKeyDown} />

{#if open}
  <div
    {...rest}
    bind:this={panel}
    class={classes()}
    role="dialog"
    aria-label={label}
    style={`top: ${top}px; left: ${left}px;${maxHeight ? ` max-height: ${maxHeight}px;` : ""}`}
  >
    {@render children?.()}
  </div>
{/if}

<style>
  .st-menuPopover {
    background: var(--st-component-menu-background, var(--st-semantic-surface-raised, #ffffff));
    border: 1px solid var(--st-component-menu-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-menu-radius, 0.375rem);
    box-shadow: var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14));
    color: var(--st-component-menu-text, var(--st-semantic-text-primary));
    min-width: var(--st-component-menu-minWidth, 12rem);
    max-width: var(--st-component-menu-maxWidth, 18rem);
    max-height: calc(100vh - 2rem);
    overflow: auto;
    padding: 0;
    position: absolute;
    z-index: var(--st-component-popover-zIndex, 80);
  }

  /* Default origin: left edge aligned to trigger left. */
  .st-menuPopover--alignEnd {
    /* Move the panel left by 100% of its width so its right edge aligns to `left`. */
    transform: translateX(-100%);
  }

  .st-menuPopover--alignCenter {
    transform: translateX(-50%);
  }

  /* For top placements, the `top` value is the trigger's top edge; shift the
     panel up by 100% of its height so its bottom edge sits above the trigger. */
  .st-menuPopover--top-start {
    transform: translateY(-100%);
  }

  .st-menuPopover--top-end {
    transform: translate(-100%, -100%);
  }

  .st-menuPopover--top-start.st-menuPopover--alignEnd {
    transform: translate(-100%, -100%);
  }

  .st-menuPopover--top-start.st-menuPopover--alignCenter {
    transform: translate(-50%, -100%);
  }

  .st-menuPopover--top-end.st-menuPopover--alignCenter {
    transform: translate(-50%, -100%);
  }
</style>
