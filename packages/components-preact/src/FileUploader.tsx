import { CircleAlert, CircleCheck, File as FileIcon, LoaderCircle, Upload, X } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useId, useRef, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

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
  file?: { name: string; size?: number }
  status?: FileUploadStatus;
  progress?: number;
  error?: ComponentChildren;
};

export type FileUploaderProps = HTMLAttributes<HTMLDivElement> & {
  /** Field id. Wires the <label> (htmlFor) to the <input> (id). Auto-generated when omitted. */
  id?: string;
  label?: ComponentChildren;
  helperText?: ComponentChildren;
  errorText?: ComponentChildren;
  invalid?: MaybeSignal<boolean>;
  accept?: string;
  multiple?: boolean;
  disabled?: MaybeSignal<boolean>;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  items?: MaybeSignal<FileUploadItem[]>;
  /** Trigger button text. Defaults to "Choose file(s)" based on `multiple`. */
  triggerLabel?: ComponentChildren;
  /** Hint shown next to the trigger inside the dropzone. */
  dropzoneLabel?: ComponentChildren;
  /** Builds the per-file remove button accessible name. */
  removeLabel?: (filename: string) => string;
  /** Called when the remove button is clicked for a given item index. */
  onRemoveItem?: (index: number) => void;
};

function formatFileSize(bytes: number | undefined): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const formatted = value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[i]}`;
}

function fileItemName(item: FileUploadItem): string | undefined {
  return item.file?.name ?? item.name;
}

function fileItemSize(item: FileUploadItem): number | undefined {
  return item.file?.size ?? item.size;
}

type DragHandler = (event: { preventDefault: () => void }) => void;

export function FileUploader({
  id,
  label,
  helperText,
  errorText,
  invalid: invalidInput = false,
  accept,
  multiple = false,
  disabled: disabledInput = false,
  items: itemsInput = [],
  triggerLabel,
  dropzoneLabel = "Drag and drop files here",
  removeLabel = (filename) => `Remove ${filename}`,
  onRemoveItem,
  className,
  ...rest
}: FileUploaderProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const invalid = useValue(invalidInput);
  const disabled = useValue(disabledInput) ?? false;
  const items = useValue(itemsInput);
  const isInvalid = invalid || Boolean(errorText);
  const effectiveTriggerLabel = triggerLabel ?? (multiple ? "Choose files" : "Choose file");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function openPicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  const onDragOver: DragHandler = (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragOver(true);
  }

  const onDragLeave: DragHandler = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  }

  const onDrop: DragHandler = (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragOver(false);
  }

  return (
    <div {...rest} className={classNames("st-field", "st-fileUploader-field", className)}>
      {label ? <label className="st-field__label" htmlFor={inputId}>{label}</label> : null}
      <div
        className={classNames(
          "st-fileUploader__dropzone",
          isDragOver && "st-fileUploader__dropzone--dragover",
          isInvalid && "st-fileUploader__dropzone--invalid",
          disabled && "st-fileUploader__dropzone--disabled",
        )}
        role="presentation"
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          className="st-fileUploader__input"
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-invalid={isInvalid ? "true" : undefined}
        />
        <div className="st-fileUploader__content">
          <span className="st-fileUploader__affordance" aria-hidden="true">
            <Upload size={18} strokeWidth={2} aria-hidden="true" />
          </span>
          <button type="button" className="st-fileUploader__trigger" disabled={disabled} onClick={openPicker}>
            {effectiveTriggerLabel}
          </button>
          <span className="st-fileUploader__hint">{dropzoneLabel}</span>
        </div>
      </div>
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
      {items.length > 0 ? (
        <ul className="st-fileUploader__list">
          {items.map((item, index) => {
            const name = fileItemName(item);
            const size = fileItemSize(item);
            const sizeLabel = formatFileSize(size);
            return (
              <li key={item.id ?? name ?? index} className={classNames("st-fileUploader__item", item.status && `st-fileUploader__item--${item.status}`)}>
                <span className="st-fileUploader__itemIcon" aria-hidden="true">
                  {item.status === "uploading" ? (
                    <span className="st-fileUploader__spinner">
                      <LoaderCircle size={16} strokeWidth={2} aria-hidden="true" />
                    </span>
                  ) : item.status === "complete" ? (
                    <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
                  ) : item.status === "error" ? (
                    <CircleAlert size={16} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <FileIcon size={16} strokeWidth={2} aria-hidden="true" />
                  )}
                </span>
                <span className="st-fileUploader__itemMeta">
                  <span className="st-fileUploader__itemName st-fileUploader__name">{name}</span>
                  {sizeLabel ? <span className="st-fileUploader__itemSize">{sizeLabel}</span> : null}
                  {item.status === "error" && item.error ? <span className="st-fileUploader__itemError">{item.error}</span> : null}
                </span>
                <button type="button" className="st-fileUploader__remove" aria-label={removeLabel(name ?? "")} disabled={disabled} onClick={() => onRemoveItem?.(index)}>
                  <X size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
