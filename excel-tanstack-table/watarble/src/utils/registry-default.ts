/**
 * a map for storing config
 * - useful for inheritance
 */
export class RegistryDefault<T = unknown> {
  content: Record<string, T> = {};

  add(key: string, value: T) {
    this.content[key] = value;
    return this;
  }

  remove(key: string) {
    delete this.content[key];
  }

  get(key: string) {
    return this.content[key];
  }

  getAll(): T[] {
    return Object.values(this.content);
  }

  getKeys(): string[] {
    return Object.keys(this.content);
  }

  contains(key: string): boolean {
    return key in this.content;
  }
}
