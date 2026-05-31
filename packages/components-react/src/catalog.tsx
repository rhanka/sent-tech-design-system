import React from "react";
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
type ActionItem = { id?: string; label: React.ReactNode; disabled?: boolean; variant?: "default" | "danger"; onClick?: () => void };
type OptionItem = { value: string; label: React.ReactNode; disabled?: boolean };

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

function pointsFrom(values: Array<number | { x?: string | number; y?: number; value?: number }>, width: number, height: number): string {
  const ys = values.map((entry) => (typeof entry === "number" ? entry : entry.y ?? entry.value ?? 0));
  const max = Math.max(...ys, 1);
  return ys
    .map((value, index) => {
      const x = ys.length === 1 ? width / 2 : (index / (ys.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export type AccordionItem = { id?: string; title: React.ReactNode; content: React.ReactNode; disabled?: boolean };
export type AccordionProps = React.HTMLAttributes<HTMLDivElement> & {
  items: AccordionItem[];
  openIds?: string[];
  defaultOpenIds?: string[];
  allowMultiple?: boolean;
  onChange?: (openIds: string[]) => void;
};

export function Accordion({ items, openIds, defaultOpenIds = [], allowMultiple = true, onChange, className, ...rest }: AccordionProps) {
  const [open, setOpen] = useControlled(openIds, defaultOpenIds, onChange);
  const toggle = (id: string) => {
    const next = open.includes(id) ? open.filter((value) => value !== id) : allowMultiple ? [...open, id] : [id];
    setOpen(next);
  };

  return (
    <div {...rest} className={classNames("st-accordion", className)}>
      {items.map((item, index) => {
        const itemId = idFrom(item, index, "accordion");
        const isOpen = open.includes(itemId);
        const triggerId = `st-accordion-trigger-${itemId}`;
        const panelId = `st-accordion-panel-${itemId}`;
        return (
          <section key={itemId} className={classNames("st-accordion__item", isOpen && "st-accordion__item--open")}>
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
                <span className="st-accordion__title">{item.title}</span>
                <span className="st-accordion__icon" aria-hidden="true">
                  {isOpen ? "-" : "+"}
                </span>
              </button>
            </h3>
            {isOpen ? (
              <div className="st-accordion__panel" id={panelId} role="region" aria-labelledby={triggerId}>
                {node(item.content)}
              </div>
            ) : null}
          </section>
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

export type ChartDatum = { label?: string; x?: string | number; y?: number; value?: number; tone?: DataTone };
export type AreaChartDatum = ChartDatum;
export type AreaChartTone = DataTone;
export type BarChartDatum = ChartDatum;
export type BarChartTone = DataTone;
export type LineChartDatum = ChartDatum;
export type LineChartTone = DataTone;
export type DonutChartDatum = ChartDatum;
export type DonutChartTone = DataTone;
export type ScatterPlotDatum = { x: number; y: number; label?: string; tone?: DataTone };
export type ScatterPlotTone = DataTone;
export type StackedBarSegment = { label: string; value: number; tone?: DataTone };
export type StackedBarDatum = { label: string; segments: StackedBarSegment[] };
export type StackedBarTone = DataTone;

type ChartProps<T> = React.HTMLAttributes<HTMLElement> & {
  data: T[];
  label?: string;
  width?: number;
  height?: number;
};
export type AreaChartProps = ChartProps<AreaChartDatum>;
export type BarChartProps = ChartProps<BarChartDatum>;
export type DonutChartProps = ChartProps<DonutChartDatum>;
export type LineChartProps = ChartProps<LineChartDatum>;
export type ScatterPlotProps = ChartProps<ScatterPlotDatum>;
export type StackedBarChartProps = ChartProps<StackedBarDatum>;

function LinearChart({ data, label, width = 320, height = 160, className, type }: ChartProps<ChartDatum> & { type: "areaChart" | "lineChart" }) {
  const classBase = type === "areaChart" ? "st-areaChart" : "st-lineChart";
  const points = pointsFrom(data, width, height);
  const accessibleLabel = label ?? (type === "areaChart" ? "Area chart" : "Line chart");
  return (
    <figure className={classNames(classBase, className)} aria-label={accessibleLabel}>
      <span className="st-visually-hidden">{accessibleLabel}</span>
      <svg viewBox={`0 0  `} aria-hidden="true">
        <polyline className={`${classBase}__line`} points={points} fill="none" />
        {type === "areaChart" ? <polygon className="st-areaChart__area" points={`0,${height} ${points} ${width},${height}`} /> : null}
        {data.map((datum, index) => (
          <circle key={index} className={`${classBase}__dot`} cx={points.split(" ")[index]?.split(",")[0]} cy={points.split(" ")[index]?.split(",")[1]} r="4" />
        ))}
      </svg>
    </figure>
  );
}

export function AreaChart(props: ChartProps<AreaChartDatum>) {
  return <LinearChart {...props} type="areaChart" />;
}

export function LineChart(props: ChartProps<LineChartDatum>) {
  return <LinearChart {...props} type="lineChart" />;
}

export function BarChart({ data, label = "Bar chart", width = 320, height = 160, className, ...rest }: ChartProps<BarChartDatum>) {
  const max = Math.max(...data.map((datum) => datum.value ?? datum.y ?? 0), 1);
  return (
    <figure {...rest} className={classNames("st-barChart", className)} aria-label={label}>
      <span className="st-visually-hidden">{label}</span>
      <svg viewBox={`0 0  `} aria-hidden="true">
        {data.map((datum, index) => {
          const value = datum.value ?? datum.y ?? 0;
          const barWidth = width / Math.max(data.length, 1) - 8;
          const barHeight = (value / max) * height;
          return (
            <rect
              key={index}
              className={classNames("st-barChart__bar", `st-barChart__bar--${datum.tone ?? DATA_TONES[index % DATA_TONES.length]}`)}
              x={index * (barWidth + 8) + 4}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
            />
          );
        })}
      </svg>
    </figure>
  );
}

export function DonutChart({ data, label = "Donut chart", className, ...rest }: ChartProps<DonutChartDatum>) {
  const total = data.reduce((sum, datum) => sum + (datum.value ?? datum.y ?? 0), 0);
  return (
    <figure {...rest} className={classNames("st-donutChart", className)} aria-label={label}>
      <span className="st-visually-hidden">{label}</span>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        {data.map((datum, index) => (
          <circle
            key={index}
            className={classNames("st-donutChart__slice", `st-donutChart__slice--${datum.tone ?? DATA_TONES[index % DATA_TONES.length]}`)}
            cx="60"
            cy="60"
            r={36 - index * 3}
            fill="none"
            strokeWidth="8"
          />
        ))}
        <text className="st-donutChart__center" x="60" y="64" textAnchor="middle">
          {total}
        </text>
      </svg>
    </figure>
  );
}

export function ScatterPlot({ data, label = "Scatter chart", className, ...rest }: ChartProps<ScatterPlotDatum>) {
  return (
    <figure {...rest} className={classNames("st-scatterPlot", className)} aria-label={label}>
      <span className="st-visually-hidden">{label}</span>
      <svg viewBox="0 0 320 160" aria-hidden="true">
        {data.map((datum, index) => (
          <circle
            key={index}
            className={classNames("st-scatterPlot__point", `st-scatterPlot__point--${datum.tone ?? DATA_TONES[index % DATA_TONES.length]}`)}
            cx={clamp(datum.x * 24 + 24, 12, 308)}
            cy={clamp(148 - datum.y * 24, 12, 148)}
            r="5"
          >
            <title>{datum.label ?? `${datum.x}, ${datum.y}`}</title>
          </circle>
        ))}
      </svg>
    </figure>
  );
}

export function StackedBarChart({ data, label = "Stacked bar chart", className, ...rest }: ChartProps<StackedBarDatum>) {
  return (
    <figure {...rest} className={classNames("st-stackedBar", className)} aria-label={label}>
      <span className="st-visually-hidden">{label}</span>
      <svg viewBox="0 0 320 160" aria-hidden="true">
        {data.map((bar, barIndex) => {
          let x = 16;
          const total = Math.max(bar.segments.reduce((sum, segment) => sum + segment.value, 0), 1);
          return (
            <g key={bar.label} transform={`translate(0 ${barIndex * 32 + 16})`}>
              {bar.segments.map((segment, index) => {
                const width = (segment.value / total) * 220;
                const rect = (
                  <rect
                    key={segment.label}
                    className={classNames("st-stackedBar__seg", `st-stackedBar__seg--${segment.tone ?? DATA_TONES[index % DATA_TONES.length]}`)}
                    x={x}
                    y="0"
                    width={width}
                    height="20"
                  />
                );
                x += width;
                return rect;
              })}
              <text className="st-stackedBar__categoryLabel" x="250" y="15">
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
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
  actions?: React.ReactNode;
};
export function ChatMessage({ role = "assistant", status, content, timestamp, actions, children, className, ...rest }: ChatMessageProps) {
  const normalizedStatus = status === "streaming" ? "processing" : status === "error" ? "failed" : status;
  return (
    <article {...rest} className={classNames("st-chatMessage", `st-chatMessage--${role}`, normalizedStatus && `st-chatMessage--${normalizedStatus}`, className)}>
      <div className="st-chatMessage__avatar" aria-hidden="true">
        {role[0]?.toUpperCase()}
      </div>
      <div className="st-chatMessage__body">
        <div className="st-chatMessage__bubble">
          <div className="st-chatMessage__content">{children ?? content}</div>
        </div>
        {timestamp || actions ? (
          <footer className="st-chatMessage__footer">
            {timestamp ? <span className="st-chatMessage__timestamp">{timestamp}</span> : null}
            {actions ? <span className="st-chatMessage__actions">{actions}</span> : null}
          </footer>
        ) : null}
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
    <section {...rest} className={classNames("st-chatThread", className)} aria-label={rest["aria-label"] ?? "Chat thread"}>
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
          <button type="submit" className="st-button st-button--primary st-button--sm">
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
  invalid?: boolean;
};
export type CheckboxProps = ChoiceProps;
export type RadioProps = ChoiceProps;
function Choice({ type, label, helperText, invalid = false, className, ...rest }: ChoiceProps & { type: "checkbox" | "radio" }) {
  return (
    <label className={classNames("st-choice", `st-choice--${type}`, className)}>
      <input {...rest} className="st-choice__input" type={type} aria-invalid={invalid ? "true" : undefined} />
      <span className="st-choice__content">
        <span className="st-choice__label">{label}</span>
        {helperText ? <span className="st-choice__help">{helperText}</span> : null}
      </span>
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
  options: ComboboxOption[];
  value?: string;
  size?: Size;
  placeholder?: string;
  open?: boolean;
  allowCustomValue?: boolean;
  noResultsLabel?: React.ReactNode;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
};
export function Combobox({
  label,
  options,
  value,
  size = "md",
  placeholder = "Select or type",
  open: controlledOpen,
  allowCustomValue = true,
  noResultsLabel = "No results",
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
  const selectOption = (option: ComboboxOption) => {
    if (option.disabled) return;
    setInputValue(text(option.label));
    setOpen(false);
    setActiveIndex(-1);
    onSelect?.(option.value);
    onChange?.(option.value);
  };
  return (
    <div {...rest} className={classNames("st-combobox", `st-combobox--${size}`, className)}>
      {label ? <label className="st-field__label" htmlFor={inputId}>{label}</label> : null}
      <input
        id={inputId}
        className="st-combobox__control"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 && filtered[activeIndex] ? `${listId}-${filtered[activeIndex].value}` : undefined}
        placeholder={placeholder}
        value={selected?.label ? text(selected.label) : inputValue}
        onFocus={() => setOpen(true)}
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
      {selected ? <span className="st-combobox__value st-visually-hidden">{selected.label}</span> : null}
      {open ? (
        <ul id={listId} className="st-combobox__list" role="listbox" aria-label={text(label) || "Options"}>
          {filtered.length ? (
            filtered.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${option.value}`}
                className={classNames("st-combobox__option", index === activeIndex && "st-combobox__option--active", option.value === value && "st-combobox__option--selected")}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled ? "true" : undefined}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="st-combobox__empty" role="option" aria-disabled="true" aria-selected="false">{noResultsLabel}</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}

export type ContentSwitcherItem = { id?: string; value?: string; label: React.ReactNode; disabled?: boolean };
export type ContentSwitcherProps = React.HTMLAttributes<HTMLDivElement> & {
  items: ContentSwitcherItem[];
  value?: string;
  activeId?: string;
  onChange?: (value: string) => void;
  size?: Size;
};
export function ContentSwitcher({ items, value, activeId, onChange, size = "md", className, ...rest }: ContentSwitcherProps) {
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
            onClick={() => onChange?.(itemId)}
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
      <span className="st-copyButton__label">{copied ? copiedLabel : label}</span>
    </button>
  );
}

export interface DataTableColumn<R = DataTableRow> {
  key: string;
  label: React.ReactNode;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  width?: string;
  render?: (row: R, column: DataTableColumn<R>) => React.ReactNode;
}
export interface DataTableRow {
  id: string;
  [key: string]: unknown;
}
export type DataTableSelectMode = "none" | "single" | "multiple";
export interface DataTableSort {
  key: string;
  direction: "asc" | "desc";
}
export type DataTableProps<R extends DataTableRow = DataTableRow> = React.TableHTMLAttributes<HTMLTableElement> & {
  columns: Array<DataTableColumn<R>>;
  rows: R[];
  caption?: React.ReactNode;
  size?: Size;
  pageSize?: number;
  page?: number;
  totalItems?: number;
};
export function DataTable<R extends DataTableRow = DataTableRow>({ columns, rows, caption, size = "md", className, pageSize, page = 1, totalItems, ...rest }: DataTableProps<R>) {
  const visibleRows = pageSize ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;
  const total = totalItems ?? rows.length;
  return (
    <div className="st-dataTable-wrap">
      <table {...rest} className={classNames("st-dataTable", `st-dataTable--${size}`, className)}>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key} className={classNames(column.align === "center" && "st-dataTable__cell--center", column.align === "end" && "st-dataTable__cell--end")}>
                  {column.render?.(row, column) ?? text(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pageSize ? <div className="st-dataTable__pagerStatus">{`${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} of ${total}`}</div> : null}
    </div>
  );
}

export type DatePickerRange = { start?: string | Date | null; end?: string | Date | null };
export type DatePickerProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  value?: string;
  range?: DatePickerRange;
  size?: Size;
};
export function DatePicker({ label, value, size = "md", className, ...rest }: DatePickerProps) {
  return (
    <div {...rest} className={classNames("st-datepicker", `st-datepicker--${size}`, className)}>
      <Field label={label}>{(inputId) => <input id={inputId} className="st-control st-datepicker__control" type="date" defaultValue={value} />}</Field>
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
export type DropdownProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  options: DropdownOption[];
  value?: string;
  open?: boolean;
  placeholder?: React.ReactNode;
  onSelect?: (value: string) => void;
};
export function Dropdown({ label = "Select", options, value, open: controlledOpen, placeholder = "Select", onSelect, className, ...rest }: DropdownProps) {
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
    onSelect?.(option.value);
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

export type FileUploadStatus = "idle" | "uploading" | "complete" | "error";
export type FileUploadItem = { id?: string; name: string; size?: number; status?: FileUploadStatus; error?: React.ReactNode };
export type FileUploaderProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  items?: FileUploadItem[];
  disabled?: boolean;
};
export function FileUploader({ label = "Upload", items = [], disabled = false, className, ...rest }: FileUploaderProps) {
  return (
    <div {...rest} className={classNames("st-fileUploader-field", className)}>
      <div className={classNames("st-fileUploader__dropzone", disabled && "st-fileUploader__dropzone--disabled")}>
        <span className="st-fileUploader__trigger">{label}</span>
        <input className="st-fileUploader__input" type="file" disabled={disabled} aria-label={text(label)} />
      </div>
      <ul className="st-fileUploader__list">
        {items.map((item, index) => (
          <li key={item.id ?? item.name ?? index} className={classNames("st-fileUploader__item", item.status && `st-fileUploader__item--${item.status}`)}>
            <span className="st-fileUploader__itemName st-fileUploader__name">{item.name}</span>
            {item.error ? <span className="st-fileUploader__itemError">{item.error}</span> : null}
          </li>
        ))}
      </ul>
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

export type ForceGraphTone = DataTone;
export type ForceGraphNode = { id: string; label?: string; group?: string | number; tone?: ForceGraphTone; weight?: number; fx?: number; fy?: number };
export type ForceGraphEdge = { source: string; target: string; relation?: string; weak?: boolean };
export type ForceGraphProps = React.HTMLAttributes<HTMLElement> & {
  nodes: ForceGraphNode[];
  edges: ForceGraphEdge[];
  label?: string;
  selectedIds?: string[];
  focusId?: string | null;
  onSelect?: (id: string) => void;
  onOpenEntity?: (id: string) => void;
};
export function ForceGraph({ nodes, edges, label = "Force graph", selectedIds = [], focusId = null, onSelect, onOpenEntity, className, ...rest }: ForceGraphProps) {
  return (
    <figure {...rest} className={classNames("st-forceGraph st-forceGraph--static", className)} aria-label={label}>
      <span className="st-visually-hidden">{label}</span>
      <svg viewBox="0 0 360 220" aria-hidden="true">
        <g className="st-forceGraph__edges">
          {edges.map((edge, index) => (
            <line key={`${edge.source}-${edge.target}-${index}`} className={classNames("st-forceGraph__edge", edge.weak && "st-forceGraph__edge--weak")} x1="40" y1={40 + index * 20} x2="260" y2={80 + index * 20} />
          ))}
        </g>
        <g className="st-forceGraph__nodes">
          {nodes.map((graphNode, index) => {
            const x = graphNode.fx ?? 48 + (index % 5) * 64;
            const y = graphNode.fy ?? 56 + Math.floor(index / 5) * 56;
            return (
              <g key={graphNode.id} className={classNames("st-forceGraph__node", `st-forceGraph__node--${graphNode.tone ?? DATA_TONES[index % DATA_TONES.length]}`, selectedIds.includes(graphNode.id) && "st-forceGraph__node--selected", focusId === graphNode.id && "st-forceGraph__node--focus")} tabIndex={0} onClick={() => onSelect?.(graphNode.id)} onDoubleClick={() => onOpenEntity?.(graphNode.id)}>
                <circle className="st-forceGraph__dot" cx={x} cy={y} r={8 * (graphNode.weight ?? 1)} />
                <text className="st-forceGraph__label" x={x + 12} y={y + 4}>
                  {graphNode.label ?? graphNode.id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </figure>
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
      <legend className="st-form-group__legend st-formGroup__legend">{legend}</legend>
      {helperText ? <p className="st-form-group__help st-formGroup__help">{helperText}</p> : null}
      <div className="st-form-group__body st-formGroup__body">{children}</div>
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
export function IconButton({ size = "md", variant = "secondary", type = "button", className, children, ...rest }: IconButtonProps) {
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
export function InlineLoading({ label = "Loading", status = "active", className, ...rest }: InlineLoadingProps) {
  return (
    <div {...rest} className={classNames("st-inlineLoading", `st-inlineLoading--${status}`, className)}>
      <span className="st-inlineLoading__spinner" aria-hidden="true" />
      <span className="st-inlineLoading__label">{label}</span>
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
  muted?: boolean;
  standalone?: boolean;
  disabled?: boolean;
};
export function Link({ muted = false, standalone = false, disabled = false, className, children, ...rest }: LinkProps) {
  return (
    <a {...rest} className={classNames("st-link", muted && "st-link--muted", standalone && "st-link--standalone", disabled && "st-link--disabled", className)} aria-disabled={disabled || undefined}>
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
export type MenuDividerItem = { type: "divider"; id?: string };
export type MenuGroupItem = { type: "group"; id?: string; label: React.ReactNode; items: MenuActionItem[] };
export type MenuItem = MenuActionItem | MenuDividerItem | MenuGroupItem;
function isDivider(item: MenuItem): item is MenuDividerItem {
  return "type" in item && item.type === "divider";
}
function isGroup(item: MenuItem): item is MenuGroupItem {
  return "type" in item && item.type === "group";
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
          return (
            <section key={item.id ?? index} className="st-menu__group">
              <h3>{item.label}</h3>
              {item.items.map((child) => (
                <button key={child.id ?? text(child.label)} type="button" role="menuitem" className="st-menu__item" disabled={child.disabled} onClick={() => onSelect?.(child)} onKeyDown={(event) => handleItemKeyDown(event, child)}>
                  <span className="st-menu__itemLabel">{child.label}</span>
                </button>
              ))}
            </section>
          );
        }
        return (
          <button key={item.id ?? text(item.label) ?? index} type="button" role="menuitem" disabled={item.disabled} className={classNames("st-menu__item", item.variant === "danger" && "st-menu__item--danger")} onClick={() => onSelect?.(item)} onKeyDown={(event) => handleItemKeyDown(event, item)}>
            <span className="st-menu__itemLabel">{item.label}</span>
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

export type MenuTriggerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { open?: boolean };
export function MenuTriggerButton({ open = false, type = "button", className, children, ...rest }: MenuTriggerButtonProps) {
  return (
    <button {...rest} type={type} className={classNames("st-menuTriggerButton st-button st-button--secondary st-button--sm", className)} aria-expanded={open}>
      {children}
    </button>
  );
}

export type MessageActionVariant = "default" | "danger";
export type MessageAction = ActionItem & { variant?: MessageActionVariant };
export type MessageActionsProps = React.HTMLAttributes<HTMLElement> & {
  actions: MessageAction[];
  visibility?: "always" | "hover";
};
export function MessageActions({ actions, visibility = "always", className, ...rest }: MessageActionsProps) {
  return (
    <nav {...rest} className={classNames("st-messageActions", visibility === "hover" && "st-messageActions--hoverOnly", className)} aria-label="Message actions">
      {actions.map((action, index) => (
        <button key={action.id ?? index} type="button" className={classNames("st-button st-button--ghost st-button--sm", action.variant === "danger" && "st-button--danger")} disabled={action.disabled} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </nav>
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
            x
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
export type MultiSelectProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  options: MultiSelectOption[];
  value?: string[];
  values?: string[];
  size?: Size;
  open?: boolean;
  onChange?: (values: string[]) => void;
};
export function MultiSelect({ label, options, value, values, size = "md", open: controlledOpen, onChange, className, ...rest }: MultiSelectProps) {
  const reactId = React.useId();
  const listId = `st-multiSelect-list-${reactId}`;
  const [open, setOpen] = useControlled(controlledOpen, false);
  const [selectedValues, setSelectedValues] = useControlled(value ?? values, value ?? values ?? [], onChange);
  const selected = new Set(selectedValues);
  const selectedOptions = options.filter((option) => selected.has(option.value));
  const toggleOption = (option: MultiSelectOption) => {
    if (option.disabled) return;
    const next = selected.has(option.value)
      ? selectedValues.filter((entry) => entry !== option.value)
      : [...selectedValues, option.value];
    setSelectedValues(next);
    setOpen(false);
  };

  return (
    <div {...rest} className={classNames("st-multiSelect", `st-multiSelect--${size}`, className)}>
      {label ? <span className="st-field__label">{label}</span> : null}
      <button
        type="button"
        className="st-multiSelect__trigger"
        aria-label={text(label) || "Select options"}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
      >
        {label ? <span className="st-multiSelect__triggerLabel">{label}</span> : null}
        <span className="st-multiSelect__tags">
          {selectedOptions.length ? selectedOptions.map((option) => (
            <span key={option.value} className="st-multiSelect__tag">
              <span className="st-multiSelect__tagLabel">{option.label}</span>
            </span>
          )) : <span className="st-multiSelect__placeholder">Select</span>}
        </span>
      </button>
      {open ? (
        <ul id={listId} className="st-multiSelect__list" role="listbox" aria-label={text(label) || "Options"} aria-multiselectable="true">
          {options.map((option) => (
            <li
              key={option.value}
              className={classNames("st-multiSelect__option", selected.has(option.value) && "st-multiSelect__option--selected")}
              role="option"
              aria-selected={selected.has(option.value)}
              aria-disabled={option.disabled ? "true" : undefined}
              tabIndex={option.disabled ? undefined : 0}
              onClick={() => toggleOption(option)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleOption(option);
                }
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export type NumberInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  size?: Size;
};
export function NumberInput({ label, helperText, errorText, size = "md", className, ...rest }: NumberInputProps) {
  return (
    <Field label={label} helperText={helperText} errorText={errorText} className={classNames("st-numberInput", `st-numberInput--${size}`, className)}>
      {(inputId, isInvalid) => <input {...rest} id={inputId} className="st-control st-numberInput__control" type="number" aria-invalid={isInvalid ? "true" : undefined} />}
    </Field>
  );
}

export type OrderedListItem = { label: React.ReactNode; children?: OrderedListInput[] };
export type OrderedListInput = React.ReactNode | OrderedListItem;
export type OrderedListProps = React.OlHTMLAttributes<HTMLOListElement> & { items: OrderedListInput[] };
function renderListItem(item: OrderedListInput, index: number, ordered: boolean): React.ReactNode {
  if (typeof item === "object" && item !== null && "label" in (item as OrderedListItem)) {
    const cast = item as OrderedListItem;
    return (
      <li key={index} className={ordered ? "st-orderedList__item" : "st-unorderedList__item"}>
        {cast.label}
        {cast.children ? (ordered ? <OrderedList items={cast.children} /> : <UnorderedList items={cast.children} />) : null}
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
    <ol {...rest} className={classNames("st-orderedList st-ol", className)}>
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
      <button type="button" className="st-overflowMenu__trigger" aria-expanded={open} onClick={() => setOpen(!open)}>
        {label}
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

export type PaginationNavProps = React.HTMLAttributes<HTMLElement> & {
  page?: number;
  totalPages?: number;
  previousHref?: string;
  nextHref?: string;
};
export function PaginationNav({ page = 1, totalPages = 1, previousHref, nextHref, className, ...rest }: PaginationNavProps) {
  return (
    <nav {...rest} className={classNames("st-paginationNav", className)} aria-label="Pagination navigation">
      {previousHref ? <a href={previousHref}>Previous</a> : <button type="button" disabled={page <= 1}>Previous</button>}
      <ol className="st-paginationNav__list">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
          <li key={item}>
            <button type="button" className={classNames("st-paginationNav__page", item === page && "st-paginationNav__page--active")}>
              Page {item}
            </button>
          </li>
        ))}
      </ol>
      {nextHref ? <a href={nextHref}>Next</a> : <button type="button" disabled={page >= totalPages}>Next</button>}
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
    <Field label={label} helperText={helperText} errorText={errorText} className={classNames("st-passwordInput", `st-passwordInput--${size}`, className)}>
      {(inputId, isInvalid) => (
        <span className="st-passwordInput__control">
          <input {...rest} id={inputId} className="st-control" type={shown ? "text" : "password"} aria-invalid={isInvalid ? "true" : undefined} />
          <button type="button" className="st-passwordInput__toggle" onClick={() => setShown((next) => !next)}>
            {shown ? "Hide" : "Show"}
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
  value?: number;
  max?: number;
  tone?: Tone;
  size?: Size;
  indeterminate?: boolean;
};
export function ProgressBar({ label, value = 0, max = 100, tone = "neutral", size = "md", indeterminate = false, className, ...rest }: ProgressBarProps) {
  const percent = pct(value, 0, max);
  return (
    <div {...rest} className={classNames("st-progressBar", className)}>
      {label ? <div className="st-progressBar__label">{label}</div> : null}
      <div className={classNames("st-progressBar__track", `st-progressBar__track--${tone}`, `st-progressBar__track--${size}`, indeterminate && "st-progressBar__track--indeterminate")} role="progressbar" aria-valuenow={indeterminate ? undefined : value} aria-valuemin={0} aria-valuemax={max}>
        <div className="st-progressBar__fill" style={{ width: indeterminate ? undefined : `${percent}%` }} />
      </div>
      <span className="st-progressBar__value">{Math.round(percent)}%</span>
    </div>
  );
}

export type ProgressIndicatorStatus = "complete" | "current" | "disabled" | "invalid" | "incomplete";
export interface ProgressIndicatorItem {
  id?: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  status?: ProgressIndicatorStatus;
}
export type ProgressIndicatorProps = React.OlHTMLAttributes<HTMLOListElement> & {
  items: ProgressIndicatorItem[];
  orientation?: "horizontal" | "vertical";
};
export function ProgressIndicator({ items, orientation = "horizontal", className, ...rest }: ProgressIndicatorProps) {
  return (
    <ol {...rest} className={classNames("st-progressIndicator", `st-progressIndicator--${orientation}`, className)}>
      {items.map((item, index) => (
        <li key={item.id ?? index} className={classNames("st-progressIndicator__step", `st-progressIndicator__step--${item.status ?? "incomplete"}`)}>
          <span className="st-progressIndicator__indicator">{item.status === "complete" ? "✓" : index + 1}</span>
          <span className="st-progressIndicator__text">
            <span className="st-progressIndicator__label">{item.label}</span>
            {item.description ? <span className="st-progressIndicator__description">{item.description}</span> : null}
          </span>
        </li>
      ))}
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
  onClear?: () => void;
};
export function Search({ label, size = "md", onClear, className, ...rest }: SearchProps) {
  const reactId = React.useId();
  const inputId = rest.id ?? `st-search-${reactId}`;
  return (
    <div className={classNames("st-search", `st-search--${size}`, className)}>
      {label ? <label className="st-field__label" htmlFor={inputId}>{label}</label> : null}
      <span className="st-search__icon" aria-hidden="true">⌕</span>
      <input {...rest} id={inputId} className="st-search__control st-search__input" type="search" />
      {onClear ? <button type="button" className="st-search__clear" onClick={onClear}>Clear</button> : null}
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

export type SkeletonTextProps = React.HTMLAttributes<HTMLDivElement> & { lines?: number; label?: string };
export function SkeletonText({ lines = 3, label = "Loading", className, ...rest }: SkeletonTextProps) {
  return (
    <div {...rest} className={classNames("st-skeleton", className)} aria-label={label}>
      <span className="st-visually-hidden">{label}</span>
      {Array.from({ length: lines }, (_, index) => <span key={index} className={classNames("st-skeleton__line", index === 0 && "st-skeleton__line--heading")} />)}
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

export type SliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: React.ReactNode;
  size?: Size;
};
export function Slider({ label, size = "md", value, defaultValue, min = 0, max = 100, className, ...rest }: SliderProps) {
  const numeric = Number(value ?? defaultValue ?? 0);
  return (
    <div className={classNames("st-slider", `st-slider--${size}`, className)}>
      <div className="st-slider__header">
        {label ? <label className="st-field__label">{label}</label> : null}
        <span className="st-slider__value">{numeric}</span>
      </div>
      <input {...rest} className="st-slider__input" type="range" min={min} max={max} defaultValue={defaultValue} value={value} />
    </div>
  );
}

export type SparklineProps = React.HTMLAttributes<HTMLElement> & { data: number[]; label?: string; tone?: "neutral" | "success" | "warning" | "error" };
export function Sparkline({ data, label = "Sparkline", tone = "neutral", className, ...rest }: SparklineProps) {
  return (
    <figure {...rest} className={classNames("st-sparkline", `st-sparkline--${tone}`, className)} aria-label={label}>
      <span className="st-visually-hidden">{label}</span>
      <svg viewBox="0 0 120 40" aria-hidden="true">
        <polyline className="st-sparkline__line" points={pointsFrom(data, 120, 40)} fill="none" />
      </svg>
    </figure>
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
export type TabsProps = React.HTMLAttributes<HTMLElement> & {
  items: TabItem[];
  activeValue?: string;
  activeId?: string;
  label?: string;
  onChange?: (value: string) => void;
};
export function Tabs({ items, activeValue, activeId, label = "Tabs", onChange, className, ...rest }: TabsProps) {
  const reactId = React.useId();
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const first = items.find((item) => !item.disabled) ?? items[0];
  const [current, setCurrent] = useControlled(activeValue ?? activeId, idFrom(first ?? {}, 0, "tab"), onChange);
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

export type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  size?: "sm" | "md";
  disabled?: boolean;
  onDismiss?: () => void;
};
export function Tag({ tone = "neutral", size = "md", disabled = false, onDismiss, className, children, ...rest }: TagProps) {
  return (
    <span {...rest} className={classNames("st-tag", `st-tag--${tone}`, `st-tag--${size}`, disabled && "st-tag--disabled", className)}>
      <span className="st-tag__label">{children}</span>
      {onDismiss ? <button type="button" className="st-tag__dismiss" onClick={onDismiss}>x</button> : null}
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
export type TileProps = React.HTMLAttributes<HTMLElement> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: TileVariant;
  selected?: boolean;
  disabled?: boolean;
};
export function Tile({ title, description, variant = "static", selected = false, disabled = false, children, className, ...rest }: TileProps) {
  return (
    <section {...rest} className={classNames("st-tile", `st-tile--${variant}`, selected && "st-tile--selected", disabled && "st-tile--disabled", className)}>
      <div className="st-tile__content">
        {title ? <h3 className="st-tile__title">{title}</h3> : null}
        {description ? <p className="st-tile__description">{description}</p> : null}
        {children}
      </div>
    </section>
  );
}

export interface TileGroupItem {
  value: string;
  title: React.ReactNode;
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
              <span className="st-tileGroup__label">{item.title}</span>
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
  helperText?: React.ReactNode;
  size?: "sm" | "md";
};
export function Toggle({ label, helperText, size = "md", className, ...rest }: ToggleProps) {
  return (
    <label className={classNames("st-toggle", `st-toggle--${size}`, className)}>
      <span className="st-toggle__row">
        <span className="st-toggle__label">{label}</span>
        <input {...rest} className="st-toggle__input" type="checkbox" role="switch" aria-checked={rest.checked ?? rest.defaultChecked ?? undefined} />
        <span className="st-toggle__track"><span className="st-toggle__thumb" /></span>
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
export type TreeViewProps = React.HTMLAttributes<HTMLDivElement> & {
  nodes: TreeNode[];
  selectedId?: string;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
};
function TreeRows({ nodes, expanded, selectedId }: { nodes: TreeNode[]; expanded: Set<string>; selectedId?: string }) {
  return (
    <>
      {nodes.map((treeNode) => (
        <div key={treeNode.id}>
          <div className={classNames("st-treeView__row", treeNode.id === selectedId && "st-treeView__row--selected", treeNode.disabled && "st-treeView__row--disabled")}>
            <span className={classNames("st-treeView__caret", !treeNode.children?.length && "st-treeView__caret--leaf", expanded.has(treeNode.id) && "st-treeView__caret--open")}>›</span>
            <span className="st-treeView__label">{treeNode.label}</span>
          </div>
          {treeNode.children?.length && expanded.has(treeNode.id) ? <TreeRows nodes={treeNode.children} expanded={expanded} selectedId={selectedId} /> : null}
        </div>
      ))}
    </>
  );
}
export function TreeView({ nodes, selectedId, expandedIds, defaultExpandedIds = [], className, ...rest }: TreeViewProps) {
  const expanded = new Set(expandedIds ?? defaultExpandedIds);
  return (
    <div {...rest} className={classNames("st-treeView", className)} role="tree">
      <TreeRows nodes={nodes} expanded={expanded} selectedId={selectedId} />
    </div>
  );
}

export type UnorderedListItem = { label: React.ReactNode; children?: UnorderedListInput[] };
export type UnorderedListInput = React.ReactNode | UnorderedListItem;
export type UnorderedListProps = React.HTMLAttributes<HTMLUListElement> & { items: UnorderedListInput[] };
export function UnorderedList({ items, className, ...rest }: UnorderedListProps) {
  return (
    <ul {...rest} className={classNames("st-unorderedList", className)}>
      {items.map((item, index) => renderListItem(item, index, false))}
    </ul>
  );
}
