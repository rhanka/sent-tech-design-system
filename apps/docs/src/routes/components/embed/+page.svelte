<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démo décrite en arbre NodeSpec neutre -> rendue dans le framework actif.
  const presentationDemo: NodeSpec[] = [
    {
      comp: "Embed",
      props: {
        src: "https://www.openstreetmap.org/export/embed.html?bbox=2.29%2C48.85%2C2.31%2C48.86&layer=mapnik",
        title: "Carte du quartier",
        aspectRatio: "16/9"
      }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Structure</p>
    <div class="docs-hero-title">
      <h1>Embed</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      <code>Embed</code> est un wrapper <code>&lt;iframe&gt;</code> contrôlé : ratio fixe, chargement
      paresseux et <code>sandbox</code> strict par défaut. Le <code>title</code> est obligatoire
      (accessibilité). Idéal pour intégrer carte, vidéo ou widget externe.
    </p>
  </section>
  <TriRender nodes={getExample("embed")?.nodes ?? []} label="Aperçu live" />

  <section class="docs-section" id="Introduction">
    <h2>Présentation</h2>
    <TriRender nodes={presentationDemo} label="Embed" />
  </section>

  <section class="docs-section" id="API">
    <h2>API</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Par défaut</th>
          <th>Effet</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>src</code></td>
          <td><code>string</code></td>
          <td>obligatoire</td>
          <td>URL du document intégré.</td>
        </tr>
        <tr>
          <td><code>title</code></td>
          <td><code>string</code></td>
          <td>obligatoire</td>
          <td>Nom accessible du cadre (requis a11y).</td>
        </tr>
        <tr>
          <td><code>sandbox</code></td>
          <td><code>string</code></td>
          <td><code>""</code></td>
          <td>Liste de jetons sandbox ; ajoutez des permissions seulement au cas par cas.</td>
        </tr>
        <tr>
          <td><code>aspectRatio</code></td>
          <td><code>string</code></td>
          <td><code>"16/9"</code></td>
          <td>Proportion du conteneur (CSS <code>aspect-ratio</code>).</td>
        </tr>
        <tr>
          <td><code>allow</code></td>
          <td><code>string</code></td>
          <td>non défini</td>
          <td>Politique de permissions (ex. <code>fullscreen</code>).</td>
        </tr>
        <tr>
          <td><code>loading</code></td>
          <td><code>"lazy" | "eager"</code></td>
          <td><code>"lazy"</code></td>
          <td>Stratégie de chargement de l’iframe.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section" id="Accessibilité">
    <h2>Accessibilité</h2>
    <ul class="docs-token-list">
      <li>Le <code>title</code> de l’iframe est obligatoire : il nomme le cadre pour les lecteurs d’écran.</li>
      <li><code>sandbox=""</code> applique le bac à sable le plus strict ; les permissions doivent être explicites.</li>
      <li><code>loading="lazy"</code> évite de charger le contenu hors écran ; utilisez <code>eager</code> pour un embed visible immédiatement.</li>
    </ul>
  </section>
</div>
