import type {
  CollaborationActor,
  CommentTarget,
  CommentsAdapter,
} from "@sentropic/design-system-review-core";
import type { DossierReviewMode } from "./dossier-review-mount.js";

export interface DossierReviewProps {
  adapter: CommentsAdapter;
  tenant: string;
  target: Pick<CommentTarget, "kind" | "id">;
  artifactVersion: string;
  currentUser: CollaborationActor;
  host: HTMLElement;
  mode: DossierReviewMode;
}

/** Reactive props for the review layer: mode/version update without remount. */
export function createReviewState(options: DossierReviewProps): DossierReviewProps {
  let props = $state({
    adapter: options.adapter,
    tenant: options.tenant,
    target: options.target,
    artifactVersion: options.artifactVersion,
    currentUser: options.currentUser,
    host: options.host,
    mode: options.mode,
  });
  return props;
}
