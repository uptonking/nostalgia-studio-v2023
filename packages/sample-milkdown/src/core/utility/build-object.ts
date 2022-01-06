/** 遍历source参数数组中每项cur，并执行fn(cur)，收集返回值并返回 */
export function buildObject<T, U>(
  source: T[],
  fn: (source: T) => [string, U],
  initial: Record<string, U> = {},
) {
  return source.reduce((acc, cur) => {
    const [key, value] = fn(cur);
    return {
      ...acc,
      [key]: value,
    };
  }, initial);
}
