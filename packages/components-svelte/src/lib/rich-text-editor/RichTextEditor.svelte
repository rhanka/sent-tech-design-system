<script lang="ts">
  import { onMount } from "svelte";
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

  /** Apply the injected catalogue to the live DOM: the editable root and
      every preserved region. The placeholder extension decorates empty
      paragraphs, never the editable root, so `data-placeholder` is owned
      here; preserved regions are rendered by the core without accessible
      names, so their labels are owned here too. Never remounts. */
  function syncChrome(): void {
    const view = core?.view;
    if (!view || !root) return;
    const dom = view.dom;
    const editorLabel = resolveLabel("editorLabel");
    dom.setAttribute("role", "textbox");
    dom.setAttribute("aria-multiline", "true");
    dom.setAttribute("aria-label", editorLabel);
    markUntranslated(dom, "editorLabel");
    dom.setAttribute("data-placeholder", resolveLabel("placeholder"));
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

  export function getEditor(): CoreEditor | null {
    return core;
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
    return () => {
      for (const type of stopTypes) {
        host.removeEventListener(type, stopAtBoundary);
      }
      core?.destroy();
      core = null;
    };
  });

  // Controlled value: the core applies the §5.6 decision (echo / defer /
  // conflict / apply) to the live instance. Never recreates the editor.
  $effect(() => {
    if (!core) return;
    core.applyExternalUpdate(value);
    syncChrome();
  });

  $effect(() => {
    core?.setEditable(editable);
    core?.setDisabled(disabled);
  });

  // Locale switch: re-render labels in place, no remount, no change event.
  $effect(() => {
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
