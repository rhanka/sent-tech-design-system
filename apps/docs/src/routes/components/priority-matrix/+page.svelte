<script lang="ts">
  import { Badge, PriorityMatrix, type PriorityMatrixDatum } from "@sentropic/design-system-svelte";

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
      (0–100 pts), quatre quadrants teintés séparés par deux seuils en pointillés.
      Chaque point porte une étiquette placée par
      <code>placePriorityLabels</code> (<code>@sentropic/dataviz-core</code>,
      recuit simulé déterministe) : sans chevauchement, sans recouvrement de
      point, dans le cadre, avec trait de rappel vers le point.
    </p>
  </section>

  <section class="docs-section">
    <h2>Exemple</h2>
    <div class="docs-matrix-box">
      <PriorityMatrix label="Matrice de priorisation démo" {data} />
    </div>
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
      <code>x</code> (complexité) et <code>y</code> (valeur) sur 0–100 ;
      <code>label</code> affiché sur une ou deux lignes dans une boîte à bordure ;
      <code>tone</code> cycle sinon dans la palette data-vis.
      Quadrants : <em>Gains rapides</em>, <em>Projets majeurs</em>,
      <em>Attendre</em>, <em>Ne pas faire</em>. Parité
      Svelte / React / Vue / Angular, styles par tokens, aucun attribut
      <code>style</code> littéral.
    </p>
  </section>
</div>

<style>
  :global(.docs-matrix-box) { max-width: 44rem; }
</style>
