<script lang="ts">
  import { locale } from "$lib/locale.svelte";
  const fr = $derived(locale.value === "fr");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Collaboration" : "Component · Collaboration"}</p>
    <h1>LockPresenceBadge</h1>
    <p>{fr
      ? "Affiche la présence des collaborateurs et le verrou actif à partir d’instantanés fournis par l’hôte."
      : "Displays collaborator presence and the active lock from host-provided snapshots."}</p>
  </section>
  <section class="docs-section">
    <h2>Imports</h2>
    <pre><code>import &#123; LockPresenceBadge &#125; from '@sentropic/design-system-svelte/presence-badge';
import &#123; LockPresenceBadge &#125; from '@sentropic/design-system-vue/presence-badge';</code></pre>
    <p>{fr
      ? "Vue fournit aussi le sous-chemin vapor/presence-badge."
      : "Vue also supplies the vapor/presence-badge subpath."}</p>
  </section>
  <section class="docs-section">
    <h2>API</h2>
    <table class="docs-table">
      <thead><tr><th>Prop</th><th>Type</th></tr></thead>
      <tbody>
        <tr><td><code>lock / presence</code></td><td><code>LockSnapshot | null / PresenceSnapshot | null</code></td></tr>
        <tr><td><code>capabilities</code></td><td><code>CollaborationCapabilities</code></td></tr>
        <tr><td><code>messages</code></td><td><code>RichTextMessages</code></td></tr>
        <tr><td><code>nowIso</code></td><td><code>string</code> (ISO 8601)</td></tr>
        <tr><td><code>readOnly</code></td><td><code>boolean</code> ({fr ? "défaut : false" : "default: false"})</td></tr>
        <tr><td><code>binding</code></td><td><code>FieldBindingIdentity | null</code></td></tr>
      </tbody>
    </table>
    <p>{fr
      ? "L’hôte fournit nowIso et renouvelle les instantanés : le badge ne crée pas de minuterie. Les capacités déterminent les actions disponibles."
      : "The host supplies nowIso and refreshes snapshots; the badge creates no timer. Capabilities determine which actions are available."}</p>
    <p>{fr
      ? "Callbacks Svelte : onRequestUnlock, onAcceptUnlock, onForceUnlock et onReleaseLock. Événements Vue : request-unlock, accept-unlock, force-unlock et release-lock. Chaque action est signalée une seule fois."
      : "Svelte callbacks: onRequestUnlock, onAcceptUnlock, onForceUnlock, and onReleaseLock. Vue events: request-unlock, accept-unlock, force-unlock, and release-lock. Each action is reported once."}</p>
    <p>{fr
      ? "Les libellés accessibles et l’infobulle proviennent de messages. Une traduction manquante conserve le marqueur de traduction du contrat."
      : "Accessible labels and the tooltip come from messages. A missing translation retains the contract's untranslated marker."}</p>
  </section>
</div>
