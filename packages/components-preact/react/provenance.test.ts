// React leg only. Proves that the existing `components-react` tests of this
// run exercise the modules EMITTED from the single JSX source, not their
// hand-written twins: the module-level switch of `vitest.react.config.ts`
// applies to importers inside `components-react/src`, so the barrel resolves
// to the emission while this file can still reach the hand-written module.
import { describe, expect, it } from "vitest";
import * as barrel from "../../components-react/src/index.js";
import * as handWrittenButton from "../../components-react/src/Button.js";
import * as handWrittenButtonGroup from "../../components-react/src/ButtonGroup.js";
import * as handWrittenCard from "../../components-react/src/Card.js";
import * as handWrittenCatalog from "../../components-react/src/catalog.js";
import * as handWrittenCheckboxGroup from "../../components-react/src/CheckboxGroup.js";
import * as handWrittenCol from "../../components-react/src/Col.js";
import * as handWrittenRadioGroup from "../../components-react/src/RadioGroup.js";
import * as handWrittenRangeSlider from "../../components-react/src/RangeSlider.js";
import * as handWrittenSelectableList from "../../components-react/src/SelectableList.js";
import * as handWrittenTimeRangePicker from "../../components-react/src/TimeRangePicker.js";
import * as handWrittenCollapsible from "../../components-react/src/Collapsible.js";
import * as handWrittenContainer from "../../components-react/src/Container.js";
import * as handWrittenDivider from "../../components-react/src/Divider.js";
import * as handWrittenFieldCard from "../../components-react/src/FieldCard.js";
import * as handWrittenFlex from "../../components-react/src/Flex.js";
import * as handWrittenGrid from "../../components-react/src/Grid.js";
import * as handWrittenHidden from "../../components-react/src/Hidden.js";
import * as handWrittenInline from "../../components-react/src/Inline.js";
import * as handWrittenInput from "../../components-react/src/Input.js";
import * as handWrittenNotification from "../../components-react/src/Notification.js";
import * as handWrittenPanelSection from "../../components-react/src/PanelSection.js";
import * as handWrittenPanelStack from "../../components-react/src/PanelStack.js";
import * as handWrittenPortal from "../../components-react/src/Portal.js";
import * as handWrittenRow from "../../components-react/src/Row.js";
import * as handWrittenSelectableRow from "../../components-react/src/SelectableRow.js";
import * as handWrittenStack from "../../components-react/src/Stack.js";
import * as handWrittenStatusDot from "../../components-react/src/StatusDot.js";
import * as handWrittenTheme from "../../components-react/src/ThemeProvider.js";
import * as handWrittenTimeline from "../../components-react/src/Timeline.js";
import * as handWrittenBackToTop from "../../components-react/src/BackToTop.js";
import * as handWrittenAnomalySwimLaneChart from "../../components-react/src/AnomalySwimLaneChart.js";
import * as handWrittenArcDiagramChart from "../../components-react/src/ArcDiagramChart.js";
import * as handWrittenAreaChart from "../../components-react/src/AreaChart.js";
import * as handWrittenAreaRangeChart from "../../components-react/src/AreaRangeChart.js";
import * as handWrittenAreaSplineRangeChart from "../../components-react/src/AreaSplineRangeChart.js";
import * as handWrittenBarChart from "../../components-react/src/BarChart.js";
import * as handWrittenBellCurveChart from "../../components-react/src/BellCurveChart.js";
import * as handWrittenBoxPlotChart from "../../components-react/src/BoxPlotChart.js";
import * as handWrittenBulletChart from "../../components-react/src/BulletChart.js";
import * as handWrittenBumpChart from "../../components-react/src/BumpChart.js";
import * as handWrittenCalendarHeatmapChart from "../../components-react/src/CalendarHeatmapChart.js";
import * as handWrittenCandlestickChart from "../../components-react/src/CandlestickChart.js";
import * as handWrittenChordDiagram from "../../components-react/src/ChordDiagram.js";
import * as handWrittenColorScaleBar from "../../components-react/src/ColorScaleBar.js";
import * as handWrittenBadge from "../../components-react/src/Badge.js";
import * as handWrittenColorSwatch from "../../components-react/src/ColorSwatch.js";
import * as handWrittenNavActionStack from "../../components-react/src/NavActionStack.js";
import * as handWrittenNavItem from "../../components-react/src/NavItem.js";
import * as handWrittenStepper from "../../components-react/src/Stepper.js";
import * as handWrittenTableOfContents from "../../components-react/src/TableOfContents.js";
import * as handWrittenColumnPyramidChart from "../../components-react/src/ColumnPyramidChart.js";
import * as handWrittenColumnRangeChart from "../../components-react/src/ColumnRangeChart.js";
import * as handWrittenComboChart from "../../components-react/src/ComboChart.js";
import * as handWrittenConfigItemCard from "../../components-react/src/ConfigItemCard.js";
import * as handWrittenContourChart from "../../components-react/src/ContourChart.js";
import * as handWrittenDashboardGrid from "../../components-react/src/DashboardGrid.js";
import * as handWrittenDataImage from "../../components-react/src/DataImage.js";
import * as handWrittenDataTable from "../../components-react/src/DataTable.js";
import * as handWrittenDecompositionTreeChart from "../../components-react/src/DecompositionTreeChart.js";
import * as handWrittenDensity2DChart from "../../components-react/src/Density2DChart.js";
import * as handWrittenDependencyWheelChart from "../../components-react/src/DependencyWheelChart.js";
import * as handWrittenDivergentBarChart from "../../components-react/src/DivergentBarChart.js";
import * as handWrittenDonutChart from "../../components-react/src/DonutChart.js";
import * as handWrittenDumbbellChart from "../../components-react/src/DumbbellChart.js";
import * as handWrittenErrorBarChart from "../../components-react/src/ErrorBarChart.js";
import * as handWrittenEventFeedPanel from "../../components-react/src/EventFeedPanel.js";
import * as handWrittenFlamegraphChart from "../../components-react/src/FlamegraphChart.js";
import * as handWrittenFunnelChart from "../../components-react/src/FunnelChart.js";
import * as handWrittenGanttChart from "../../components-react/src/GanttChart.js";
import * as handWrittenGaugeChart from "../../components-react/src/GaugeChart.js";
import * as handWrittenGeoChart from "../../components-react/src/GeoChart.js";
import * as handWrittenHLCChart from "../../components-react/src/HLCChart.js";
import * as handWrittenHeatmapChart from "../../components-react/src/HeatmapChart.js";
import * as handWrittenHeikinAshiChart from "../../components-react/src/HeikinAshiChart.js";
import * as handWrittenHistogramChart from "../../components-react/src/HistogramChart.js";
import * as handWrittenHollowCandlestickChart from "../../components-react/src/HollowCandlestickChart.js";
import * as handWrittenItemChart from "../../components-react/src/ItemChart.js";
import * as emitted from "../.react-emit/src/index.js";

