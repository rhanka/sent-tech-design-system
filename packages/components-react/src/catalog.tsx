import React from "react";
import {
  Check,
  ChevronDown,
  ChevronDownCircle,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  Copy,
  Ellipsis,
  Eye,
  EyeOff,
  File as FileIcon,
  LoaderCircle,
  Search as SearchIcon,
  Send,
  Upload,
  X,
} from "lucide-react";
import { classNames } from "./classNames.js";

export type Size = "sm" | "md" | "lg";
export type Tone = "neutral" | "info" | "success" | "warning" | "error";
export type DataTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

type AnyRecord = Record<string, unknown>;
// `value` (Svelte-canonical) is accepted as an alias of `id`; `danger: true`
// (Svelte-canonical) is accepted as an alias of `variant: "danger"`.
type ActionItem = { id?: string; value?: string; label: React.ReactNode; disabled?: boolean; variant?: "default" | "danger"; danger?: boolean; icon?: React.ReactNode; onClick?: () => void };
type OptionItem = { value: string; label: React.ReactNode; disabled?: boolean };

// Normalises an action item so the rest of the component only deals with the
// React-native shape: `id` (from id|value) and `variant` (from variant|danger).
function actionId(item: { id?: string; value?: string }, index?: number, prefix = "item"): string | undefined {
  return item.id ?? item.value ?? (index === undefined ? undefined : `${prefix}-${index}`);
}
function isDangerAction(item: { variant?: "default" | "danger"; danger?: boolean }): boolean {
  return item.variant === "danger" || item.danger === true;
}

const DATA_TONES: DataTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function node(value: React.ReactNode | (() => React.ReactNode)): React.ReactNode {
  return typeof value === "function" ? (value as () => React.ReactNode)() : value;
}

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function idFrom(item: { id?: string; value?: string }, index: number, prefix: string): string {
  return item.id ?? item.value ?? `${prefix}-${index}`;
}

function optionFrom(item: OptionItem | { id?: string; value?: string; label?: React.ReactNode }, index: number): OptionItem {
  const option = item as OptionItem & { id?: string };
  return {
    value: option.value ?? option.id ?? String(index),
    label: option.label ?? option.value ?? option.id ?? String(index),
    disabled: "disabled" in item ? Boolean(item.disabled) : false,
  };
}

