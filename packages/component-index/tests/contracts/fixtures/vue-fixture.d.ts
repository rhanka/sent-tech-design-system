// Vue extractor fixture (spec 7.4). The DefineComponent stand-in keeps the
// type-argument positions the extractor scans structurally.
export interface DefineComponentLike<E, P> {
  __emits?: E;
  __props?: P;
}
export type SheetProps = {
  open?: boolean;
  title?: string;
  modelValue?: string;
  count?: number;
};
export declare const Sheet: DefineComponentLike<
  ("close" | "update:modelValue")[],
  Readonly<{ onClose?: (...args: unknown[]) => void }>
>;
export type BareProps = {
  label?: string;
};
export declare const Bare: DefineComponentLike<[], Readonly<{}>>;

// script-setup declarations encode emits as an object and expose $emit
// overloads on the public instance, rather than an array type argument.
export type TemplateMenuProps = { open?: boolean };
export declare const TemplateMenu: DefineComponentLike<
  { select: (item: string) => void; "update:open": (value: boolean) => void },
  Readonly<{ onSelect?: (item: string) => void }>
> & (new () => {
  $emit: {
    (event: "select", item: string): void;
    (event: "update:open", value: boolean): void;
  };
});
