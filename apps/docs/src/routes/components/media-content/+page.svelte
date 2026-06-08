<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »).
  const presentationDemo: NodeSpec[] = [
    {
      comp: "MediaContent",
      props: {
        title: "Exemple vidéo",
        caption: "Vue d’ensemble d’un écran de travail.",
        media: "https://picsum.photos/seed/media-content/900/500",
        mediaAlt: "Aperçu d’un produit",
        mediaKind: "image",
        byline: "© Banque d’images exemple"
      }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Structure</p>
    <div class="docs-hero-title">
      <h1>MediaContent</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      <code>MediaContent</code> encapsule un média (image ou vidéo) avec une légende typée DS,
      utile pour les blocs éditoriaux enrichis (capture, infographie, illustration, vidéo).
    </p>
  </section>
  <TriRender nodes={getExample("mediacontent")?.nodes ?? []} label="Aperçu live" />


  <section class="docs-section" id="Introduction">
    <h2>Présentation</h2>
    <TriRender nodes={presentationDemo} label="MediaContent" />
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
          <td><code>media</code></td>
          <td><code>string</code></td>
          <td>obligatoire</td>
          <td>URL du média principal (image/vidéo).</td>
        </tr>
        <tr>
          <td><code>mediaKind</code></td>
          <td><code>&quot;image&quot; | &quot;video&quot;</code></td>
          <td><code>&quot;image&quot;</code></td>
          <td>Détermine le mode de rendu du média.</td>
        </tr>
        <tr>
          <td><code>mediaAlt</code></td>
          <td><code>string</code></td>
          <td><code>""</code></td>
          <td>Texte alternatif (image) / étiquette (vidéo).</td>
        </tr>
        <tr>
          <td><code>aspectRatio</code></td>
          <td><code>string</code></td>
          <td><code>&quot;16/9&quot;</code></td>
          <td>Forçage de la proportion d’affichage.</td>
        </tr>
        <tr>
          <td><code>title</code></td>
          <td><code>string</code></td>
          <td><code>« sans titre »</code></td>
          <td>Titre dans la légende figure.</td>
        </tr>
        <tr>
          <td><code>caption</code></td>
          <td><code>string</code></td>
          <td><code>« sans caption »</code></td>
          <td>Légende visible sous le média.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section" id="Accessibilité">
    <h2>Accessibilité</h2>
    <ul class="docs-token-list">
      <li>Le média image expose <code>alt</code> explicite.</li>
      <li>La vidéo peut définir son propre label pour les assistances.</li>
      <li>Le texte de légende <code>figcaption</code> reste lisible indépendamment du média.</li>
    </ul>
  </section>
</div>
