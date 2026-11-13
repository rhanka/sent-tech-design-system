<script setup lang="ts">
import { computed, useId, useAttrs } from 'vue';
import { ref } from 'vue';
import { classNames } from './classNames.js';

export type FileUploadStatus = 'idle' | 'uploading' | 'complete' | 'error';
export type FileUploadItem = {
  id?: string;
  name?: string;
  size?: number;
  file?: { name: string; size?: number };
  status?: FileUploadStatus;
  progress?: number;
  error?: string;
};
function formatFileSize(bytes: number | undefined): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0)
    return '';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, i);
  const formatted =
    value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[i]}`;
}
function fileItemName(item: FileUploadItem): string | undefined {
  return item.file?.name ?? item.name;
}
function fileItemSize(item: FileUploadItem): number | undefined {
  return item.file?.size ?? item.size;
}
export type FileUploaderProps = {
  id?: string;
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
  onRemoveItem?: (index: number) => void;
  class?: string;
};
defineOptions({ name: 'FileUploader' });
const props = withDefaults(defineProps<FileUploaderProps>(), {
  id: undefined,
  label: undefined,
  helperText: undefined,
  errorText: undefined,
  invalid: false,
  accept: undefined,
  multiple: false,
  disabled: false,
  items: () => [],
  triggerLabel: undefined,
  dropzoneLabel: 'Drag and drop files here',
  removeLabel: (filename: string) => `Remove ${filename}`,
  onRemoveItem: undefined,
  class: undefined,
});
const attrs = useAttrs();
const generatedId = `st-file-uploader-${useId()}`;
const inputRef = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
function openPicker() {
  if (props.disabled) return;
  inputRef.value?.click();
}
function onDragOver(e: DragEvent) {
  if (props.disabled) return;
  e.preventDefault();
  isDragOver.value = true;
}
function onDragLeave(e: DragEvent) {
  e.preventDefault();
  isDragOver.value = false;
}
function onDrop(e: DragEvent) {
  if (props.disabled) return;
  e.preventDefault();
  isDragOver.value = false;
}
const inputId = computed(() => props.id ?? generatedId);
const isInvalid = computed(() => props.invalid || Boolean(props.errorText));
const effectiveTriggerLabel = computed(
  () => props.triggerLabel ?? (props.multiple ? 'Choose files' : 'Choose file'),
);
</script>

<template>
  <div
    v-bind="attrs"
    :class="classNames('st-field', 'st-fileUploader-field', props.class)"
  >
    <template v-if="props.label"
      ><label :class="'st-field__label'" :for="inputId">{{
        props.label
      }}</label></template
    ><template v-else></template>
    <div
      :class="
        classNames(
          'st-fileUploader__dropzone',
          isDragOver && 'st-fileUploader__dropzone--dragover',
          isInvalid && 'st-fileUploader__dropzone--invalid',
          props.disabled && 'st-fileUploader__dropzone--disabled',
        )
      "
      :role="'presentation'"
      @dragover="onDragOver"
      @dragenter="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <input
        ref="inputRef"
        :id="inputId"
        :class="'st-fileUploader__input'"
        :type="'file'"
        :accept="props.accept"
        :multiple="props.multiple"
        :disabled="props.disabled"
        :aria-invalid="isInvalid ? 'true' : undefined"
      />
      <div :class="'st-fileUploader__content'">
        <span :class="'st-fileUploader__affordance'" :aria-hidden="'true'"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            :width="18"
            :height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-upload-icon lucide-upload"
            :aria-hidden="'true'"
          >
            <path d="M12 3v12" />
            <path d="m17 8-5-5-5 5" />
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /></svg
        ></span>
        <button
          :type="'button'"
          :class="'st-fileUploader__trigger'"
          :disabled="props.disabled"
          @click="openPicker"
        >
          {{ effectiveTriggerLabel }}
        </button>
        <span :class="'st-fileUploader__hint'">{{ props.dropzoneLabel }}</span>
      </div>
    </div>
    <template v-if="props.errorText"
      ><span :class="'st-field__error'">{{ props.errorText }}</span></template
    ><template v-else
      ><template v-if="props.helperText"
        ><span :class="'st-field__help'">{{ props.helperText }}</span></template
      ><template v-else></template
    ></template>
    <template v-if="props.items.length > 0"
      ><ul :class="'st-fileUploader__list'">
        <template v-for="(item, index) in props.items" :key="item.id ?? fileItemName(item) ?? index"
          ><template v-for="name in [fileItemName(item)]"
            ><template v-for="sizeLabel in [formatFileSize(fileItemSize(item))]"
              ><li
                :class="
                  classNames(
                    'st-fileUploader__item',
                    item.status && `st-fileUploader__item--${item.status}`,
                  )
                "
              >
                <span :class="'st-fileUploader__itemIcon'" :aria-hidden="'true'"
                  ><template v-if="item.status === 'uploading'"
                    ><span :class="'st-fileUploader__spinner'"
                      ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        :width="16"
                        :height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-loader-circle-icon lucide-loader-circle"
                        :aria-hidden="'true'"
                      >
                        <path
                          d="M21 12a9 9 0 1 1-6.219-8.56"
                        /></svg></span></template
                  ><template v-else
                    ><template v-if="item.status === 'complete'"
                      ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        :width="16"
                        :height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-circle-check-icon lucide-circle-check"
                        :aria-hidden="'true'"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" /></svg></template
                    ><template v-else
                      ><template v-if="item.status === 'error'"
                        ><svg
                          xmlns="http://www.w3.org/2000/svg"
                          :width="16"
                          :height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="lucide lucide-circle-alert-icon lucide-circle-alert"
                          :aria-hidden="'true'"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" x2="12" y1="8" y2="12" />
                          <line
                            x1="12"
                            x2="12.01"
                            y1="16"
                            y2="16"
                          /></svg></template
                      ><template v-else
                        ><svg
                          xmlns="http://www.w3.org/2000/svg"
                          :width="16"
                          :height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="lucide lucide-file-icon lucide-file"
                          :aria-hidden="'true'"
                        >
                          <path
                            d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
                          />
                          <path
                            d="M14 2v5a1 1 0 0 0 1 1h5"
                          /></svg></template></template></template
                ></span>
                <span :class="'st-fileUploader__itemMeta'"
                  ><span
                    :class="'st-fileUploader__itemName st-fileUploader__name'"
                    >{{ name }}</span
                  >
                  <template v-if="sizeLabel"
                    ><span :class="'st-fileUploader__itemSize'">{{
                      sizeLabel
                    }}</span></template
                  ><template v-else></template>
                  <template v-if="item.status === 'error' && item.error"
                    ><span :class="'st-fileUploader__itemError'">{{
                      item.error
                    }}</span></template
                  ><template v-else></template
                ></span>
                <button
                  :type="'button'"
                  :class="'st-fileUploader__remove'"
                  :aria-label="props.removeLabel(name ?? '')"
                  :disabled="props.disabled"
                  @click="() => props.onRemoveItem?.(index)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    :width="16"
                    :height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-x-icon lucide-x"
                    :aria-hidden="'true'"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button></li></template></template
        ></template></ul></template
    ><template v-else></template>
  </div>
</template>
