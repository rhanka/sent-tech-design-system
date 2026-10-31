<!--
  The §4.5 error panel: every refusal renders THIS, never a blank element.
  One row per diagnostic — code, RFC 6901 pointer into the envelope, and the
  message — plus the count in the title, so a host sees both WHAT refused
  and WHERE, without knowing which layer produced the diagnostic.
-->
<script lang="ts">
  import type { Diagnostic } from "../../validate/index.js";

  let { diagnostics }: { diagnostics: readonly Diagnostic[] } = $props();
</script>

<div class="st-element__error" role="alert" data-st-error>
  <p class="st-element__errorTitle" data-st-error-title>
    The envelope does not render — {diagnostics.length}
    {diagnostics.length === 1 ? "diagnostic" : "diagnostics"}:
  </p>
  <ul class="st-element__errorList">
    {#each diagnostics as diagnostic (diagnostic.code + "|" + diagnostic.path + "|" + diagnostic.message)}
      <li class="st-element__errorItem" data-st-error-item>
        <code class="st-element__errorCode" data-st-error-code>{diagnostic.code}</code>
        <span class="st-element__errorPath" data-st-error-path>{diagnostic.path || "(envelope)"}</span>
        <span class="st-element__errorMessage" data-st-error-message>{diagnostic.message}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .st-element__error {
    border: 1px solid var(--st-color-feedback-error-border, #dc2626);
    border-radius: 8px;
    padding: 12px;
    font-family: inherit;
    color: var(--st-color-feedback-error-text, #7f1d1d);
    background: var(--st-color-feedback-error-background, #fef2f2);
  }
  .st-element__errorTitle {
    margin: 0 0 8px;
    font-weight: 600;
  }
  .st-element__errorList {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .st-element__errorItem {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 8px;
    margin: 4px 0;
    font-size: 0.875rem;
  }
  .st-element__errorCode {
    font-family: ui-monospace, monospace;
  }
  .st-element__errorPath {
    font-family: ui-monospace, monospace;
    opacity: 0.8;
  }
</style>
