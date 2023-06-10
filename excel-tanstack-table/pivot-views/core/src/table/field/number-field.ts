import { z } from 'zod';

import { BaseField } from './field.base';
import { type INumberField } from './field.type';
import { type IFieldVisitor } from './field.visitor';
import {
  type INumberFilter,
  type INumberFilterOperator,
} from './filter/number.filter';
import { NumberFieldValue } from './number-field-value';
import {
  type ICreateNumberFieldInput,
  type ICreateNumberFieldValue,
  type NumberType,
} from './number-field.type';

export class NumberField extends BaseField<INumberField> {
  type: NumberType = 'number';

  override get primitive() {
    return true;
  }

  override get isNumeric() {
    return true;
  }

  static create(input: Omit<ICreateNumberFieldInput, 'type'>): NumberField {
    return new NumberField(super.createBase(input));
  }

  static unsafeCreate(input: ICreateNumberFieldInput): NumberField {
    return new NumberField(super.unsafeCreateBase(input));
  }

  createValue(value: ICreateNumberFieldValue): NumberFieldValue {
    return new NumberFieldValue(value);
  }

  createFilter(
    operator: INumberFilterOperator,
    value: number | null,
  ): INumberFilter {
    return { operator, value, path: this.id.value, type: 'number' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.number(this);
  }

  get valueSchema() {
    const number = z.number();
    return this.required ? number : number.nullable();
  }
}
