import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
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
    file?: {
        name: string;
        size?: number;
    };
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
export declare class FileUploader {
    static readonly stComponentName = "FileUploader";
    readonly componentName = "FileUploader";
    label?: string;
    helperText?: string;
    errorText?: string;
    invalid: boolean;
    accept?: string;
    multiple: boolean;
    disabled: boolean;
    items?: FileUploadItem[];
    triggerLabel?: string;
    dropzoneLabel: string;
    removeLabel: (filename: string) => string;
    classInput?: string;
    /** Emits the freshly-selected/dropped files (native parity with the Svelte `onfiles`). */
    files: EventEmitter<File[]>;
    /** Emits the index of the item whose remove button was pressed. */
    remove: EventEmitter<number>;
    readonly inputId: string;
    readonly helperId: string;
    readonly errorId: string;
    private isDragOver;
    get isInvalid(): boolean;
    get effectiveTriggerLabel(): string;
    get hostClass(): string;
    get dropzoneClass(): string;
    itemClass(item: FileUploadItem): string;
    itemName(item: FileUploadItem): string;
    itemSize(item: FileUploadItem): string;
    openPicker(): void;
    onChange(event: Event): void;
    onDragOver(event: DragEvent): void;
    onDragLeave(event: DragEvent): void;
    onDrop(event: DragEvent): void;
    removeAt(index: number): void;
    private emitFiles;
    static ɵfac: i0.ɵɵFactoryDeclaration<FileUploader, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FileUploader, "st-file-uploader", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "accept": { "alias": "accept"; "required": false; }; "multiple": { "alias": "multiple"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "items": { "alias": "items"; "required": false; }; "triggerLabel": { "alias": "triggerLabel"; "required": false; }; "dropzoneLabel": { "alias": "dropzoneLabel"; "required": false; }; "removeLabel": { "alias": "removeLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "files": "files"; "remove": "remove"; }, never, never, true, never>;
}
//# sourceMappingURL=FileUploader.d.ts.map