function useControlled<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void): [T, (next: T) => void] {
  const [local, setLocal] = React.useState(defaultValue);
  return [
    value ?? local,
    (next) => {
      if (value === undefined) setLocal(next);
      onChange?.(next);
    },
  ];
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableIn(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

function useBodyScrollLock(active: boolean): void {
  React.useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}

function useOutsideMouseDown(active: boolean, ref: React.RefObject<HTMLElement | null>, onOutside: () => void): void {
  React.useEffect(() => {
    if (!active) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && ref.current && !ref.current.contains(target)) onOutside();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [active, onOutside, ref]);
}

function useEscape(active: boolean, onClose?: () => void): void {
  React.useEffect(() => {
    if (!active || !onClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, onClose]);
}

function trapTabKey(event: KeyboardEvent | React.KeyboardEvent, root: HTMLElement | null): void {
  if (event.key !== "Tab" || !root || !root.contains(document.activeElement)) return;
  const focusable = focusableIn(root);
  if (focusable.length === 0) {
    event.preventDefault();
    root.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function moveIndex(index: number, max: number, delta: number): number {
  if (max <= 0) return -1;
  return (index + delta + max) % max;
}

type FieldProps = {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  className?: string;
  children: (inputId: string, isInvalid: boolean) => React.ReactNode;
};

function Field({ label, helperText, errorText, invalid = false, className, children }: FieldProps) {
  const reactId = React.useId();
  const inputId = `st-field-${reactId}`;
  const isInvalid = invalid || Boolean(errorText);

  return (
    <div className={classNames("st-field", className)}>
      <label className="st-field__control" htmlFor={inputId}>
        {label ? <span className="st-field__label">{label}</span> : null}
        {children(inputId, isInvalid)}
      </label>
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

function renderOptions(options?: Array<OptionItem | { id?: string; value?: string; label?: React.ReactNode }>) {
  return options?.map((item, index) => {
    const option = optionFrom(item, index);
    return (
      <option key={option.value} value={option.value} disabled={option.disabled}>
        {option.label}
      </option>
    );
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pct(value: number, min = 0, max = 100): number {
  if (max <= min) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

export type AccordionItem = { id?: string; title: React.ReactNode; content: React.ReactNode; disabled?: boolean };
export type AccordionProps = React.HTMLAttributes<HTMLDivElement> & {
  items: AccordionItem[];
  openIds?: string[];
  defaultOpenIds?: string[];
  allowMultiple?: boolean;
  /** Svelte-canonical alias for `defaultOpenIds` (initially open item ids). */
  open?: string[];
  /** Svelte-canonical alias for `allowMultiple`. */
  multiple?: boolean;
  align?: "start" | "end";
  size?: "sm" | "md" | "lg";
  onChange?: (openIds: string[]) => void;
};

export function Accordion({ items, openIds, defaultOpenIds, open: openAlias, allowMultiple, multiple, align = "end", size = "md", onChange, className, ...rest }: AccordionProps) {
  const initialOpen = defaultOpenIds ?? openAlias ?? [];
  const resolvedAllowMultiple = allowMultiple ?? multiple ?? false;
  const [open, setOpen] = useControlled(openIds, initialOpen, onChange);
  const toggle = (id: string) => {
    const next = open.includes(id) ? open.filter((value) => value !== id) : resolvedAllowMultiple ? [...open, id] : [id];
    setOpen(next);
  };

  return (
    <div {...rest} className={classNames("st-accordion", `st-accordion--${size}`, `st-accordion--align-${align}`, className)}>
      {items.map((item, index) => {
        const itemId = idFrom(item, index, "accordion");
        const isOpen = open.includes(itemId);
        const triggerId = `st-accordion-trigger-${itemId}`;
        const panelId = `st-accordion-panel-${itemId}`;
        const titleNode = <span className="st-accordion__title">{item.title}</span>;
        const iconNode = (
          <span className="st-accordion__icon" aria-hidden="true">
            <ChevronDown size={18} strokeWidth={2.25} aria-hidden="true" />
          </span>
        );
        return (
          <div key={itemId} className={classNames("st-accordion__item", isOpen && "st-accordion__item--open")}>
            <h3 className="st-accordion__heading">
              <button
                id={triggerId}
                type="button"
                className="st-accordion__trigger"
                disabled={item.disabled}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(itemId)}
              >
                {align === "start" ? (
                  <>
                    {iconNode}
                    {titleNode}
                  </>
                ) : (
                  <>
                    {titleNode}
                    {iconNode}
                  </>
                )}
              </button>
            </h3>
            {isOpen ? (
              <div className="st-accordion__panel" id={panelId} role="region" aria-labelledby={triggerId}>
                {node(item.content)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export type AlertProps = React.HTMLAttributes<HTMLElement> & {
  tone?: Exclude<Tone, "neutral">;
  title: React.ReactNode;
  message?: React.ReactNode;
  actions?: React.ReactNode;
};

export function Alert({ tone = "info", title, message, actions, children, className, ...rest }: AlertProps) {
  return (
    <section {...rest} className={classNames("st-alert", `st-alert--${tone}`, className)} role={tone === "warning" || tone === "error" ? "alert" : "status"}>
      <div className="st-alert__content">
        <h2 className="st-alert__title">{title}</h2>
        {message ? <p className="st-alert__message">{message}</p> : null}
        {children}
      </div>
      {actions ? <div className="st-alert__actions">{actions}</div> : null}
    </section>
  );
}

export type AspectRatioProps = React.HTMLAttributes<HTMLDivElement> & { ratio?: number | string };
export function AspectRatio({ ratio = "16 / 9", className, style, children, ...rest }: AspectRatioProps) {
  const aspectRatio = typeof ratio === "number" ? String(ratio) : ratio;
  return (
    <div {...rest} className={classNames("st-aspectRatio", className)} style={{ aspectRatio, ...style }}>
      {children}
    </div>
  );
}

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  current?: boolean;
}
export type BreadcrumbProps = React.HTMLAttributes<HTMLElement> & { items: BreadcrumbItem[]; label?: string };
export function Breadcrumb({ items, label = "Breadcrumb", className, ...rest }: BreadcrumbProps) {
  return (
    <nav {...rest} className={classNames("st-breadcrumb", className)} aria-label={label}>
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {item.href && !item.current ? <a href={item.href}>{item.label}</a> : <span aria-current={item.current ? "page" : undefined}>{item.label}</span>}
            {index < items.length - 1 ? <span className="st-breadcrumb__separator">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export type ChatMessageRole = "user" | "assistant" | "system" | "tool";
export type ChatMessageStatus = "pending" | "processing" | "completed" | "failed" | "idle" | "streaming" | "error" | "sent";
export type ChatMessageProps = Omit<React.HTMLAttributes<HTMLElement>, "content" | "role"> & {
  role?: ChatMessageRole;
  status?: ChatMessageStatus;
  content?: React.ReactNode;
  timestamp?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  avatar?: React.ReactNode;
};
export function ChatMessage({ role = "assistant", status = "completed", content, timestamp, footer, actions, avatar, children, className, ...rest }: ChatMessageProps) {
  const normalizedStatus = status === "idle" || status === "streaming" ? "processing" : status === "error" ? "failed" : status;
  const isStreaming = normalizedStatus === "processing";
  const alignment = role === "user" ? "end" : "start";
  return (
    <article
      {...rest}
      className={classNames("st-chatMessage", `st-chatMessage--${role}`, normalizedStatus && `st-chatMessage--${normalizedStatus}`, className)}
      data-role={role}
      data-status={normalizedStatus}
      data-align={alignment}
      aria-live={isStreaming ? "polite" : undefined}
    >
      {avatar ? (
        <div className="st-chatMessage__avatar" aria-hidden="true">
          {avatar}
        </div>
      ) : null}
      <div className="st-chatMessage__body">
        <div className="st-chatMessage__bubble">
          <div className="st-chatMessage__content">{children ?? content}</div>
          {isStreaming ? <span className="st-chatMessage__pulse" aria-hidden="true" /> : null}
        </div>
        {footer || timestamp ? (
          <div className="st-chatMessage__footer">
            {footer ?? <span className="st-chatMessage__timestamp">{timestamp}</span>}
          </div>
        ) : null}
        {actions ? <div className="st-chatMessage__actions">{actions}</div> : null}
      </div>
    </article>
  );
}

export type ChatThreadProps = React.HTMLAttributes<HTMLElement> & {
  messages?: Array<{ id: string; role?: ChatMessageRole; content: React.ReactNode; status?: ChatMessageStatus }>;
  emptyLabel?: React.ReactNode;
};
export function ChatThread({ messages, emptyLabel = "No messages", children, className, ...rest }: ChatThreadProps) {
  return (
    <section
      {...rest}
      className={classNames("st-chatThread", className)}
      role="log"
      aria-label={rest["aria-label"] ?? "Chat thread"}
      aria-live="polite"
      aria-relevant="additions text"
    >
      <div className="st-chatThread__list">
        {messages?.length ? messages.map((message) => <ChatMessage key={message.id} role={message.role} status={message.status} content={message.content} />) : children ?? <p className="st-chatThread__empty">{emptyLabel}</p>}
      </div>
    </section>
  );
}

export type ChatComposerProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  value?: string;
  placeholder?: string;
  submitLabel?: React.ReactNode;
  onSubmit?: (payload: { value: string }) => void;
};
export function ChatComposer({ value = "", placeholder = "Message", submitLabel = "Send", onSubmit, className, children, ...rest }: ChatComposerProps) {
  const [draft, setDraft] = React.useState(value);
  return (
    <form
      {...rest}
      className={classNames("st-chatComposer", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.({ value: draft });
      }}
    >
      <div className="st-chatComposer__body">
        <div className="st-chatComposer__inputShell">
          <textarea className="st-chatComposer__textarea st-chatComposer__input" placeholder={placeholder} value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
        </div>
      </div>
      <div className="st-chatComposer__toolbar">
        <div className="st-chatComposer__actions st-chatComposer__actions--left">{children}</div>
        <div className="st-chatComposer__actions st-chatComposer__actions--right">
          <button type="submit" className="st-button st-button--primary st-button--md" disabled={draft.trim().length === 0}>
            <Send size={16} strokeWidth={2} aria-hidden="true" />
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

export type ChoiceProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: React.ReactNode;
  helperText?: React.ReactNode;
  /** Secondary muted description line under the label (e.g. a filter hint). */
  description?: React.ReactNode;
  /** Trailing slot pushed to the row end (e.g. a count Badge). */
  trailing?: React.ReactNode;
  invalid?: boolean;
};
export type CheckboxProps = ChoiceProps;
export type RadioProps = ChoiceProps;
function Choice({ type, label, helperText, description, trailing, invalid = false, className, ...rest }: ChoiceProps & { type: "checkbox" | "radio" }) {
  const reactId = React.useId();
  const descriptionId = `${reactId}-description`;
  // Merge our description id with any consumer-provided aria-describedby so we
  // never clobber an existing one.
  const describedBy = description
    ? [rest["aria-describedby"], descriptionId].filter(Boolean).join(" ")
    : rest["aria-describedby"];
  return (
    <label
      className={classNames(
        "st-choice",
        `st-choice--${type}`,
        description ? "st-choice--described" : null,
        className,
      )}
    >
      <input
        {...rest}
        className="st-choice__input"
        type={type}
        aria-invalid={invalid ? "true" : undefined}
        aria-describedby={describedBy}
      />
      <span className="st-choice__content">
        <span className="st-choice__label">{label}</span>
        {description ? <span className="st-choice__description" id={descriptionId}>{description}</span> : null}
        {helperText ? <span className="st-choice__help">{helperText}</span> : null}
      </span>
      {trailing ? <span className="st-choice__trailing">{trailing}</span> : null}
    </label>
  );
}
export function Checkbox(props: ChoiceProps) {
  return <Choice {...props} type="checkbox" />;
}
export function Radio(props: ChoiceProps) {
  return <Choice {...props} type="radio" />;
}

export type CodeSnippetProps = React.HTMLAttributes<HTMLPreElement> & { code: string; inline?: boolean };
export function CodeSnippet({ code, inline = false, className, ...rest }: CodeSnippetProps) {
  const Tag = inline ? "code" : "pre";
  return (
    <Tag {...(rest as AnyRecord)} className={classNames("st-codeSnippet", inline && "st-codeSnippet--inline", className)}>
      <code className="st-codeSnippet__code">{code}</code>
    </Tag>
  );
}

export interface ComboboxOption extends OptionItem {}
export type ComboboxProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  options: ComboboxOption[];
  value?: string;
  size?: Size;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  allowCustomValue?: boolean;
  noResultsLabel?: React.ReactNode;
  /** Accessible name for the options listbox. Defaults to `label`. */
  listLabel?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
};
export function Combobox({
  label,
  helperText,
  errorText,
  invalid = false,
  options,
  value,
  size = "md",
  placeholder = "Select or type",
  disabled = false,
  open: controlledOpen,
  allowCustomValue = true,
  noResultsLabel = "No results",
  listLabel,
  onChange,
  onSelect,
  className,
  ...rest
}: ComboboxProps) {
  const reactId = React.useId();
  const inputId = `st-combobox-input-${reactId}`;
  const listId = `st-combobox-list-${reactId}`;
  const initial = text(options.find((option) => option.value === value)?.label ?? value ?? "");
  const [inputValue, setInputValue] = React.useState<string>(initial);
  const [open, setOpen] = useControlled(controlledOpen, false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const filtered = options.filter((option) => {
    const query = inputValue.trim().toLowerCase();
    return !query || text(option.label).toLowerCase().includes(query);
  });
  const selected = options.find((option) => option.value === value);
  const isInvalid = invalid || Boolean(errorText);
  const selectOption = (option: ComboboxOption) => {
    if (option.disabled) return;
    setInputValue(text(option.label));
    setOpen(false);
    setActiveIndex(-1);
    onSelect?.(option.value);
    onChange?.(option.value);
  };
  const displayValue = selected?.label ? text(selected.label) : inputValue;
  // Structure mirrors the Svelte reference: a `st-field` grid wrapping a
  // `st-field__control` label that stacks the field label above the bordered
  // `st-combobox` box (input + clear/toggle). The popover list and help/error
  // text are siblings of the control inside `st-field`.
  return (
    <div {...rest} className={classNames("st-field", className)}>
      <label className="st-field__control" htmlFor={inputId}>
        {label ? <span className="st-field__label">{label}</span> : null}
        <span className={classNames("st-combobox", `st-combobox--${size}`)}>
          <input
            id={inputId}
            className="st-combobox__control"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-invalid={isInvalid ? "true" : undefined}
            aria-activedescendant={activeIndex >= 0 && filtered[activeIndex] ? `${listId}-${filtered[activeIndex].value}` : undefined}
            placeholder={placeholder}
            disabled={disabled}
            value={displayValue}
            onFocus={() => !disabled && setOpen(true)}
            onChange={(event) => {
              setInputValue(event.currentTarget.value);
              setOpen(true);
              setActiveIndex(-1);
              if (allowCustomValue) onChange?.(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((index) => moveIndex(index, filtered.length, 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((index) => moveIndex(index < 0 ? filtered.length : index, filtered.length, -1));
              } else if (event.key === "Enter" && open && activeIndex >= 0 && filtered[activeIndex]) {
                event.preventDefault();
                selectOption(filtered[activeIndex]);
              } else if (event.key === "Escape" && open) {
                event.preventDefault();
                setOpen(false);
                setActiveIndex(-1);
              }
            }}
          />
          {displayValue ? (
            <button
              type="button"
              className="st-combobox__clear"
              aria-label="Clear selection"
              disabled={disabled}
              onClick={() => {
                setInputValue("");
                setActiveIndex(-1);
                onChange?.("");
              }}
            >
              <X size={16} strokeWidth={2.25} aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            className="st-combobox__toggle"
            aria-label="Toggle options"
            aria-expanded={open}
            disabled={disabled}
            onClick={() => setOpen(!open)}
          >
            <ChevronDown className={classNames("st-combobox__toggleIcon", open && "st-combobox__toggleIcon--open")} size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </span>
      </label>
      {open ? (
        <div id={listId} className="st-combobox__list" role="listbox" aria-label={listLabel ?? text(label) ?? "Options"}>
          {filtered.length ? (
            filtered.map((option, index) => (
              <button
                key={option.value}
                id={`${listId}-${option.value}`}
                type="button"
                className={classNames("st-combobox__option", index === activeIndex && "st-combobox__option--active")}
                role="option"
                aria-selected={displayValue === text(option.label)}
                aria-disabled={option.disabled ? "true" : undefined}
                disabled={option.disabled}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="st-combobox__empty" role="option" aria-disabled="true" aria-selected="false">{noResultsLabel}</div>
          )}
        </div>
      ) : null}
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

export type ContentSwitcherItem = { id?: string; value?: string; label: React.ReactNode; disabled?: boolean };
// `onchange` (Svelte-canonical, lowercase) is accepted as an alias of `onChange`.
export type ContentSwitcherProps = React.HTMLAttributes<HTMLDivElement> & {
  items: ContentSwitcherItem[];
  value?: string;
  activeId?: string;
  onChange?: (value: string) => void;
  onchange?: (value: string) => void;
  size?: Size;
};
export function ContentSwitcher({ items, value, activeId, onChange, onchange, size = "md", className, ...rest }: ContentSwitcherProps) {
  const handleChange = onChange ?? onchange;
  const current = value ?? activeId ?? idFrom(items[0] ?? {}, 0, "content");
  return (
    <div {...rest} className={classNames("st-contentSwitcher", `st-contentSwitcher--${size}`, className)} role="group">
      {items.map((item, index) => {
        const itemId = idFrom(item, index, "content");
        return (
          <button
            key={itemId}
            type="button"
            className={classNames("st-contentSwitcher__option st-contentSwitcher__button", itemId === current && "st-contentSwitcher__option--selected")}
            disabled={item.disabled}
            aria-pressed={itemId === current}
            onClick={() => handleChange?.(itemId)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export type CopyButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> & {
  text?: string;
  value?: string;
  label?: React.ReactNode;
  copiedLabel?: React.ReactNode;
  size?: Size;
};
export function CopyButton({ text: copyText, value, label = "Copy", copiedLabel = "Copied", size = "md", className, onClick, ...rest }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      {...rest}
      type="button"
      className={classNames("st-copyButton", `st-copyButton--${size}`, copied && "st-copyButton--copied", className)}
      onClick={(event) => {
        setCopied(true);
        void navigator.clipboard?.writeText(value ?? copyText ?? "");
        onClick?.(event);
      }}
    >
      <span className="st-copyButton__icon" aria-hidden="true">
        {copied ? <Check size={14} strokeWidth={2} aria-hidden="true" /> : <Copy size={14} strokeWidth={2} aria-hidden="true" />}
      </span>
      <span className="st-copyButton__label">{copied ? copiedLabel : label}</span>
    </button>
  );
}

// Range value shape mirrors the Svelte canonical contract: both bounds are
// `Date | null` (`null` = not yet picked).
export type DatePickerRange = { start: Date | null; end: Date | null };
// Canonical value type, identical to the Svelte DatePicker: a single `Date`
// (mode "single"), a `{start,end}` range (mode "range"), or `null`.
export type DatePickerValue = Date | DatePickerRange | null;
// `value` (controlled) / `onChange` is the React-native shape; Svelte exposes
// the same payload through `bind:value`.
export type DatePickerProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  mode?: "single" | "range";
  /** Controlled value (`Date | {start,end} | null`). */
  value?: DatePickerValue;
  /** Uncontrolled initial value when `value` is omitted. */
  defaultValue?: DatePickerValue;
  /** Emitted on every selection with the canonical value payload. */
  onChange?: (value: DatePickerValue) => void;
  min?: Date;
  max?: Date;
  locale?: string;
  placeholder?: string;
  size?: Size;
  id?: string;
  openLabel?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  todayLabel?: string;
};

function dpStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dpIsSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dpIsRange(value: DatePickerValue): value is DatePickerRange {
  return value !== null && typeof value === "object" && !(value instanceof Date) && "start" in value;
}

function dpFirstDayOfWeek(locale: string): number {
  try {
    // @ts-expect-error: weekInfo is recent and not in all TS lib versions.
    const info = new Intl.Locale(locale).weekInfo;
    if (info && typeof info.firstDay === "number") {
      return info.firstDay === 7 ? 0 : info.firstDay;
    }
  } catch {
    // Ignore — fall back below.
  }
  return locale.toLowerCase().startsWith("en-us") ? 0 : 1;
}

export function DatePicker({
  label,
  helperText,
  errorText,
  invalid = false,
  disabled = false,
  mode = "single",
  value,
  defaultValue,
  onChange,
  min,
  max,
  locale = "fr-FR",
  placeholder,
  size = "md",
  id,
  openLabel,
  previousMonthLabel,
  nextMonthLabel,
  todayLabel,
  className,
  ...rest
}: DatePickerProps) {
  const reactId = React.useId();
  const fieldId = id ?? `st-datepicker-${reactId}`;
  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");

  const resolvedOpenLabel = openLabel ?? (isFr ? "Ouvrir le calendrier" : "Open calendar");
  const resolvedPrevLabel = previousMonthLabel ?? (isFr ? "Mois précédent" : "Previous month");
  const resolvedNextLabel = nextMonthLabel ?? (isFr ? "Mois suivant" : "Next month");
  const resolvedTodayLabel = todayLabel ?? (isFr ? "Aujourd'hui" : "Today");
  const resolvedPlaceholder =
    placeholder ??
    (isFr
      ? mode === "range"
        ? "jj/mm/aaaa - jj/mm/aaaa"
        : "jj/mm/aaaa"
      : mode === "range"
        ? "mm/dd/yyyy - mm/dd/yyyy"
        : "mm/dd/yyyy");

  const emptyValue: DatePickerValue = mode === "range" ? { start: null, end: null } : null;
  const [current, setCurrent] = useControlled<DatePickerValue>(value, defaultValue ?? emptyValue, onChange);
  const [open, setOpen] = React.useState(false);

  const hostRef = React.useRef<HTMLDivElement>(null);
  useOutsideMouseDown(open, hostRef, React.useCallback(() => setOpen(false), []));

  const dateFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }),
    [locale],
  );
  const monthFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale],
  );
  const weekdayFormatter = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short" }), [locale]);
  const cellFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }),
    [locale],
  );

  const pickInitialMonth = React.useCallback((): Date => {
    if (mode === "single" && current instanceof Date) return dpStartOfDay(current);
    if (dpIsRange(current) && current.start) return dpStartOfDay(current.start);
    return dpStartOfDay(new Date());
  }, [mode, current]);

  const [view, setView] = React.useState<{ year: number; month: number }>(() => {
    const initial = pickInitialMonth();
    return { year: initial.getFullYear(), month: initial.getMonth() };
  });

  // Re-sync the visible month when the calendar reopens.
  React.useEffect(() => {
    if (!open) return;
    const initial = pickInitialMonth();
    setView({ year: initial.getFullYear(), month: initial.getMonth() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const weekStart = dpFirstDayOfWeek(locale);

  const weekdayLabels = React.useMemo(() => {
    const sample = new Date(Date.UTC(2024, 0, 7)); // a Sunday
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sample);
      d.setUTCDate(sample.getUTCDate() + i);
      labels.push(weekdayFormatter.format(d));
    }
    return [...labels.slice(weekStart), ...labels.slice(0, weekStart)];
  }, [weekdayFormatter, weekStart]);

  const grid = React.useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const offset = (first.getDay() - weekStart + 7) % 7;
    const start = new Date(view.year, view.month, 1 - offset);
    const cells: Array<{ date: Date; inMonth: boolean }> = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ date: dpStartOfDay(d), inMonth: d.getMonth() === view.month });
    }
    return cells;
  }, [view.year, view.month, weekStart]);

  const isOutOfBounds = (date: Date): boolean => {
    const d = dpStartOfDay(date).getTime();
    if (min && d < dpStartOfDay(min).getTime()) return true;
    if (max && d > dpStartOfDay(max).getTime()) return true;
    return false;
  };

  const isSelected = (date: Date): boolean => {
    if (mode === "single") return current instanceof Date && dpIsSameDay(current, date);
    if (dpIsRange(current)) return dpIsSameDay(current.start, date) || dpIsSameDay(current.end, date);
    return false;
  };

  const isInRange = (date: Date): boolean => {
    if (mode !== "range" || !dpIsRange(current)) return false;
    const { start, end } = current;
    if (!start || !end) return false;
    const d = dpStartOfDay(date).getTime();
    return d > dpStartOfDay(start).getTime() && d < dpStartOfDay(end).getTime();
  };

  const previousMonth = () =>
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }));
  const nextMonth = () =>
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }));

  const pickDate = (date: Date) => {
    if (isOutOfBounds(date)) return;
    const picked = dpStartOfDay(date);
    if (mode === "single") {
      setCurrent(picked);
      setOpen(false);
      return;
    }
    const range = dpIsRange(current) ? current : { start: null, end: null };
    if (!range.start || (range.start && range.end)) {
      setCurrent({ start: picked, end: null });
      return;
    }
    if (picked.getTime() < dpStartOfDay(range.start).getTime()) {
      setCurrent({ start: picked, end: null });
      return;
    }
    setCurrent({ start: range.start, end: picked });
    setOpen(false);
  };

  const formattedValue = (): string => {
    if (mode === "single") return current instanceof Date ? dateFormatter.format(current) : "";
    if (dpIsRange(current)) {
      const s = current.start ? dateFormatter.format(current.start) : "";
      const e = current.end ? dateFormatter.format(current.end) : "";
      if (!s && !e) return "";
      return `${s} - ${e}`;
    }
    return "";
  };

  const isInvalid = invalid || Boolean(errorText);
  const monthLabel = monthFormatter.format(new Date(view.year, view.month, 1));
  const toggleOpen = () => {
    if (disabled) return;
    setOpen((o) => !o);
  };

  return (
    <div {...rest} ref={hostRef} className={classNames("st-field", className)}>
      <label className="st-field__control" htmlFor={fieldId}>
        {label ? <span className="st-field__label">{label}</span> : null}
        <span className={classNames("st-datepicker", `st-datepicker--${size}`)}>
          <input
            id={fieldId}
            type="text"
            readOnly
            className="st-datepicker__control"
            value={formattedValue()}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            aria-invalid={isInvalid ? "true" : undefined}
            onClick={toggleOpen}
          />
          <button
            type="button"
            className="st-datepicker__trigger"
            aria-label={resolvedOpenLabel}
            aria-haspopup="dialog"
            aria-expanded={open ? "true" : "false"}
            disabled={disabled}
            onClick={toggleOpen}
          >
            <span aria-hidden="true">📅</span>
          </button>
        </span>
      </label>
      {open ? (
        <div
          className="st-datepicker__panel"
          role="dialog"
          tabIndex={-1}
          aria-label={text(label) || resolvedOpenLabel}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
            }
          }}
        >
          <div className="st-datepicker__nav">
            <button type="button" className="st-datepicker__navBtn" aria-label={resolvedPrevLabel} onClick={previousMonth}>
              <span aria-hidden="true">‹</span>
            </button>
            <span className="st-datepicker__monthLabel" aria-live="polite">
              {monthLabel}
            </span>
            <button type="button" className="st-datepicker__navBtn" aria-label={resolvedNextLabel} onClick={nextMonth}>
              <span aria-hidden="true">›</span>
            </button>
          </div>
          <div className="st-datepicker__grid" role="grid">
            <div className="st-datepicker__weekdays" role="row">
              {weekdayLabels.map((wd, i) => (
                <span key={`${wd}-${i}`} className="st-datepicker__weekday" role="columnheader">
                  {wd}
                </span>
              ))}
            </div>
            <div className="st-datepicker__days">
              {grid.map((cell, i) => {
                const oob = isOutOfBounds(cell.date);
                const selected = isSelected(cell.date);
                const inRange = isInRange(cell.date);
                return (
                  <button
                    key={i}
                    type="button"
                    className={classNames(
                      "st-datepicker__day",
                      !cell.inMonth && "st-datepicker__day--outside",
                      selected && "st-datepicker__day--selected",
                      inRange && "st-datepicker__day--inRange",
                    )}
                    aria-label={cellFormatter.format(cell.date)}
                    aria-pressed={selected ? "true" : "false"}
                    aria-disabled={oob ? "true" : undefined}
                    disabled={oob}
                    onClick={() => pickDate(cell.date)}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="st-datepicker__footer">
            <button
              type="button"
              className="st-datepicker__todayBtn"
              onClick={() => pickDate(new Date())}
              disabled={isOutOfBounds(new Date())}
            >
              {resolvedTodayLabel}
            </button>
          </div>
        </div>
      ) : null}
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

export type DrawerProps = React.HTMLAttributes<HTMLElement> & {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  placement?: "left" | "right";
  onClose?: () => void;
};
export function Drawer({ open = false, title, description, footer, placement = "right", onClose, children, className, ...rest }: DrawerProps) {
  const panelRef = React.useRef<HTMLElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  useBodyScrollLock(open);
  useEscape(open, onClose);
  React.useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => trapTabKey(event, panelRef.current);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);
  if (!open) return null;
  return (
    <div
      className="st-drawer__backdrop"
      data-testid="st-drawer-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <aside
        {...rest}
        ref={panelRef}
        className={classNames("st-drawer", `st-drawer--${placement}`, className)}
        role="dialog"
        aria-modal="true"
        aria-label={text(title) || "Drawer"}
        tabIndex={-1}
        onKeyDown={(event) => trapTabKey(event, panelRef.current)}
      >
        <div className="st-drawer__header">
          {title ? <h2 className="st-drawer__title">{title}</h2> : null}
          <button ref={closeRef} type="button" className="st-drawer__close" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>
        {description ? <p className="st-drawer__description">{description}</p> : null}
        <div className="st-drawer__body">{children}</div>
        {footer ? <div className="st-drawer__footer">{footer}</div> : null}
      </aside>
    </div>
  );
}

export interface DropdownOption extends OptionItem {}
// `onselect` (Svelte-canonical, lowercase) is accepted as an alias of `onSelect`.
export type DropdownProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  label?: React.ReactNode;
  options: DropdownOption[];
  value?: string;
  open?: boolean;
  placeholder?: React.ReactNode;
  onSelect?: (value: string) => void;
  onselect?: (value: string) => void;
};
export function Dropdown({ label = "Select", options, value, open: controlledOpen, placeholder = "Select", onSelect, onselect, className, ...rest }: DropdownProps) {
  const handleSelect = onSelect ?? onselect;
  const hostRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useControlled(controlledOpen, false);
  const [current, setCurrent] = useControlled(value, value ?? "");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const selected = options.find((option) => option.value === current);
  const focusOption = (index: number) => {
    setActiveIndex(index);
  };
  React.useEffect(() => {
    if (open && activeIndex >= 0) itemRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);
  const selectOption = (option: DropdownOption) => {
    if (option.disabled) return;
    setCurrent(option.value);
    setOpen(false);
    setActiveIndex(-1);
    handleSelect?.(option.value);
  };
  useOutsideMouseDown(open, hostRef, () => setOpen(false));
  useEscape(open, () => setOpen(false));
  return (
    <div {...rest} ref={hostRef} className={classNames("st-dropdown", className)}>
      <button
        type="button"
        className="st-dropdown__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            focusOption(0);
          }
        }}
      >
        <span className="st-dropdown__label">{label}</span>: <span className="st-dropdown__value">{selected?.label ?? placeholder}</span>
        <ChevronDown className={classNames("st-dropdown__icon", open && "st-dropdown__icon--open")} size={18} strokeWidth={2.25} aria-hidden="true" />
      </button>
      {open ? (
        <div className="st-dropdown__list" role="listbox" aria-label={text(label) || "Options"}>
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="option"
              className="st-dropdown__option"
              disabled={option.disabled}
              aria-selected={option.value === current}
              onClick={() => selectOption(option)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  focusOption(moveIndex(index, options.length, 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  focusOption(moveIndex(index, options.length, -1));
                } else if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectOption(option);
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  setOpen(false);
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type EmptyStateProps = React.HTMLAttributes<HTMLElement> & {
  title: React.ReactNode;
  message?: React.ReactNode;
  action?: React.ReactNode;
};
export function EmptyState({ title, message, action, children, className, ...rest }: EmptyStateProps) {
  return (
    <section {...rest} className={classNames("st-empty-state st-emptyState", className)}>
      <div className="st-empty-state__content">
        <h2 className="st-empty-state__title st-emptyState__title">{title}</h2>
        {message ? <p className="st-empty-state__message st-emptyState__message">{message}</p> : null}
        {children}
        {action ? <div className="st-empty-state__action">{action}</div> : null}
      </div>
    </section>
  );
}

/** A single field error: `href` points to the offending control, `text` is the message. */
export type ErrorSummaryItem = { href: string; text: string };
export type ErrorSummaryProps = React.HTMLAttributes<HTMLElement> & {
  heading?: string;
  errors?: ErrorSummaryItem[];
};
/**
 * ErrorSummary — GCDS « Error summary »: an aggregated list of a form's errors,
 * each entry linking to the field that needs attention.
 */
export function ErrorSummary({ heading = "There was a problem", errors = [], className, children, ...rest }: ErrorSummaryProps) {
  return (
    <section {...rest} className={classNames("st-error-summary", className)} role="alert" tabIndex={-1}>
      <h2 className="st-error-summary__heading">{heading}</h2>
      {errors.length > 0 ? (
        <ul className="st-error-summary__list">
          {errors.map((error) => (
            <li className="st-error-summary__item" key={error.href}>
              <a className="st-error-summary__link" href={error.href}>{error.text}</a>
            </li>
          ))}
        </ul>
      ) : null}
      {children}
    </section>
  );
}

export type FileUploadStatus = "idle" | "uploading" | "complete" | "error";
/**
 * Accepts both the flat React/Vue shape (`{ name, size }`) and the Svelte
 * canonical shape (`{ file: { name, size } }`). When `file` is present it takes
 * precedence so a consumer can pass the exact same item array used in Svelte.
 */
export type FileUploadItem = {
  id?: string;
  name?: string;
  size?: number;
  file?: { name: string; size?: number };
  status?: FileUploadStatus;
  error?: React.ReactNode;
};
export type FileUploaderProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  items?: FileUploadItem[];
  /** Trigger button text. Defaults to "Choose file(s)" based on `multiple`. */
  triggerLabel?: React.ReactNode;
  /** Hint shown next to the trigger inside the dropzone. */
  dropzoneLabel?: React.ReactNode;
  /** Builds the per-file remove button accessible name. */
  removeLabel?: (filename: string) => string;
};
function formatFileSize(bytes: number | undefined): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const formatted = value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[i]}`;
}
function fileItemName(item: FileUploadItem): string | undefined {
  return item.file?.name ?? item.name;
}
function fileItemSize(item: FileUploadItem): number | undefined {
  return item.file?.size ?? item.size;
}
export function FileUploader({
  label,
  helperText,
  errorText,
  invalid = false,
  accept,
  multiple = false,
  disabled = false,
  items = [],
  triggerLabel,
  dropzoneLabel = "Drag and drop files here",
  removeLabel = (filename) => `Remove ${filename}`,
  className,
  ...rest
}: FileUploaderProps) {
  const isInvalid = invalid || Boolean(errorText);
  const effectiveTriggerLabel = triggerLabel ?? (multiple ? "Choose files" : "Choose file");
  return (
    <div {...rest} className={classNames("st-field", "st-fileUploader-field", className)}>
      {label ? <label className="st-field__label">{label}</label> : null}
      <div
        className={classNames(
          "st-fileUploader__dropzone",
          isInvalid && "st-fileUploader__dropzone--invalid",
          disabled && "st-fileUploader__dropzone--disabled",
        )}
        role="presentation"
      >
        <input
          className="st-fileUploader__input"
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-invalid={isInvalid ? "true" : undefined}
        />
        <div className="st-fileUploader__content">
          <span className="st-fileUploader__affordance" aria-hidden="true">
            <Upload size={18} strokeWidth={2} aria-hidden="true" />
          </span>
          <button type="button" className="st-fileUploader__trigger" disabled={disabled}>
            {effectiveTriggerLabel}
          </button>
          <span className="st-fileUploader__hint">{dropzoneLabel}</span>
        </div>
      </div>
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
      {items.length > 0 ? (
        <ul className="st-fileUploader__list">
          {items.map((item, index) => {
            const name = fileItemName(item);
            const size = fileItemSize(item);
            const sizeLabel = formatFileSize(size);
            return (
              <li key={item.id ?? name ?? index} className={classNames("st-fileUploader__item", item.status && `st-fileUploader__item--${item.status}`)}>
                <span className="st-fileUploader__itemIcon" aria-hidden="true">
                  {item.status === "uploading" ? (
                    <span className="st-fileUploader__spinner">
                      <LoaderCircle size={16} strokeWidth={2} aria-hidden="true" />
                    </span>
                  ) : item.status === "complete" ? (
                    <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
                  ) : item.status === "error" ? (
                    <CircleAlert size={16} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <FileIcon size={16} strokeWidth={2} aria-hidden="true" />
                  )}
                </span>
                <span className="st-fileUploader__itemMeta">
                  <span className="st-fileUploader__itemName st-fileUploader__name">{name}</span>
                  {sizeLabel ? <span className="st-fileUploader__itemSize">{sizeLabel}</span> : null}
                  {item.status === "error" && item.error ? <span className="st-fileUploader__itemError">{item.error}</span> : null}
                </span>
                <button type="button" className="st-fileUploader__remove" aria-label={removeLabel(text(name))} disabled={disabled}>
                  <X size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export type FooterProps = React.HTMLAttributes<HTMLElement> & {
  brand?: React.ReactNode;
  columns?: Array<{ title?: React.ReactNode; links: Array<{ label: React.ReactNode; href: string }> }>;
  links?: Array<{ label: React.ReactNode; href: string }>;
  copyright?: React.ReactNode;
};
export function Footer({ brand, columns, links, copyright, className, ...rest }: FooterProps) {
  const groups = columns ?? (links ? [{ links }] : []);
  return (
    <footer {...rest} className={classNames("st-footer", className)}>
      <div className="st-footer__top">
        {brand ? <div className="st-footer__brand">{brand}</div> : null}
        <div className="st-footer__columns">
          {groups.map((group, index) => (
            <nav key={index}>
              {group.title ? <h2>{group.title}</h2> : null}
              {group.links.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          ))}
        </div>
      </div>
      {copyright ? <div className="st-footer__copyright">{copyright}</div> : null}
    </footer>
  );
}

export type ForceGraphTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ForceGraphNodeShape =
  | "dot"
  | "circle"
  | "diamond"
  | "star"
  | "hexagon"
  | "box"
  | "square"
  | "roundedbox"
  | "triangle";

/** Stroke dash style for typed edges. */
export type ForceGraphEdgeDash = "solid" | "dashed" | "dotted" | "long-dash";

export type ForceGraphNode = {
  /** Stable identifier; referenced by edges. */
  id: string;
  /** Visible label (falls back to id). */
  label?: string;
  /**
   * Grouping key (e.g. node type or community). Nodes sharing a group get
   * the same tone when `tone` is not set explicitly.
   */
  group?: string | number;
  /** Explicit data-vis tone; overrides the group-derived tone. */
  tone?: ForceGraphTone;
  /** Relative node radius weight (defaults to 1). */
  weight?: number;
  /** Pin the node to a fixed position (ignored by the simulation). */
  fx?: number;
  fy?: number;
  /**
   * Visual shape for the node. Defaults to 'dot' (circle).
   * Supported: 'dot'|'circle', 'diamond', 'star', 'hexagon', 'box'|'square', 'triangle'.
   */
  shape?: ForceGraphNodeShape;
};

export type ForceGraphEdge = {
  /** Source node id. */
  source: string;
  /** Target node id. */
  target: string;
  /** Optional relation label, surfaced in the tooltip on hover/focus. */
  relation?: string;
  /**
   * When true the link renders as a dashed/faded "weak" link. Lets callers
   * map a confidence dimension onto link strength without extra props.
   * Equivalent to `dash: "dashed"` plus a faded stroke (kept for back-compat).
   */
  weak?: boolean;
  /**
   * Typed dash pattern for the stroke. Independent of `weak`.
   * "solid" = none, "dashed" = "6 4", "dotted" = "1 4", "long-dash" = "12 6".
   * When omitted, falls back to the `weak` styling.
   */
  dash?: ForceGraphEdgeDash;
  /**
   * Emphasise the edge (e.g. a reconciliation/match relation) with a thicker,
   * fully-opaque stroke. Defaults to false.
   */
  emphasis?: boolean;
  /** Explicit stroke width override in px. Takes precedence over `emphasis`. */
  width?: number;
};

export type ForceGraphLegendEntry = {
  /** Label shown in the legend. */
  label: string;
  /** Shape for this entry (node legend). Absent = line-style legend entry. */
  shape?: ForceGraphNodeShape;
  /** Tone for this entry. Defaults to category1. */
  tone?: ForceGraphTone;
  /** When true, renders as a dashed line (edge legend). */
  weak?: boolean;
  /**
   * Typed dash pattern for an edge legend swatch. Independent of `weak`.
   * When set, the swatch line uses the matching dash-array.
   */
  dash?: ForceGraphEdgeDash;
};

/**
 * Maps a dash style (or the legacy `weak` flag) to an SVG stroke-dasharray.
 * Returns null for a solid stroke.
 */
export function edgeDashArray(
  dash: ForceGraphEdgeDash | undefined,
  weak?: boolean,
): string | null {
  const effective: ForceGraphEdgeDash | undefined =
    dash ?? (weak ? "dashed" : undefined);
  switch (effective) {
    case "dashed":
      return "6 4";
    case "dotted":
      return "1 4";
    case "long-dash":
      return "12 6";
    case "solid":
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// SVG path helpers for the various node shapes.
// All shapes are centered at (0,0). Each shape is scaled so its filled area
// matches that of the reference circle (π·r²) — this keeps equal-weight nodes
// visually balanced rather than letting squares/diamonds read as "bigger".
//
// Per-shape scale factors (closed-form, area = π·r²):
//   square / roundedbox : half-side  = (√π)/2 · r        ≈ 0.8862·r
//   diamond             : half-diag   = √(π/2) · r        ≈ 1.2533·r
//   triangle (equilat.) : circumradius= √(π/(3√3/4)) · r  ≈ 1.5551·r
//   hexagon (regular)   : circumradius= √(π/(3√3/2)) · r  ≈ 1.0996·r
//   star (5-pt, k=0.42) : outer radius= √(π/A₁) · r       ≈ 1.5953·r
//                          where A₁ is the unit-star area (≈1.2343).
// ---------------------------------------------------------------------------
const FORCE_GRAPH_STAR_INNER_RATIO = 0.42;
const FORCE_GRAPH_STAR_AREA_FACTOR = 1.5953498885642274; // √(π / unit-star-area)

// Format a coordinate: 4 dp, snapping floating-point near-zero (e.g. 9e-16)
// to a clean 0 so paths never contain scientific notation.
function forceGraphFmt(n: number): string {
  const v = Math.abs(n) < 1e-9 ? 0 : n;
  return Number(v.toFixed(4)).toString();
}

export function nodeShapePath(shape: ForceGraphNodeShape | undefined, r: number): string | null {
  const s = shape ?? "dot";
  if (s === "dot" || s === "circle") return null; // use <circle>
  if (s === "diamond") {
    const d = Math.sqrt(Math.PI / 2) * r; // half-diagonal
    return `M 0 ${forceGraphFmt(-d)} L ${forceGraphFmt(d)} 0 L 0 ${forceGraphFmt(d)} L ${forceGraphFmt(-d)} 0 Z`;
  }
  if (s === "star") {
    const outer = FORCE_GRAPH_STAR_AREA_FACTOR * r;
    const inner = outer * FORCE_GRAPH_STAR_INNER_RATIO;
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? outer : inner;
      pts.push(`${forceGraphFmt(rad * Math.cos(angle))},${forceGraphFmt(rad * Math.sin(angle))}`);
    }
    return `M ${pts.join(" L ")} Z`;
  }
  if (s === "hexagon") {
    const R = Math.sqrt(Math.PI / ((3 * Math.sqrt(3)) / 2)) * r; // circumradius
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      pts.push(`${forceGraphFmt(R * Math.cos(angle))},${forceGraphFmt(R * Math.sin(angle))}`);
    }
    return `M ${pts.join(" L ")} Z`;
  }
  if (s === "box" || s === "square") {
    const h = (Math.sqrt(Math.PI) / 2) * r; // half-side, area = (2h)² = π·r²
    return `M ${forceGraphFmt(-h)} ${forceGraphFmt(-h)} L ${forceGraphFmt(h)} ${forceGraphFmt(-h)} L ${forceGraphFmt(h)} ${forceGraphFmt(h)} L ${forceGraphFmt(-h)} ${forceGraphFmt(h)} Z`;
  }
  if (s === "roundedbox") {
    const h = (Math.sqrt(Math.PI) / 2) * r; // same footprint as square
    const rx = h * 0.6; // ≈ r·0.3 rounding radius (h ≈ 0.886·r)
    // Rounded rectangle via arcs, clockwise from top edge.
    return (
      `M ${forceGraphFmt(-h + rx)} ${forceGraphFmt(-h)} ` +
      `L ${forceGraphFmt(h - rx)} ${forceGraphFmt(-h)} A ${forceGraphFmt(rx)} ${forceGraphFmt(rx)} 0 0 1 ${forceGraphFmt(h)} ${forceGraphFmt(-h + rx)} ` +
      `L ${forceGraphFmt(h)} ${forceGraphFmt(h - rx)} A ${forceGraphFmt(rx)} ${forceGraphFmt(rx)} 0 0 1 ${forceGraphFmt(h - rx)} ${forceGraphFmt(h)} ` +
      `L ${forceGraphFmt(-h + rx)} ${forceGraphFmt(h)} A ${forceGraphFmt(rx)} ${forceGraphFmt(rx)} 0 0 1 ${forceGraphFmt(-h)} ${forceGraphFmt(h - rx)} ` +
      `L ${forceGraphFmt(-h)} ${forceGraphFmt(-h + rx)} A ${forceGraphFmt(rx)} ${forceGraphFmt(rx)} 0 0 1 ${forceGraphFmt(-h + rx)} ${forceGraphFmt(-h)} Z`
    );
  }
  if (s === "triangle") {
    // Equilateral, centred at centroid; circumradius h so apex is up.
    const h = Math.sqrt(Math.PI / ((3 * Math.sqrt(3)) / 4)) * r;
    const pts: string[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
      pts.push(`${forceGraphFmt(h * Math.cos(angle))},${forceGraphFmt(h * Math.sin(angle))}`);
    }
    return `M ${pts.join(" L ")} Z`;
  }
  return null;
}

const FORCE_GRAPH_TONES: ForceGraphTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

// ---------------------------------------------------------------------------
// Tone assignment: explicit tone wins, else stable per-group, else per-index.
// ---------------------------------------------------------------------------
function buildForceGraphToneMap(ns: ForceGraphNode[]): Map<string, ForceGraphTone> {
  const groups: (string | number)[] = [];
  const seen = new Set<string | number>();
  for (const n of ns) {
    if (n.group === undefined) continue;
    if (seen.has(n.group)) continue;
    seen.add(n.group);
    groups.push(n.group);
  }
  const groupTone = new Map<string | number, ForceGraphTone>();
  groups.forEach((g, i) => groupTone.set(g, FORCE_GRAPH_TONES[i % FORCE_GRAPH_TONES.length]));
  const map = new Map<string, ForceGraphTone>();
  ns.forEach((n, i) => {
    if (n.tone) map.set(n.id, n.tone);
    else if (n.group !== undefined && groupTone.has(n.group)) map.set(n.id, groupTone.get(n.group)!);
    else map.set(n.id, FORCE_GRAPH_TONES[i % FORCE_GRAPH_TONES.length]);
  });
  return map;
}

// ---------------------------------------------------------------------------
// Lightweight force simulation (no external dependency).
//   - repulsion (Coulomb-like, O(n^2), fine for ontology-scale graphs)
//   - spring links (Hooke toward a rest length)
//   - mild gravity toward the centre to keep disconnected nodes on-canvas
// A deterministic seeded layout keeps SSR / tests stable.
// ---------------------------------------------------------------------------
type ForceGraphSimNode = { id: string; x: number; y: number; vx: number; vy: number; fixed: boolean };

function forceGraphMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stable seed from the SET of node ids (sorted), not from ns.length/es.length.
// A length-based seed reshuffled the whole layout whenever a node was added or
// removed (notably after a reconciliation merge), making the graph "jump". A
// hash over the sorted ids keeps the same topology → same layout, so removing
// one node leaves the rest essentially in place. (FNV-1a 32-bit over the joined
// sorted ids; deterministic and order-independent.) PORTED VERBATIM from the
// Svelte `stableSeed` so the three frameworks produce the SAME layout.
function forceGraphStableSeed(ns: ForceGraphNode[]): number {
  const ids = ns.map((n) => n.id).sort();
  let h = 0x811c9dc5; // FNV offset basis
  const joined = ids.join("|");
  for (let i = 0; i < joined.length; i++) {
    h ^= joined.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  // Fold in the count too so wholly different graphs of equal id-hash still
  // differ, but the dominant term is the (order-independent) id hash.
  h ^= ns.length;
  return h >>> 0;
}

function runForceGraphSimulation(
  ns: ForceGraphNode[],
  es: ForceGraphEdge[],
  w: number,
  h: number,
  ticks: number,
  nodeRadius: number,
  repulsionFactor: number,
): Map<string, { x: number; y: number }> {
  const cx = w / 2;
  const cy = h / 2;
  // Seed from the stable id-set hash so adding/removing a node does not
  // reshuffle the whole layout (same topology → same layout).
  const rand = forceGraphMulberry32(forceGraphStableSeed(ns));
  const idIndex = new Map<string, number>();
  const sim: ForceGraphSimNode[] = ns.map((n, i) => {
    idIndex.set(n.id, i);
    const fixed = typeof n.fx === "number" && typeof n.fy === "number";
    // Seed on a loose ring so the first ticks fan the graph out predictably.
    const angle = (i / Math.max(ns.length, 1)) * Math.PI * 2;
    const r = Math.min(w, h) * 0.3 * (0.5 + rand() * 0.5);
    return {
      id: n.id,
      x: fixed ? (n.fx as number) : cx + Math.cos(angle) * r,
      y: fixed ? (n.fy as number) : cy + Math.sin(angle) * r,
      vx: 0,
      vy: 0,
      fixed,
    };
  });

  const links = es
    .map((e) => ({ s: idIndex.get(e.source), t: idIndex.get(e.target) }))
    .filter((l): l is { s: number; t: number } => l.s !== undefined && l.t !== undefined);

  const area = w * h;
  const k = Math.sqrt(area / Math.max(ns.length, 1)); // ideal node distance
  // Clamp the caller-supplied factor so extreme values can't explode or
  // collapse the layout. >1 spreads nodes out, <1 packs them tighter; the
  // fit-to-content viewBox is recomputed afterwards so spacing just fills space.
  const clampedRepulsion = Math.min(Math.max(repulsionFactor, 0.1), 10);
  const repulsion = k * k * 0.9 * clampedRepulsion;
  const restLength = k * 0.8;
  const springK = 0.04;
  const gravity = 0.012;
  const damping = 0.85;
  let temperature = Math.min(w, h) * 0.08;
  const cooling = ticks > 0 ? Math.pow(0.02, 1 / ticks) : 0.95;

  for (let step = 0; step < ticks; step++) {
    // Repulsion between all node pairs.
    for (let i = 0; i < sim.length; i++) {
      for (let j = i + 1; j < sim.length; j++) {
        let dx = sim[i].x - sim[j].x;
        let dy = sim[i].y - sim[j].y;
        let dist2 = dx * dx + dy * dy;
        if (dist2 < 0.01) {
          dx = (rand() - 0.5) * 0.1;
          dy = (rand() - 0.5) * 0.1;
          dist2 = dx * dx + dy * dy + 0.01;
        }
        const dist = Math.sqrt(dist2);
        const force = repulsion / dist2;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        sim[i].vx += fx;
        sim[i].vy += fy;
        sim[j].vx -= fx;
        sim[j].vy -= fy;
      }
    }
    // Spring attraction along links.
    for (const l of links) {
      const a = sim[l.s];
      const b = sim[l.t];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const force = (dist - restLength) * springK;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }
    // Gravity toward centre + integrate with capped, cooling step.
    for (const sn of sim) {
      if (sn.fixed) {
        sn.vx = 0;
        sn.vy = 0;
        continue;
      }
      sn.vx += (cx - sn.x) * gravity;
      sn.vy += (cy - sn.y) * gravity;
      sn.vx *= damping;
      sn.vy *= damping;
      const speed = Math.sqrt(sn.vx * sn.vx + sn.vy * sn.vy);
      if (speed > temperature) {
        sn.vx = (sn.vx / speed) * temperature;
        sn.vy = (sn.vy / speed) * temperature;
      }
      sn.x += sn.vx;
      sn.y += sn.vy;
      // Soft clamp: allow the layout to overflow the canvas so it keeps a
      // natural shape (fit-to-content reframes it afterwards). The wide bound
      // only guards against runaway coordinates, it no longer glues nodes to
      // the four edges.
      const padX = w * 0.5 + nodeRadius * 2;
      const padY = h * 0.5 + nodeRadius * 2;
      sn.x = Math.max(-padX, Math.min(w + padX, sn.x));
      sn.y = Math.max(-padY, Math.min(h + padY, sn.y));
    }
    temperature *= cooling;
  }

  const out = new Map<string, { x: number; y: number }>();
  for (const sn of sim) out.set(sn.id, { x: sn.x, y: sn.y });
  return out;
}

export type ForceGraphProps = React.HTMLAttributes<HTMLElement> & {
  nodes: ForceGraphNode[];
  edges: ForceGraphEdge[];
  /** Accessible name for the figure (required). */
  label: string;
  width?: number;
  height?: number;
  /** Base node radius in px (scaled by node.weight). */
  nodeRadius?: number;
  /** Show text labels next to nodes. */
  showLabels?: boolean;
  /**
   * Number of cooling ticks. The simulation runs a synchronous warmup then
   * animates the remainder unless reduced motion is requested.
   */
  iterations?: number;
  /**
   * IDs of currently selected nodes. Highlighted visually without
   * re-running the layout. Defaults to [].
   */
  selectedIds?: string[];
  /**
   * ID of the node to focus/centre visually (ring highlight). Does not
   * re-run the layout. Defaults to null.
   */
  focusId?: string | null;
  /**
   * Called when the user clicks (or presses Space/Enter) a node.
   * Fires with the node's stable id.
   */
  onSelect?: (id: string) => void;
  /**
   * Called when the user activates a node (double-click or Enter key while
   * keyboard-focused). Intended to open a detail panel.
   * Fires with the node's stable id.
   */
  onOpenEntity?: (id: string) => void;
  /**
   * Called when the user hovers an edge.
   * Fires with the edge object (source/target/relation/weak).
   */
  onEdgeHover?: (edge: ForceGraphEdge) => void;
  /**
   * Legend entries rendered as a corner overlay.
   * Each entry has a label + optional shape (node) or weak (edge).
   */
  legend?: ForceGraphLegendEntry[];
  /**
   * Edge curvature, 0..1. 0 = straight <line> (back-compat). Larger values
   * bow each edge into a quadratic <path>, offset perpendicular to the chord
   * by `edgeCurve * dist * factor`. Defaults to a light 0.15.
   */
  edgeCurve?: number;
  /**
   * Repulsion multiplier controlling how spread out the layout is.
   * >1 = graphe plus aéré, <1 = plus compact ; multiplie la force de
   * répulsion sans toucher au fit-to-content. Defaults to 1. Clamped to
   * [0.1, 10] internally to avoid layout explosions/collapses.
   */
  repulsion?: number;
  /**
   * Called when the user hovers (or keyboard-focuses) a node, and again with
   * null when the hover/focus ends. Intended for syncing an external panel.
   */
  onNodeHover?: (node: ForceGraphNode | null) => void;
  /**
   * Reconciliation merge animation (CLIENT-ONLY — driven by `useEffect`, which
   * never runs during SSR, so no merge is animated or resolved server-side).
   *
   * Pass a `{ id, from, into }` where both `from` and `into` exist in `nodes`:
   * the `from` node animates toward the position of `into` while fading out (the
   * node and its incident edges), then `onMergeComplete(pair)` fires exactly
   * ONCE for that `id`. Purely visual — the component never mutates the data;
   * the consumer removes `from` from `nodes` after the callback.
   *
   * Idempotent on `id`: re-passing the SAME `id` (even with a new identity for
   * the object) is a no-op — the animation/callback are not replayed. Passing a
   * NEW `id` (re)plays the merge, even for the same `from`/`into` pair. After
   * completion the `from` node stays MASKED (hidden) until the consumer removes
   * it or a new `mergePair` is supplied, so it does not flash back when the prop
   * returns to null. Pass null (the default) for no merge in flight.
   */
  mergePair?: { id: string; from: string; into: string } | null;
  /**
   * Fired once the merge animation for the current `mergePair` completes (or
   * immediately, on a microtask, under reduced motion). Fires at most ONCE per
   * `id`. Receives the same pair so the consumer can drop `from` from the data.
   */
  onMergeComplete?: (pair: { id: string; from: string; into: string }) => void;
};

// Curvature offset factor: how far (relative to chord length) the control
// point bows out at edgeCurve=1. Kept modest so edgeCurve≈0.15 reads "light".
const FORCE_GRAPH_CURVE_FACTOR = 0.5;
// Merge (reconciliation) glide duration.
const FORCE_GRAPH_MERGE_DURATION_MS = 450;
// ease-in-out (cubic) for a smooth glide.
function forceGraphEaseInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
// Fit-to-content margin (per side, fraction of the content box).
const FORCE_GRAPH_CONTENT_MARGIN = 0.08;

export function ForceGraph({
  nodes,
  edges,
  label,
  width = 480,
  height = 360,
  nodeRadius = 7,
  showLabels = true,
  iterations = 300,
  selectedIds = [],
  focusId = null,
  onSelect,
  onOpenEntity,
  onEdgeHover,
  legend,
  edgeCurve = 0.15,
  repulsion = 1,
  onNodeHover,
  mergePair = null,
  onMergeComplete,
  className,
  ...rest
}: ForceGraphProps) {
  // SSR-safe reduced-motion check (window may be undefined during SSR/tests).
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const toneMap = React.useMemo(() => buildForceGraphToneMap(nodes), [nodes]);

  // The whole layout is recomputed when inputs change. The same settled
  // layout is used as the rendered target — a static, deterministic frame —
  // which keeps the component framework-light and test-friendly while still
  // honouring the motion preference (no rAF loop, no jitter).
  const layout = React.useMemo(() => {
    const ticks = Math.max(1, Math.round(iterations));
    return runForceGraphSimulation(nodes, edges, width, height, ticks, nodeRadius, repulsion);
  }, [nodes, edges, width, height, iterations, nodeRadius, repulsion]);

  const positionedNodes = React.useMemo(
    () =>
      nodes.map((n, i) => {
        const p = layout.get(n.id) ?? { x: width / 2, y: height / 2 };
        const r = nodeRadius * Math.sqrt(Math.max(n.weight ?? 1, 0.25));
        const shapePath = nodeShapePath(n.shape, r);
        return {
          node: n,
          i,
          x: p.x,
          y: p.y,
          r,
          tone: toneMap.get(n.id) ?? ("category1" as ForceGraphTone),
          title: n.label ?? n.id,
          shapePath,
        };
      }),
    [nodes, layout, width, height, nodeRadius, toneMap],
  );

  const positionedEdges = React.useMemo(() => {
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const curve = Math.max(0, edgeCurve ?? 0);
    return edges
      .map((e, i) => {
        const a = layout.get(e.source);
        const b = layout.get(e.target);
        if (!a || !b) return null;
        const srcNode = nodeById.get(e.source);
        const tgtNode = nodeById.get(e.target);
        const x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
        // Quadratic control point: midpoint pushed perpendicular to the chord.
        let path: string | null = null;
        let cx = (x1 + x2) / 2;
        let cy = (y1 + y2) / 2;
        if (curve > 0) {
          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          const off = curve * dist * FORCE_GRAPH_CURVE_FACTOR;
          // Unit perpendicular to the chord.
          const px = -dy / dist;
          const py = dx / dist;
          cx = (x1 + x2) / 2 + px * off;
          cy = (y1 + y2) / 2 + py * off;
          path = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        }
        const dashArray = edgeDashArray(e.dash, e.weak);
        const strokeWidth =
          typeof e.width === "number" ? e.width : e.emphasis ? 2.5 : null;
        return {
          edge: e,
          i,
          x1,
          y1,
          x2,
          y2,
          // Tooltip / label anchor follows the curve apex when curved.
          midX: cx,
          midY: cy,
          path,
          dashArray,
          strokeWidth,
          srcLabel: srcNode?.label ?? e.source,
          tgtLabel: tgtNode?.label ?? e.target,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  }, [nodes, edges, layout, edgeCurve]);

  // ---------------------------------------------------------------------------
  // Fit-to-content (Feature 5): after warmup the layout may extend beyond the
  // nominal width/height. Compute the real content bounding-box (node centres
  // ± radius) and frame it with an 8% margin on each side. The base viewBox is
  // this frame (not the fixed 0,0,w,h), so the graph is centred and never
  // clipped, whatever the aspect ratio. Zoom/pan stay relative to this frame.
  // ---------------------------------------------------------------------------
  const contentBox = React.useMemo(() => {
    if (positionedNodes.length === 0) {
      return { x: 0, y: 0, w: width, h: height };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of positionedNodes) {
      // Use the worst-case extent for non-circular shapes (area-scaled) so the
      // glyph (and a little label room) is never clipped.
      const ext = p.r * 1.7;
      minX = Math.min(minX, p.x - ext);
      minY = Math.min(minY, p.y - ext);
      maxX = Math.max(maxX, p.x + ext);
      maxY = Math.max(maxY, p.y + ext);
    }
    let w = maxX - minX;
    let h = maxY - minY;
    // Guard against a degenerate (single node / collinear) box.
    if (!(w > 0)) {
      w = width;
      minX = maxX - w / 2;
    }
    if (!(h > 0)) {
      h = height;
      minY = maxY - h / 2;
    }
    const mx = w * FORCE_GRAPH_CONTENT_MARGIN;
    const my = h * FORCE_GRAPH_CONTENT_MARGIN;
    return { x: minX - mx, y: minY - my, w: w + 2 * mx, h: h + 2 * my };
  }, [positionedNodes, width, height]);

  const [hoveredNodeIndex, setHoveredNodeIndex] = React.useState<number | null>(null);
  const [hoveredEdgeIndex, setHoveredEdgeIndex] = React.useState<number | null>(null);

  // ---------------------------------------------------------------------------
  // Merge animation (reconciliation): when `mergePair` becomes a new valid
  // pair, the `from` node slides toward `into` while fading out (node +
  // incident edges), then `onMergeComplete` fires. Purely visual — never
  // mutates props. Under reduced motion / SSR we skip straight to completion on
  // a microtask. The clock is anchored to the FIRST rAF frame's own timestamp
  // (rAF timestamps and performance.now() can use different time origins under
  // jsdom, which would yield a garbage elapsed time).
  // ---------------------------------------------------------------------------
  type MergeState = {
    id: string;
    from: string;
    into: string;
    /** Animation progress, 0..1. */
    progress: number;
    /** Pixel delta from the `from` start position to `into`, captured at start. */
    dx: number;
    dy: number;
  };
  const [mergeState, setMergeState] = React.useState<MergeState | null>(null);
  // The id of the `from` node to keep MASKED after a completed merge, until the
  // consumer drops it from `nodes` (or a new pair arrives). Decouples the mask
  // from `mergePair` returning to null (otherwise the node would flash back).
  const [maskedFromId, setMaskedFromId] = React.useState<string | null>(null);
  // The id currently being (or already) handled, so the effect only reacts to a
  // genuinely NEW id. Re-passing the same id (even a fresh object) is a no-op.
  const handledMergeIdRef = React.useRef<string | null>(null);
  // Set true on unmount so no queued microtask/frame fires a callback or touches
  // state after teardown.
  const disposedRef = React.useRef(false);
  // Latest layout / callback, read inside the effect without retriggering it.
  const layoutRef = React.useRef(layout);
  layoutRef.current = layout;
  const onMergeCompleteRef = React.useRef(onMergeComplete);
  onMergeCompleteRef.current = onMergeComplete;
  const mergeId = mergePair ? mergePair.id : null;

  // Component-lifetime teardown guard: mark disposed on unmount.
  React.useEffect(() => {
    return () => {
      disposedRef.current = true;
    };
  }, []);

  React.useEffect(() => {
    const pair = mergePair;
    const id = pair ? pair.id : null;

    // Idempotent on id: same id (or still null) means nothing to (re)start. A
    // new id always (re)plays, even for the same from/into pair.
    if (id === handledMergeIdRef.current) return;
    handledMergeIdRef.current = id;

    // Tear down any in-flight animation for a previous pair.
    setMergeState(null);
    if (!pair) return;

    // A genuinely new pair supersedes any lingering mask from a prior merge.
    setMaskedFromId(null);

    let raf: number | null = null;
    let cancelled = false;

    // Validate: both endpoints must currently exist.
    const lay = layoutRef.current;
    const fromPos = lay.get(pair.from);
    const intoPos = lay.get(pair.into);
    if (!fromPos || !intoPos) return; // invalid pair → no-op, no callback

    const captured = { id: pair.id, from: pair.from, into: pair.into };

    const complete = () => {
      // Keep `from` hidden until the consumer removes it (or a new pair arrives).
      setMaskedFromId(captured.from);
      onMergeCompleteRef.current?.(captured);
    };

    // Reduced motion: no animation, resolve on a microtask. Guarded so a late
    // microtask after unmount or after a newer id took over is a no-op.
    if (prefersReducedMotion || typeof requestAnimationFrame !== "function") {
      queueMicrotask(() => {
        if (disposedRef.current || cancelled || handledMergeIdRef.current !== id)
          return;
        complete();
      });
      return () => {
        cancelled = true;
      };
    }

    const dx = intoPos.x - fromPos.x;
    const dy = intoPos.y - fromPos.y;
    setMergeState({ id: captured.id, from: captured.from, into: captured.into, progress: 0, dx, dy });

    let start: number | null = null;
    const tick = (now: number) => {
      // Bail cleanly if the instance went away or a newer id superseded us.
      if (disposedRef.current || cancelled || handledMergeIdRef.current !== id) {
        raf = null;
        return;
      }
      // Re-validate both endpoints every frame: if either disappears mid-flight
      // (e.g. the consumer removed a node), cancel the glide WITHOUT firing
      // onMergeComplete (no double-tir) and without a dangling frame.
      const live = layoutRef.current;
      if (!live.has(captured.from) || !live.has(captured.into)) {
        raf = null;
        setMergeState(null);
        return;
      }
      if (start === null) start = now;
      const t = Math.min(1, Math.max(0, (now - start) / FORCE_GRAPH_MERGE_DURATION_MS));
      setMergeState((prev) => (prev ? { ...prev, progress: t } : prev));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
        setMergeState(null);
        complete();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (raf != null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(raf);
      }
    };
    // Re-run only when the pair's id changes (not on unrelated re-renders).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeId, prefersReducedMotion]);

  // Eased progress of the `from` node toward `into`. 0 when no merge running.
  const mergeFromId = mergeState?.from ?? null;
  const mergeEased = mergeState ? forceGraphEaseInOut(mergeState.progress) : 0;

  /** True when this id is the (post-merge) masked node — render it fully hidden. */
  function isMasked(id: string): boolean {
    return maskedFromId === id;
  }

  /** Extra translation applied to the merging node so it glides toward `into`. */
  function mergeOffset(id: string): { x: number; y: number } {
    if (!mergeState || mergeState.from !== id) return { x: 0, y: 0 };
    return { x: mergeState.dx * mergeEased, y: mergeState.dy * mergeEased };
  }

  /**
   * Opacity for a node during/after a merge. The animating `from` fades 1->0; a
   * masked `from` (merge done, awaiting removal) stays at 0. Others unaffected.
   */
  function mergeNodeOpacity(id: string): number | undefined {
    if (isMasked(id)) return 0;
    if (mergeFromId !== id) return undefined;
    return 1 - mergeEased;
  }

  /** Opacity for an edge incident to the merging/masked `from` node (fades too). */
  function mergeEdgeOpacity(e: ForceGraphEdge): number | undefined {
    const fromId = mergeFromId ?? maskedFromId;
    if (fromId == null) return undefined;
    if (e.source !== fromId && e.target !== fromId) return undefined;
    return isMasked(fromId) ? 0 : 1 - mergeEased;
  }

  const selectedSet = React.useMemo(() => new Set<string>(selectedIds), [selectedIds]);

  // Adjacency: id -> set of directly connected node ids. Used to keep the
  // direct neighbours of selected/focused nodes fully visible (demand 6).
  const adjacency = React.useMemo(() => {
    const adj = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      let set = adj.get(a);
      if (!set) {
        set = new Set();
        adj.set(a, set);
      }
      set.add(b);
    };
    for (const e of edges) {
      add(e.source, e.target);
      add(e.target, e.source);
    }
    return adj;
  }, [edges]);

  // True when a selection/focus is active — only then do we dim non-related
  // nodes. The set of "active" ids = selected ∪ focus ∪ all their neighbours.
  const hasActiveSelection = selectedSet.size > 0 || focusId != null;
  const activeAndNeighbours = React.useMemo(() => {
    const active = new Set<string>(selectedSet);
    if (focusId != null) active.add(focusId);
    // Expand to direct neighbours so they stay fully visible.
    const withNeighbours = new Set<string>(active);
    for (const id of active) {
      const nb = adjacency.get(id);
      if (nb) for (const n of nb) withNeighbours.add(n);
    }
    return withNeighbours;
  }, [selectedSet, focusId, adjacency]);

  // A node is dimmed by selection when there IS an active selection and the
  // node is neither selected/focused nor a direct neighbour of one.
  function isSelectionDimmed(id: string): boolean {
    if (!hasActiveSelection) return false;
    return !activeAndNeighbours.has(id);
  }

  // An edge stays fully visible when at least one endpoint is in the
  // selected/focused set (it is a connection of the selection).
  function isEdgeSelectionDimmed(e: ForceGraphEdge): boolean {
    if (!hasActiveSelection) return false;
    const srcActive = selectedSet.has(e.source) || focusId === e.source;
    const tgtActive = selectedSet.has(e.target) || focusId === e.target;
    return !(srcActive || tgtActive);
  }

  // ---------------------------------------------------------------------------
  // Hover-connexe (demand 7): hovering a node fades the rest of the graph the
  // same way selection does — the hovered node and its direct neighbours stay
  // full, every other node dims, and only edges incident to the hovered node
  // keep their opacity. Composes with selection (predicates OR'd together).
  // ---------------------------------------------------------------------------
  const hoveredNodeId =
    hoveredNodeIndex !== null ? (positionedNodes[hoveredNodeIndex]?.node.id ?? null) : null;
  const hoverActiveSet = React.useMemo(() => {
    const set = new Set<string>();
    if (hoveredNodeId == null) return set;
    set.add(hoveredNodeId);
    const nb = adjacency.get(hoveredNodeId);
    if (nb) for (const n of nb) set.add(n);
    return set;
  }, [hoveredNodeId, adjacency]);

  // A node is dimmed by hover when a node is hovered and this one is neither
  // the hovered node nor one of its direct neighbours.
  function isHoverDimmedNode(id: string): boolean {
    if (hoveredNodeId == null) return false;
    return !hoverActiveSet.has(id);
  }

  // An edge is dimmed by hover when a node is hovered and the edge is not
  // incident to it (keep only the hovered node's own edges full).
  function isHoverDimmedEdge(e: ForceGraphEdge): boolean {
    if (hoveredNodeId == null) return false;
    return e.source !== hoveredNodeId && e.target !== hoveredNodeId;
  }

  // Keyboard handler for a node element: Space/Enter → onSelect, Enter → onOpenEntity.
  function handleNodeKeydown(id: string, e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(id);
    }
    if (e.key === "Enter") {
      onOpenEntity?.(id);
    }
  }

  // ---------------------------------------------------------------------------
  // Zoom + pan state (framed by the fit-to-content box, Feature 5). The base
  // frame is `contentBox` (not 0,0,w,h). Zoom is a scale multiplier and pan is
  // an offset in SVG coords, both relative to that base frame:
  //   vbW = baseW / zoomScale,  vbH = baseH / zoomScale
  //   vbX = baseX + panX,       vbY = baseY + panY
  // ---------------------------------------------------------------------------
  const [zoomScale, setZoomScale] = React.useState(1);
  const [panX, setPanX] = React.useState(0);
  const [panY, setPanY] = React.useState(0);

  const isPanningRef = React.useRef(false);
  const panStartRef = React.useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [isPanning, setIsPanning] = React.useState(false);

  // Base frame dimensions = fit-to-content box.
  const baseW = contentBox.w;
  const baseH = contentBox.h;
  const baseX = contentBox.x;
  const baseY = contentBox.y;

  const vbW = baseW / zoomScale;
  const vbH = baseH / zoomScale;
  const vbX = baseX + panX;
  const vbY = baseY + panY;

  function resetView() {
    setZoomScale(1);
    setPanX(0);
    setPanY(0);
  }

  function handleWheel(ev: React.WheelEvent<SVGSVGElement>) {
    if (prefersReducedMotion) return;
    ev.preventDefault();
    // Zoom factor: ~10% per step.
    const factor = ev.deltaY > 0 ? 0.9 : 1.1;
    // Clamp zoom: 0.2x – 8x.
    const newScale = Math.min(Math.max(zoomScale * factor, 0.2), 8);
    // Anchor zoom around the cursor position in SVG coords.
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const curW = baseW / zoomScale;
      const curH = baseH / zoomScale;
      const cursorSvgX = vbX + ((ev.clientX - rect.left) / rect.width) * curW;
      const cursorSvgY = vbY + ((ev.clientY - rect.top) / rect.height) * curH;
      const newVbW = baseW / newScale;
      const newVbH = baseH / newScale;
      const ratioX = (cursorSvgX - vbX) / curW;
      const ratioY = (cursorSvgY - vbY) / curH;
      // New top-left so the cursor anchor stays put, then back out the pan term.
      setPanX(cursorSvgX - ratioX * newVbW - baseX);
      setPanY(cursorSvgY - ratioY * newVbH - baseY);
    }
    setZoomScale(newScale);
  }

  function handleBgMouseDown(ev: React.MouseEvent<SVGSVGElement>) {
    // Only start pan when clicking the background (not a node/edge element).
    if ((ev.target as Element).closest(".st-forceGraph__node")) return;
    if (prefersReducedMotion) return;
    isPanningRef.current = true;
    setIsPanning(true);
    panStartRef.current = { x: ev.clientX, y: ev.clientY, panX, panY };
  }

  function handleMouseMove(ev: React.MouseEvent<SVGSVGElement>) {
    if (!isPanningRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((ev.clientX - panStartRef.current.x) / rect.width) * vbW;
    const dy = ((ev.clientY - panStartRef.current.y) / rect.height) * vbH;
    setPanX(panStartRef.current.panX - dx);
    setPanY(panStartRef.current.panY - dy);
  }

  function handleMouseUp() {
    isPanningRef.current = false;
    setIsPanning(false);
  }

  const viewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;
  const isZoomed = zoomScale !== 1 || panX !== 0 || panY !== 0;

  const hoveredNode = hoveredNodeIndex !== null ? positionedNodes[hoveredNodeIndex] : null;
  const hoveredEdge = hoveredEdgeIndex !== null ? positionedEdges.find((pe) => pe.i === hoveredEdgeIndex) : null;
  const hoveredNodeRelCount = hoveredNode
    ? positionedEdges.filter((e) => e.edge.source === hoveredNode.node.id || e.edge.target === hoveredNode.node.id).length
    : 0;

  return (
    <div
      {...rest}
      className={classNames("st-forceGraph", prefersReducedMotion && "st-forceGraph--static", className)}
      role="img"
      aria-label={label}
    >
      <svg
        ref={svgRef}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
        className={classNames(isPanning && "st-forceGraph__svg--panning")}
        onWheel={handleWheel}
        onMouseDown={handleBgMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* edges first so nodes paint on top */}
        <g className="st-forceGraph__edges">
          {positionedEdges.map((e) => {
            const onHitEnter = () => {
              setHoveredEdgeIndex(e.i);
              onEdgeHover?.(e.edge);
            };
            const onHitLeave = () => setHoveredEdgeIndex(null);
            const mEdgeOpacity = mergeEdgeOpacity(e.edge);
            const edgeClass = classNames(
              "st-forceGraph__edge",
              e.edge.weak && "st-forceGraph__edge--weak",
              e.edge.emphasis && "st-forceGraph__edge--emphasis",
              hoveredEdgeIndex === e.i && "st-forceGraph__edge--hovered",
              (isEdgeSelectionDimmed(e.edge) || isHoverDimmedEdge(e.edge)) &&
                "st-forceGraph__edge--dim",
              mEdgeOpacity !== undefined && "st-forceGraph__edge--merging",
            );
            return (
              <React.Fragment key={e.i}>
                {/* Invisible wider hit area for edge hover (follows the curve) */}
                {e.path ? (
                  <path
                    className="st-forceGraph__edgeHit"
                    role="presentation"
                    d={e.path}
                    fill="none"
                    onMouseEnter={onHitEnter}
                    onMouseLeave={onHitLeave}
                  />
                ) : (
                  <line
                    className="st-forceGraph__edgeHit"
                    role="presentation"
                    x1={e.x1}
                    y1={e.y1}
                    x2={e.x2}
                    y2={e.y2}
                    onMouseEnter={onHitEnter}
                    onMouseLeave={onHitLeave}
                  />
                )}
                {e.path ? (
                  <path
                    className={edgeClass}
                    d={e.path}
                    fill="none"
                    strokeDasharray={e.dashArray ?? undefined}
                    strokeWidth={e.strokeWidth ?? undefined}
                    opacity={mEdgeOpacity}
                    pointerEvents="none"
                  />
                ) : (
                  <line
                    className={edgeClass}
                    x1={e.x1}
                    y1={e.y1}
                    x2={e.x2}
                    y2={e.y2}
                    strokeDasharray={e.dashArray ?? undefined}
                    strokeWidth={e.strokeWidth ?? undefined}
                    opacity={mEdgeOpacity}
                    pointerEvents="none"
                  />
                )}
              </React.Fragment>
            );
          })}
        </g>

        <g className="st-forceGraph__nodes">
          {positionedNodes.map((p) => {
            const ariaLabel = `${p.title}${p.node.group !== undefined ? `: ${p.node.group}` : ""}`;
            const pressed = selectedSet.has(p.node.id);
            const shapeProps = {
              className: "st-forceGraph__shape st-forceGraph__dot",
              tabIndex: 0,
              role: "button" as const,
              "aria-label": ariaLabel,
              "aria-pressed": pressed,
              onMouseEnter: () => {
                setHoveredNodeIndex(p.i);
                onNodeHover?.(p.node);
              },
              onMouseLeave: () => {
                setHoveredNodeIndex(null);
                onNodeHover?.(null);
              },
              onFocus: () => {
                setHoveredNodeIndex(p.i);
                onNodeHover?.(p.node);
              },
              onBlur: () => {
                setHoveredNodeIndex(null);
                onNodeHover?.(null);
              },
              onClick: () => onSelect?.(p.node.id),
              onDoubleClick: () => onOpenEntity?.(p.node.id),
              onKeyDown: (e: React.KeyboardEvent) => handleNodeKeydown(p.node.id, e),
            };
            const mOff = mergeOffset(p.node.id);
            const mOpacity = mergeNodeOpacity(p.node.id);
            const mMasked = isMasked(p.node.id);
            return (
              <g
                key={p.node.id}
                className={classNames(
                  "st-forceGraph__node",
                  `st-forceGraph__node--${p.tone}`,
                  (isHoverDimmedNode(p.node.id) || isSelectionDimmed(p.node.id)) &&
                    "st-forceGraph__node--dim",
                  pressed && "st-forceGraph__node--selected",
                  focusId === p.node.id && "st-forceGraph__node--focus",
                  (mergeFromId === p.node.id || mMasked) &&
                    "st-forceGraph__node--merging",
                )}
                aria-hidden={mMasked ? "true" : undefined}
                opacity={mOpacity}
                transform={`translate(${p.x + mOff.x} ${p.y + mOff.y})`}
              >
                {p.shapePath ? (
                  <path {...shapeProps} d={p.shapePath} />
                ) : (
                  <circle {...shapeProps} r={p.r} />
                )}
                {showLabels ? (
                  <text className="st-forceGraph__label" x={p.r + 3} y={0} dominantBaseline="middle">
                    {p.title}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Node tooltip */}
      {hoveredNode ? (
        <div
          className="st-forceGraph__tooltip"
          role="presentation"
          style={{
            left: `${((hoveredNode.x - vbX) / vbW) * 100}%`,
            top: `${((hoveredNode.y - vbY) / vbH) * 100}%`,
          }}
        >
          <span className="st-forceGraph__tooltipLabel">{hoveredNode.title}</span>
          {hoveredNode.node.group !== undefined ? (
            <span className="st-forceGraph__tooltipMeta">{hoveredNode.node.group}</span>
          ) : null}
          {hoveredNodeRelCount > 0 ? (
            <span className="st-forceGraph__tooltipMeta">
              {hoveredNodeRelCount} relation{hoveredNodeRelCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Edge tooltip */}
      {hoveredEdge ? (
        <div
          className="st-forceGraph__tooltip st-forceGraph__tooltip--edge"
          role="presentation"
          style={{
            left: `${((hoveredEdge.midX - vbX) / vbW) * 100}%`,
            top: `${((hoveredEdge.midY - vbY) / vbH) * 100}%`,
          }}
        >
          <span className="st-forceGraph__tooltipLabel">{hoveredEdge.srcLabel}</span>
          {hoveredEdge.edge.relation ? (
            <span className="st-forceGraph__tooltipRelation">{hoveredEdge.edge.relation}</span>
          ) : null}
          <span className="st-forceGraph__tooltipLabel">{hoveredEdge.tgtLabel}</span>
        </div>
      ) : null}

      {/* Reset view button (only shown when zoomed/panned) */}
      {isZoomed ? (
        <button className="st-forceGraph__resetBtn" type="button" aria-label="Reset view" onClick={resetView}>
          ↺
        </button>
      ) : null}

      {/* Legend overlay */}
      {legend && legend.length > 0 ? (
        <div className="st-forceGraph__legend" aria-label="Graph legend">
          {legend.map((entry, idx) => {
            const swatchPath = entry.shape !== undefined ? nodeShapePath(entry.shape, 7) : null;
            const swatchTone = entry.tone ?? "category1";
            const swatchDash = entry.shape === undefined ? edgeDashArray(entry.dash, entry.weak) : null;
            return (
              <div className="st-forceGraph__legendEntry" key={idx}>
                {entry.shape !== undefined ? (
                  // Node shape legend entry (viewBox widened for area-scaled glyphs)
                  <svg className="st-forceGraph__legendSwatch" viewBox="-13 -13 26 26" width="16" height="16" aria-hidden="true">
                    {swatchPath ? (
                      <path d={swatchPath} className={`st-forceGraph__legendShape st-forceGraph__legendShape--${swatchTone}`} />
                    ) : (
                      <circle r="7" className={`st-forceGraph__legendShape st-forceGraph__legendShape--${swatchTone}`} />
                    )}
                  </svg>
                ) : (
                  // Edge style legend entry
                  <svg className="st-forceGraph__legendSwatch" viewBox="0 0 16 8" width="16" height="8" aria-hidden="true">
                    <line
                      x1="0"
                      y1="4"
                      x2="16"
                      y2="4"
                      className={classNames("st-forceGraph__legendEdge", entry.weak && "st-forceGraph__legendEdge--weak")}
                      strokeDasharray={swatchDash ?? undefined}
                    />
                  </svg>
                )}
                <span className="st-forceGraph__legendLabel">{entry.label}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export type GraphLegendProps = React.HTMLAttributes<HTMLDivElement> & {
  entries: ForceGraphLegendEntry[];
  /** Optional heading shown above entries. */
  title?: string;
};

export function GraphLegend({ entries, title, className, ...rest }: GraphLegendProps) {
  return (
    <div {...rest} className={classNames("st-graphLegend", className)} aria-label={title ?? "Graph legend"}>
      {title ? <p className="st-graphLegend__title">{title}</p> : null}
      <ul className="st-graphLegend__list" role="list">
        {entries.map((entry, idx) => {
          const swatchPath = entry.shape !== undefined ? nodeShapePath(entry.shape, 7) : null;
          const swatchTone = entry.tone ?? "category1";
          const swatchDash = entry.shape === undefined ? edgeDashArray(entry.dash, entry.weak) : null;
          return (
            <li className="st-graphLegend__entry" key={idx}>
              {entry.shape !== undefined ? (
                <svg className="st-graphLegend__swatch" viewBox="-13 -13 26 26" width="16" height="16" aria-hidden="true">
                  {swatchPath ? (
                    <path d={swatchPath} className={`st-graphLegend__shape st-graphLegend__shape--${swatchTone}`} />
                  ) : (
                    <circle r="7" className={`st-graphLegend__shape st-graphLegend__shape--${swatchTone}`} />
                  )}
                </svg>
              ) : (
                <svg className="st-graphLegend__swatch" viewBox="0 0 16 8" width="16" height="8" aria-hidden="true">
                  <line
                    x1="0"
                    y1="4"
                    x2="16"
                    y2="4"
                    className={classNames("st-graphLegend__edge", entry.weak && "st-graphLegend__edge--weak")}
                    strokeDasharray={swatchDash ?? undefined}
                  />
                </svg>
              )}
              <span className="st-graphLegend__label">{entry.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export type FormProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  status?: "idle" | "submitting" | "submitted" | "error";
  message?: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
};
export function Form({ status = "idle", message, children, className, ...rest }: FormProps) {
  return (
    <form {...rest} className={classNames("st-form", className)}>
      <div className="st-form__body">{children}</div>
      {message ? <p className={classNames("st-form__message", `st-form__message--${status === "submitted" ? "success" : status === "error" ? "error" : "help"}`)}>{message}</p> : null}
    </form>
  );
}

export type FormGroupProps = React.FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  legend: React.ReactNode;
  helperText?: React.ReactNode;
};
export function FormGroup({ legend, helperText, children, className, ...rest }: FormGroupProps) {
  return (
    <fieldset {...rest} className={classNames("st-form-group st-formGroup", className)}>
      {legend ? <legend className="st-form-group__legend st-formGroup__legend">{legend}</legend> : null}
      <div className="st-form-group__body st-formGroup__body">{children}</div>
      {helperText ? <p className="st-form-group__help st-formGroup__help">{helperText}</p> : null}
    </fieldset>
  );
}

export type HeaderAccount = { name?: string; email?: string; avatarUrl?: string };
export function deriveInitials(name?: string): string {
  return (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
export type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  brand?: React.ReactNode;
  title?: React.ReactNode;
  navigation?: Array<{ label: React.ReactNode; href: string }>;
  navItems?: Array<{ label: React.ReactNode; href: string }>;
  account?: HeaderAccount;
  sticky?: boolean;
};
export function Header({ brand, title, navigation, navItems, account, sticky = false, className, ...rest }: HeaderProps) {
  const links = navigation ?? navItems ?? [];
  return (
    <header {...rest} className={classNames("st-header", sticky && "st-header--sticky", className)}>
      <div className="st-header__leading">
        {brand ? <a className="st-header__logo" href="/">{brand}</a> : null}
        {title ? <span className="st-header__title">{title}</span> : null}
      </div>
      <nav className="st-header__navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      {account ? (
        <div className="st-header__account">
          <span className="st-header__avatar st-header__avatar--initials">{deriveInitials(account.name)}</span>
          <span className="st-header__account-name">{account.name}</span>
          {account.email ? <span className="st-header__account-email">{account.email}</span> : null}
        </div>
      ) : null}
    </header>
  );
}

// --- Shell : AppHeader / LanguageToggle / IdentityMenu (calque sentropic) ---
// Icônes lucide reproduites en SVG inline (mêmes paths que @lucide/svelte) pour
// conserver une parité stricte sans introduire de dépendance lucide-react.
function MenuIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="st-appHeader__burgerIcon">
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  );
}
function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="st-appHeader__burgerIcon">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
function ChevronDownIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export type AppHeaderProps = {
  compact?: boolean;
  menuOpen?: boolean;
  onMenuToggle?: () => void;
  menuLabel?: string;
  /**
   * Id du tiroir, partagé entre `aria-controls` (burger) et `id` (drawer).
   * Auto-généré et stable si non fourni.
   */
  drawerId?: string;
  /**
   * Marque structurée (décision actée : logo SENT + sous-titre). Rend le bloc
   * canonique « logo carré + nom + sous-titre produit ». Si `logo` est fourni,
   * il a priorité (contrôle total).
   */
  brandName?: string;
  /** Sous-titre produit affiché sous le nom (ex. « Design System », « dataviz »). */
  productName?: string;
  /** Source de l'image du logo carré (ex. `/SENT-logo-squared.svg`). */
  logoSrc?: string;
  /** Texte alternatif du logo (décoratif par défaut). */
  logoAlt?: string;
  /** Cible du lien de la marque. Défaut : `/`. */
  brandHref?: string;
  /** aria-label du lien de marque (sinon dérivé de `brandName` + `productName`). */
  brandLabel?: string;
  logo?: React.ReactNode;
  nav?: React.ReactNode;
  actions?: React.ReactNode;
  drawer?: React.ReactNode;
  className?: string;
};
export function AppHeader({ compact = false, menuOpen = false, onMenuToggle, menuLabel = "Menu", drawerId, brandName, productName, logoSrc, logoAlt = "", brandHref = "/", brandLabel, logo, nav, actions, drawer, className }: AppHeaderProps) {
  // Id stable du tiroir : prop fournie sinon useId (SSR-safe, sans crypto).
  const reactId = React.useId();
  const resolvedDrawerId = drawerId ?? `st-appHeader-drawer-${reactId}`;
  const hasDefaultBrand = !logo && Boolean(brandName || productName || logoSrc);
  const resolvedBrandLabel = brandLabel ?? [brandName, productName].filter(Boolean).join(" ");
  return (
    <>
      <header className={classNames("st-appHeader", className)}>
        <div className="st-appHeader__bar">
          {logo ? (
            <div className="st-appHeader__logo">{logo}</div>
          ) : hasDefaultBrand ? (
            <a className="st-appHeader__brand" href={brandHref} aria-label={resolvedBrandLabel || undefined}>
              {logoSrc ? <img className="st-appHeader__brandMark" src={logoSrc} alt={logoAlt} aria-hidden={logoAlt ? undefined : true} /> : null}
              {brandName || productName ? (
                <span className="st-appHeader__brandCopy">
                  {brandName ? <span className="st-appHeader__brandName">{brandName}</span> : null}
                  {productName ? <span className="st-appHeader__brandProduct">{productName}</span> : null}
                </span>
              ) : null}
            </a>
          ) : null}
          {!compact ? (
            <>
              <nav className="st-appHeader__nav" aria-label="Primary">
                {nav}
              </nav>
              <div className="st-appHeader__actions">{actions}</div>
            </>
          ) : (
            <div className="st-appHeader__burger">
              <button
                type="button"
                className="st-appHeader__burgerButton"
                onClick={onMenuToggle}
                aria-label={menuLabel}
                aria-expanded={menuOpen}
                aria-controls={resolvedDrawerId}
                aria-haspopup="menu"
              >
                {menuOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          )}
        </div>
      </header>
      {compact && menuOpen && drawer ? (
        <>
          <button type="button" className="st-appHeader__scrim" aria-label={menuLabel} onClick={onMenuToggle} />
          <aside id={resolvedDrawerId} className="st-appHeader__drawer">{drawer}</aside>
        </>
      ) : null}
    </>
  );
}

export type LanguageToggleLocale = "fr" | "en";
export type LanguageToggleProps = {
  locale?: LanguageToggleLocale;
  onLocaleChange?: (locale: LanguageToggleLocale) => void;
  frLabel?: React.ReactNode;
  enLabel?: React.ReactNode;
  /** Libellé du sélecteur (associé via <label htmlFor> + aria-label). */
  label?: string;
  /** Id du <select> ; auto-généré et stable si non fourni. */
  selectId?: string;
  variant?: "select" | "accordion";
  accordionLabel?: React.ReactNode;
  className?: string;
};
export function LanguageToggle({ locale = "fr", onLocaleChange, frLabel = "FR", enLabel = "EN", label = "Langue", selectId, variant = "select", accordionLabel = "Langue", className }: LanguageToggleProps) {
  const [open, setOpen] = React.useState(false);
  const reactId = React.useId();
  const resolvedSelectId = selectId ?? `st-languageToggle-${reactId}`;
  if (variant === "accordion") {
    return (
      <div className={classNames("st-languageToggle", className)}>
        <button type="button" className="st-languageToggle__accordionTrigger" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span>{accordionLabel}</span>
          <ChevronDown className={classNames("st-languageToggle__chevron", open && "st-languageToggle__chevron--open")} size={16} aria-hidden="true" />
        </button>
        {open ? (
          <div className="st-languageToggle__accordionPanel">
            <button type="button" className={classNames("st-languageToggle__option", locale === "fr" && "st-languageToggle__option--active")} aria-current={locale === "fr"} onClick={() => onLocaleChange?.("fr")}>
              {frLabel}
            </button>
            <button type="button" className={classNames("st-languageToggle__option", locale === "en" && "st-languageToggle__option--active")} aria-current={locale === "en"} onClick={() => onLocaleChange?.("en")}>
              {enLabel}
            </button>
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <>
      <label className="st-visually-hidden st-languageToggle__srLabel" htmlFor={resolvedSelectId}>{label}</label>
      <select
        id={resolvedSelectId}
        className={classNames("st-languageToggle__select", className)}
        value={locale}
        aria-label={label}
        onChange={(e) => onLocaleChange?.(e.currentTarget.value as LanguageToggleLocale)}
      >
        <option value="fr">{frLabel}</option>
        <option value="en">{enLabel}</option>
      </select>
    </>
  );
}

export type IdentityUser = { displayName: string; email?: string; id?: string };
export type IdentityMenuProps = {
  user?: IdentityUser | null;
  isAuthenticated?: boolean;
  /**
   * État ouvert du dropdown (optionnellement contrôlé). Si fourni, le parent
   * contrôle ; sinon le composant gère un état interne. Aligné sur les 3 fw.
   */
  open?: boolean;
  /** Notifié à chaque demande de changement d'état ouvert (contrôlé/non-contrôlé). */
  onOpenChange?: (open: boolean) => void;
  onLogin?: () => void;
  onLogout?: () => void;
  devicesHref?: string;
  settingsHref?: string;
  loginLabel?: React.ReactNode;
  devicesLabel?: React.ReactNode;
  settingsLabel?: React.ReactNode;
  logoutLabel?: React.ReactNode;
  variant?: "dropdown" | "accordion";
  className?: string;
};
export function identityInitial(user: IdentityUser | null | undefined): string {
  const source = user?.displayName || user?.email || "U";
  return source.charAt(0).toUpperCase();
}
export function IdentityMenu({ user = null, isAuthenticated = false, open: controlledOpen, onOpenChange, onLogin, onLogout, devicesHref = "#", settingsHref = "#", loginLabel = "Se connecter", devicesLabel = "Appareils", settingsLabel = "Paramètres", logoutLabel = "Se déconnecter", variant = "dropdown", className }: IdentityMenuProps) {
  // Pattern contrôlé/non-contrôlé, IDENTIQUE aux 3 fw : si `open` est fourni en
  // prop, le parent contrôle ; sinon un état interne prend le relais. onOpenChange
  // est toujours notifié.
  const [open, setOpen] = useControlled(controlledOpen, false, onOpenChange);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  // Quel item focuser à la prochaine ouverture : "first" (défaut) ou "last".
  const pendingFocusRef = React.useRef<"first" | "last">("first");

  const getItems = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  const focusItem = React.useCallback((index: number) => {
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (!items.length) return;
    const len = items.length;
    items[((index % len) + len) % len]?.focus();
  }, []);

  // Clic extérieur : ferme ET restaure le focus sur le trigger. (Client-only :
  // useEffect ne s'exécute jamais en SSR.)
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, setOpen]);

  // À l'ouverture : focus le 1er item (ou le dernier sur ArrowUp). Client-only.
  React.useEffect(() => {
    if (!open) return;
    const which = pendingFocusRef.current;
    queueMicrotask(() => focusItem(which === "last" ? -1 : 0));
    pendingFocusRef.current = "first";
  }, [open, focusItem]);

  if (!(isAuthenticated && user)) {
    return (
      <button type="button" className={classNames("st-identityMenu__login", variant === "accordion" && "st-identityMenu__login--accordion", className)} onClick={() => onLogin?.()}>
        {loginLabel}
      </button>
    );
  }

  const displayName = user.displayName || user.email || "User";
  const closeAndFocusTrigger = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pendingFocusRef.current = "first";
      if (open) queueMicrotask(() => focusItem(0));
      else setOpen(true);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      pendingFocusRef.current = "last";
      if (open) queueMicrotask(() => focusItem(-1));
      else setOpen(true);
    } else if (event.key === "Escape" && open) {
      // Esc ferme aussi depuis le trigger (global au composant ouvert).
      event.preventDefault();
      closeAndFocusTrigger();
    }
  };
  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    const items = getItems();
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(current + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusItem(items.length - 1);
    } else if (event.key === "Tab") {
      // Piège de focus : Tab/Shift+Tab bouclent DANS le menu.
      if (!items.length) return;
      event.preventDefault();
      focusItem(current + (event.shiftKey ? -1 : 1));
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeAndFocusTrigger();
    }
  };
  // Enter/Space activent l'item courant. Sur un <a>, on suit le href via un clic
  // natif (preventDefault sur Space pour éviter le scroll).
  const onItemKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    }
  };
  const selectAndClose = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className={classNames("st-identityMenu", variant === "accordion" && "st-identityMenu--accordion", className)}>
      <button
        type="button"
        ref={triggerRef}
        className="st-identityMenu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Compte de ${displayName}`}
        onClick={() => setOpen(!open)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="st-identityMenu__avatar" aria-hidden="true">{identityInitial(user)}</span>
        <span className="st-identityMenu__meta">
          <span className="st-identityMenu__name">{displayName}</span>
          {variant === "accordion" && user.email ? <span className="st-identityMenu__email">{user.email}</span> : null}
        </span>
        <ChevronDownIcon className={classNames("st-identityMenu__chevron", open && "st-identityMenu__chevron--open")} />
      </button>
      {open ? (
        <div className="st-identityMenu__menu" role="menu" tabIndex={-1} aria-label={`Menu de ${displayName}`} onKeyDown={onMenuKeyDown}>
          <a href={devicesHref} className="st-identityMenu__item" role="menuitem" tabIndex={-1} onClick={selectAndClose} onKeyDown={onItemKeyDown}>
            {devicesLabel}
          </a>
          <a href={settingsHref} className="st-identityMenu__item" role="menuitem" tabIndex={-1} onClick={selectAndClose} onKeyDown={onItemKeyDown}>
            {settingsLabel}
          </a>
          <div className="st-identityMenu__divider" role="separator" aria-hidden="true" />
          <button type="button" className="st-identityMenu__item st-identityMenu__item--danger" role="menuitem" tabIndex={-1} onClick={() => { setOpen(false); triggerRef.current?.focus(); onLogout?.(); }}>
            {logoutLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export type HighlightTone = Tone;
export type HighlightProps = React.HTMLAttributes<HTMLElement> & {
  tone?: HighlightTone;
  title?: React.ReactNode;
};
export function Highlight({ tone = "neutral", title, children, className, ...rest }: HighlightProps) {
  return (
    <aside {...rest} className={classNames("st-highlight", `st-highlight--${tone}`, className)}>
      {title ? <h3 className="st-highlight__title">{title}</h3> : null}
      <div className="st-highlight__body">{children}</div>
    </aside>
  );
}

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  variant?: "secondary" | "danger" | "ghost";
};
export function IconButton({ size = "md", variant = "ghost", type = "button", className, children, ...rest }: IconButtonProps) {
  return (
    <button {...rest} type={type} className={classNames("st-iconButton", `st-iconButton--${size}`, `st-iconButton--${variant}`, className)}>
      {children}
    </button>
  );
}

export type InlineLoadingProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  status?: "active" | "inactive" | "success" | "error";
};
const INLINE_LOADING_FALLBACK_LABELS = {
  active: "Loading",
  success: "Completed",
  error: "Error",
  inactive: "Inactive",
} as const;
export function InlineLoading({ label, status = "active", className, "aria-label": ariaLabel, ...rest }: InlineLoadingProps) {
  // Canon Svelte : le libellé visible n'est rendu que s'il est fourni ; sinon
  // seul un aria-label de repli assure l'accessibilité (pas de texte visible).
  const accessibleLabel = ariaLabel ?? (label ? undefined : INLINE_LOADING_FALLBACK_LABELS[status]);
  return (
    <div
      {...rest}
      className={classNames("st-inlineLoading", `st-inlineLoading--${status}`, className)}
      role={status === "error" ? "alert" : "status"}
      aria-label={accessibleLabel}
      aria-live="polite"
    >
      <span className="st-inlineLoading__icon" aria-hidden="true">
        {status === "active" ? (
          <span className="st-inlineLoading__spinner">
            <LoaderCircle size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        ) : status === "success" ? (
          <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
        ) : status === "error" ? (
          <CircleAlert size={16} strokeWidth={2} aria-hidden="true" />
        ) : null}
      </span>
      {label ? <span className="st-inlineLoading__label">{label}</span> : null}
    </div>
  );
}

export type LanguageOption = { value: string; label: React.ReactNode };
export type LanguageSelectorProps = React.HTMLAttributes<HTMLDivElement> & {
  options: LanguageOption[];
  value?: string;
  onChange?: (value: string) => void;
  open?: boolean;
};
export function LanguageSelector({ options, value, onChange, open = false, className, ...rest }: LanguageSelectorProps) {
  const current = options.find((option) => option.value === value) ?? options[0];
  return (
    <div {...rest} className={classNames("st-languageSelector", className)}>
      <button type="button" className="st-languageSelector__trigger">
        <span className="st-languageSelector__current">{current?.label}</span>
      </button>
      {open ? (
        <ul className="st-languageSelector__menu">
          {options.map((option) => (
            <li key={option.value}>
              <button type="button" className={classNames("st-languageSelector__option", option.value === value && "st-languageSelector__option--active")} onClick={() => onChange?.(option.value)}>
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Style du lien ; API canonique (alignée sur le canon Svelte). */
  variant?: "inline" | "standalone" | "muted";
  /** @deprecated Raccourci pour variant="standalone". Utilisez `variant`. */
  standalone?: boolean;
  /** @deprecated Raccourci pour variant="muted". Utilisez `variant`. */
  muted?: boolean;
  disabled?: boolean;
  /** Lien externe : pose target="_blank" rel="noreferrer" (sauf target/rel explicites). */
  external?: boolean;
};
export function Link({
  variant = "inline",
  muted = false,
  standalone = false,
  disabled = false,
  external = false,
  href,
  target,
  rel,
  className,
  children,
  onClick,
  ...rest
}: LinkProps) {
  // `variant` est canonique ; les booléens standalone/muted sont des raccourcis
  // dépréciés. `variant` explicite l'emporte.
  const effectiveVariant =
    variant !== "inline" ? variant : standalone ? "standalone" : muted ? "muted" : "inline";
  const resolvedTarget = target ?? (external ? "_blank" : undefined);
  const resolvedRel = rel ?? (external ? "noreferrer" : undefined);
  return (
    <a
      {...rest}
      className={classNames(
        "st-link",
        `st-link--${effectiveVariant}`,
        disabled && "st-link--disabled",
        className,
      )}
      href={disabled ? undefined : href}
      target={resolvedTarget}
      rel={resolvedRel}
      aria-disabled={disabled || undefined}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

export type LoadingStateProps = React.HTMLAttributes<HTMLElement> & {
  label?: React.ReactNode;
  title?: React.ReactNode;
  variant?: "spinner" | "skeleton";
};
export function LoadingState({ label, title, variant = "spinner", className, ...rest }: LoadingStateProps) {
  return (
    <section {...rest} className={classNames("st-loading", `st-loading--${variant}`, className)} aria-live="polite">
      <span className="st-loading__spinner" aria-hidden="true" />
      <span className="st-loading__label">{label ?? title ?? "Loading"}</span>
    </section>
  );
}

export type MenuActionItem = ActionItem;
// `kind` (Svelte-canonical) is accepted as an alias of `type`. Svelte groups
// are flat (label-only, no nested `items`); React groups may nest `items`.
export type MenuDividerItem = { type?: "divider"; kind?: "divider"; id?: string };
export type MenuGroupItem = { type?: "group"; kind?: "group"; id?: string; label: React.ReactNode; items?: MenuActionItem[] };
export type MenuItem = MenuActionItem | MenuDividerItem | MenuGroupItem;
function itemKind(item: MenuItem): string | undefined {
  const tagged = item as { type?: string; kind?: string };
  return tagged.type ?? tagged.kind;
}
function isDivider(item: MenuItem): item is MenuDividerItem {
  return itemKind(item) === "divider";
}
function isGroup(item: MenuItem): item is MenuGroupItem {
  return itemKind(item) === "group";
}
export type MenuProps = React.HTMLAttributes<HTMLDivElement> & {
  items: MenuItem[];
  dense?: boolean;
  onSelect?: (item: MenuActionItem) => void;
};
export function Menu({ items, dense = false, onSelect, className, role, ...rest }: MenuProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleItemKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, item: MenuActionItem) => {
    const focusable = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);
    const currentIndex = focusable.indexOf(event.currentTarget);
    const focusAt = (index: number) => focusable[index]?.focus();

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusAt(moveIndex(currentIndex, focusable.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusAt(moveIndex(currentIndex < 0 ? focusable.length : currentIndex, focusable.length, -1));
    } else if (event.key === "Home") {
      event.preventDefault();
      focusAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusAt(focusable.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!item.disabled) onSelect?.(item);
    }
  };

  return (
    <div {...rest} ref={rootRef} className={classNames("st-menu", dense && "st-menu--dense", className)} role={role ?? "menu"}>
      {items.map((item, index) => {
        if (isDivider(item)) return <div key={item.id ?? index} className="st-menu__divider" role="separator" />;
        if (isGroup(item)) {
          // Canon-aligned (Svelte): a group is a flat `div role="presentation"`
          // label; nested `items` (React-native shape) render as flat siblings.
          return (
            <React.Fragment key={item.id ?? index}>
              <div className="st-menu__group" role="presentation">{item.label}</div>
              {(item.items ?? []).map((child) => (
                <button key={actionId(child) ?? text(child.label)} type="button" role="menuitem" className={classNames("st-menu__item", isDangerAction(child) && "st-menu__item--danger")} disabled={child.disabled} onClick={() => onSelect?.(child)} onKeyDown={(event) => handleItemKeyDown(event, child)}>
                  {child.icon ? <span className="st-menu__itemIcon" aria-hidden="true">{child.icon}</span> : null}
                  <span className="st-menu__itemLabel">{child.label}</span>
                </button>
              ))}
            </React.Fragment>
          );
        }
        const action = item as MenuActionItem;
        return (
          <button key={actionId(action) ?? text(action.label) ?? index} type="button" role="menuitem" disabled={action.disabled} className={classNames("st-menu__item", isDangerAction(action) && "st-menu__item--danger")} onClick={() => onSelect?.(action)} onKeyDown={(event) => handleItemKeyDown(event, action)}>
            {action.icon ? <span className="st-menu__itemIcon" aria-hidden="true">{action.icon}</span> : null}
            <span className="st-menu__itemLabel">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export type MenuPopoverProps = React.HTMLAttributes<HTMLDivElement> & {
  trigger?: React.ReactNode;
  items?: MenuItem[];
  open?: boolean;
  placement?: "top-start" | "top-end" | "bottom-start" | "bottom-end";
};
export function MenuPopover({ trigger, items = [], open = true, placement = "bottom-start", children, className, ...rest }: MenuPopoverProps) {
  return (
    <div {...rest} className={classNames("st-menuPopover", `st-menuPopover--${placement}`, className)}>
      {trigger}
      {open ? <div className="st-menuPopover__content">{items.length ? <Menu items={items} role="presentation" /> : children}</div> : null}
    </div>
  );
}

// `expanded` (Svelte-canonical) is accepted as an alias of `open`.
export type MenuTriggerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  open?: boolean;
  expanded?: boolean;
  size?: Size;
  variant?: "ghost" | "secondary";
};
export function MenuTriggerButton({ open, expanded, size = "md", variant = "ghost", type = "button", className, children, ...rest }: MenuTriggerButtonProps) {
  const isOpen = open ?? expanded ?? false;
  return (
    <button
      {...rest}
      type={type}
      className={classNames("st-iconButton", `st-iconButton--${size}`, `st-iconButton--${variant}`, className)}
      aria-haspopup="menu"
      aria-expanded={isOpen}
    >
      {children ?? <ChevronDownCircle size={18} strokeWidth={2} aria-hidden="true" />}
    </button>
  );
}

export type MessageActionVariant = "default" | "danger";
/**
 * `label` (React/Vue) is rendered when present; otherwise `icon` (the
 * Svelte-canonical content) is rendered. `label` is always used for the
 * accessible name when provided. At least one of `label`/`icon` should be set.
 */
export type MessageAction = Omit<ActionItem, "label"> & {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: MessageActionVariant;
};
export type MessageActionsProps = React.HTMLAttributes<HTMLElement> & {
  actions: MessageAction[];
  visibility?: "always" | "hover";
};
export function MessageActions({ actions, visibility = "hover", className, ...rest }: MessageActionsProps) {
  return (
    <div {...rest} className={classNames("st-messageActions", visibility === "hover" && "st-messageActions--hoverOnly", className)} role="group" aria-label="Actions du message">
      {actions.map((action, index) => (
        <button
          key={action.id ?? index}
          type="button"
          className={classNames("st-iconButton", "st-iconButton--sm", action.variant === "danger" ? "st-iconButton--danger" : "st-iconButton--ghost")}
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

export type MessageStatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  status: ChatMessageStatus;
  tone?: Tone;
  labels?: Partial<Record<ChatMessageStatus, React.ReactNode>>;
};
export function MessageStatusBadge({ status, tone, labels, className, ...rest }: MessageStatusBadgeProps) {
  const normalized = status === "sent" ? "completed" : status === "streaming" ? "processing" : status === "error" ? "failed" : status;
  const resolvedTone = tone ?? (normalized === "completed" ? "success" : normalized === "failed" ? "error" : normalized === "processing" ? "info" : "neutral");
  const label = labels?.[status] ?? labels?.[normalized] ?? normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return (
    <span {...rest} className={classNames("st-messageStatusBadge", `st-badge st-badge--${resolvedTone}`, className)}>
      <span className="st-messageStatusBadge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

export type ModalProps = React.HTMLAttributes<HTMLElement> & {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
};
export function Modal({ open = false, title, description, footer, onClose, children, className, ...rest }: ModalProps) {
  const dialogRef = React.useRef<HTMLElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  useBodyScrollLock(open);
  useEscape(open, onClose);
  React.useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => trapTabKey(event, dialogRef.current);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);
  if (!open) return null;
  return (
    <div className="st-modal__backdrop">
      <section
        {...rest}
        ref={dialogRef}
        className={classNames("st-modal", className)}
        role="dialog"
        aria-modal="true"
        aria-label={text(title) || "Modal"}
        tabIndex={-1}
      >
        <div className="st-modal__header">
          {title ? <h2 className="st-modal__title">{title}</h2> : null}
          <button ref={closeRef} type="button" className="st-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </div>
        {description ? <p className="st-modal__description">{description}</p> : null}
        <div className="st-modal__body">{children}</div>
        {footer ? <div className="st-modal__footer">{footer}</div> : null}
      </section>
    </div>
  );
}

export interface MultiSelectOption extends OptionItem {}
export type MultiSelectProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  options: MultiSelectOption[];
  value?: string[];
  values?: string[];
  /** Svelte-canonical alias for the selected values. */
  selected?: string[];
  size?: Size;
  open?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  toggleLabel?: string;
  removeLabel?: string;
  listLabel?: string;
  disabled?: boolean;
  onChange?: (values: string[]) => void;
};
export function MultiSelect({
  label,
  helperText,
  errorText,
  invalid = false,
  options,
  value,
  values,
  selected: selectedAlias,
  size = "md",
  open: controlledOpen,
  placeholder = "Select items",
  searchPlaceholder = "Filter",
  noResultsLabel = "No results",
  toggleLabel = "Toggle options",
  removeLabel = "Remove",
  listLabel,
  disabled = false,
  onChange,
  className,
  ...rest
}: MultiSelectProps) {
  const [open, setOpen] = useControlled(controlledOpen, false);
  const initialSelected = value ?? values ?? selectedAlias;
  const [selectedValues, setSelectedValues] = useControlled(initialSelected, initialSelected ?? [], onChange);
  const [query, setQuery] = React.useState("");
  const selected = new Set(selectedValues);
  const selectedOptions = selectedValues
    .map((entry) => options.find((option) => option.value === entry))
    .filter((option): option is MultiSelectOption => Boolean(option));
  const isInvalid = invalid || Boolean(errorText);
  const filtered = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => text(option.label).toLowerCase().includes(q));
  })();
  const toggleOption = (option: MultiSelectOption) => {
    if (option.disabled) return;
    const next = selected.has(option.value)
      ? selectedValues.filter((entry) => entry !== option.value)
      : [...selectedValues, option.value];
    setSelectedValues(next);
  };
  const removeOption = (optionValue: string) => {
    setSelectedValues(selectedValues.filter((entry) => entry !== optionValue));
  };

  return (
    <div
      {...rest}
      className={classNames("st-field", className)}
      role="group"
      aria-label={text(label) || undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
        }
      }}
    >
      {label ? <span className="st-field__label">{label}</span> : null}
      {selectedOptions.length > 0 ? (
        <span className="st-multiSelect__tags">
          {selectedOptions.map((option) => (
            <span key={option.value} className="st-multiSelect__tag">
              <span className="st-multiSelect__tagLabel">{option.label}</span>
              <button
                type="button"
                className="st-multiSelect__tagRemove"
                aria-label={`${removeLabel} ${text(option.label)}`}
                disabled={disabled}
                onClick={() => removeOption(option.value)}
              >
                <X size={14} strokeWidth={2.25} aria-hidden="true" />
              </button>
            </span>
          ))}
        </span>
      ) : null}
      <span className={classNames("st-multiSelect", `st-multiSelect--${size}`)} data-invalid={isInvalid ? "true" : undefined}>
        <button
          type="button"
          className="st-multiSelect__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          {selectedOptions.length === 0 ? (
            <span className="st-multiSelect__placeholder">{placeholder}</span>
          ) : (
            <span className="st-multiSelect__count">{selectedOptions.length} selected</span>
          )}
          <span className="st-multiSelect__caret" aria-hidden="true">
            <ChevronDown className={classNames("st-multiSelect__caretIcon", open && "st-multiSelect__caretIcon--open")} size={18} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <span className="st-visually-hidden">{toggleLabel}</span>
        </button>
      </span>
      {open ? (
        <div className="st-multiSelect__panel">
          <input
            type="search"
            className="st-multiSelect__search"
            placeholder={searchPlaceholder}
            value={query}
            aria-label={searchPlaceholder}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <div className="st-multiSelect__list" role="listbox" aria-label={text(listLabel) || text(label) || "Options"} aria-multiselectable="true">
            {filtered.length === 0 ? (
              <div className="st-multiSelect__empty">{noResultsLabel}</div>
            ) : (
              filtered.map((option) => {
                const isSelected = selected.has(option.value);
                return (
                  <button
                    key={option.value}
                    className="st-multiSelect__option"
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled ? "true" : undefined}
                    disabled={option.disabled}
                    onClick={() => toggleOption(option)}
                  >
                    <span className="st-multiSelect__check" aria-hidden="true">{isSelected ? "✓" : null}</span>
                    <span>{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

export type NumberInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  size?: Size;
  incrementLabel?: string;
  decrementLabel?: string;
};
export function NumberInput({
  label,
  helperText,
  errorText,
  size = "md",
  className,
  incrementLabel = "Increment value",
  decrementLabel = "Decrement value",
  min,
  max,
  step = 1,
  value,
  defaultValue,
  disabled,
  onChange,
  ...rest
}: NumberInputProps) {
  const numMin = min !== undefined && min !== "" ? Number(min) : undefined;
  const numMax = max !== undefined && max !== "" ? Number(max) : undefined;
  const numStep = step !== undefined && step !== "" ? Number(step) : 1;
  const initial = value ?? defaultValue;
  const [current, setCurrent] = React.useState<number | null>(
    initial !== undefined && initial !== null && initial !== "" ? Number(initial) : null,
  );
  const controlled = value !== undefined;
  const numValue = controlled
    ? value === null || value === "" ? null : Number(value)
    : current;

  const clamp = (n: number) => {
    if (numMin !== undefined && n < numMin) return numMin;
    if (numMax !== undefined && n > numMax) return numMax;
    return n;
  };
  const isAtMin = numValue !== null && numMin !== undefined && numValue <= numMin;
  const isAtMax = numValue !== null && numMax !== undefined && numValue >= numMax;

  const setValue = (next: number | null) => {
    if (!controlled) setCurrent(next);
  };
  const increment = () => setValue(clamp((numValue ?? numMin ?? 0) + numStep));
  const decrement = () => setValue(clamp((numValue ?? numMax ?? 0) - numStep));

  return (
    <Field label={label} helperText={helperText} errorText={errorText} className={className}>
      {(inputId, isInvalid) => (
        <span className={classNames("st-numberInput", `st-numberInput--${size}`)}>
          <input
            {...rest}
            id={inputId}
            className="st-numberInput__control"
            type="number"
            value={numValue ?? ""}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            aria-invalid={isInvalid ? "true" : undefined}
            onChange={(event) => {
              const raw = event.target.value;
              setValue(raw === "" ? null : Number.isFinite(Number(raw)) ? Number(raw) : numValue);
              onChange?.(event);
            }}
          />
          <span className="st-numberInput__buttons">
            <button type="button" className="st-numberInput__button" aria-label={decrementLabel} disabled={disabled || isAtMin} onClick={decrement}>
              <span aria-hidden="true">−</span>
            </button>
            <button type="button" className="st-numberInput__button" aria-label={incrementLabel} disabled={disabled || isAtMax} onClick={increment}>
              <span aria-hidden="true">+</span>
            </button>
          </span>
        </span>
      )}
    </Field>
  );
}

// Forme item alignée sur le canon Svelte : `content` (+ `label` accepté en alias
// de compat). Le test reconnaît l'une OU l'autre clé pour ne pas rendre vide.
export type OrderedListItem = { content?: React.ReactNode; label?: React.ReactNode; children?: OrderedListInput[] };
export type OrderedListInput = React.ReactNode | OrderedListItem;
export type OrderedListProps = React.OlHTMLAttributes<HTMLOListElement> & { items: OrderedListInput[] };
function renderListItem(item: OrderedListInput, index: number, ordered: boolean): React.ReactNode {
  if (
    typeof item === "object" &&
    item !== null &&
    ("content" in (item as OrderedListItem) || "label" in (item as OrderedListItem))
  ) {
    const cast = item as OrderedListItem;
    const hasChildren = Array.isArray(cast.children) && cast.children.length > 0;
    return (
      <li key={index} className={ordered ? "st-orderedList__item" : "st-unorderedList__item"}>
        {cast.content ?? cast.label}
        {hasChildren
          ? ordered
            ? (
              <ol className="st-orderedList st-orderedList--nested">
                {cast.children!.map((child, childIndex) => renderListItem(child, childIndex, true))}
              </ol>
            )
            : (
              <ul className="st-unorderedList st-unorderedList--nested">
                {cast.children!.map((child, childIndex) => renderListItem(child, childIndex, false))}
              </ul>
            )
          : null}
      </li>
    );
  }
  return (
    <li key={index} className={ordered ? "st-orderedList__item" : "st-unorderedList__item"}>
      {item as React.ReactNode}
    </li>
  );
}
export function OrderedList({ items, className, ...rest }: OrderedListProps) {
  return (
    <ol {...rest} className={classNames("st-orderedList", className)}>
      {items.map((item, index) => renderListItem(item, index, true))}
    </ol>
  );
}

export type OverflowMenuItem = MenuItem;
export type OverflowMenuProps = React.HTMLAttributes<HTMLDivElement> & {
  items: OverflowMenuItem[];
  label?: React.ReactNode;
  open?: boolean;
  dense?: boolean;
  placement?: "top-start" | "top-end" | "bottom-start" | "bottom-end";
};
export function OverflowMenu({ items, label = "More", open: controlledOpen, dense = false, placement = "bottom-start", className, ...rest }: OverflowMenuProps) {
  const [open, setOpen] = useControlled(controlledOpen, false);
  return (
    <div {...rest} className={classNames("st-overflowMenu", dense && "st-overflowMenu--dense", className)}>
      <button type="button" className="st-overflowMenu__trigger" aria-haspopup="menu" aria-expanded={open} aria-label={text(label)} onClick={() => setOpen(!open)}>
        <Ellipsis size={18} strokeWidth={2.25} aria-hidden="true" />
      </button>
      {open ? <div className={classNames("st-overflowMenu__list", `st-overflowMenu__list--${placement}`)}><Menu items={items as MenuItem[]} /></div> : null}
    </div>
  );
}

export type PaginationProps = React.HTMLAttributes<HTMLElement> & {
  page: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
};
export function Pagination({ page, pageSize = 10, totalItems, totalPages, pageCount, onPageChange, className, ...rest }: PaginationProps) {
  const pages = pageCount ?? totalPages ?? (totalItems ? Math.max(1, Math.ceil(totalItems / pageSize)) : page);
  const start = totalItems ? (page - 1) * pageSize + 1 : page;
  const end = totalItems ? Math.min(page * pageSize, totalItems) : page;
  const visiblePages = Array.from({ length: pages }, (_, index) => index + 1);
  return (
    <nav {...rest} className={classNames("st-pagination", className)} aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>Previous</button>
      <span className="st-pagination__page--active">{totalItems ? `${start}-${end} of ${totalItems}` : `Page ${page} of ${pages}`}</span>
      <span className="st-pagination__pages">
        {visiblePages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={classNames("st-pagination__page", pageNumber === page && "st-pagination__page--active")}
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === page ? "page" : undefined}
            onClick={() => onPageChange?.(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onPageChange?.(page + 1)}>Next</button>
    </nav>
  );
}

// `pageCount` (Svelte-canonical) is accepted as an alias of `totalPages`.
export type PaginationNavProps = React.HTMLAttributes<HTMLElement> & {
  page?: number;
  /** Total page count (Svelte-canonical). `totalPages` is accepted as alias. */
  pageCount?: number;
  totalPages?: number;
  siblings?: number;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  previousHref?: string;
  nextHref?: string;
  onPageChange?: (page: number) => void;
};
// Mirrors the Svelte reference: first/last anchors, sibling window around the
// current page, and two collapse points (ellipses) once the total exceeds
// `siblings * 2 + 5`.
type PaginationSlot = number | "ellipsis-start" | "ellipsis-end";
function paginationSlots(page: number, pageCount: number, siblings: number): PaginationSlot[] {
  const total = Math.max(0, Math.floor(pageCount));
  if (total <= 0) return [];
  const current = Math.min(Math.max(1, Math.floor(page)), total);
  const sib = Math.max(0, Math.floor(siblings));
  const minSlots = sib * 2 + 5;
  if (total <= minSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(current - sib, 1);
  const rightSibling = Math.min(current + sib, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;
  const result: PaginationSlot[] = [];
  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + sib * 2;
    for (let i = 1; i <= leftItemCount; i += 1) result.push(i);
    result.push("ellipsis-end");
    result.push(total);
  } else if (showLeftEllipsis && !showRightEllipsis) {
    result.push(1);
    result.push("ellipsis-start");
    const rightItemCount = 3 + sib * 2;
    for (let i = total - rightItemCount + 1; i <= total; i += 1) result.push(i);
  } else if (showLeftEllipsis && showRightEllipsis) {
    result.push(1);
    result.push("ellipsis-start");
    for (let i = leftSibling; i <= rightSibling; i += 1) result.push(i);
    result.push("ellipsis-end");
    result.push(total);
  } else {
    for (let i = 1; i <= total; i += 1) result.push(i);
  }
  return result;
}
export function PaginationNav({
  page = 1,
  pageCount,
  totalPages,
  siblings = 1,
  label = "Pagination",
  previousLabel = "Previous page",
  nextLabel = "Next page",
  previousHref,
  nextHref,
  onPageChange,
  className,
  ...rest
}: PaginationNavProps) {
  const pages = pageCount ?? totalPages ?? 1;
  const slots = paginationSlots(page, pages, siblings);
  const go = (target: number) => {
    if (target < 1 || target > pages || target === page) return;
    onPageChange?.(target);
  };
  return (
    <nav {...rest} className={classNames("st-paginationNav", className)} aria-label={label}>
      <ul className="st-paginationNav__list">
        <li>
          {previousHref ? (
            <a href={previousHref} className="st-paginationNav__nav" aria-label={previousLabel}>
              <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          ) : (
            <button type="button" className="st-paginationNav__nav" aria-label={previousLabel} disabled={page <= 1 || pages <= 0} onClick={() => go(page - 1)}>
              <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </li>
        {slots.map((slot, index) => (
          <li key={typeof slot === "number" ? `p-${slot}` : `${slot}-${index}`}>
            {slot === "ellipsis-start" || slot === "ellipsis-end" ? (
              <span className="st-paginationNav__ellipsis" aria-hidden="true">
                <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
              </span>
            ) : (
              <button
                type="button"
                className={classNames("st-paginationNav__page", slot === page && "st-paginationNav__page--active")}
                aria-label={`Page ${slot}`}
                aria-current={slot === page ? "page" : undefined}
                onClick={() => go(slot)}
              >
                {slot}
              </button>
            )}
          </li>
        ))}
        <li>
          {nextHref ? (
            <a href={nextHref} className="st-paginationNav__nav" aria-label={nextLabel}>
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          ) : (
            <button type="button" className="st-paginationNav__nav" aria-label={nextLabel} disabled={page >= pages || pages <= 0} onClick={() => go(page + 1)}>
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}

export type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  size?: Size;
};
export function PasswordInput({ label, helperText, errorText, size = "md", className, ...rest }: PasswordInputProps) {
  const [shown, setShown] = React.useState(false);
  return (
    <Field label={label} helperText={helperText} errorText={errorText} className={className}>
      {(inputId, isInvalid) => (
        <span className={classNames("st-passwordInput", `st-passwordInput--${size}`)}>
          <input {...rest} id={inputId} className="st-passwordInput__control" type={shown ? "text" : "password"} aria-invalid={isInvalid ? "true" : undefined} />
          <button type="button" className="st-passwordInput__toggle" aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown ? "true" : "false"} onClick={() => setShown((next) => !next)}>
            {shown ? <EyeOff size={16} strokeWidth={2} aria-hidden="true" /> : <Eye size={16} strokeWidth={2} aria-hidden="true" />}
          </button>
        </span>
      )}
    </Field>
  );
}

export type PopoverProps = Omit<React.HTMLAttributes<HTMLElement>, "content"> & {
  trigger?: React.ReactNode;
  content?: React.ReactNode;
  open?: boolean;
  placement?: "top" | "right" | "bottom" | "left";
};
export function Popover({ trigger, content, open: controlledOpen, placement = "bottom", children, className, ...rest }: PopoverProps) {
  const hostRef = React.useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useControlled(controlledOpen, false);
  const triggerNode = trigger ?? children;
  const contentNode = content ?? (trigger ? children : null);
  const label = text(React.isValidElement(triggerNode) ? (triggerNode.props as { children?: React.ReactNode }).children : triggerNode) || "Popover";
  useOutsideMouseDown(open, hostRef, () => setOpen(false));
  useEscape(open, () => setOpen(false));

  return (
    <span {...rest} ref={hostRef} className={classNames("st-popover-host", className)} onClick={() => setOpen(true)}>
      {triggerNode}
      {open ? (
        <span className={classNames("st-popover", `st-popover--${placement}`)} role="dialog" aria-label={label}>
          {contentNode}
        </span>
      ) : null}
    </span>
  );
}

export type ProgressBarProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  value?: number;
  max?: number;
  tone?: Tone;
  size?: Size;
  indeterminate?: boolean;
  showValue?: boolean;
  valueText?: string;
};
export function ProgressBar({ label, helperText, value = 0, max = 100, tone = "neutral", size = "md", indeterminate = false, showValue = false, valueText, className, ...rest }: ProgressBarProps) {
  const clamped = max <= 0 ? 0 : Math.min(Math.max(value, 0), max);
  const percent = indeterminate ? 0 : (clamped / max) * 100;
  const displayValue = valueText ? valueText : indeterminate ? "" : `${Math.round(percent)}%`;
  const showValueSpan = showValue && !indeterminate;
  return (
    <div {...rest} className={classNames("st-progressBar", className)}>
      {label || showValueSpan ? (
        <div className="st-progressBar__header">
          {label ? <span className="st-progressBar__label">{label}</span> : null}
          {showValueSpan ? (
            <span className="st-progressBar__value" aria-hidden="true">{displayValue}</span>
          ) : null}
        </div>
      ) : null}
      <div
        className={classNames("st-progressBar__track", `st-progressBar__track--${size}`, `st-progressBar__track--${tone}`, indeterminate && "st-progressBar__track--indeterminate")}
        role="progressbar"
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={indeterminate ? undefined : displayValue}
        aria-label={typeof label === "string" ? label : undefined}
      >
        <div className="st-progressBar__fill" style={{ ["--st-progressBar-pct" as string]: `${percent}%` }} />
      </div>
      {helperText ? <span className="st-progressBar__help">{helperText}</span> : null}
    </div>
  );
}

export type ProgressIndicatorStatus =
  | "complete"
  | "current"
  | "upcoming"
  | "disabled"
  | "invalid"
  | "incomplete";
export interface ProgressIndicatorItem {
  id?: string;
  /** Svelte-canonical alias for the React/Vue `id`. */
  value?: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  status?: ProgressIndicatorStatus;
}
export type ProgressIndicatorProps = React.OlHTMLAttributes<HTMLOListElement> & {
  items: ProgressIndicatorItem[];
  orientation?: "horizontal" | "vertical";
  /** Svelte-canonical alias: `vertical` sets `orientation="vertical"`. */
  vertical?: boolean;
  /** Accessible name (parity with the Svelte `label`). */
  label?: string;
};
export function ProgressIndicator({ items, orientation = "horizontal", vertical, label = "Progress", className, ...rest }: ProgressIndicatorProps) {
  const resolvedOrientation = vertical ? "vertical" : orientation;
  return (
    <ol {...rest} aria-label={label} className={classNames("st-progressIndicator", `st-progressIndicator--${resolvedOrientation}`, className)}>
      {items.map((item, index) => {
        const status = item.status ?? "upcoming";
        const isLast = index === items.length - 1;
        return (
          <li
            key={item.id ?? item.value ?? index}
            className={classNames("st-progressIndicator__step", `st-progressIndicator__step--${status}`)}
            aria-current={status === "current" ? "step" : undefined}
          >
            <span className="st-progressIndicator__indicator">
              <span className="st-progressIndicator__circle">
                {status === "complete" ? (
                  <Check size={14} strokeWidth={2} aria-hidden="true" />
                ) : status === "invalid" ? (
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                ) : status === "current" ? (
                  <span className="st-progressIndicator__dot" />
                ) : (
                  <span className="st-progressIndicator__index">{index + 1}</span>
                )}
              </span>
              {!isLast ? <span className="st-progressIndicator__connector" /> : null}
            </span>
            <span className="st-progressIndicator__text">
              <span className="st-progressIndicator__label">{item.label}</span>
              {item.description ? <span className="st-progressIndicator__description">{item.description}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export type QuoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement> & {
  author?: React.ReactNode;
  source?: React.ReactNode;
};
export function Quote({ author, source, children, className, ...rest }: QuoteProps) {
  return (
    <blockquote {...rest} className={classNames("st-quote", className)}>
      <p className="st-quote__text">{children}</p>
      {author || source ? (
        <footer className="st-quote__attribution">
          {author ? <span className="st-quote__author">{author}</span> : null}
          {source ? <span className="st-quote__source">{source}</span> : null}
        </footer>
      ) : null}
    </blockquote>
  );
}

export type SearchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: React.ReactNode;
  size?: Size;
  clearLabel?: string;
  onClear?: () => void;
  /** Lift the field max-width cap so it fills a narrow drawer/rail (width 100%). */
  fluid?: boolean;
};
export function Search({ label, size = "md", clearLabel = "Clear search", onClear, fluid = false, className, ...rest }: SearchProps) {
  const reactId = React.useId();
  const inputId = rest.id ?? `st-search-${reactId}`;
  return (
    <div className={classNames("st-search", `st-search--${size}`, fluid ? "st-search--fluid" : null, className)}>
      {label ? <label className="st-field__label" htmlFor={inputId}>{label}</label> : null}
      <span className="st-search__icon" aria-hidden="true"><SearchIcon size={16} strokeWidth={2} aria-hidden="true" /></span>
      <input {...rest} id={inputId} className="st-search__control st-search__input" type="search" />
      {onClear ? <button type="button" className="st-search__clear" aria-label={clearLabel} onClick={onClear}><X size={16} strokeWidth={2} aria-hidden="true" /></button> : null}
    </div>
  );
}

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  size?: Size;
  options?: OptionItem[];
};
export function Select({ label, helperText, errorText, invalid, size = "md", options, className, children, ...rest }: SelectProps) {
  return (
    <Field label={label} helperText={helperText} errorText={errorText} invalid={invalid} className={className}>
      {(inputId, isInvalid) => (
        <select {...rest} id={inputId} className={classNames("st-select", `st-select--${size}`)} aria-invalid={isInvalid ? "true" : undefined}>
          {children ?? renderOptions(options)}
        </select>
      )}
    </Field>
  );
}

export interface SideNavItem {
  label: React.ReactNode;
  href: string;
  active?: boolean;
  children?: SideNavItem[];
}
export type SideNavProps = React.HTMLAttributes<HTMLElement> & { items: SideNavItem[]; label?: string };
export function SideNav({ items, label = "Navigation", className, ...rest }: SideNavProps) {
  return (
    <nav {...rest} className={classNames("st-sidenav st-sideNav", className)} aria-label={label}>
      {items.map((item) => (
        <a key={item.href} href={item.href} className={classNames("st-sidenav__link st-sideNav__link", item.active && "st-sidenav__link--active st-sideNav__link--active")}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export type SkeletonTextProps = React.HTMLAttributes<HTMLDivElement> & {
  lines?: number;
  width?: string;
  heading?: boolean;
  paragraph?: boolean;
};
export function SkeletonText({ lines = 1, width, heading = false, paragraph = false, className, ...rest }: SkeletonTextProps) {
  const lineCount = paragraph ? Math.max(lines, 3) : lines;
  const lineWidth = (index: number): string | undefined => {
    if (width && index === 0) return width;
    if (paragraph && index === lineCount - 1) return "60%";
    return undefined;
  };
  return (
    <div {...rest} className={classNames("st-skeleton", className)} role="status" aria-label="Loading…" aria-busy="true">
      {Array.from({ length: lineCount }, (_, index) => {
        const w = lineWidth(index);
        return (
          <span
            key={index}
            className={classNames("st-skeleton__line", heading && "st-skeleton__line--heading")}
            style={w ? { width: w } : undefined}
          />
        );
      })}
    </div>
  );
}

export type SkipLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string };
export function SkipLink({ href = "#main", className, children = "Skip to content", ...rest }: SkipLinkProps) {
  return (
    <a {...rest} href={href} className={classNames("st-skipLink", className)}>
      {children}
    </a>
  );
}

export type SliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange"> & {
  label?: React.ReactNode;
  size?: Size;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  onChange?: (value: number) => void;
};
export function Slider({
  label,
  size = "md",
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  helperText,
  errorText,
  invalid = false,
  showValue = true,
  valueFormatter,
  disabled,
  className,
  onChange,
  ...rest
}: SliderProps) {
  const numMin = Number(min);
  const numMax = Number(max);
  const initial = Number(value ?? defaultValue ?? numMin);
  const [current, setCurrent] = React.useState(Number.isFinite(initial) ? initial : numMin);
  const controlled = value !== undefined;
  const raw = controlled ? Number(value) : current;
  const safe = !Number.isFinite(raw) ? numMin : raw < numMin ? numMin : raw > numMax ? numMax : raw;
  const percent = numMax === numMin ? 0 : ((safe - numMin) / (numMax - numMin)) * 100;
  const formatted = valueFormatter ? valueFormatter(safe) : String(safe);
  const isInvalid = invalid || Boolean(errorText);
  const labelText = typeof label === "string" ? label : undefined;

  return (
    <div className={classNames("st-field", className)}>
      <div className="st-slider__header">
        {label ? <span className="st-field__label">{label}</span> : null}
        {showValue ? <output className="st-slider__value" aria-live="polite">{formatted}</output> : null}
      </div>
      <span className={classNames("st-slider", `st-slider--${size}`)}>
        <span className="st-slider__bounds" aria-hidden="true">{numMin}</span>
        <span className="st-slider__track">
          <span className="st-slider__fill" style={{ ["--st-slider-fill" as string]: `${percent}%` }} />
          <span className="st-slider__thumb" style={{ left: `${percent}%` }} aria-hidden="true">
            {showValue ? <span className="st-slider__tooltip">{formatted}</span> : null}
          </span>
          <input
            {...rest}
            className="st-slider__input"
            type="range"
            aria-label={labelText}
            aria-invalid={isInvalid ? "true" : undefined}
            value={safe}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) {
                if (!controlled) setCurrent(next);
                onChange?.(next);
              }
            }}
          />
        </span>
      </span>
      {errorText ? (
        <span className="st-field__error">{errorText}</span>
      ) : helperText ? (
        <span className="st-field__help">{helperText}</span>
      ) : null}
    </div>
  );
}

export type StreamingMessageEvent = { id: string; label: React.ReactNode; text?: React.ReactNode; status?: ChatMessageStatus };
export type StreamingMessageMode = "live" | "passive";
export type StreamingMessageProps = React.HTMLAttributes<HTMLElement> & {
  text?: React.ReactNode;
  events?: StreamingMessageEvent[];
  mode?: StreamingMessageMode;
};
export function StreamingMessage({ text: messageText, events = [], mode = "live", className, ...rest }: StreamingMessageProps) {
  return (
    <section {...rest} className={classNames("st-streamingMessage", `st-streamingMessage--${mode}`, className)}>
      <div className="st-streamingMessage__text">{messageText}</div>
      <ul className="st-streamingMessage__trailList">
        {events.map((event) => <li key={event.id}>{event.label}</li>)}
      </ul>
    </section>
  );
}

export interface StructuredListItem {
  term?: React.ReactNode;
  label?: React.ReactNode;
  description?: React.ReactNode;
  value?: React.ReactNode;
}
export type StructuredListProps = React.HTMLAttributes<HTMLDListElement> & { items: StructuredListItem[]; bordered?: boolean };
export function StructuredList({ items, bordered = false, className, ...rest }: StructuredListProps) {
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

export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: React.ReactNode;
  helperText?: React.ReactNode;
};
export function Switch({ label, helperText, className, ...rest }: SwitchProps) {
  return (
    <label className={classNames("st-switch", className)}>
      <input {...rest} className="st-switch__input" type="checkbox" role="switch" aria-checked={rest.checked ?? rest.defaultChecked ?? undefined} />
      <span className="st-switch__track"><span className="st-switch__thumb" /></span>
      <span className="st-switch__content">
        <span className="st-switch__label">{label}</span>
        {helperText ? <span className="st-switch__help">{helperText}</span> : null}
      </span>
    </label>
  );
}

export interface TableColumn {
  key: string;
  label: React.ReactNode;
  align?: "left" | "center" | "right" | "start" | "end";
}
export type TableRow = Record<string, unknown>;
export type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  columns: TableColumn[];
  rows: TableRow[];
  caption?: React.ReactNode;
};
export function Table({ columns, rows, caption = "Table", className, ...rest }: TableProps) {
  return (
    <div className="st-table-wrap">
      <table {...rest} className={classNames("st-table", className)}>
        <caption>{caption}</caption>
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={text(row.id) || index}>
              {columns.map((column) => <td key={column.key} className={classNames(column.align === "center" && "st-table__cell--center", (column.align === "right" || column.align === "end") && "st-table__cell--right")}>{text(row[column.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface TabItem {
  id?: string;
  value?: string;
  label: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}
// `onchange` (Svelte-canonical, lowercase) is accepted as an alias of `onChange`.
export type TabsProps = React.HTMLAttributes<HTMLElement> & {
  items: TabItem[];
  activeValue?: string;
  activeId?: string;
  label?: string;
  onChange?: (value: string) => void;
  onchange?: (value: string) => void;
};
export function Tabs({ items, activeValue, activeId, label = "Tabs", onChange, onchange, className, ...rest }: TabsProps) {
  const handleChange = onChange ?? onchange;
  const reactId = React.useId();
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const first = items.find((item) => !item.disabled) ?? items[0];
  const [current, setCurrent] = useControlled(activeValue ?? activeId, idFrom(first ?? {}, 0, "tab"), handleChange);
  const itemIds = items.map((item, index) => idFrom(item, index, "tab"));
  const activeIndex = Math.max(0, itemIds.indexOf(current));
  const active = items[activeIndex] ?? first;
  const activateIndex = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    setCurrent(itemIds[index]);
    tabRefs.current[index]?.focus();
  };
  const moveTab = (index: number, delta: number) => {
    const enabled = items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => !item.disabled);
    const enabledIndex = enabled.findIndex(({ itemIndex }) => itemIndex === index);
    const next = enabled[moveIndex(enabledIndex, enabled.length, delta)];
    if (next) activateIndex(next.itemIndex);
  };

  return (
    <section {...rest} className={classNames("st-tabs", className)}>
      <div className="st-tabs__list" role="tablist" aria-label={label}>
        {items.map((item, index) => {
          const itemId = idFrom(item, index, "tab");
          const tabId = `st-tabs-${reactId}-tab-${itemId}`;
          const panelId = `st-tabs-${reactId}-panel-${itemId}`;
          return (
            <button
              key={itemId}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={tabId}
              type="button"
              role="tab"
              className={classNames("st-tabs__tab", itemId === current && "st-tabs__tab--active")}
              aria-selected={itemId === current}
              aria-controls={panelId}
              tabIndex={itemId === current ? 0 : -1}
              disabled={item.disabled}
              onClick={() => activateIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveTab(index, 1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveTab(index, -1);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  const firstEnabled = items.findIndex((candidate) => !candidate.disabled);
                  activateIndex(firstEnabled >= 0 ? firstEnabled : 0);
                } else if (event.key === "End") {
                  event.preventDefault();
                  const lastEnabled = items.map((candidate, candidateIndex) => ({ candidate, candidateIndex })).filter(({ candidate }) => !candidate.disabled).at(-1)?.candidateIndex ?? items.length - 1;
                  activateIndex(lastEnabled);
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        id={`st-tabs-${reactId}-panel-${itemIds[activeIndex]}`}
        className="st-tabs__panel"
        role="tabpanel"
        aria-labelledby={`st-tabs-${reactId}-tab-${itemIds[activeIndex]}`}
      >
        {active?.content}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FilterPill, FilterBar, SelectionChip
// ---------------------------------------------------------------------------

export type FilterPillTone = "neutral" | "success" | "warning" | "error" | "info";

export type FilterPillProps = {
  /** Nom du champ/dimension affiché à gauche. */
  field: string;
  /** Résumé de la valeur sélectionnée, ex "France, Italie" ou "> 100". */
  value: string;
  /** Opérateur optionnel affiché entre field et value, ex "=", "in", "entre". */
  operator?: string;
  /** Pilule active (aria-pressed). Défaut true. */
  active?: boolean;
  /** Affiche le bouton ✕. Défaut true. */
  removable?: boolean;
  disabled?: boolean;
  tone?: FilterPillTone;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
};

export function FilterPill({
  field,
  value,
  operator,
  active = true,
  removable = true,
  disabled = false,
  tone = "neutral",
  onClick,
  onRemove,
  className,
}: FilterPillProps) {
  const bodyRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLSpanElement>(null);

  // Fix #5 : transfert de focus quand le corps-bouton focalisé devient disabled.
  const prevDisabled = React.useRef(disabled);
  React.useEffect(() => {
    if (!prevDisabled.current && disabled) {
      const container = containerRef.current;
      if (container && container.contains(document.activeElement)) {
        const focusable = document.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])"
        );
        let transferred = false;
        for (const el of Array.from(focusable)) {
          if (!container.contains(el)) {
            el.focus();
            transferred = true;
            break;
          }
        }
        if (!transferred) (document.body as HTMLElement).focus();
      }
    }
    prevDisabled.current = disabled;
  }, [disabled]);

  function handleClick() {
    if (disabled) return;
    onClick?.();
  }

  function handleRemove() {
    if (disabled) return;
    onRemove?.();
  }

  // Suppr/Backspace sur le corps-bouton → onRemove (si removable).
  function handleBodyKeydown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if ((e.key === "Delete" || e.key === "Backspace") && removable) {
      e.preventDefault();
      onRemove?.();
    }
  }

  const groupClass = classNames(
    "st-filterPill",
    `st-filterPill--${tone}`,
    active ? "st-filterPill--active" : undefined,
    disabled ? "st-filterPill--disabled" : undefined,
    className
  );

  return (
    <span ref={containerRef} className={groupClass} role="group" aria-label={`Filtre ${field}`}>
      {onClick ? (
        <button
          ref={bodyRef}
          type="button"
          className="st-filterPill__body"
          aria-pressed={active}
          disabled={disabled || undefined}
          onClick={handleClick}
          onKeyDown={handleBodyKeydown}
        >
          <span className="st-filterPill__field">{field}</span>
          {operator ? <span className="st-filterPill__operator" aria-hidden="true">{operator}</span> : null}
          <span className="st-filterPill__value">{value}</span>
        </button>
      ) : (
        <span className="st-filterPill__body st-filterPill__body--static">
          <span className="st-filterPill__field">{field}</span>
          {operator ? <span className="st-filterPill__operator" aria-hidden="true">{operator}</span> : null}
          <span className="st-filterPill__value">{value}</span>
        </span>
      )}
      {removable ? (
        <button
          type="button"
          className="st-filterPill__remove"
          aria-label={`Retirer le filtre ${field}`}
          disabled={disabled || undefined}
          onClick={handleRemove}
        >
          <X size={12} strokeWidth={2.5} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

export type FilterBarProps = {
  /** Aria-label du groupe de filtres, ex "Filtres actifs". */
  label: string;
  /** Callback "tout effacer" — le bouton n'est rendu que si ce callback est fourni. */
  onClearAll?: () => void;
  /** Libellé du bouton "tout effacer". Défaut "Tout effacer". */
  clearAllLabel?: string;
  children?: React.ReactNode;
  className?: string;
};

export function FilterBar({ label, onClearAll, clearAllLabel = "Tout effacer", children, className }: FilterBarProps) {
  return (
    <div className={classNames("st-filterBar", className)} role="group" aria-label={label}>
      <div className="st-filterBar__pills">{children}</div>
      {onClearAll ? (
        <button type="button" className="st-filterBar__clearAll" onClick={onClearAll}>
          {clearAllLabel}
        </button>
      ) : null}
    </div>
  );
}

export type SelectionChipTone = "neutral" | "success" | "warning" | "error" | "info";

export type SelectionChipProps = {
  /** Libellé de la dimension sélectionnée. */
  label: string;
  /** Nombre d'éléments sélectionnés — affiché "(N)" si fourni et Number.isFinite. */
  count?: number;
  tone?: SelectionChipTone;
  /** Callback effacement — affiche le bouton ✕ si fourni. */
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
};

export function SelectionChip({ label, count, tone = "neutral", onClear, disabled = false, className }: SelectionChipProps) {
  const showCount = count !== undefined && Number.isFinite(count);

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    onClear?.();
  }

  return (
    <span
      className={classNames("st-selectionChip", `st-selectionChip--${tone}`, disabled && "st-selectionChip--disabled", className)}
      aria-disabled={disabled ? "true" : undefined}
    >
      <span className="st-selectionChip__label">{label}</span>
      {showCount ? (
        <span className="st-selectionChip__count" aria-label={`(${count})`}>({count})</span>
      ) : null}
      {onClear ? (
        <button
          type="button"
          className="st-selectionChip__clear"
          aria-label={`Effacer ${label}`}
          disabled={disabled}
          onClick={handleClear}
        >
          <X size={11} strokeWidth={2.5} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

export type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  size?: "sm" | "md";
  disabled?: boolean;
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: (event: React.MouseEvent) => void;
};
export function Tag({ tone = "neutral", size = "md", disabled = false, dismissible = false, dismissLabel = "Dismiss", onDismiss, className, children, ...rest }: TagProps) {
  // Parity with the Svelte reference: the X affordance is driven by
  // `dismissible` (the docs node specs pass it without an `onDismiss`), and the
  // handler is suppressed while disabled.
  const showDismiss = dismissible || typeof onDismiss === "function";
  const handleDismiss = (event: React.MouseEvent) => {
    if (disabled) return;
    onDismiss?.(event);
  };
  return (
    <span {...rest} className={classNames("st-tag", `st-tag--${tone}`, `st-tag--${size}`, disabled && "st-tag--disabled", className)} aria-disabled={disabled ? "true" : undefined}>
      <span className="st-tag__label">{children}</span>
      {showDismiss ? <button type="button" className="st-tag__dismiss" aria-label={dismissLabel} disabled={disabled} onClick={handleDismiss}><X size={14} strokeWidth={2} aria-hidden="true" /></button> : null}
    </span>
  );
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
};
export function Textarea({ label, helperText, errorText, invalid, className, ...rest }: TextareaProps) {
  return (
    <Field label={label} helperText={helperText} errorText={errorText} invalid={invalid} className={className}>
      {(inputId, isInvalid) => <textarea {...rest} id={inputId} className="st-textarea st-control" aria-invalid={isInvalid ? "true" : undefined} />}
    </Field>
  );
}

export type TileVariant = "static" | "clickable" | "selectable";
export type TileProps = Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
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
      <a {...rest} className={tileClass} href={href} aria-disabled={disabled || undefined} onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}>
        {body}
      </a>
    );
  }
  if (variant === "clickable") {
    return (
      <button {...rest} type="button" className={tileClass} disabled={disabled} onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}>
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
          onChange={(event) => onSelect?.(event.target.checked)}
        />
        {body}
      </label>
    );
  }
  return (
    <div {...rest} className={tileClass} onClick={onClick as React.MouseEventHandler<HTMLDivElement>}>
      {body}
    </div>
  );
}

export interface TileGroupItem {
  value: string;
  /** Libellé du tile (canonique Svelte). */
  label?: React.ReactNode;
  /** @deprecated Alias de `label` (compat). Utilisez `label`. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}
export type TileGroupProps = React.HTMLAttributes<HTMLFieldSetElement> & {
  legend?: React.ReactNode;
  items: TileGroupItem[];
  value?: string;
  disabled?: boolean;
};
export function TileGroup({ legend, items, value, disabled = false, className, ...rest }: TileGroupProps) {
  return (
    <fieldset {...rest} className={classNames("st-tileGroup", disabled && "st-tileGroup--disabled", className)}>
      {legend ? <legend className="st-tileGroup__legend">{legend}</legend> : null}
      <div className="st-tileGroup__items">
        {items.map((item) => (
          <label key={item.value} className={classNames("st-tileGroup__tile", item.value === value && "st-tileGroup__tile--checked", item.disabled && "st-tileGroup__tile--disabled")}>
            <input className="st-tileGroup__input" type="radio" value={item.value} checked={item.value === value} disabled={disabled || item.disabled} readOnly />
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

export type ToastItem = {
  id: string;
  tone?: Exclude<Tone, "neutral">;
  title: React.ReactNode;
  message?: React.ReactNode;
  actions?: React.ReactNode;
};
export type ToastProps = React.HTMLAttributes<HTMLElement> & {
  tone?: Exclude<Tone, "neutral">;
  title: React.ReactNode;
  message?: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  items?: ToastItem[];
  autoDismiss?: boolean;
  duration?: number;
  onDismiss?: (id: string) => void;
};
export function Toast({ tone = "info", title, message, actions, onClose, items, autoDismiss = false, duration = 5000, onDismiss, children, className, ...rest }: ToastProps) {
  React.useEffect(() => {
    if (!autoDismiss || !items?.length || !onDismiss) return;
    const timeout = window.setTimeout(() => onDismiss(items[0].id), duration);
    return () => window.clearTimeout(timeout);
  }, [autoDismiss, duration, items, onDismiss]);

  if (items?.length) {
    return (
      <div {...rest} className={classNames("st-toastQueue", className)}>
        {items.map((item) => (
          <aside key={item.id} className={classNames("st-toast", `st-toast--${item.tone ?? "info"}`)} role="status">
            <div className="st-toast__content">
              <h2 className="st-toast__title">{item.title}</h2>
              {item.message ? <p className="st-toast__message">{item.message}</p> : null}
            </div>
            {item.actions ? <div className="st-toast__actions">{item.actions}</div> : null}
            {onDismiss ? (
              <button type="button" onClick={() => onDismiss(item.id)} aria-label={`Dismiss ${text(item.title)}`}>
                Close
              </button>
            ) : null}
          </aside>
        ))}
      </div>
    );
  }

  return (
    <aside {...rest} className={classNames("st-toast", `st-toast--${tone}`, className)} role="status">
      <div className="st-toast__content">
        <h2 className="st-toast__title">{title}</h2>
        {message ? <p className="st-toast__message">{message}</p> : children}
      </div>
      {actions ? <div className="st-toast__actions">{actions}</div> : null}
      {onClose ? <button type="button" onClick={onClose}>Close</button> : null}
    </aside>
  );
}

export type ToggleProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label: React.ReactNode;
  labelOn?: string;
  labelOff?: string;
  helperText?: React.ReactNode;
  size?: "sm" | "md";
};
export function Toggle({ label, labelOn = "On", labelOff = "Off", helperText, size = "md", className, ...rest }: ToggleProps) {
  const isChecked = rest.checked ?? rest.defaultChecked ?? false;
  return (
    <label className={classNames("st-toggle", `st-toggle--${size}`, className)}>
      <span className="st-toggle__label">{label}</span>
      <span className="st-toggle__row">
        <input {...rest} className="st-toggle__input" type="checkbox" role="switch" aria-checked={isChecked ? "true" : "false"} />
        <span className="st-toggle__track" aria-hidden="true"><span className="st-toggle__thumb" /></span>
        <span className="st-toggle__state" aria-hidden="true">{isChecked ? labelOn : labelOff}</span>
      </span>
      {helperText ? <span className="st-toggle__help">{helperText}</span> : null}
    </label>
  );
}

export type ToggletipProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> & {
  label: React.ReactNode;
  content?: React.ReactNode;
  open?: boolean;
  placement?: "top" | "bottom" | "start" | "end";
};
export function Toggletip({ label, content, open: controlledOpen, placement = "top", children, className, ...rest }: ToggletipProps) {
  const [open, setOpen] = useControlled(controlledOpen, false);
  useEscape(open, () => setOpen(false));
  return (
    <span {...rest} className={classNames("st-toggletip", `st-toggletip--${placement}`, className)}>
      <button type="button" className="st-toggletip__trigger" aria-expanded={open} onClick={() => setOpen(!open)}>{label}</button>
      {open ? <span className="st-toggletip__bubble" role="status"><span className="st-toggletip__content">{content ?? children}</span></span> : null}
    </span>
  );
}

export type TooltipProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> & {
  content: React.ReactNode;
  placement?: "top" | "bottom";
};
export function Tooltip({ content, placement = "top", children, className, ...rest }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const tooltipId = React.useId();
  return (
    <span
      {...rest}
      className={classNames("st-tooltip", `st-tooltip--${placement}`, className)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="st-tooltip__trigger">{children}</span>
      <span id={tooltipId} className="st-tooltip__content" role="tooltip" aria-hidden={open ? "false" : "true"}>
        {content}
      </span>
    </span>
  );
}

export interface TreeNode {
  id: string;
  label: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}
export type TreeViewProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "onChange"> & {
  nodes: TreeNode[];
  selectedId?: string;
  /** Svelte-canonical alias of `selectedId`. */
  selected?: string;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  /** Svelte-canonical alias of `defaultExpandedIds`. */
  defaultExpanded?: string[];
  /** Accessible name for the tree (parity with the Svelte `label`). */
  label?: string;
  /**
   * Called with the selected node's `id` when a leaf is activated by click or
   * keyboard (Enter/Space). Parity with the Svelte `onselect`. When neither
   * `onSelect` nor `onChange` is provided the tree stays display-only.
   */
  onSelect?: (id: string) => void;
  /** Alias of `onSelect`; same payload (the selected node `id`). */
  onChange?: (id: string) => void;
};

type TreeFlatNode = {
  node: TreeNode;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
};

function flattenVisible(nodes: TreeNode[], expanded: Set<string>): TreeFlatNode[] {
  const out: TreeFlatNode[] = [];
  const walk = (items: TreeNode[], level: number, parentId: string | null) => {
    for (const node of items) {
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const isExpanded = expanded.has(node.id);
      out.push({ node, level, parentId, hasChildren, expanded: isExpanded });
      if (hasChildren && isExpanded) walk(node.children!, level + 1, node.id);
    }
  };
  walk(nodes, 1, null);
  return out;
}

export function TreeView({
  nodes,
  selectedId,
  selected,
  expandedIds,
  defaultExpandedIds,
  defaultExpanded,
  label = "Arborescence",
  onSelect,
  onChange,
  className,
  ...rest
}: TreeViewProps) {
  // Accept the Svelte-canonical prop names (`selected`, `defaultExpanded`) as
  // aliases — that is what the shared docs node specs pass.
  const resolvedSelectedId = selectedId ?? selected;
  const seedExpanded = defaultExpandedIds ?? defaultExpanded ?? [];
  // Expansion: controlled when `expandedIds` is provided, otherwise internal
  // state seeded from `defaultExpandedIds` (parity with the Svelte reference).
  const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
    () => new Set(seedExpanded),
  );
  const expanded = expandedIds ? new Set(expandedIds) : internalExpanded;
  const expansionControlled = Boolean(expandedIds);

  const [focusedId, setFocusedId] = React.useState<string | undefined>(undefined);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const visible = flattenVisible(nodes, expanded);
  const tabbableId = focusedId ?? visible[0]?.node.id;

  function toggle(id: string) {
    if (expansionControlled) return; // parent owns expansion
    setInternalExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function emitSelect(id: string) {
    onSelect?.(id);
    onChange?.(id);
  }

  function activate(flat: TreeFlatNode) {
    if (flat.node.disabled) return;
    setFocusedId(flat.node.id);
    if (flat.hasChildren) {
      toggle(flat.node.id);
    } else {
      emitSelect(flat.node.id);
    }
  }

  function focusAt(index: number) {
    const target = visible[index];
    if (!target) return;
    setFocusedId(target.node.id);
    queueMicrotask(() => {
      const rows = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-tree-id]") ?? []);
      rows.find((row) => row.dataset.treeId === target.node.id)?.focus();
    });
  }

  function onKey(event: React.KeyboardEvent, flat: TreeFlatNode) {
    const i = visible.findIndex((v) => v.node.id === flat.node.id);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(i + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(i - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(visible.length - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        if (flat.hasChildren && !flat.expanded) toggle(flat.node.id);
        else if (flat.hasChildren) focusAt(i + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (flat.hasChildren && flat.expanded) toggle(flat.node.id);
        else if (flat.parentId) focusAt(visible.findIndex((v) => v.node.id === flat.parentId));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        activate(flat);
        break;
    }
  }

  const interactive = typeof onSelect === "function" || typeof onChange === "function";

  return (
    <div {...rest} ref={rootRef} className={classNames("st-treeView", className)} role="tree" aria-label={label}>
      {visible.map((flat) => {
        const isSelected = flat.node.id === resolvedSelectedId;
        return (
          <div
            key={flat.node.id}
            role="treeitem"
            aria-level={flat.level}
            aria-expanded={flat.hasChildren ? flat.expanded : undefined}
            aria-selected={isSelected}
            aria-disabled={flat.node.disabled || undefined}
            className={classNames(
              "st-treeView__row",
              isSelected && "st-treeView__row--selected",
              flat.node.disabled && "st-treeView__row--disabled",
            )}
            data-tree-id={flat.node.id}
            style={{ paddingInlineStart: `calc(${flat.level - 1} * var(--st-spacing-4, 1rem) + 0.25rem)` }}
            tabIndex={interactive ? (flat.node.id === tabbableId ? 0 : -1) : undefined}
            onClick={interactive ? () => activate(flat) : undefined}
            onKeyDown={interactive ? (e) => onKey(e, flat) : undefined}
            onFocus={interactive ? () => setFocusedId(flat.node.id) : undefined}
          >
            <span
              className={classNames(
                "st-treeView__caret",
                !flat.hasChildren && "st-treeView__caret--leaf",
                flat.expanded && "st-treeView__caret--open",
              )}
              aria-hidden="true"
            />
            <span className="st-treeView__label">{flat.node.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export type UnorderedListItem = { content?: React.ReactNode; label?: React.ReactNode; children?: UnorderedListInput[] };
export type UnorderedListInput = React.ReactNode | UnorderedListItem;
export type UnorderedListProps = React.HTMLAttributes<HTMLUListElement> & { items: UnorderedListInput[] };
export function UnorderedList({ items, className, ...rest }: UnorderedListProps) {
  return (
    <ul {...rest} className={classNames("st-unorderedList", className)}>
      {items.map((item, index) => renderListItem(item, index, false))}
    </ul>
  );
}

// ===========================================================================
// Specialized components ported from packages/components-svelte/src/lib.
// API, classes, ARIA roles and behaviour mirror the Svelte sources 1:1.
// ===========================================================================

// --- Rating ----------------------------------------------------------------
export type RatingSize = "sm" | "md" | "lg";
export type RatingProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "onChange"> & {
  /** Note courante (0..max). Pas de 1, ou 0.5 si `allowHalf`. */
  value?: number;
  /** Nombre d'étoiles. */
  max?: number;
  /** Appelé avec la nouvelle note au clic ou au clavier. */
  onChange?: (value: number) => void;
  /** Affichage seul : ni clic ni clavier n'émettent. */
  readonly?: boolean;
  /** Autorise les demi-étoiles (sélection au demi-point). */
  allowHalf?: boolean;
  size?: RatingSize;
  /** Attribut name (utile dans un formulaire / pour la sémantique radio). */
  name?: string;
  /** Étiquette accessible du groupe. */
  label?: string;
  className?: string;
};
function StarIcon({ size, fill }: { size: number; fill: "currentColor" | "none" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function StarHalfIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z" fill="currentColor" />
      <path d="M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" />
    </svg>
  );
}
export function Rating({
  value,
  max = 5,
  onChange,
  readonly = false,
  allowHalf = false,
  size = "md",
  name,
  label,
  className,
  ...rest
}: RatingProps) {
  const [current, setCurrent] = useControlled(value, value ?? 0, onChange);
  const iconSize = size === "sm" ? 16 : size === "lg" ? 28 : 22;
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  // L'étoile « focusable » (tabindex 0) suit la valeur ; à 0 c'est la première.
  // En mode entier, focusedStar est toujours >= 1 (pas de radio "0").
  const focusedStar = current > 0 ? Math.ceil(current) : 1;

  // Refs des boutons radio pour déplacer le focus programmatiquement (mode entier).
  const radioRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});

  const valueText = `${current} / ${max}`;

  function fill(star: number): "full" | "half" | "empty" {
    if (current >= star) return "full";
    if (allowHalf && current >= star - 0.5) return "half";
    return "empty";
  }
  function commit(next: number) {
    if (readonly) return;
    setCurrent(Math.max(0, Math.min(max, next)));
  }
  function onStarClick(event: React.MouseEvent<HTMLButtonElement>, star: number) {
    if (readonly) return;
    let next = star;
    if (allowHalf) {
      const rect = event.currentTarget.getBoundingClientRect();
      const isLeftHalf = event.clientX - rect.left < rect.width / 2;
      next = isLeftHalf ? star - 0.5 : star;
    }
    // Re-cliquer la valeur déjà sélectionnée remet à zéro.
    if (next === current) {
      commit(0);
      return;
    }
    commit(next);
  }
  function onRadioKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (readonly) return;
    const step = 1;
    let handled = true;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(max, current + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        // En mode entier, ne pas descendre sous 1 (pas de radio "0").
        next = Math.max(1, current - step);
        break;
      case "Home":
        // Home → première étoile (1), pas 0 (aucun radio "0" n'existe).
        next = 1;
        break;
      case "End":
        next = max;
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
      if (next !== null) {
        commit(next);
        // Déplacer le focus DOM vers le radio cible.
        const targetEl = radioRefs.current[next > 0 ? Math.ceil(next) : 1];
        if (targetEl) targetEl.focus();
      }
    }
  }
  function onSliderKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (readonly) return;
    const step = 0.5;
    let handled = true;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        commit(Math.min(max, current + step));
        break;
      case "ArrowLeft":
      case "ArrowDown":
        commit(Math.max(0, current - step));
        break;
      case "Home":
        commit(0);
        break;
      case "End":
        commit(max);
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  }

  // Readonly : rendu non interactif avec role="img" et aria-label global.
  if (readonly) {
    return (
      <div
        {...rest}
        className={classNames("st-rating", `st-rating--${size}`, "st-rating--readonly", className)}
        role="img"
        aria-label={label ? `${label} : ${valueText}` : valueText}
      >
        {stars.map((star) => {
          const state = fill(star);
          return (
            <span
              key={star}
              className={classNames(
                "st-rating__star",
                state === "full" && "st-rating__star--full",
                state === "half" && "st-rating__star--half",
              )}
              aria-hidden="true"
            >
              {state === "half" ? (
                <StarHalfIcon size={iconSize} />
              ) : (
                <StarIcon size={iconSize} fill={state === "full" ? "currentColor" : "none"} />
              )}
            </span>
          );
        })}
      </div>
    );
  }

  // allowHalf : slider ARIA — valeurs fractionnaires (0.5 step).
  if (allowHalf) {
    return (
      <div
        {...rest}
        className={classNames("st-rating", `st-rating--${size}`, className)}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={valueText}
        tabIndex={0}
        onKeyDown={onSliderKeyDown}
      >
        {stars.map((star) => {
          const state = fill(star);
          return (
            <span
              key={star}
              className={classNames(
                "st-rating__star",
                state === "full" && "st-rating__star--full",
                state === "half" && "st-rating__star--half",
              )}
              aria-hidden="true"
              onClick={(event) => onStarClick(event as unknown as React.MouseEvent<HTMLButtonElement>, star)}
            >
              {state === "half" ? (
                <StarHalfIcon size={iconSize} />
              ) : (
                <StarIcon size={iconSize} fill={state === "full" ? "currentColor" : "none"} />
              )}
            </span>
          );
        })}
      </div>
    );
  }

  // Mode entier : radiogroup / radio. aria-checked=true uniquement sur l'étoile == value.
  return (
    <div
      {...rest}
      className={classNames("st-rating", `st-rating--${size}`, className)}
      role="radiogroup"
      aria-label={label}
    >
      {stars.map((star) => {
        const state = fill(star);
        return (
          <button
            key={star}
            ref={(el) => { radioRefs.current[star] = el; }}
            type="button"
            className={classNames(
              "st-rating__star",
              state === "full" && "st-rating__star--full",
              state === "half" && "st-rating__star--half",
            )}
            role="radio"
            name={name}
            aria-checked={current === star ? "true" : "false"}
            aria-label={`${star} / ${max}`}
            tabIndex={star === focusedStar ? 0 : -1}
            onClick={(event) => onStarClick(event, star)}
            onKeyDown={onRadioKeyDown}
          >
            <StarIcon size={iconSize} fill={state === "full" ? "currentColor" : "none"} />
          </button>
        );
      })}
    </div>
  );
}

// --- TimePicker ------------------------------------------------------------
export type TimePickerFormat = "24" | "12";
export type TimePickerProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "onChange"> & {
  /** Heure courante au format "HH:mm" (24h, toujours). Vide = non renseigné. */
  value?: string;
  /** Appelé avec "HH:mm" lors d'une sélection. */
  onChange?: (value: string) => void;
  /** Pas (en minutes) entre deux créneaux générés. */
  step?: number;
  /** Borne minimale "HH:mm" (inclusive). */
  min?: string;
  /** Borne maximale "HH:mm" (inclusive). */
  max?: string;
  /** Affichage 24h (par défaut) ou 12h (AM/PM). La valeur émise reste "HH:mm". */
  format?: TimePickerFormat;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
};
function timeToMinutes(hhmm: string | undefined): number | null {
  if (!hhmm) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}
function timeFromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function TimePicker({
  value,
  onChange,
  step = 15,
  min,
  max,
  format = "24",
  size = "md",
  disabled = false,
  label,
  className,
  id,
  ...rest
}: TimePickerProps) {
  const reactId = React.useId();
  const fieldId = id ?? `st-timepicker-${reactId}`;
  const listId = `${fieldId}-list`;
  const hostRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = useControlled(value, value ?? "", onChange);
  /** Index de l'option mise en évidence dans la listbox (-1 = aucune). */
  const [activeIndex, setActiveIndex] = React.useState(-1);

  function display(hhmm: string): string {
    if (format === "24") return hhmm;
    const total = timeToMinutes(hhmm);
    if (total === null) return hhmm;
    const h24 = Math.floor(total / 60);
    const m = total % 60;
    const period = h24 < 12 ? "AM" : "PM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
  }

  const slots = React.useMemo<string[]>(() => {
    const safeStep = step > 0 ? step : 15;
    const lower = timeToMinutes(min) ?? 0;
    const upper = timeToMinutes(max) ?? 23 * 60 + 59;
    const result: string[] = [];
    for (let t = lower; t <= upper; t += safeStep) {
      result.push(timeFromMinutes(t));
    }
    return result;
  }, [step, min, max]);

  const displayValue = current ? display(current) : "";

  /** Id de l'option active, consommé par aria-activedescendant. */
  const activeDescendant = open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined;

  function scrollActiveIntoView(idx: number) {
    const list = listRef.current;
    if (!list || idx < 0) return;
    const optEl = list.querySelector<HTMLElement>(`#${listId}-opt-${idx}`);
    if (optEl && typeof optEl.scrollIntoView === "function") {
      optEl.scrollIntoView({ block: "nearest" });
    }
  }

  function openList() {
    if (disabled) return;
    const idx = current ? slots.indexOf(current) : -1;
    const initIdx = idx >= 0 ? idx : 0;
    setActiveIndex(initIdx);
    setOpen(true);
    // Le focus reste sur l'input (pattern aria-activedescendant).
    // Scroll après rendu.
    setTimeout(() => scrollActiveIntoView(initIdx), 0);
  }

  function closeList(returnFocus = true) {
    setOpen(false);
    setActiveIndex(-1);
    if (returnFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }

  function toggleOpen() {
    if (disabled) return;
    if (open) closeList(true);
    else openList();
  }

  function pick(slot: string) {
    setCurrent(slot);
    closeList(true);
  }

  useOutsideMouseDown(open, hostRef, () => closeList(false));

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          const next = Math.min(activeIndex + 1, slots.length - 1);
          setActiveIndex(next);
          scrollActiveIntoView(next);
        }
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          const next = Math.max(activeIndex - 1, 0);
          setActiveIndex(next);
          scrollActiveIntoView(next);
        }
        break;
      }
      case "Home": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex(0);
          scrollActiveIntoView(0);
        }
        break;
      }
      case "End": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          const last = slots.length - 1;
          setActiveIndex(last);
          scrollActiveIntoView(last);
        }
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!open) {
          openList();
        } else if (activeIndex >= 0 && activeIndex < slots.length) {
          pick(slots[activeIndex]);
        }
        break;
      }
      case "Escape": {
        if (open) {
          event.preventDefault();
          closeList(true);
        }
        break;
      }
    }
  }

  return (
    <div className={classNames("st-field", className)} ref={hostRef} {...rest}>
      <div className="st-field__control">
        {label ? (
          <label className="st-field__label" htmlFor={fieldId}>
            {label}
          </label>
        ) : null}
        <span className={classNames("st-timepicker", `st-timepicker--${size}`)}>
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            readOnly
            className="st-timepicker__control"
            value={displayValue}
            placeholder={format === "24" ? "HH:mm" : "hh:mm AM"}
            disabled={disabled}
            role="combobox"
            aria-haspopup="listbox"
            aria-controls={listId}
            aria-expanded={open ? "true" : "false"}
            aria-activedescendant={activeDescendant}
            aria-autocomplete="none"
            onClick={toggleOpen}
            onKeyDown={onInputKeyDown}
          />
          <button
            type="button"
            className="st-timepicker__trigger"
            aria-label="Ouvrir la liste des horaires"
            aria-haspopup="listbox"
            aria-expanded={open ? "true" : "false"}
            tabIndex={-1}
            disabled={disabled}
            onClick={toggleOpen}
          >
            <Clock size={16} aria-hidden="true" />
          </button>
        </span>
      </div>
      {open ? (
        <ul
          ref={listRef}
          id={listId}
          className="st-timepicker__list"
          role="listbox"
          aria-label={label ?? "Horaires"}
          tabIndex={-1}
        >
          {slots.map((slot, i) => (
            <li key={slot} role="presentation">
              <div
                id={`${listId}-opt-${i}`}
                className={classNames(
                  "st-timepicker__option",
                  slot === current && "st-timepicker__option--selected",
                  i === activeIndex && "st-timepicker__option--active",
                )}
                role="option"
                aria-selected={slot === current ? "true" : "false"}
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(slot)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {display(slot)}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
// --- Calendar --------------------------------------------------------------
/**
 * En mode simple : `string | null` ("YYYY-MM-DD").
 * En mode plage (`range`) : tuple `[start, end]` où chaque borne est
 * "YYYY-MM-DD" ou null.
 */
export type CalendarValue = string | null | [string | null, string | null];
export type CalendarProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "onChange"> & {
  /** Date sélectionnée ("YYYY-MM-DD") ou tuple [start,end] si `range`. */
  value?: CalendarValue;
  /** Appelé avec la nouvelle date (ou le tuple en mode plage). */
  onChange?: (value: CalendarValue) => void;
  /** Borne minimale "YYYY-MM-DD" (inclusive). */
  min?: string;
  /** Borne maximale "YYYY-MM-DD" (inclusive). */
  max?: string;
  /** Sélection d'une plage de deux dates. */
  range?: boolean;
  /** Premier jour de la semaine : 0 = dimanche, 1 = lundi. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  /** Mois affiché ("YYYY-MM"), contrôlable de l'extérieur. */
  month?: string;
  className?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
};
function calStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function calToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function calParseISO(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? null : calStartOfDay(d);
}
function calIsSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function Calendar({
  value,
  onChange,
  min,
  max,
  range = false,
  weekStartsOn = 1,
  locale = "fr-FR",
  month,
  className,
  previousMonthLabel,
  nextMonthLabel,
  ...rest
}: CalendarProps) {
  const [activeValue, setCurrent] = useControlled<CalendarValue>(value, value ?? null, onChange);

  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
  const resolvedPrevLabel = previousMonthLabel ?? (isFr ? "Mois précédent" : "Previous month");
  const resolvedNextLabel = nextMonthLabel ?? (isFr ? "Mois suivant" : "Next month");

  const monthFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale],
  );
  const weekdayFormatter = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short" }), [locale]);
  const cellFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }),
    [locale],
  );

  const single = range ? null : calParseISO(activeValue as string | null);
  const rangeStart = range && Array.isArray(activeValue) ? calParseISO(activeValue[0]) : null;
  const rangeEnd = range && Array.isArray(activeValue) ? calParseISO(activeValue[1]) : null;

  function pickInitialMonth(): Date {
    const parsed = calParseISO(month ? `${month}-01` : undefined);
    if (parsed) return parsed;
    if (!range && single) return single;
    if (range && rangeStart) return rangeStart;
    return calStartOfDay(new Date());
  }
  const initial = React.useRef(pickInitialMonth());
  const [viewYear, setViewYear] = React.useState(initial.current.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(initial.current.getMonth());

  // Resynchronise le mois affiché lorsque la prop `month` change.
  React.useEffect(() => {
    const parsed = calParseISO(month ? `${month}-01` : undefined);
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [month]);

  const today = React.useMemo(() => calStartOfDay(new Date()), []);

  const weekdayLabels = React.useMemo(() => {
    // 2024-01-07 est un dimanche : on énumère puis on tourne selon weekStartsOn.
    const sample = new Date(Date.UTC(2024, 0, 7));
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sample);
      d.setUTCDate(sample.getUTCDate() + i);
      labels.push(weekdayFormatter.format(d));
    }
    return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)];
  }, [weekdayFormatter, weekStartsOn]);

  const grid = React.useMemo<Array<{ date: Date; inMonth: boolean }>>(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const firstDayIdx = first.getDay();
    const offset = (firstDayIdx - weekStartsOn + 7) % 7;
    const start = new Date(viewYear, viewMonth, 1 - offset);
    const cells: Array<{ date: Date; inMonth: boolean }> = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ date: calStartOfDay(d), inMonth: d.getMonth() === viewMonth });
    }
    return cells;
  }, [viewYear, viewMonth, weekStartsOn]);

  const minDate = React.useMemo(() => calParseISO(min), [min]);
  const maxDate = React.useMemo(() => calParseISO(max), [max]);

  function isOutOfBounds(date: Date): boolean {
    const d = calStartOfDay(date).getTime();
    if (minDate && d < minDate.getTime()) return true;
    if (maxDate && d > maxDate.getTime()) return true;
    return false;
  }
  function isSelected(date: Date): boolean {
    if (!range) return calIsSameDay(single, date);
    return calIsSameDay(rangeStart, date) || calIsSameDay(rangeEnd, date);
  }
  function isInRange(date: Date): boolean {
    if (!range || !rangeStart || !rangeEnd) return false;
    const d = calStartOfDay(date).getTime();
    return d > rangeStart.getTime() && d < rangeEnd.getTime();
  }

  // --- Roving tabindex : date active dans la grille -------------------------
  // INVARIANT : focusDate est toujours dans le mois affiché ET non-disabled.
  function calClampToMonth(preferred: Date, y: number, m: number): Date | null {
    if (
      preferred.getFullYear() === y &&
      preferred.getMonth() === m &&
      !isOutOfBounds(preferred)
    ) {
      return preferred;
    }
    // Chercher le jour sélectionné dans ce mois en priorité.
    const sel = !range ? single : rangeStart;
    if (sel && sel.getFullYear() === y && sel.getMonth() === m && !isOutOfBounds(sel)) {
      return sel;
    }
    const lastDay = new Date(y, m + 1, 0).getDate();
    for (let dd = 1; dd <= lastDay; dd++) {
      const candidate = calStartOfDay(new Date(y, m, dd));
      if (!isOutOfBounds(candidate)) return candidate;
    }
    return null;
  }

  function calInitialFocusDate(): Date {
    const sel = !range ? single : rangeStart;
    if (sel && sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && !isOutOfBounds(sel)) {
      return sel;
    }
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let dd = 1; dd <= lastDay; dd++) {
      const candidate = calStartOfDay(new Date(viewYear, viewMonth, dd));
      if (!isOutOfBounds(candidate)) return candidate;
    }
    return calStartOfDay(new Date(viewYear, viewMonth, 1));
  }

  const [focusDate, setFocusDate] = React.useState<Date>(calInitialFocusDate);
  const gridRef = React.useRef<HTMLDivElement>(null);

  // Resynchronise focusDate quand viewYear/viewMonth change.
  // Utilise une ref pour éviter les dépendances circulaires dans l'effet.
  const isOutOfBoundsRef = React.useRef(isOutOfBounds);
  isOutOfBoundsRef.current = isOutOfBounds;
  const calClampToMonthRef = React.useRef(calClampToMonth);
  calClampToMonthRef.current = calClampToMonth;

  React.useEffect(() => {
    setFocusDate((prev) => {
      const clamped = calClampToMonthRef.current(prev, viewYear, viewMonth);
      return clamped ?? prev;
    });
  }, [viewYear, viewMonth]);

  function focusActiveCell() {
    const grid = gridRef.current;
    if (!grid) return;
    const iso = calToISO(focusDate);
    const btn = grid.querySelector<HTMLElement>(`[data-date="${iso}"]`);
    btn?.focus();
  }

  function moveFocus(deltaDays: number) {
    const next = calStartOfDay(new Date(focusDate));
    next.setDate(next.getDate() + deltaDays);
    let nextYear = viewYear;
    let nextMonth = viewMonth;
    if (next.getFullYear() !== viewYear || next.getMonth() !== viewMonth) {
      nextYear = next.getFullYear();
      nextMonth = next.getMonth();
      if (nextMonth > viewMonth || nextYear > viewYear) {
        // Next month
        if (viewMonth === 11) {
          setViewMonth(0);
          setViewYear((y) => y + 1);
        } else {
          setViewMonth((m) => m + 1);
        }
      } else {
        // Previous month
        if (viewMonth === 0) {
          setViewMonth(11);
          setViewYear((y) => y - 1);
        } else {
          setViewMonth((m) => m - 1);
        }
      }
    }
    setFocusDate(next);
    setTimeout(focusActiveCell, 0);
  }

  function previousMonth() {
    const targetMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const targetYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    setViewMonth(targetMonth);
    setViewYear(targetYear);
    // focusDate will be re-clamped by the viewYear/viewMonth effect
  }

  function nextMonth() {
    const targetMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const targetYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    setViewMonth(targetMonth);
    setViewYear(targetYear);
  }

  function pickDate(date: Date) {
    if (isOutOfBounds(date)) return;
    const picked = calStartOfDay(date);
    const iso = calToISO(picked);
    if (!range) {
      setCurrent(iso);
      return;
    }
    // Mode plage : (re)démarrage si pas de début, ou si plage déjà complète,
    // ou si la date est antérieure au début courant.
    if (!rangeStart || (rangeStart && rangeEnd) || picked.getTime() < rangeStart.getTime()) {
      setCurrent([iso, null]);
      return;
    }
    setCurrent([calToISO(rangeStart), iso]);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(-7);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocus(7);
        break;
      case "Home": {
        event.preventDefault();
        const dayOfWeek = focusDate.getDay();
        const offset = (dayOfWeek - weekStartsOn + 7) % 7;
        moveFocus(-offset);
        break;
      }
      case "End": {
        event.preventDefault();
        const dayOfWeek = focusDate.getDay();
        const offset = 6 - ((dayOfWeek - weekStartsOn + 7) % 7);
        moveFocus(offset);
        break;
      }
      case "PageUp": {
        event.preventDefault();
        const puDay = focusDate.getDate();
        const puTargetMonth = viewMonth === 0 ? 11 : viewMonth - 1;
        const puTargetYear = viewMonth === 0 ? viewYear - 1 : viewYear;
        const puLastDay = new Date(puTargetYear, puTargetMonth + 1, 0).getDate();
        const puNext = calStartOfDay(new Date(puTargetYear, puTargetMonth, Math.min(puDay, puLastDay)));
        setFocusDate(puNext);
        previousMonth();
        setTimeout(focusActiveCell, 0);
        break;
      }
      case "PageDown": {
        event.preventDefault();
        const pdDay = focusDate.getDate();
        const pdTargetMonth = viewMonth === 11 ? 0 : viewMonth + 1;
        const pdTargetYear = viewMonth === 11 ? viewYear + 1 : viewYear;
        const pdLastDay = new Date(pdTargetYear, pdTargetMonth + 1, 0).getDate();
        const pdNext = calStartOfDay(new Date(pdTargetYear, pdTargetMonth, Math.min(pdDay, pdLastDay)));
        setFocusDate(pdNext);
        nextMonth();
        setTimeout(focusActiveCell, 0);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!isOutOfBounds(focusDate)) pickDate(focusDate);
        break;
      }
    }
  }

  const monthLabel = monthFormatter.format(new Date(viewYear, viewMonth, 1));

  return (
    <div className={classNames("st-calendar", className)} {...rest}>
      <div className="st-calendar__nav">
        <button type="button" className="st-calendar__navBtn" aria-label={resolvedPrevLabel} onClick={previousMonth}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="st-calendar__monthLabel" aria-live="polite">
          {monthLabel}
        </span>
        <button type="button" className="st-calendar__navBtn" aria-label={resolvedNextLabel} onClick={nextMonth}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div
        ref={gridRef}
        className="st-calendar__grid"
        role="grid"
        aria-label={monthLabel}
        onKeyDown={onKeyDown}
      >
        <div className="st-calendar__weekdays" role="row">
          {weekdayLabels.map((wd, i) => (
            <span key={`${wd}-${i}`} className="st-calendar__weekday" role="columnheader">
              {wd}
            </span>
          ))}
        </div>
        <div className="st-calendar__days">
          {Array.from({ length: 6 }, (_, rowIdx) => (
            <div key={rowIdx} className="st-calendar__week" role="row">
              {grid.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
                const oob = isOutOfBounds(cell.date);
                const selected = isSelected(cell.date);
                const inRange = isInRange(cell.date);
                const isToday = calIsSameDay(cell.date, today);
                const isActive = calIsSameDay(cell.date, focusDate);
                return (
                  <button
                    key={rowIdx * 7 + colIdx}
                    type="button"
                    className={classNames(
                      "st-calendar__day",
                      !cell.inMonth && "st-calendar__day--outside",
                      selected && "st-calendar__day--selected",
                      inRange && "st-calendar__day--inRange",
                      isToday && "st-calendar__day--today",
                    )}
                    role="gridcell"
                    aria-label={cellFormatter.format(cell.date)}
                    aria-selected={selected ? "true" : "false"}
                    aria-current={isToday ? "date" : undefined}
                    aria-disabled={oob ? "true" : undefined}
                    disabled={oob}
                    tabIndex={isActive && !oob ? 0 : -1}
                    data-date={calToISO(cell.date)}
                    onClick={() => {
                      setFocusDate(calStartOfDay(cell.date));
                      pickDate(cell.date);
                    }}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// --- SlideIndicator --------------------------------------------------------
export type SlideIndicatorVariant = "dots" | "bars";
export type SlideIndicatorProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "onChange"> & {
  /** Nombre total de diapositives. */
  count: number;
  /** Index de la diapositive courante (0-based). */
  current?: number;
  /** Appelé avec l'index ciblé au clic ou au clavier. */
  onChange?: (index: number) => void;
  size?: "sm" | "md" | "lg";
  variant?: SlideIndicatorVariant;
  /** Préfixe d'étiquette accessible de chaque point ("Diapositive 1"...). */
  label?: string;
  className?: string;
};
export function SlideIndicator({
  count,
  current = 0,
  onChange,
  size = "md",
  variant = "dots",
  label = "Diapositive",
  className,
  ...rest
}: SlideIndicatorProps) {
  const items = Array.from({ length: Math.max(0, count) }, (_, i) => i);
  // Refs des boutons pour déplacer le focus programmatiquement lors de la navigation clavier.
  const buttonRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});

  function select(index: number) {
    if (index < 0 || index >= count || index === current) return;
    onChange?.(index);
  }
  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let target = index;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        target = Math.min(count - 1, index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        target = Math.max(0, index - 1);
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    // Déplacer le focus DOM vers le bouton cible (roving tabindex correct).
    const targetEl = buttonRefs.current[target];
    if (targetEl) targetEl.focus();
    select(target);
  }
  return (
    <div
      {...rest}
      className={classNames(
        "st-slideIndicator",
        `st-slideIndicator--${size}`,
        `st-slideIndicator--${variant}`,
        className,
      )}
      role="group"
      aria-label={label}
    >
      {items.map((index) => (
        <button
          key={index}
          ref={(el) => { buttonRefs.current[index] = el; }}
          type="button"
          className={classNames("st-slideIndicator__dot", index === current && "st-slideIndicator__dot--current")}
          aria-current={index === current ? "true" : undefined}
          aria-label={`${label} ${index + 1}`}
          tabIndex={index === current ? 0 : -1}
          onClick={() => select(index)}
          onKeyDown={(event) => onKeyDown(event, index)}
        />
      ))}
    </div>
  );
}

// --- Autosave --------------------------------------------------------------
export type AutosaveStatus = "idle" | "saving" | "saved" | "error";
export type AutosaveLabels = {
  idle?: string;
  saving?: string;
  saved?: string;
  error?: string;
};
export type AutosaveProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  status?: AutosaveStatus;
  /** Horodatage de la dernière sauvegarde réussie. */
  lastSaved?: string | Date;
  /** Affiche un bouton « Réessayer » sur le statut `error`. */
  onRetry?: () => void;
  /** Surcharge des libellés par statut. */
  labels?: AutosaveLabels;
  /** Étiquette du bouton de relance. */
  retryLabel?: string;
  locale?: string;
  className?: string;
};
export function Autosave({
  status = "idle",
  lastSaved,
  onRetry,
  labels,
  retryLabel,
  locale = "fr-FR",
  className,
  ...rest
}: AutosaveProps) {
  const isFr = (locale ?? "fr-FR").toLowerCase().startsWith("fr");
  const DEFAULT_LABELS: Required<AutosaveLabels> = isFr
    ? {
        idle: "Modifications enregistrées",
        saving: "Enregistrement…",
        saved: "Enregistré",
        error: "Échec de l'enregistrement",
      }
    : {
        idle: "All changes saved",
        saving: "Saving…",
        saved: "Saved",
        error: "Failed to save",
      };
  const resolvedRetryLabel = retryLabel ?? (isFr ? "Réessayer" : "Retry");
  const statusLabel = labels?.[status] ?? DEFAULT_LABELS[status];
  const role = status === "error" ? "alert" : "status";

  // Heure relative de la dernière sauvegarde (rendu uniquement sur idle/saved).
  const relativeTime = (() => {
    if (!lastSaved) return "";
    const date = lastSaved instanceof Date ? lastSaved : new Date(lastSaved);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, "second");
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute");
    const diffHour = Math.round(diffMin / 60);
    if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, "hour");
    const diffDay = Math.round(diffHour / 24);
    return rtf.format(-diffDay, "day");
  })();
  const showRelative = (status === "saved" || status === "idle") && relativeTime !== "";

  return (
    <div
      {...rest}
      className={classNames("st-autosave", `st-autosave--${status}`, className)}
      role={role}
      aria-live="polite"
    >
      <span className="st-autosave__icon" aria-hidden="true">
        {status === "saving" ? (
          <span className="st-autosave__spinner">
            <LoaderCircle size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        ) : status === "saved" ? (
          <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
        ) : status === "error" ? (
          <CircleAlert size={16} strokeWidth={2} aria-hidden="true" />
        ) : null}
      </span>
      <span className="st-autosave__label">{statusLabel}</span>
      {showRelative ? <span className="st-autosave__time">{relativeTime}</span> : null}
      {status === "error" && onRetry ? (
        <button type="button" className="st-autosave__retry" onClick={() => onRetry?.()}>
          {resolvedRetryLabel}
        </button>
      ) : null}
    </div>
  );
}
