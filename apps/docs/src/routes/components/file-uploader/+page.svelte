<script lang="ts">
  import {
    Badge,
    FileUploader,
    type FileUploadItem
  } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  let dropzoneFiles = $state<File[]>([]);
  let singleFiles = $state<File[]>([]);

  // Static items showcasing every status without wiring real uploads.
  const statusItems: FileUploadItem[] = [
    {
      file: new File(["draft"], "brief.pdf", { type: "application/pdf" }),
      status: "idle"
    },
    {
      file: new File(["wip"], "rapport-q1.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }),
      status: "uploading",
      progress: 0.42
    },
    {
      file: new File(["ok"], "logo.svg", { type: "image/svg+xml" }),
      status: "complete"
    },
    {
      file: new File(["nope"], "video.mov", { type: "video/quicktime" }),
      status: "error",
      error: "Format non supporté"
    }
  ];

  let items = $state<FileUploadItem[]>(statusItems);

  function resetStatusItems() {
    items = statusItems.map((entry) => ({ ...entry }));
  }
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "fileUploaderTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "fileUploaderIntro")}</p>
  </section>
  <FrameworkPreview example="fileuploader" title="Aperçu live" />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "Zone de dépôt vide" : "Empty dropzone"}
    >
      <FileUploader
        label={locale.value === "fr" ? "Pièces jointes" : "Attachments"}
        helperText={locale.value === "fr"
          ? "PDF, DOCX, PNG jusqu’à 5 MB."
          : "PDF, DOCX, PNG up to 5 MB."}
        multiple
        bind:files={dropzoneFiles}
        triggerLabel={locale.value === "fr" ? "Choisir des fichiers" : "Choose files"}
        dropzoneLabel={locale.value === "fr"
          ? "ou glissez-déposez vos fichiers ici"
          : "or drag and drop your files here"}
        removeLabel={(name) =>
          locale.value === "fr" ? `Retirer ${name}` : `Remove ${name}`}
      />
      <p class="docs-example__caption">
        {locale.value === "fr" ? "Fichiers sélectionnés" : "Selected files"} :
        <code>{dropzoneFiles.length}</code>
      </p>
    </div>

    <div
      class="docs-example"
      aria-label={locale.value === "fr"
        ? "Liste de fichiers avec statuts"
        : "File list with statuses"}
    >
      <FileUploader
        label={locale.value === "fr" ? "Documents en cours" : "In-flight documents"}
        helperText={locale.value === "fr"
          ? "Suivi statique des statuts idle, uploading, complete et error."
          : "Static walkthrough of the idle, uploading, complete, and error statuses."}
        multiple
        {items}
        triggerLabel={locale.value === "fr" ? "Ajouter des fichiers" : "Add files"}
        dropzoneLabel={locale.value === "fr"
          ? "ou glissez-déposez ici"
          : "or drop here"}
        removeLabel={(name) =>
          locale.value === "fr" ? `Retirer ${name}` : `Remove ${name}`}
      />
      <p class="docs-example__caption">
        <button type="button" class="docs-example__reset" onclick={resetStatusItems}>
          {locale.value === "fr" ? "Réinitialiser" : "Reset"}
        </button>
        · {locale.value === "fr" ? "Statuts visibles" : "Visible statuses"} :
        <code>idle, uploading, complete, error</code>
      </p>
    </div>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "Mode fichier unique" : "Single file mode"}
    >
      <FileUploader
        label={locale.value === "fr" ? "Avatar" : "Avatar"}
        helperText={locale.value === "fr"
          ? "Un seul fichier image, max 1 MB."
          : "One image file, max 1 MB."}
        accept="image/*"
        maxSizeBytes={1024 * 1024}
        bind:files={singleFiles}
        triggerLabel={locale.value === "fr" ? "Choisir un fichier" : "Choose a file"}
        dropzoneLabel={locale.value === "fr"
          ? "ou glissez-déposez une image"
          : "or drag and drop an image"}
        removeLabel={(name) =>
          locale.value === "fr" ? `Retirer ${name}` : `Remove ${name}`}
        maxSizeErrorLabel={(name) =>
          locale.value === "fr"
            ? `${name} dépasse la limite de 1 MB`
            : `${name} exceeds the 1 MB limit`}
      />
      <p class="docs-example__caption">
        {locale.value === "fr"
          ? "Mode fichier unique : `multiple` est faux et toute nouvelle sélection remplace la précédente."
          : "Single file mode: `multiple` is false and any new selection replaces the previous one."}
      </p>
    </div>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "État désactivé" : "Disabled state"}
    >
      <FileUploader
        label={locale.value === "fr" ? "Lecture seule" : "Read-only"}
        helperText={locale.value === "fr"
          ? "Le composant reste rendu mais n’accepte plus d’entrée."
          : "The component is rendered but no longer accepts input."}
        disabled
        triggerLabel={locale.value === "fr" ? "Choisir un fichier" : "Choose a file"}
        dropzoneLabel={locale.value === "fr"
          ? "Champ verrouillé"
          : "Field locked"}
      />
      <p class="docs-example__caption">
        {locale.value === "fr"
          ? "`disabled` propage l’état au bouton, au champ caché et désactive le drag-and-drop."
          : "`disabled` propagates the state to the button, the hidden input, and disables drag-and-drop."}
      </p>
    </div>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>accept</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>multiple</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>maxSizeBytes</code></td><td><code>number</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>files</code></td><td><code>File[]</code> (<code>$bindable</code>)</td><td><code>[]</code></td></tr>
        <tr><td><code>items</code></td><td><code>FileUploadItem[]</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>onfiles</code></td><td><code>(files: File[]) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>triggerLabel</code></td><td><code>string</code></td><td><code>"Choose file"</code> / <code>"Choose files"</code></td></tr>
        <tr><td><code>dropzoneLabel</code></td><td><code>string</code></td><td><code>"Drag and drop files here"</code></td></tr>
        <tr><td><code>removeLabel</code></td><td><code>(filename: string) =&gt; string</code></td><td><code>{"`Remove ${filename}`"}</code></td></tr>
        <tr><td><code>maxSizeErrorLabel</code></td><td><code>(filename: string, maxSizeBytes: number) =&gt; string</code></td><td><em>format par défaut</em></td></tr>
        <tr><td><code>id</code></td><td><code>string</code></td><td><em>auto-généré</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend un <code>&lt;div class="st-field st-fileUploader-field"&gt;</code>
      contenant une zone <em>dropzone</em> avec un bouton, un libellé, un champ
      <code>&lt;input type="file"&gt;</code> visuellement masqué et une icône
      Lucide <code>Upload</code> (<code>size=18</code>, <code>strokeWidth=2</code>).
      Quand <code>items</code> est fourni, le composant affiche la liste contrôlée
      avec une icône par statut : <code>File</code> pour <code>idle</code>,
      <code>LoaderCircle</code> animé pour <code>uploading</code>
      (<code>prefers-reduced-motion</code> respecté), <code>CircleCheck</code> pour
      <code>complete</code> et <code>CircleAlert</code> pour <code>error</code>.
      Sinon le composant rend la liste interne issue de la liaison
      <code>files</code>, avec <code>File</code> pour chaque entrée et
      <code>CircleAlert</code> lorsqu’un fichier dépasse
      <code>maxSizeBytes</code>. Le bouton de retrait par fichier utilise l’icône
      Lucide <code>X</code> (<code>size=16</code>) et alimente son
      <code>aria-label</code> via <code>removeLabel</code>. Les autres attributs
      HTML <code>&lt;div&gt;</code> sont transmis via spread.
    </p>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>

</div>

<style>
  .docs-example__caption {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .docs-example__reset {
    background: transparent;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    font: inherit;
    font-size: 0.8125rem;
    padding: 0.125rem 0.5rem;
  }

  .docs-example__reset:hover {
    background: var(--st-semantic-surface-subtle);
  }
</style>
