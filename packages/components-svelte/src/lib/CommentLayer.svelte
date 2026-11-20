<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type {
    AnchorPayload,
    CollaborationActor,
    CommentTarget,
    ReviewComment,
    ReviewThread,
    ThreadReadState,
  } from "@sentropic/design-system-review-core";

  export type ReviewMode = "view" | "review";

  export interface CommentLayerCreatePayload {
    target: CommentTarget;
    sectionKey: string;
    body: string;
  }

  export interface CommentLayerComposerContext {
    anchor: AnchorPayload;
    sectionKey: string | null;
    error: string | null;
    submit: (body: string) => Promise<void>;
    cancel: () => void;
  }

  export type CommentLayerProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Artifact root element (e.g. bearing `data-review-root`). Optional when wrapping slotted `children`. */
    rootEl?: HTMLElement | null;
    /** Host-controlled review mode (`"view"` leaves artifact untouched; `"review"` overlays pins & picking). */
    mode?: ReviewMode;
    /** Target identity (`kind` + `id`) used to mint new comment targets even when `comments` is empty. */
    target: Pick<CommentTarget, "kind" | "id">;
    /** Current rendered artifact version stamped into new anchors as `v` and passed to `resolveAnchor`. */
    artifactVersion: string;
    /** Flat comments for this artifact. */
    comments: readonly ReviewComment[];
    currentUser: CollaborationActor;
    activeThreadId?: string | null;
    readState?: ThreadReadState | null;
    canModerate?: boolean;
    /** Debounce before showing the floating "Add comment" trigger after text selection (default 150ms). */
    selectionSettleMs?: number;
    class?: string;
    onCreate?: (payload: CommentLayerCreatePayload) => void | Promise<void>;
    onSelect?: (threadId: string | null) => void;
    onMarkRead?: (threadId: string) => void;
    onModeChange?: (mode: ReviewMode) => void;
    /** Called whenever resolved vs orphaned thread partition changes against the live DOM. */
    onOrphansChange?: (orphaned: ReviewThread[]) => void;
    /** Forwarded panel/thread mutation callbacks (available to hosts composing panel slots). */
    onReply?: (threadId: string, body: string) => void | Promise<void>;
    onResolve?: (threadId: string) => void | Promise<void>;
    onReopen?: (threadId: string) => void | Promise<void>;
    onEditComment?: (commentId: string, body: string) => void | Promise<void>;
    onDeleteComment?: (commentId: string) => void | Promise<void>;
    onReanchor?: (threadId: string) => void | Promise<void>;
    /** Optional slotted artifact content (used when `rootEl` is not supplied externally). */
    children?: Snippet;
    /** Optional custom composer slot `{ anchor, sectionKey, error, submit, cancel }`. */
    composer?: Snippet<[CommentLayerComposerContext]>;
  };
</script>

