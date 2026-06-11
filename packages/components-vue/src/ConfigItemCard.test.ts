import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { ConfigItemCard } from "./ConfigItemCard.js";

const mounted: VueWrapper[] = [];
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

describe("ConfigItemCard", () => {
  it("renders name, key and description with a stable test id", () => {
    const wrapper = track(
      mount(ConfigItemCard, {
        props: {
          item: {
            id: "1",
            name: "Agent de tri",
            key: "triage-agent",
            description: "Classe les demandes entrantes.",
            sourceLevel: "user",
            parentId: null,
          },
        },
      }),
    );
    const root = wrapper.find(".st-configItemCard");
    expect(root.exists()).toBe(true);
    expect(root.element.tagName.toLowerCase()).toBe("article");
    expect(root.attributes("data-testid")).toBe("config-item-card-triage-agent");
    expect(wrapper.find(".st-configItemCard__name").text()).toBe("Agent de tri");
    expect(wrapper.find(".st-configItemCard__key").text()).toBe("triage-agent");
    expect(wrapper.find(".st-configItemCard__description").text()).toBe(
      "Classe les demandes entrantes.",
    );
  });

  it("shows the système badge for code/admin and personnalisé for copied", () => {
    const w1 = track(
      mount(ConfigItemCard, {
        props: { item: { id: "1", name: "Sys", sourceLevel: "code", parentId: null } },
      }),
    );
    expect(w1.find(".st-configItemCard__badge--system").exists()).toBe(true);

    const w2 = track(
      mount(ConfigItemCard, {
        props: { item: { id: "2", name: "Copie", sourceLevel: "user", parentId: "1" } },
      }),
    );
    expect(w2.find(".st-configItemCard__badge--custom").exists()).toBe(true);
  });

  it("system item shows only Copier and hides it when hasCopy is true", async () => {
    const onCopy = vi.fn();
    const wrapper = track(
      mount(ConfigItemCard, {
        props: {
          item: { id: "1", name: "Sys", sourceLevel: "admin", parentId: null },
          onCopy,
        },
      }),
    );
    expect(wrapper.find('[aria-label="Copier"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Éditer"]').exists()).toBe(false);
    await wrapper.find('[aria-label="Copier"]').trigger("click");
    expect(onCopy).toHaveBeenCalledWith("1");

    await wrapper.setProps({ hasCopy: true });
    expect(wrapper.find('[aria-label="Copier"]').exists()).toBe(false);
  });

  it("copied item exposes Éditer and Réinitialiser, calling back with the id", async () => {
    const onEdit = vi.fn();
    const onReset = vi.fn();
    const wrapper = track(
      mount(ConfigItemCard, {
        props: {
          item: { id: "9", name: "Copie", sourceLevel: "user", parentId: "1" },
          onEdit,
          onReset,
        },
      }),
    );
    await wrapper.find('[aria-label="Éditer"]').trigger("click");
    await wrapper.find('[aria-label="Réinitialiser"]').trigger("click");
    expect(onEdit).toHaveBeenCalledWith("9");
    expect(onReset).toHaveBeenCalledWith("9");
  });

  it("user-created item exposes Éditer and Supprimer (no Réinitialiser)", async () => {
    const onDelete = vi.fn();
    const wrapper = track(
      mount(ConfigItemCard, {
        props: {
          item: { id: "3", name: "Perso", sourceLevel: "user", parentId: null },
          onEdit: vi.fn(),
          onDelete,
        },
      }),
    );
    expect(wrapper.find('[aria-label="Supprimer"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Réinitialiser"]').exists()).toBe(false);
    await wrapper.find('[aria-label="Supprimer"]').trigger("click");
    expect(onDelete).toHaveBeenCalledWith("3");
  });

  it("disables every action button when disabled and renders slot content", () => {
    const wrapper = track(
      mount(ConfigItemCard, {
        props: {
          item: { id: "3", name: "Perso", sourceLevel: "user", parentId: null },
          onEdit: vi.fn(),
          onDelete: vi.fn(),
          disabled: true,
        },
        slots: { default: () => h("span", { "data-testid": "extra" }, "extra") },
      }),
    );
    const buttons = wrapper.findAll(".st-configItemCard__action");
    expect(buttons.length).toBe(2);
    buttons.forEach((b) => expect((b.element as HTMLButtonElement).disabled).toBe(true));
    expect(wrapper.find('[data-testid="extra"]').exists()).toBe(true);
  });
});
