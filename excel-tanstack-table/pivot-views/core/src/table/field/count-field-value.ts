import { type ICountFieldValue } from './count-field.type';
import { FieldValueBase } from './field-value.base';
import { type IFieldValueVisitor } from './field-value.visitor';

export class CountFieldValue extends FieldValueBase<ICountFieldValue> {
  constructor(value: ICountFieldValue) {
    super({ value });
  }

  accept(visitor: IFieldValueVisitor): void {
    visitor.count(this);
  }
}
