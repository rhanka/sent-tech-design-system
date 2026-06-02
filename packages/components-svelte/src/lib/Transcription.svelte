<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type TranscriptionSegment = {
    speaker?: string;
    startTime?: string;
    endTime?: string;
    text: string;
  };

  type TranscriptionProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    title?: string;
    segments?: TranscriptionSegment[];
    text?: string;
    class?: string;
    open?: boolean;
    showTimestamps?: boolean;
  };

  let {
    title = "Transcription",
    segments,
    text,
    open = false,
    showTimestamps = true,
    class: className,
    ...rest
  }: TranscriptionProps = $props();

  const resolvedSegments = $derived((segments ?? []).filter((segment) => Boolean(segment.text?.trim())));
  const hasSegments = $derived(resolvedSegments.length > 0);
  const hasText = $derived(Boolean(text && text.trim().length));

  const formatInterval = (segment: TranscriptionSegment) => {
    if (!showTimestamps || (!segment.startTime && !segment.endTime)) return "";
    if (!segment.startTime) return segment.endTime ? `— ${segment.endTime}` : "";
    if (!segment.endTime) return `${segment.startTime} —`;
    return `${segment.startTime} — ${segment.endTime}`;
  };

  const classes = () => ["st-transcription", className].filter(Boolean).join(" ");
</script>

<details {open} class={classes()} {...rest}>
  <summary>{title}</summary>

  <div class="st-transcription__content">
    {#if hasSegments}
      <ol class="st-transcription__list">
        {#each resolvedSegments as segment, index (index)}
          <li class="st-transcription__item">
            <p class="st-transcription__meta">
              {#if segment.speaker}
                <span class="st-transcription__speaker">{segment.speaker}</span>
              {/if}
              {#if segment.speaker && formatInterval(segment)}
                <span aria-hidden="true">&nbsp;•&nbsp;</span>
              {/if}
              {#if formatInterval(segment)}
                <time>
                  <span class="st-transcription__sr-only">Horodatage {formatInterval(segment)}</span>
                  <span aria-hidden="true">{formatInterval(segment)}</span>
                </time>
              {/if}
            </p>
            <p class="st-transcription__text">{segment.text}</p>
          </li>
        {/each}
      </ol>
    {:else if hasText}
      <p class="st-transcription__text">{text}</p>
    {:else}
      <p class="st-transcription__text">Aucun contenu de transcription fourni.</p>
    {/if}
  </div>
</details>

<style>
  .st-transcription {
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .st-transcription summary {
    color: var(--st-semantic-text-primary);
    cursor: var(--st-cursor-interactive, pointer);
    font-weight: 600;
    list-style: none;
  }

  .st-transcription summary::marker {
    color: var(--st-semantic-text-secondary);
  }

  .st-transcription__content {
    margin-top: 0.75rem;
  }

  .st-transcription__list {
    margin: 0;
    padding-left: 1rem;
  }

  .st-transcription__item + .st-transcription__item {
    margin-top: 0.625rem;
  }

  .st-transcription__meta {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    margin: 0;
  }

  .st-transcription__speaker {
    font-weight: 600;
  }

  .st-transcription__text {
    color: var(--st-semantic-text-primary);
    margin: 0.2rem 0 0;
  }

  .st-transcription__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
