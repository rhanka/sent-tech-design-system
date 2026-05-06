import { describe, expect, it } from "vitest";
import { component } from "./component.js";
import { flattenTokens, toCssVariables } from "./css.js";

describe("token CSS serialization", () => {
  it("flattens nested tokens with dash-separated paths", () => {
    expect(flattenTokens({ color: { brand: "#123456" } })).toEqual({
      "color-brand": "#123456"
    });
  });

  it("serializes CSS variables in a scoped selector", () => {
    expect(toCssVariables({ action: { primary: "#123456" } }, "[data-theme='x']")).toBe(
      "[data-theme='x'] {\n  --st-action-primary: #123456;\n}\n"
    );
  });

  it("contains stable chat component tokens", () => {
    expect(component.chat).toMatchObject({
      userBubbleBackground: expect.any(String),
      userBubbleText: expect.any(String),
      assistantBubbleBackground: expect.any(String),
      assistantBubbleText: expect.any(String),
      composerSurface: expect.any(String),
      toolCallSurface: expect.any(String)
    });
  });

  it("contains stable form control tokens", () => {
    expect(component.field).toMatchObject({
      labelText: expect.any(String),
      helpText: expect.any(String),
      errorText: expect.any(String),
      gap: expect.any(String)
    });
    expect(component.control).toMatchObject({
      background: expect.any(String),
      border: expect.any(String),
      focusRing: expect.any(String),
      invalidBorder: expect.any(String),
      disabledBackground: expect.any(String),
      radius: expect.any(String)
    });
    expect(component.selection).toMatchObject({
      checkedBackground: expect.any(String),
      checkedText: expect.any(String),
      switchTrack: expect.any(String)
    });
  });

  it("contains stable overlay and feedback component tokens", () => {
    expect(component.overlay).toMatchObject({
      backdrop: expect.any(String),
      surface: expect.any(String),
      border: expect.any(String),
      shadow: expect.any(String),
      zIndex: expect.any(Number)
    });
    expect(component.tooltip).toMatchObject({
      background: expect.any(String),
      text: expect.any(String)
    });
    expect(component.toast).toMatchObject({
      background: expect.any(String),
      border: expect.any(String),
      successBorder: expect.any(String),
      errorBorder: expect.any(String)
    });
  });

  it("contains stable data and navigation component tokens", () => {
    expect(component.dataTable).toMatchObject({
      headerBackground: expect.any(String),
      rowBackground: expect.any(String),
      border: expect.any(String),
      captionText: expect.any(String)
    });
    expect(component.tabs).toMatchObject({
      activeText: expect.any(String),
      inactiveText: expect.any(String),
      indicator: expect.any(String),
      border: expect.any(String)
    });
    expect(component.pagination).toMatchObject({
      background: expect.any(String),
      border: expect.any(String),
      activeBackground: expect.any(String),
      activeText: expect.any(String)
    });
    expect(component.breadcrumb).toMatchObject({
      text: expect.any(String),
      currentText: expect.any(String),
      separator: expect.any(String)
    });
    expect(component.sideNav).toMatchObject({
      background: expect.any(String),
      itemText: expect.any(String),
      activeBackground: expect.any(String),
      activeText: expect.any(String)
    });
  });
});
