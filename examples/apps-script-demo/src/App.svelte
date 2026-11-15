<script lang="ts">
  import { tick } from "svelte";
  import {
    Alert, BarChart, Button, Card, DiagramSceneFigure, LineChart, Tabs, Tag,
  } from "@sentropic/design-system-svelte";
  import { m3ProfileRegistry, shippedExecutorBindings } from "@sentropic/diagram-core";
  import {
    criteria, criteriaScores, diagramDocument, diagramFoldLevels, diagramPresentation, options, weeklyVolume,
  } from "./data.js";
  import { pickFoldLevel } from "./diagram-fit.js";

  // The tab shown first. The server-render smoke check uses it to render each view.
  let { initialTab = "dossier" }: { initialTab?: "dossier" | "evaluation" } = $props();

  // Charts draw in the coordinate space given by `width`. It follows the width of
  // the container (bounded), so text keeps its size on a phone instead of being
  // scaled down with a fixed 480-unit drawing.
  const CHART_MIN = 280;
  const CHART_MAX = 640;
  let scoresWidth = $state(480);
  let volumeWidth = $state(480);
  const chartWidth = (measured: number): number =>
    measured > 0 ? Math.min(CHART_MAX, Math.max(CHART_MIN, Math.round(measured))) : 480;

  // Diagram. The figure frames the drawing down to its readable scale and
  // scrolls past it, so the page chooses the fold state from the room the
  // figure has: the most detailed one it frames whole, and on a phone, where
  // none is, the three stages folded, which scrolls (src/diagram-fit.ts).
  // Folding by hand is kept until the width moves the page to another state.
  // In a browser the figure is created once its width is known, so it opens
  // framed; the server render has no width and draws everything unfolded.
  type Folds = (typeof diagramFoldLevels)[number];
  const inBrowser = typeof window !== "undefined";
  let figureWidth = $state(0);
  let windowHeight = $state(inBrowser ? window.innerHeight : 0);
  let manualFolds = $state.raw<{ level: number; collapsed: Folds }>();
  const foldLevel = $derived(figureWidth > 0 ? pickFoldLevel(figureWidth, windowHeight) : 0);
  const collapsed = $derived(manualFolds?.level === foldLevel ? manualFolds.collapsed : diagramFoldLevels[foldLevel]!);

  // Framing after a change of width (window resize, phone rotation, split
  // screen). The figure follows its own size while its camera is at the fit;
  // a camera the reader has zoomed is only clamped. A new width is a new
  // frame, so the page asks the figure for its fit (`fitToFrame`, the action
  // of the Fit button) when the figure width or the fold state it picks
  // changes. A fold by hand is left to the figure: it reframes a camera that
  // is at the fit and keeps a zoom the reader chose.
  let figure = $state<ReturnType<typeof DiagramSceneFigure>>();
  let framedFor: string | undefined;
  $effect(() => {
    const key = `${figureWidth}:${foldLevel}`;
    if (figure === undefined || figureWidth === 0) return;
    if (framedFor !== undefined && framedFor !== key) void tick().then(() => figure?.fitToFrame());
    framedFor = key;
  });

  type Mode = "auto" | "light" | "dark";
  const order: Mode[] = ["auto", "light", "dark"];
  const modeLabels: Record<Mode, string> = { auto: "Auto", light: "Light", dark: "Dark" };
  // In-memory only: the page keeps no storage and makes no request.
  let mode = $state<Mode>("auto");

  function cycleMode(): void {
    mode = order[(order.indexOf(mode) + 1) % order.length]!;
    const root = document.documentElement;
    if (mode === "auto") root.removeAttribute("data-color-mode");
    else root.setAttribute("data-color-mode", mode);
  }
</script>

