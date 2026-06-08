<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import { t } from "$lib/i18n";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »).
  // BackToTop est position:fixed et son apparition dépend du scroll réel :
  // ici le bouton est rendu simplement, le comportement live est décrit en prose.
  const presentationDemo: NodeSpec[] = [{ comp: "BackToTop" }];
  const fonctionnementDemo: NodeSpec[] = [
    { comp: "BackToTop", props: { threshold: 100, label: "Monter" } }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Navigation</p>
    <div class="docs-hero-title">
      <h1>BackToTop</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Le composant <code>BackToTop</code> affiche un bouton d’accès rapide vers le
      haut de page après un défilement défini, utile sur des écrans longs.
    </p>
  </section>

  <section class="docs-section" id="Présentation">
    <h2>Présentation</h2>
    <p>
      Le bouton est positionné en bas à droite et caché tant que la position de
      défilement est inférieure au seuil configuré.
    </p>
    <TriRender nodes={presentationDemo} label="BackToTop" />
  </section>

  <section class="docs-section" id="Fonctionnement">
    <h2>Fonctionnement</h2>
    <p class="docs-field">
      L’exemple suivant montre le composant avec un seuil personnalisé (100 px).
    </p>
    <TriRender nodes={fonctionnementDemo} label="BackToTop seuil 100" />
    <p class="docs-demo-context">
      Sur la page réelle, faites défiler pour le voir apparaître puis retournez en
      haut en un clic. Le composant est <code>position: fixed</code> : son
      apparition dépend du défilement réel, la démo ci-dessus le montre rendu en
      continu.
    </p>
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
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><code>"Retour en haut"</code></td>
          <td>Libellé rendu dans le bouton</td>
        </tr>
        <tr>
          <td><code>targetId</code></td>
          <td><code>string</code></td>
          <td><code>"top"</code></td>
          <td>Identifiant cible visé en ancres (#top par défaut)</td>
        </tr>
        <tr>
          <td><code>threshold</code></td>
          <td><code>number</code></td>
          <td><code>240</code></td>
          <td>Nombre de px vertical avant affichage</td>
        </tr>
        <tr>
          <td><code>autoHide</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Masque automatiquement avant le seuil</td>
        </tr>
        <tr>
          <td><code>smooth</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Active le défilement doux</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section" id="Accessibilité">
    <h2>Accessibilité</h2>
    <ul class="docs-token-list">
      <li>Le label est porté par <code>aria-label</code>.</li>
      <li>Le focus clavier reste possible via <code>Tab</code> quand le bouton est visible.</li>
      <li>La zone cible peut être une ancre propre (<code>targetId</code>).</li>
    </ul>
  </section>

  <section class="docs-section" id="Notes">
    <h2>Notes</h2>
    <ul class="docs-token-list">
      <li>En mode non-animé, utilisez <code>smooth={false}</code>.</li>
      <li>Placez une ancre id <code>top</code> dans votre layout pour cibler un point précis.</li>
      <li>Intégrez une marge de placement selon votre header fixe.</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>
</div>

<div id="top"></div>
