// The stub format `stub-json/1` (§2.2): an identity codec over canonical
// JSON that proves the harness skeleton without any codec.
import { canonicalBytes } from "@sentropic/diagram-core";
import { renderCardSvg, renderZoneSvg } from "@sentropic/design-system-svelte/diagram-render";
import { foldStateIdOf } from "../harness/fold-states.js";
import type {
  CanonicalModel,
  EditProbe,
  ExportedFile,
  FoldContext,
  FormatCodec,
  ImportedFile,
  LoadedFixture,
  Outcome,
  SceneRenderer,
} from "../harness/types.js";
import { modelFromRecords } from "../harness/model.js";
import { countStructure, validateStructure, type SceneStructure } from "../structure/types.js";

export const STUB_FORMAT = "stub-json";
export const STUB_FORMAT_VERSION = "stub-json/1";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function refuse(code: string, message: string): Outcome<never> {
  return { ok: false, diagnostics: [{ origin: "stub", code, message }] };
}

function exportBytes(payload: unknown): Uint8Array {
  return encoder.encode(`${canonicalBytes(payload)}\n`);
}

/** The stub codec. `foldContexts` lets import recover the fold state id. */
export function stubJsonCodec(foldContexts?: readonly FoldContext[]): FormatCodec {
  return {
    format: STUB_FORMAT,
    chain: [STUB_FORMAT, "rfc8785-json"],
    perFoldState: true,
    exportFile(model, fold) {
      const records: Record<string, unknown> = {};
      for (const record of model.records) records[record.name] = JSON.parse(record.jcs);
      return {
        ok: true,
        value: {
          bytes: exportBytes({
            format: STUB_FORMAT_VERSION,
            fold: { view: fold.view, collapsed: [...fold.collapsed] },
            records,
          }),
          mediaType: "application/json",
        },
      };
    },
    importFile(file) {
      const text = decoder.decode(file.bytes);
      if (!text.endsWith("\n") || text.endsWith("\n\n")) return refuse("stub-noncanonical", "exactly one final LF required");
      const body = text.slice(0, -1);
      let parsed: unknown;
      try {
        parsed = JSON.parse(body);
      } catch {
        return refuse("stub-noncanonical", "not JSON");
      }
      if (canonicalBytes(parsed) !== body) return refuse("stub-noncanonical", "bytes are not the canonical re-serialisation");
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
        return refuse("stub-edit-unsupported", "top level must be an object");
      const keys = Object.keys(parsed).sort();
      if (keys.join(",") !== "fold,format,records") return refuse("stub-edit-unsupported", "keys must be exactly format, fold, records");
      const payload = parsed as { format: unknown; fold: unknown; records: unknown };
      if (payload.format !== STUB_FORMAT_VERSION) return refuse("stub-edit-unsupported", "format must be stub-json/1");
      if (typeof payload.fold !== "object" || payload.fold === null || Array.isArray(payload.fold))
        return refuse("stub-edit-unsupported", "fold must be an object");
      const fold = payload.fold as { view?: unknown; collapsed?: unknown };
      if (typeof fold.view !== "string" || !Array.isArray(fold.collapsed) || fold.collapsed.some((c) => typeof c !== "string"))
        return refuse("stub-edit-unsupported", "fold must be { view, collapsed }");
      if (typeof payload.records !== "object" || payload.records === null || Array.isArray(payload.records))
        return refuse("stub-edit-unsupported", "records must be an object");
      const collapsed = [...(fold.collapsed as string[])].sort();
      const ctx = foldContexts?.find((c) => c.view === fold.view);
      const id = ctx === undefined ? "default" : foldStateIdOf(ctx, collapsed);
      const imported: ImportedFile = {
        model: modelFromRecords(payload.records as Record<string, unknown>),
        fold: { id, view: fold.view as string, collapsed },
      };
      return { ok: true, value: imported };
    },
    probes: stubProbes(),
    foreignSave: undefined,
  };
}

function reExport(file: ExportedFile, mutate: (payload: Record<string, unknown>) => void, canonical: boolean): ExportedFile {
  const text = decoder.decode(file.bytes);
  const payload = JSON.parse(text.slice(0, -1)) as Record<string, unknown>;
  mutate(payload);
  const body = canonical ? canonicalBytes(payload) : JSON.stringify(payload, null, 2);
  return { bytes: encoder.encode(`${body}\n`), mediaType: file.mediaType };
}

