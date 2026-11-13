<script lang="ts">
  import { locale } from "$lib/locale.svelte";
  const fr = $derived(locale.value === "fr");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composants · Rédaction" : "Components · Editing"}</p>
    <h1>RichTextEditor / ComposerEditor</h1>
    <p>{fr
      ? "Deux surfaces contrôlées utilisent le même moteur neutre : un document structuré ou une chaîne de texte."
      : "Two controlled surfaces share the same framework-neutral engine: a structured document or a text string."}</p>
  </section>
  <section class="docs-section">
    <h2>Imports</h2>
    <pre><code>import &#123; RichTextEditor, ComposerEditor &#125; from '@sentropic/design-system-svelte/rich-text-editor';
import &#123; RichTextEditor, ComposerEditor &#125; from '@sentropic/design-system-vue/rich-text-editor';</code></pre>
    <p>{fr
      ? "Chargez la feuille rich-text-editor.css du même paquet. Le sous-chemin Vue vapor/rich-text-editor fournit les composants compilés Vapor."
      : "Load rich-text-editor.css from the same package. The Vue vapor/rich-text-editor subpath supplies the Vapor-compiled components."}</p>
  </section>
  <section class="docs-section">
    <h2>API</h2>
    <table class="docs-table">
      <thead><tr><th>Prop</th><th>RichTextEditor</th><th>ComposerEditor</th></tr></thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>RichTextDocument</code></td><td><code>string</code></td></tr>
        <tr><td><code>messages</code></td><td colspan="2"><code>RichTextMessages</code></td></tr>
        <tr><td><code>profile</code></td><td colspan="2"><code>"p0" | "full"</code> ({fr ? "défaut : p0" : "default: p0"})</td></tr>
        <tr><td><code>editable / disabled</code></td><td colspan="2"><code>boolean</code> ({fr ? "défauts : true / false" : "defaults: true / false"})</td></tr>
        <tr><td><code>allocateId / class</code></td><td colspan="2"><code>(() =&gt; string) / string</code></td></tr>
      </tbody>
    </table>
    <p>{fr
      ? "RichTextEditor signale les changements de document, conflits externes, collages non pris en charge et changements de disponibilité. Il accepte aussi provider, binding, actor, lock, presence et capabilities pour la collaboration. ComposerEditor signale la nouvelle valeur texte, la disponibilité et les touches clavier ; placeholder personnalise son texte indicatif."
      : "RichTextEditor reports document changes, external conflicts, unsupported paste, and readiness changes. It also accepts provider, binding, actor, lock, presence, and capabilities for collaboration. ComposerEditor reports the new text value, readiness, and keyboard events; placeholder customizes its hint."}</p>
    <p>{fr
      ? "Svelte utilise les callbacks onChange et onReadinessChange. Vue expose les événements change et readiness-change. Les autres callbacks suivent la même correspondance."
      : "Svelte uses onChange and onReadinessChange callbacks. Vue exposes change and readiness-change events. Other callbacks follow the same mapping."}</p>
  </section>
  <section class="docs-section">
    <h2>{fr ? "Capture et disponibilité" : "Capture and readiness"}</h2>
    <p>{fr
      ? "Les références exposent captureDocument() ou captureComposer(), ainsi que readiness(). La capture attend la fin de la composition IME et du montage asynchrone du profil full. Après démontage, elle rejette avec RichTextCaptureUnavailable. Le profil se choisit au montage ; la valeur reste contrôlée par l’hôte."
      : "Component refs expose captureDocument() or captureComposer(), plus readiness(). Capture waits for IME composition and the full profile's asynchronous mount. After unmount it rejects with RichTextCaptureUnavailable. Choose the profile at mount; the host keeps control of the value."}</p>
  </section>
</div>
