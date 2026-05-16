<script lang="ts" module>
  export type FileUploadStatus = "idle" | "uploading" | "complete" | "error";

  export type FileUploadItem = {
    file: File;
    status: FileUploadStatus;
    progress?: number;
    error?: string;
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type FileUploaderProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid?: boolean;
    accept?: string;
    multiple?: boolean;
    maxSizeBytes?: number;
    disabled?: boolean;
    files?: File[];
    onfiles?: (files: File[]) => void;
    triggerLabel?: string;
    dropzoneLabel?: string;
    removeLabel?: (filename: string) => string;
    maxSizeErrorLabel?: (filename: string, maxSizeBytes: number) => string;
    id?: string;
    class?: string;
  };

  let {
    label,
    helperText,
    errorText,
    invalid = false,
    accept,
    multiple = false,
    maxSizeBytes,
    disabled = false,
    files = $bindable([]),
    onfiles,
    triggerLabel,
    dropzoneLabel = "Drag and drop files here",
    removeLabel = (filename) => `Remove ${filename}`,
    maxSizeErrorLabel = (filename, max) =>
      `${filename} exceeds the ${formatSize(max)} size limit`,
    id,
    class: className,
    ...rest
  }: FileUploaderProps = $props();

  const generatedId = `st-file-uploader-${Math.random().toString(36).slice(2, 9)}`;
  const inputId = $derived(id ?? generatedId);
  const helperId = $derived(`${inputId}-help`);
  const errorId = $derived(`${inputId}-error`);

  let inputRef = $state<HTMLInputElement | null>(null);
  let isDragOver = $state(false);

  const isInvalid = $derived(invalid || Boolean(errorText));
  const effectiveTriggerLabel = $derived(
    triggerLabel ?? (multiple ? "Choose files" : "Choose file")
  );

  function fieldClasses() {
    return ["st-field", "st-fileUploader-field", className].filter(Boolean).join(" ");
  }

  function dropzoneClasses() {
    return [
      "st-fileUploader__dropzone",
      isDragOver ? "st-fileUploader__dropzone--dragover" : null,
      isInvalid ? "st-fileUploader__dropzone--invalid" : null,
      disabled ? "st-fileUploader__dropzone--disabled" : null
    ]
      .filter(Boolean)
      .join(" ");
  }

  function formatSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) return "";
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, i);
    const formatted = value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1);
    return `${formatted} ${units[i]}`;
  }

  function appendFiles(incoming: File[]) {
    if (disabled || incoming.length === 0) return;
    const next = multiple ? [...files, ...incoming] : incoming.slice(0, 1);
    files = next;
    onfiles?.(next);
  }

  function onChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const list = input.files ? Array.from(input.files) : [];
    appendFiles(list);
    // Allow re-selecting the same file later.
    input.value = "";
  }

  function openPicker() {
    if (disabled) return;
    inputRef?.click();
  }

  function onTriggerKeydown(event: KeyboardEvent) {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  }

  function onDragOver(event: DragEvent) {
    if (disabled) return;
    event.preventDefault();
    isDragOver = true;
  }

  function onDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
  }

  function onDrop(event: DragEvent) {
    if (disabled) return;
    event.preventDefault();
    isDragOver = false;
    const dropped = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
    if (dropped.length === 0) return;
    appendFiles(dropped);
  }

  function removeAt(index: number) {
    if (disabled) return;
    const next = files.filter((_, i) => i !== index);
    files = next;
    onfiles?.(next);
  }

  function fileError(file: File): string | undefined {
    if (typeof maxSizeBytes === "number" && file.size > maxSizeBytes) {
      return maxSizeErrorLabel(file.name, maxSizeBytes);
    }
    return undefined;
  }
</script>

