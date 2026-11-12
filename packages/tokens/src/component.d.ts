import type { ComponentAnatomy, DensityAnatomy, TypographyAnatomy } from "./anatomy.js";
interface SemanticInput {
    surface: {
        default: string;
        subtle: string;
        raised: string;
        inverse: string;
        overlay: string;
    };
    text: {
        primary: string;
        secondary: string;
        muted: string;
        inverse: string;
        link: string;
    };
    action: {
        primary: string;
        primaryText: string;
        secondary: string;
        secondaryText: string;
        primaryHover?: string;
        secondaryHover?: string;
    };
    border: {
        subtle: string;
        strong: string;
        interactive: string;
    };
    feedback: {
        info: string;
        success: string;
        warning: string;
        error: string;
    };
    data: {
        category1: string;
        category2: string;
        category3: string;
        category4: string;
    };
}
type DensityInput = Partial<Record<"sm" | "md" | "lg", Partial<DensityAnatomy>>>;
type TypographyRolesInput = Partial<Record<"control" | "field" | "label" | "link", Partial<TypographyAnatomy>>>;
interface FocusInput {
    strategy?: string;
    width?: string;
    offset?: string;
    color?: string;
    inset?: string;
}
interface FieldInput {
    style?: string;
    fillBg?: string;
    underlineColor?: string;
    underlineWidth?: string;
    radiusTop?: string;
    radiusBottom?: string;
    underlineMode?: string;
    selectAppearance?: string;
    selectChevron?: string;
    selectPaddingRight?: string;
}
interface CardInput {
    borderWidth?: string;
    background?: string;
    hoverBackground?: string;
    fontSize?: string;
    lineHeight?: string;
    letterSpacing?: string;
}
interface ButtonSecondaryInput {
    background?: string;
    border?: string;
    hoverBackground?: string;
}
interface TabsInput {
    activeText?: string;
    activeBackground?: string;
    inactiveBackground?: string;
    activeWeight?: string;
    paddingBlock?: string;
    paddingInline?: string;
    fontSize?: string;
    lineHeight?: string;
    indicatorSide?: string;
    indicatorMode?: string;
}
interface PaginationInput {
    background?: string;
    border?: string;
    borderWidth?: string;
    text?: string;
    radius?: string;
    activeBackground?: string;
    activeText?: string;
    activeBorder?: string;
    activeBorderWidth?: string;
    activeWeight?: string;
    disabledText?: string;
    paddingBlock?: string;
    paddingInline?: string;
    minSize?: string;
    fontSize?: string;
    lineHeight?: string;
    letterSpacing?: string;
}
interface BreadcrumbInput {
    text?: string;
    linkText?: string;
    currentText?: string;
    separator?: string;
    fontSize?: string;
    lineHeight?: string;
    letterSpacing?: string;
    currentWeight?: string;
}
interface AlertInput {
    background?: string;
    text?: string;
    borderTop?: string;
    borderRight?: string;
    borderBottom?: string;
    accentWidth?: string;
    filetWidth?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    fontSize?: string;
    lineHeight?: string;
    letterSpacing?: string;
    accentInfo?: string;
    accentSuccess?: string;
    accentWarning?: string;
    accentError?: string;
}
interface AccordionInput {
    text?: string;
    paddingBlock?: string;
    paddingInline?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
}
interface CollapsibleInput {
    smFontSize?: string;
    smFontWeight?: string;
    smPaddingBlock?: string;
    smPaddingInline?: string;
    lgFontSize?: string;
    lgPaddingBlock?: string;
    lgPaddingInline?: string;
}
interface TagInput {
    radius?: string;
    paddingBlock?: string;
    paddingInline?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textTransform?: string;
    minHeight?: string;
    neutralBackground?: string;
    neutralText?: string;
}
interface BadgeInput {
    radius?: string;
    paddingBlock?: string;
    paddingInline?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textTransform?: string;
    minHeight?: string;
    infoBackground?: string;
    infoText?: string;
    circleSize?: string;
    circleRadius?: string;
    circlePadding?: string;
    smFontSize?: string;
}
interface ChoiceInput {
    labelFontSize?: string;
    labelLineHeight?: string;
    radioLineHeight?: string;
    labelLetterSpacing?: string;
    labelColor?: string;
}
interface SearchInput {
    paddingBlock?: string;
    paddingInline?: string;
    paddingLeft?: string;
    paddingRight?: string;
    fontSize?: string;
    lineHeight?: string;
    letterSpacing?: string;
}
interface ToggleInput {
    trackRadius?: string;
    trackPadding?: string;
    trackWidth?: string;
    trackHeight?: string;
    thumbSize?: string;
    trackColor?: string;
    trackCheckedColor?: string;
    thumbColor?: string;
    fontSize?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textColor?: string;
}
interface SelectableRowInput {
    selectedBackground?: string;
    selectedAccent?: string;
    selectedText?: string;
    selectedBackgroundDark?: string;
    selectedAccentDark?: string;
    selectedTextDark?: string;
    captionFontSize?: string;
    captionColor?: string;
    captionGap?: string;
}
interface IconInput {
    strokeWidth?: string;
    color?: string;
}
interface FoundationInput {
    radius: {
        none?: string;
        sm?: string;
        md: string;
        lg: string;
        pill: string;
    };
    shadow: {
        subtle: string;
        medium: string;
        floating: string;
    };
    spacing: {
        readonly [key: number]: string;
    };
    z: {
        overlay: number;
        modal: number;
        toast: number;
    };
    borderWidth?: {
        none?: string;
        thin?: string;
        thick?: string;
    };
    borderStyle?: {
        solid?: string;
    };
    density?: DensityInput;
    typography?: TypographyRolesInput;
    disabledOpacity?: string;
    transition?: {
        property?: string;
        duration?: string;
        easing?: string;
    };
    cursor?: {
        interactive?: string;
        disabled?: string;
        text?: string;
    };
    iconSize?: {
        sm?: string;
        md?: string;
        lg?: string;
    };
    focus?: FocusInput;
    field?: FieldInput;
    card?: CardInput;
    tabs?: TabsInput;
    buttonSecondary?: ButtonSecondaryInput;
    pagination?: PaginationInput;
    breadcrumb?: BreadcrumbInput;
    alert?: AlertInput;
    accordion?: AccordionInput;
    collapsible?: CollapsibleInput;
    tag?: TagInput;
    badge?: BadgeInput;
    choice?: ChoiceInput;
    search?: SearchInput;
    toggle?: ToggleInput;
    selectableRow?: SelectableRowInput;
    icon?: IconInput;
    buttonDensity?: Partial<Record<"sm" | "md" | "lg", Partial<DensityAnatomy> & {
        paddingInlineEnd?: string;
    }>>;
}
/**
 * Construit la couche `component` à partir d'un `semantic` et d'un `foundation`
 * donnés. Les rôles composant sont CÂBLÉS sur les rôles semantic/foundation du
 * thème appelant — c'est ce qui permet à un thème (DSFR, Carbon, forge…) de
 * propager sa marque jusqu'aux composants. Réutiliser un `component` figé sur
 * une autre base rendrait les composants inertes au changement de thème.
 */
