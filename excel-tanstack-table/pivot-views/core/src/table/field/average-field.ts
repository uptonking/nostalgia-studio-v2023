import { Mixin } from 'ts-mixer';
import { z } from 'zod';

import { andOptions } from '@datalking/pivot-entity';

import { AverageFieldValue } from './average-field-value';
import type {
  AverageType,
  ICreateAverageFieldInput,
  ICreateAverageFieldValue,
  IUpdateAverageFieldInput,
} from './average-field.type';
import {
  AbstractAggregateField,
  AbstractLookupField,
  BaseField,
} from './field.base';
import type { IAverageField } from './field.type';
import type { IFieldVisitor } from './field.visitor';
import type {
  IAverageFilter,
  IAverageFilterOperator,
} from './filter/average.filter';
import { FieldId } from './value-objects/field-id.vo';

export class AverageField extends Mixin(
  AbstractAggregateField<IAverageField>,
  AbstractLookupField<IAverageField>,
) {
  type: AverageType = 'average';

  override get primitive() {
    return true;
  }

  override get isNumeric() {
    return true;
  }

  static create(input: Omit<ICreateAverageFieldInput, 'type'>): AverageField {
    return new AverageField({
      ...BaseField.createBase(input),
      referenceFieldId: FieldId.fromString(input.referenceFieldId),
      aggregateFieldId: FieldId.fromString(input.aggregateFieldId),
    });
  }

  static unsafeCreate(input: ICreateAverageFieldInput): AverageField {
    return new AverageField({
      ...BaseField.unsafeCreateBase(input),
      referenceFieldId: FieldId.fromString(input.referenceFieldId),
      aggregateFieldId: FieldId.fromString(input.aggregateFieldId),
    });
  }

  public override update(input: IUpdateAverageFieldInput) {
    return andOptions(
      this.updateBase(input),
      this.updateReferenceId(input.referenceFieldId),
      this.updateAggregateFieldId(input.aggregateFieldId),
    );
  }

  createValue(value: ICreateAverageFieldValue): AverageFieldValue {
    return new AverageFieldValue(value);
  }

  createFilter(
    operator: IAverageFilterOperator,
    value: number | null,
  ): IAverageFilter {
    return { operator, value, path: this.id.value, type: 'average' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.average(this);
  }

  get valueSchema() {
    const average = z.number().int().nonnegative();
    return this.required ? average : average.nullable();
  }
}
