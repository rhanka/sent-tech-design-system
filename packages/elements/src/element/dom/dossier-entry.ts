import "../../../../themes/css/sent-tech.css";
import "./dossier-page.css";
import { mountDossier } from "./dossier-mount.js";

async function readDocument(host: HTMLElement): Promise<unknown> {
  const embedded = host.ownerDocument.querySelector<HTMLScriptElement>("script[data-st-dossier-document]");
  if (embedded !== null) {
    const bytes = Uint8Array.from(atob(embedded.textContent ?? ""), (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  const response = await fetch(new URL("./dossier.json", host.ownerDocument.baseURI), { mode: "same-origin" });
  if (!response.ok) throw new Error(`Dossier request failed with status ${response.status}`);
  return response.json();
}

async function start(host: HTMLElement): Promise<void> {
  const dossier = mountDossier(host);
  try {
    dossier.render(await readDocument(host));
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
