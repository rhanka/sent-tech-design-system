<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, type PriorityMatrixDatum } from "@sentropic/design-system-svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const data: PriorityMatrixDatum[] = [
    { x: 18, y: 82, label: "Auth SSO" },
    { x: 20, y: 80, label: "SSO SAML" },
    { x: 22, y: 79, label: "MFA" },
    { x: 68, y: 72, label: "Exports CSV" },
    { x: 70, y: 70, label: "Export PDF" },
    { x: 71, y: 69, label: "API webhooks" },
    { x: 30, y: 30, label: "Thème sombre" },
    { x: 32, y: 28, label: "Mode offline" },
    { x: 85, y: 15, label: "Chat temps réel" },
    { x: 15, y: 25, label: "Audit logs" },
    { x: 55, y: 55, label: "SSO SCIM" },
    { x: 90, y: 85, label: "IA résumés" },
    { x: 50, y: 50, label: "SSO rôles" }
  ];

  const demo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-matrix-box" },
      children: [
        {
          comp: "PriorityMatrix",
          props: { label: "Matrice de priorisation démo", data }
        }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <div class="docs-hero-title">
      <h1>PriorityMatrix</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Matrice de priorisation 2×2 : complexité en abscisse, valeur en ordonnée
      (0 à 100 pts), quatre quadrants teintés séparés par deux seuils en pointillés.
      Chaque point porte une étiquette placée par un recuit simulé déterministe
      (même algorithme que <code>placePriorityLabels</code> de
      <code>@sentropic/dataviz-core</code>, dupliqué dans chaque paquet DS pour
      ne pas créer de dépendance entre couches) : le placement évite les
      chevauchements de boîtes, le recouvrement des points, la sortie de cadre
      ainsi que le masquage des seuils et des noms de quadrant, sur la base du
      meilleur effort, sans garantie (voir Limites).
    </p>
  </section>

  <section class="docs-section">
    <h2>Exemple</h2>
    <TabbedExample nodes={demo} title="Matrice de priorisation démo" />
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>PriorityMatrixDatum[]</code></td><td>requis</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>requis (a11y)</td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td><code>Matrice de priorisation</code></td></tr>
        <tr><td><code>xLabel</code> / <code>yLabel</code></td><td><code>string</code></td><td><code>Complexité (0-100 pts)</code> / <code>Valeur (0-100 pts)</code></td></tr>
        <tr><td><code>xThreshold</code> / <code>yThreshold</code></td><td><code>number</code></td><td><code>50</code> / <code>50</code></td></tr>
        <tr><td><code>width</code> / <code>height</code></td><td><code>number</code></td><td><code>640</code> / <code>400</code></td></tr>
        <tr><td><code>radius</code></td><td><code>number</code></td><td><code>5</code></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      <code>PriorityMatrixDatum</code> = <code>{`{ x, y, label, tone? }`}</code> :
      <code>x</code> (complexité) et <code>y</code> (valeur) sur 0 à 100, bornés à
      l'affichage (les valeurs non finies retombent à l'origine du tracé et se
      lisent « N/A » dans la liste accessible, jamais « NaN ») ;
      <code>label</code> affiché sur une ou deux lignes dans une boîte à bordure ;
      <code>tone</code> cycle sinon dans la palette data-vis.
      Quadrants : <em>Gains rapides</em>, <em>Projets majeurs</em>,
      <em>Attendre</em>, <em>Ne pas faire</em> (noms fixes, sans prop, même
      convention que <code>ScatterPlot</code>). Parité
      Svelte / React / Vue / Angular, styles par tokens, aucun attribut
      <code>style</code> littéral.
    </p>
  </section>

  <section class="docs-section">
    <h2>Tokens CSS</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Variable sémantique</th><th>Emploi</th></tr>
      </thead>
      <tbody>
        <tr><td><code>--st-semantic-text-primary</code></td><td>Titre, texte des étiquettes.</td></tr>
        <tr><td><code>--st-semantic-text-secondary</code></td><td>Seuils, noms de quadrant, graduations, traits de rappel.</td></tr>
        <tr><td><code>--st-semantic-border-subtle</code></td><td>Carroyage, axes, bordure des boîtes.</td></tr>
        <tr><td><code>--st-semantic-surface-default</code></td><td>Fond opaque des boîtes d'étiquette.</td></tr>
        <tr><td><code>--st-semantic-feedback-success / info / warning</code></td><td>Teintes des quadrants (12 % via <code>color-mix</code>).</td></tr>
        <tr><td><code>--st-semantic-data-category1 … 8</code></td><td>Couleur des points (<code>tone</code>).</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>Limites documentées</h2>
    <p class="docs-demo-context">
      Le placement est un meilleur effort. Sur le jeu de référence 13 points
      (640×400) : 0 chevauchement entre boîtes, seuils et noms de quadrant
      dégagés, mais 3 points sur 13 couverts par une boîte ; les obstacles de
      seuil poussent les étiquettes sur les ancres quand la place manque. Les
      jeux denses se dégradent : 25 points, 0 chevauchement et 7 points
      couverts ; 40 points, 3 chevauchements et 15 points couverts. Tous les
      chiffres de cette section se rejouent par
      <code>node packages/dataviz-core/bench/priority-matrix-measure.mjs</code>
      (Node 22, graine 42), sauf les deux mesures de police signalées comme
      relevées en navigateur.
    </p>
    <table class="docs-table">
      <thead>
        <tr><th>Limite</th><th>Mesure</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Coût du recuit (O(n³), <code>max(1500, n×120)</code> itérations)</td>
          <td>13 pts : 1,3 ms (1 560 itérations) ; 30 : 9,1 ms ; 50 : 39,8 ms ; 80 : 151,6 ms ; 100 : 277,3 ms. La qualité s'effondre avant le temps : sur jeux denses, 3 chevauchements à 50 points, 75 à 80, 152 à 100. Plafond utile : ~30 points, ~50 au maximum. Le placement est mémoïsé une fois par changement de <em>référence</em> des entrées ; muter le tableau en place laisse le placement périmé.</td>
        </tr>
        <tr>
          <td>Boîtes estimées, pas mesurées</td>
          <td><code>12 + 7 × caractères</code>, plafonné à 120 px : modèle valable pour du latin étroit. Relevé ponctuel en navigateur (Inter 11 px, Chromium, hors harnais) : « MMMMMMMMMM » déborde de 17,7 px, « WWWWWWWWWWWW » de 26,7 px, « データ可視化の基盤 » de 24,0 px. Aucune prop ne permet de passer des boîtes mesurées, donc la garantie de non-chevauchement ne vaut que dans ce modèle.</td>
        </tr>
        <tr>
          <td>Texte agrandi à 200 %</td>
          <td>La taille en <code>rem</code> dans un <code>viewBox</code> fixe est partagée avec <code>ScatterPlot</code> ; propre au composant, l'encadré dimensionné en dur. Relevé ponctuel en navigateur (hors harnais) : à 200 %, les libellés du jeu de référence débordent de leur boîte, jusqu'à ~60 px.</td>
        </tr>
        <tr>
          <td>Taille minimale de cadre</td>
          <td>Jeu 13 points, chevauchements entre boîtes : 0 à 640×400, 1 à 480×300 et 400×250, 9 à 320×200, 35 à 200×140, 78 à 120×90 avec 12 boîtes hors tracé. Les points couverts suivent : 3/13 jusqu'à 400×250, 10/13 à 320×200, 13/13 à 120×90. Ne pas descendre sous ~480×300.</td>
        </tr>
        <tr>
          <td>Déterminisme par exécution, pas par ordre d'entrée</td>
          <td>Répétitions et SSR identiques à l'octet ; inverser le tableau d'entrée déplace 13/13 étiquettes, écart maximal 86,6 px, longueur des traits 168,5 → 221,3 px. Stabiliser l'ordre en amont si la comparabilité entre rafraîchissements compte.</td>
        </tr>
        <tr>
          <td>Noms de quadrant non configurables</td>
          <td><code>QUADRANT_NAMES</code> (4 chaînes françaises) n'a pas de prop ; seuls <code>title</code>, <code>xLabel</code>, <code>yLabel</code> sont configurables.</td>
        </tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  /* Rendu dans un composant enfant (SvelteNode) / île : style global requis. */
  :global(.docs-matrix-box) { max-width: 44rem; }
</style>
