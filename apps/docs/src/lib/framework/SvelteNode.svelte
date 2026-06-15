<!--
  Rendu récursif d'un NodeSpec avec les composants Svelte du design system.
  Pendant Svelte de react-island / vue-island : même arbre déclaratif, rendu
  inline (pas d'island, donc aucun coût runtime supplémentaire côté Svelte).

  - chaîne   → texte brut
  - { comp } → composant DS (Button, Input, …), enfants passés en children snippet
  - { el }   → élément HTML neutre (wrapper), enfants récursifs
-->
<script lang="ts">
  import {
    Button,
    Input,
    Card,
    Badge,
    Checkbox,
    Radio,
    Alert,
    Tag,
    Select,
    Textarea,
    Toggle,
    Switch,
    Link,
    Breadcrumb,
    Tooltip,
    ProgressBar,
    Pagination,
    IconButton,
    NumberInput,
    Search,
    Tabs,
    Accordion,
    Slider,
    Quote,
    Highlight,
    EmptyState,
    ErrorSummary,
    Tile,
    ContentSwitcher,
    SkeletonText,
    ProgressIndicator,
    InlineLoading,
    LoadingState,
    CodeSnippet,
    CopyButton,
    OrderedList,
    UnorderedList,
    StructuredList,
    SkipLink,
    Header,
    AppChrome,
    SideNav,
    Form,
    FormGroup,
    FileUploader,
    LanguageSelector,
    Table,
    DataTable,
    TreeView,
    Combobox,
    MultiSelect,
    DatePicker,
    Toast,
    Dropdown,
    Footer,
    AreaChart,
    AreaRangeChart,
    AreaSplineRangeChart,
    ColumnPyramidChart,
    PolygonChart,
    TileMapChart,
    DumbbellChart,
    ErrorBarChart,
    BellCurveChart,
    BarChart,
    LineChart,
    DonutChart,
    ScatterPlot,
    Sparkline,
    StackedBarChart,
    HeatmapChart,
    HistogramChart,
    BoxPlotChart,
    RadarChart,
    RoseChart,
    ItemChart,
    VariablePieChart,
    VennChart,
    SankeyChart,
    SunburstChart,
    ViolinChart,
    ChatThread,
    ChatMessage,
    StreamingMessage,
    MessageActions,
    MessageStatusBadge,
    ChatComposer,
    Menu,
    MenuPopover,
    OverflowMenu,
    Popover,
    AspectRatio,
    TableOfContents,
    PasswordInput,
    PaginationNav,
    MenuTriggerButton,
    Toggletip,
    BackToTop,
    DisplaySettings,
    MediaContent,
    Embed,
    DataImage,
    Notification,
    Transcription,
    ForceGraph,
    GeoMap,
    TileGroup,
    Flex,
    Stack,
    Inline,
    Container,
    Row,
    Col,
    Hidden,
    Divider,
    Avatar,
    AvatarGroup,
    ButtonGroup,
    CheckboxGroup,
    RadioGroup,
    Typography,
    Collapsible,
    Stepper,
    Rating,
    TimePicker,
    Calendar,
    SlideIndicator,
    Autosave,
    Portal,
    Popper,
    SelectableRow,
    SelectableList,
    KpiCard,
    ConfigItemCard,
    FieldCard,
    ScoreCard,
    ComboChart,
    GaugeChart,
    SolidGaugeChart,
    StateTimelineChart,
    StatusHistoryChart,
    EventFeedPanel,
    VectorFieldChart,
    ContourChart,
    WindBarbChart,
    RenkoChart,
    PointAndFigureChart,
    WaffleChart,
    ColorSwatch,
    ColorScaleBar,
    RibbonChart,
    AnomalySwimLaneChart,
    FlamegraphChart,
    TraceWaterfallChart,
    DecompositionTreeChart,
    Density2DChart,
    FunnelChart,
    WaterfallChart,
    TreemapChart,
    WordCloudChart,
    OrganizationChart,
    TreegraphChart,
    BulletChart,
    MarimekkoChart,
    ParallelCoordinatesChart,
    CandlestickChart,
    OHLCChart,
    HLCChart,
    HollowCandlestickChart,
    HeikinAshiChart,
    TimelineChart,
    GanttChart,
    StreamgraphChart,
    CalendarHeatmapChart,
    BumpChart,
    StepLineChart,
    DivergentBarChart,
    FilterPill,
    FilterBar,
    SelectionChip,
    LollipopChart,
    ColumnRangeChart,
    ParetoChart,
    ChordDiagram,
    DependencyWheelChart,
    ArcDiagramChart,
    PackedBubblesChart,
    RangeSlider,
    Modal,
    Drawer
  } from "@sentropic/design-system-svelte";
  import Self from "./SvelteNode.svelte";
  import { createRawSnippet, type Component, type Snippet } from "svelte";
  import type { ComponentName, NodeSpec } from "./examples";
  import { isComponentNode, isElementNode } from "./examples";

  // Certaines props du DS Svelte attendent un Snippet là où React/Vue acceptent
  // une donnée plate (ex. `MessageActions.actions[].icon`). Le registre exprime
  // ces icônes comme de simples glyphes texte (parité React/Vue) ; côté Svelte on
  // les transforme en snippets pour satisfaire `{@render action.icon()}`.
  function glyphSnippet(glyph: string): Snippet {
    return createRawSnippet(() => ({
      render: () => `<span>${glyph}</span>`
    })) as unknown as Snippet;
  }

  function htmlSnippet(html: string): Snippet {
    return createRawSnippet(() => ({ render: () => html })) as unknown as Snippet;
  }

  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Reproduit le markup de colonnes que React/Vue rendent depuis `columns`.
  // (Le composant Footer Svelte est piloté par snippets : il enveloppe ce snippet
  // dans `.st-footer__columns`, on ne produit donc que les <nav> internes.)
  type FooterColumn = { title?: string; links?: Array<{ label: string; href: string }> };
  function columnsHtml(columns: FooterColumn[]): string {
    return columns
      .map((group) => {
        const heading = group.title ? `<h2>${escapeHtml(group.title)}</h2>` : "";
        const links = (group.links ?? [])
          .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
          .join("");
        return `<nav>${heading}${links}</nav>`;
      })
      .join("");
  }

  // Adapte les props d'un composant Svelte : convertit les champs « snippet »
  // exprimés en données plates (glyphes, chaîne marque, colonnes) vers de vrais
  // snippets Svelte. Ciblé par composant pour ne pas toucher des props homonymes
  // (ex. `columns` de Table/DataTable, qui sont des données, pas des snippets).
  function adaptProps(
    comp: ComponentName,
    props: Record<string, unknown> | undefined
  ): Record<string, unknown> {
    if (!props) return {};
    const out: Record<string, unknown> = { ...props };

    // MessageActions : `actions[].icon` (glyphe texte) → snippet Svelte.
    if (comp === "MessageActions" && Array.isArray(out.actions)) {
      out.actions = (out.actions as Array<Record<string, unknown>>).map((action) =>
        typeof action.icon === "string"
          ? { ...action, icon: glyphSnippet(action.icon) }
          : action
      );
    }

    // Footer : `brand` (chaîne) et `columns` (données) → snippets Svelte.
    if (comp === "Footer") {
      if (typeof out.brand === "string") {
        out.brand = htmlSnippet(escapeHtml(out.brand));
      }
      if (Array.isArray(out.columns)) {
        out.columns = htmlSnippet(columnsHtml(out.columns as FooterColumn[]));
      }
    }

    return out;
  }

  // Table de composants indexée par nom. Le rendu est dynamique : on type chaque
  // entrée en composant à props arbitraires (les props proviennent du registre
  // d'exemples, validé à l'écriture) pour éviter une intersection impossible des
  // signatures des huit composants.
  const COMPONENTS: Record<ComponentName, Component<Record<string, unknown>>> = {
    Button,
    Input,
    Card,
    Badge,
    Checkbox,
    Radio,
    Alert,
    Tag,
    Select,
    Textarea,
    Toggle,
    Switch,
    Link,
    Breadcrumb,
    Tooltip,
    ProgressBar,
    Pagination,
    IconButton,
    NumberInput,
    Search,
    Tabs,
    Accordion,
    Slider,
    Quote,
    Highlight,
    EmptyState,
    ErrorSummary,
    Tile,
    ContentSwitcher,
    SkeletonText,
    ProgressIndicator,
    InlineLoading,
    LoadingState,
    CodeSnippet,
    CopyButton,
    OrderedList,
    UnorderedList,
    StructuredList,
    SkipLink,
    Header,
    AppChrome,
    SideNav,
    Form,
    FormGroup,
    FileUploader,
    LanguageSelector,
    Table,
    DataTable,
    TreeView,
    Combobox,
    MultiSelect,
    DatePicker,
    Toast,
    Dropdown,
    Footer,
    AreaChart,
    AreaRangeChart,
    AreaSplineRangeChart,
    ColumnPyramidChart,
    PolygonChart,
    TileMapChart,
    DumbbellChart,
    ErrorBarChart,
    BellCurveChart,
    BarChart,
    LineChart,
    DonutChart,
    ScatterPlot,
    Sparkline,
    StackedBarChart,
    HeatmapChart,
    HistogramChart,
    BoxPlotChart,
    RadarChart,
    RoseChart,
    ItemChart,
    VariablePieChart,
    VennChart,
    SankeyChart,
    SunburstChart,
    ViolinChart,
    ChatThread,
    ChatMessage,
    StreamingMessage,
    MessageActions,
    MessageStatusBadge,
    ChatComposer,
    Menu,
    MenuPopover,
    OverflowMenu,
    Popover,
    AspectRatio,
    TableOfContents,
    PasswordInput,
    PaginationNav,
    MenuTriggerButton,
    Toggletip,
    BackToTop,
    DisplaySettings,
    MediaContent,
    Embed,
    DataImage,
    Notification,
    Transcription,
    ForceGraph,
    GeoMap,
    TileGroup,
    Flex,
    Stack,
    Inline,
    Container,
    Row,
    Col,
    Hidden,
    Divider,
    Avatar,
    AvatarGroup,
    ButtonGroup,
    CheckboxGroup,
    RadioGroup,
    Typography,
    Collapsible,
    Stepper,
    Rating,
    TimePicker,
    Calendar,
    SlideIndicator,
    Autosave,
    Portal,
    Popper,
    SelectableRow,
    SelectableList,
    KpiCard,
    ConfigItemCard,
    FieldCard,
    ScoreCard,
    ComboChart,
    GaugeChart,
    SolidGaugeChart,
    StateTimelineChart,
    StatusHistoryChart,
    EventFeedPanel,
    VectorFieldChart,
    ContourChart,
    WindBarbChart,
    RenkoChart,
    PointAndFigureChart,
    WaffleChart,
    ColorSwatch,
    ColorScaleBar,
    RibbonChart,
    AnomalySwimLaneChart,
    FlamegraphChart,
    TraceWaterfallChart,
    DecompositionTreeChart,
    Density2DChart,
    FunnelChart,
    WaterfallChart,
    TreemapChart,
    WordCloudChart,
    OrganizationChart,
    TreegraphChart,
    BulletChart,
    MarimekkoChart,
    ParallelCoordinatesChart,
    CandlestickChart,
    OHLCChart,
    HLCChart,
    HollowCandlestickChart,
    HeikinAshiChart,
    TimelineChart,
    GanttChart,
    StreamgraphChart,
    CalendarHeatmapChart,
    BumpChart,
    StepLineChart,
    DivergentBarChart,
    FilterPill,
    FilterBar,
    SelectionChip,
    LollipopChart,
    ColumnRangeChart,
    ParetoChart,
    ChordDiagram,
    DependencyWheelChart,
    ArcDiagramChart,
    PackedBubblesChart,
    RangeSlider,
    Modal,
    Drawer
  } as unknown as Record<ComponentName, Component<Record<string, unknown>>>;

  let { node }: { node: NodeSpec } = $props();
</script>

{#if typeof node === "string"}
  {node}
{:else if isComponentNode(node)}
  {@const Comp = COMPONENTS[node.comp]}
  {@const props = adaptProps(node.comp, node.props)}
  {#if node.children && node.children.length}
    <Comp {...props}>
      {#each node.children as child, i (i)}
        <Self node={child} />
      {/each}
    </Comp>
  {:else}
    <Comp {...props} />
  {/if}
{:else if isElementNode(node)}
  <svelte:element this={node.el} {...node.props}>
    {#each node.children ?? [] as child, i (i)}
      <Self node={child} />
    {/each}
  </svelte:element>
{/if}
