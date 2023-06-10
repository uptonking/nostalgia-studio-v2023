import { type IAverageFieldValue } from './average-field.type';
import { FieldValueBase } from './field-value.base';
import { type IFieldValueVisitor } from './field-value.visitor';

export class AverageFieldValue extends FieldValueBase<IAverageFieldValue> {
  constructor(value: IAverageFieldValue) {
    super({ value });
  }

  accept(visitor: IFieldValueVisitor): void {
    visitor.average(this);
  }
}
