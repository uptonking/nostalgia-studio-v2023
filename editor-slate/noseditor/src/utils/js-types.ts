export function isNullOrUndefined<T>(
  value: T | undefined | null,
): value is undefined | null {
  return value === undefined || value === null;
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
