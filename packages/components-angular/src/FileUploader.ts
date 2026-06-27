import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type FileUploadStatus = "idle" | "uploading" | "complete" | "error";

/**
 * Accepts both the flat React/Vue shape (`{ name, size }`) and the Svelte
 * canonical shape (`{ file: { name, size } }`). When `file` is present it takes
 * precedence so a consumer can pass the exact same item array used in Svelte.
 */
export type FileUploadItem = {
  id?: string;
  name?: string;
  size?: number;
  file?: { name: string; size?: number };
  status?: FileUploadStatus;
  error?: string;
};

export type FileUploaderProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  items?: FileUploadItem[];
  triggerLabel?: string;
  dropzoneLabel?: string;
  removeLabel?: (filename: string) => string;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-file-uploader-${++_counter}`;
}

function formatSize(bytes: number | undefined): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const formatted = value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[i]}`;
}

@Component({
  selector: "st-file-uploader",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <label class="st-field__label" [attr.for]="inputId">{{ label }}</label>
      }

      <div
        [class]="dropzoneClass"
        role="presentation"
        (dragover)="onDragOver($event)"
        (dragenter)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <input
          [id]="inputId"
          type="file"
          class="st-fileUploader__input"
          [attr.accept]="accept ?? null"
          [attr.multiple]="multiple ? '' : null"
          [disabled]="disabled"
          [attr.aria-invalid]="isInvalid ? 'true' : null"
          [attr.aria-describedby]="errorText ? errorId : (helperText ? helperId : null)"
          (change)="onChange($event)"
        />
        <div class="st-fileUploader__content">
          <span class="st-fileUploader__affordance" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"></path><path d="m17 8-5-5-5 5"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path></svg></span>
          <button
            type="button"
            class="st-fileUploader__trigger"
            [disabled]="disabled"
            (click)="openPicker()"
          >
            {{ effectiveTriggerLabel }}
          </button>
          <span class="st-fileUploader__hint">{{ dropzoneLabel }}</span>
        </div>
      </div>

      @if (errorText) {
        <span class="st-field__error" [id]="errorId">{{ errorText }}</span>
      } @else if (helperText) {
        <span class="st-field__help" [id]="helperId">{{ helperText }}</span>
      }

      @if (items && items.length > 0) {
        <ul class="st-fileUploader__list">
          @for (item of items; track $index) {
            <li [class]="itemClass(item)">
              <span class="st-fileUploader__itemIcon" aria-hidden="true">
                @if (item.status === "uploading") {
                  <span class="st-fileUploader__spinner"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></span>
                } @else if (item.status === "complete") {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                } @else if (item.status === "error") {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path></svg>
                }
              </span>
              <span class="st-fileUploader__itemMeta">
                <span class="st-fileUploader__itemName st-fileUploader__name">{{ itemName(item) }}</span>
                <span class="st-fileUploader__itemSize">{{ itemSize(item) }}</span>
                @if (item.status === "error" && item.error) {
                  <span class="st-fileUploader__itemError">{{ item.error }}</span>
                }
              </span>
              <button
                type="button"
                class="st-fileUploader__remove"
                [attr.aria-label]="removeLabel(itemName(item))"
                [disabled]="disabled"
                (click)="removeAt($index)"
              ><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class FileUploader {
  static readonly stComponentName = "FileUploader";
  readonly componentName = "FileUploader";
  @NgInput() label?: string;
  @NgInput() helperText?: string;
  @NgInput() errorText?: string;
  @NgInput() invalid = false;
  @NgInput() accept?: string;
  @NgInput() multiple = false;
  @NgInput() disabled = false;
  @NgInput() items?: FileUploadItem[];
  @NgInput() triggerLabel?: string;
  @NgInput() dropzoneLabel = "Drag and drop files here";
  @NgInput() removeLabel: (filename: string) => string = (filename) => `Remove ${filename}`;
  @NgInput("class") classInput?: string;

  /** Emits the freshly-selected/dropped files (native parity with the Svelte `onfiles`). */
  @Output() files = new EventEmitter<File[]>();
  /** Emits the index of the item whose remove button was pressed. */
  @Output() remove = new EventEmitter<number>();

  readonly inputId = nextId();
  readonly helperId = `${this.inputId}-help`;
  readonly errorId = `${this.inputId}-error`;

  private isDragOver = false;

  get isInvalid(): boolean {
    return this.invalid || Boolean(this.errorText);
  }

  get effectiveTriggerLabel(): string {
    return this.triggerLabel ?? (this.multiple ? "Choose files" : "Choose file");
  }

  get hostClass(): string {
    return classNames("st-field", "st-fileUploader-field", this.classInput);
  }

  get dropzoneClass(): string {
    return classNames(
      "st-fileUploader__dropzone",
      this.isDragOver && "st-fileUploader__dropzone--dragover",
      this.isInvalid && "st-fileUploader__dropzone--invalid",
      this.disabled && "st-fileUploader__dropzone--disabled",
    );
  }

  itemClass(item: FileUploadItem): string {
    return classNames(
      "st-fileUploader__item",
      item.status && `st-fileUploader__item--${item.status}`,
    );
  }

  itemName(item: FileUploadItem): string {
    return item.file?.name ?? item.name ?? "";
  }

  itemSize(item: FileUploadItem): string {
    return formatSize(item.file ? item.file.size : item.size);
  }

  openPicker(): void {
    if (this.disabled) return;
    const input = document.getElementById(this.inputId) as HTMLInputElement | null;
    input?.click();
  }

  onChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const list = input.files ? Array.from(input.files) : [];
    this.emitFiles(list);
    // Allow re-selecting the same file later.
    input.value = "";
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    this.isDragOver = false;
    const dropped = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
    this.emitFiles(dropped);
  }

  removeAt(index: number): void {
    if (this.disabled) return;
    this.remove.emit(index);
  }

  private emitFiles(incoming: File[]): void {
    if (this.disabled || incoming.length === 0) return;
    const next = this.multiple ? incoming : incoming.slice(0, 1);
    this.files.emit(next);
  }
}
