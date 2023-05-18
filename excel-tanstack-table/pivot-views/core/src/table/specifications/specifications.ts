import type { ClsStore } from '../../cls/cls';
import type { ICreateTableInput_internal } from '../table.schema';
import { WithTableViews } from '../view/specifications/views.specification';
import { WithTableEmoji } from './table-emoji.specification';
import { WithTableId } from './table-id.specification';
import { WithTableName } from './table-name.specification';
import { WithTableSchema } from './table-schema.specification';

export const newTableSpec = (
  input: ICreateTableInput_internal,
  ctx: ClsStore,
) => {
  return WithTableName.fromString(input.name)
    .and(WithTableId.fromString(input.id))
    .and(WithTableSchema.from(input.schema, ctx))
    .and(WithTableViews.from(input.views))
    .and(WithTableEmoji.fromString(input.emoji));
};
