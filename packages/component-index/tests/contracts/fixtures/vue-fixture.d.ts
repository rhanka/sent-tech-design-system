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

export type SceneWidgetProps = { label: string };
declare const _default: DefineComponentLike<[], Readonly<{ onSelect?: (event: { entityId: string }) => void }>>;
export default _default;
