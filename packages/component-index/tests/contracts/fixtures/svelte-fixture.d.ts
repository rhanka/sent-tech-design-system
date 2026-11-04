// Svelte extractor fixture (spec 7.2). Self-contained: the Snippet and
// Component stand-ins carry the names the extractor keys on.
export type Snippet<T extends unknown[] = []> = (...args: T) => unknown;
export interface Component<P, E, B extends string> {
  __props?: P;
  __bindable?: B;
}
export type WidgetProps = {
  title: string;
  size?: "sm" | "lg";
  children?: Snippet;
  header?: Snippet<[string]>;
  onclose?: () => void;
  onSelect?: (id: string) => void;
  callback?: (value: number) => string;
  page?: number;
};
export declare const Widget: Component<WidgetProps, {}, "page">;
export type OrphanProps = {
  label?: string;
};
export declare const Orphan: Component<OrphanProps, {}, "missing">;
export type OtherShape = {
  label?: string;
};
export declare const Fallback: Component<OtherShape, {}, "">;
