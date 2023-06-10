import {
  type CompositeSpecification,
  type ISpecVisitor,
} from '@datalking/pivot-entity';
import { type ISpecification } from '@datalking/pivot-entity';

import {
  type WithFieldDescription,
  type WithFieldDisplay,
  type WithFieldName,
} from '../field/specifications/base-field.specification';
import { type WithFormat } from '../field/specifications/date-field.specification';
import { type WithFieldRequirement } from '../field/specifications/field-constraints.specification';
import { type WithoutField } from '../field/specifications/field.specification';
import { type WithRatingMax } from '../field/specifications/rating-field.specification';
import {
  type WithDisplayFields,
  type WithSymmetricReferenceField,
} from '../field/specifications/reference-field.specification';
import {
  type WithNewOption,
  type WithOptions,
  type WithoutOption,
} from '../field/specifications/select-field.specification';
import { type Table } from '../table';
import { type WithKanbanField, type WithViewsOrder } from '../view/index';
import { type WithCalendarField } from '../view/specifications/calendar.specification';
import { type WithDisplayType } from '../view/specifications/display-type.specification';
import { type WithFilter } from '../view/specifications/filters.specificaiton';
import { type WithShowSystemFieldsSpec } from '../view/specifications/show-system-fields.specification';
import { type WithSorts } from '../view/specifications/sorts.specification';
import { type WithTreeViewField } from '../view/specifications/tree-view.specification';
import {
  type WithFieldOption,
  type WithFieldVisibility,
  type WithFieldWidth,
} from '../view/specifications/view-field-option.specification';
import { type WithViewFieldsOrder } from '../view/specifications/view-fields-order.specification';
import { type WithViewPinnedFields } from '../view/specifications/view-pinned-fields.specification';
import {
  type WithNewView,
  type WithoutView,
  type WithTableView,
  type WithTableViews,
  type WithViewName,
} from '../view/specifications/views.specification';
import { type WithTableEmoji } from './table-emoji.specification';
import { type WithNewField } from './table-field.specification';
import { type WithTableId } from './table-id.specification';
import { type WithTableName } from './table-name.specification';
import { type WithTableSchema } from './table-schema.specification';

export interface ITableSpecVisitor extends ISpecVisitor {
  idEqual(s: WithTableId): void;
  nameEqual(s: WithTableName): void;
  emojiEqual(s: WithTableEmoji): void;
  schemaEqual(s: WithTableSchema): void;
  viewsEqual(s: WithTableViews): void;
  viewEqual(s: WithTableView): void;
  viewNameEqual(s: WithViewName): void;
  newView(s: WithNewView): void;
  withoutView(s: WithoutView): void;
  viewsOrderEqual(s: WithViewsOrder): void;

  sortsEqual(s: WithSorts): void;

  filterEqual(s: WithFilter): void;
  fieldsOrder(s: WithViewFieldsOrder): void;
  fieldOptionsEqual(s: WithFieldOption): void;
  fieldWidthEqual(s: WithFieldWidth): void;
  fieldVisibility(s: WithFieldVisibility): void;
  pinnedFields(s: WithViewPinnedFields): void;

  ratingMaxEqual(s: WithRatingMax): void;

  displayTypeEqual(s: WithDisplayType): void;
  kanbanFieldEqual(s: WithKanbanField): void;
  calendarFieldEqual(s: WithCalendarField): void;
  treeViewFieldEqual(s: WithTreeViewField): void;

  newField(s: WithNewField): void;
  withoutField(s: WithoutField): void;

  optionsEqual(s: WithOptions): void;
  optionEqual(s: WithNewOption): void;
  newOption(s: WithNewOption): void;
  witoutOption(s: WithoutOption): void;

  withFieldName(s: WithFieldName): void;
  withFieldDescription(s: WithFieldDescription): void;
  withFieldDisplay(s: WithFieldDisplay): void;
  displayFieldsEqual(s: WithDisplayFields): void;
  withFormat(s: WithFormat): void;

  withShowSystemFields(s: WithShowSystemFieldsSpec): void;

  withFieldRequirement(s: WithFieldRequirement): void;
  symmetricReferenceFieldEqual(s: WithSymmetricReferenceField): void;
}

export type ITableSpec = ISpecification<Table, ITableSpecVisitor>;

export type TableCompositeSpecificaiton = CompositeSpecification<
  Table,
  ITableSpecVisitor
>;
