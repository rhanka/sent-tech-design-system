import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { TargetedMouseEvent } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";

export type TileVariant = "static" | "clickable" | "selectable";

export type TileProps = Omit<HTMLAttributes<HTMLElement>, "onSelect" | "ref"> & {
  title?: ComponentChildren;
  description?: ComponentChildren;
  variant?: TileVariant;
  /** Pour `clickable` : si fourni, rend un `<a>`, sinon un `<button>`. */
  href?: string;
  /** Pour `selectable` : état coché. */
  selected?: boolean;
  disabled?: boolean;
  /** Pour `selectable` : notifié au changement d'état. */
  onSelect?: (selected: boolean) => void;
};
export function Tile({ title, description, variant = "static", href, selected = false, disabled = false, onSelect, onClick, children, className, ...rest }: TileProps) {
  const tileClass = classNames(
    "st-tile",
    `st-tile--${variant}`,
    variant === "selectable" && selected && "st-tile--selected",
    disabled && "st-tile--disabled",
    className,
  );
  const body = (
    <span className="st-tile__content">
      {children ?? (
        <>
          {title ? <span className="st-tile__title">{title}</span> : null}
          {description ? <span className="st-tile__description">{description}</span> : null}
        </>
      )}
    </span>
  );

  if (variant === "clickable" && href) {
    return (
      <a {...rest} className={tileClass} href={href} aria-disabled={disabled || undefined} onClick={onClick as unknown as (event: TargetedMouseEvent<HTMLAnchorElement>) => void}>
        {body}
      </a>
    );
  }
  if (variant === "clickable") {
    return (
      <button {...rest} type="button" className={tileClass} disabled={disabled} onClick={onClick as unknown as (event: TargetedMouseEvent<HTMLButtonElement>) => void}>
        {body}
      </button>
    );
  }
  if (variant === "selectable") {
    return (
      <label className={tileClass}>
        <input
          type="checkbox"
          className="st-tile__input"
          checked={selected}
          disabled={disabled}
          onChange={(event) => onSelect?.(event.currentTarget.checked)}
        />
        {body}
      </label>
    );
  }
  return (
    <div {...rest} className={tileClass} onClick={onClick as unknown as (event: TargetedMouseEvent<HTMLDivElement>) => void}>
      {body}
    </div>
  );
}
