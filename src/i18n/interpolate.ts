/*
 * Fill {token} placeholders in a dictionary template.
 *
 * Used for strings composed at runtime from page data — result captions,
 * screen-reader statuses. A token without a matching value is left visible so
 * a wiring mistake shows up instead of rendering "undefined".
 */
export function interpolate(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, token: string) =>
    Object.hasOwn(values, token) ? String(values[token]) : match,
  );
}
