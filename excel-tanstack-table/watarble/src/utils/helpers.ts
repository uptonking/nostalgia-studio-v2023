/** maybe null */
export function isDefined<T>(args: T | undefined): args is T {
  return args !== undefined;
}
