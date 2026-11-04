// Angular extractor fixture (spec 7.5). The ɵcmp stand-in carries the
// input/output/selector type arguments the extractor scans structurally.
// EventEmitter mirrors the real @angular/core shape (emit(value?: T)).
export type EventEmitter<T> = {
  emit(value?: T): void;
};
export interface ɵɵComponentDeclaration<I, O, N> {
  __inputs?: I;
  __outputs?: O;
  __ngContent?: N;
}
export type PaneProps = {
  open?: boolean;
  title?: string;
  custom?: string;
};
export declare class Pane {
  open?: boolean;
  title?: string;
  customInput?: string;
  internal?: string;
  readonly closed: EventEmitter<void>;
  readonly changed: EventEmitter<string>;
  get hostClass(): string;
  onBackdropClick(event: unknown): void;
  static ɵcmp: ɵɵComponentDeclaration<
    { open: { alias: "open"; required: false }; title: { alias: "title"; required: false }; customInput: { alias: "custom"; required: false } },
    { closed: "closed"; changed: "changed" },
    ["*", "[slot='footer']"]
  >;
}
export declare class Broken {
  label?: string;
  static ɵcmp: ɵɵComponentDeclaration<
    { label: { alias: "label"; required: false } },
    { done: "done" },
    ["*"]
  >;
}
export type BrokenProps = {
  label?: string;
  extra?: string;
};
