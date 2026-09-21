import { sentTechTheme, type TenantTheme } from "@sentropic/design-system-themes";

// Vite discovers every theme workspace at build time. No category allowlist or
// second manual registry: the picker and URL validation share this catalogue.
const modules = import.meta.glob<Record<string, TenantTheme>>(
  "../../../../packages/theme-*/src/index.ts",
  { eager: true }
);

// Thèmes montrés dans le sélecteur public du site : notre thème propre et les DS
// gouvernementaux. AUCUNE marque privée, quelle que soit la publicité de sa
// documentation : toutes ne s'affichent qu'après Ctrl+Shift+X.
//
// C'est une LISTE BLANCHE, et c'est délibéré : tout thème absent d'ici est
// traité comme privé. Le reste du catalogue est constitué de clones mesurés de
// marques privées, qui ne doivent pas paraître sur le site public. Une liste
// noire laisserait un nouveau clone devenir public par simple oubli ; une liste
// blanche le garde masqué tant que personne ne l'a explicitement ouvert.
const PUBLIC_THEME_IDS: ReadonlySet<string> = new Set([
  "canada", "dsfr", "quebec", "sent-tech"
]);

// Catalogue complet : le thème maison d'abord, puis tout le reste par ordre
// alphabétique. C'est ce que montre le sélecteur ouvert par Ctrl+Shift+X.
export const THEMES: TenantTheme[] = [
  sentTechTheme,
  ...Object.entries(modules).flatMap(([path, module]) =>
    Object.entries(module)
      .filter(([name]) => name.endsWith("Theme"))
      .map(([, theme]) => theme)
      // Colour-mode variants (e.g. Airbus Dark) belong to their base theme.
      .filter((theme) => theme.id === path.split("/theme-")[1].split("/")[0])
  ).sort((a, b) => a.label.localeCompare(b.label, "fr"))
];

/** Un thème tiers ne s'atteint que par le sélecteur Ctrl+Shift+X. */
export function isPrivateTheme(id: string): boolean {
  return !PUBLIC_THEME_IDS.has(id);
}

/** Ce que voit un visiteur qui n'a pas fait Ctrl+Shift+X. */
export const PUBLIC_THEMES: TenantTheme[] = THEMES.filter((theme) => !isPrivateTheme(theme.id));

export function filterThemes(themes: readonly TenantTheme[], query: string): TenantTheme[] {
  const needle = query.trim().toLocaleLowerCase();
  return themes.filter((theme) =>
    theme.label.toLocaleLowerCase().includes(needle) || theme.id.toLocaleLowerCase().includes(needle)
  );
}
