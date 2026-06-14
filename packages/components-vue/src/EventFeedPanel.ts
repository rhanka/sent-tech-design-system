import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type EventFeedPanelSeverity = "info" | "success" | "warning" | "error" | (string & {});

export type EventFeedPanelEvent = {
  /** Horodatage en millisecondes epoch (ou tout nombre croissant). */
  at: number;
  /** Catégorie libre de l'événement (« deploy », « alert »…). */
  type: string;
  /** Sévérité : pilote la couleur/pastille (sémantique feedback). */
  severity: EventFeedPanelSeverity;
  /** Message principal affiché. */
  message: string;
};

export type EventFeedPanelProps = {
  data: EventFeedPanelEvent[];
  label?: string;
  maxHeight?: number;
  height?: number;
  class?: string;
};

const KNOWN_SEVERITIES = ["info", "success", "warning", "error"];

function severityTone(severity: string): string {
  return KNOWN_SEVERITIES.includes(severity) ? severity : "neutral";
}

function formatTime(at: number): string {
  if (!Number.isFinite(at)) return "";
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return String(at);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const EventFeedPanel = defineComponent({
  name: "EventFeedPanel",
  props: {
    data: { type: Array as () => EventFeedPanelEvent[], default: () => [] },
    label: { type: String, default: undefined },
    maxHeight: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const data = props.data ?? [];
      const label = props.label;

      const items = data
        .filter((d) => d && Number.isFinite(d.at) && typeof d.message === "string")
        .map((d, index) => ({
          index,
          datum: d,
          tone: severityTone(String(d.severity)),
          time: formatTime(d.at),
        }))
        .sort((a, b) => b.datum.at - a.datum.at);

      const resolvedMaxHeight = props.maxHeight ?? props.height;
      const scrollStyle =
        typeof resolvedMaxHeight === "number" && Number.isFinite(resolvedMaxHeight)
          ? { maxHeight: `${resolvedMaxHeight}px` }
          : undefined;

      const children = [];
      if (label) {
        children.push(h("p", { class: "st-eventFeedPanel__label", id: "st-eventFeedPanel-label" }, label));
      }

      children.push(
        h(
          "ul",
          {
            class: "st-eventFeedPanel__list",
            role: "feed",
            "aria-label": label,
            "aria-busy": "false",
            style: scrollStyle,
          },
          items.map((item) =>
            h(
              "li",
              {
                key: item.index,
                class: classNames("st-eventFeedPanel__item", `st-eventFeedPanel__item--${item.tone}`),
                role: "article",
                "aria-label": `${item.datum.type} — ${item.datum.message}`,
              },
              [
                h("span", {
                  class: classNames("st-eventFeedPanel__badge", `st-eventFeedPanel__badge--${item.tone}`),
                  "aria-hidden": "true",
                }),
                h("div", { class: "st-eventFeedPanel__body" }, [
                  h("div", { class: "st-eventFeedPanel__meta" }, [
                    h("span", { class: "st-eventFeedPanel__type" }, item.datum.type),
                    h("time", { class: "st-eventFeedPanel__time" }, item.time),
                  ]),
                  h("p", { class: "st-eventFeedPanel__message" }, item.datum.message),
                ]),
              ],
            ),
          ),
        ),
      );

      return h("div", { ...attrs, class: classNames("st-eventFeedPanel", props.class) }, children);
    };
  },
});
