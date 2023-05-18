import type { Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';

import { CompositeSpecification } from '@datalking/pivot-entity';

import type { ITableSpecVisitor } from '../../specifications/index';
import type { Table } from '../../table';
import type { RatingField } from '../rating-field';

export class WithRatingMax extends CompositeSpecification<
  Table,
  ITableSpecVisitor
> {
  constructor(public readonly field: RatingField, public readonly max: number) {
    super();
  }

  isSatisfiedBy(t: Table): boolean {
    return this.max === this.field.max;
  }
  mutate(t: Table): Result<Table, string> {
    this.field.max = this.max;
    return Ok(t);
  }
  accept(v: ITableSpecVisitor): Result<void, string> {
    v.ratingMaxEqual(this);
    return Ok(undefined);
  }
}
