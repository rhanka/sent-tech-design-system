<script lang="ts">
  import CopyButton from "./CopyButton.svelte";

  type CodeSnippetProps = {
    code: string;
    language?: string;
    inline?: boolean;
    copyable?: boolean;
    copyLabel?: string;
    copiedLabel?: string;
    class?: string;
  };

  let {
    code,
    language,
    inline = false,
    copyable = true,
    copyLabel = "Copy",
    copiedLabel = "Copied",
    class: className
  }: CodeSnippetProps = $props();

  const inlineClasses = () =>
    ["st-codeSnippet--inline", className].filter(Boolean).join(" ");
  const blockClasses = () => ["st-codeSnippet", className].filter(Boolean).join(" ");
</script>

{#if inline}
  <code class={inlineClasses()} data-language={language}>{code}</code>
{:else}
  <div class="st-codeSnippet__wrapper">
    <pre class={blockClasses()} data-language={language}><code
        class="st-codeSnippet__code">{code}</code></pre>
    {#if copyable}
      <span class="st-codeSnippet__copy">
        <CopyButton value={code} size="sm" label={copyLabel} copiedLabel={copiedLabel} />
      </span>
    {/if}
  </div>
{/if}

<style>
  .st-codeSnippet__wrapper {
    position: relative;
  }

  .st-codeSnippet {
    background: var(
      --st-component-codeSnippet-background,
      var(--st-semantic-surface-subtle)
    );
    border: 1px solid
      var(--st-component-codeSnippet-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-codeSnippet-radius, 0.375rem);
    color: var(--st-component-codeSnippet-text, var(--st-semantic-text-primary));
    font-family: var(--st-font-mono, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace);
    font-size: 0.8125rem;
    line-height: 1.5;
    margin: 0;
    max-height: var(--st-component-codeSnippet-maxHeight, 16rem);
    overflow: auto;
    padding: 0.75rem 0.875rem;
    padding-inline-end: 4rem;
  }

  .st-codeSnippet__code {
    font: inherit;
    white-space: pre;
  }

  .st-codeSnippet__copy {
    position: absolute;
    inset-block-start: 0.375rem;
    inset-inline-end: 0.375rem;
  }

  .st-codeSnippet--inline {
    background: var(
      --st-component-codeSnippet-background,
      var(--st-semantic-surface-subtle)
    );
    border: 1px solid
      var(--st-component-codeSnippet-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-component-codeSnippet-text, var(--st-semantic-text-primary));
    font-family: var(--st-font-mono, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace);
    font-size: 0.8125rem;
    padding: 0.0625rem 0.375rem;
  }
</style>
