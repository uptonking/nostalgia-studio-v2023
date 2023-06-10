import { type Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';

import { CompositeSpecification } from '@datalking/pivot-entity';

import { type ITableSpecVisitor } from '../../specifications/index';
import { type Table } from '../../table';
import { type IAbstractAggregateField } from '../field.type';
import { FieldId } from '../value-objects/index';

export class WithAggregateFieldId extends CompositeSpecification<
  Table,
  ITableSpecVisitor
> {
  constructor(
    private readonly field: IAbstractAggregateField,
    private readonly aggregateFieldId: FieldId,
  ) {
    super();
  }

  static fromString(field: IAbstractAggregateField, fieldId: string) {
    return new this(field, FieldId.fromString(fieldId));
  }

  isSatisfiedBy(t: Table): boolean {
    return this.aggregateFieldId.equals(this.field.aggregateFieldId);
  }
  mutate(t: Table): Result<Table, string> {
    this.field.aggregateFieldId = this.aggregateFieldId;
    return Ok(t);
  }
  accept(v: ITableSpecVisitor): Result<void, string> {
    return Ok(undefined);
  }
}
