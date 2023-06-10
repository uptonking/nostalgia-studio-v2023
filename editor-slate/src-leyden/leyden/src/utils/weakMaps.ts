import { type LeydenEditor } from '../interfaces/LeydenEditor';
import { type OperationSubscriber } from './types';

export const OPERATION_SUBSCRIBERS: WeakMap<
  LeydenEditor,
  Set<OperationSubscriber>
> = new WeakMap();
