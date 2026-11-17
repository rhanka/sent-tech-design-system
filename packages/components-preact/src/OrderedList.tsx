import type { OlHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

// Forme item alignée sur le canon Svelte : `content` (+ `label` accepté en alias
// de compat). Le test reconnaît l'une OU l'autre clé pour ne pas rendre vide.
export type OrderedListItem = { content?: ComponentChildren; children?: OrderedListInput[] };
export type OrderedListInput = ComponentChildren | OrderedListItem;
export type OrderedListProps = OlHTMLAttributes<HTMLOListElement> & {
  items: OrderedListInput[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  nested?: MaybeSignal<boolean>;
};
function renderListItem(item: OrderedListInput, index: number, ordered: boolean): ComponentChildren {
  if (typeof item === "object" && item !== null && "content" in (item as OrderedListItem)) {
    const cast = item as OrderedListItem;
    const hasChildren = Array.isArray(cast.children) && cast.children.length > 0;
    return (
      <li key={index} className={ordered ? "st-orderedList__item" : "st-unorderedList__item"}>
        {cast.content}
        {hasChildren ? (
          ordered ? (
            <ol className="st-orderedList st-orderedList--nested">
              {cast.children!.map((child, childIndex) => renderListItem(child, childIndex, true))}
            </ol>
          ) : (
            <ul className="st-unorderedList st-unorderedList--nested">
              {cast.children!.map((child, childIndex) => renderListItem(child, childIndex, false))}
            </ul>
          )
        ) : null}
      </li>
    );
  }
  return (
    <li key={index} className={ordered ? "st-orderedList__item" : "st-unorderedList__item"}>
      {item as ComponentChildren}
    </li>
  );
}
export function OrderedList({ items, nested: nestedInput = false, className, ...rest }: OrderedListProps) {
  const nested = useValue(nestedInput);
  return (
    <ol {...rest} className={classNames("st-orderedList", nested && "st-orderedList--nested", className)}>
      {items.map((item, index) => renderListItem(item, index, true))}
    </ol>
  );
}
