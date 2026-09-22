// Rendu serveur (svelte/server) de la variante courante : montre ce que le HTML porte avant hydratation.
import { render } from 'svelte/server';
import App from './App.svelte';
export const html = () => render(App).body;
