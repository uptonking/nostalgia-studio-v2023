import { ValueObject } from '@datalking/pivot-entity';

import type { IFieldValueVisitor } from './field-value.visitor';
import type { UnpackedFieldValue } from './field.type';

export abstract class FieldValueBase<
  V extends UnpackedFieldValue,
> extends ValueObject<V> {
  abstract accept(visitor: IFieldValueVisitor): void;
}
