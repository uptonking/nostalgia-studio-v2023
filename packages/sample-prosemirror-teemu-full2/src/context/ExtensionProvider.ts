import { Extension, createPlugins, createSchema } from '../extensions';

/** 提供了添加或删除extension到Set集合的方法，计算所有schema、计算所有plugins */
export class ExtensionProvider {
  extensions: Set<Extension<any>> = new Set();

  register(extension: Extension<any>) {
    this.extensions.add(extension);
  }

  unregister(extension: Extension<any>) {
    this.extensions.delete(extension);
  }

  createSchema() {
    return createSchema(Array.from(this.extensions.values()));
  }

  createPlugins() {
    return createPlugins(Array.from(this.extensions.values()));
  }
}
