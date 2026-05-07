# Relay Prompt For sentech-forge

Use this prompt in `../sentech-forge`.

```text
Tu travailles dans `../sentech-forge`.

Objectif: faire l'integration Sent Tech Design System en mode low-coupling CSS/tokens seulement. Ne remplace pas encore les composants Forge par les composants Svelte du design system.

Contexte:
- Le design system est dans `../sent-tech-design-system`.
- Le theme CSS Forge genere est `../sent-tech-design-system/packages/themes/css/forge.css`.
- La doc d'integration est `../sent-tech-design-system/docs/integration/forge-low-coupling.md`.
- Le repo design system public est `https://github.com/rhanka/sent-tech-design-system`.

Approche recommandee:
1. Inspecte rapidement la structure de Forge: framework, entry CSS/global, layout root, conventions de styles existantes.
2. Copie `../sent-tech-design-system/packages/themes/css/forge.css` dans un fichier Forge source, par exemple `src/lib/styles/sent-tech-forge-theme.css` ou l'emplacement equivalent selon la structure.
3. Importe ce CSS une seule fois dans l'entree globale Forge.
4. Ajoute `data-st-theme="forge"` sur le root app le plus haut possible. Si le root Svelte n'est pas evident, utilise `document.documentElement` ou le conteneur principal.
5. Ajoute un bridge CSS minimal uniquement la ou c'est evident:
   - surfaces: `--st-semantic-surface-default`, `--st-semantic-surface-subtle`, `--st-semantic-surface-raised`
   - texte: `--st-semantic-text-primary`, `--st-semantic-text-secondary`
   - action primaire: `--st-semantic-action-primary`, `--st-semantic-action-primaryText`
   - bordures/focus: `--st-semantic-border-subtle`, `--st-semantic-border-interactive`
6. Ne change pas la structure des ecrans et ne remplace aucun composant dans cette passe.
7. Lance les checks/tests disponibles dans Forge.
8. Commit atomiquement avec un message du type `feat(ui): add sent tech theme bridge`.

Contraintes:
- Communication en francais.
- Ne pas introduire de dependance npm publiee pour cette premiere passe.
- Ne pas exposer de secret ni de details client.
- Si le CSS existant Forge est trop specifique, limite la PR au theme import + attribut root + 2 ou 3 mappings CSS non risques.

Statut final attendu:
- Fait
- Reste a faire (%)
- Attendus avec alternatives concretes et recommandation
```
