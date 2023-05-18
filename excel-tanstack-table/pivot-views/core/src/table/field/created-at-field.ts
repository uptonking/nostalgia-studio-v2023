import type { Option } from 'oxide.ts';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';

import { andOptions } from '@datalking/pivot-entity';

import type { TableCompositeSpecificaiton } from '../specifications/index';
import { CreatedAtFieldValue } from './created-at-field-value';
import type {
  CreatedAtFieldType,
  ICreateCreatedAtFieldInput,
  ICreatedAtFieldQueryValue,
  IUpdateCreatedAtFieldInput,
} from './created-at-field.type';
import { AbstractDateField } from './field.base';
import type { ICreatedAtField } from './field.type';
import type { IFieldVisitor } from './field.visitor';
import type { ICreatedAtFilter } from './filter/created-at.filter';
import type { ICreatedAtFilterOperator } from './filter/operators';
import { DateFormat } from './value-objects/date-format.vo';

export class CreatedAtField extends AbstractDateField<ICreatedAtField> {
  type: CreatedAtFieldType = 'created-at';

  override get system() {
    return true;
  }

  override get primitive() {
    return true;
  }

  static default(name: string): CreatedAtField {
    return this.create({ name });
  }

  static create(
    input: Omit<ICreateCreatedAtFieldInput, 'type'>,
  ): CreatedAtField {
    return new CreatedAtField({
      ...super.createBase(input),
      format: input.format ? DateFormat.fromString(input.format) : undefined,
    });
  }

  static unsafeCreate(input: ICreateCreatedAtFieldInput): CreatedAtField {
    return new CreatedAtField({
      ...super.unsafeCreateBase(input),
      format: input.format ? DateFormat.fromString(input.format) : undefined,
    });
  }

  public override update(
    input: IUpdateCreatedAtFieldInput,
  ): Option<TableCompositeSpecificaiton> {
    return andOptions(this.updateBase(input), this.updateFormat(input.format));
  }

  createValue(value: ICreatedAtFieldQueryValue): CreatedAtFieldValue {
    return CreatedAtFieldValue.fromQuery(value);
  }

  createFilter(
    operator: ICreatedAtFilterOperator,
    value: string | null,
  ): ICreatedAtFilter {
    return { operator, value, path: this.id.value, type: 'created-at' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.createdAt(this);
  }

  get valueSchema(): ZodTypeAny {
    return z.string().datetime();
  }
}
