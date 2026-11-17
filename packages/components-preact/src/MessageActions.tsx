import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { text } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export type MessageActionVariant = "default" | "danger";
/**
 * `label` (React/Vue) is rendered when present; otherwise `icon` (the
 * Svelte-canonical content) is rendered. `label` is always used for the
 * accessible name when provided. At least one of `label`/`icon` should be set.
 */
export type MessageAction = {
  id?: string;
  value?: string;
  label?: ComponentChildren;
  icon?: ComponentChildren;
  variant?: MessageActionVariant;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
};
export type MessageActionsProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
  actions: MessageAction[];
  visibility?: "always" | "hover";
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function MessageActions({ actions, visibility = "hover", className, ...rest }: MessageActionsProps) {
  return (
    <div
      {...rest}
      className={classNames("st-messageActions", visibility === "hover" && "st-messageActions--hoverOnly", className)}
      role="group"
      aria-label="Actions du message"
    >
      {actions.map((action, index) => (
        <button
          key={action.id ?? index}
          type="button"
          className={classNames(
            "st-iconButton",
            "st-iconButton--sm",
            action.variant === "danger" ? "st-iconButton--danger" : "st-iconButton--ghost",
          )}
          disabled={action.disabled}
          aria-label={text(action.label) || text(action.id) || undefined}
          onClick={action.onClick}
        >
          {action.icon ?? action.label}
        </button>
      ))}
    </div>
  );
}
