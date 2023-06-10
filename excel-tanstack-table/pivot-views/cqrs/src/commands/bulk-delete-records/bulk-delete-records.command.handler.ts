import {
  type IRecordRepository,
  type ITableRepository,
} from '@datalking/pivot-core';
import { type ICommandHandler } from '@datalking/pivot-entity';

import { type BulkDeleteRecordsCommand } from './bulk-delete-records.comand';

export class BulkDeleteRecordsCommandHandler
  implements ICommandHandler<BulkDeleteRecordsCommand, void>
{
  constructor(
    protected readonly tableRepo: ITableRepository,
    protected readonly recordRepo: IRecordRepository,
  ) {}

  async execute(command: BulkDeleteRecordsCommand): Promise<void> {
    const table = (await this.tableRepo.findOneById(command.tableId)).unwrap();

    await this.recordRepo.deleteManyByIds(
      table.id.value,
      command.ids,
      table.schema.toIdMap(),
    );
  }
}
