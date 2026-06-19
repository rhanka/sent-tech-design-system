import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type FooterLink = { label: unknown; href: string };
export type FooterColumn = { title?: unknown; links: FooterLink[] };

export type FooterProps = {
  brand?: unknown;
  columns?: FooterColumn[];
  links?: FooterLink[];
  legalLinks?: FooterLink[];
  copyright?: unknown;
  class?: string;
};

export const Footer = defineComponent({
  name: "Footer",
  props: {
    brand: { type: [String, Object] as unknown as () => unknown, default: undefined },
    columns: { type: Array as () => FooterColumn[], default: undefined },
    links: { type: Array as () => FooterLink[], default: undefined },
    legalLinks: { type: Array as () => FooterLink[], default: undefined },
    copyright: { type: [String, Object] as unknown as () => unknown, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const groups: FooterColumn[] =
        props.columns ?? (props.links ? [{ links: props.links }] : []);
      const hasTop = props.brand || slots.brand || groups.length > 0;
      const hasBottom = props.copyright || (props.legalLinks && props.legalLinks.length > 0);

      return h(
        "footer",
        {
          ...attrs,
          class: classNames("st-footer", props.class),
        },
        [
          hasTop
            ? h("div", { class: "st-footer__top" }, [
                props.brand
                  ? h("div", { class: "st-footer__brand" }, props.brand as string)
                  : slots.brand
                    ? h("div", { class: "st-footer__brand" }, slots.brand())
                    : null,
                h(
                  "div",
                  { class: "st-footer__columns" },
                  groups.map((group, index) =>
                    h("nav", { key: index }, [
                      group.title ? h("h2", group.title as string) : null,
                      ...group.links.map((link) =>
                        h("a", { key: link.href, href: link.href }, link.label as string),
                      ),
                    ]),
                  ),
                ),
              ])
            : null,
          hasBottom
            ? h("div", { class: "st-footer__bottom" }, [
                props.copyright
                  ? h("span", { class: "st-footer__copyright" }, props.copyright as string)
                  : null,
                props.legalLinks && props.legalLinks.length > 0
                  ? h(
                      "nav",
                      { class: "st-footer__legal", "aria-label": "Legal links" },
                      props.legalLinks.map((link) =>
                        h("a", { key: link.href, href: link.href }, link.label as string),
                      ),
                    )
                  : null,
              ])
            : null,
        ],
      );
    };
  },
});
