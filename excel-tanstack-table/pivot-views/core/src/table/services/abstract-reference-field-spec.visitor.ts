/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type AverageField } from '../field/average-field';
import { type CollaboratorField } from '../field/collaborator-field';
import {
  type AttachmentField,
  type AutoIncrementField,
  type BoolField,
  type ColorField,
  type CountField,
  type CreatedAtField,
  type CreatedByField,
  type DateField,
  type DateRangeField,
  type EmailField,
  type IFieldVisitor,
  type IdField,
  type LookupField,
  type NumberField,
  type ParentField,
  type RatingField,
  type ReferenceField,
  type SelectField,
  type StringField,
  type SumField,
  type TreeField,
  type UpdatedAtField,
  type UpdatedByField,
  type WithDisplayFields,
  type WithFieldDescription,
  type WithFieldDisplay,
  type WithFieldName,
  type WithFieldRequirement,
  type WithFormat,
  type WithNewOption,
  type WithOptions,
  type WithRatingMax,
  type WithSymmetricReferenceField,
  type WithoutField,
  type WithoutOption,
} from '../field/index';
import {
  type ITableSpecVisitor,
  type WithFilter,
  type WithNewField,
  type WithTableEmoji,
  type WithTableId,
  type WithTableName,
  type WithTableSchema,
} from '../specifications/index';
import {
  type WithCalendarField,
  type WithDisplayType,
  type WithFieldOption,
  type WithFieldVisibility,
  type WithFieldWidth,
  type WithKanbanField,
  type WithNewView,
  type WithShowSystemFieldsSpec,
  type WithSorts,
  type WithTableView,
  type WithTableViews,
  type WithTreeViewField,
  type WithViewFieldsOrder,
  type WithViewName,
  type WithViewPinnedFields,
  type WithViewsOrder,
  type WithoutView,
} from '../view/index';

export abstract class AbstractReferenceFieldSpecVisitor
  implements ITableSpecVisitor, IFieldVisitor
{
  ratingMaxEqual(s: WithRatingMax): void {}
  id(field: IdField): void {}
  createdAt(field: CreatedAtField): void {}
  createdBy(field: CreatedByField): void {}
  updatedBy(field: UpdatedByField): void {}
  updatedAt(field: UpdatedAtField): void {}
  attachment(field: AttachmentField): void {}
  autoIncrement(field: AutoIncrementField): void {}
  string(field: StringField): void {}
  email(field: EmailField): void {}
  color(field: ColorField): void {}
  number(field: NumberField): void {}
  bool(field: BoolField): void {}
  date(field: DateField): void {}
  dateRange(field: DateRangeField): void {}
  select(field: SelectField): void {}
  abstract reference(field: ReferenceField): void;
  abstract tree(field: TreeField): void;
  abstract parent(field: ParentField): void;
  collaborator(field: CollaboratorField): void {}
  rating(field: RatingField): void {}
  count(field: CountField): void {}
  sum(field: SumField): void {}
  average(field: AverageField): void {}
  lookup(field: LookupField): void {}
  idEqual(s: WithTableId): void {}
  nameEqual(s: WithTableName): void {}
  schemaEqual(s: WithTableSchema): void {
    for (const field of s.schema.fields) {
      field.accept(this);
    }
  }
  viewsEqual(s: WithTableViews): void {}
  viewEqual(s: WithTableView): void {}
  viewNameEqual(s: WithViewName): void {}
  newView(s: WithNewView): void {}
  emojiEqual(s: WithTableEmoji): void {}
  withoutView(s: WithoutView): void {}
  viewsOrderEqual(s: WithViewsOrder): void {}
  sortsEqual(s: WithSorts): void {}
  filterEqual(s: WithFilter): void {}
  fieldsOrder(s: WithViewFieldsOrder): void {}
  fieldOptionsEqual(s: WithFieldOption): void {}
  fieldWidthEqual(s: WithFieldWidth): void {}
  fieldVisibility(s: WithFieldVisibility): void {}
  pinnedFields(s: WithViewPinnedFields): void {}
  displayTypeEqual(s: WithDisplayType): void {}
  kanbanFieldEqual(s: WithKanbanField): void {}
  calendarFieldEqual(s: WithCalendarField): void {}
  treeViewFieldEqual(s: WithTreeViewField): void {}
  newField(s: WithNewField): void {
    s.field.accept(this);
  }
  withoutField(s: WithoutField): void {}
  optionsEqual(s: WithOptions): void {}
  optionEqual(s: WithNewOption): void {}
  newOption(s: WithNewOption): void {}
  witoutOption(s: WithoutOption): void {}
  withFieldName(s: WithFieldName): void {}
  withFieldDescription(s: WithFieldDescription): void {}
  withFieldDisplay(s: WithFieldDisplay): void {}
  displayFieldsEqual(s: WithDisplayFields): void {}
  withFormat(s: WithFormat): void {}
  withShowSystemFields(s: WithShowSystemFieldsSpec): void {}
  withFieldRequirement(s: WithFieldRequirement): void {}
  symmetricReferenceFieldEqual(s: WithSymmetricReferenceField): void {}
  not(): this {
    return this;
  }
}
