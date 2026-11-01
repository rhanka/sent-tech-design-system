/**
 * Test-only Hocuspocus-backed binding source for CL-3c witness 8(i), DS
 * half (spec §8 CL-3 (8), §5.7 R-BIND-1/2/3, §7.3–§7.4).
 *
 * This module starts an in-process `@hocuspocus/server` (ephemeral port,
 * `openDirectConnection` per session document, `onLoadDocument` /
 * `onStoreDocument` over an in-memory checkpoint map — the same backing the
 * host H3 offline harness uses) and implements `LiveSessionBindingSource`
 * over the server-side document. It is consumed only by
 * `collab-hocuspocus.test.ts`; it is never exported from any package entry
 * and is never reachable from the `"."`, `"./editor"` or
 * `"./editor/collaboration"` shipped graphs. Shipped DS code still opens no
 * socket (spec §4.9, witness 7).
 *
 * Session semantics mirror `createInMemoryTestDoubleProvider` exactly: one
 * server-side document per `(documentId, sessionId)` holding every field's
 * `field:<fieldKey>` text and `fieldmeta:<fieldKey>` map, one `Awareness`
 * per session (spec §5.1.1, register entry AMB-C4), fail-closed full-identity
 * resolution (R-BIND-1), and per-field reference counting over the shared
 * session (R-BIND-2). Remote edits are applied as Yjs updates to the
 * server-side document through the direct connection, never by reaching
 * into a replica's doc.
 */
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import type { LiveSessionBindingSource } from "./editor-collaboration.js";
import { fieldMetaName, fieldTextName } from "./collab-codec.js";

/** Driver surface consumed by `collab-hocuspocus.test.ts`. */
export interface HocuspocusTestDriver {
  readonly label: "hocuspocus";
  readonly source: LiveSessionBindingSource;
  /** Apply a remote edit as a Yjs transaction on the server-side document. */
  remoteTransact(
    fieldKey: string,
    fn: (text: Y.Text, fieldMeta: Y.Map<unknown>) => void,
  ): Promise<void>;
  /** Force the persistence hook, then report stored checkpoint bytes. */
  storedBytes(): Promise<number>;
  close(): Promise<void>;
}

function requireCoordinate(value: string, name: string): void {
  if (typeof value !== "string" || value === "") {
    throw new Error(`rich-text.binding-identity: missing ${name} fails closed (R-BIND-1)`);
  }
}

function requireIdentity(identity: { documentId: string; sessionId: string; fieldKey: string }): void {
  requireCoordinate(identity.documentId, "documentId");
  requireCoordinate(identity.sessionId, "sessionId");
  requireCoordinate(identity.fieldKey, "fieldKey");
}

function checkActorShape(actor: { actorId: string; displayLabel: string; color: string }): void {
  requireCoordinate(actor.actorId, "actorId");
  requireCoordinate(actor.displayLabel, "displayLabel");
  if (typeof actor.color !== "string") {
    throw new Error("rich-text.actor-registry: color must be a string (validated at render)");
  }
}

/** Installed version of the Hocuspocus server backing this source. */
export function hocuspocusServerVersion(): string {
  const require = createRequire(import.meta.url);
  let dir: string;
  try {
    dir = dirname(require.resolve("@hocuspocus/server"));
  } catch {
    dir = dirname(require.resolve("@hocuspocus/server/package.json"));
  }
  for (;;) {
    const manifest = join(dir, "package.json");
    if (existsSync(manifest)) {
      const pkg = JSON.parse(readFileSync(manifest, "utf8")) as { version?: string };
      if (typeof pkg.version === "string") return pkg.version;
    }
    const parent = dirname(dir);
    if (parent === dir) throw new Error("package manifest not found for @hocuspocus/server");
    dir = parent;
  }
}

