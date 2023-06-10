import { z } from 'zod';

import { BaseField } from './field.base';
import { type IIdField } from './field.type';
import { type IFieldVisitor } from './field.visitor';
import { type IIdFilter } from './filter/id.filter';
import { type IIdFilterOperator } from './filter/operators';
import { IdFieldValue } from './id-field-value';
import {
  type ICreateIdFieldInput,
  type ICreateIdFieldValue,
  type IdFieldType,
} from './id-field.type';

export class IdField extends BaseField<IIdField> {
  type: IdFieldType = 'id';
  override get system() {
    return true;
  }

  static default(): IdField {
    return this.create({ name: 'id' });
  }

  static create(input: Omit<ICreateIdFieldInput, 'type'>): IdField {
    return new IdField(super.createBase(input));
  }

  static unsafeCreate(input: ICreateIdFieldInput): IdField {
    return new IdField(super.unsafeCreateBase(input));
  }

  createValue(value: ICreateIdFieldValue): IdFieldValue {
    return new IdFieldValue(value);
  }

  createFilter(operator: IIdFilterOperator, value: string): IIdFilter {
    return { operator, value, path: this.id.value, type: 'id' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.id(this);
  }

  get valueSchema() {
    return z.string();
  }
}
