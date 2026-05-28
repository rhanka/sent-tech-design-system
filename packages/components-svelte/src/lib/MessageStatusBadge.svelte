<script lang="ts">
  import Tag from "./Tag.svelte";
  import type { ChatMessageStatus } from "./ChatMessage.svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type StatusTone = "neutral" | "success" | "warning" | "error" | "info";

  type MessageStatusBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    status: ChatMessageStatus;
    tone?: StatusTone;
    /** Surcharge i18n des libellés par statut (défaut : libellés FR). */
    labels?: Partial<Record<ChatMessageStatus, string>>;
    class?: string;
  };

  let { status, tone, labels, class: className, ...rest }: MessageStatusBadgeProps = $props();

  const DEFAULT_LABELS: Record<ChatMessageStatus, string> = {
    pending: "En attente",
    processing: "En cours",
    completed: "Terminé",
    failed: "Échec"
  };

  const mappedTone = () => {
    if (tone) return tone;
    if (status === "processing") return "info";
    if (status === "failed") return "error";
    if (status === "completed") return "success";
    return "warning";
  };

  const label = () => labels?.[status] ?? DEFAULT_LABELS[status];

  const classes = () => ["st-messageStatusBadge", className].filter(Boolean).join(" ");
</script>

<Tag tone={mappedTone()} size="sm" class={classes()} {...rest} aria-label={`Statut: ${label()}`}>
  <span class="st-messageStatusBadge__dot" aria-hidden="true"></span>
  {label()}
</Tag>

<style>
  .st-messageStatusBadge {
    align-items: center;
    text-transform: none;
  }

  .st-messageStatusBadge__dot {
    background: currentColor;
    border-radius: 999px;
    display: inline-block;
    height: 0.38rem;
    width: 0.38rem;
  }
</style>
