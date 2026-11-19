import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { text } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";

export type MessageActionVariant = "default" | "danger";
type MessageActionBase = {
  id?: string;
  value?: string;
  label: ComponentChildren;
  disabled?: boolean;
  variant?: "default" | "danger";
  danger?: boolean;
  icon?: ComponentChildren;
  onClick?: () => void;
};
/**
 * `label` (React/Vue) is rendered when present; otherwise `icon` (the
 * Svelte-canonical content) is rendered. `label` is always used for the
 * accessible name when provided. At least one of `label`/`icon` should be set.
 */
export type MessageAction = Omit<MessageActionBase, "label"> & {
  label?: ComponentChildren;
  icon?: ComponentChildren;
  variant?: MessageActionVariant;
};
export type MessageActionsProps = HTMLAttributes<HTMLElement> & {
  actions: MessageAction[];
  visibility?: "always" | "hover";
};

export function MessageActions({ actions, visibility = "hover", className, ...rest }: MessageActionsProps) {
  return (
    <div
      {...(rest as HTMLAttributes<HTMLDivElement>)}
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
