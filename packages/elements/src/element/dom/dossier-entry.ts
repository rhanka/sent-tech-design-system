import "../../../../themes/css/sent-tech.css";
import "./dossier-page.css";
import { canonicalJson } from "@sentropic/focus/editing";
import { dossierManifestViews } from "../../dossier/dossier-views.js";
import { isRecord } from "../../dossier/diagram-source.js";
import { mountDossier } from "./dossier-mount.js";

function readEmbedded(host: HTMLElement, name: "document" | "manifest" | "views"): string | undefined {
  const script = host.ownerDocument.querySelector<HTMLScriptElement>(`script[data-st-dossier-${name}]`);
  if (script === null) return undefined;
  const bytes = Uint8Array.from(atob(script.textContent ?? ""), (character) => character.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

async function readFile(host: HTMLElement, name: string): Promise<string> {
  const response = await fetch(new URL(`./${name}`, host.ownerDocument.baseURI), { mode: "same-origin" });
  if (!response.ok) throw new Error(`${name} request failed with status ${response.status}`);
  return response.text();
}

function parseViews(source: string | undefined): unknown {
  if (source === undefined) return undefined;
  const parsed: unknown = JSON.parse(source);
  if (source !== canonicalJson(parsed)) throw new Error("views.json must contain canonical JSON bytes");
  return parsed;
}

async function renderPage(host: HTMLElement, dossier: ReturnType<typeof mountDossier>): Promise<void> {
  const embedded = readEmbedded(host, "document");
  if (embedded !== undefined) {
    const manifest = readEmbedded(host, "manifest");
    dossier.render(JSON.parse(embedded), {
      manifest: manifest === undefined ? undefined : JSON.parse(manifest),
      views: parseViews(readEmbedded(host, "views")),
    });
    return;
  }
  const input: unknown = JSON.parse(await readFile(host, "dossier.json"));
  if (!isRecord(input) || !Array.isArray(input.sections) ||
      !input.sections.some((section: unknown) => isRecord(section) && section.kind === "diagram")) {
    dossier.render(input);
    return;
  }
  const manifest: unknown = JSON.parse(await readFile(host, "focus.manifest.json"));
  const views = dossierManifestViews(manifest) === undefined ? undefined : parseViews(await readFile(host, "views.json"));
  dossier.render(input, { manifest, views });
}

async function start(host: HTMLElement): Promise<void> {
  const dossier = mountDossier(host);
  try {
    await renderPage(host, dossier);
  } catch {
    dossier.destroy();
    const notice = host.ownerDocument.createElement("p");
    notice.setAttribute("role", "alert");
    notice.textContent = "The dossier could not be loaded.";
    host.replaceChildren(notice);
  } finally {
    host.removeAttribute("aria-busy");
  }
}

const page = globalThis.document?.querySelector<HTMLElement>("[data-st-dossier-page]");
if (page !== undefined && page !== null) void start(page);
