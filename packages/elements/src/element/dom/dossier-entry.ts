import "../../../../themes/css/sent-tech.css";
import "./dossier-page.css";
import { mountDossier } from "./dossier-mount.js";
import { mountDossierReview } from "./dossier-review-mount.js";
import { baseDigest } from "@sentropic/focus/editing";

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

interface ReviewGlobal {
  readonly adapter: import("@sentropic/design-system-review-core").CommentsAdapter;
  readonly tenant: string;
  readonly target: { readonly kind: "artifact"; readonly id: string };
  readonly currentUser: import("@sentropic/design-system-review-core").CollaborationActor;
  readonly mode?: "view" | "review";
}

async function start(host: HTMLElement): Promise<void> {
  const dossier = mountDossier(host);
  try {
    const document = await readDocument(host);
    dossier.render(document);
    // The host (Focus Web) may expose an adapter before this module runs.
    // Without one no review layer is mounted and reading is unchanged.
    const review = (globalThis as { __stDossierReview?: unknown }).__stDossierReview as
      | ReviewGlobal
      | undefined;
    if (review !== undefined && review.adapter !== undefined) {
      mountDossierReview(host, {
        adapter: review.adapter,
        tenant: review.tenant,
        target: review.target,
        artifactVersion: baseDigest(document),
        currentUser: review.currentUser,
        ...(review.mode === undefined ? {} : { mode: review.mode }),
      });
    }
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
