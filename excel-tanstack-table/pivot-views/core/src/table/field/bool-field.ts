import { z } from 'zod';

import { BoolFieldValue } from './bool-field-value';
import {
  type BoolFieldType,
  type ICreateBoolFieldInput,
  type ICreateBoolFieldValue,
} from './bool-field.type';
import { BaseField } from './field.base';
import { type IBoolField } from './field.type';
import { type IFieldVisitor } from './field.visitor';
import { type IBoolFilter } from './filter/bool.filter';
import { type IBoolFilterOperator } from './filter/operators';

export class BoolField extends BaseField<IBoolField> {
  type: BoolFieldType = 'bool';

  override get primitive() {
    return true;
  }

  static create(input: Omit<ICreateBoolFieldInput, 'type'>): BoolField {
    return new BoolField(super.createBase(input));
  }

  static unsafeCreate(input: ICreateBoolFieldInput): BoolField {
    return new BoolField(super.unsafeCreateBase(input));
  }

  createValue(value: ICreateBoolFieldValue): BoolFieldValue {
    return new BoolFieldValue(value);
  }

  createFilter(
    operator: IBoolFilterOperator,
    value: boolean | null,
  ): IBoolFilter {
    return { operator, value, path: this.id.value, type: 'bool' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.bool(this);
  }

  get valueSchema() {
    const bool = z.boolean();

    return this.required ? bool : bool.nullable();
  }
}
