import { svelteTesting } from "@testing-library/svelte/vite";
import { mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, {
  plugins: [svelteTesting()],
  test: {
    // Paquets Angular en compilation partielle : Vitest doit les faire passer
    // par Vite (et donc par le linker) au lieu de les laisser à Node tels quels.
    server: { deps: { inline: [/[\\/]node_modules[\\/]@angular[\\/](?:common|platform-browser)[\\/]/] } }
  }
});
