import {
  ExtensionAutoConvertHandler,
  ExtensionKey,
  ExtensionManifest,
  ExtensionType,
} from './extension-manifest';
import { Parameters } from './extension-parameters';

/** 定义了管理extensions的常用方法。
 * new extension API.
 * This eventually is going to replace `quickInsert.provider, extensionHandlers, macroProvider`.
 */
export interface ExtensionProvider<T extends Parameters = any> {
  getExtensions: () => Promise<ExtensionManifest<T>[]>;
  getExtension: (
    type: ExtensionType,
    key: ExtensionKey,
  ) => Promise<ExtensionManifest<T> | undefined>;
  search: (keyword: string) => Promise<ExtensionManifest<T>[]>;
  getAutoConverter: () => Promise<ExtensionAutoConvertHandler[]>;
}
