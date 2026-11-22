import { mount, unmount } from "svelte";
import type {
  CollaborationActor,
  CommentTarget,
  CommentsAdapter,
} from "@sentropic/design-system-review-core";
import DossierReview from "./dossier-review.svelte";
import { createReviewState } from "./dossier-review-state.svelte.js";

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
  readonly artifactVersion: string;
  setMode(mode: DossierReviewMode): void;
  setArtifactVersion(artifactVersion: string): void;
  destroy(): void;
}

// One layer per host: a second mount returns the live handle instead of
// stacking a second CommentLayer onto the same dossier.
const liveByHost = new WeakMap<HTMLElement, DossierReviewMount>();

/** Mount the single review layer for a dossier host in the same tree. */
export function mountDossierReview(host: HTMLElement, options: DossierReviewOptions): DossierReviewMount {
  const existing = liveByHost.get(host);
  if (existing !== undefined) {
    existing.setArtifactVersion(options.artifactVersion);
    if (options.mode !== undefined) existing.setMode(options.mode);
    return existing;
  }
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
  const props = createReviewState({ ...options, host, mode: options.mode ?? "view" });
  // Reactive props carry mode and artifactVersion updates without
  // unmounting the layer (unsaved drafts and the active thread survive).
  const app = mount(DossierReview, { target: layerHost, props });
  let destroyed = false;
  const handle: DossierReviewMount = {
    get mode() {
      return props.mode;
    },
    get artifactVersion() {
      return props.artifactVersion;
    },
    setMode(mode: DossierReviewMode) {
      props.mode = mode;
    },
    setArtifactVersion(artifactVersion: string) {
      props.artifactVersion = artifactVersion;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      host.removeEventListener("st-dossier-ready", reattach);
      unmount(app);
      layerHost.remove();
      liveByHost.delete(host);
    },
  };
  liveByHost.set(host, handle);
  return handle;
}
