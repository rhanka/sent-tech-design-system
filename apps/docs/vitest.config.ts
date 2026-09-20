import { svelteTesting } from "@testing-library/svelte/vite";
import { mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, { plugins: [svelteTesting()] });
