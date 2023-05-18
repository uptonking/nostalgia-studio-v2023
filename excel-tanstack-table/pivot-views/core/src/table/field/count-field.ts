import { z } from 'zod';

import { andOptions } from '@datalking/pivot-entity';

import { CountFieldValue } from './count-field-value';
import type {
  CountType,
  ICreateCountFieldInput,
  ICreateCountFieldValue,
  IUpdateCountFieldInput,
} from './count-field.type';
import { AbstractLookupField, BaseField } from './field.base';
import type { ICountField } from './field.type';
import type { IFieldVisitor } from './field.visitor';
import type { ICountFilter, ICountFilterOperator } from './filter/count.filter';
import { FieldId } from './value-objects/field-id.vo';

export class CountField extends AbstractLookupField<ICountField> {
  type: CountType = 'count';

  override get primitive() {
    return true;
  }

  override get isAggregate() {
    return true;
  }

  override get isNumeric() {
    return true;
  }

  static create(input: Omit<ICreateCountFieldInput, 'type'>): CountField {
    return new CountField({
      ...BaseField.createBase(input),
      referenceFieldId: FieldId.fromString(input.referenceFieldId),
    });
  }

  static unsafeCreate(input: ICreateCountFieldInput): CountField {
    return new CountField({
      ...BaseField.unsafeCreateBase(input),
      referenceFieldId: FieldId.fromString(input.referenceFieldId),
    });
  }

  public override update(input: IUpdateCountFieldInput) {
    return andOptions(
      this.updateBase(input),
      this.updateReferenceId(input.referenceFieldId),
    );
  }

  createValue(value: ICreateCountFieldValue): CountFieldValue {
    return new CountFieldValue(value);
  }

  createFilter(
    operator: ICountFilterOperator,
    value: number | null,
  ): ICountFilter {
    return { operator, value, path: this.id.value, type: 'count' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.count(this);
  }

  get valueSchema() {
    const count = z.number().int().nonnegative();
    return this.required ? count : count.nullable();
  }
}
