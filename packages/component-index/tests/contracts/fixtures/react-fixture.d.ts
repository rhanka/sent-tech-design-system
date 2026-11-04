// React extractor fixture (spec 7.3). Self-contained stand-ins carry the
// names the extractor keys on (ReactNode, EventEmitter-free).
export type ReactNode = string | number | null;
export type RefObject = { current: unknown };
export type CardProps = {
  children?: ReactNode;
  title: string;
  cell?: (row: string) => ReactNode;
  footer?: ReactNode;
  onSubmit?: (ok: boolean) => void;
  onselect?: (key: string) => void;
  helper?: (value: number) => string;
  ref?: RefObject;
  count?: number;
};
export type BoxProps<T = string> = {
  value?: T;
  label?: string;
};
export type RawProps<T> = {
  value?: T;
};
