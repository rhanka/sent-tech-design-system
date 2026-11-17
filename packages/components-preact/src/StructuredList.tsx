import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface StructuredListItem {
  term?: ComponentChildren;
  label?: ComponentChildren;
  description?: ComponentChildren;
  value?: ComponentChildren;
}

export type StructuredListProps = Omit<HTMLAttributes<HTMLDListElement>, "className"> & {
  items: StructuredListItem[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  bordered?: MaybeSignal<boolean>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function StructuredList({ items, bordered: borderedInput = false, className, ...rest }: StructuredListProps) {
  const bordered = useValue(borderedInput);
  return (
    <dl {...rest} className={classNames("st-structuredList", bordered && "st-structuredList--bordered", className)}>
      {items.map((item, index) => (
        <div key={index} className="st-structuredList__row">
          <dt className="st-structuredList__term">{item.term ?? item.label}</dt>
          <dd className="st-structuredList__definition">{item.description ?? item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
