import { mount, unmount } from "svelte";
import type {
  CollaborationActor,
  CommentTarget,
  CommentsAdapter,
} from "@sentropic/design-system-review-core";
import DossierReview from "./dossier-review.svelte";

export type DossierReviewMode = "view" | "review";

export interface DossierReviewOptions {
  /** Host-provided comment store seam; without an adapter no layer is mounted. */
  adapter: CommentsAdapter;
  /** Workspace scope forwarded to every adapter call. */
  tenant: string;
  /** Artifact identity new threads are minted against. */
  target: Pick<CommentTarget, "kind" | "id">;
  /** Rendered artifact version stamped into new anchors as `v` (baseDigest). */
  artifactVersion: string;
  /** Current user for authorship and unread rules. */
  currentUser: CollaborationActor;
  /** Host-controlled review mode. */
  mode?: DossierReviewMode;
}

export interface DossierReviewMount {
  readonly mode: DossierReviewMode;
  setMode(mode: DossierReviewMode): void;
  destroy(): void;
}

/** Mount the single review layer for a dossier host in the same tree. */
export function mountDossierReview(host: HTMLElement, options: DossierReviewOptions): DossierReviewMount {
  const layerHost = host.ownerDocument.createElement("div");
  layerHost.className = "st-dossier-review";
  layerHost.setAttribute("data-st-dossier-review", "");
  host.append(layerHost);
  // Every dossier render replaces the host's children; the single review
  // layer follows the new root back into the same tree instead of being
  // discarded together with the detached previous tree.
  const reattach = (): void => {
    if (layerHost.parentElement !== host) host.append(layerHost);
  };
  host.addEventListener("st-dossier-ready", reattach);
  let currentMode: DossierReviewMode = options.mode ?? "view";
  let app = mount(DossierReview, {
    target: layerHost,
    props: { ...options, host, mode: currentMode },
  });
  return {
    get mode() {
      return currentMode;
    },
    setMode(mode: DossierReviewMode) {
      currentMode = mode;
      unmount(app);
      app = mount(DossierReview, {
        target: layerHost,
        props: { ...options, host, mode: currentMode },
      });
    },
    destroy() {
      host.removeEventListener("st-dossier-ready", reattach);
      unmount(app);
      layerHost.remove();
    },
  };
}
