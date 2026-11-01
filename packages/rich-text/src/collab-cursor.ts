/**
 * Remote caret cursor surface (CL-3b2, spec §5.1.1, §5.2 R-ANCH-2/R-ANCH-5).
 *
 * Two halves, both DS-owned (§4.1/§5.1: no Yjs/ProseMirror binding
 * package, no cursor plugin from that package, no Tiptap
 * collaboration/caret extension — the DS writes its own decoration
 * plugin):
 *
 * - Publisher: on local selection change the binding converts the
 *   ProseMirror selection to linear indices, mints relative positions
 *   (`createRelativePositionFromTypeIndex`, end-of-field `assoc < 0`),
 *   serialises with `Y.relativePositionToJSON` and sets `actorId`,
 *   `user: { name, color }` (colour validated to `#RRGGBB` else
 *   `transparent`) and `cursor: { fieldKey, anchor, head }` on the session
 *   awareness. Re-publishes only when the relative positions actually
 *   change; clears `cursor` (null) on blur, unmount and revocation. No
 *   numeric offsets on the wire.
 * - Renderer: a ProseMirror decoration plugin. On every awareness change,
 *   per remote state: registry verification (unregistered or revoked ⇒ no
 *   caret), `cursor: null` and foreign-`fieldKey` filtering, resolution of
 *   both ends (nothing rendered when either end is gone, R-ANCH-5), and a
 *   caret widget plus selection decoration carrying the actor's label as
 *   text and the re-validated colour. Labels render as text, never markup
 *   (§8.6).
 *
 * This module lives in the collaboration graph: it is created by the bound
 * entry and reaches the editor core only through the type-erased `BoundImpl`
 * cursor surface, so the `"./editor"` graph never loads it.
 */
import type * as Y from "yjs";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { Awareness } from "y-protocols/awareness";
import { buildSelectionMap } from "./collab-projection.js";
import {
  cursorJsonToSelection,
  selectionToCursorJson,
  type PublishedCursor,
} from "./collab-selection.js";
import { validateCollaborationColor } from "./collaboration.js";

/** Local actor facts the publisher writes (label/color fall back safely). */
export interface CursorPublisherActor {
  actorId: string;
  displayLabel?: string;
  color?: string;
}

/** Admitted-actor registry lookup supplied by the binding source (AMB-5). */
export type RemoteCursorResolver = (actorId: string) => {
  displayLabel: string;
  color: string;
} | null;

/**
 * Create the cursor publisher for one bound field. All awareness writes go
 * through `setLocalStateField`; nothing here reads the network.
 */
export function createCursorPublisher(options: {
  ytext: Y.Text;
  fieldKey: string;
  awareness: Awareness;
  actor: CursorPublisherActor;
}): {
  publish(pmDoc: ProseMirrorNode, pmAnchor: number, pmHead: number): void;
  clear(): void;
  localStateBytes(): number;
} {
  const { ytext, fieldKey, awareness, actor } = options;
  const actorId = actor.actorId;
  const label = actor.displayLabel !== undefined && actor.displayLabel !== "" ? actor.displayLabel : actorId;
  const color = validateCollaborationColor(typeof actor.color === "string" ? actor.color : "");
  let lastKey: string | null = null;
  return {
    publish(pmDoc: ProseMirrorNode, pmAnchor: number, pmHead: number): void {
      const map = buildSelectionMap(pmDoc, ytext);
      const cursor = selectionToCursorJson(ytext, fieldKey, map, pmAnchor, pmHead);
      const key = JSON.stringify(cursor);
      // Re-publish only when the relative positions actually changed.
      if (key === lastKey) return;
      lastKey = key;
      awareness.setLocalStateField("actorId", actorId);
      awareness.setLocalStateField("user", { name: label, color });
      awareness.setLocalStateField("cursor", {
        fieldKey: cursor.fieldKey,
        anchor: cursor.anchor,
        head: cursor.head,
      });
    },
    clear(): void {
      lastKey = null;
      awareness.setLocalStateField("cursor", null);
    },
    /** Serialised local awareness state size (§8.5: ≤ 4 KiB per update). */
    localStateBytes(): number {
      return JSON.stringify(awareness.getLocalState() ?? null).length;
    },
  };
}

const CURSOR_PLUGIN_KEY = new PluginKey("richTextRemoteCursors");

function caretElement(label: string, color: string, actorId: string): HTMLElement {
  const caret = globalThis.document.createElement("span");
  caret.setAttribute("data-remote-caret", actorId);
  caret.setAttribute("data-remote-label", label);
  caret.style.setProperty("display", "inline-block");
  caret.style.setProperty("position", "relative");
  const bar = globalThis.document.createElement("span");
  bar.setAttribute("data-remote-caret-bar", actorId);
  bar.style.setProperty("display", "inline-block");
  bar.style.setProperty("width", "0");
  bar.style.setProperty("height", "1em");
  bar.style.setProperty("border-left", `2px solid ${color}`);
  bar.style.setProperty("vertical-align", "text-bottom");
  const flag = globalThis.document.createElement("span");
  flag.setAttribute("data-remote-caret-label", actorId);
  flag.textContent = label;
  flag.style.setProperty("background-color", color);
  flag.style.setProperty("color", "#ffffff");
  flag.style.setProperty("font-size", "11px");
  flag.style.setProperty("line-height", "1");
  flag.style.setProperty("padding", "1px 4px");
  flag.style.setProperty("border-radius", "2px");
  flag.style.setProperty("margin-left", "1px");
  flag.style.setProperty("white-space", "nowrap");
  caret.appendChild(bar);
  caret.appendChild(flag);
  return caret;
}

