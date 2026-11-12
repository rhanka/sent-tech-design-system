export type TokenValue = string | number;
export interface TokenTree {
    [key: string]: TokenValue | TokenTree | undefined;
}
export declare const foundation: {
    readonly color: {
        readonly blue: {
            readonly 10: "oklch(97% 0.02 242)";
            readonly 60: "oklch(50% 0.134 242.749)";
            readonly 80: "oklch(32% 0.11 242)";
        };
        readonly cyan: {
            readonly 10: "oklch(96% 0.04 195)";
            readonly 50: "oklch(70.4% 0.14 182.503)";
            readonly 70: "oklch(48% 0.12 190)";
        };
        readonly slate: {
            readonly 0: "#ffffff";
            readonly 10: "#f8fafc";
            readonly 20: "#e2e8f0";
            readonly 60: "#475569";
            readonly 80: "#1e293b";
            readonly 90: "#0f172a";
        };
        readonly feedback: {
            readonly success: "#16a34a";
            readonly warning: "#d97706";
            readonly error: "#dc2626";
            readonly info: "#2563eb";
        };
    };
    readonly font: {
        readonly sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        readonly display: "Inter, system-ui, sans-serif";
        readonly mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace";
    };
    readonly spacing: {
        readonly 0: "0";
        readonly 1: "0.25rem";
        readonly 2: "0.5rem";
        readonly 3: "0.75rem";
        readonly 4: "1rem";
        readonly 6: "1.5rem";
        readonly 8: "2rem";
        readonly 12: "3rem";
        readonly 16: "4rem";
    };
    readonly radius: {
        readonly none: "0";
        readonly sm: "0.25rem";
        readonly md: "0.375rem";
        readonly lg: "0.5rem";
        readonly pill: "999px";
    };
    readonly shadow: {
        readonly subtle: "0 1px 2px rgb(15 23 42 / 0.08)";
        readonly medium: "0 8px 24px rgb(15 23 42 / 0.12)";
        readonly floating: "0 18px 45px rgb(15 23 42 / 0.18)";
    };
    readonly motion: {
        readonly fast: "120ms";
        readonly normal: "180ms";
        readonly slow: "280ms";
        readonly easing: "cubic-bezier(0.16, 1, 0.3, 1)";
    };
    readonly z: {
        readonly header: 50;
        readonly toast: 60;
        readonly overlay: 80;
        readonly modal: 100;
        readonly chat: 110;
    };
    readonly borderWidth: {
        readonly none: "0";
        readonly thin: "1px";
        readonly thick: "2px";
    };
    readonly borderStyle: {
        readonly solid: "solid";
    };
    readonly density: {
        readonly sm: {
            readonly controlHeight: "2rem";
            readonly paddingBlock: "0";
            readonly paddingInline: "0.75rem";
            readonly gap: "0.375rem";
            readonly minWidth: "2rem";
        };
        readonly md: {
            readonly controlHeight: "2.5rem";
            readonly paddingBlock: "0";
            readonly paddingInline: "1rem";
            readonly gap: "0.5rem";
            readonly minWidth: "2.5rem";
        };
        readonly lg: {
            readonly controlHeight: "3rem";
            readonly paddingBlock: "0";
            readonly paddingInline: "1.25rem";
            readonly gap: "0.5rem";
            readonly minWidth: "3rem";
        };
    };
    readonly typography: {
        readonly control: {
            readonly family: "var(--st-font-sans)";
            readonly size: "0.9375rem";
            readonly weight: "600";
            readonly lineHeight: "1.2";
            readonly letterSpacing: "0";
            readonly textTransform: "none";
            readonly textDecoration: "none";
            readonly decorationThickness: "auto";
            readonly decorationOffset: "auto";
        };
        readonly field: {
            readonly family: "var(--st-font-sans)";
            readonly size: "1rem";
            readonly weight: "400";
            readonly lineHeight: "1.5";
            readonly letterSpacing: "0";
            readonly textTransform: "none";
            readonly textDecoration: "none";
            readonly decorationThickness: "auto";
            readonly decorationOffset: "auto";
        };
        readonly label: {
            readonly family: "var(--st-font-sans)";
            readonly size: "0.875rem";
            readonly weight: "600";
            readonly lineHeight: "1.4";
            readonly letterSpacing: "0";
            readonly textTransform: "none";
            readonly textDecoration: "none";
            readonly decorationThickness: "auto";
            readonly decorationOffset: "auto";
        };
        readonly link: {
            readonly family: "inherit";
            readonly size: "inherit";
            readonly weight: "inherit";
            readonly lineHeight: "inherit";
            readonly letterSpacing: "0";
            readonly textTransform: "none";
            readonly textDecoration: "underline";
            readonly decorationThickness: "auto";
            readonly decorationOffset: "0.18em";
        };
    };
    readonly disabledOpacity: "0.55";
    readonly transition: {
        readonly property: "background-color, border-color, color, box-shadow, outline-color";
        readonly duration: "120ms";
        readonly easing: "cubic-bezier(0.16, 1, 0.3, 1)";
    };
    readonly cursor: {
        readonly interactive: "pointer";
        readonly disabled: "not-allowed";
        readonly text: "text";
    };
    readonly iconSize: {
        readonly sm: "1rem";
        readonly md: "1.125rem";
        readonly lg: "1.25rem";
    };
    readonly focus: {
        readonly strategy: "outline";
        readonly width: "2px";
        readonly offset: "2px";
        readonly color: "var(--st-semantic-border-interactive)";
        readonly inset: "0";
    };
    readonly field: {
        readonly style: "outline";
        readonly fillBg: "var(--st-semantic-surface-default)";
        readonly underlineColor: "var(--st-semantic-border-strong)";
        readonly underlineWidth: "1px";
    };
};
//# sourceMappingURL=foundation.d.ts.map