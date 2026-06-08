import { defineComponent, h, ref } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { classNames } from "./classNames.js";

// Compteur module pour un id de <select> stable, déterministe et SSR-safe.
let languageToggleIdCounter = 0;

export type LanguageToggleLocale = "fr" | "en";

export type LanguageToggleProps = {
  locale?: LanguageToggleLocale;
  frLabel?: string;
  enLabel?: string;
  /** Libellé du sélecteur (associé via <label for> + aria-label). */
  label?: string;
  /** Id du <select> ; auto-généré et stable si non fourni. */
  selectId?: string;
  variant?: "select" | "accordion";
  accordionLabel?: string;
  class?: string;
};

function ChevronDownIcon(open: boolean) {
  return h(ChevronDown, {
    size: 16,
    "aria-hidden": "true",
    class: classNames(
      "st-languageToggle__chevron",
      open && "st-languageToggle__chevron--open",
    ),
  });
}

export const LanguageToggle = defineComponent({
  name: "LanguageToggle",
  props: {
    locale: { type: String as () => LanguageToggleLocale, default: "fr" },
    frLabel: { type: String, default: "FR" },
    enLabel: { type: String, default: "EN" },
    label: { type: String, default: "Langue" },
    selectId: { type: String, default: undefined },
    variant: { type: String as () => "select" | "accordion", default: "select" },
    accordionLabel: { type: String, default: "Langue" },
    class: { type: String, default: undefined },
  },
  emits: ["localeChange"],
  setup(props, { emit }) {
    const open = ref(false);
    const resolvedSelectId = props.selectId ?? `st-languageToggle-${++languageToggleIdCounter}`;
    const choose = (next: LanguageToggleLocale) => emit("localeChange", next);

    return () => {
      if (props.variant === "accordion") {
        return h("div", { class: classNames("st-languageToggle", props.class) }, [
          h(
            "button",
            {
              type: "button",
              class: "st-languageToggle__accordionTrigger",
              "aria-expanded": open.value ? "true" : "false",
              onClick: () => (open.value = !open.value),
            },
            [h("span", props.accordionLabel), ChevronDownIcon(open.value)],
          ),
          open.value
            ? h("div", { class: "st-languageToggle__accordionPanel" }, [
                h(
                  "button",
                  {
                    type: "button",
                    class: classNames(
                      "st-languageToggle__option",
                      props.locale === "fr" && "st-languageToggle__option--active",
                    ),
                    "aria-current": props.locale === "fr" ? "true" : "false",
                    onClick: () => choose("fr"),
                  },
                  props.frLabel,
                ),
                h(
                  "button",
                  {
                    type: "button",
                    class: classNames(
                      "st-languageToggle__option",
                      props.locale === "en" && "st-languageToggle__option--active",
                    ),
                    "aria-current": props.locale === "en" ? "true" : "false",
                    onClick: () => choose("en"),
                  },
                  props.enLabel,
                ),
              ])
            : null,
        ]);
      }

      return [
        h(
          "label",
          {
            class: "st-visually-hidden st-languageToggle__srLabel",
            for: resolvedSelectId,
          },
          props.label,
        ),
        h(
          "select",
          {
            id: resolvedSelectId,
            class: classNames("st-languageToggle__select", props.class),
            value: props.locale,
            "aria-label": props.label,
            onChange: (event: Event) =>
              choose((event.target as HTMLSelectElement).value as LanguageToggleLocale),
          },
          [
            h("option", { value: "fr" }, props.frLabel),
            h("option", { value: "en" }, props.enLabel),
          ],
        ),
      ];
    };
  },
});
