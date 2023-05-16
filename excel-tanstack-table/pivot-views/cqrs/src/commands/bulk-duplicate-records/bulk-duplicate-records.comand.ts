import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IBulkDuplicateRecordsInput } from './bulk-duplicate-records.command.input.js';

export class BulkDuplicateRecordsCommand extends Command {
  readonly ids: string[];
  readonly tableId: string;

  constructor(props: CommandProps<IBulkDuplicateRecordsInput>) {
    super(props);
    this.tableId = props.tableId;
    this.ids = props.ids;
  }
}
