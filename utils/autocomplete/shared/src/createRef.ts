/** simple object factory with `current` prop */
export function createRef<TValue>(initialValue: TValue) {
  return {
    current: initialValue,
  };
}
