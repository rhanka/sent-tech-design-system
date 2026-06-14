import { Component, Input as NgInput } from "@angular/core";

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

@Component({
  selector: "st-file-uploader",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class FileUploader {
  static readonly stComponentName = "FileUploader";
  readonly componentName = "FileUploader";
  @NgInput() label?: string;
  @NgInput() helperText?: string;
  @NgInput() errorText?: string;
  @NgInput() invalid?: boolean;
  @NgInput() accept?: string;
  @NgInput() multiple?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() items?: FileUploadItem[];
  @NgInput() triggerLabel?: string;
  @NgInput() dropzoneLabel?: string;
  @NgInput() removeLabel?: (filename: string) => string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-fileUploader", this.classInput].filter(Boolean).join(" ");
  }
}
