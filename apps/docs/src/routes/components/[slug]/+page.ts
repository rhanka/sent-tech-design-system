import { error } from "@sveltejs/kit";
import { COMPONENTS, type ComponentEntry } from "$lib/components-catalog";

export const prerender = true;

export function entries(): Array<{ slug: string }> {
  return COMPONENTS.filter((entry) => entry.slug !== entry.groupSlug).map((entry) => ({
    slug: entry.slug
  }));
}

export function load({
  params
}: {
  params: { slug: string };
}): { component: ComponentEntry; redirectTo?: string } {
  const component = COMPONENTS.find((entry) => entry.slug === params.slug);
  if (!component) {
    throw error(404, `Unknown component: ${params.slug}`);
  }
  if (component.status === "documented" && component.groupSlug) {
    return { component, redirectTo: `/components/${component.groupSlug}` };
  }
  return { component };
}
