# Principes Motion — Sent Tech

- Utiliser des micro-animations seulement si elles améliorent la compréhension (état de chargement, progression, hiérarchisation du contexte).
- Par défaut, les changements visuels doivent être discrets et limités à 80–140ms.
- Toujours fournir une branche respectant `prefers-reduced-motion: reduce` pour chaque animation/transition.
- Éviter les easings élastiques, rebonds et accelerations inutiles.
- Les transitions doivent être stables visuellement en cas d’interruption (pas de drift ni de flicker).
