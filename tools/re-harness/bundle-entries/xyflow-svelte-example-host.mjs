// Mounts one pinned @xyflow/svelte example route (+page.svelte, compiled
// with the pinned svelte compiler) inside the layout of the example app:
// svelte/src/app.html (#root, height 100%) > routes/examples/+layout.svelte
// (.app: flex column, height 100%; .flow: flex 1). The app header is
// navigation chrome and is not mounted.
import { mount, unmount } from "svelte";

export function mountExample(Example, container) {
  const rootEl = document.createElement("div");
  rootEl.id = "root";
  rootEl.style.height = "100%";
  const app = document.createElement("div");
  app.style.cssText = "display:flex;flex-direction:column;height:100%";
  const flow = document.createElement("div");
  flow.style.cssText = "flex:1";
  app.appendChild(flow);
  rootEl.appendChild(app);
  container.appendChild(rootEl);
  const instance = mount(Example, { target: flow });
  return { unmount: () => unmount(instance) };
}
