import * as i0 from "@angular/core";
export type TranscriptionSegment = {
    speaker?: string;
    startTime?: string;
    endTime?: string;
    text: string;
};
/** Alias used by chat-oriented consumers. */
export type TranscriptionEntry = {
    role?: string;
    text: string;
    timestamp?: string;
};
export type TranscriptionProps = {
    title?: string;
    segments?: TranscriptionSegment[];
    entries?: TranscriptionEntry[];
    text?: string;
    class?: string;
    open?: boolean;
    showTimestamps?: boolean;
};
export declare class Transcription {
    static readonly stComponentName = "Transcription";
    readonly componentName = "Transcription";
    title?: string;
    segments?: TranscriptionSegment[];
    entries?: TranscriptionEntry[];
    text?: string;
    classInput?: string;
    open?: boolean;
    showTimestamps: boolean;
    get hostClass(): string;
    get resolvedSegments(): TranscriptionSegment[];
    formatInterval(seg: TranscriptionSegment): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Transcription, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Transcription, "st-transcription", never, { "title": { "alias": "title"; "required": false; }; "segments": { "alias": "segments"; "required": false; }; "entries": { "alias": "entries"; "required": false; }; "text": { "alias": "text"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; "open": { "alias": "open"; "required": false; }; "showTimestamps": { "alias": "showTimestamps"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=Transcription.d.ts.map