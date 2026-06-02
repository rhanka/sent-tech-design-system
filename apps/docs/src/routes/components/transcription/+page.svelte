<script lang="ts">
  import { Badge, Transcription } from "@sentropic/design-system-svelte";

  const segments = [
    {
      speaker: "Narrateur",
      startTime: "00:00",
      endTime: "00:12",
      text: "Bienvenue dans cette démo de composant Transcription."
    },
    {
      speaker: "Intervenant",
      startTime: "00:12",
      endTime: "00:24",
      text: "Le composant affiche une transcription verticale avec horodatage."
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · A11y & médias</p>
    <div class="docs-hero-title">
      <h1>Transcription</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      <code>Transcription</code> regroupe les extraits transcrits d’une vidéo/audio dans un bloc
      accessible, avec options horodatage et speaker.
    </p>
  </section>

  <section class="docs-section" id="Introduction">
    <h2>Présentation</h2>
    <div class="docs-example">
      <Transcription title="Transcription" segments={segments} />
    </div>
  </section>

  <section class="docs-section" id="API">
    <h2>API</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Défaut</th>
          <th>Effet</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>title</code></td>
          <td><code>string</code></td>
          <td><code>"Transcription"</code></td>
          <td>Libellé visible dans l’en-tête repliable</td>
        </tr>
        <tr>
          <td><code>segments</code></td>
          <td><code>TranscriptionSegment[]</code></td>
          <td><code>[]</code></td>
          <td>Liste ordonnée des lignes</td>
        </tr>
        <tr>
          <td><code>text</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>Fallback texte brut quand <code>segments</code> absent</td>
        </tr>
        <tr>
          <td><code>open</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>État initial de l’accordéon</td>
        </tr>
        <tr>
          <td><code>showTimestamps</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Affiche <code>startTime</code>/<code>endTime</code></td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section" id="Accessibilité">
    <h2>Accessibilité</h2>
    <ul class="docs-token-list">
      <li>Le conteneur repose sur <code>&lt;details&gt;</code> et <code>&lt;summary&gt;</code> pour un comportement clavier natif.</li>
      <li>Le texte vide affiche un message de fallback explicite.</li>
      <li>Les horodatages sont lisibles visuellement et restitués en contexte texte.</li>
    </ul>
  </section>
</div>
