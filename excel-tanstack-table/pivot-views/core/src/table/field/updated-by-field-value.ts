import { FieldValueBase } from './field-value.base';
import { type IFieldValueVisitor } from './field-value.visitor';
import {
  type IUpdatedByFieldQueryValue,
  type IUpdatedByFieldValue,
} from './updated-by-field.type';

export class UpdatedByFieldValue extends FieldValueBase<IUpdatedByFieldValue> {
  constructor(value: IUpdatedByFieldValue) {
    super({ value });
  }

  static fromQuery(str: IUpdatedByFieldQueryValue): UpdatedByFieldValue {
    return new this(str);
  }

  accept(visitor: IFieldValueVisitor): void {
    visitor.updatedBy(this);
  }
}