const switched = [
  "Button",
  "Input",
  "Modal",
  "Tabs",
  "SelectableRow",
  "ChatComposer",
  "Portal",
  "ThemeProvider",
  "Accordion",
  "Alert",
  "AspectRatio",
  "Autosave",
  "ButtonGroup",
  "Card",
  "Col",
  "Collapsible",
  "Container",
  "CopyButton",
  "Divider",
  "EmptyState",
  "ErrorSummary",
  "FieldCard",
  "Flex",
  "Grid",
  "Hidden",
  "Highlight",
  "IconButton",
  "Inline",
  "InlineLoading",
  "Link",
  "LoadingState",
  "Notification",
  "PanelSection",
  "PanelStack",
  "ProgressBar",
  "ProgressIndicator",
  "Quote",
  "Rating",
  "Row",
  "SkeletonText",
  "Stack",
  "StatusDot",
  "Tile",
  "Timeline",
  "Toast",
  "Calendar",
  "Checkbox",
  "CheckboxGroup",
  "Combobox",
  "ContentSwitcher",
  "DatePicker",
  "Dropdown",
  "FileUploader",
  "Form",
  "FormGroup",
  "Menu",
  "MenuPopover",
  "MultiSelect",
  "NumberInput",
  "PasswordInput",
  "Radio",
  "RadioGroup",
  "RangeSlider",
  "Search",
  "Select",
  "SelectableList",
  "Slider",
  "Switch",
  "Textarea",
  "TileGroup",
  "TimePicker",
  "TimeRangePicker",
  "Toggle",
  "MenuTriggerButton",
  "OverflowMenu",
  "Popover",
  "Toggletip",
  "Tooltip",
  "BackToTop",
  "Badge",
  "Breadcrumb",
  "ColorSwatch",
  "Footer",
  "Header",
  "LanguageToggle",
  "NavActionStack",
  "NavItem",
  "Pagination",
  "PaginationNav",
  "SideNav",
  "Stepper",
  "TableOfContents",
  "Drawer",
  "LanguageSelector",
  "SkipLink",
  "SlideIndicator",
  "TreeView",
  "AnomalySwimLaneChart",
  "ArcDiagramChart",
  "AreaChart",
  "AreaRangeChart",
  "AreaSplineRangeChart",
  "BarChart",
  "BellCurveChart",
  "BoxPlotChart",
  "BulletChart",
  "BumpChart",
  "CalendarHeatmapChart",
  "CandlestickChart",
  "ChordDiagram",
  "CodeSnippet",
  "ColorScaleBar",
  "ForceGraph",
  "GraphLegend",
  "ColumnPyramidChart",
  "ColumnRangeChart",
  "ComboChart",
  "ConfigItemCard",
  "ContourChart",
  "DashboardGrid",
  "DataImage",
  "DataTable",
  "DecompositionTreeChart",
  "Density2DChart",
  "DependencyWheelChart",
  "DivergentBarChart",
  "DonutChart",
  "DumbbellChart",
  "ErrorBarChart",
  "EventFeedPanel",
  "FilterBar",
  "FilterPill",
  "FlamegraphChart",
  "FunnelChart",
  "GanttChart",
  "GaugeChart",
  "GeoChart",
  "HLCChart",
  "HeatmapChart",
  "HeikinAshiChart",
  "HistogramChart",
  "HollowCandlestickChart",
  "ItemChart",
] as const;

