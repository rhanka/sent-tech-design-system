import { defineComponent, h, ref, watch, onUnmounted, nextTick, Teleport } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type DropdownOption = {
  value: string;
  label: unknown;
  disabled?: boolean;
};

// In addition to the Vue-native `@select` emit, an `onSelect` callback prop
// (React/Svelte parity) is accepted; both fire on selection.
export type DropdownProps = {
  label?: string;
  options: DropdownOption[];
  value?: string;
  open?: boolean;
  locale?: string;
  placeholder?: string;
  onSelect?: (value: string) => void;
  class?: string;
};

export const Dropdown = defineComponent({
  name: "Dropdown",
  props: {
    label: { type: String, default: undefined },
    options: { type: Array as () => DropdownOption[], required: true },
    value: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    locale: { type: String, default: "fr-FR" },
    placeholder: { type: String, default: undefined },
    onSelect: { type: Function as unknown as () => (value: string) => void, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["select", "update:open"],
  setup(props, { emit, attrs }) {
    const localOpen = ref(false);
    const localValue = ref(props.value ?? "");
    const hostRef = ref<HTMLElement | null>(null);
    const buttonRef = ref<HTMLButtonElement | null>(null);
    const listRef = ref<HTMLElement | null>(null);
    const listPos = ref({ top: 0, left: 0, width: 0 });

    const isOpen = () => props.open !== undefined ? props.open : localOpen.value;
    const selected = () => props.options.find((opt) => opt.value === (props.value ?? localValue.value));

    const updateListPos = () => {
      const rect = buttonRef.value?.getBoundingClientRect();
      if (!rect) return;
      listPos.value = { top: rect.bottom + 4, left: rect.left, width: rect.width };
    };

    const setOpen = (val: boolean) => {
      if (props.open === undefined) localOpen.value = val;
      emit("update:open", val);
      if (val) nextTick(updateListPos);
    };

    const selectOption = (option: DropdownOption) => {
      if (option.disabled) return;
      localValue.value = option.value;
      setOpen(false);
      // `emit("select")` already routes to an `onSelect` handler prop (Vue maps
      // emitted events to their `onX` listeners), so calling `props.onSelect`
      // here as well would fire the callback twice. Emit only.
      emit("select", option.value);
    };

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && !hostRef.value?.contains(target) && !listRef.value?.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen()) {
        event.preventDefault();
        setOpen(false);
      }
    };
    const onScroll = () => { if (isOpen()) updateListPos(); };

    watch(
      () => isOpen(),
      (open) => {
        if (open) {
          nextTick(updateListPos);
          document.addEventListener("mousedown", onMouseDown);
          window.addEventListener("keydown", onKeyDown);
          window.addEventListener("scroll", onScroll, true);
          window.addEventListener("resize", onScroll);
        } else {
          document.removeEventListener("mousedown", onMouseDown);
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("scroll", onScroll, true);
          window.removeEventListener("resize", onScroll);
        }
      },
      { immediate: true },
    );

    onUnmounted(() => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    });

    return () => {
      const isFr = (props.locale ?? "fr-FR").toLowerCase().startsWith("fr");
      const resolvedLabel = props.label ?? (isFr ? "Sélectionner" : "Select");
      const resolvedPlaceholder = props.placeholder ?? (isFr ? "Sélectionner" : "Select");
      const open = isOpen();
      const sel = selected();

      const list = open
        ? h(
            Teleport,
            { to: "body" },
            h(
              "div",
              {
                ref: listRef,
                class: "st-dropdown__list",
                role: "listbox",
                "aria-label": resolvedLabel,
                style: { top: `${listPos.value.top}px`, left: `${listPos.value.left}px`, minWidth: `${listPos.value.width}px` },
              },
              props.options.map((option) =>
                h(
                  "button",
                  {
                    key: option.value,
                    type: "button",
                    role: "option",
                    class: "st-dropdown__option",
                    disabled: option.disabled,
                    "aria-disabled": option.disabled ? "true" : undefined,
                    "aria-selected": option.value === (props.value ?? localValue.value),
                    onClick: () => selectOption(option),
                  },
                  option.label as string,
                ),
              ),
            ),
          )
        : null;

      return h(
        "div",
        {
          ...attrs,
          ref: hostRef,
          class: classNames("st-dropdown", props.class),
        },
        [
          h(
            "button",
            {
              ref: buttonRef,
              type: "button",
              class: "st-dropdown__button",
              "aria-haspopup": "listbox",
              "aria-expanded": open,
              onClick: () => setOpen(!open),
            },
            [
              h("span", { class: "st-dropdown__label" }, resolvedLabel),
              ": ",
              h("span", { class: "st-dropdown__value" }, sel ? (sel.label as string) : resolvedPlaceholder),
              h(ChevronDown, {
                class: classNames("st-dropdown__icon", open && "st-dropdown__icon--open"),
                size: 18,
                strokeWidth: 2.25,
                "aria-hidden": "true",
              }),
            ],
          ),
          list,
        ],
      );
    };
  },
});
