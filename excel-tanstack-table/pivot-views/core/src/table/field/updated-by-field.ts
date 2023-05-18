import type { Option } from 'oxide.ts';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';

import type { TableCompositeSpecificaiton } from '../specifications/index';
import { BaseField } from './field.base';
import type { IUpdatedByField } from './field.type';
import type { IFieldVisitor } from './field.visitor';
import type { IUpdatedByFilterOperator } from './filter/operators';
import type { IUpdatedByFilter } from './filter/updated-by.filter';
import { UpdatedByFieldValue } from './updated-by-field-value';
import type {
  ICreateUpdatedByFieldInput,
  IUpdatedByFieldQueryValue,
  IUpdateUpdatedByFieldInput,
  UpdatedByFieldType,
} from './updated-by-field.type';

export class UpdatedByField extends BaseField<IUpdatedByField> {
  type: UpdatedByFieldType = 'updated-by';

  override get system() {
    return true;
  }

  override get primitive() {
    return true;
  }

  static default(name: string): UpdatedByField {
    return this.create({ name });
  }

  static create(
    input: Omit<ICreateUpdatedByFieldInput, 'type'>,
  ): UpdatedByField {
    return new UpdatedByField({
      ...super.createBase(input),
    });
  }

  static unsafeCreate(input: ICreateUpdatedByFieldInput): UpdatedByField {
    return new UpdatedByField({
      ...super.unsafeCreateBase(input),
    });
  }

  public override update(
    input: IUpdateUpdatedByFieldInput,
  ): Option<TableCompositeSpecificaiton> {
    return this.updateBase(input);
  }

  createValue(value: IUpdatedByFieldQueryValue): UpdatedByFieldValue {
    return UpdatedByFieldValue.fromQuery(value);
  }

  createFilter(
    operator: IUpdatedByFilterOperator,
    value: string,
  ): IUpdatedByFilter {
    return { operator, value, path: this.id.value, type: 'updated-by' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.updatedBy(this);
  }

  get valueSchema(): ZodTypeAny {
    return z.any();
  }
}