const handWritten: Record<(typeof switched)[number], unknown> = {
  Button: handWrittenButton.Button,
  Input: handWrittenInput.Input,
  Modal: handWrittenCatalog.Modal,
  Tabs: handWrittenCatalog.Tabs,
  SelectableRow: handWrittenSelectableRow.SelectableRow,
  ChatComposer: handWrittenCatalog.ChatComposer,
  Portal: handWrittenPortal.Portal,
  ThemeProvider: handWrittenTheme.ThemeProvider,
  Accordion: handWrittenCatalog.Accordion,
  Alert: handWrittenCatalog.Alert,
  AspectRatio: handWrittenCatalog.AspectRatio,
  Autosave: handWrittenCatalog.Autosave,
  ButtonGroup: handWrittenButtonGroup.ButtonGroup,
  Card: handWrittenCard.Card,
  Col: handWrittenCol.Col,
  Collapsible: handWrittenCollapsible.Collapsible,
  Container: handWrittenContainer.Container,
  CopyButton: handWrittenCatalog.CopyButton,
  Divider: handWrittenDivider.Divider,
  EmptyState: handWrittenCatalog.EmptyState,
  ErrorSummary: handWrittenCatalog.ErrorSummary,
  FieldCard: handWrittenFieldCard.FieldCard,
  Flex: handWrittenFlex.Flex,
  Grid: handWrittenGrid.Grid,
  Hidden: handWrittenHidden.Hidden,
  Highlight: handWrittenCatalog.Highlight,
  IconButton: handWrittenCatalog.IconButton,
  Inline: handWrittenInline.Inline,
  InlineLoading: handWrittenCatalog.InlineLoading,
  Link: handWrittenCatalog.Link,
  LoadingState: handWrittenCatalog.LoadingState,
  Notification: handWrittenNotification.Notification,
  PanelSection: handWrittenPanelSection.PanelSection,
  PanelStack: handWrittenPanelStack.PanelStack,
  ProgressBar: handWrittenCatalog.ProgressBar,
  ProgressIndicator: handWrittenCatalog.ProgressIndicator,
  Quote: handWrittenCatalog.Quote,
  Rating: handWrittenCatalog.Rating,
  Row: handWrittenRow.Row,
  SkeletonText: handWrittenCatalog.SkeletonText,
  Stack: handWrittenStack.Stack,
  StatusDot: handWrittenStatusDot.StatusDot,
  Tile: handWrittenCatalog.Tile,
  Timeline: handWrittenTimeline.Timeline,
  Toast: handWrittenCatalog.Toast,
  Calendar: handWrittenCatalog.Calendar,
  Checkbox: handWrittenCatalog.Checkbox,
  CheckboxGroup: handWrittenCheckboxGroup.CheckboxGroup,
  Combobox: handWrittenCatalog.Combobox,
  ContentSwitcher: handWrittenCatalog.ContentSwitcher,
  DatePicker: handWrittenCatalog.DatePicker,
  Dropdown: handWrittenCatalog.Dropdown,
  FileUploader: handWrittenCatalog.FileUploader,
  Form: handWrittenCatalog.Form,
  FormGroup: handWrittenCatalog.FormGroup,
  Menu: handWrittenCatalog.Menu,
  MenuPopover: handWrittenCatalog.MenuPopover,
  MultiSelect: handWrittenCatalog.MultiSelect,
  NumberInput: handWrittenCatalog.NumberInput,
  PasswordInput: handWrittenCatalog.PasswordInput,
  Radio: handWrittenCatalog.Radio,
  RadioGroup: handWrittenRadioGroup.RadioGroup,
  RangeSlider: handWrittenRangeSlider.RangeSlider,
  Search: handWrittenCatalog.Search,
  Select: handWrittenCatalog.Select,
  SelectableList: handWrittenSelectableList.SelectableList,
  Slider: handWrittenCatalog.Slider,
  Switch: handWrittenCatalog.Switch,
  Textarea: handWrittenCatalog.Textarea,
  TileGroup: handWrittenCatalog.TileGroup,
  TimePicker: handWrittenCatalog.TimePicker,
  TimeRangePicker: handWrittenTimeRangePicker.TimeRangePicker,
  Toggle: handWrittenCatalog.Toggle,
  MenuTriggerButton: handWrittenCatalog.MenuTriggerButton,
  OverflowMenu: handWrittenCatalog.OverflowMenu,
  Popover: handWrittenCatalog.Popover,
  Toggletip: handWrittenCatalog.Toggletip,
  Tooltip: handWrittenCatalog.Tooltip,
  BackToTop: handWrittenBackToTop.BackToTop,
  Badge: handWrittenBadge.Badge,
  Breadcrumb: handWrittenCatalog.Breadcrumb,
  ColorSwatch: handWrittenColorSwatch.ColorSwatch,
  Footer: handWrittenCatalog.Footer,
  Header: handWrittenCatalog.Header,
  LanguageToggle: handWrittenCatalog.LanguageToggle,
  NavActionStack: handWrittenNavActionStack.NavActionStack,
  NavItem: handWrittenNavItem.NavItem,
  Pagination: handWrittenCatalog.Pagination,
  PaginationNav: handWrittenCatalog.PaginationNav,
  SideNav: handWrittenCatalog.SideNav,
  Stepper: handWrittenStepper.Stepper,
  TableOfContents: handWrittenTableOfContents.TableOfContents,
  Drawer: handWrittenCatalog.Drawer,
  LanguageSelector: handWrittenCatalog.LanguageSelector,
  SkipLink: handWrittenCatalog.SkipLink,
  SlideIndicator: handWrittenCatalog.SlideIndicator,
  TreeView: handWrittenCatalog.TreeView,
  AnomalySwimLaneChart: handWrittenAnomalySwimLaneChart.AnomalySwimLaneChart,
  ArcDiagramChart: handWrittenArcDiagramChart.ArcDiagramChart,
  AreaChart: handWrittenAreaChart.AreaChart,
  AreaRangeChart: handWrittenAreaRangeChart.AreaRangeChart,
  AreaSplineRangeChart: handWrittenAreaSplineRangeChart.AreaSplineRangeChart,
  BarChart: handWrittenBarChart.BarChart,
  BellCurveChart: handWrittenBellCurveChart.BellCurveChart,
  BoxPlotChart: handWrittenBoxPlotChart.BoxPlotChart,
  BulletChart: handWrittenBulletChart.BulletChart,
  BumpChart: handWrittenBumpChart.BumpChart,
  CalendarHeatmapChart: handWrittenCalendarHeatmapChart.CalendarHeatmapChart,
  CandlestickChart: handWrittenCandlestickChart.CandlestickChart,
  ChordDiagram: handWrittenChordDiagram.ChordDiagram,
  CodeSnippet: handWrittenCatalog.CodeSnippet,
  ColorScaleBar: handWrittenColorScaleBar.ColorScaleBar,
  ForceGraph: handWrittenCatalog.ForceGraph,
  GraphLegend: handWrittenCatalog.GraphLegend,
  ColumnPyramidChart: handWrittenColumnPyramidChart.ColumnPyramidChart,
  ColumnRangeChart: handWrittenColumnRangeChart.ColumnRangeChart,
  ComboChart: handWrittenComboChart.ComboChart,
  ConfigItemCard: handWrittenConfigItemCard.ConfigItemCard,
  ContourChart: handWrittenContourChart.ContourChart,
  DashboardGrid: handWrittenDashboardGrid.DashboardGrid,
  DataImage: handWrittenDataImage.DataImage,
  DataTable: handWrittenDataTable.DataTable,
  DecompositionTreeChart: handWrittenDecompositionTreeChart.DecompositionTreeChart,
  Density2DChart: handWrittenDensity2DChart.Density2DChart,
  DependencyWheelChart: handWrittenDependencyWheelChart.DependencyWheelChart,
  DivergentBarChart: handWrittenDivergentBarChart.DivergentBarChart,
  DonutChart: handWrittenDonutChart.DonutChart,
  DumbbellChart: handWrittenDumbbellChart.DumbbellChart,
  ErrorBarChart: handWrittenErrorBarChart.ErrorBarChart,
  EventFeedPanel: handWrittenEventFeedPanel.EventFeedPanel,
  FilterBar: handWrittenCatalog.FilterBar,
  FilterPill: handWrittenCatalog.FilterPill,
  FlamegraphChart: handWrittenFlamegraphChart.FlamegraphChart,
  FunnelChart: handWrittenFunnelChart.FunnelChart,
  GanttChart: handWrittenGanttChart.GanttChart,
  GaugeChart: handWrittenGaugeChart.GaugeChart,
  GeoChart: handWrittenGeoChart.GeoChart,
  HLCChart: handWrittenHLCChart.HLCChart,
  HeatmapChart: handWrittenHeatmapChart.HeatmapChart,
  HeikinAshiChart: handWrittenHeikinAshiChart.HeikinAshiChart,
  HistogramChart: handWrittenHistogramChart.HistogramChart,
  HollowCandlestickChart: handWrittenHollowCandlestickChart.HollowCandlestickChart,
  ItemChart: handWrittenItemChart.ItemChart,
};

describe("React leg provenance", () => {
  for (const name of switched) {
    it(`the components-react barrel serves the emitted ${name}`, () => {
      expect(emitted[name]).toBeTruthy();
      expect(barrel[name]).toBe(emitted[name]);
      expect(barrel[name]).not.toBe(handWritten[name]);
    });
  }

  it("hand-written dependents share the contexts of the emitted SelectableRow", () => {
    expect(barrel.SelectableListContext).toBe(emitted.SelectableListContext);
    expect(barrel.SelectableListContext).not.toBe(handWrittenSelectableRow.SelectableListContext);
  });
});
