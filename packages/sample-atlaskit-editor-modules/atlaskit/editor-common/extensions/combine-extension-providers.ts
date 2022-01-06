import { combineProviders } from '../provider-helpers';
import type { ExtensionKey, ExtensionProvider, ExtensionType } from './types';

/**
 * 返回一个映射表，包含各种方法，会遍历参数传入的providers并执行其中的getExtension()/search()。
 * Allow to run methods from the `ExtensionProvider` interface across all providers seamlessly.
 * Handles promise racing and discards rejected promises safely.
 */
export function combineExtensionProviders(
  extensionProviders: (ExtensionProvider | Promise<ExtensionProvider>)[],
): ExtensionProvider {
  const { invokeSingle, invokeList } =
    combineProviders<ExtensionProvider>(extensionProviders);

  return {
    getExtensions() {
      return invokeList('getExtensions');
    },

    getExtension(type: ExtensionType, key: ExtensionKey) {
      return invokeSingle('getExtension', [type, key]);
    },

    search(keyword: string) {
      return invokeList('search', [keyword]);
    },

    getAutoConverter() {
      return invokeList('getAutoConverter');
    },
  };
}

export default combineExtensionProviders;
