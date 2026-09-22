import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { angularLinker } from "./angular-linker";

export default defineConfig({
  plugins: [angularLinker(), sveltekit()]
});