export async function openHocuspocusTestSession(options: {
  documentId: string;
  sessionId: string;
  fields: readonly string[];
}): Promise<HocuspocusTestDriver> {
  requireCoordinate(options.documentId, "documentId");
  requireCoordinate(options.sessionId, "sessionId");
  if (options.fields.length === 0) {
    throw new Error("rich-text.binding-identity: admitted field set is empty");
  }
  const documentId = options.documentId;
  const sessionId = options.sessionId;
  const admitted = new Set<string>(options.fields);
  const holders = new Map<string, number>();
  const actors = new Map<string, { displayLabel: string; color: string; awarenessClientId?: number }>();

  const checkpoints = new Map<string, Uint8Array>();
  const server = new Server({
    port: 0,
    onLoadDocument: async ({ document, documentName }) => {
      const bytes = checkpoints.get(documentName);
      if (bytes !== undefined) Y.applyUpdate(document, bytes);
    },
    onStoreDocument: async ({ document, documentName }) => {
      checkpoints.set(documentName, Y.encodeStateAsUpdate(document));
    },
  });
  await server.listen();
  // One server-side document per session, holding every field of the
  // session (mirrors the double's one-Y.Doc-per-session record and the
  // AMB-C4 awareness-per-session rule).
  const serverDocName = `${documentId}\n${sessionId}`;
  const connection = await server.hocuspocus.openDirectConnection(serverDocName);
  const serverDoc = connection.document;
  if (serverDoc === null || serverDoc === undefined) {
    await connection.disconnect();
    await server.destroy();
    throw new Error("rich-text.hocuspocus-test-session: direct connection opened no document");
  }
  const awareness = new Awareness(serverDoc);

  const source: LiveSessionBindingSource = {
    resolveBinding(identity) {
      requireIdentity(identity);
      if (identity.documentId !== documentId || identity.sessionId !== sessionId) {
        throw new Error("rich-text.binding-identity: different document/session fails closed (R-BIND-1)");
      }
      if (!admitted.has(identity.fieldKey)) {
        throw new Error("rich-text.binding-identity: different field fails closed (R-BIND-1)");
      }
      holders.set(identity.fieldKey, (holders.get(identity.fieldKey) ?? 0) + 1);
      return {
        identity: { ...identity },
        text: serverDoc.getText(fieldTextName(identity.fieldKey)),
        fieldMeta: serverDoc.getMap(fieldMetaName(identity.fieldKey)) as Y.Map<unknown>,
        awareness,
      };
    },
    releaseBinding(identity) {
      requireIdentity(identity);
      if (identity.documentId !== documentId || identity.sessionId !== sessionId) {
        throw new Error("rich-text.binding-identity: different document/session fails closed (R-BIND-1)");
      }
      if (!admitted.has(identity.fieldKey)) {
        throw new Error("rich-text.binding-identity: different field fails closed (R-BIND-1)");
      }
      const held = holders.get(identity.fieldKey) ?? 0;
      if (held > 1) {
        holders.set(identity.fieldKey, held - 1);
        return;
      }
      holders.delete(identity.fieldKey);
      admitted.delete(identity.fieldKey);
    },
    registerActor(actor, awarenessClientId) {
      checkActorShape(actor);
      actors.set(actor.actorId, {
        displayLabel: actor.displayLabel,
        color: actor.color,
        ...(awarenessClientId === undefined ? {} : { awarenessClientId }),
      });
    },
    revokeActor(actorId) {
      requireCoordinate(actorId, "actorId");
      actors.delete(actorId);
    },
    admittedActorOf(actorId) {
      return actors.get(actorId) ?? null;
    },
  };

  return {
    label: "hocuspocus",
    source,
    async remoteTransact(fieldKey, fn) {
      if (!admitted.has(fieldKey)) {
        throw new Error("rich-text.binding-identity: different field fails closed (R-BIND-1)");
      }
      await connection.transact((doc) => {
        fn(doc.getText(fieldTextName(fieldKey)), doc.getMap(fieldMetaName(fieldKey)) as Y.Map<unknown>);
      });
    },
    async storedBytes() {
      server.hocuspocus.flushPendingStores();
      await new Promise((resolve) => setTimeout(resolve, 50));
      let total = 0;
      for (const bytes of checkpoints.values()) total += bytes.length;
      return total;
    },
    async close() {
      await connection.disconnect();
      await server.destroy();
    },
  };
}