/**
 * Create the DS remote-cursor decoration plugin for one bound field
 * (§5.1.1 renderer). Reads `awareness.getStates()` on every awareness
 * change and renders, per admitted remote actor, a caret widget (collapsed)
 * or a caret plus selection decoration (range), positioned through the
 * §4.3.1 item 3 map.
 */
export function createRemoteCursorPlugin(options: {
  ytext: Y.Text;
  fieldKey: string;
  awareness: Awareness;
  resolveActor: RemoteCursorResolver;
  localClientId: number;
}): Plugin {
  const { ytext, fieldKey, awareness, resolveActor, localClientId } = options;
  const recompute = (doc: ProseMirrorNode): DecorationSet => {
    const map = buildSelectionMap(doc, ytext);
    const decorations: Decoration[] = [];
    for (const [clientId, state] of awareness.getStates()) {
      if (clientId === localClientId) continue;
      const record = state as {
        actorId?: unknown;
        cursor?: unknown;
      };
      // (1) Registry verification: an unregistered or revoked actor renders
      // no caret, whatever `cursor` says.
      if (typeof record.actorId !== "string" || record.actorId === "") continue;
      const resolved = resolveActor(record.actorId);
      if (resolved === null) continue;
      // (2) Null cursors and foreign fields render nothing here.
      if (record.cursor === null || record.cursor === undefined) continue;
      const wire = record.cursor as {
        fieldKey?: unknown;
        anchor?: unknown;
        head?: unknown;
      };
      if (wire.fieldKey !== fieldKey) continue;
      // (3) Resolve both ends; (4) nothing when either end is gone (R-ANCH-5).
      const selection = cursorJsonToSelection(ytext, map, {
        fieldKey,
        anchor: wire.anchor,
        head: wire.head,
      } as unknown as PublishedCursor);
      if (selection === null) continue;
      const label = resolved.displayLabel;
      const color = validateCollaborationColor(resolved.color);
      const from = Math.min(selection.anchor, selection.head);
      const to = Math.max(selection.anchor, selection.head);
      if (from === to) {
        decorations.push(
          Decoration.widget(
            from,
            () => caretElement(label, color, record.actorId as string),
            { key: `remote-caret:${record.actorId as string}`, side: -1 },
          ),
        );
      } else {
        const background = color === "transparent" ? "transparent" : `${color}33`;
        decorations.push(
          Decoration.inline(
            from,
            to,
            {
              style: `background-color: ${background}`,
              "data-remote-selection": record.actorId as string,
            },
            { key: `remote-selection:${record.actorId as string}` },
          ),
        );
        decorations.push(
          Decoration.widget(
            to,
            () => caretElement(label, color, record.actorId as string),
            { key: `remote-caret:${record.actorId as string}`, side: -1 },
          ),
        );
      }
    }
    return DecorationSet.create(doc, decorations);
  };
  return new Plugin({
    key: CURSOR_PLUGIN_KEY,
    state: {
      init: (_config, state) => recompute(state.doc),
      apply: (tr, value, _oldState, newState) => {
        const meta = tr.getMeta(CURSOR_PLUGIN_KEY) as { refresh?: boolean } | boolean | undefined;
        if (meta === true || (typeof meta === "object" && meta !== null && meta.refresh === true)) {
          return recompute(newState.doc);
        }
        // A rebuilt range drops widgets mapped inside it (e.g. a concurrent
        // remote append repainting the paragraph): recompute from the spec
        // encoding so carets keep their relative anchors across doc changes
        // (R-ANCH-2 end-of-field affinity included).
        if (tr.docChanged) {
          return recompute(newState.doc);
        }
        return (value as DecorationSet).map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations: (state) =>
        (CURSOR_PLUGIN_KEY.getState(state) as DecorationSet | undefined) ?? DecorationSet.empty,
    },
    view: (view) => {
      const onChange = (): void => {
        const destroyed = (view as unknown as { isDestroyed?: boolean }).isDestroyed;
        if (destroyed === true) return;
        view.dispatch(view.state.tr.setMeta(CURSOR_PLUGIN_KEY, { refresh: true }));
      };
      awareness.on("change", onChange);
      return {
        destroy: () => {
          awareness.off("change", onChange);
        },
      };
    },
  });
}

/**
 * Mount the DS remote-cursor plugin as a plain Tiptap extension (not a
 * Tiptap collaboration/caret extension — the DS owns its decoration
 * plugin, §4.1/§5.1).
 */
export function wrapCursorPlugin(plugin: Plugin): Extension {
  return Extension.create({
    name: "richTextRemoteCursors",
    addProseMirrorPlugins: () => [plugin],
  });
}
