import type { HTMLAttributes } from "preact";
import { useId } from "preact/hooks";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface TileGroupItem {
  value: string;
  /** Tile label (Svelte-canonical). */
  label?: ComponentChildren;
  /** @deprecated Alias of `label` (compat). Use `label`. */
  title?: ComponentChildren;
  description?: ComponentChildren;
  disabled?: boolean;
}

export type TileGroupProps = Omit<HTMLAttributes<HTMLFieldSetElement>, "onChange"> & {
  legend?: ComponentChildren;
  legendHidden?: MaybeSignal<boolean>;
  items: TileGroupItem[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  value?: MaybeSignal<string>;
  name?: string;
  disabled?: MaybeSignal<boolean>;
  onChange?: (value: string) => void;
};

export function TileGroup({ legend, legendHidden: legendHiddenInput = false, items, value: valueInput, name, disabled: disabledInput = false, onChange, className, ...rest }: TileGroupProps) {
  const reactId = useId();
  const value = useValue(valueInput);
  const disabled = useValue(disabledInput) ?? false;
  const legendHidden = useValue(legendHiddenInput) ?? false;
  const groupName = name ?? `st-tileGroup-${reactId}`;
  return (
    <fieldset {...rest} className={classNames("st-tileGroup", disabled && "st-tileGroup--disabled", className)}>
      {legend ? <legend className={classNames("st-tileGroup__legend", legendHidden && "st-tileGroup__legend--hidden")}>{legend}</legend> : null}
      <div className="st-tileGroup__items">
        {items.map((item) => (
          <label key={item.value} className={classNames("st-tileGroup__tile", item.value === value && "st-tileGroup__tile--checked", item.disabled && "st-tileGroup__tile--disabled")}>
            <input className="st-tileGroup__input" type="radio" name={groupName} value={item.value} checked={item.value === value} disabled={disabled || item.disabled} onChange={() => onChange?.(item.value)} />
            <span className="st-tileGroup__content">
              <span className="st-tileGroup__label">{item.label ?? item.title}</span>
              {item.description ? <span className="st-tileGroup__description">{item.description}</span> : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
