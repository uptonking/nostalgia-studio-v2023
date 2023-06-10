import { type TableCompositeSpecificaiton } from '../specifications/index';
import { type Table } from '../table';
import { type ITableRepository } from '../table.repository';
import { ForeignTableReferenceHandler } from './foreign-table-reference.handler';
import { ForeignTableCollector } from './foreign-table.collector';

export interface ITableSpecHandler {
  handle(table: Table, spec: TableCompositeSpecificaiton): Promise<void>;
}

export class TableSpecHandler implements ITableSpecHandler {
  constructor(private readonly tableRepo: ITableRepository) {}

  async #handleReference(table: Table, spec: TableCompositeSpecificaiton) {
    const v = new ForeignTableCollector(table);
    spec.accept(v);

    for (const foreignTableId of v.foreignTableIds) {
      const foreignTable = (
        await this.tableRepo.findOneById(foreignTableId)
      ).unwrap();
      const visitor = new ForeignTableReferenceHandler(table, foreignTable);

      spec.accept(visitor);

      const foreignSpec = visitor.spec.into();
      if (foreignSpec) {
        foreignSpec.mutate(foreignTable);
        await this.tableRepo.updateOneById(foreignTable.id.value, foreignSpec);
      }
    }
  }

  async handle(table: Table, spec: TableCompositeSpecificaiton): Promise<void> {
    await this.#handleReference(table, spec);
  }
}
