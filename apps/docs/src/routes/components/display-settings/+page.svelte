<script lang="ts">
  import { Badge, DisplaySettings } from "@sentropic/design-system-svelte";

  const initialValues = {
    fontScale: "normal" as const,
    contrast: "default" as const,
    lineSpacing: "normal" as const,
    reducedMotion: false
  };
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Accessibilité</p>
    <div class="docs-hero-title">
      <h1>DisplaySettings</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      <code>DisplaySettings</code> propose un bloc de réglages d’affichage léger pour les préférences
      lecture : taille de texte, contraste, interligne et réduction des animations.
    </p>
  </section>

  <section class="docs-section" id="Introduction">
    <h2>Présentation</h2>
    <div class="docs-example">
      <DisplaySettings values={initialValues} />
    </div>
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
          <td><code>values</code></td>
          <td><code>Partial&lt;DisplaySettingsState&gt;</code></td>
          <td><code>{`{
  fontScale: "normal",
  contrast: "default",
  lineSpacing: "normal",
  reducedMotion: false
}`}</code></td>
          <td>Valeurs initiales ou pilotées par le parent.</td>
        </tr>
        <tr>
          <td><code>onChange</code></td>
          <td><code>(state: DisplaySettingsState) =&gt; void</code></td>
          <td>—</td>
          <td>Callback déclenché à chaque réglage modifié.</td>
        </tr>
        <tr>
          <td><code>showFontScale</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Affiche le sélecteur de taille de texte.</td>
        </tr>
        <tr>
          <td><code>showContrast</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Affiche le sélecteur de contraste.</td>
        </tr>
        <tr>
          <td><code>showLineSpacing</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Affiche le sélecteur d’espacement de ligne.</td>
        </tr>
        <tr>
          <td><code>showReducedMotion</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Affiche le switch d’animation.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section" id="Accessibilité">
    <h2>Accessibilité</h2>
    <ul class="docs-token-list">
      <li>Contrôles natifs (<code>&lt;select&gt;</code>, <code>&lt;input type=&quot;checkbox&quot;&gt;</code>) avec label explicite.</li>
      <li>Comportement <code>role=&quot;switch&quot;</code> sur la case motion afin de clarifier l’action.</li>
      <li>Idempotence visuelle de la première charge : aucun style global n’est modifié directement.</li>
    </ul>
  </section>
</div>
