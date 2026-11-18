import { NavShell } from "./NavShell.js";
import type { NavShellProps } from "./NavShell.js";

export type NavDrawerProps = Omit<NavShellProps, "variant">;

export function NavDrawer(props: NavDrawerProps) {
  return <NavShell {...props} variant="drawer" />;
}
