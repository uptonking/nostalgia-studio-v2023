import {
  type ICreatedAtFieldQueryValue,
  type ICreatedAtFieldValue,
} from './created-at-field.type';
import { FieldValueBase } from './field-value.base';
import { type IFieldValueVisitor } from './field-value.visitor';

export class CreatedAtFieldValue extends FieldValueBase<ICreatedAtFieldValue> {
  constructor(value: ICreatedAtFieldValue) {
    super({ value });
  }

  static fromQuery(str: ICreatedAtFieldQueryValue): CreatedAtFieldValue {
    return new this(new Date(str));
  }

  accept(visitor: IFieldValueVisitor): void {
    visitor.createdAt(this);
  }
}