{#snippet dossierView()}
  <section class="demo-section" aria-labelledby="context-title">
    <h2 id="context-title">1. Context</h2>
    <p>
      A sample platform receives requests from a client app, checks them and stores the result.
      Volumes grow week after week and arrive in peaks. The team has to choose how the steps
      hand work to each other.
    </p>
    <p>
      This page is a generic example. Every name and figure on it is made up for the purpose
      of showing the components.
    </p>
  </section>

  <section class="demo-section" aria-labelledby="question-title">
    <h2 id="question-title">2. Question to decide</h2>
    <p>Which hand-over mode should the platform use between ingestion and processing?</p>
    <Alert tone="info" title="Proposed answer" message="Option B — a queue between the steps. It absorbs peaks and lets each step scale on its own." />
  </section>

  <section class="demo-section" aria-labelledby="options-title">
    <h2 id="options-title">3. Options</h2>
    <div class="demo-options">
      {#each options as option (option.id)}
        <Card class="demo-option">
          <div class="demo-option__head">
            <h3>{option.title}</h3>
            <div class="demo-option__tags">
              {#if option.recommended}<Tag tone="success" size="sm">Recommended</Tag>{/if}
              <Tag tone="neutral" size="sm">{option.effort}</Tag>
            </div>
          </div>
          <p>{option.summary}</p>
          <h4>Strengths</h4>
          <ul>{#each option.strengths as item}<li>{item}</li>{/each}</ul>
          <h4>Limits</h4>
          <ul>{#each option.limits as item}<li>{item}</li>{/each}</ul>
        </Card>
      {/each}
    </div>
  </section>

  <section class="demo-section" aria-labelledby="architecture-title">
    <h2 id="architecture-title">4. Target architecture (option B)</h2>
    <p>
      The drawing opens at the most detailed level that fits the width of the page: on a narrow
      screen the stages start folded. Unfold or fold a container with its button. Past what
      fits (on a phone, from the start), the drawing scrolls in its frame; Fit goes back to
      the smallest readable scale.
    </p>
    <div class="demo-figure" bind:clientWidth={figureWidth}>
      {#if figureWidth > 0 || !inBrowser}
        <DiagramSceneFigure
          bind:this={figure}
          document={diagramDocument}
          presentation={diagramPresentation}
          registry={m3ProfileRegistry}
          bindings={shippedExecutorBindings}
          {collapsed}
          onFoldChange={(next) => { manualFolds = { level: foldLevel, collapsed: next as Folds }; }}
          title="Sample platform — request path"
        />
      {/if}
    </div>
  </section>

  <section class="demo-section" aria-labelledby="scores-title">
    <h2 id="scores-title">5. Overall score</h2>
    <p>Weighted score of each option, out of 10 (sample data).</p>
    <div class="demo-chart" bind:clientWidth={scoresWidth}>
      <BarChart data={criteriaScores} label="Overall score per option, out of 10" domain={[0, 10]} width={chartWidth(scoresWidth)} height={260} dataLabels />
    </div>
  </section>
{/snippet}

{#snippet evaluationView()}
  <section class="demo-section" aria-labelledby="criteria-title">
    <h2 id="criteria-title">Criteria</h2>
    <p>Each option is rated from 1 to 10 on four criteria (sample data).</p>
    <div class="demo-tableWrap">
      <table class="demo-table">
        <thead>
          <tr><th scope="col">Criterion</th><th scope="col">A</th><th scope="col">B</th><th scope="col">C</th></tr>
        </thead>
        <tbody>
          {#each criteria as row}
            <tr><th scope="row">{row.name}</th><td>{row.a}</td><td>{row.b}</td><td>{row.c}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="demo-section" aria-labelledby="volume-title">
    <h2 id="volume-title">Weekly volume</h2>
    <p>Requests received per week, in thousands (sample data).</p>
    <div class="demo-chart" bind:clientWidth={volumeWidth}>
      <LineChart data={weeklyVolume} label="Requests per week, in thousands" width={chartWidth(volumeWidth)} height={260} />
    </div>
  </section>

  <section class="demo-section" aria-labelledby="next-title">
    <h2 id="next-title">Next steps</h2>
    <ol>
      <li>Confirm the choice with the people who operate the platform.</li>
      <li>Run a two-week trial on one request type.</li>
      <li>Review the measured delay and decide on the general roll-out.</li>
    </ol>
  </section>
{/snippet}

<svelte:window bind:innerHeight={windowHeight} />

<header class="demo-band">
  <div class="demo-band__inner">
    <div>
      <p class="demo-band__kicker">Decision dossier · Sample</p>
      <h1>Choosing a hand-over mode for a sample platform</h1>
      <p class="demo-band__meta">Status: draft · Version 1 · Generic content</p>
    </div>
    <Button variant="secondary" size="sm" onclick={cycleMode} aria-label={`Colour mode: ${modeLabels[mode]}. Activate to change.`}>
      Theme: {modeLabels[mode]}
    </Button>
  </div>
</header>

<main class="demo-main">
  <Tabs
    label="Views"
    activeValue={initialTab}
    items={[
      { value: "dossier", label: "Dossier", content: dossierView },
      { value: "evaluation", label: "Evaluation", content: evaluationView },
    ]}
  />
</main>

<footer class="demo-footer">
  <p>Self-contained page: scripts, styles, font and data are inlined. It makes no network request.</p>
  <p>
    Embeds open-source software and the Inter font (SIL Open Font License 1.1). Their notices
    are at the top of the source of this page.
  </p>
</footer>