export declare function createComponent(semantic: SemanticInput, foundation: FoundationInput): {
    readonly button: {
        readonly radius: string;
        readonly primaryBackground: string;
        readonly primaryText: string;
        readonly secondaryBackground: string;
        readonly secondaryBorder: string;
        readonly secondaryHoverBackground: string;
        readonly secondaryText: string;
        readonly anatomy: ComponentAnatomy;
    };
    readonly link: {
        readonly text: string;
        readonly hoverText: string;
        readonly disabledText: string;
        readonly focusRing: string;
        readonly anatomy: ComponentAnatomy;
    };
    readonly alert: {
        readonly background: string;
        readonly text: string;
        readonly border: string;
        readonly infoBorder: string;
        readonly successBorder: string;
        readonly warningBorder: string;
        readonly errorBorder: string;
        readonly radius: string;
        readonly borderTop: string;
        readonly borderRight: string;
        readonly borderBottom: string;
        readonly accentWidth: string;
        readonly filetWidth: string;
        readonly paddingTop: string;
        readonly paddingRight: string;
        readonly paddingBottom: string;
        readonly paddingLeft: string;
        readonly fontSize: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
    };
    readonly accordion: {
        readonly text: string;
        readonly paddingBlock: string;
        readonly paddingInline: string;
        readonly fontSize: string;
        readonly fontWeight: string;
        readonly lineHeight: string;
    };
    readonly tag: {
        readonly radius: string;
        readonly paddingBlock: string;
        readonly paddingInline: string;
        readonly fontSize: string;
        readonly fontWeight: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
        readonly textTransform: string;
        readonly minHeight: string;
        readonly neutralBackground: string;
        readonly neutralText: string;
    };
    readonly badge: {
        readonly radius: string;
        readonly paddingBlock: string;
        readonly paddingInline: string;
        readonly fontSize: string;
        readonly fontWeight: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
        readonly textTransform: string;
        readonly minHeight: string;
        readonly infoBackground: string;
        readonly infoText: string;
    };
    readonly card: {
        readonly background: string;
        readonly border: string;
        readonly radius: string;
        readonly shadow: string;
        readonly anatomy: ComponentAnatomy;
    };
    readonly menu: {
        readonly background: string;
        readonly border: string;
        readonly text: string;
        readonly itemHoverBackground: string;
        readonly dangerText: string;
        readonly dangerHoverBackground: "rgba(185, 28, 28, 0.08)";
        readonly disabledText: string;
        readonly radius: string;
        readonly shadow: string;
    };
    readonly popover: {
        readonly background: string;
        readonly border: string;
        readonly text: string;
        readonly shadow: string;
        readonly radius: string;
        readonly zIndex: number;
    };
    readonly dropdown: {
        readonly background: string;
        readonly border: string;
        readonly text: string;
        readonly optionHoverBackground: string;
        readonly selectedBackground: string;
        readonly selectedText: string;
        readonly radius: string;
        readonly shadow: string;
    };
    readonly input: {
        readonly background: string;
        readonly border: string;
        readonly focusRing: string;
        readonly radius: string;
    };
    readonly field: {
        readonly labelText: string;
        readonly helpText: string;
        readonly errorText: string;
        readonly gap: string;
        readonly maxWidth: "28rem";
        readonly labelTypography: TypographyAnatomy;
    };
    readonly control: {
        readonly background: string;
        readonly text: string;
        readonly placeholderText: string;
        readonly border: string;
        readonly hoverBorder: string;
        readonly hoverBackground: string;
        readonly focusRing: string;
        readonly invalidBorder: string;
        readonly disabledBackground: string;
        readonly disabledText: string;
        readonly radius: string;
        readonly smHeight: "2rem";
        readonly mdHeight: "2.5rem";
        readonly lgHeight: "3rem";
        readonly anatomy: ComponentAnatomy;
    };
    readonly selection: {
        readonly checkedBackground: string;
        readonly checkedText: string;
        readonly border: string;
        readonly switchTrack: string;
        readonly switchTrackChecked: string;
        readonly switchThumb: string;
        readonly choiceLabelFontSize: string;
        readonly choiceLabelLineHeight: string;
        readonly choiceRadioLineHeight: string;
        readonly choiceLabelLetterSpacing: string;
        readonly choiceLabelColor: string;
        readonly toggleTrackRadius: string;
        readonly toggleTrackPadding: string;
        readonly toggleTrackWidth: string;
        readonly toggleTrackHeight: string;
        readonly toggleThumbSize: string;
        readonly toggleFontSize: string;
        readonly toggleLineHeight: string;
        readonly toggleLetterSpacing: string;
        readonly toggleTextColor: string;
    };
    readonly search: {
        readonly paddingBlock: string;
        readonly paddingInline: string;
        readonly paddingLeft: string;
        readonly paddingRight: string;
        readonly fontSize: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
    };
    readonly overlay: {
        readonly backdrop: string;
        readonly surface: string;
        readonly border: string;
        readonly shadow: string;
        readonly radius: string;
        readonly zIndex: number;
    };
    readonly drawer: {
        readonly backdrop: string;
        readonly surface: string;
        readonly border: string;
        readonly shadow: string;
        readonly width: "24rem";
        readonly zIndex: number;
    };
    readonly emptyState: {
        readonly background: string;
        readonly border: string;
        readonly titleText: string;
        readonly messageText: string;
        readonly radius: string;
    };
    readonly loadingState: {
        readonly indicator: string;
        readonly track: string;
        readonly text: string;
        readonly radius: string;
    };
    readonly tooltip: {
        readonly background: string;
        readonly text: string;
        readonly radius: string;
        readonly shadow: string;
        readonly zIndex: number;
    };
    readonly toast: {
        readonly background: string;
        readonly text: string;
        readonly border: string;
        readonly shadow: string;
        readonly radius: string;
        readonly infoBorder: string;
        readonly successBorder: string;
        readonly warningBorder: string;
        readonly errorBorder: string;
        readonly zIndex: number;
    };
    readonly dataTable: {
        readonly headerBackground: string;
        readonly rowBackground: string;
        readonly rowHoverBackground: string;
        readonly border: string;
        readonly text: string;
        readonly captionText: string;
        readonly radius: string;
    };
    readonly tabs: {
        readonly activeText: string;
        readonly activeBackground: string;
        readonly inactiveBackground: string;
        readonly activeWeight: string;
        readonly inactiveText: string;
        readonly border: string;
        readonly indicator: string;
        readonly panelBackground: string;
        readonly tabPaddingBlock: string;
        readonly tabPaddingInline: string;
        readonly tabFontSize: string;
        readonly tabLineHeight: string;
        readonly activeBorderTopWidth: string;
        readonly activeBorderBottomWidth: string;
        readonly activeShadow: string;
        readonly anatomy: ComponentAnatomy;
    };
    readonly pagination: {
        readonly background: string;
        readonly border: string;
        readonly text: string;
        readonly activeBackground: string;
        readonly activeText: string;
        readonly disabledText: string;
        readonly radius: string;
        readonly borderWidth: string;
        readonly activeBorder: string;
        readonly activeBorderWidth: string;
        readonly activeWeight: string;
        readonly paddingBlock: string;
        readonly paddingInline: string;
        readonly minSize: string;
        readonly fontSize: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
    };
    readonly paginationNav: {
        readonly background: string;
        readonly border: string;
        readonly radius: string;
        readonly text: string;
        readonly hoverBackground: string;
        readonly activeBackground: string;
        readonly activeText: string;
        readonly disabledText: string;
        readonly ellipsisText: string;
    };
    readonly breadcrumb: {
        readonly text: string;
        readonly currentText: string;
        readonly separator: string;
        readonly linkText: string;
        readonly fontSize: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
        readonly currentWeight: string;
    };
    readonly sideNav: {
        readonly background: string;
        readonly border: string;
        readonly itemText: string;
        readonly activeBackground: string;
        readonly activeText: string;
        readonly width: "16rem";
    };
    readonly selectableRow: {
        readonly selectedBackground: string;
        readonly selectedAccent: string;
        readonly selectedText: string;
        readonly selectedBackgroundDark: string;
        readonly selectedAccentDark: string;
        readonly selectedTextDark: string;
    };
    readonly chat: {
        readonly userBubbleBackground: string;
        readonly userBubbleText: string;
        readonly assistantBubbleBackground: string;
        readonly assistantBubbleText: string;
        readonly composerSurface: string;
        readonly toolCallSurface: string;
    };
    readonly icon: {
        readonly strokeWidth: string;
        readonly color: string;
    };
    readonly graph: {
        readonly panelBackground: string;
        readonly panelText: string;
        readonly edgeDefault: "rgb(226 232 240 / 0.56)";
        readonly community1: string;
        readonly community2: string;
        readonly community3: string;
        readonly community4: string;
    };
    readonly diagramCard: {
        readonly width: "460px";
        readonly height: "200px";
        readonly radius: "0";
        readonly borderWidth: "2px";
        readonly accentWidth: "8px";
        readonly padding: "8px";
        readonly headerInset: "16px";
        readonly iconSize: "70px";
        readonly iconTextGap: "6px";
        readonly kickerFontSize: "22px";
        readonly kickerFontWeight: "400";
        readonly kickerLineHeight: "1.3";
        readonly kickerLetterSpacing: "0.04em";
        readonly kickerTextTransform: "uppercase";
        readonly titleFontSize: "32px";
        readonly titleFontWeight: "700";
        readonly titleLineHeight: "1.3";
        readonly gap: "6px";
        readonly bodyFontSize: "24px";
        readonly bodyFontWeight: "400";
        readonly bodyLineHeight: "1.3";
        readonly bodyInsetFromBar: "14px";
        readonly ruleHeight: "1px";
        readonly ruleMargin: "4px";
        readonly ruleInsetStart: "16px";
        readonly ruleInsetEnd: "10px";
        readonly footerFontSize: "24px";
        readonly footerFontWeight: "700";
        readonly footerLineHeight: "1.3";
        readonly footerBottomInset: "9.25px";
        readonly toggleAllocation: "66px";
        readonly toggleBoxSize: "32px";
        readonly foldedHeaderTextWidth: "290px";
        readonly rootGapInline: "var(--st-component-diagramZone-childGapInline)";
        readonly rootGapBlock: "var(--st-component-diagramZone-childGapBlock)";
        readonly proposedDashArray: "4 5";
        readonly fontFamily: "var(--st-font-sans)";
        readonly border: string;
        readonly accent: string;
        readonly surface: string;
        readonly text: string;
        readonly secondaryText: string;
        readonly rule: string;
    };
    readonly diagramZone: {
        readonly radius: "0";
        readonly borderWidth: "1.5px";
        readonly headerInset: "16px";
        readonly iconSize: "70px";
        readonly iconTextGap: "6px";
        readonly kickerFontSize: "var(--st-component-diagramCard-kickerFontSize)";
        readonly kickerFontWeight: "var(--st-component-diagramCard-kickerFontWeight)";
        readonly kickerLineHeight: "var(--st-component-diagramCard-kickerLineHeight)";
        readonly kickerLetterSpacing: "var(--st-component-diagramCard-kickerLetterSpacing)";
        readonly kickerTextTransform: "var(--st-component-diagramCard-kickerTextTransform)";
        readonly titleFontSize: "var(--st-component-diagramCard-titleFontSize)";
        readonly titleFontWeight: "var(--st-component-diagramCard-titleFontWeight)";
        readonly titleLineHeight: "var(--st-component-diagramCard-titleLineHeight)";
        readonly subtitleFontSize: "24px";
        readonly subtitleFontWeight: "400";
        readonly subtitleLineHeight: "1.3";
        readonly subtitleGap: "var(--st-component-diagramCard-gap)";
        readonly headerRuleGap: "4px";
        readonly contentInsetTop: "16px";
        readonly contentInsetBottom: "16px";
        readonly contentInsetInline: "16px";
        readonly collapsedWidth: "460px";
        readonly collapsedHeight: "200px";
        readonly collapsedInset: "16px";
        readonly collapsedSubtitleMarginInline: "16px";
        readonly toggleAllocation: "var(--st-component-diagramCard-toggleAllocation)";
        readonly toggleBoxSize: "var(--st-component-diagramCard-toggleBoxSize)";
        readonly headerTextInset: "178px";
        readonly toggleTopInset: "10px";
        readonly footerBottomInset: "var(--st-component-diagramCard-footerBottomInset)";
        readonly proposedDashArray: "4 5";
        readonly childGapInline: "24px";
        readonly childGapBlock: "24px";
        readonly gapInlineMax: "32px";
        readonly gapBlockMax: "32px";
        readonly rowPackTargetAspect: "1.78";
        readonly border: string;
        readonly surface: string;
        readonly text: string;
        readonly secondaryText: string;
        readonly rule: string;
    };
    readonly diagramScene: {
        readonly maxDisplayScale: "0.62";
        readonly minReadableScale: "0.45";
        readonly transitionDuration: "240ms";
        readonly edgeLabelFontSize: "18px";
        readonly edgeLabelLineHeight: "22px";
    };
    readonly diagramIcon: {
        readonly viewBox: "0 0 64 64";
        readonly basePath: "M8 53L32 44L56 53L32 62Z";
        readonly faceStrokeWidth: "1.5";
        readonly lineStrokeWidth: "2.5";
        readonly baseFill: "color-mix(in srgb, var(--st-semantic-feedback-info) 18%, var(--st-semantic-surface-raised))";
        readonly faceFill: "color-mix(in srgb, var(--st-semantic-feedback-info) 75%, var(--st-semantic-surface-raised))";
        readonly faceStroke: "var(--st-semantic-feedback-info)";
        readonly lineStroke: "var(--st-semantic-surface-raised)";
        readonly lineDarkStroke: "var(--st-semantic-feedback-info)";
    };
};
export declare const component: {
    readonly button: {
        readonly radius: string;
        readonly primaryBackground: string;
        readonly primaryText: string;
        readonly secondaryBackground: string;
        readonly secondaryBorder: string;
        readonly secondaryHoverBackground: string;
        readonly secondaryText: string;
        readonly anatomy: ComponentAnatomy;
    };
    readonly link: {
        readonly text: string;
        readonly hoverText: string;
        readonly disabledText: string;
        readonly focusRing: string;
        readonly anatomy: ComponentAnatomy;
    };
    readonly alert: {
        readonly background: string;
        readonly text: string;
        readonly border: string;
        readonly infoBorder: string;
        readonly successBorder: string;
        readonly warningBorder: string;
        readonly errorBorder: string;
        readonly radius: string;
        readonly borderTop: string;
        readonly borderRight: string;
        readonly borderBottom: string;
        readonly accentWidth: string;
        readonly filetWidth: string;
        readonly paddingTop: string;
        readonly paddingRight: string;
        readonly paddingBottom: string;
        readonly paddingLeft: string;
        readonly fontSize: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
    };
    readonly accordion: {
        readonly text: string;
        readonly paddingBlock: string;
        readonly paddingInline: string;
        readonly fontSize: string;
        readonly fontWeight: string;
        readonly lineHeight: string;
    };
    readonly tag: {
        readonly radius: string;
        readonly paddingBlock: string;
        readonly paddingInline: string;
        readonly fontSize: string;
        readonly fontWeight: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
        readonly textTransform: string;
        readonly minHeight: string;
        readonly neutralBackground: string;
        readonly neutralText: string;
    };
    readonly badge: {
        readonly radius: string;
        readonly paddingBlock: string;
        readonly paddingInline: string;
        readonly fontSize: string;
        readonly fontWeight: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
        readonly textTransform: string;
        readonly minHeight: string;
        readonly infoBackground: string;
        readonly infoText: string;
    };
    readonly card: {
        readonly background: string;
        readonly border: string;
        readonly radius: string;
        readonly shadow: string;
        readonly anatomy: ComponentAnatomy;
    };
    readonly menu: {
        readonly background: string;
        readonly border: string;
        readonly text: string;
        readonly itemHoverBackground: string;
        readonly dangerText: string;
        readonly dangerHoverBackground: "rgba(185, 28, 28, 0.08)";
        readonly disabledText: string;
        readonly radius: string;
        readonly shadow: string;
    };
    readonly popover: {
        readonly background: string;
        readonly border: string;
        readonly text: string;
        readonly shadow: string;
        readonly radius: string;
        readonly zIndex: number;
    };
    readonly dropdown: {
        readonly background: string;
        readonly border: string;
        readonly text: string;
        readonly optionHoverBackground: string;
        readonly selectedBackground: string;
        readonly selectedText: string;
        readonly radius: string;
        readonly shadow: string;
    };
    readonly input: {
        readonly background: string;
        readonly border: string;
        readonly focusRing: string;
        readonly radius: string;
    };
    readonly field: {
        readonly labelText: string;
        readonly helpText: string;
        readonly errorText: string;
        readonly gap: string;
        readonly maxWidth: "28rem";
        readonly labelTypography: TypographyAnatomy;
    };
    readonly control: {
        readonly background: string;
        readonly text: string;
        readonly placeholderText: string;
        readonly border: string;
        readonly hoverBorder: string;
        readonly hoverBackground: string;
        readonly focusRing: string;
        readonly invalidBorder: string;
        readonly disabledBackground: string;
        readonly disabledText: string;
        readonly radius: string;
        readonly smHeight: "2rem";
        readonly mdHeight: "2.5rem";
        readonly lgHeight: "3rem";
        readonly anatomy: ComponentAnatomy;
    };
    readonly selection: {
        readonly checkedBackground: string;
        readonly checkedText: string;
        readonly border: string;
        readonly switchTrack: string;
        readonly switchTrackChecked: string;
        readonly switchThumb: string;
        readonly choiceLabelFontSize: string;
        readonly choiceLabelLineHeight: string;
        readonly choiceRadioLineHeight: string;
        readonly choiceLabelLetterSpacing: string;
        readonly choiceLabelColor: string;
        readonly toggleTrackRadius: string;
        readonly toggleTrackPadding: string;
        readonly toggleTrackWidth: string;
        readonly toggleTrackHeight: string;
        readonly toggleThumbSize: string;
        readonly toggleFontSize: string;
        readonly toggleLineHeight: string;
        readonly toggleLetterSpacing: string;
        readonly toggleTextColor: string;
    };
    readonly search: {
        readonly paddingBlock: string;
        readonly paddingInline: string;
        readonly paddingLeft: string;
        readonly paddingRight: string;
        readonly fontSize: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
    };
    readonly overlay: {
        readonly backdrop: string;
        readonly surface: string;
        readonly border: string;
        readonly shadow: string;
        readonly radius: string;
        readonly zIndex: number;
    };
    readonly drawer: {
        readonly backdrop: string;
        readonly surface: string;
        readonly border: string;
        readonly shadow: string;
        readonly width: "24rem";
        readonly zIndex: number;
    };
    readonly emptyState: {
        readonly background: string;
        readonly border: string;
        readonly titleText: string;
        readonly messageText: string;
        readonly radius: string;
    };
    readonly loadingState: {
        readonly indicator: string;
        readonly track: string;
        readonly text: string;
        readonly radius: string;
    };
    readonly tooltip: {
        readonly background: string;
        readonly text: string;
        readonly radius: string;
        readonly shadow: string;
        readonly zIndex: number;
    };
    readonly toast: {
        readonly background: string;
        readonly text: string;
        readonly border: string;
        readonly shadow: string;
        readonly radius: string;
        readonly infoBorder: string;
        readonly successBorder: string;
        readonly warningBorder: string;
        readonly errorBorder: string;
        readonly zIndex: number;
    };
    readonly dataTable: {
        readonly headerBackground: string;
        readonly rowBackground: string;
        readonly rowHoverBackground: string;
        readonly border: string;
        readonly text: string;
        readonly captionText: string;
        readonly radius: string;
    };
    readonly tabs: {
        readonly activeText: string;
        readonly activeBackground: string;
        readonly inactiveBackground: string;
        readonly activeWeight: string;
        readonly inactiveText: string;
        readonly border: string;
        readonly indicator: string;
        readonly panelBackground: string;
        readonly tabPaddingBlock: string;
        readonly tabPaddingInline: string;
        readonly tabFontSize: string;
        readonly tabLineHeight: string;
        readonly activeBorderTopWidth: string;
        readonly activeBorderBottomWidth: string;
        readonly activeShadow: string;
        readonly anatomy: ComponentAnatomy;
    };
    readonly pagination: {
        readonly background: string;
        readonly border: string;
        readonly text: string;
        readonly activeBackground: string;
        readonly activeText: string;
        readonly disabledText: string;
        readonly radius: string;
        readonly borderWidth: string;
        readonly activeBorder: string;
        readonly activeBorderWidth: string;
        readonly activeWeight: string;
        readonly paddingBlock: string;
        readonly paddingInline: string;
        readonly minSize: string;
        readonly fontSize: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
    };
    readonly paginationNav: {
        readonly background: string;
        readonly border: string;
        readonly radius: string;
        readonly text: string;
        readonly hoverBackground: string;
        readonly activeBackground: string;
        readonly activeText: string;
        readonly disabledText: string;
        readonly ellipsisText: string;
    };
    readonly breadcrumb: {
        readonly text: string;
        readonly currentText: string;
        readonly separator: string;
        readonly linkText: string;
        readonly fontSize: string;
        readonly lineHeight: string;
        readonly letterSpacing: string;
        readonly currentWeight: string;
    };
    readonly sideNav: {
        readonly background: string;
        readonly border: string;
        readonly itemText: string;
        readonly activeBackground: string;
        readonly activeText: string;
        readonly width: "16rem";
    };
    readonly selectableRow: {
        readonly selectedBackground: string;
        readonly selectedAccent: string;
        readonly selectedText: string;
        readonly selectedBackgroundDark: string;
        readonly selectedAccentDark: string;
        readonly selectedTextDark: string;
    };
    readonly chat: {
        readonly userBubbleBackground: string;
        readonly userBubbleText: string;
        readonly assistantBubbleBackground: string;
        readonly assistantBubbleText: string;
        readonly composerSurface: string;
        readonly toolCallSurface: string;
    };
    readonly icon: {
        readonly strokeWidth: string;
        readonly color: string;
    };
    readonly graph: {
        readonly panelBackground: string;
        readonly panelText: string;
        readonly edgeDefault: "rgb(226 232 240 / 0.56)";
        readonly community1: string;
        readonly community2: string;
        readonly community3: string;
        readonly community4: string;
    };
    readonly diagramCard: {
        readonly width: "460px";
        readonly height: "200px";
        readonly radius: "0";
        readonly borderWidth: "2px";
        readonly accentWidth: "8px";
        readonly padding: "8px";
        readonly headerInset: "16px";
        readonly iconSize: "70px";
        readonly iconTextGap: "6px";
        readonly kickerFontSize: "22px";
        readonly kickerFontWeight: "400";
        readonly kickerLineHeight: "1.3";
        readonly kickerLetterSpacing: "0.04em";
        readonly kickerTextTransform: "uppercase";
        readonly titleFontSize: "32px";
        readonly titleFontWeight: "700";
        readonly titleLineHeight: "1.3";
        readonly gap: "6px";
        readonly bodyFontSize: "24px";
        readonly bodyFontWeight: "400";
        readonly bodyLineHeight: "1.3";
        readonly bodyInsetFromBar: "14px";
        readonly ruleHeight: "1px";
        readonly ruleMargin: "4px";
        readonly ruleInsetStart: "16px";
        readonly ruleInsetEnd: "10px";
        readonly footerFontSize: "24px";
        readonly footerFontWeight: "700";
        readonly footerLineHeight: "1.3";
        readonly footerBottomInset: "9.25px";
        readonly toggleAllocation: "66px";
        readonly toggleBoxSize: "32px";
        readonly foldedHeaderTextWidth: "290px";
        readonly rootGapInline: "var(--st-component-diagramZone-childGapInline)";
        readonly rootGapBlock: "var(--st-component-diagramZone-childGapBlock)";
        readonly proposedDashArray: "4 5";
        readonly fontFamily: "var(--st-font-sans)";
        readonly border: string;
        readonly accent: string;
        readonly surface: string;
        readonly text: string;
        readonly secondaryText: string;
        readonly rule: string;
    };
    readonly diagramZone: {
        readonly radius: "0";
        readonly borderWidth: "1.5px";
        readonly headerInset: "16px";
        readonly iconSize: "70px";
        readonly iconTextGap: "6px";
        readonly kickerFontSize: "var(--st-component-diagramCard-kickerFontSize)";
        readonly kickerFontWeight: "var(--st-component-diagramCard-kickerFontWeight)";
        readonly kickerLineHeight: "var(--st-component-diagramCard-kickerLineHeight)";
        readonly kickerLetterSpacing: "var(--st-component-diagramCard-kickerLetterSpacing)";
        readonly kickerTextTransform: "var(--st-component-diagramCard-kickerTextTransform)";
        readonly titleFontSize: "var(--st-component-diagramCard-titleFontSize)";
        readonly titleFontWeight: "var(--st-component-diagramCard-titleFontWeight)";
        readonly titleLineHeight: "var(--st-component-diagramCard-titleLineHeight)";
        readonly subtitleFontSize: "24px";
        readonly subtitleFontWeight: "400";
        readonly subtitleLineHeight: "1.3";
        readonly subtitleGap: "var(--st-component-diagramCard-gap)";
        readonly headerRuleGap: "4px";
        readonly contentInsetTop: "16px";
        readonly contentInsetBottom: "16px";
        readonly contentInsetInline: "16px";
        readonly collapsedWidth: "460px";
        readonly collapsedHeight: "200px";
        readonly collapsedInset: "16px";
        readonly collapsedSubtitleMarginInline: "16px";
        readonly toggleAllocation: "var(--st-component-diagramCard-toggleAllocation)";
        readonly toggleBoxSize: "var(--st-component-diagramCard-toggleBoxSize)";
        readonly headerTextInset: "178px";
        readonly toggleTopInset: "10px";
        readonly footerBottomInset: "var(--st-component-diagramCard-footerBottomInset)";
        readonly proposedDashArray: "4 5";
        readonly childGapInline: "24px";
        readonly childGapBlock: "24px";
        readonly gapInlineMax: "32px";
        readonly gapBlockMax: "32px";
        readonly rowPackTargetAspect: "1.78";
        readonly border: string;
        readonly surface: string;
        readonly text: string;
        readonly secondaryText: string;
        readonly rule: string;
    };
    readonly diagramScene: {
        readonly maxDisplayScale: "0.62";
        readonly minReadableScale: "0.45";
        readonly transitionDuration: "240ms";
        readonly edgeLabelFontSize: "18px";
        readonly edgeLabelLineHeight: "22px";
    };
    readonly diagramIcon: {
        readonly viewBox: "0 0 64 64";
        readonly basePath: "M8 53L32 44L56 53L32 62Z";
        readonly faceStrokeWidth: "1.5";
        readonly lineStrokeWidth: "2.5";
        readonly baseFill: "color-mix(in srgb, var(--st-semantic-feedback-info) 18%, var(--st-semantic-surface-raised))";
        readonly faceFill: "color-mix(in srgb, var(--st-semantic-feedback-info) 75%, var(--st-semantic-surface-raised))";
        readonly faceStroke: "var(--st-semantic-feedback-info)";
        readonly lineStroke: "var(--st-semantic-surface-raised)";
        readonly lineDarkStroke: "var(--st-semantic-feedback-info)";
    };
};
export {};
//# sourceMappingURL=component.d.ts.map