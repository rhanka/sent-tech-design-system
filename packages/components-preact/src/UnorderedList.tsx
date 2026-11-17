import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

// Forme item alignée sur le canon Svelte : `content` (+ `children` accepté en
// alias de compatibilité pour les listes imbriquées).
export type UnorderedListItem = { content?: ComponentChildren; children?: UnorderedListInput[] };
export type UnorderedListInput = ComponentChildren | UnorderedListItem;
export type UnorderedListProps = HTMLAttributes<HTMLUListElement> & {
  items: UnorderedListInput[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  nested?: MaybeSignal<boolean>;
};
function renderListItem(item: UnorderedListInput, index: number): ComponentChildren {
  if (typeof item === "object" && item !== null && "content" in (item as UnorderedListItem)) {
    const cast = item as UnorderedListItem;
    const hasChildren = Array.isArray(cast.children) && cast.children.length > 0;
    return (
      <li key={index} className="st-unorderedList__item">
        {cast.content}
        {hasChildren ? (
          <ul className="st-unorderedList st-unorderedList--nested">
            {cast.children!.map((child, childIndex) => renderListItem(child, childIndex))}
          </ul>
        ) : null}
      </li>
    );
  }
  return (
    <li key={index} className="st-unorderedList__item">
      {item as ComponentChildren}
    </li>
  );
}
export function UnorderedList({ items, nested: nestedInput = false, className, ...rest }: UnorderedListProps) {
  const nested = useValue(nestedInput);
  return (
    <ul {...rest} className={classNames("st-unorderedList", nested && "st-unorderedList--nested", className)}>
      {items.map((item, index) => renderListItem(item, index))}
    </ul>
  );
}
