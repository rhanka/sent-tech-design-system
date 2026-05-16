import { error } from "@sveltejs/kit";
import { COMPONENTS, type ComponentEntry } from "$lib/components-catalog";

export const prerender = true;

export function entries(): Array<{ slug: string }> {
  // Only stubs are handled by this dynamic route; documented components have
  // dedicated routes under `/components/<groupSlug>/`.
  return COMPONENTS.filter((entry) => entry.status === "stub").map((entry) => ({
    slug: entry.slug
  }));
}

export function load({ params }: { params: { slug: string } }): { component: ComponentEntry } {
  const component = COMPONENTS.find((entry) => entry.slug === params.slug);
  if (!component) {
    throw error(404, `Unknown component: ${params.slug}`);
  }
  return { component };
}
