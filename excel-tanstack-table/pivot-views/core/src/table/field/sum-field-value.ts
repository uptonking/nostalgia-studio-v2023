import { FieldValueBase } from './field-value.base';
import { type IFieldValueVisitor } from './field-value.visitor';
import { type ISumFieldValue } from './sum-field.type';

export class SumFieldValue extends FieldValueBase<ISumFieldValue> {
  constructor(value: ISumFieldValue) {
    super({ value });
  }

  accept(visitor: IFieldValueVisitor): void {
    visitor.sum(this);
  }
}
