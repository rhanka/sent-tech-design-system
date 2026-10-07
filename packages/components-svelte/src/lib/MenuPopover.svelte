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
  // True once the requested vertical side no longer fits and the panel is
  // shown on the opposite side (flip). The placement class follows so the
  // existing translate transforms keep working.
  let flipped = $state(false);

  const GAP = 4;
  // Marge anti-débordement entre le panneau et le bord du viewport.
  const VIEWPORT_MARGIN = 8;
  // Plancher de hauteur : sous ce seuil on garde une fenêtre scrollable utilisable
  // plutôt qu'un menu écrasé (cas rare d'un déclencheur collé au bord).
  const MIN_HEIGHT = 160;

  function effectivePlacement(): "bottom-start" | "bottom-end" | "top-start" | "top-end" {
    if (!flipped) return placement;
    if (placement === "bottom-start") return "top-start";
    if (placement === "bottom-end") return "top-end";
    if (placement === "top-start") return "bottom-start";
    return "bottom-end";
  }

  function computePosition() {
    if (!trigger) return;
    // Viewport coordinates (getBoundingClientRect) with `position: fixed`:
    // no scroll offsets — the old document coordinates were wrong inside any
    // positioned ancestor and the panel was clipped by overflow containers.
    const rect = trigger.getBoundingClientRect();
    const verticalUp = placement === "top-start" || placement === "top-end";
    const horizontalEnd = placement === "bottom-end" || placement === "top-end";

    // Resolve secondary alignment override (align prop overrides the placement's horizontal cue).
    const resolvedAlign: "start" | "end" | "center" = align
      ?? (horizontalEnd ? "end" : "start");

    alignmentRight = resolvedAlign === "end";
    alignmentCenter = resolvedAlign === "center";

    const panelHeight = panel?.offsetHeight ?? 0;
    const panelWidth = panel?.offsetWidth ?? 0;
    const need = panelHeight > 0 ? panelHeight : MIN_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom - GAP;
    const spaceAbove = rect.top - GAP;

    // Flip when the requested side cannot fit the panel and the other side
    // offers more room.
    let showUp = verticalUp;
    if (!verticalUp && spaceBelow < need && spaceAbove > spaceBelow) showUp = true;
    else if (verticalUp && spaceAbove < need && spaceBelow > spaceAbove) showUp = false;
    flipped = showUp !== verticalUp;

    if (showUp) {
      // The panel's bottom edge sits above the trigger (transform handles the
      // flip); available space is what's ABOVE the trigger.
      top = rect.top - GAP;
      maxHeight = Math.max(rect.top - GAP - VIEWPORT_MARGIN, MIN_HEIGHT);
    } else {
      top = rect.bottom + GAP;
      // Espace réellement disponible SOUS le déclencheur : c'est ce qui manquait —
      // `max-height: 100vh` ignorait l'offset du panneau et débordait par le bas.
      maxHeight = Math.max(
        window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN,
        MIN_HEIGHT
      );
    }

    // Reclamp horizontally so the measured panel stays inside the viewport.
    if (resolvedAlign === "end") {
      left = rect.right;
      if (panelWidth > 0) left = Math.min(Math.max(left, panelWidth + VIEWPORT_MARGIN), window.innerWidth - VIEWPORT_MARGIN);
    } else if (resolvedAlign === "center") {
      left = rect.left + rect.width / 2;
      if (panelWidth > 0) {
        left = Math.min(
          Math.max(left, panelWidth / 2 + VIEWPORT_MARGIN),
          window.innerWidth - panelWidth / 2 - VIEWPORT_MARGIN
        );
      }
    } else {
      left = rect.left;
      if (panelWidth > 0) left = Math.min(Math.max(left, VIEWPORT_MARGIN), window.innerWidth - panelWidth - VIEWPORT_MARGIN);
    }
  }

  // --- Top layer -----------------------------------------------------------
  // The element stays in place in the DOM (no portal to <body>) so it keeps
  // inheriting the theme's `--st-*` custom properties; the Popover API only
  // lifts rendering into the top layer, above overflow clipping. Where the
  // API is missing (jsdom), plain `position: fixed` still applies.
  let popoverShown = false;

  function showTopLayer() {
    const el = panel as (HTMLDivElement & { showPopover?: () => void }) | undefined;
    if (!el || popoverShown) return;
    if (typeof el.showPopover !== "function") return;
    // The attribute is set ONLY here (never statically in markup): environments
    // without the API (jsdom) hide every [popover] element via the UA rule, so
    // a static attribute would force display:none under test.
    el.setAttribute("popover", "manual");
    try {
      el.showPopover();
      popoverShown = true;
    } catch {
      el.removeAttribute("popover");
      // Already open or not ready — fixed positioning still applies.
    }
  }

  function hideTopLayer() {
    const el = panel as (HTMLDivElement & { hidePopover?: () => void }) | undefined;
    popoverShown = false;
    if (!el || typeof el.hidePopover !== "function") return;
    try {
      el.hidePopover();
    } catch {
      // Already hidden — nothing to do.
    } finally {
      el.removeAttribute("popover");
    }
  }

  $effect(() => {
    if (!open) return;
    computePosition();
    showTopLayer();
    // Re-measure once the panel is laid out (size known for flip/clamp).
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        if (open) computePosition();
      });
    }
    const onScroll = () => computePosition();
    const onResize = () => computePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      hideTopLayer();
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
      `st-menuPopover--${effectivePlacement()}`,
      alignmentRight ? "st-menuPopover--alignEnd" : null,
      alignmentCenter ? "st-menuPopover--alignCenter" : null,
      className
    ]
      .filter(Boolean)
      .join(" ");
</script>

<svelte:window onpointerdown={onWindowPointerDown} onkeydown={onWindowKeyDown} />

{#if open}
  <!-- No static popover attribute: it is set imperatively by showTopLayer()
       only where the Popover API exists (see above). -->
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
    /* Aligne la taille de texte sur le Menu normal (.st-menu__item) : sans ça le
       contenu hérite de la taille de la page (~1rem) au lieu de 0.875rem. */
    font-size: var(--st-component-menu-fontSize, 0.875rem);
    min-width: var(--st-component-menu-minWidth, 12rem);
    max-width: var(--st-component-menu-maxWidth, 18rem);
    max-height: calc(100vh - 2rem);
    overflow: auto;
    padding: 0;
    /* Viewport coordinates from getBoundingClientRect: fixed, never absolute
       (absolute + document coords broke inside any positioned ancestor). */
    position: fixed;
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
