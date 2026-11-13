/** Scalar compatibility path for the former VNode-valued content props.
 * Rich content is authored in template slots so both builds stay native. */
export function scalarContent(value: unknown): string | number {
  return typeof value === 'string' || typeof value === 'number' ? value : '';
}
