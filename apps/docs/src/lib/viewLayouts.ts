/**
 * viewLayouts.ts — 7 fonctions data→NodeSpec pour les gabarits de vues DS.
 * Chaque fonction prend une config avec des chaînes déjà localisées
 * et retourne un NodeSpec[] prêt pour TabbedExample.
 * CSS partagé : classes `.vl-*` dans app.css.
 */

import type { NodeSpec, ComponentNodeSpec } from "./framework/examples";

// ── Types partagés ──────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface ColumnSpec {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "start" | "center" | "end";
}

export type RowSpec = Record<string, string | number>;

export interface FilterSpec {
  field: string;
  operator: string;
  value: string;
  active?: boolean;
  removable?: boolean;
}

export interface KpiSpec {
  label: string;
  value: number;
  format?: "currency" | "percent" | "number";
  unit?: string;
  delta?: number;
  deltaFormat?: "absolute" | "percent";
  tone?: "category1" | "category2" | "category3" | "category4" | "category5";
  sparkline?: number[];
}

export interface FieldSpec {
  key: string;
  value: string;
}

export interface RowActionSpec {
  id: string;
  label: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface ChartSpec {
  comp: "AreaChart" | "BarChart" | "LineChart" | "PieChart" | "ScatterPlot";
  label: string;
  data: unknown;
  height?: number;
  tone?: string;
  /** Fraction of row width (1 = full, 0.5 = half, 0.66 = two-thirds) */
  flex?: number;
}

export interface KanbanCard {
  id: string;
  title: string;
  subtitle?: string;
  owner?: string;
  ownerTone?: "category1" | "category2" | "category3" | "category4" | "category5";
  badgeLabel?: string;
  badgeTone?: "neutral" | "info" | "success" | "warning" | "error";
  progress?: number;
}

export interface KanbanColumn {
  label: string;
  badgeTone?: "neutral" | "info" | "success" | "warning" | "error";
  cards: KanbanCard[];
}

export interface WizardStep {
  label: string;
  description?: string;
}

// ── Helpers internes ────────────────────────────────────────────────────────

function headerNode(appTitle: string, navItems: NavItem[]): NodeSpec {
  return {
    comp: "Header",
    props: {
      title: appTitle,
      navItems: navItems.map((i) => ({ label: i.label, href: i.href, active: i.active })),
    },
  };
}

function sideNavNode(navItems: NavItem[]): NodeSpec {
  return {
    comp: "SideNav",
    props: { items: navItems.map((i) => ({ label: i.label, href: i.href, active: i.active })) },
  };
}

function kpiRowNode(kpis: KpiSpec[]): NodeSpec {
  return {
    el: "div",
    props: { class: "vl-kpi-row" },
    children: kpis.map((k) => ({
      comp: "KpiCard" as const,
      props: {
        label: k.label,
        value: k.value,
        ...(k.format ? { format: k.format } : {}),
        ...(k.unit ? { unit: k.unit } : {}),
        ...(k.delta !== undefined ? { delta: k.delta } : {}),
        ...(k.deltaFormat ? { deltaFormat: k.deltaFormat } : {}),
        ...(k.tone ? { tone: k.tone } : {}),
        ...(k.sparkline ? { sparkline: k.sparkline } : {}),
      },
    })),
  };
}

function fieldsGridNode(fields: FieldSpec[]): NodeSpec {
  return {
    el: "dl",
    props: { class: "vl-fields-grid" },
    children: fields.flatMap((f) => [
      { el: "dt" as const, props: { class: "vl-field-key" }, children: [f.key] },
      { el: "dd" as const, props: { class: "vl-field-value" }, children: [f.value] },
    ]),
  };
}

function titlebarNode(
  title: string,
  opts?: { primaryAction?: string; secondaryAction?: string }
): NodeSpec {
  const children: NodeSpec[] = [
    { el: "h2", props: { class: "vl-title" }, children: [title] },
  ];
  if (opts?.secondaryAction || opts?.primaryAction) {
    const btns: NodeSpec[] = [];
    if (opts?.secondaryAction)
      btns.push({
        comp: "Button",
        props: { variant: "secondary", size: "sm" },
        children: [opts.secondaryAction],
      });
    if (opts?.primaryAction)
      btns.push({
        comp: "Button",
        props: { variant: "primary", size: "sm" },
        children: [opts.primaryAction],
      });
    children.push({ el: "div", props: { class: "vl-titlebar-actions" }, children: btns });
  }
  return { el: "div", props: { class: "vl-titlebar" }, children };
}

// ── 1. listReportLayout ─────────────────────────────────────────────────────

export interface ListReportConfig {
  appTitle: string;
  navItems: NavItem[];
  pageTitle: string;
  primaryAction?: string;
  secondaryAction?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  filterBarLabel?: string;
  filters?: FilterSpec[];
  columns: ColumnSpec[];
  rows: RowSpec[];
  pageSize?: number;
  caption?: string;
  rowActionsLabel?: string;
  rowActions?: RowActionSpec[];
}

export function listReportLayout(cfg: ListReportConfig): NodeSpec[] {
  const mainChildren: NodeSpec[] = [titlebarNode(cfg.pageTitle, cfg)];

  // Toolbar
  const toolbarChildren: NodeSpec[] = [];
  if (cfg.searchLabel || cfg.searchPlaceholder) {
    toolbarChildren.push({
      el: "div",
      props: { class: "vl-lr-search" },
      children: [
        {
          comp: "Search",
          props: { label: cfg.searchLabel ?? "", placeholder: cfg.searchPlaceholder ?? "" },
        },
      ],
    });
  }
  if (cfg.filters?.length) {
    toolbarChildren.push({
      comp: "FilterBar",
      props: { label: cfg.filterBarLabel ?? "" },
      children: cfg.filters.map((f) => ({
        comp: "FilterPill" as const,
        props: { field: f.field, operator: f.operator, value: f.value, active: f.active ?? true, removable: f.removable ?? true },
      })),
    });
  }
  if (toolbarChildren.length) {
    mainChildren.push({ el: "div", props: { class: "vl-toolbar" }, children: toolbarChildren });
  }

  // Table
  mainChildren.push({
    el: "div",
    props: { class: "vl-table" },
    children: [
      {
        comp: "DataTable",
        props: {
          caption: cfg.caption ?? cfg.pageTitle,
          columns: cfg.columns,
          rows: cfg.rows,
          sortable: true,
          pageSize: cfg.pageSize ?? 5,
          size: "sm",
        },
      },
    ],
  });

  // Row actions
  if (cfg.rowActions?.length) {
    mainChildren.push({
      el: "div",
      props: { class: "vl-lr-rowmenu" },
      children: [
        ...(cfg.rowActionsLabel
          ? [{ el: "span" as const, props: { class: "vl-lr-rowmenu-label" }, children: [cfg.rowActionsLabel] }]
          : []),
        { comp: "OverflowMenu", props: { label: "⋮", items: cfg.rowActions } },
      ],
    });
  }

  return [
    {
      el: "div",
      props: { class: "vl-shell" },
      children: [
        headerNode(cfg.appTitle, cfg.navItems),
        {
          el: "div",
          props: { class: "vl-body" },
          children: [
            { el: "aside", props: { class: "vl-aside" }, children: [sideNavNode(cfg.navItems)] },
            { el: "main", props: { class: "vl-main" }, children: mainChildren },
          ],
        },
      ],
    },
  ];
}

// ── 2. objectPageLayout ─────────────────────────────────────────────────────

export interface ObjectPageConfig {
  breadcrumb?: BreadcrumbItem[];
  entityTitle: string;
  entityStatus?: { label: string; tone: "neutral" | "info" | "success" | "warning" | "error" };
  primaryAction?: string;
  secondaryAction?: string;
  kpis?: KpiSpec[];
  fieldsTitle?: string;
  fields: FieldSpec[];
  relatedTitle?: string;
  relatedColumns?: ColumnSpec[];
  relatedRows?: RowSpec[];
}

export function objectPageLayout(cfg: ObjectPageConfig): NodeSpec[] {
  const children: NodeSpec[] = [];

  // Breadcrumb
  if (cfg.breadcrumb?.length) {
    children.push({
      comp: "Breadcrumb",
      props: { items: cfg.breadcrumb.map((b) => ({ label: b.label, href: b.href, current: b.current })) },
    });
  }

  // Entity header
  const headerIdChildren: NodeSpec[] = [
    { el: "h2", props: { class: "vl-op-title" }, children: [cfg.entityTitle] },
  ];
  if (cfg.entityStatus) {
    headerIdChildren.push({
      comp: "Badge",
      props: { tone: cfg.entityStatus.tone },
      children: [cfg.entityStatus.label],
    });
  }
  const headerChildren: NodeSpec[] = [
    { el: "div", props: { class: "vl-op-header-id" }, children: headerIdChildren },
  ];
  if (cfg.secondaryAction || cfg.primaryAction) {
    const btns: NodeSpec[] = [];
    if (cfg.secondaryAction) btns.push({ comp: "Button", props: { variant: "secondary", size: "sm" }, children: [cfg.secondaryAction] });
    if (cfg.primaryAction) btns.push({ comp: "Button", props: { variant: "primary", size: "sm" }, children: [cfg.primaryAction] });
    headerChildren.push({ el: "div", props: { class: "vl-op-header-actions" }, children: btns });
  }
  children.push({ el: "div", props: { class: "vl-op-header" }, children: headerChildren });

  // KPIs
  if (cfg.kpis?.length) {
    children.push(kpiRowNode(cfg.kpis));
  }

  // Fields
  const fieldsSection: NodeSpec[] = [];
  if (cfg.fieldsTitle) {
    fieldsSection.push({ el: "h3", props: { class: "vl-section-title" }, children: [cfg.fieldsTitle] });
  }
  fieldsSection.push(fieldsGridNode(cfg.fields));
  children.push({ el: "section", props: { class: "vl-op-fields" }, children: fieldsSection });

  // Related table
  if (cfg.relatedColumns?.length && cfg.relatedRows?.length) {
    const relatedChildren: NodeSpec[] = [];
    if (cfg.relatedTitle) {
      relatedChildren.push({ el: "h3", props: { class: "vl-section-title" }, children: [cfg.relatedTitle] });
    }
    relatedChildren.push({
      comp: "DataTable",
      props: {
        caption: cfg.relatedTitle ?? "",
        columns: cfg.relatedColumns,
        rows: cfg.relatedRows,
        sortable: true,
        pageSize: 5,
        size: "sm",
      },
    });
    children.push({ el: "section", props: { class: "vl-op-related" }, children: relatedChildren });
  }

  return [{ el: "div", props: { class: "vl-op-shell" }, children }];
}

// ── 3. dashboardLayout ──────────────────────────────────────────────────────

export interface DashboardConfig {
  appTitle: string;
  navItems: NavItem[];
  pageTitle: string;
  kpis: KpiSpec[];
  charts: ChartSpec[];
}

export function dashboardLayout(cfg: DashboardConfig): NodeSpec[] {
  const mainChildren: NodeSpec[] = [
    { el: "h2", props: { class: "vl-title" }, children: [cfg.pageTitle] },
    kpiRowNode(cfg.kpis),
    {
      el: "div",
      props: { class: "vl-charts-row" },
      children: cfg.charts.map((c) => ({
        el: "div" as const,
        props: { class: "vl-chart-cell", style: c.flex ? `flex: ${c.flex}` : undefined },
        children: [
          {
            comp: c.comp as ComponentNodeSpec["comp"],
            props: {
              label: c.label,
              data: c.data,
              height: c.height ?? 220,
              ...(c.tone ? { tone: c.tone } : {}),
            },
          } as NodeSpec,
        ],
      })),
    },
  ];

  return [
    {
      el: "div",
      props: { class: "vl-shell" },
      children: [
        headerNode(cfg.appTitle, cfg.navItems),
        {
          el: "div",
          props: { class: "vl-body" },
          children: [
            { el: "aside", props: { class: "vl-aside" }, children: [sideNavNode(cfg.navItems)] },
            { el: "main", props: { class: "vl-main" }, children: mainChildren },
          ],
        },
      ],
    },
  ];
}

// ── 4. kanbanLayout ─────────────────────────────────────────────────────────

export interface KanbanConfig {
  appTitle: string;
  navItems: NavItem[];
  pageTitle: string;
  primaryAction?: string;
  columns: KanbanColumn[];
  progressLabel?: string;
}

export function kanbanLayout(cfg: KanbanConfig): NodeSpec[] {
  function cardNode(card: KanbanCard): NodeSpec {
    const cardChildren: NodeSpec[] = [
      { el: "h4", props: { class: "vl-kb-card-title" }, children: [card.title] },
    ];
    if (card.subtitle || card.badgeLabel) {
      const metaChildren: NodeSpec[] = [];
      if (card.subtitle)
        metaChildren.push({ el: "span", props: { class: "vl-kb-card-subtitle" }, children: [card.subtitle] });
      if (card.badgeLabel)
        metaChildren.push({
          comp: "Badge",
          props: { tone: card.badgeTone ?? "neutral" },
          children: [card.badgeLabel],
        });
      cardChildren.push({ el: "div", props: { class: "vl-kb-card-meta" }, children: metaChildren });
    }
    if (card.progress !== undefined) {
      cardChildren.push({
        comp: "ProgressBar",
        props: { label: cfg.progressLabel ?? "Progress", value: card.progress, size: "sm", showValue: true },
      });
    }
    if (card.owner) {
      cardChildren.push({
        el: "div",
        props: { class: "vl-kb-card-owner" },
        children: [
          {
            comp: "Avatar",
            props: { name: card.owner, size: "sm", ...(card.ownerTone ? { tone: card.ownerTone } : {}) },
          },
          { el: "span", props: { class: "vl-kb-card-owner-name" }, children: [card.owner] },
        ],
      });
    }
    return { comp: "Card", props: { interactive: true, class: "vl-kb-card" }, children: cardChildren };
  }

  function columnNode(col: KanbanColumn): NodeSpec {
    return {
      el: "div",
      props: { class: "vl-kb-column" },
      children: [
        {
          el: "div",
          props: { class: "vl-kb-column-head" },
          children: [
            { el: "span", props: { class: "vl-kb-column-title" }, children: [col.label] },
            { comp: "Badge", props: { tone: col.badgeTone ?? "neutral" }, children: [String(col.cards.length)] },
          ],
        },
        {
          el: "div",
          props: { class: "vl-kb-column-body" },
          children: col.cards.map(cardNode),
        },
      ],
    };
  }

  return [
    {
      el: "div",
      props: { class: "vl-shell" },
      children: [
        headerNode(cfg.appTitle, cfg.navItems),
        {
          el: "div",
          props: { class: "vl-body" },
          children: [
            { el: "aside", props: { class: "vl-aside" }, children: [sideNavNode(cfg.navItems)] },
            {
              el: "main",
              props: { class: "vl-main" },
              children: [
                titlebarNode(cfg.pageTitle, { primaryAction: cfg.primaryAction }),
                {
                  el: "div",
                  props: { class: "vl-kb-board" },
                  children: cfg.columns.map(columnNode),
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

// ── 5. masterDetailLayout ───────────────────────────────────────────────────

export interface MasterItem {
  id: string;
  primary: string;
  secondary?: string;
  statusLabel?: string;
  statusTone?: "neutral" | "info" | "success" | "warning" | "error";
  active?: boolean;
}

export interface MasterDetailConfig {
  appTitle: string;
  navItems: NavItem[];
  listTitle: string;
  listItems: MasterItem[];
  searchPlaceholder?: string;
  detailTitle: string;
  detailSubtitle?: string;
  detailStatus?: { label: string; tone: "neutral" | "info" | "success" | "warning" | "error" };
  detailActions?: string[];
  detailFields: FieldSpec[];
}

export function masterDetailLayout(cfg: MasterDetailConfig): NodeSpec[] {
  const listChildren: NodeSpec[] = [
    { el: "h3", props: { class: "vl-md-list-title" }, children: [cfg.listTitle] },
  ];
  if (cfg.searchPlaceholder) {
    listChildren.push({
      comp: "Search",
      props: { label: "", placeholder: cfg.searchPlaceholder },
    });
  }
  listChildren.push(
    ...cfg.listItems.map((item) => ({
      el: "div" as const,
      props: { class: item.active ? "vl-md-list-item vl-md-list-item--active" : "vl-md-list-item" },
      children: [
        { el: "div" as const, props: { class: "vl-md-list-item-primary" }, children: [item.primary] },
        ...(item.secondary
          ? [{ el: "div" as const, props: { class: "vl-md-list-item-secondary" }, children: [item.secondary] }]
          : []),
        ...(item.statusLabel
          ? [{ comp: "Badge" as const, props: { tone: item.statusTone ?? "neutral" }, children: [item.statusLabel] }]
          : []),
      ],
    }))
  );

  const detailHeaderChildren: NodeSpec[] = [
    { el: "h2", props: { class: "vl-md-detail-title" }, children: [cfg.detailTitle] },
  ];
  if (cfg.detailStatus) {
    detailHeaderChildren.push({
      comp: "Badge",
      props: { tone: cfg.detailStatus.tone },
      children: [cfg.detailStatus.label],
    });
  }
  if (cfg.detailActions?.length) {
    detailHeaderChildren.push({
      el: "div",
      props: { class: "vl-md-detail-actions" },
      children: cfg.detailActions.map((a, i) => ({
        comp: "Button" as const,
        props: { variant: i === 0 ? "primary" : "secondary", size: "sm" },
        children: [a],
      })),
    });
  }

  const detailChildren: NodeSpec[] = [
    { el: "div", props: { class: "vl-md-detail-header" }, children: detailHeaderChildren },
    fieldsGridNode(cfg.detailFields),
  ];

  return [
    {
      el: "div",
      props: { class: "vl-shell" },
      children: [
        headerNode(cfg.appTitle, cfg.navItems),
        {
          el: "div",
          props: { class: "vl-body" },
          children: [
            { el: "aside", props: { class: "vl-aside" }, children: [sideNavNode(cfg.navItems)] },
            {
              el: "main",
              props: { class: "vl-main vl-main--no-pad" },
              children: [
                {
                  el: "div",
                  props: { class: "vl-md-split" },
                  children: [
                    { el: "div", props: { class: "vl-md-list" }, children: listChildren },
                    { el: "div", props: { class: "vl-md-detail" }, children: detailChildren },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

// ── 6. wizardLayout ─────────────────────────────────────────────────────────

export interface WizardConfig {
  stepperLabel: string;
  steps: WizardStep[];
  currentStep: number;
  stepTitle: string;
  stepContent: NodeSpec[];
  cancelLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  isLast?: boolean;
}

export function wizardLayout(cfg: WizardConfig): NodeSpec[] {
  const footerBtns: NodeSpec[] = [];
  if (cfg.cancelLabel)
    footerBtns.push({ comp: "Button", props: { variant: "ghost", size: "sm" }, children: [cfg.cancelLabel] });
  if (cfg.backLabel && cfg.currentStep > 0)
    footerBtns.push({ comp: "Button", props: { variant: "secondary", size: "sm" }, children: [cfg.backLabel] });
  if (cfg.isLast && cfg.finishLabel)
    footerBtns.push({ comp: "Button", props: { variant: "primary", size: "sm" }, children: [cfg.finishLabel] });
  else if (cfg.nextLabel)
    footerBtns.push({ comp: "Button", props: { variant: "primary", size: "sm" }, children: [cfg.nextLabel] });

  return [
    {
      el: "div",
      props: { class: "vl-wz-shell" },
      children: [
        {
          comp: "Stepper",
          props: { current: cfg.currentStep, label: cfg.stepperLabel, steps: cfg.steps },
        },
        {
          el: "div",
          props: { class: "vl-wz-body" },
          children: [
            {
              el: "div",
              props: { class: "vl-wz-step" },
              children: [
                { el: "h3", props: { class: "vl-wz-step-title" }, children: [cfg.stepTitle] },
                ...cfg.stepContent,
              ],
            },
            { el: "div", props: { class: "vl-wz-footer" }, children: footerBtns },
          ],
        },
      ],
    },
  ];
}

// ── 7. appShellLayout ───────────────────────────────────────────────────────

export interface AppShellConfig {
  appTitle: string;
  navItems: NavItem[];
  content?: NodeSpec[];
}

export function appShellLayout(cfg: AppShellConfig): NodeSpec[] {
  return [
    {
      el: "div",
      props: { class: "vl-shell" },
      children: [
        headerNode(cfg.appTitle, cfg.navItems),
        {
          el: "div",
          props: { class: "vl-body" },
          children: [
            { el: "aside", props: { class: "vl-aside" }, children: [sideNavNode(cfg.navItems)] },
            {
              el: "main",
              props: { class: "vl-main" },
              children: cfg.content ?? [],
            },
          ],
        },
      ],
    },
  ];
}
