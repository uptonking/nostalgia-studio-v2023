import { CompositeSpecification } from '@datalking/pivot-entity';

import type { ITableSpecVisitor } from '../../specifications/index';
import type { Table } from '../../table';
import type { View } from '../view';

export abstract class BaseViewSpecification extends CompositeSpecification<
  Table,
  ITableSpecVisitor
> {
  constructor(public readonly view: View) {
    super();
  }
}
