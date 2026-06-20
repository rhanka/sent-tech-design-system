import { defineComponent, h, type PropType } from "vue";
import { classNames } from "./classNames.js";

export type DashboardNavItem = { label: string; href: string; active?: boolean };
export type DashboardKpi = { label: string; value: string; delta?: string };

export type DashboardProps = {
  appTitle?: string;
  pageTitle: string;
  navItems?: DashboardNavItem[];
  kpis?: DashboardKpi[];
  class?: string;
};

export const Dashboard = defineComponent({
  name: "Dashboard",
  props: {
    appTitle: { type: String, default: undefined },
    pageTitle: { type: String, required: true },
    navItems: { type: Array as PropType<DashboardNavItem[]>, default: () => [] },
    kpis: { type: Array as PropType<DashboardKpi[]>, default: () => [] },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h("div", { ...attrs, class: classNames("st-dashboard", props.class) }, [
        h("div", { class: "st-dashboard__layout" }, [
          h("aside", { class: "st-dashboard__aside" }, [
            props.appTitle ? h("div", { class: "st-dashboard__app-title" }, props.appTitle) : null,
            h(
              "nav",
              { class: "st-sidenav" },
              (props.navItems ?? []).map((item) =>
                h(
                  "a",
                  {
                    key: item.href,
                    href: item.href,
                    class: classNames("st-sidenav__item", item.active ? "st-sidenav__item--active" : undefined),
                  },
                  item.label,
                ),
              ),
            ),
          ]),
          h("main", { class: "st-dashboard__main" }, [
            h("div", { class: "st-dashboard__titlebar" }, [
              h("h1", { class: "st-dashboard__title" }, props.pageTitle),
            ]),
            (props.kpis ?? []).length > 0
              ? h(
                  "div",
                  { class: "st-dashboard__kpi-row" },
                  (props.kpis ?? []).map((kpi, i) =>
                    h("div", { key: i, class: "st-kpi-card" }, [
                      h("span", { class: "st-kpi-card__label" }, kpi.label),
                      h("span", { class: "st-kpi-card__value" }, kpi.value),
                      kpi.delta ? h("span", { class: "st-kpi-card__delta" }, kpi.delta) : null,
                    ]),
                  ),
                )
              : null,
            h("div", { class: "st-dashboard__content" }, slots.default ? slots.default() : []),
          ]),
        ]),
      ]);
  },
});
