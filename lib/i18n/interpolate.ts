/**
 * Replace `{name}` placeholders in a dictionary string with the given values.
 *
 * @example
 * interpolate("A code was sent to {phone}", { phone: "+998 90 …" });
 */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
