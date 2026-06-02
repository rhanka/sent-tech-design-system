import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type HeaderNavItem = { label: unknown; href: string };
export type HeaderAccount = { name?: string; email?: string; avatarUrl?: string };

export type HeaderProps = {
  brand?: unknown;
  title?: unknown;
  navigation?: HeaderNavItem[];
  navItems?: HeaderNavItem[];
  account?: HeaderAccount;
  sticky?: boolean;
  class?: string;
};

export function deriveInitials(name?: string): string {
  return (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export const Header = defineComponent({
  name: "Header",
  props: {
    brand: { type: [String, Object] as unknown as () => unknown, default: undefined },
    title: { type: [String, Object] as unknown as () => unknown, default: undefined },
    navigation: { type: Array as () => HeaderNavItem[], default: undefined },
    navItems: { type: Array as () => HeaderNavItem[], default: undefined },
    account: { type: Object as () => HeaderAccount, default: undefined },
    sticky: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const links = props.navigation ?? props.navItems ?? [];

      return h(
        "header",
        {
          ...attrs,
          class: classNames(
            "st-header",
            props.sticky && "st-header--sticky",
            props.class,
          ),
        },
        [
          h("div", { class: "st-header__leading" }, [
            props.brand
              ? h("a", { class: "st-header__logo", href: "/" }, props.brand as string)
              : slots.brand
                ? h("a", { class: "st-header__logo", href: "/" }, slots.brand())
                : null,
            props.title
              ? h("span", { class: "st-header__title" }, props.title as string)
              : null,
          ]),
          h(
            "nav",
            { class: "st-header__navigation" },
            links.map((link) =>
              h("a", { key: link.href, href: link.href }, link.label as string),
            ),
          ),
          props.account
            ? h("div", { class: "st-header__account" }, [
                h(
                  "span",
                  { class: "st-header__avatar st-header__avatar--initials" },
                  deriveInitials(props.account.name),
                ),
                h(
                  "span",
                  { class: "st-header__account-name" },
                  props.account.name,
                ),
                props.account.email
                  ? h(
                      "span",
                      { class: "st-header__account-email" },
                      props.account.email,
                    )
                  : null,
              ])
            : null,
        ],
      );
    };
  },
});
