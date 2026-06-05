import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { Sparkline } from "./Sparkline.js";

export type KpiCardSize = "sm" | "md" | "lg";
export type KpiCardTrend = "up" | "down" | "flat";
export type KpiCardFormat = "number" | "currency" | "percent";
export type KpiCardDeltaFormat = "percent" | "absolute";
export type KpiCardTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type KpiCardProps = {
  /**
   * Valeur principale. Si `format="percent"`, `value` est une FRACTION (0–1) :
   * passer `0.42` affiche « 42 % » (Intl multiplie par 100). Le formatage ne
   * s'applique qu'aux `number` ; une `string` est rendue telle quelle.
   */
  value: number | string;
  label: string;
  /**
   * Variation. En `deltaFormat="percent"` (défaut), `delta` est une FRACTION :
   * `0.12` → « +12 % ». NaN/Infinity sont rendus inertes.
   */
  delta?: number;
  deltaFormat?: KpiCardDeltaFormat;
  trend?: KpiCardTrend;
  format?: KpiCardFormat;
  unit?: string;
  currency?: string;
  locale?: string;
  sparkline?: number[];
  size?: KpiCardSize;
  tone?: KpiCardTone;
  class?: string;
};

export const KpiCard = defineComponent({
  name: "KpiCard",
  props: {
    value: { type: [Number, String] as unknown as () => number | string, required: true },
    label: { type: String, required: true },
    delta: { type: Number, default: undefined },
    deltaFormat: { type: String as () => KpiCardDeltaFormat, default: "percent" },
    trend: { type: String as () => KpiCardTrend, default: undefined },
    format: { type: String as () => KpiCardFormat, default: "number" },
    unit: { type: String, default: undefined },
    currency: { type: String, default: "EUR" },
    locale: { type: String, default: undefined },
    sparkline: { type: Array as () => number[], default: undefined },
    size: { type: String as () => KpiCardSize, default: "md" },
    tone: { type: String as () => KpiCardTone, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const value = props.value;
      const label = props.label;
      const delta = props.delta;
      const deltaFormat = props.deltaFormat ?? "percent";
      const format = props.format ?? "number";
      const unit = props.unit;
      const currency = props.currency ?? "EUR";
      const locale = props.locale;
      const sparkline = props.sparkline;
      const size = props.size ?? "md";
      const tone = props.tone;

      const resolvedTrend: KpiCardTrend | undefined =
        props.trend ?? (delta == null ? undefined : delta > 0 ? "up" : delta < 0 ? "down" : "flat");

      let formattedValue: string;
      if (typeof value === "string") {
        formattedValue = value;
      } else if (!Number.isFinite(value)) {
        // Jamais de « NaN »/« ∞ » dans le DOM ni l'aria.
        formattedValue = "—";
      } else if (format === "currency") {
        // Un code devise invalide fait lever Intl ; on retombe sur le nombre brut.
        try {
          formattedValue = new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
        } catch {
          formattedValue = new Intl.NumberFormat(locale).format(value);
        }
      } else if (format === "percent") {
        formattedValue = new Intl.NumberFormat(locale, {
          style: "percent",
          maximumFractionDigits: 2,
        }).format(value);
      } else {
        formattedValue = new Intl.NumberFormat(locale).format(value);
      }

      let formattedDelta: string | undefined;
      if (delta != null && Number.isFinite(delta)) {
        const sign = delta > 0 ? "+" : "";
        if (deltaFormat === "percent") {
          const pct = new Intl.NumberFormat(locale, {
            style: "percent",
            maximumFractionDigits: 1,
          }).format(delta);
          formattedDelta = `${sign}${pct}`;
        } else {
          formattedDelta = `${sign}${new Intl.NumberFormat(locale).format(delta)}`;
        }
      }

      const sparklineTone =
        resolvedTrend === "up" ? "success" : resolvedTrend === "down" ? "error" : "neutral";

      const arrow =
        resolvedTrend === "up"
          ? "M3 8.5 7 4l4 4.5"
          : resolvedTrend === "down"
            ? "M3 5.5 7 10l4-4.5"
            : "M3 7h8";

      const trendLabel =
        resolvedTrend === "up"
          ? "en hausse"
          : resolvedTrend === "down"
            ? "en baisse"
            : resolvedTrend === "flat"
              ? "stable"
              : undefined;

      // L'unité est redondante quand le format est déjà autosuffisant.
      const ariaUnit = format === "currency" || format === "percent" ? undefined : unit;
      const ariaLabel = [
        label,
        formattedValue,
        ariaUnit,
        formattedDelta && `${formattedDelta} ${trendLabel ?? ""}`.trim(),
      ]
        .filter(Boolean)
        .join(", ");

      const classes = classNames(
        "st-kpiCard",
        `st-kpiCard--${size}`,
        tone && `st-kpiCard--${tone}`,
        tone && "st-kpiCard--toned",
        props.class,
      );

      const valueChildren: ReturnType<typeof h>[] = [
        h("span", { class: "st-kpiCard__number" }, formattedValue),
      ];
      if (unit) {
        valueChildren.push(h("span", { class: "st-kpiCard__unit" }, unit));
      }

      const footerChildren: ReturnType<typeof h>[] = [];
      if (formattedDelta) {
        footerChildren.push(
          h(
            "span",
            {
              class: `st-kpiCard__delta st-kpiCard__delta--${resolvedTrend ?? "flat"}`,
              "aria-hidden": "true",
            },
            [
              h(
                "svg",
                {
                  class: "st-kpiCard__arrow",
                  width: "14",
                  height: "14",
                  viewBox: "0 0 14 14",
                  "aria-hidden": "true",
                  focusable: "false",
                },
                [
                  h("path", {
                    d: arrow,
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "1.75",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                  }),
                ],
              ),
              h("span", { class: "st-kpiCard__deltaValue" }, formattedDelta),
            ],
          ),
        );
      }
      if (sparkline && sparkline.length > 0) {
        footerChildren.push(
          h(Sparkline, {
            class: "st-kpiCard__sparkline",
            data: sparkline,
            tone: sparklineTone,
            area: true,
          }),
        );
      }

      const labelChildren: ReturnType<typeof h>[] = [];
      if (tone) {
        labelChildren.push(h("span", { class: "st-kpiCard__swatch", "aria-hidden": "true" }));
      }
      labelChildren.push(h("span", { class: "st-kpiCard__labelText" }, label));

      const children: ReturnType<typeof h>[] = [
        h("p", { class: "st-kpiCard__label" }, labelChildren),
        h("p", { class: "st-kpiCard__value" }, valueChildren),
      ];
      if (formattedDelta || sparkline) {
        children.push(h("div", { class: "st-kpiCard__footer" }, footerChildren));
      }

      return h(
        "article",
        { ...attrs, class: classes, role: "group", "aria-label": ariaLabel },
        children,
      );
    };
  },
});
