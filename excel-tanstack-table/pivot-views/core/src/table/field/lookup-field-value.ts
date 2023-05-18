import { FieldValueBase } from './field-value.base';
import type { IFieldValueVisitor } from './field-value.visitor';
import type { ILookupFieldValue } from './lookup-field.type';

export class LookupFieldValue extends FieldValueBase<ILookupFieldValue> {
  constructor(value: ILookupFieldValue) {
    super(value ? value : { value: null });
  }

  accept(visitor: IFieldValueVisitor): void {
    visitor.lookup(this);
  }
}