<script lang="ts">
  import { tick, untrack } from "svelte";
  import {
    countUnreadComments,
    createAnchorFromElement,
    createAnchorFromSelection,
    groupCommentsIntoThreads,
    isUnread,
    layoutPins,
    resolveAnchor,
    tryEncodeAnchor,
    type PositionedPin,
  } from "@sentropic/design-system-review-core";
  import Button from "./Button.svelte";
  import CommentComposer from "./CommentComposer.svelte";
  import CommentPin from "./CommentPin.svelte";
  import {
    formatAnchorLabel,
    formatPinAriaLabel,
    getFocusableElements,
    handleFocusTrapKeydown,
  } from "./review-markdown.js";

  interface OverlayBox {
    top: number;
    left: number;
    width: number;
    height: number;
  }

  interface ResolvedEntry {
    thread: ReviewThread;
    anchorKind: "text" | "element" | "region";
    element: Element;
    range: Range | null;
    box: OverlayBox;
    index: number;
  }

  interface PinCluster {
    id: string;
    entries: ResolvedEntry[];
    box: OverlayBox;
    primaryIndex: number;
    totalComments: number;
    unreadCount: number;
    allResolved: boolean;
    anyActive: boolean;
    variant: "inline" | "element" | "cluster";
    ariaLabel: string;
  }

  interface PendingSelection {
    anchor: AnchorPayload;
    top: number;
    left: number;
  }

  interface ComposerSession {
    anchor: AnchorPayload;
    sectionKey: string | null;
    error: string | null;
    top: number;
    left: number;
    invoker: HTMLElement | null;
  }

  const COMMENTABLE_FALLBACK_SELECTOR =
    "p, h1, h2, h3, h4, h5, h6, li, figure, table, blockquote, pre, [data-anchor-id]";
  const INTERACTIVE_SUPPRESSED_SELECTOR =
    'a, button, input, select, textarea, summary, [role="button"], [role="link"]';
  const HIGHLIGHT_OPEN = "st-review-text";
  const HIGHLIGHT_ACTIVE = "st-review-text-active";
  const HIGHLIGHT_RESOLVED = "st-review-text-resolved";

  let {
    rootEl = null,
    mode = "view",
    target,
    artifactVersion,
    comments,
    currentUser,
    activeThreadId = null,
    readState = null,
    canModerate: _canModerate = false,
    selectionSettleMs = 150,
    class: className,
    onCreate,
    onSelect,
    onMarkRead,
    onModeChange,
    onOrphansChange,
    onReply: _onReply,
    onResolve: _onResolve,
    onReopen: _onReopen,
    onEditComment: _onEditComment,
    onDeleteComment: _onDeleteComment,
    onReanchor: _onReanchor,
    children,
    composer,
    ...rest
  }: CommentLayerProps = $props();

  let layerEl: HTMLElement | undefined = $state();
  let slotHostEl: HTMLElement | undefined = $state();
  let overlayEl: HTMLElement | undefined = $state();
  let clusterPopoverEl: HTMLElement | undefined = $state();
  let selectionTriggerEl: HTMLElement | undefined = $state();
  let confirmDialogEl: HTMLElement | undefined = $state();

  let domRevision = $state(0);
  let hoverBox = $state<OverlayBox | null>(null);
  let flashBox = $state<OverlayBox | null>(null);
  let pendingSelection = $state<PendingSelection | null>(null);
  let composerSession = $state<ComposerSession | null>(null);
  let draftBody = $state("");
  let confirmDiscardOpen = $state(false);
  let openClusterId = $state<string | null>(null);
  let liveAnnouncement = $state("");

  let prevMode: ReviewMode = untrack(() => mode);
  let prevOrphanIds = new Set<string>();
  let mutationQueued = false;
  let flashTimer: ReturnType<typeof setTimeout> | undefined;
  let selectionTimer: ReturnType<typeof setTimeout> | undefined;
  let selectionTriggerReleaseTimer: ReturnType<typeof setTimeout> | undefined;
  let selectionTriggerPressed = false;
  let clusterInvoker: HTMLElement | null = null;
  let confirmReturnFocus: HTMLElement | null = null;

  const effectiveRoot = $derived.by<HTMLElement | null>(() => {
    // Re-read domRevision only for anchor resolution; root lookup tracks rootEl/slotHostEl.
    if (rootEl) return rootEl;
    if (!slotHostEl) return null;
    const explicit = slotHostEl.querySelector<HTMLElement>("[data-review-root]");
    return explicit ?? slotHostEl;
  });

  const threads = $derived(groupCommentsIntoThreads(comments));

  function relativeBox(
    rootRect: DOMRect,
    rect: { top: number; left: number; width: number; height: number },
  ): OverlayBox {
    return {
      top: rect.top - rootRect.top,
      left: rect.left - rootRect.left,
      width: rect.width,
      height: rect.height,
    };
  }

  function safeRangeRect(range: Range, fallbackEl: Element): DOMRect {
    if (typeof range.getBoundingClientRect === "function") {
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        return rect;
      }
    }
    return fallbackEl.getBoundingClientRect();
  }

  function compareDomOrder(a: ResolvedEntry, b: ResolvedEntry): number {
    if (a.element !== b.element) {
      const pos = a.element.compareDocumentPosition(b.element);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    }
    if (a.range && b.range) {
      try {
        const cmp = a.range.compareBoundaryPoints(Range.START_TO_START, b.range);
        if (cmp !== 0) return cmp;
      } catch {
        // Detached ranges fall through to geometric comparison.
      }
    }
    if (a.box.top !== b.box.top) return a.box.top - b.box.top;
    const aTime = a.thread.comments[0]?.createdAt ?? "";
    const bTime = b.thread.comments[0]?.createdAt ?? "";
    return aTime < bTime ? -1 : aTime > bTime ? 1 : 0;
  }

  const resolution = $derived.by(() => {
    // Depend on domRevision and mode so observer/scroll/resize updates and mode toggles
    // re-measure rootEl vs layerEl and re-resolve anchors.
    void domRevision;
    void mode;
    const root = effectiveRoot;
    const layer = layerEl;
    const resolved: ResolvedEntry[] = [];
    const orphaned: ReviewThread[] = [];

    if (!root) {
      return { resolved, orphaned, rootHeight: 0, overlayBox: null as OverlayBox | null };
    }

    const rootRect = root.getBoundingClientRect();
    const overlayBox: OverlayBox | null = layer
      ? (() => {
          const layerRect = layer.getBoundingClientRect();
          return {
            top: rootRect.top - layerRect.top,
            left: rootRect.left - layerRect.left,
            width: rootRect.width,
            height: rootRect.height,
          };
        })()
      : null;

    for (const thread of threads) {
      if (thread.anchor === null) {
        orphaned.push(thread);
        continue;
      }

      const match = resolveAnchor(root, thread.anchor, { artifactVersion });
      if (match.status === "orphan") {
        orphaned.push(thread);
        continue;
      }

      let targetRect: { top: number; left: number; width: number; height: number };
      if (match.kind === "region") {
        targetRect = {
          top: rootRect.top + match.rect.y * rootRect.height,
          left: rootRect.left + match.rect.x * rootRect.width,
          width: match.rect.width * rootRect.width,
          height: match.rect.height * rootRect.height,
        };
      } else if (match.kind === "text" && match.range) {
        targetRect = safeRangeRect(match.range, match.element);
      } else {
        targetRect = match.element.getBoundingClientRect();
      }

      resolved.push({
        thread,
        anchorKind: match.kind,
        element: match.element,
        range: match.range,
        box: relativeBox(rootRect, targetRect),
        index: 0,
      });
    }

    resolved.sort(compareDomOrder);
    resolved.forEach((entry, idx) => {
      entry.index = idx + 1;
    });

    return { resolved, orphaned, rootHeight: rootRect.height, overlayBox };
  });

  const clusters = $derived.by<PinCluster[]>(() => {
    const groups: ResolvedEntry[][] = [];
    const elementGroups = new Map<Element, ResolvedEntry[]>();
    const sectionGroups = new Map<string, ResolvedEntry[]>();

    for (const entry of resolution.resolved) {
      if (entry.anchorKind === "element" || entry.range === null) {
        const existing = elementGroups.get(entry.element);
        if (existing) {
          existing.push(entry);
        } else {
          const bucket = [entry];
          elementGroups.set(entry.element, bucket);
          groups.push(bucket);
        }
      } else if (entry.thread.sectionKey) {
        const existing = sectionGroups.get(entry.thread.sectionKey);
        if (existing) {
          existing.push(entry);
        } else {
          const bucket = [entry];
          sectionGroups.set(entry.thread.sectionKey, bucket);
          groups.push(bucket);
        }
      } else {
        groups.push([entry]);
      }
    }

    return groups.map((entries) => {
      const first = entries[0]!;
      const totalComments = entries.reduce((sum, e) => sum + e.thread.comments.length, 0);
      const unreadCount = entries.reduce(
        (sum, e) => sum + countUnreadComments(e.thread, currentUser, readState),
        0,
      );
      const allResolved = entries.every((e) => e.thread.state === "closed");
      const anyActive = entries.some((e) => e.thread.threadId === activeThreadId);
      const isCluster = entries.length > 1;
      const excerpt = formatAnchorLabel(first.thread.anchor, 60);
      const ariaLabel = isCluster
        ? `${entries.length} threads clustered, ${totalComments} comments${unreadCount > 0 ? `, ${unreadCount} unread` : ""}, on '${excerpt}'`
        : formatPinAriaLabel({
            index: first.index,
            count: totalComments,
            unreadCount,
            resolved: allResolved,
            excerpt,
          });

      return {
        id: entries.map((e) => e.thread.threadId).join("+"),
        entries,
        box: first.box,
        primaryIndex: first.index,
        totalComments,
        unreadCount,
        allResolved,
        anyActive,
        variant: isCluster ? "cluster" : first.anchorKind === "element" ? "element" : "inline",
        ariaLabel,
      };
    });
  });

  const gutterPins = $derived.by<Array<{ cluster: PinCluster; positioned: PositionedPin }>>(() => {
    if (clusters.length === 0) return [];
    const byId = new Map(clusters.map((cluster) => [cluster.id, cluster]));
    const positioned = layoutPins(
      clusters.map((cluster) => ({ id: cluster.id, targetY: cluster.box.top })),
      {
        gap: 28,
        minY: 0,
        maxY: resolution.rootHeight > 0 ? Math.max(0, resolution.rootHeight - 24) : undefined,
      },
    );
    return positioned
      .map((item) => {
        const cluster = byId.get(item.id);
        return cluster ? { cluster, positioned: item } : null;
      })
      .filter((entry): entry is { cluster: PinCluster; positioned: PositionedPin } => entry !== null);
  });

  const openCluster = $derived(
    openClusterId ? clusters.find((cluster) => cluster.id === openClusterId) ?? null : null,
  );

  // Notify host of orphan partition changes and politely announce newly orphaned threads.
  $effect(() => {
    const orphans = resolution.orphaned;
    onOrphansChange?.(orphans);

    const nextIds = new Set(orphans.map((t) => t.threadId));
    let newlyOrphaned = 0;
    for (const id of nextIds) {
      if (!prevOrphanIds.has(id)) {
        newlyOrphaned += 1;
      }
    }
    if (newlyOrphaned > 0 && mode === "review") {
      liveAnnouncement =
        newlyOrphaned === 1
          ? "1 comment thread is now unattached (orphan)."
          : `${newlyOrphaned} comment threads are now unattached (orphans).`;
    }
    prevOrphanIds = nextIds;
  });

  // Guard review -> view exit when an unsaved draft is open.
  $effect(() => {
    const current = mode;
    if (prevMode === "review" && current === "view") {
      if (composerSession !== null && draftBody.trim().length > 0) {
        const active = typeof document !== "undefined" ? document.activeElement : null;
        confirmReturnFocus =
          active instanceof HTMLElement && !(overlayEl && overlayEl.contains(active))
            ? active
            : composerSession.invoker;
        confirmDiscardOpen = true;
      } else {
        clearTransientState();
      }
    } else if (current === "review") {
      confirmDiscardOpen = false;
      confirmReturnFocus = null;
    }
    prevMode = current;
  });

  // Sync CSS Custom Highlight API when supported (pin-only fallback otherwise).
  $effect(() => {
    const isReview = mode === "review";
    const entries = resolution.resolved;
    const currentActiveId = activeThreadId;

    const applyHighlights = (active: boolean) => {
      if (
        typeof CSS === "undefined" ||
        CSS === null ||
        !("highlights" in CSS) ||
        typeof Highlight === "undefined"
      ) {
        return;
      }
      const registry = (CSS as unknown as { highlights: Map<string, unknown> }).highlights;
      registry.delete(HIGHLIGHT_OPEN);
      registry.delete(HIGHLIGHT_ACTIVE);
      registry.delete(HIGHLIGHT_RESOLVED);
      if (!active) return;

      const openRanges: Range[] = [];
      const activeRanges: Range[] = [];
      const resolvedRanges: Range[] = [];

      for (const entry of entries) {
        if (!entry.range) continue;
        if (entry.thread.threadId === currentActiveId) {
          activeRanges.push(entry.range);
        } else if (entry.thread.state === "closed") {
          resolvedRanges.push(entry.range);
        } else {
          openRanges.push(entry.range);
        }
      }

      if (openRanges.length > 0) registry.set(HIGHLIGHT_OPEN, new Highlight(...openRanges));
      if (activeRanges.length > 0) registry.set(HIGHLIGHT_ACTIVE, new Highlight(...activeRanges));
      if (resolvedRanges.length > 0) {
        registry.set(HIGHLIGHT_RESOLVED, new Highlight(...resolvedRanges));
      }
    };

    applyHighlights(isReview);
    return () => applyHighlights(false);
  });

  // Observe artifact DOM mutations & resizes while in review mode so anchors re-attach after re-render.
  $effect(() => {
    const root = effectiveRoot;
    if (mode !== "review" || !root) return;

    const scheduleRefresh = () => {
      if (mutationQueued) return;
      mutationQueued = true;
      queueMicrotask(() => {
        mutationQueued = false;
        domRevision += 1;
      });
    };

    const observer =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver((records) => {
            // Ignore mutations originating exclusively inside our own overlay if nested.
            const relevant = records.some(
              (rec) => !overlayEl || !overlayEl.contains(rec.target),
            );
            if (relevant) {
              scheduleRefresh();
            }
          })
        : null;

    observer?.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-anchor-id", "data-commentable"],
    });

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleRefresh) : null;
    resizeObserver?.observe(root);
    if (layerEl && layerEl !== root) {
      resizeObserver?.observe(layerEl);
    }

    window.addEventListener("resize", scheduleRefresh, { passive: true });
    window.addEventListener("scroll", scheduleRefresh, { capture: true, passive: true });

    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleRefresh);
      window.removeEventListener("scroll", scheduleRefresh, { capture: true });
    };
  });

  // Picking listeners (click, hover/focus outline, 150ms text selection settle, Alt+Shift+C).
  $effect(() => {
    const root = effectiveRoot;
    if (mode !== "review" || !root) {
      hoverBox = null;
      return;
    }

    const doc = root.ownerDocument;

    const isInsideOverlay = (node: Node | null): boolean =>
      node !== null && overlayEl !== undefined && overlayEl.contains(node);

    const isEditableElement = (el: EventTarget | null): boolean => {
      if (!el || typeof (el as Element).tagName !== "string") return false;
      const tag = (el as Element).tagName.toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      return (el as HTMLElement).isContentEditable === true;
    };

    const isPassthrough = (el: Element): boolean => {
      const match = el.closest("[data-review-passthrough]");
      return match !== null && root.contains(match);
    };

    const findCommentable = (el: Element): HTMLElement | null => {
      if (!root.contains(el) || isInsideOverlay(el)) return null;
      const explicit = el.closest("[data-commentable]");
      if (explicit && root.contains(explicit)) {
        return explicit as HTMLElement;
      }
      const fallback = el.closest(COMMENTABLE_FALLBACK_SELECTOR);
      if (fallback && root.contains(fallback)) {
        return fallback as HTMLElement;
      }
      return null;
    };

    const handleRootClick = (event: MouseEvent) => {
      const targetNode = event.target as Element | null;
      if (!targetNode || isInsideOverlay(targetNode)) return;
      if (isPassthrough(targetNode)) return;

      // Suppress clicks on links/buttons inside the artifact during review mode.
      const interactive = targetNode.closest(INTERACTIVE_SUPPRESSED_SELECTOR);
      if (interactive && root.contains(interactive) && !interactive.hasAttribute("data-commentable")) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // If the user just dragged a non-collapsed text selection inside root, let selection flow own it.
      const selection = doc.defaultView?.getSelection();
      if (
        selection &&
        selection.rangeCount > 0 &&
        !selection.getRangeAt(0).collapsed &&
        root.contains(selection.getRangeAt(0).commonAncestorContainer)
      ) {
        return;
      }

      const commentable = findCommentable(targetNode);
      if (!commentable) return;

      const anchor = createAnchorFromElement(root, commentable, artifactVersion);
      if (!anchor) return;
      const box = relativeBox(root.getBoundingClientRect(), commentable.getBoundingClientRect());
      pendingSelection = null;
      openClusterId = null;
      openComposerForAnchor(anchor, commentable, box.top + box.height, box.left);
    };

    const updateHover = (targetNode: Element | null) => {
      if (!targetNode || isInsideOverlay(targetNode) || isPassthrough(targetNode)) {
        hoverBox = null;
        return;
      }
      const interactive = targetNode.closest(INTERACTIVE_SUPPRESSED_SELECTOR);
      if (interactive && root.contains(interactive) && !interactive.hasAttribute("data-commentable")) {
        hoverBox = null;
        return;
      }
      const commentable = findCommentable(targetNode);
      if (!commentable) {
        hoverBox = null;
        return;
      }
      hoverBox = relativeBox(root.getBoundingClientRect(), commentable.getBoundingClientRect());
    };

    const handlePointerOver = (event: Event) => updateHover(event.target as Element | null);
    const handlePointerLeave = () => {
      hoverBox = null;
    };
    const handleFocusIn = (event: FocusEvent) => updateHover(event.target as Element | null);
    const handleFocusOut = (event: FocusEvent) => {
      const related = event.relatedTarget as Node | null;
      if (!related || !root.contains(related)) {
        hoverBox = null;
      }
    };

    const isTriggerEngaged = (): boolean =>
      selectionTriggerPressed ||
      (selectionTriggerEl !== undefined &&
        doc.activeElement !== null &&
        selectionTriggerEl.contains(doc.activeElement));

    const hasValidRootSelection = (): boolean => {
      const selection = doc.defaultView?.getSelection();
      if (!selection || selection.rangeCount === 0) return false;
      const range = selection.getRangeAt(0);
      return (
        !range.collapsed &&
        range.toString().trim().length > 0 &&
        root.contains(range.commonAncestorContainer) &&
        !isInsideOverlay(range.commonAncestorContainer) &&
        !isEditableElement(doc.activeElement)
      );
    };

    const handleSelectionChange = () => {
      if (selectionTimer !== undefined) {
        clearTimeout(selectionTimer);
        selectionTimer = undefined;
      }
      const selection = doc.defaultView?.getSelection();
      if (!selection || selection.rangeCount === 0) {
        if (!isTriggerEngaged()) {
          pendingSelection = null;
        }
        return;
      }
      const range = selection.getRangeAt(0);
      if (
        range.collapsed ||
        range.toString().trim().length === 0 ||
        !root.contains(range.commonAncestorContainer) ||
        isInsideOverlay(range.commonAncestorContainer) ||
        isEditableElement(doc.activeElement)
      ) {
        if (!isTriggerEngaged()) {
          pendingSelection = null;
        }
        return;
      }

      const cloned = range.cloneRange();
      selectionTimer = setTimeout(() => {
        selectionTimer = undefined;
        if (!root.contains(cloned.commonAncestorContainer)) {
          pendingSelection = null;
          return;
        }
        const anchor = createAnchorFromSelection(root, cloned, artifactVersion);
        if (!anchor) {
          pendingSelection = null;
          return;
        }
        const rootRect = root.getBoundingClientRect();
        const fallbackEl =
          cloned.endContainer.nodeType === Node.ELEMENT_NODE
            ? (cloned.endContainer as Element)
            : cloned.endContainer.parentElement ?? root;
        const rect = safeRangeRect(cloned, fallbackEl);
        pendingSelection = {
          anchor,
          top: rect.bottom - rootRect.top,
          left: Math.max(0, rect.right - rootRect.left),
        };
      }, selectionSettleMs);
    };

    const handleSelectionTriggerPointerRelease = () => {
      if (!selectionTriggerPressed) return;
      if (selectionTriggerReleaseTimer !== undefined) {
        clearTimeout(selectionTriggerReleaseTimer);
      }
      // Keep the trigger mounted past mouseup/pointerup until click fires.
      selectionTriggerReleaseTimer = setTimeout(() => {
        selectionTriggerReleaseTimer = undefined;
        selectionTriggerPressed = false;
        if (!pendingSelection || composerSession) return;
        if (!isTriggerEngaged() && !hasValidRootSelection()) {
          pendingSelection = null;
        }
      }, 0);
    };

    const handleGlobalKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (confirmDiscardOpen) {
          return;
        }
        if (openClusterId && !composerSession) {
          const activeEl = doc.activeElement;
          const onInvoker =
            clusterInvoker !== null &&
            activeEl !== null &&
            (activeEl === clusterInvoker || clusterInvoker.contains(activeEl));
          const inPopover =
            clusterPopoverEl !== undefined &&
            activeEl !== null &&
            clusterPopoverEl.contains(activeEl);
          if (onInvoker || inPopover) {
            event.preventDefault();
            event.stopPropagation();
            const invoker = clusterInvoker;
            openClusterId = null;
            clusterInvoker = null;
            invoker?.focus();
            return;
          }
        }
        if (pendingSelection && !composerSession && !openClusterId) {
          event.preventDefault();
          event.stopPropagation();
          pendingSelection = null;
          return;
        }
      }

      // Alt+Shift+C comments the selection or focused commentable element (Review only, never while typing).
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "c") {
        const activeEl = doc.activeElement;
        const targetEl = event.target as Element | null;
        if (isEditableElement(activeEl) || isEditableElement(targetEl)) {
          return;
        }

        const selection = doc.defaultView?.getSelection();
        if (
          selection &&
          selection.rangeCount > 0 &&
          !selection.getRangeAt(0).collapsed &&
          root.contains(selection.getRangeAt(0).commonAncestorContainer)
        ) {
          const range = selection.getRangeAt(0);
          const anchor = createAnchorFromSelection(root, range, artifactVersion);
          if (anchor) {
            event.preventDefault();
            event.stopPropagation();
            const rootRect = root.getBoundingClientRect();
            const fallbackEl =
              range.endContainer.nodeType === Node.ELEMENT_NODE
                ? (range.endContainer as Element)
                : range.endContainer.parentElement ?? root;
            const rangeRect = safeRangeRect(range, fallbackEl);
            pendingSelection = null;
            openComposerForAnchor(
              anchor,
              activeEl as HTMLElement | null,
              rangeRect.bottom - rootRect.top,
              Math.max(0, rangeRect.left - rootRect.left),
            );
            return;
          }
        }

        if (activeEl && root.contains(activeEl)) {
          const commentable = findCommentable(activeEl);
          if (commentable) {
            const anchor = createAnchorFromElement(root, commentable, artifactVersion);
            if (anchor) {
              event.preventDefault();
              event.stopPropagation();
              const box = relativeBox(root.getBoundingClientRect(), commentable.getBoundingClientRect());
              openComposerForAnchor(anchor, commentable, box.top + box.height, box.left);
            }
          }
        }
      }
    };

    root.addEventListener("click", handleRootClick, true);
    root.addEventListener("pointerover", handlePointerOver);
    root.addEventListener("pointerleave", handlePointerLeave);
    root.addEventListener("focusin", handleFocusIn);
    root.addEventListener("focusout", handleFocusOut);
    doc.addEventListener("selectionchange", handleSelectionChange);
    doc.addEventListener("keydown", handleGlobalKeydown);
    doc.addEventListener("mouseup", handleSelectionTriggerPointerRelease);
    doc.addEventListener("pointerup", handleSelectionTriggerPointerRelease);
    doc.addEventListener("pointercancel", handleSelectionTriggerPointerRelease);

    return () => {
      if (selectionTimer !== undefined) {
        clearTimeout(selectionTimer);
        selectionTimer = undefined;
      }
      if (selectionTriggerReleaseTimer !== undefined) {
        clearTimeout(selectionTriggerReleaseTimer);
        selectionTriggerReleaseTimer = undefined;
      }
      selectionTriggerPressed = false;
      if (flashTimer !== undefined) {
        clearTimeout(flashTimer);
        flashTimer = undefined;
      }
      root.removeEventListener("click", handleRootClick, true);
      root.removeEventListener("pointerover", handlePointerOver);
      root.removeEventListener("pointerleave", handlePointerLeave);
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);
      doc.removeEventListener("selectionchange", handleSelectionChange);
      doc.removeEventListener("keydown", handleGlobalKeydown);
      doc.removeEventListener("mouseup", handleSelectionTriggerPointerRelease);
      doc.removeEventListener("pointerup", handleSelectionTriggerPointerRelease);
      doc.removeEventListener("pointercancel", handleSelectionTriggerPointerRelease);
    };
  });

  // Focus the first item on cluster popover open and handle Escape directly on the popover
  // so Escape closes the popover only and restores focus to the invoker pin.
  $effect(() => {
    const node = clusterPopoverEl;
    if (!node) return;
    const firstItem = node.querySelector<HTMLElement>(".st-review-layer__cluster-item");
    (firstItem ?? node).focus();
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        const invoker = clusterInvoker;
        openClusterId = null;
        clusterInvoker = null;
        invoker?.focus();
      }
    };
    node.addEventListener("keydown", onKeydown);
    return () => node.removeEventListener("keydown", onKeydown);
  });

  // Modal exit alertdialog: move focus inside on open, trap Tab/Shift+Tab, and wire Escape
  // to Keep editing so Escape closes ONLY the topmost alertdialog layer.
  $effect(() => {
    const node = confirmDialogEl;
    if (!confirmDiscardOpen || !node) return;
    const doc = node.ownerDocument;
    const focusables = getFocusableElements(node);
    (focusables[0] ?? node).focus();

    const onDialogKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        handleKeepEditing();
        return;
      }
      if (event.key === "Tab") {
        event.stopPropagation();
        handleFocusTrapKeydown(event, node);
      }
    };
    const onDocumentKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        handleKeepEditing();
      } else if (event.key === "Tab" && !node.contains(doc.activeElement)) {
        event.stopPropagation();
        handleFocusTrapKeydown(event, node);
      }
    };
    node.addEventListener("keydown", onDialogKeydown);
    doc.addEventListener("keydown", onDocumentKeydown);
    return () => {
      node.removeEventListener("keydown", onDialogKeydown);
      doc.removeEventListener("keydown", onDocumentKeydown);
    };
  });

  function clearTransientState() {
    hoverBox = null;
    flashBox = null;
    pendingSelection = null;
    selectionTriggerPressed = false;
    if (selectionTriggerReleaseTimer !== undefined) {
      clearTimeout(selectionTriggerReleaseTimer);
      selectionTriggerReleaseTimer = undefined;
    }
    composerSession = null;
    draftBody = "";
    openClusterId = null;
    confirmDiscardOpen = false;
  }

  function openComposerForAnchor(
    anchor: AnchorPayload,
    invoker: HTMLElement | null,
    top: number,
    left: number,
  ) {
    const encoded = tryEncodeAnchor(anchor);
    draftBody = "";
    composerSession = encoded.ok
      ? {
          anchor: encoded.payload,
          sectionKey: encoded.sectionKey,
          error: null,
          top,
          left,
          invoker,
        }
      : {
          anchor,
          sectionKey: null,
          error: encoded.message,
          top,
          left,
          invoker,
        };
  }

  function handleSelectionTriggerPointerDown(event: PointerEvent | MouseEvent) {
    event.preventDefault();
    selectionTriggerPressed = true;
    if (selectionTriggerReleaseTimer !== undefined) {
      clearTimeout(selectionTriggerReleaseTimer);
      selectionTriggerReleaseTimer = undefined;
    }
  }

  function handleSelectionTriggerFocusOut(event: FocusEvent) {
    if (selectionTriggerPressed) return;
    const related = event.relatedTarget as Node | null;
    if (related && selectionTriggerEl?.contains(related)) return;
    const root = effectiveRoot;
    if (!root) {
      pendingSelection = null;
      return;
    }
    const selection = root.ownerDocument.defaultView?.getSelection();
    if (
      !selection ||
      selection.rangeCount === 0 ||
      selection.getRangeAt(0).collapsed ||
      !root.contains(selection.getRangeAt(0).commonAncestorContainer)
    ) {
      pendingSelection = null;
    }
  }

  function handleSelectionTriggerClick(event: MouseEvent) {
    selectionTriggerPressed = false;
    if (selectionTriggerReleaseTimer !== undefined) {
      clearTimeout(selectionTriggerReleaseTimer);
      selectionTriggerReleaseTimer = undefined;
    }
    if (!pendingSelection) return;
    const { anchor, top, left } = pendingSelection;
    pendingSelection = null;
    openComposerForAnchor(anchor, event.currentTarget as HTMLElement | null, top, left);
  }

  function restoreFocusFallback(preferred: HTMLElement | null) {
    if (preferred?.isConnected && preferred.tabIndex >= 0) {
      preferred.focus();
      return;
    }
    layerEl?.focus();
  }

  async function handleComposerSubmit(body: string) {
    const session = composerSession;
    if (!session || session.sectionKey === null) {
      throw new Error(session?.error ?? "Unable to encode anchor for this selection.");
    }
    const createdSectionKey = session.sectionKey;
    const invoker = session.invoker;
    const fullTarget: CommentTarget = {
      kind: target.kind,
      id: target.id,
      sectionKey: createdSectionKey,
    };
    await onCreate?.({
      target: fullTarget,
      sectionKey: createdSectionKey,
      body,
    });
    composerSession = null;
    draftBody = "";
    liveAnnouncement = "Comment thread created.";

    // Preserve focus after submit: keep any host-assigned focus (e.g. ThreadPanel heading),
    // otherwise focus the newly rendered pin or restore focus to the invoker/layer.
    await tick();
    const doc = layerEl?.ownerDocument ?? (typeof document !== "undefined" ? document : null);
    const active = doc?.activeElement ?? null;
    if (active === null || active === doc?.body) {
      const matchingPin = overlayEl?.querySelector<HTMLElement>(
        `.st-review-layer__pins [data-pin-section-key="${createdSectionKey.replace(/"/g, '\\"')}"] button.st-review-pin`,
      );
      if (matchingPin) {
        matchingPin.focus();
      } else {
        restoreFocusFallback(invoker);
      }
    }
  }

  function handleComposerCancel() {
    const invoker = composerSession?.invoker ?? null;
    composerSession = null;
    draftBody = "";
    void tick().then(() => {
      restoreFocusFallback(invoker);
    });
  }

  function activateEntry(entry: ResolvedEntry) {
    openClusterId = null;
    onSelect?.(entry.thread.threadId);
    onMarkRead?.(entry.thread.threadId);
    if (typeof (entry.element as HTMLElement).scrollIntoView === "function") {
      (entry.element as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    }
    flashBox = entry.box;
    if (flashTimer !== undefined) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      flashBox = null;
      flashTimer = undefined;
    }, 900);
  }

  function handleClusterPinActivate(cluster: PinCluster, event?: MouseEvent) {
    if (cluster.entries.length === 1) {
      activateEntry(cluster.entries[0]!);
      return;
    }
    if (openClusterId === cluster.id) {
      openClusterId = null;
    } else {
      clusterInvoker = (event?.currentTarget as HTMLElement | null) ?? null;
      openClusterId = cluster.id;
    }
  }

  function handleKeepEditing() {
    const returnTarget = confirmReturnFocus;
    confirmDiscardOpen = false;
    onModeChange?.("review");
    void tick().then(() => {
      if (mode !== "review") {
        confirmReturnFocus = null;
        restoreFocusFallback(returnTarget);
      }
    });
  }

  function handleDiscardDraft() {
    const returnTarget = confirmReturnFocus ?? composerSession?.invoker ?? null;
    confirmReturnFocus = null;
    clearTransientState();
    void tick().then(() => {
      restoreFocusFallback(returnTarget);
    });
  }

  const classes = $derived(
    ["st-review-layer", `st-review-layer--${mode}`, className].filter(Boolean).join(" "),
  );
