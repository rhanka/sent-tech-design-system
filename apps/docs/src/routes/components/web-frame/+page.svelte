<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { webFrameDemoNodes, type NodeSpec } from "$lib/framework/examples";
  import { Badge, CodeSnippet } from "@sentropic/design-system-svelte";
  import type { WebFrameConfig } from "@sentropic/dataviz-core";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  // Static config: WebFrame takes no store (stated in the API section).
  const frame: WebFrameConfig = {
    src: "https://example.com",
    title: "Example embed",
    sandbox: ["allow-scripts"],
    loading: "lazy"
  };

  const demo = $derived<NodeSpec[]>(webFrameDemoNodes(frame));

  const notes = $derived({
    angular: fr
      ? "Aucun adaptateur WebFrame côté Angular."
      : "No WebFrame adapter in Angular."
  });

  const storeCode = `import type { WebFrameConfig } from "@sentropic/dataviz-core";
import { WebFrame } from "@sentropic/dataviz-svelte";

const frame: WebFrameConfig = {
  src: "https://example.com",
  title: "Example embed",
  sandbox: ["allow-scripts"],
  loading: "lazy"
};`;
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "datavizKicker")}</p>
    <div class="docs-hero-title">
      <h1>WebFrame</h1>
      <Badge tone="neutral">{fr ? "Documenté" : "Documented"}</Badge>
    </div>
    <p>
      {#if fr}
        Cadre web intégré et durci : <code>&lt;WebFrame frame /&gt;</code> résout une
        <code>WebFrameConfig</code> en <code>&lt;iframe&gt;</code> (sandbox, politique de
        référent, chargement paresseux par défaut). Configuration statique : sans canal
        store, sans composant DS sous-jacent.
      {:else}
        Hardened embedded web frame: <code>&lt;WebFrame frame /&gt;</code> resolves a
        <code>WebFrameConfig</code> into an <code>&lt;iframe&gt;</code> (sandbox,
        referrer policy, lazy loading by default). Static config: no store channel,
        no underlying DS component.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "datavizCoverageTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Framework</th>
          <th>{t(locale.value, "datavizFrameworkShape")}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>Svelte</code></td>
          <td>{fr ? "Composant WebFrame (démo live ci-dessous)." : "WebFrame component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>React</code></td>
          <td>{fr ? "Composant WebFrame (démo live ci-dessous, className et attributs iframe natifs en plus)." : "WebFrame component (live demo below, plus className and native iframe attributes)."}</td>
        </tr>
        <tr>
          <td><code>Vue</code></td>
          <td>{fr ? "Composant WebFrame (démo live ci-dessous)." : "WebFrame component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>Angular</code></td>
          <td>{fr ? "Absent : aucun adaptateur." : "Missing: no adapter."}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if fr}
        Une intégration bac à sable avec titre explicite et chargement paresseux.
      {:else}
        A sandboxed embed with an explicit title and lazy loading.
      {/if}
    </p>
    <TabbedExample
      nodes={demo}
      {notes}
      title={fr ? "Cadre intégré" : "Embedded frame"}
    />
    <h3 class="docs-demo-title">{fr ? "Configuration" : "Configuration"}</h3>
    <CodeSnippet
      code={storeCode}
      language="ts"
      copyLabel={fr ? "Copier" : "Copy"}
      copiedLabel={fr ? "Copié" : "Copied"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{fr ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>frame.src</code></td>
          <td><code>string</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>{fr ? "URL intégrée." : "Embedded URL."}</td>
        </tr>
        <tr>
          <td><code>frame.title</code></td>
          <td><code>string</code></td>
          <td><code>"Embedded page"</code></td>
          <td>
            {fr
              ? "Titre du cadre (a11y, toujours rendu)."
              : "Frame title (a11y, always rendered)."}
          </td>
        </tr>
        <tr>
          <td><code>frame.sandbox</code></td>
          <td><code>WebFrameSandboxToken[] | string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Jetons sandbox joints par des espaces."
              : "Sandbox tokens joined with spaces."}
          </td>
        </tr>
        <tr>
          <td><code>frame.referrerPolicy</code></td>
          <td><code>WebFrameReferrerPolicy</code></td>
          <td><code>"strict-origin-when-cross-origin"</code></td>
          <td>{fr ? "Politique de référent." : "Referrer policy."}</td>
        </tr>
        <tr>
          <td><code>frame.loading</code></td>
          <td><code>"eager" | "lazy"</code></td>
          <td><code>"lazy"</code></td>
          <td>{fr ? "Stratégie de chargement." : "Loading strategy."}</td>
        </tr>
        <tr>
          <td><code>frame.allow</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>{fr ? "Liste d’autorisations (feature policy)." : "Allow list (feature policy)."}</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Classe transmise à l’iframe (className côté React, qui accepte aussi les attributs iframe natifs)."
              : "Class forwarded to the iframe (className in React, which also accepts native iframe attributes)."}
          </td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      {#if fr}
        Sans composant DS sous-jacent : aucun héritage de props, aucun token dédié.
        Le titre est obligatoire en pratique (valeur par défaut
        <code>"Embedded page"</code>, jamais d’iframe sans nom accessible).
      {:else}
        No underlying DS component: no inherited props, no dedicated tokens.
        The title is mandatory in practice (default <code>"Embedded page"</code> —
        never an unnamed iframe).
      {/if}
    </p>
  </section>
</div>