<div {...rest} class={fieldClasses()}>
  {#if label}
    <label class="st-field__label" for={inputId}>{label}</label>
  {/if}

  <div
    class={dropzoneClasses()}
    role="presentation"
    ondragover={onDragOver}
    ondragenter={onDragOver}
    ondragleave={onDragLeave}
    ondrop={onDrop}
  >
    <input
      bind:this={inputRef}
      id={inputId}
      type="file"
      class="st-fileUploader__input"
      {accept}
      {multiple}
      {disabled}
      aria-invalid={isInvalid ? "true" : undefined}
      aria-describedby={errorText ? errorId : helperText ? helperId : undefined}
      onchange={onChange}
    />
    <div class="st-fileUploader__content">
      <button
        type="button"
        class="st-fileUploader__trigger"
        {disabled}
        onclick={openPicker}
        onkeydown={onTriggerKeydown}
      >
        {effectiveTriggerLabel}
      </button>
      <span class="st-fileUploader__hint">{dropzoneLabel}</span>
    </div>
  </div>

  {#if errorText}
    <span class="st-field__error" id={errorId}>{errorText}</span>
  {:else if helperText}
    <span class="st-field__help" id={helperId}>{helperText}</span>
  {/if}

  {#if files.length > 0}
    <ul class="st-fileUploader__list">
      {#each files as file, index (file.name + index)}
        {@const itemError = fileError(file)}
        <li
          class={[
            "st-fileUploader__item",
            itemError ? "st-fileUploader__item--error" : null
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span class="st-fileUploader__itemMeta">
            <span class="st-fileUploader__itemName">{file.name}</span>
            <span class="st-fileUploader__itemSize">{formatSize(file.size)}</span>
            {#if itemError}
              <span class="st-fileUploader__itemError">{itemError}</span>
            {/if}
          </span>
          <button
            type="button"
            class="st-fileUploader__remove"
            aria-label={removeLabel(file.name)}
            {disabled}
            onclick={() => removeAt(index)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .st-fileUploader-field {
    display: grid;
    gap: var(--st-component-field-gap, 0.5rem);
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    max-width: var(--st-component-field-maxWidth, 28rem);
  }

  .st-field__label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .st-field__help,
  .st-field__error {
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .st-field__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
  }

  .st-field__error {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error));
  }

  .st-fileUploader__dropzone {
    align-items: center;
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: 1px dashed var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    justify-content: flex-start;
    padding: var(--st-spacing-4, 1rem);
    transition:
      background var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-fileUploader__dropzone:hover:not(.st-fileUploader__dropzone--disabled) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-fileUploader__dropzone--dragover {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
  }

  .st-fileUploader__dropzone--invalid {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error));
  }

  .st-fileUploader__dropzone--disabled {
    background: var(--st-component-control-disabledBackground, var(--st-semantic-surface-subtle));
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
    opacity: 0.7;
  }

  .st-fileUploader__input {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  .st-fileUploader__content {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-fileUploader__trigger {
    align-items: center;
    background: var(--st-semantic-action-primary);
    border: 1px solid transparent;
    border-radius: var(--st-component-button-radius, 0.375rem);
    color: var(--st-semantic-action-primaryText, #ffffff);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-weight: 600;
    justify-content: center;
    min-height: 2.25rem;
    padding: 0 var(--st-spacing-3, 0.75rem);
    transition:
      background var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-fileUploader__trigger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--st-semantic-action-primary) 88%, black);
  }

  .st-fileUploader__trigger:focus-visible {
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: none;
  }

  .st-fileUploader__trigger:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .st-fileUploader__hint {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
  }

  .st-fileUploader__list {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-fileUploader__item {
    align-items: center;
    background: var(--st-semantic-surface-subtle);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-component-control-radius, 0.375rem);
    display: flex;
    gap: var(--st-spacing-3, 0.75rem);
    justify-content: space-between;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
  }

  .st-fileUploader__item--error {
    border-color: var(--st-semantic-feedback-error);
  }

  .st-fileUploader__itemMeta {
    display: grid;
    gap: 0.125rem;
    min-width: 0;
  }

  .st-fileUploader__itemName {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-fileUploader__itemSize {
    color: var(--st-semantic-text-muted);
    font-size: 0.8125rem;
  }

  .st-fileUploader__itemError {
    color: var(--st-semantic-feedback-error);
    font-size: 0.8125rem;
  }

  .st-fileUploader__remove {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 50%;
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    font: inherit;
    font-size: 1.125rem;
    height: 1.75rem;
    justify-content: center;
    line-height: 1;
    padding: 0;
    transition: background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 1.75rem;
  }

  .st-fileUploader__remove:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 14%, transparent);
  }

  .st-fileUploader__remove:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 1px;
  }

  .st-fileUploader__remove:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
