<script lang="ts">
  // Test-only fixture: the real docs layout wrapping the real /compare page, so
  // the page reads the private-theme access the layout provides exactly as in
  // the app. Not imported by any route.
  import Layout from "../../routes/+layout.svelte";
  import ComparePage from "../../routes/compare/+page.svelte";
</script>

<Layout>
  <ComparePage />
</Layout>
