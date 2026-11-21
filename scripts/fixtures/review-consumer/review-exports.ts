import {
  CommentAuthorship,
  CommentComposer,
  CommentLayer,
  CommentPin,
  CommentThread,
  OrphanList,
  ReviewModeToggle,
  ThreadPanel,
  type CommentAuthorshipProps,
  type CommentComposerProps,
  type CommentLayerProps,
  type CommentPinProps,
  type CommentThreadProps,
  type OrphanListProps,
  type ReviewModeToggleProps,
  type ThreadPanelProps,
} from "@sentropic/design-system-svelte";
import type { ComponentProps } from "svelte";

export { CommentLayer };
export const reviewComponents = {
  CommentAuthorship,
  CommentComposer,
  CommentLayer,
  CommentPin,
  CommentThread,
  OrphanList,
  ReviewModeToggle,
  ThreadPanel,
};

const currentUser = { actorId: "alice", kind: "human", displayLabel: "Alice", color: "#2563eb" } as const;
const target = { kind: "artifact", id: "artifact-test" } as const;
const thread = { threadId: "thread-test", target, comments: [], state: "open" as const, anchor: null };
const props = {
  CommentAuthorship: { author: currentUser },
  CommentComposer: { author: currentUser, onSubmit: (body) => { body.trim(); } },
  CommentLayer: { target, artifactVersion: "sha256:focus-test", comments: [], currentUser },
  CommentPin: { index: 1, label: "Thread 1" },
  CommentThread: { thread, currentUser },
  OrphanList: { threads: [thread], currentUser },
  ReviewModeToggle: { mode: "review", onModeChange: (mode) => { mode.toUpperCase(); } },
  ThreadPanel: { threads: [thread], currentUser },
} satisfies {
  CommentAuthorship: CommentAuthorshipProps;
  CommentComposer: CommentComposerProps;
  CommentLayer: CommentLayerProps;
  CommentPin: CommentPinProps;
  CommentThread: CommentThreadProps;
  OrphanList: OrphanListProps;
  ReviewModeToggle: ReviewModeToggleProps;
  ThreadPanel: ThreadPanelProps;
};

props satisfies { [Name in keyof typeof reviewComponents]: ComponentProps<(typeof reviewComponents)[Name]> };
