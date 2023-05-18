import { FieldValueBase } from './field-value.base';
import type { IFieldValueVisitor } from './field-value.visitor';
import type {
  IUpdatedAtFieldQueryValue,
  IUpdatedAtFieldValue,
} from './updated-at-field.type';

export class UpdatedAtFieldValue extends FieldValueBase<IUpdatedAtFieldValue> {
  constructor(value: IUpdatedAtFieldValue) {
    super({ value });
  }

  static fromQuery(str: IUpdatedAtFieldQueryValue): UpdatedAtFieldValue {
    return new this(new Date(str));
  }

  accept(visitor: IFieldValueVisitor): void {
    visitor.updatedAt(this);
  }
}
