import type { Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';

import { CompositeSpecification } from '@datalking/pivot-entity';

import type { ITableSpecVisitor } from '../../specifications/index';
import type { Table } from '../../table';
import type { AbstractDateField } from '../field.base';
import { DateFormat } from '../value-objects/date-format.vo';

export class WithFormat extends CompositeSpecification<
  Table,
  ITableSpecVisitor
> {
  constructor(
    public readonly field: AbstractDateField,
    public readonly format: DateFormat,
  ) {
    super();
  }
  static fromString(field: AbstractDateField, format: string) {
    return new this(field, DateFormat.fromString(format));
  }
  isSatisfiedBy(t: Table): boolean {
    return this.field.format?.equals(this.format) ?? false;
  }
  mutate(t: Table): Result<Table, string> {
    this.field.format = this.format;
    return Ok(t);
  }
  accept(v: ITableSpecVisitor): Result<void, string> {
    v.withFormat(this);
    return Ok(undefined);
  }
}
