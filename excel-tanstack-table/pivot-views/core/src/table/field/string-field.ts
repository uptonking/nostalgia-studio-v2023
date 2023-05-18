import { z } from 'zod';

import { BaseField } from './field.base';
import type { IStringField } from './field.type';
import type { IFieldVisitor } from './field.visitor';
import type {
  IStringFilter,
  IStringFilterOperator,
} from './filter/string.filter';
import { StringFieldValue } from './string-field-value';
import type {
  ICreateStringFieldInput,
  ICreateStringFieldValue,
  StringFieldType,
} from './string-field.type';

export class StringField extends BaseField<IStringField> {
  type: StringFieldType = 'string';

  override get primitive() {
    return true;
  }

  static create(input: Omit<ICreateStringFieldInput, 'type'>): StringField {
    return new StringField(super.createBase(input));
  }

  static unsafeCreate(input: ICreateStringFieldInput): StringField {
    return new StringField(super.unsafeCreateBase(input));
  }

  createValue(value: ICreateStringFieldValue): StringFieldValue {
    return new StringFieldValue(value);
  }

  createFilter(
    operator: IStringFilterOperator,
    value: string | null,
  ): IStringFilter {
    return { operator, value, path: this.id.value, type: 'string' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.string(this);
  }

  get valueSchema() {
    const str = z.string();
    return this.required ? str : str.nullable();
  }
}
