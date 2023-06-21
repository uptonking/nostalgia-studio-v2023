/** maybe null */
export function isDefined<T>(args: T | undefined): args is T {
  return args !== undefined;
}

export function makeRandomColor() {
  return '#000000'.replace(/0/g, function () {
    return (~~(Math.random() * 16)).toString(16);
  });
}
