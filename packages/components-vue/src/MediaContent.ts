import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type MediaKind = "image" | "video";

export type MediaContentProps = {
  title?: string;
  caption?: string;
  byline?: string;
  media?: string;
  mediaAlt?: string;
  mediaKind?: MediaKind;
  mediaControls?: boolean;
  aspectRatio?: string;
  mediaCaptions?: string;
  mediaCaptionsLabel?: string;
  mediaCaptionsLang?: string;
  class?: string;
};

const DEFAULT_CAPTIONS = "data:text/vtt,WEBVTT";

export const MediaContent = defineComponent({
  name: "MediaContent",
  props: {
    title: { type: String, default: undefined },
    caption: { type: String, default: undefined },
    byline: { type: String, default: undefined },
    media: { type: String, default: undefined },
    mediaAlt: { type: String, default: "" },
    mediaKind: { type: String as () => MediaKind, default: "image" },
    mediaControls: { type: Boolean, default: true },
    aspectRatio: { type: String, default: "16/9" },
    mediaCaptions: { type: String, default: undefined },
    mediaCaptionsLabel: { type: String, default: "Français" },
    mediaCaptionsLang: { type: String, default: "fr" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const hasMedia = Boolean(props.media?.trim());
      const mediaNode = hasMedia
        ? props.mediaKind === "video"
          ? h(
              "video",
              {
                controls: props.mediaControls,
                src: props.media,
                "aria-label": props.title || "Contenu média",
                preload: "metadata",
              },
              h("track", {
                kind: "captions",
                src: props.mediaCaptions ?? DEFAULT_CAPTIONS,
                srclang: props.mediaCaptionsLang,
                label: props.mediaCaptionsLabel,
                default: true,
              }),
            )
          : h("img", { src: props.media, alt: props.mediaAlt, loading: "lazy", decoding: "async" })
        : slots.default?.();

      const hasCaption = props.title || props.caption || props.byline;
      return h("figure", { ...attrs, class: classNames("st-mediaContent", props.class) }, [
        h(
          "div",
          { class: "st-mediaContent__media", style: { "--st-mediaContent-ratio": props.aspectRatio } },
          mediaNode,
        ),
        hasCaption
          ? h("figcaption", { class: "st-mediaContent__caption" }, [
              props.title ? h("p", { class: "st-mediaContent__title" }, props.title) : null,
              props.caption ? h("p", null, props.caption) : null,
              props.byline ? h("p", { class: "st-mediaContent__byline" }, props.byline) : null,
            ])
          : null,
      ]);
    };
  },
});
