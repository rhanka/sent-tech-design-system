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
    invalid?: boolean;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    items?: FileUploadItem[];
    triggerLabel?: string;
    dropzoneLabel?: string;
    removeLabel?: (filename: string) => string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FileUploader, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FileUploader, "st-file-uploader", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "accept": { "alias": "accept"; "required": false; }; "multiple": { "alias": "multiple"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "items": { "alias": "items"; "required": false; }; "triggerLabel": { "alias": "triggerLabel"; "required": false; }; "dropzoneLabel": { "alias": "dropzoneLabel"; "required": false; }; "removeLabel": { "alias": "removeLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=FileUploader.d.ts.map