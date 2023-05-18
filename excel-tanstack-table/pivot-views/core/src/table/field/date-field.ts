import type { Option } from 'oxide.ts';
import { z } from 'zod';

import { andOptions } from '@datalking/pivot-entity';

import type { TableCompositeSpecificaiton } from '../specifications/interface';
import { DateFieldValue } from './date-field-value';
import type {
  DateType,
  ICreateDateFieldSchema,
  IDateFieldQueryValue,
  IUpdateDateFieldInput,
} from './date-field.type';
import { AbstractDateField } from './field.base';
import type { IDateField } from './field.type';
import type { IFieldVisitor } from './field.visitor';
import type { IDateFilter } from './filter/date.filter';
import type { IDateFilterOperator } from './filter/index';
import { dateBuiltInOperators } from './filter/operators';
import { DateFormat } from './value-objects/date-format.vo';

export class DateField extends AbstractDateField<IDateField> {
  type: DateType = 'date';

  override get primitive() {
    return true;
  }

  static create(input: Omit<ICreateDateFieldSchema, 'type'>): DateField {
    return new DateField({
      ...super.createBase(input),
      format: input.format ? DateFormat.fromString(input.format) : undefined,
    });
  }

  static unsafeCreate(input: ICreateDateFieldSchema): DateField {
    return new DateField({
      ...super.unsafeCreateBase(input),
      format: input.format ? DateFormat.fromString(input.format) : undefined,
    });
  }

  public override update(
    input: IUpdateDateFieldInput,
  ): Option<TableCompositeSpecificaiton> {
    return andOptions(this.updateBase(input), this.updateFormat(input.format));
  }

  createValue(value: IDateFieldQueryValue): DateFieldValue {
    return DateFieldValue.fromNullableString(value);
  }

  createFilter(
    operator: IDateFilterOperator,
    value: string | null,
  ): IDateFilter {
    // built in operators ignore value
    let v = value;
    if (dateBuiltInOperators.has(operator)) {
      v = null;
    }
    return { operator, value: v, path: this.id.value, type: 'date' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.date(this);
  }

  get valueSchema() {
    const date = z.string().datetime();
    return this.required ? date : date.nullable();
  }
}
