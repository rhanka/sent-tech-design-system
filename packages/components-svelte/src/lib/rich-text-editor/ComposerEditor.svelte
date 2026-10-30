<script lang="ts">
  import { onMount, tick, untrack } from "svelte";
  import { createRichTextEditor } from "@sentropic/design-system-rich-text/editor";
  import type { RichTextEditor as CoreEditor } from "@sentropic/design-system-rich-text/editor";
  import type {
    ComposerCaptureResult,
    ComposerEditorProps as ComposerContract,
    ComposerKeyEvent,
    RichTextDocument,
    RichTextMessages,
    RichTextReadiness,
  } from "@sentropic/design-system-rich-text";
  import {
    RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE,
    composerDocumentFromText,
    composerFullSeededDocumentForText,
    composerFullSeededDocumentFromText,
    composerFullSeededTextFromDocument,
    composerTextFromDocument,
    createCaptureUnavailableError,
    formatUntranslatedMarker,
    splitComposerText,
    untranslatedDataValue,
  } from "@sentropic/design-system-rich-text";
  import type { RichTextMessageKey } from "@sentropic/design-system-rich-text";

  /** Svelte props for the §6.2.1 string surface: the contract plus the
      identity injection point and a class passthrough. The `profile` prop
      selects the conversion path (R-FULL-PROFILE-1): `p0` (default) keeps
      the chunk mapping; `full` parses through the full Markdown bridge. */
  export interface ComposerEditorProps extends ComposerContract {
    allocateId?: () => string;
    class?: string;
  }

  let {
    value,
    profile = "p0",
    editable = true,
    disabled = false,
    messages,
    placeholder,
    allocateId,
    class: className = "",
    onChange,
    onReadinessChange,
    onKeyDown,
  }: ComposerEditorProps = $props();

  let root: HTMLDivElement | undefined;
  let mountEl: HTMLDivElement | undefined;
  let core: CoreEditor | null = null;
  let lastSeenValue: string | undefined;
  let localSequence = 0;

  /** Mount-local fallback allocator (non-Focus default): identities stay
      internal to the composer and never reach the chat host. */
  function freshId(): string {
    if (allocateId !== undefined) return allocateId();
    localSequence += 1;
    return `composer:generated-${localSequence}`;
  }

  /** Full-profile conversion seeds (review 1 item 10): untouched source
      slice per block identity, retained across mount, edits and host
      replacements so untouched slices re-emit byte-identically. Gesture
      `affectedParagraphIds` mark the touched set; a host replacement
      re-parses and resets both. P0 keeps the chunk mapping (no seeds). */
  let fullSeeds: Map<string, string> = new Map();
  let fullTouched: Set<string> = new Set();

  /** Controlled string → document with positional identity reuse: the
      chunk at an index the displayed document already holds keeps that
      block's identity, so a host echo of the last emitted string decides
      as §5.6 rule 1 (acknowledge, no conflict) instead of a spurious
      session conflict. */
  function textFromDocument(document: RichTextDocument): string {
    return profile === "full"
      ? composerFullSeededTextFromDocument(document, fullSeeds, fullTouched)
      : composerTextFromDocument(document);
  }

  function documentForText(text: string): RichTextDocument {
    if (profile === "full") {
      const previous = core?.getDocument()?.blocks ?? [];
      const seeded = composerFullSeededDocumentForText(text, previous, freshId);
      fullSeeds = seeded.seeds;
      fullTouched = new Set();
      return seeded.document;
    }
    const chunks = splitComposerText(text);
    const previous = core?.getDocument()?.blocks ?? [];
    return {
      format: "focus.markdown.p0@1",
      blocks: chunks.map((chunk, index) => {
        const prior = previous[index];
        return {
          paragraphId:
            prior !== undefined && prior.kind === "paragraph"
              ? prior.paragraphId
              : freshId(),
          kind: "paragraph" as const,
          text: chunk,
        };
      }),
    };
  }

  function mountDocumentForText(text: string): RichTextDocument {
    if (profile === "full") {
      const seeded = composerFullSeededDocumentFromText(text, freshId);
      fullSeeds = seeded.seeds;
      fullTouched = new Set();
      return seeded.document;
    }
    return composerDocumentFromText(text, freshId);
  }

  function isActive(): boolean {
    return editable && !disabled;
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

  function syncChrome(): void {
    const view = core?.view;
    if (!view || !root) return;
    const dom = view.dom;
    const editorLabel = resolveLabel("editorLabel");
    dom.setAttribute("role", "textbox");
    dom.setAttribute("aria-multiline", "true");
    dom.setAttribute("aria-label", editorLabel);
    markUntranslated(dom, "editorLabel");
    dom.setAttribute("aria-disabled", disabled ? "true" : "false");
    dom.setAttribute("tabindex", disabled ? "-1" : "0");
    core?.setPlaceholder(
      placeholder ?? resolveLabel("placeholder"),
      placeholder !== undefined
        ? null
        : isMissing("placeholder")
          ? untranslatedDataValue("placeholder")
          : null,
    );
  }

  /** Deferred composer capture (R-COMP-2): the string and the
      representability of the same captured revision. During an IME
      composition it waits for the commit and resolves once; a capture
      pending at unmount rejects exactly once with
      `RichTextCaptureUnavailable` (IME-LOCK-1 clause 4). */
  export function captureComposer(): Promise<ComposerCaptureResult> {
    if (!core) return Promise.reject(createCaptureUnavailableError());
    return core.captureDocument().then((captured) => ({
      text: textFromDocument(captured.document),
      representability: captured.representability,
    }));
  }

  export function readiness(): RichTextReadiness {
    if (!core) return { composing: false, ready: false };
    return core.readiness();
  }

  function toComposerKeyEvent(native: KeyboardEvent): ComposerKeyEvent {
    const active = core;
    return {
      key: native.key,
      code: native.code,
      shiftKey: native.shiftKey,
      ctrlKey: native.ctrlKey,
      metaKey: native.metaKey,
      altKey: native.altKey,
      isComposing: native.isComposing || (active?.readiness().composing ?? false),
      preventDefault: () => native.preventDefault(),
      stopPropagation: () => native.stopPropagation(),
      get defaultPrevented() {
        return native.defaultPrevented;
      },
    };
  }

  // Sending-adjacent keys (Enter, mention triggers, any key while the host
  // subscribes) are forwarded with modifiers and composition facts, never
  // consumed for sending by the DS (R-COMP-3). Capture phase on the root so
  // a host-handled key reaches `preventDefault()` before ProseMirror's own
  // target handler; ProseMirror skips default-prevented keys, so a handled
  // Enter inserts no newline. Forwarded during composition as well, flagged
  // `isComposing`; an inert surface forwards nothing.
  function forwardKey(native: KeyboardEvent): void {
    if (!onKeyDown || !core) return;
    if (!isActive()) return;
    if (!(native.target instanceof Node)) return;
    if (!mountEl?.contains(native.target)) return;
    const forwarded = toComposerKeyEvent(native);
    const result = onKeyDown(forwarded);
    if (result === true || forwarded.defaultPrevented) {
      native.preventDefault();
    }
  }

  const stopAtBoundary = (event: Event): void => {
    event.stopPropagation();
  };
  const stopTypes = ["click", "mousedown", "mouseup", "keydown", "keyup"];

  onMount(() => {
    const mountTarget = mountEl;
    const host = root;
    if (!mountTarget || !host) return;
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
    lastSeenValue = value;
    let cancelled = false;
    const settle = (instance: CoreEditor): void => {
      if (cancelled) {
        instance.destroy();
        return;
      }
      core = instance;
      host.addEventListener("keydown", forwardKey, true);
      for (const type of stopTypes) {
        host.addEventListener(type, stopAtBoundary);
      }
      host.addEventListener("mousedown", guardDisabledPointer);
      host.addEventListener("focus", guardDisabledFocus, true);
      syncChrome();
      void tick().then(() => {
        syncChrome();
      });
    };
    // Single-prop opt-in (R-FULL-PROFILE-1): full construction loads the
    // extension graph on demand and is asynchronous, P0 stays synchronous.
    // The pending gap is absorbed by the existing mount-pending path
    // (`readiness()` reports not-ready and `captureComposer()` rejects
    // while `core` is null).
    const maybeCore = createRichTextEditor({
      document: mountDocumentForText(value),
      profile,
      messages: {
        ...messages,
        placeholder: provided("placeholder") ?? formatUntranslatedMarker("placeholder"),
      },
      ...(allocateId !== undefined ? { allocateId } : {}),
      editable,
      disabled,
      element: mountTarget,
      onChange: (event) => {
        syncChrome();
        // Host-owned string discipline: the emitted string is adopted for
        // revision tracking (rule-1 echo, emits nothing), so the host's next
        // distinct value — send-clear, edit cancel, external replacement —
        // applies cleanly instead of raising a spurious session conflict.
        // Capture never sets or clears this flag; only this adoption does.
        // Full seeds: the gesture's affected identities lose their source
        // slice (they serialize canonically from here on); untouched
        // identities keep re-emitting their seed bytes.
        const instance = core;
        if (instance) {
          instance.applyExternalUpdate(event.document);
        }
        if (profile === "full") {
          for (const identity of event.gesture.affectedParagraphIds) {
            fullTouched.add(identity);
            fullSeeds.delete(identity);
          }
        }
        onChange?.(textFromDocument(event.document));
      },
      onReadinessChange: (event) => {
        onReadinessChange?.(event);
      },
    }) as CoreEditor | Promise<CoreEditor>;
    if (maybeCore instanceof Promise) {
      void maybeCore.then(settle, () => {
        // A failed full-graph load leaves the surface unmounted; the host
        // observes it through the pending readiness path (never a throw
        // out of the mount effect).
      });
    } else {
      settle(maybeCore);
    }
    return () => {
      cancelled = true;
      host.removeEventListener("keydown", forwardKey, true);
      for (const type of stopTypes) {
        host.removeEventListener(type, stopAtBoundary);
      }
      host.removeEventListener("mousedown", guardDisabledPointer);
      host.removeEventListener("focus", guardDisabledFocus, true);
      core?.destroy();
      core = null;
    };
  });

  // Controlled string (host-owned): an echo of the displayed text applies
  // nothing; any distinct host value replaces the draft. A replacement
  // arriving mid-composition is deferred by the core and re-evaluated once
  // after the commit (IME-LOCK-1 clause 1). Never recreates the editor.
  $effect(() => {
    const snapshot = value;
    const instance = core;
    if (!instance) {
      lastSeenValue = snapshot;
      return;
    }
    if (snapshot === lastSeenValue) {
      return;
    }
    lastSeenValue = snapshot;
    untrack(() => {
      if (textFromDocument(instance.getDocument()) === snapshot) {
        return;
      }
      instance.applyExternalUpdate(documentForText(snapshot));
      syncChrome();
    });
  });

  $effect(() => {
    core?.setEditable(editable);
    core?.setDisabled(disabled);
    if (
      disabled &&
      typeof globalThis.document !== "undefined" &&
      root?.contains(globalThis.document.activeElement as Node | null)
    ) {
      (globalThis.document.activeElement as HTMLElement).blur();
    }
  });

  $effect(() => {
    if (!core) return;
    syncChrome();
  });

  const classes = (): string =>
    ["st-rich-text-editor", "st-composer-editor", className]
      .filter((part) => part !== "")
      .join(" ");
</script>

<div class={classes()} bind:this={root}>
  <div class="st-rich-text-editor__surface" bind:this={mountEl}></div>
</div>
