import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type FileUploadStatus = "idle" | "uploading" | "complete" | "error";

export type FileUploadItem = {
  id?: string;
  name: string;
  size?: number;
  status?: FileUploadStatus;
  error?: string;
};

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
            props.items.map((item, index) =>
              h(
                "li",
                {
                  key: item.id ?? item.name ?? index,
                  class: classNames(
                    "st-fileUploader__item",
                    item.status && `st-fileUploader__item--${item.status}`,
                  ),
                },
                [
                  h(
                    "span",
                    { class: "st-fileUploader__itemName st-fileUploader__name" },
                    item.name,
                  ),
                  item.error
                    ? h(
                        "span",
                        { class: "st-fileUploader__itemError" },
                        item.error,
                      )
                    : null,
                ],
              ),
            ),
          ),
        ],
      );
  },
});
