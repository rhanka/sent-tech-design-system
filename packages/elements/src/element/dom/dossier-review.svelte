<script lang="ts">
  import { CommentLayer } from "@sentropic/design-system-svelte";
  import type {
    CollaborationActor,
    CommentTarget,
    CommentsAdapter,
    ReviewComment,
  } from "@sentropic/design-system-review-core";
  import type { DossierReviewMode } from "./dossier-review-mount.js";

  interface Props {
    adapter: CommentsAdapter;
    tenant: string;
    target: Pick<CommentTarget, "kind" | "id">;
    artifactVersion: string;
    currentUser: CollaborationActor;
    /** Element the dossier is mounted in; it announces every render. */
    host: HTMLElement;
    mode?: DossierReviewMode;
  }

  let { adapter, tenant, target, artifactVersion, currentUser, host, mode = "view" }: Props = $props();

  let comments = $state<ReviewComment[]>([]);
  let rootEl = $state<HTMLElement | null>(null);

  async function refresh(): Promise<void> {
    comments = await adapter.list(tenant, { ...target });
  }

  // Resolve threads only once a completed root has been announced: an
  // incomplete tree would orphan anchors that are not yet rendered. Each new
  // root replaces the previous one; the layer's own observers follow rootEl.
  $effect(() => {
    const onReady = (event: Event): void => {
      const detail = (event as CustomEvent<{ reviewRoot: HTMLElement }>).detail;
      const next = detail?.reviewRoot;
      if (next === undefined || next === null) return;
      const previous = rootEl;
      rootEl = next;
      // The old root was detached by the re-render: drop a selection the
      // previous tree owned so no stale range survives the replacement.
      const view = host.ownerDocument.defaultView;
      const selection = view?.getSelection();
      if (
        selection !== undefined &&
        selection !== null &&
        previous !== null &&
        selection.rangeCount > 0 &&
        !next.contains(selection.getRangeAt(0).commonAncestorContainer) &&
        previous.contains(selection.getRangeAt(0).commonAncestorContainer)
      ) {
        selection.removeAllRanges();
      }
    };
    host.addEventListener("st-dossier-ready", onReady);
    const initial = host.querySelector<HTMLElement>("article[data-st-dossier]");
    if (initial !== null) rootEl = initial;
    return () => host.removeEventListener("st-dossier-ready", onReady);
  });

  $effect(() => {
    void refresh();
    const unsubscribe = adapter.subscribe?.(tenant, { ...target }, (next) => {
      comments = next;
    });
    return () => unsubscribe?.();
  });

  async function handleCreate(payload: { target: CommentTarget; sectionKey: string; body: string }): Promise<void> {
    await adapter.create({ tenant, target: payload.target, body: payload.body });
    await refresh();
  }

  async function handleReply(threadId: string, body: string): Promise<void> {
    await adapter.reply({ tenant, target: { ...target }, threadId, body });
    await refresh();
  }

  async function handleResolve(threadId: string): Promise<void> {
    await adapter.setState(tenant, threadId, "closed");
    await refresh();
  }

  async function handleReopen(threadId: string): Promise<void> {
    await adapter.setState(tenant, threadId, "open");
    await refresh();
  }

  async function handleEdit(commentId: string, body: string): Promise<void> {
    await adapter.edit(tenant, commentId, body);
    await refresh();
  }

  async function handleDelete(commentId: string): Promise<void> {
    await adapter.remove(tenant, commentId);
    await refresh();
  }
</script>

<div>
  <CommentLayer
    {rootEl}
    {mode}
    {target}
    {artifactVersion}
    {comments}
    {currentUser}
    onCreate={handleCreate}
    onReply={handleReply}
    onResolve={handleResolve}
    onReopen={handleReopen}
    onEditComment={handleEdit}
    onDeleteComment={handleDelete}
  />
</div>
