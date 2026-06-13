# Principes Empilement (z-index) — Sent Tech

- Hiérarchie d'empilement explicite et unique, du plus bas au plus haut : contenu < toast/notification < menu/popover < drawer/modal < palette/commande.
- Aucun z-index « magique » isolé dans un composant : chaque surface flottante se positionne par rapport à cette échelle, pas par essais successifs.
- Un toast ne doit jamais masquer le menu ou le popover qui l'a déclenché ; un menu/popover ne doit jamais passer au-dessus d'un drawer ou d'une modale.
- La palette de recherche / commande est la surface la plus haute (elle recouvre le chrome thématisé sans le laisser fuiter).
- Les valeurs vivent dans le contrat de tokens (jamais en dur dans le composant) afin que les thèmes et adaptateurs tenant restent cohérents.
