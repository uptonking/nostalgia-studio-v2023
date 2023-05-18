import type { Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';

import { CompositeSpecification } from '@datalking/pivot-entity';

import type { Table } from '../table';
import { TableId } from '../value-objects/index';
import type { ITableSpecVisitor } from './interface';

export class WithTableId extends CompositeSpecification {
  constructor(public readonly id: TableId) {
    super();
  }

  static fromString(id?: string): WithTableId {
    return new WithTableId(TableId.fromOrCreate(id));
  }

  static fromExistingString(id: string) {
    return TableId.from(id).map((id) => new WithTableId(id));
  }

  isSatisfiedBy(t: Table): boolean {
    return this.id.equals(t.id);
  }

  mutate(t: Table): Result<Table, string> {
    t.id = this.id;
    return Ok(t);
  }

  accept(v: ITableSpecVisitor): Result<void, string> {
    v.idEqual(this);
    return Ok(undefined);
  }
}
