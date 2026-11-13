// Vue source components are compiled by the Vite plugin in cross-host parity tests.
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<any>;
  export default component;
}
