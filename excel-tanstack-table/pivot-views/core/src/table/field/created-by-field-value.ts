import {
  type ICreatedByFieldQueryValue,
  type ICreatedByFieldValue,
} from './created-by-field.type';
import { FieldValueBase } from './field-value.base';
import { type IFieldValueVisitor } from './field-value.visitor';

export class CreatedByFieldValue extends FieldValueBase<ICreatedByFieldValue> {
  constructor(value: ICreatedByFieldValue) {
    super({ value });
  }

  static fromQuery(str: ICreatedByFieldQueryValue): CreatedByFieldValue {
    return new this(str);
  }

  accept(visitor: IFieldValueVisitor): void {
    visitor.createdBy(this);
  }
}