function stubProbes(): readonly EditProbe[] {
  return [
    {
      id: "rename-first-card",
      kind: "allowed",
      what: "Renaming the first card of structure.json is an allowed edit and maps to the same patch on the model.",
      apply(file) {
        return reExport(
          file,
          (payload) => {
            const records = payload.records as Record<string, unknown>;
            const structure = records["structure.json"] as { cards: { name: string }[] };
            structure.cards[0]!.name = "Carte renommée";
          },
          true,
        );
      },
      expect: {
        kind: "model",
        record: "structure.json",
        patch: [{ op: "replace", path: "/cards/0/name", value: "Carte renommée" }],
      },
    },
    {
      id: "extra-key",
      kind: "forbidden",
      what: "Adding a top-level key outside format, fold and records is refused with stub-edit-unsupported.",
      apply(file) {
        return reExport(file, (payload) => {
          payload.extra = true;
        }, true);
      },
      expect: { kind: "refused", code: "stub-edit-unsupported" },
    },
    {
      id: "pretty-print",
      kind: "forbidden",
      what: "A pretty-printed file is refused with stub-noncanonical.",
      apply(file) {
        return reExport(file, () => {}, false);
      },
      expect: { kind: "refused", code: "stub-noncanonical" },
    },
  ];
}

/** §3.5 SceneStructure → one record "structure.json" (§2.2). */
export function loadStructureFixture(bytes: Uint8Array): Outcome<LoadedFixture> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decoder.decode(bytes));
  } catch {
    return refuse("structure-unreadable", "fixture is not JSON");
  }
  const validated = validateStructure(parsed);
  if (!validated.ok) return validated;
  const structure = validated.value;
  const zoneIds = structure.zones.map((z) => z.id).sort();
  const expanded = new Set(structure.expanded);
  const defaultCollapsed = zoneIds.filter((id) => !expanded.has(id));
  return {
    ok: true,
    value: {
      model: modelFromRecords({ "structure.json": structure }),
      folds: [{ view: "view:main", containers: zoneIds, defaultCollapsed }],
    },
  };
}

/** The stub renderer, id "stub-cards@0.37.0" (§2.2). */
export function stubCardsRenderer(): SceneRenderer {
  return {
    id: "stub-cards@0.37.0",
    render(model, fold) {
      const record = model.records.find((r) => r.name === "structure.json");
      if (record === undefined) return refuse("stub-render-refused", "no structure.json record");
      const validated = validateStructure(JSON.parse(record.jcs));
      if (!validated.ok) return refuse("stub-render-refused", "structure.json invalid");
      const structure: SceneStructure = validated.value;
      const collapsed = new Set(fold.collapsed);
      const entities = [...structure.zones, ...structure.cards].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
      const parts: string[] = [];
      for (const entity of entities) {
        if (structure.zones.includes(entity)) {
          const result = renderZoneSvg(
            { entityId: entity.id, title: entity.name, subtitle: entity.role, collapsed: collapsed.has(entity.id) },
            { children: [] },
          );
          if (result.kind !== "rendered") return refuse("stub-render-refused", `zone ${entity.id} refused`);
          parts.push(result.svg);
        } else {
          const result = renderCardSvg({ entityId: entity.id, title: entity.name, body: [entity.role] });
          if (result.kind !== "rendered") return refuse("stub-render-refused", `card ${entity.id} refused`);
          parts.push(result.svg);
        }
      }
      return { ok: true, value: { svg: parts.join("") } };
    },
  };
}

/** Counts of a structure fixture, for provenance and W-DL0.12. */
export function structureCounts(bytes: Uint8Array): Outcome<ReturnType<typeof countStructure>> {
  const loaded = loadStructureFixture(bytes);
  if (!loaded.ok) return loaded;
  const record = loaded.value.model.records[0];
  if (record === undefined) return refuse("structure-unreadable", "empty model");
  const validated = validateStructure(JSON.parse(record.jcs));
  if (!validated.ok) return validated;
  return { ok: true, value: countStructure(validated.value) };
}
