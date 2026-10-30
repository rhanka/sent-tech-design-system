<script lang="ts">
  import { onMount, tick, untrack } from "svelte";
  import { createRichTextEditor } from "@sentropic/design-system-rich-text/editor";
  import type { RichTextEditor as CoreEditor } from "@sentropic/design-system-rich-text/editor";
  import type {
    CollaborationActor,
    CollaborationCapabilities,
    CollaborationProvider,
    FieldBindingIdentity,
    LockSnapshot,
    PresenceSnapshot,
    RichTextCaptureResult,
    RichTextChangeEvent,
    RichTextDocument,
    RichTextEditorHandle,
    RichTextExternalConflictEvent,
    RichTextMessages,
    RichTextReadiness,
    RichTextUnsupportedPasteEvent,
  } from "@sentropic/design-system-rich-text";
  import {
    RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE,
    computeEffectiveEditable,
    createCaptureUnavailableError,
    formatCollabUntranslatedMarker,
    formatUntranslatedMarker,
    collabUntranslatedDataValue,
    untranslatedDataValue,
  } from "@sentropic/design-system-rich-text";
  import type {
    CollabMessageKey,
    RichTextMessageKey,
  } from "@sentropic/design-system-rich-text";

  export interface RichTextEditorProps {
    value: RichTextDocument;
    /** Content profile (R-FULL-PROFILE-1): `p0` (default) or the CL-2F
        `full` profile. `full` requires `value.format` to be
        `ds.markdown.full@1`; a mismatch refuses the mount. */
    profile?: "p0" | "full";
    editable?: boolean;
    disabled?: boolean;
    messages: RichTextMessages;
    allocateId?: () => string;
    class?: string;
    onChange?: (event: RichTextChangeEvent) => void;
    onExternalConflict?: (event: RichTextExternalConflictEvent) => void;
    onUnsupportedPaste?: (event: RichTextUnsupportedPasteEvent) => void;
    onReadinessChange?: (event: RichTextReadiness) => void;
    // ── CL-2 live extension (spec §6.2; the binding source arrives with the
    // CL-3 Yjs binding, which resolves sessions against `binding`) ──
    /** Injected collaboration provider. Accepted beside the editor; no
        provider call happens in CL-2. Absent ⇒ controlled mode. */
    provider?: CollaborationProvider | null;
    /** Full binding identity of the live field, if any. Present ⇒ live
        (L2) surface: admission decides, the L0 lock snapshot below stays
        information only and never drives `editable` (R-API-2). */
    binding?: FieldBindingIdentity | null;
    /** The local actor for this binding. */
    actor?: CollaborationActor | null;
    /** L0 lock snapshot. Drives inertness only on controlled surfaces
        (holder held by another actor ⇒ read-only); information only when
        `binding` is present. An expired lock is passed as `null`. */
    lock?: LockSnapshot | null;
    /** Co-viewer presence snapshot (host-authoritative). */
    presence?: PresenceSnapshot | null;
    /** Badge derivation facts (B2 §5.1). */
    capabilities?: CollaborationCapabilities | null;
    onPresenceChange?: (snapshot: PresenceSnapshot) => void;
    onLockChange?: (snapshot: LockSnapshot) => void;
    /** Request-unlock action for the composition seam (§6.4). */
    onRequestUnlock?: () => void;
  }

  let {
    value,
    profile = "p0",
    editable = true,
    disabled = false,
    messages,
    allocateId,
    class: className = "",
    onChange,
    onExternalConflict,
    onUnsupportedPaste,
    onReadinessChange,
    provider = null,
    binding = null,
    actor = null,
    lock = null,
    presence = null,
    capabilities = null,
    onPresenceChange,
    onLockChange,
    onRequestUnlock,
  }: RichTextEditorProps = $props();

  let root: HTMLDivElement | undefined;
  let mountEl: HTMLDivElement | undefined;
  let core = $state<CoreEditor | null>(null);
  // In-flight full mount (review 3 blocking 1): `createRichTextEditor`
  // stays synchronous for P0 and asynchronous for `profile: "full"`. While
  // pending, prop updates are recorded by the value/editable effects and
  // `captureDocument()` awaits the mount instead of rejecting.
  let pendingCore: Promise<CoreEditor | null> | null = null;
  // Last `value` handed to the §5.6 decision, as a reference plus a snapshot
  // of the significant document fields. A host that re-passes the identical
  // reference (coarse prop update, unrelated re-render) supplies no new
  // value, so re-evaluating it must not replay the decision: replaying the
  // unchanged value would falsely acknowledge a silent draft or raise a
  // spurious conflict. A host `$state` mutation of a nested field
  // (`value.blocks[0].text`) without replacing the reference still changes
  // the snapshot, so it reaches the decision (or the conflict path).
  let lastSeenValue: RichTextDocument | undefined;
  let lastSeenFingerprint: string | undefined;

  /** Significant document fields for the §5.6 decision (equality of §5.6,
      emission granularity of §5.3): `format` plus, per block in order,
      `paragraphId`, `kind`, P0 text/raw/kind fields and the full
      metadata/segments shapes. Read reactively (outside `untrack`) so
      nested host mutations subscribe. */
  function fingerprintOf(document: RichTextDocument): string {
    const parts: string[] = [document.format, String(document.blocks.length)];
    for (const block of document.blocks) {
      parts.push(
        block.paragraphId,
        block.kind,
        block.text ?? "",
        block.raw ?? "",
        block.preservedKind ?? "",
        JSON.stringify(block.metadata ?? null),
        JSON.stringify(block.segments ?? null),
        JSON.stringify(block.hrMetadata ?? null),
      );
    }
    parts.push(JSON.stringify(document.retainedRunMetadata ?? null));
    return JSON.stringify(parts);
  }

  function provided(key: RichTextMessageKey): string | undefined {
    const candidate: unknown = messages?.[key];
    return typeof candidate === "string" ? candidate : undefined;
  }

  function resolveLabel(key: RichTextMessageKey): string {
    return provided(key) ?? formatUntranslatedMarker(key);
  }

  function isMissing(key: RichTextMessageKey): boolean {
    return provided(key) === undefined;
  }

  function markUntranslated(element: Element, key: RichTextMessageKey): void {
    if (isMissing(key)) {
      element.setAttribute(
        RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE,
        untranslatedDataValue(key),
      );
    } else {
      element.removeAttribute(RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE);
    }
  }

  /** Apply the injected catalogue to the live DOM: the editable root keeps
      its accessible name, the actual placeholder paragraphs carry the
      placeholder text and its missing-key marker, and every preserved
      region keeps its label. Reads `messages`, `editable` and `disabled`
      only — never `value`. Never remounts. */
  function syncChrome(): void {
    const view = core?.view;
    if (!view || !root) return;
    const dom = view.dom;
    const editorLabel = resolveLabel("editorLabel");
    dom.setAttribute("role", "textbox");
    dom.setAttribute("aria-multiline", "true");
    dom.setAttribute("aria-label", editorLabel);
    markUntranslated(dom, "editorLabel");
    // Distinct read-only and disabled semantics (§5.4): disabled is
    // exposed, removed from the tab order and non-selectable (see the
    // stylesheet); read-only stays focusable with its caret.
    dom.setAttribute("aria-disabled", disabled ? "true" : "false");
    dom.setAttribute("tabindex", disabled ? "-1" : "0");
    // Reactive placeholder (§5.7): the live decoration text follows the
    // catalogue through the core (`setPlaceholder` refreshes the
    // decorations with no document transaction), so a locale switch
    // re-renders with no change event. Both the text and the missing-key
    // marker are decoration-backed: manually set DOM attributes would not
    // survive the ProseMirror re-renders that replace the paragraph element.
    core?.setPlaceholder(
      resolveLabel("placeholder"),
      isMissing("placeholder")
        ? untranslatedDataValue("placeholder")
        : null,
    );
    const preservedTemplate = resolveLabel("preservedBlockLabel");
    const preservedMissing = isMissing("preservedBlockLabel");
    const regions = root.querySelectorAll("[data-preserved-block]");
    for (const region of regions) {
      const kind = region.getAttribute("data-preserved-block") ?? "";
      const text = preservedTemplate.includes("{kind}")
        ? preservedTemplate.replace("{kind}", kind)
        : preservedTemplate;
      region.setAttribute("aria-label", text);
      if (preservedMissing) {
        region.setAttribute(
          RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE,
          untranslatedDataValue("preservedBlockLabel"),
        );
      } else {
        region.removeAttribute(RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE);
      }
    }
  }

  /** R-API-2 effective editing fact (spec §6.2): exactly one host-computed
      fact per surface mode. A live `binding` keeps admitted editors editable
      under a locked-by-other L0 snapshot; without a binding the same
      snapshot makes the surface read-only. `disabled` wins everywhere. */
  const effectiveEditable = $derived(
    computeEffectiveEditable({
      binding,
      editable,
      lock,
      actorId: actor?.actorId ?? null,
      disabled,
    }),
  );

  /** Whether the L0 snapshot names an active hold (spec §6.4: an expired
      lock arrives as `null`, so any named holder counts as active here). */
  const lockActive = $derived(lock?.holder != null);

  /** The live composition seam renders beside the editor while CL-1B owns
      the full badge: lock/presence facts as injected text, never driving
      `editable` (R-API-2 display half). */
  const showLive = $derived(
    binding !== null || lock !== null || presence !== null,
  );

  function collabProvided(key: CollabMessageKey): string | undefined {
    const candidate: unknown = messages?.[key];
    return typeof candidate === "string" ? candidate : undefined;
  }

  function resolveCollabLabel(key: CollabMessageKey): string {
    return collabProvided(key) ?? formatCollabUntranslatedMarker(key);
  }

  function isCollabMissing(key: CollabMessageKey): boolean {
    return collabProvided(key) === undefined;
  }

  function presenceText(): string {
    const template = resolveCollabLabel("presenceLabel");
    const count = String(presence?.total ?? 0);
    return template.includes("{count}")
      ? template.replace("{count}", count)
      : template;
  }

  function lockText(): string {
    const holder = lock?.holder ?? null;
    if (holder === null) return resolveCollabLabel("noLockLabel");
    const template = resolveCollabLabel("lockLabel");
    return template.includes("{holder}")
      ? template.replace("{holder}", holder.displayLabel)
      : template;
  }

  /** Request-unlock is available only to a capable actor on an actively held
      lock while the surface itself stays editable (spec §6.4: read-only mode
      still shows the badge with request-unlock disabled). */
  const unlockEnabled = $derived(
    lockActive &&
      effectiveEditable &&
      (capabilities?.canRequestUnlock ?? false),
  );

  export function captureDocument(): Promise<RichTextCaptureResult> {
    if (core) return core.captureDocument();
    // Mount pending (review 3 blocking 1): await the in-flight full mount
    // and capture from the settled instance. Reject with the
    // capture-unavailable error only when unmounted or failed during mount.
    if (pendingCore !== null) {
      return pendingCore.then((instance) => {
        if (instance !== null && core !== null) return core.captureDocument();
        return Promise.reject(createCaptureUnavailableError());
      });
    }
    return Promise.reject(createCaptureUnavailableError());
  }

  export function readiness(): RichTextReadiness {
    if (!core) return { composing: false, ready: false };
    return core.readiness();
  }

  const stopAtBoundary = (event: Event): void => {
    event.stopPropagation();
  };
  const stopTypes = ["click", "mousedown", "mouseup", "keydown", "keyup"];

  onMount(() => {
    const mountTarget = mountEl;
    const host = root;
    if (!mountTarget || !host) return;
    // Disabled focus guard (§5.4: a disabled editor is not focusable).
    // `tabindex="-1"` removes sequential keyboard focus only: a pointer
    // click still moves focus through the mousedown default, and a
    // programmatic `focus()` still lands. While disabled, the mousedown
    // default is prevented and any focus landing inside is blurred back.
    const guardDisabledPointer = (event: Event): void => {
      if (!disabled) return;
      if (event.target instanceof Element && host.contains(event.target)) {
        event.preventDefault();
      }
    };
    const guardDisabledFocus = (event: Event): void => {
      if (!disabled) return;
      if (event.target instanceof HTMLElement && host.contains(event.target)) {
        event.target.blur();
      }
    };
    // Stable forwarders: the core captures its callbacks once, while the
    // props they read stay live, so a parent re-render never needs a remount.
    // The mount document initialises the core and the acknowledgement
    // reference, so it is recorded as seen without a §5.6 evaluation.
    // The mount snapshot below reconciles any prop flip that arrives while
    // the full graph loads (review 3 blocking 1).
    const mountValue = value;
    const mountFingerprint = fingerprintOf(value);
    lastSeenValue = value;
    lastSeenFingerprint = mountFingerprint;
    let cancelled = false;
    const settle = (instance: CoreEditor): void => {
      if (cancelled) {
        instance.destroy();
        return;
      }
      core = instance;
      for (const type of stopTypes) {
        host.addEventListener(type, stopAtBoundary);
      }
      host.addEventListener("mousedown", guardDisabledPointer);
      // `focus` does not bubble: capture from the host so a programmatic
      // `focus()` on the editable element is still observed.
      host.addEventListener("focus", guardDisabledFocus, true);
      // Reconcile prop updates that arrived while the full graph loaded:
      // the value effect recorded the latest host value while `core` was
      // null, so apply it now instead of leaving the mount value stale;
      // effective editability follows the current props, not the mount.
      instance.setEditable(effectiveEditable);
      instance.setDisabled(disabled);
      const current = value;
      const currentFingerprint = fingerprintOf(current);
      if (current !== mountValue || currentFingerprint !== mountFingerprint) {
        lastSeenValue = current;
        lastSeenFingerprint = currentFingerprint;
        untrack(() => {
          instance.applyExternalUpdate(current);
        });
      }
      syncChrome();
      // Placeholder decorations land after the ProseMirror observer flush,
      // past the synchronous mount sync: re-sync once settled so the
      // displaying paragraph carries the marker with no transaction.
      void tick().then(() => {
        syncChrome();
      });
    };
    // Single-prop opt-in (R-FULL-PROFILE-1): full construction loads the
    // extension graph on demand and is asynchronous, P0 stays synchronous.
    // The pending gap keeps `readiness()` not-ready while `core` is null;
    // `captureDocument()` awaits the pending mount (rejecting only when
    // unmounted or failed during mount).
    const maybeCore = createRichTextEditor({
      document: value,
      profile,
      messages: {
        ...messages,
        placeholder: provided("placeholder") ?? formatUntranslatedMarker("placeholder"),
      },
      ...(allocateId !== undefined ? { allocateId } : {}),
      editable: effectiveEditable,
      disabled,
      collaborationBinding: binding,
      element: mountTarget,
      onChange: (event) => {
        syncChrome();
        onChange?.(event);
      },
      onExternalConflict: (event) => {
        onExternalConflict?.(event);
      },
      onUnsupportedPaste: (event) => {
        onUnsupportedPaste?.(event);
      },
      onReadinessChange: (event) => {
        onReadinessChange?.(event);
      },
    }) as CoreEditor | Promise<CoreEditor>;
    if (maybeCore instanceof Promise) {
      pendingCore = maybeCore.then(
        (instance) => {
          settle(instance);
          return cancelled ? null : instance;
        },
        () => {
          // A failed full-graph load leaves the surface unmounted; the host
          // observes it through the pending readiness path (never a throw
          // out of the mount effect).
          return null;
        },
      );
    } else {
      pendingCore = null;
      settle(maybeCore);
    }
    return () => {
      cancelled = true;
      pendingCore = null;
      for (const type of stopTypes) {
        host.removeEventListener(type, stopAtBoundary);
      }
      host.removeEventListener("mousedown", guardDisabledPointer);
      host.removeEventListener("focus", guardDisabledFocus, true);
      core?.destroy();
      core = null;
    };
  });

  // Controlled value (§5.6): this effect tracks `value` by reference plus a
  // snapshot of its significant document fields, read reactively above the
  // `untrack` boundary. The update is applied inside `untrack` and chrome is
  // re-synced there too, so a locale switch (messages change, value
  // untouched) never replays the unchanged value through the §5.6 decision
  // — replaying would falsely acknowledge a silent draft or raise a
  // spurious conflict — while a nested host `$state` mutation of
  // `value.blocks[i]` with the reference kept still reaches the decision.
  // Never recreates the editor.
  $effect(() => {
    const snapshot = value;
    const fingerprint = fingerprintOf(snapshot);
    const instance = core;
    if (!instance) {
      lastSeenValue = snapshot;
      lastSeenFingerprint = fingerprint;
      return;
    }
    // Same reference and same significant fields: no new value, no §5.6
    // replay. The chrome effect below still tracks messages, editable
    // and disabled, so labels keep re-rendering on a locale switch.
    if (snapshot === lastSeenValue && fingerprint === lastSeenFingerprint) {
      return;
    }
    lastSeenValue = snapshot;
    lastSeenFingerprint = fingerprint;
    untrack(() => {
      instance.applyExternalUpdate(snapshot);
      syncChrome();
    });
  });

  $effect(() => {
    core?.setEditable(effectiveEditable);
    core?.setDisabled(disabled);
    // Entering the disabled state releases focus: a caret left inside the
    // editor when the host disables it must not stay there (§5.4).
    if (
      disabled &&
      typeof globalThis.document !== "undefined" &&
      root?.contains(globalThis.document.activeElement as Node | null)
    ) {
      (globalThis.document.activeElement as HTMLElement).blur();
    }
  });

  // Locale and state chrome: re-render labels in place, no remount, no
  // change event. Tracks `messages`, `editable` and `disabled` only —
  // never `value`.
  $effect(() => {
    if (!core) return;
    syncChrome();
  });

  // Snapshot subscriptions (CL-2 seam): the host owns the snapshots; the
  // component notifies on every new snapshot reference, including the
  // initial one. No provider call happens here; live subscription arrives
  // with the CL-3 binding.
  let lastNotifiedLock: LockSnapshot | null = null;
  let lastNotifiedPresence: PresenceSnapshot | null = null;
  $effect(() => {
    const snapshot = lock;
    if (snapshot !== lastNotifiedLock) {
      lastNotifiedLock = snapshot;
      if (snapshot !== null) {
        const callback = onLockChange;
        if (callback) untrack(() => callback(snapshot));
      }
    }
  });
  $effect(() => {
    const snapshot = presence;
    if (snapshot !== lastNotifiedPresence) {
      lastNotifiedPresence = snapshot;
      if (snapshot !== null) {
        const callback = onPresenceChange;
        if (callback) untrack(() => callback(snapshot));
      }
    }
  });

  const classes = (): string =>
    ["st-rich-text-editor", className].filter((part) => part !== "").join(" ");

  const statusText = (): string => resolveLabel("externalConflictLabel");

  const statusUntranslated = (): string | null =>
    isMissing("externalConflictLabel")
      ? untranslatedDataValue("externalConflictLabel")
      : null;
