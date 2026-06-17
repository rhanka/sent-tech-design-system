import React from "react";
import { NavShell, type NavShellProps } from "./NavShell.js";

export type NavDrawerProps = Omit<NavShellProps, "variant">;

export function NavDrawer(props: NavDrawerProps) {
  return <NavShell {...props} variant="drawer" />;
}