</script>

<div {...rest} bind:this={layerEl} class={classes} data-review-mode={mode} tabindex="-1">
  {#if children}
    <div bind:this={slotHostEl} class="st-review-layer__content">
      {@render children()}
    </div>
  {/if}

  <div
    bind:this={overlayEl}
    class="st-review-layer__overlay"
    data-review-overlay="true"
    style:top={resolution.overlayBox ? `${resolution.overlayBox.top}px` : undefined}
    style:left={resolution.overlayBox ? `${resolution.overlayBox.left}px` : undefined}
    style:width={resolution.overlayBox ? `${resolution.overlayBox.width}px` : undefined}
    style:height={resolution.overlayBox ? `${resolution.overlayBox.height}px` : undefined}
  >
    {#if mode === "review"}
      {#if hoverBox}
        <div
          class="st-review-layer__hover-outline"
          aria-hidden="true"
          style:top={`${hoverBox.top}px`}
          style:left={`${hoverBox.left}px`}
          style:width={`${hoverBox.width}px`}
          style:height={`${hoverBox.height}px`}
        ></div>
      {/if}

      {#if flashBox}
        <div
          class="st-review-layer__flash"
          aria-hidden="true"
          style:top={`${flashBox.top}px`}
          style:left={`${flashBox.left}px`}
          style:width={`${flashBox.width}px`}
          style:height={`${flashBox.height}px`}
        ></div>
      {/if}

      <div class="st-review-layer__pins" role="group" aria-label="Comment pins">
        {#each clusters as cluster (cluster.id)}
          <div
            class="st-review-layer__pin-anchor"
            data-pin-section-key={cluster.entries[0]?.thread.sectionKey ?? undefined}
            style:top={`${cluster.box.top}px`}
            style:left={`${cluster.box.left + cluster.box.width}px`}
          >
            <CommentPin
              index={cluster.primaryIndex}
              count={cluster.totalComments}
              unread={cluster.unreadCount > 0}
              resolved={cluster.allResolved}
              active={cluster.anyActive}
              label={cluster.ariaLabel}
              variant={cluster.variant}
              onclick={(event) => handleClusterPinActivate(cluster, event)}
            />
          </div>
        {/each}
      </div>

      {#if gutterPins.length > 0}
        <div class="st-review-layer__gutter" aria-hidden="false">
          {#each gutterPins as item (item.cluster.id)}
            <div
              class="st-review-layer__gutter-pin"
              style:top={`${item.positioned.y}px`}
            >
              <CommentPin
                index={item.cluster.primaryIndex}
                count={item.cluster.totalComments}
                unread={item.cluster.unreadCount > 0}
                resolved={item.cluster.allResolved}
                active={item.cluster.anyActive}
                label={item.cluster.ariaLabel}
                variant="margin"
                tabindex={-1}
                onclick={(event) => handleClusterPinActivate(item.cluster, event)}
              />
            </div>
          {/each}
        </div>
      {/if}

      {#if openCluster}
        <div
          bind:this={clusterPopoverEl}
          class="st-review-layer__cluster-popover"
          role="dialog"
          aria-label="Clustered comment threads"
          tabindex="-1"
          style:top={`${openCluster.box.top + 28}px`}
          style:left={`${Math.max(0, openCluster.box.left)}px`}
        >
          <ul class="st-review-layer__cluster-list">
            {#each openCluster.entries as entry (entry.thread.threadId)}
              {@const preview = entry.thread.comments[0]?.body ?? ""}
              {@const threadUnread = isUnread(entry.thread, currentUser, readState)}
              <li>
                <button
                  type="button"
                  class="st-review-layer__cluster-item"
                  data-unread={threadUnread ? "true" : "false"}
                  onclick={() => activateEntry(entry)}
                >
                  <span class="st-review-layer__cluster-index">#{entry.index}</span>
                  <span class="st-review-layer__cluster-preview">{preview}</span>
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if pendingSelection && !composerSession}
        <div
          bind:this={selectionTriggerEl}
          class="st-review-layer__selection-trigger"
          style:top={`${pendingSelection.top}px`}
          style:left={`${pendingSelection.left}px`}
        >
          <Button
            type="button"
            variant="primary"
            size="sm"
            onpointerdown={handleSelectionTriggerPointerDown}
            onmousedown={handleSelectionTriggerPointerDown}
            onfocusout={handleSelectionTriggerFocusOut}
            onclick={handleSelectionTriggerClick}
          >
            Add comment
          </Button>
        </div>
      {/if}

      {#if composerSession}
        <div
          class="st-review-layer__composer"
          role="dialog"
          aria-label="Add comment"
          style:top={`${composerSession.top}px`}
          style:left={`${composerSession.left}px`}
        >
          {#if composer}
            {@render composer({
              anchor: composerSession.anchor,
              sectionKey: composerSession.sectionKey,
              error: composerSession.error,
              submit: handleComposerSubmit,
              cancel: handleComposerCancel,
            })}
          {:else}
            <CommentComposer
              author={currentUser}
              initialBody={draftBody}
              quotePreview={formatAnchorLabel(composerSession.anchor, 140)}
              anchorError={composerSession.error}
              autofocus={true}
              trapFocus={true}
              onSubmit={handleComposerSubmit}
              onCancel={handleComposerCancel}
              onDraftChange={(next) => {
                draftBody = next;
              }}
            />
          {/if}
        </div>
      {/if}
    {/if}

    {#if confirmDiscardOpen}
      <div
        bind:this={confirmDialogEl}
        class="st-review-layer__confirm"
        role="alertdialog"
        aria-modal="true"
        aria-label="Discard unsaved comment draft"
        tabindex="-1"
      >
        <p class="st-review-layer__confirm-text">
          You have an unsaved comment draft. Discard it and exit review mode?
        </p>
        <div class="st-review-layer__confirm-actions">
          <Button type="button" variant="secondary" size="sm" onclick={handleKeepEditing}>
            Keep editing
          </Button>
          <Button type="button" variant="danger" size="sm" onclick={handleDiscardDraft}>
            Discard draft
          </Button>
        </div>
      </div>
    {/if}

    <div class="st-review-layer__sr-live" aria-live="polite" aria-atomic="true">
      {liveAnnouncement}
    </div>
  </div>
</div>

<style>
  .st-review-layer {
    position: relative;
  }

  .st-review-layer__content {
    position: relative;
  }

  .st-review-layer__overlay {
    left: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    z-index: var(--st-component-review-layer-zIndex, 40);
  }

  .st-review-layer__hover-outline {
    border: 1.5px dashed
      var(--st-component-review-hoverOutline, var(--st-semantic-border-interactive, #2563eb));
    border-radius: var(--st-radius-sm, 0.375rem);
    box-sizing: border-box;
    pointer-events: none;
    position: absolute;
  }

  .st-review-layer__flash {
    background: color-mix(
      in srgb,
      var(--st-component-review-flash, var(--st-semantic-feedback-info, #2563eb)) 18%,
      transparent
    );
    border: 2px solid var(--st-semantic-border-interactive, #2563eb);
    border-radius: var(--st-radius-sm, 0.375rem);
    box-sizing: border-box;
    pointer-events: none;
    position: absolute;
    animation: st-review-flash 900ms ease-out forwards;
  }

  @keyframes st-review-flash {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .st-review-layer__flash {
      animation: none;
    }
  }

  .st-review-layer__pins {
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  .st-review-layer__pin-anchor {
    pointer-events: auto;
    position: absolute;
    transform: translate(-50%, -25%);
  }

  .st-review-layer__gutter {
    bottom: 0;
    pointer-events: none;
    position: absolute;
    right: calc(-1 * var(--st-component-review-gutter-offset, 2.5rem));
    top: 0;
    width: var(--st-component-review-gutter-width, 2rem);
  }

  .st-review-layer__gutter-pin {
    pointer-events: auto;
    position: absolute;
    right: 0;
  }

  @media (max-width: 47.999rem) {
    .st-review-layer__gutter {
      display: none;
    }
  }

  .st-review-layer__cluster-popover {
    background: var(--st-semantic-surface-raised, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
    box-shadow: 0 12px 32px rgb(15 23 42 / 0.16);
    max-width: 20rem;
    padding: var(--st-spacing-2, 0.5rem);
    pointer-events: auto;
    position: absolute;
    z-index: 60;
  }

  .st-review-layer__cluster-list {
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-review-layer__cluster-item {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: flex;
    font: inherit;
    font-size: 0.8125rem;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-2, 0.5rem);
    text-align: start;
    width: 100%;
  }

  .st-review-layer__cluster-item:hover {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
  }

  .st-review-layer__cluster-item:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, #2563eb);
    outline-offset: 1px;
  }

  .st-review-layer__cluster-index {
    color: var(--st-semantic-text-secondary);
    font-weight: 700;
  }

  .st-review-layer__cluster-preview {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-review-layer__selection-trigger {
    pointer-events: auto;
    position: absolute;
    transform: translateY(0.25rem);
    z-index: 65;
  }

  .st-review-layer__composer {
    max-width: min(24rem, 92vw);
    min-width: 18rem;
    pointer-events: auto;
    position: absolute;
    z-index: 70;
  }

  .st-review-layer__confirm {
    background: var(--st-semantic-surface-raised, #ffffff);
    border: 1px solid var(--st-semantic-border-strong, #cbd5e1);
    border-radius: var(--st-radius-md, 0.5rem);
    box-shadow: 0 18px 40px rgb(15 23 42 / 0.2);
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    left: 50%;
    max-width: 24rem;
    padding: var(--st-spacing-4, 1rem);
    pointer-events: auto;
    position: fixed;
    top: 20%;
    transform: translateX(-50%);
    z-index: 100;
  }

  .st-review-layer__confirm-text {
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
    margin: 0;
  }

  .st-review-layer__confirm-actions {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: flex-end;
  }

  .st-review-layer__sr-live {
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  :global(::highlight(st-review-text)) {
    background-color: var(
      --st-component-review-highlight-background,
      rgb(250 204 21 / 0.35)
    );
  }

  :global(::highlight(st-review-text-active)) {
    background-color: var(
      --st-component-review-highlight-activeBackground,
      rgb(37 99 235 / 0.25)
    );
  }

  :global(::highlight(st-review-text-resolved)) {
    background-color: var(
      --st-component-review-highlight-resolvedBackground,
      rgb(21 128 61 / 0.16)
    );
  }
</style>
