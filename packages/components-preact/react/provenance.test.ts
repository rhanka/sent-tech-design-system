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
