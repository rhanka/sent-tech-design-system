# Retour utilisateur 29/05 — portage & exhaustivité (en cours)

Captures à l'appui (banc /compare DSFR). La fidélité métrique (96,1 %) masque des écarts
VISUELS réels car le banc ne mesurait que certains états/variants. Chantiers lancés en bg.

| # | Point utilisateur | Détail | Chantier | Statut |
|---|---|---|---|---|
| G1 | **Bouton secondaire faux** | DSFR officiel = fond **transparent + bordure bleue** ; nous = fond bleu clair rempli. La métrique ne comparait que le primaire. | A (fidélité variants) | 🟦 bg |
| G2 | **Onglets** | DSFR : onglet actif avec accent + onglet inactif fond bleu clair + filet bas du groupe ; épaisseur des traits. Notre rendu diffère. | A | 🟦 bg |
| G3 | **Épaisseur des traits** | bordures/filets pas à la bonne épaisseur par endroits. | A | 🟦 bg |
| G4 | **Centrage « brouillon »** | alignement/centrage des cellules du banc incohérent (peut-être non lié au DS mais fait négligé). | B (banc) | 🟦 bg |
| G5 | **Banc /compare trop court** | doit comporter BEAUCOUP plus de composants + variants/états pour voir le vrai portage. | B | 🟦 bg |
| G6 | **Police IBM Plex Carbon** | ne charge pas la bonne police à tous les endroits (Carbon). | D (police) | 🟦 bg |
| G7 | **Header complet à porter** | (a) dans le switch de thème, (b) dans le menu header il devrait y avoir le **header complet** ; surprenant qu'il manque. | C (header) | 🟦 bg |
| G8 | **Connexion header — mode ID** | pas de mode sélectionné/arbitré pour l'identité (icône carrée sans nom). | C | 🟦 bg |
| G9 | **Pages de présentation composants** | s'inspirer VRAIMENT de Carbon & DSFR docs ; pas assez exhaustif. | E (docs exhaustivité) | ⬜ en file |

## Chantiers parallèles (worktrees isolés, push main, verify vert)
- **A — Fidélité visuelle** : bouton secondaire DSFR (transparent+bordure), onglets actif/inactif, épaisseurs ; + Carbon. Oracle `tools/compare/fidelity.mjs`.
- **B — Banc /compare exhaustif + centrage** : +composants & +variants/états mesurés, centrage propre. (Lancé après A pour partager l'oracle/port 4322.)
- **C — Header complet** : header dans le switch de thème + header complet dans la doc ; mode ID sélectionné (fin de l'icône carrée sans nom).
- **D — Police IBM Plex** : chargement global Carbon (toutes pages).
- **E — Exhaustivité des pages composants** (inspiration Carbon/DSFR) : en file (gros chantier, après C/D pour éviter collisions docs).

> Règles : per-thème (base intacte), additif, verify vert avant push, oracle pour la fidélité, jamais port 5173, pas de publish sans go (les paquets 0.10.1/0.2.1 sont déjà live ; un re-bump éventuel attendra le regroupement de ces correctifs).
