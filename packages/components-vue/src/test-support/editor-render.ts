import { afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick, type Component } from "vue";

// These editor adapter witnesses deliberately share the Svelte suite's DOM
// assertions. This small shim changes only mounting, flushing and cleanup.
const mounted = new Map<VueWrapper, HTMLElement>();

afterEach(() => {
  for (const [wrapper, container] of mounted) {
    wrapper.unmount();
    container.remove();
  }
  mounted.clear();
});

export function render(component: Component, options: { props?: object } = {}) {
  const container = document.createElement("div");
  document.body.append(container);
  const wrapper = mount(component, {
    props: options.props,
    attachTo: container,
  });
  mounted.set(wrapper, container);
  return {
    container,
    component: wrapper.vm,
    async rerender(props: object) {
      await wrapper.setProps(props);
      await nextTick();
    },
    unmount() {
      wrapper.unmount();
      mounted.delete(wrapper);
      container.remove();
    },
  };
}

function keyboard(type: string) {
  return async (element: Element, init: KeyboardEventInit = {}) => {
    const result = element.dispatchEvent(
      new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init }),
    );
    await nextTick();
    return result;
  };
}

function mouse(type: string) {
  return async (element: Element, init: MouseEventInit = {}) => {
    const result = element.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, ...init }),
    );
    await nextTick();
    return result;
  };
}

export const fireEvent = {
  keyDown: keyboard("keydown"),
  keyUp: keyboard("keyup"),
  click: mouse("click"),
  mouseDown: mouse("mousedown"),
  mouseUp: mouse("mouseup"),
};
