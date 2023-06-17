/**
 * a map for storing config
 * - useful for inheritance
 */
export class RegistryDefault<T> {
  content: Record<string, T> = {};

  get(key: string) {
    return this.content[key];
  }

  add(key: string, value: T) {
    this.content[key] = value;
    return this;
  }

  remove(key: string) {
    delete this.content[key];
  }
}
