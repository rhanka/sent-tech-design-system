import { defineComponent, h } from "vue";
import { CircleAlert, CircleCheck, File as FileIcon, LoaderCircle, Upload, X } from "lucide-vue-next";
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

export const FileUploader = defineComponent({
  name: "FileUploader",
  props: {
    label: { type: String, default: undefined },
    helperText: { type: String, default: undefined },
    errorText: { type: String, default: undefined },
    invalid: { type: Boolean, default: false },
    accept: { type: String, default: undefined },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    items: { type: Array as () => FileUploadItem[], default: () => [] },
    triggerLabel: { type: String, default: undefined },
    dropzoneLabel: { type: String, default: "Drag and drop files here" },
    removeLabel: {
      type: Function as unknown as () => (filename: string) => string,
      default: (filename: string) => `Remove ${filename}`,
    },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const isInvalid = props.invalid || Boolean(props.errorText);
      const effectiveTriggerLabel =
        props.triggerLabel ?? (props.multiple ? "Choose files" : "Choose file");
      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-field", "st-fileUploader-field", props.class),
        },
        [
          props.label
            ? h("label", { class: "st-field__label" }, props.label)
            : null,
          h(
            "div",
            {
              class: classNames(
                "st-fileUploader__dropzone",
                isInvalid && "st-fileUploader__dropzone--invalid",
                props.disabled && "st-fileUploader__dropzone--disabled",
              ),
              role: "presentation",
            },
            [
              h("input", {
                class: "st-fileUploader__input",
                type: "file",
                accept: props.accept,
                multiple: props.multiple,
                disabled: props.disabled,
                "aria-invalid": isInvalid ? "true" : undefined,
              }),
              h("div", { class: "st-fileUploader__content" }, [
                h(
                  "span",
                  { class: "st-fileUploader__affordance", "aria-hidden": "true" },
                  [h(Upload, { size: 18, strokeWidth: 2, "aria-hidden": "true" })],
                ),
                h(
                  "button",
                  { type: "button", class: "st-fileUploader__trigger", disabled: props.disabled },
                  effectiveTriggerLabel,
                ),
                h("span", { class: "st-fileUploader__hint" }, props.dropzoneLabel),
              ]),
            ],
          ),
          props.errorText
            ? h("span", { class: "st-field__error" }, props.errorText)
            : props.helperText
              ? h("span", { class: "st-field__help" }, props.helperText)
              : null,
          props.items.length > 0
            ? h(
                "ul",
                { class: "st-fileUploader__list" },
                props.items.map((item, index) => {
                  const name = fileItemName(item);
                  const sizeLabel = formatFileSize(fileItemSize(item));
                  return h(
                    "li",
                    {
                      key: item.id ?? name ?? index,
                      class: classNames(
                        "st-fileUploader__item",
                        item.status && `st-fileUploader__item--${item.status}`,
                      ),
                    },
                    [
                      h(
                        "span",
                        { class: "st-fileUploader__itemIcon", "aria-hidden": "true" },
                        [
                          item.status === "uploading"
                            ? h("span", { class: "st-fileUploader__spinner" }, [
                                h(LoaderCircle, { size: 16, strokeWidth: 2, "aria-hidden": "true" }),
                              ])
                            : item.status === "complete"
                              ? h(CircleCheck, { size: 16, strokeWidth: 2, "aria-hidden": "true" })
                              : item.status === "error"
                                ? h(CircleAlert, { size: 16, strokeWidth: 2, "aria-hidden": "true" })
                                : h(FileIcon, { size: 16, strokeWidth: 2, "aria-hidden": "true" }),
                        ],
                      ),
                      h("span", { class: "st-fileUploader__itemMeta" }, [
                        h(
                          "span",
                          { class: "st-fileUploader__itemName st-fileUploader__name" },
                          name,
                        ),
                        sizeLabel
                          ? h("span", { class: "st-fileUploader__itemSize" }, sizeLabel)
                          : null,
                        item.status === "error" && item.error
                          ? h("span", { class: "st-fileUploader__itemError" }, item.error)
                          : null,
                      ]),
                      h(
                        "button",
                        {
                          type: "button",
                          class: "st-fileUploader__remove",
                          "aria-label": props.removeLabel(name ?? ""),
                          disabled: props.disabled,
                        },
                        [h(X, { size: 16, strokeWidth: 2, "aria-hidden": "true" })],
                      ),
                    ],
                  );
                }),
              )
            : null,
        ],
      );
    };
  },
});
