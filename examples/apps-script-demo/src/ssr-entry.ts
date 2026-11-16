// Server-side render used by the smoke check only (no browser, no DOM).
import { render } from "svelte/server";
import App from "./App.svelte";

export type InitialTab = "dossier" | "evaluation";
export const renderApp = (initialTab: InitialTab): string => render(App, { props: { initialTab } }).body;
