<script lang="ts">
  import { onMount, tick, untrack } from "svelte";
  import { createRichTextEditor } from "@sentropic/design-system-rich-text/editor";
  import type { RichTextEditor as CoreEditor } from "@sentropic/design-system-rich-text/editor";
  import type {
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
    createCaptureUnavailableError,
    formatUntranslatedMarker,
    untranslatedDataValue,
  } from "@sentropic/design-system-rich-text";
  import type { RichTextMessageKey } from "@sentropic/design-system-rich-text";

  export interface RichTextEditorProps {
    value: RichTextDocument;
    editable?: boolean;
    disabled?: boolean;
    messages: RichTextMessages;
    allocateId?: () => string;
    class?: string;
    onChange?: (event: RichTextChangeEvent) => void;
    onExternalConflict?: (event: RichTextExternalConflictEvent) => void;
    onUnsupportedPaste?: (event: RichTextUnsupportedPasteEvent) => void;
    onReadinessChange?: (event: RichTextReadiness) => void;
  }

  let {
    value,
    editable = true,
    disabled = false,
    messages,
    allocateId,
    class: className = "",
    onChange,
    onExternalConflict,
    onUnsupportedPaste,
    onReadinessChange,
  }: RichTextEditorProps = $props();

  let root: HTMLDivElement | undefined;
  let mountEl: HTMLDivElement | undefined;
  let core: CoreEditor | null = null;
  // Last `value` reference handed to the §5.6 decision. A host that
  // re-passes the identical reference (coarse prop update, unrelated
  // re-render) supplies no new value, so re-evaluating it must not replay
  // the decision: replaying the unchanged value would falsely acknowledge
  // a silent draft or raise a spurious conflict.
  let lastSeenValue: RichTextDocument | undefined;

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
    // catalogue through the core, and the displaying paragraphs carry it
    // directly, so a locale switch re-renders with no document transaction
    // and no change event.
    const placeholder = resolveLabel("placeholder");
    core?.setPlaceholder(
      placeholder,
      isMissing("placeholder")
        ? untranslatedDataValue("placeholder")
        : null,
    );
    const empties = root.querySelectorAll(
      ".ProseMirror p.is-empty, .ProseMirror p[data-placeholder]",
    );
    for (const empty of empties) {
      empty.setAttribute("data-placeholder", placeholder);
      if (isMissing("placeholder")) {
        empty.setAttribute(
          RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE,
          untranslatedDataValue("placeholder"),
        );
      } else {
        empty.removeAttribute(RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE);
      }
    }
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

  export function captureDocument(): Promise<RichTextCaptureResult> {
    if (!core) return Promise.reject(createCaptureUnavailableError());
    return core.captureDocument();
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
    // Stable forwarders: the core captures its callbacks once, while the
    // props they read stay live, so a parent re-render never needs a remount.
    // The mount document initialises the core and the acknowledgement
    // reference, so it is recorded as seen without a §5.6 evaluation.
    lastSeenValue = value;
    core = createRichTextEditor({
      document: value,
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
    });
    for (const type of stopTypes) {
      host.addEventListener(type, stopAtBoundary);
    }
    syncChrome();
    // Placeholder decorations land after the ProseMirror observer flush,
    // past the synchronous mount sync: re-sync once settled so the
    // displaying paragraph carries the marker with no transaction.
    void tick().then(() => {
      syncChrome();
    });
    return () => {
      for (const type of stopTypes) {
        host.removeEventListener(type, stopAtBoundary);
      }
      core?.destroy();
      core = null;
    };
  });

  // Controlled value (§5.6): this effect tracks ONLY `value`. The update is
  // applied inside `untrack` and chrome is re-synced there too, so a locale
  // switch (messages change, value unchanged) never replays the unchanged
  // value through the §5.6 decision — replaying would falsely acknowledge a
  // silent draft or raise a spurious conflict. Never recreates the editor.
  $effect(() => {
    const snapshot = value;
    const instance = core;
    // Same reference as the last evaluation: no new value, no §5.6
    // replay. The chrome effect below still tracks messages, editable
    // and disabled, so labels keep re-rendering on a locale switch.
    if (!instance || snapshot === lastSeenValue) return;
    lastSeenValue = snapshot;
    untrack(() => {
      instance.applyExternalUpdate(snapshot);
      syncChrome();
    });
  });

  $effect(() => {
    core?.setEditable(editable);
    core?.setDisabled(disabled);
  });

  // Locale and state chrome: re-render labels in place, no remount, no
  // change event. Tracks `messages`, `editable` and `disabled` only —
  // never `value`.
  $effect(() => {
    if (!core) return;
    syncChrome();
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
  <div
    class="st-rich-text-editor__status"
    data-untranslated={statusUntranslated()}
  >{statusText()}</div>
</div>
