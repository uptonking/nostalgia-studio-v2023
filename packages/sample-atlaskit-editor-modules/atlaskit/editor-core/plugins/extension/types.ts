import type { ExtensionLayout } from '../../../adf-schema';
import type { ContextIdentifierProvider } from '../../../editor-common';
import type {
  ExtensionProvider,
  Parameters,
  TransformAfter,
  TransformBefore,
  UpdateExtension,
} from '../../../editor-common/extensions';

export type ExtensionState<T extends Parameters = Parameters> = {
  layout: ExtensionLayout;
  localId?: string;
  autoSaveResolve?: () => void;
  showEditButton: boolean;
  showContextPanel: boolean;
  updateExtension?: Promise<UpdateExtension<T> | void>;
  element?: HTMLElement;
  extensionProvider?: ExtensionProvider<T>;
  contextIdentifierProvider?: ContextIdentifierProvider;
  processParametersBefore?: TransformBefore<T>;
  processParametersAfter?: TransformAfter<T>;
  positions?: Record<number, number>;
};

export type ExtensionAction<T extends Parameters = Parameters> = {
  type: 'UPDATE_STATE';
  data: Partial<ExtensionState<T>>;
};