</script>

<div class={classes()} bind:this={root}>
  <div class="st-rich-text-editor__surface" bind:this={mountEl}></div>
  {#if showLive}
    <div class="st-rich-text-editor__live" data-testid="live-seam">
      <span
        class="st-rich-text-editor__presence"
        data-untranslated={isCollabMissing("presenceLabel")
          ? collabUntranslatedDataValue("presenceLabel")
          : null}
      >{presenceText()}</span>
      <span
        class="st-rich-text-editor__lock"
        data-untranslated={isCollabMissing(lock?.holder == null ? "noLockLabel" : "lockLabel")
          ? collabUntranslatedDataValue(lock?.holder == null ? "noLockLabel" : "lockLabel")
          : null}
      >{lockText()}</span>
      {#if capabilities?.canRequestUnlock}
        <button
          type="button"
          class="st-rich-text-editor__unlock"
          data-untranslated={isCollabMissing("unlockRequestLabel")
            ? collabUntranslatedDataValue("unlockRequestLabel")
            : null}
          disabled={!unlockEnabled}
          onclick={() => onRequestUnlock?.()}
        >{resolveCollabLabel("unlockRequestLabel")}</button>
      {/if}
    </div>
  {/if}
  <div
    class="st-rich-text-editor__status"
    data-untranslated={statusUntranslated()}
  >{statusText()}</div>
</div>
