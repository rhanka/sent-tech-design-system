<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démo décrite en arbre NodeSpec neutre -> rendue dans le framework actif.
  const presentationDemo: NodeSpec[] = [
    {
      comp: "DataImage",
      props: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 240'%3E%3Crect width='360' height='240' fill='%23eef2f7'/%3E%3Cpath d='M42 174h276L250 91l-54 63-37-43z' fill='%234e79a7'/%3E%3Ccircle cx='108' cy='82' r='24' fill='%23f28e2b'/%3E%3C/svg%3E",
        alt: "Aperçu de graphique produit",
        width: 320,
        height: 200,
        fit: "cover",
        radius: 8
      }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Structure</p>
    <div class="docs-hero-title">
      <h1>DataImage</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      <code>DataImage</code> est l’équivalent piloté par props/état de <code>MediaContent</code> :
      une <code>&lt;img&gt;</code> contrôlée (<code>src</code>, <code>alt</code> requis,
      <code>object-fit</code>, dimensions, rayon), en chargement paresseux.
    </p>
  </section>
  <FrameworkPreview example="dataimage" title="Aperçu live" />

  <section class="docs-section" id="Introduction">
    <h2>Présentation</h2>
    <FrameworkDemo nodes={presentationDemo} label="DataImage" />
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
          <td>URL de l’image.</td>
        </tr>
        <tr>
          <td><code>alt</code></td>
          <td><code>string</code></td>
          <td>obligatoire</td>
          <td>Texte alternatif (a11y). <code>""</code> = image décorative.</td>
        </tr>
        <tr>
          <td><code>fit</code></td>
          <td><code>"cover" | "contain"</code></td>
          <td><code>"cover"</code></td>
          <td>Comportement <code>object-fit</code> dans la boîte.</td>
        </tr>
        <tr>
          <td><code>width</code> / <code>height</code></td>
          <td><code>number | string</code></td>
          <td>non défini</td>
          <td>Dimensions (nombre → px, ou longueur CSS).</td>
        </tr>
        <tr>
          <td><code>radius</code></td>
          <td><code>number | string</code></td>
          <td>non défini</td>
          <td>Rayon de bordure (longueur CSS).</td>
        </tr>
        <tr>
          <td><code>loading</code></td>
          <td><code>"lazy" | "eager"</code></td>
          <td><code>"lazy"</code></td>
          <td>Stratégie de chargement de l’image.</td>
        </tr>
        <tr>
          <td><code>decoding</code></td>
          <td><code>"async" | "sync" | "auto"</code></td>
          <td><code>"async"</code></td>
          <td>Indice de décodage transmis au navigateur.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section" id="Accessibilité">
    <h2>Accessibilité</h2>
    <ul class="docs-token-list">
      <li>Le <code>alt</code> est obligatoire ; le passer à <code>""</code> marque l’image comme décorative.</li>
      <li><code>loading="lazy"</code> et <code>decoding="async"</code> par défaut.</li>
    </ul>
  </section>
</div>
