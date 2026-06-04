import { defineComponent, h } from "vue";
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
  items?: FileUploadItem[];
  disabled?: boolean;
  class?: string;
};

export const FileUploader = defineComponent({
  name: "FileUploader",
  props: {
    label: { type: String, default: "Upload" },
    items: { type: Array as () => FileUploadItem[], default: () => [] },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          class: classNames("st-fileUploader-field", props.class),
        },
        [
          h(
            "div",
            {
              class: classNames(
                "st-fileUploader__dropzone",
                props.disabled && "st-fileUploader__dropzone--disabled",
              ),
            },
            [
              h("span", { class: "st-fileUploader__trigger" }, props.label),
              h("input", {
                class: "st-fileUploader__input",
                type: "file",
                disabled: props.disabled,
                "aria-label": props.label,
              }),
            ],
          ),
          h(
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
                    { class: "st-fileUploader__itemName st-fileUploader__name" },
                    name,
                  ),
                  sizeLabel
                    ? h(
                        "span",
                        { class: "st-fileUploader__itemSize" },
                        sizeLabel,
                      )
                    : null,
                  item.error
                    ? h(
                        "span",
                        { class: "st-fileUploader__itemError" },
                        item.error,
                      )
                    : null,
                ],
              );
            }),
          ),
        ],
      );
  },
});
