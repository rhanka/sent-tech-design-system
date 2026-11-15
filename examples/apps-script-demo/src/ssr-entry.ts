// Server-side render used by the smoke check only (no browser, no DOM).
import { render } from "svelte/server";
import App from "./App.svelte";

export const renderApp = (): string => render(App).body;
