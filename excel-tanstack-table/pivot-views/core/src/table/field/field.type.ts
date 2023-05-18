import type { Option } from 'oxide.ts';
import * as z from 'zod';

import type { Options } from '../option/options';
import type { IRecordDisplayValues } from '../record/index';
import type { TableCompositeSpecificaiton } from '../specifications/interface';
import type { TableId } from '../value-objects/table-id.vo';
import type { TableSchemaIdMap } from '../value-objects/table-schema.vo';
import type { AttachmentField } from './attachment-field';
import type { AttachmentFieldValue } from './attachment-field-value';
import type { IAttachmentFieldValue } from './attachment-field.type';
import {
  attachmentFieldQuerySchema,
  attachmentFieldQueryValue,
  attachmentTypeSchema,
  createAttachmentFieldSchema,
  createAttachmentFieldValue_internal,
  updateAttachmentFieldSchema,
} from './attachment-field.type';
import type { AutoIncrementField } from './auto-increment-field';
import type { AutoIncrementFieldValue } from './auto-increment-field-value';
import type { IAutoIncrementFieldValue } from './auto-increment-field.type';
import {
  autoIncrementFieldQuerySchema,
  autoIncrementQueryValue,
  autoIncrementTypeSchema,
  createAutoIncrementFieldSchema,
  createAutoIncrementFieldValue_internal,
  updateAutoIncrementFieldSchema,
} from './auto-increment-field.type';
import type { AverageField } from './average-field';
import type { AverageFieldValue } from './average-field-value';
import type { IAverageFieldValue } from './average-field.type';
import {
  averageFieldQuerySchema,
  averageFieldQueryValue,
  averageTypeSchema,
  createAverageFieldSchema,
  createAverageFieldValue_internal,
  updateAverageFieldSchema,
} from './average-field.type';
import type { BoolField } from './bool-field';
import type { BoolFieldValue } from './bool-field-value';
import type { IBoolFieldValue } from './bool-field.type';
import {
  boolFieldQuerySchema,
  boolFieldQueryValue,
  boolTypeSchema,
  createBoolFieldSchema,
  createBoolFieldValue_internal,
  updateBoolFieldSchema,
} from './bool-field.type';
import type { CollaboratorField } from './collaborator-field';
import type { CollaboratorFieldValue } from './collaborator-field-value';
import type { ICollaboratorFieldValue } from './collaborator-field.type';
import {
  collaboratorFieldQuerySchema,
  collaboratorFieldQueryValue,
  collaboratorTypeSchema,
  createCollaboratorFieldSchema,
  createCollaboratorFieldValue_internal,
  updateCollaboratorFieldSchema,
} from './collaborator-field.type';
import type { ColorField } from './color-field';
import type { ColorFieldValue } from './color-field-value';
import type { IColorFieldValue } from './color-field.type';
import {
  colorFieldQuerySchema,
  colorFieldQueryValue,
  colorTypeSchema,
  createColorFieldSchema,
  createColorFieldValue_internal,
  updateColorFieldSchema,
} from './color-field.type';
import type { CountField } from './count-field';
import type { CountFieldValue } from './count-field-value';
import type { ICountFieldValue } from './count-field.type';
import {
  countFieldQuerySchema,
  countFieldQueryValue,
  countTypeSchema,
  createCountFieldSchema,
  createCountFieldValue_internal,
  updateCountFieldSchema,
} from './count-field.type';
import type { CreatedAtField } from './created-at-field';
import type { CreatedAtFieldValue } from './created-at-field-value';
import type { ICreatedAtFieldValue } from './created-at-field.type';
import {
  createCreatedAtFieldSchema,
  createCreatedAtFieldValue_internal,
  createdAtFieldQuerySchema,
  createdAtFieldQueryValue,
  createdAtTypeSchema,
  updateCreatedAtFieldSchema,
} from './created-at-field.type';
import type { CreatedByField } from './created-by-field';
import type { CreatedByFieldValue } from './created-by-field-value';
import type { ICreatedByFieldValue } from './created-by-field.type';
import {
  createCreatedByFieldSchema,
  createCreatedByFieldValue_internal,
  createdByFieldQuerySchema,
  createdByFieldQueryValue,
  createdByTypeSchema,
  updateCreatedByFieldSchema,
} from './created-by-field.type';
import type { DateField } from './date-field';
import type { DateFieldValue } from './date-field-value';
import type { IDateFieldValue } from './date-field.type';
import {
  createDateFieldSchema,
  createDateFieldValue_internal,
  dateFieldQuerySchema,
  dateFieldQueryValue,
  dateTypeSchema,
  updateDateFieldSchema,
} from './date-field.type';
import type { DateRangeField } from './date-range-field';
import type { DateRangeFieldValue } from './date-range-field-value';
import type { IDateRangeFieldValue } from './date-range-field.type';
import {
  createDateRangeFieldSchema,
  createDateRangeFieldValue_internal,
  dateRangeFieldQuerySchema,
  dateRangeFieldQueryValue,
  dateRangeTypeSchema,
  updateDateRangeFieldSchema,
} from './date-range-field.type';
import type { EmailField } from './email-field';
import type { EmailFieldValue } from './email-field-value';
import type { IEmailFieldValue } from './email-field.type';
import {
  createEmailFieldSchema,
  createEmailFieldValue_internal,
  emailFieldQuerySchema,
  emailFieldQueryValue,
  emailTypeSchema,
  updateEmailFieldSchema,
} from './email-field.type';
import { FIELD_TYPE_KEY } from './field.constants';
import type { IReferenceFilterValue } from './filter/reference.filter';
import type { IdField } from './id-field';
import type { IdFieldValue } from './id-field-value';
import type { IIdFieldValue } from './id-field.type';
import {
  createIdFieldSchema,
  createIdFieldValue_internal,
  idFieldQuerySchema,
  idFieldQueryValue,
  idTypeSchema,
  updateIdFieldSchema,
} from './id-field.type';
import type { LookupField } from './lookup-field';
import type { LookupFieldValue } from './lookup-field-value';
import type { ILookupFieldValue } from './lookup-field.type';
import {
  createLookupFieldSchema,
  createLookupFieldValue_internal,
  lookupFieldQuerySchema,
  lookupFieldQueryValue,
  lookupTypeSchema,
  updateLookupFieldSchema,
} from './lookup-field.type';
import type { NumberField } from './number-field';
import type { NumberFieldValue } from './number-field-value';
import type { INumberFieldValue } from './number-field.type';
import {
  createNumberFieldSchema,
  createNumberFieldValue_internal,
  numberFieldQuerySchema,
  numberFieldQueryValue,
  numberTypeSchema,
  updateNumberFieldSchema,
} from './number-field.type';
import type { ParentField } from './parent-field';
import type { ParentFieldValue } from './parent-field-value';
import type { IParentFieldValue } from './parent-field.type';
import {
  createParentFieldSchema,
  createParentFieldValue_internal,
  parentFieldQuerySchema,
  parentFieldQueryValue,
  parentTypeSchema,
  updateParentFieldSchema,
} from './parent-field.type';
import type { RatingField } from './rating-field';
import type { RatingFieldValue } from './rating-field-value';
import type { IRatingFieldValue } from './rating-field.type';
import {
  createRatingFieldSchema,
  createRatingFieldValue_internal,
  ratingFieldQuerySchema,
  ratingFieldQueryValue,
  ratingTypeSchema,
  updateRatingFieldSchema,
} from './rating-field.type';
import type { ReferenceField } from './reference-field';
import type { ReferenceFieldValue } from './reference-field-value';
import {
  createReferenceFieldSchema,
  createReferenceFieldValue_internal,
  referenceFieldQuerySchema,
  referenceFieldQueryValue,
  referenceTypeSchema,
  updateReferenceFieldSchema,
} from './reference-field.type';
import type { SelectField } from './select-field';
import type { SelectFieldValue } from './select-field-value';
import type { ISelectFieldValue } from './select-field.type';
import {
  createSelectFieldSchema,
  createSelectFieldValue_internal,
  selectFieldQuerySchema,
  selectFieldQueryValue,
  selectTypeSchema,
  updateSelectFieldSchema,
} from './select-field.type';
import type { StringField } from './string-field';
import type { StringFieldValue } from './string-field-value';
import type { IStringFieldValue } from './string-field.type';
import {
  createStringFieldSchema,
  createStringFieldValue_internal,
  stringFieldQuerySchema,
  stringFieldQueryValue,
  stringTypeSchema,
  updateStringFieldSchema,
} from './string-field.type';
import type { SumField } from './sum-field';
import type { SumFieldValue } from './sum-field-value';
import type { ISumFieldValue } from './sum-field.type';
import {
  createSumFieldSchema,
  createSumFieldValue_internal,
  sumFieldQuerySchema,
  sumFieldQueryValue,
  sumTypeSchema,
  updateSumFieldSchema,
} from './sum-field.type';
import type { TreeField } from './tree-field';
import type { TreeFieldValue } from './tree-field-value';
import type { ITreeFieldValue } from './tree-field.type';
import {
  createTreeFieldSchema,
  createTreeFieldValue_internal,
  treeFieldQuerySchema,
  treeFieldQueryValue,
  treeTypeSchema,
  updateTreeFieldSchema,
} from './tree-field.type';
import type { UpdatedAtField } from './updated-at-field';
import type { UpdatedAtFieldValue } from './updated-at-field-value';
import type { IUpdatedAtFieldValue } from './updated-at-field.type';
import {
  createUpdatedAtFieldSchema,
  createUpdatedAtFieldValue_internal,
  updatedAtFieldQuerySchema,
  updatedAtFieldQueryValue,
  updatedAtTypeSchema,
  updateUpdatedAtFieldSchema,
} from './updated-at-field.type';
import type { UpdatedByField } from './updated-by-field';
import type { UpdatedByFieldValue } from './updated-by-field-value';
import type { IUpdatedByFieldValue } from './updated-by-field.type';
import {
  createUpdatedByFieldSchema,
  createUpdatedByFieldValue_internal,
  updatedByFieldQuerySchema,
  updatedByFieldQueryValue,
  updatedByTypeSchema,
  updateUpdatedByFieldSchema,
} from './updated-by-field.type';
import type { FieldDescription } from './value-objects/field-description';
import type {
  DateFormat,
  DisplayFields,
  FieldId,
  FieldName,
  FieldValueConstraints,
} from './value-objects/index';

export const createFieldSchema = z.discriminatedUnion(FIELD_TYPE_KEY, [
  createIdFieldSchema,
  createCreatedAtFieldSchema,
  createUpdatedAtFieldSchema,
  createAutoIncrementFieldSchema,
  createStringFieldSchema,
  createEmailFieldSchema,
  createColorFieldSchema,
  createNumberFieldSchema,
  createDateFieldSchema,
  createSelectFieldSchema,
  createBoolFieldSchema,
  createDateRangeFieldSchema,
  createReferenceFieldSchema,
  createTreeFieldSchema,
  createParentFieldSchema,
  createRatingFieldSchema,
  createCountFieldSchema,
  createLookupFieldSchema,
  createSumFieldSchema,
  createAverageFieldSchema,
  createAttachmentFieldSchema,
  createCollaboratorFieldSchema,
  createCreatedByFieldSchema,
  createUpdatedByFieldSchema,
]);
export type ICreateFieldSchema = z.infer<typeof createFieldSchema>;

export const updateFieldSchema = z.discriminatedUnion(FIELD_TYPE_KEY, [
  updateIdFieldSchema,
  updateCreatedAtFieldSchema,
  updateUpdatedAtFieldSchema,
  updateAutoIncrementFieldSchema,
  updateStringFieldSchema,
  updateEmailFieldSchema,
  updateColorFieldSchema,
  updateNumberFieldSchema,
  updateDateFieldSchema,
  updateSelectFieldSchema,
  updateBoolFieldSchema,
  updateDateRangeFieldSchema,
  updateReferenceFieldSchema,
  updateTreeFieldSchema,
  updateParentFieldSchema,
  updateRatingFieldSchema,
  updateCountFieldSchema,
  updateLookupFieldSchema,
  updateSumFieldSchema,
  updateAverageFieldSchema,
  updateAttachmentFieldSchema,
  updateCollaboratorFieldSchema,
  updateCreatedByFieldSchema,
  updateUpdatedByFieldSchema,
]);
export type IUpdateFieldSchema = z.infer<typeof updateFieldSchema>;

export const queryFieldSchema = z.discriminatedUnion(FIELD_TYPE_KEY, [
  idFieldQuerySchema,
  createdAtFieldQuerySchema,
  updatedAtFieldQuerySchema,
  autoIncrementFieldQuerySchema,
  stringFieldQuerySchema,
  emailFieldQuerySchema,
  colorFieldQuerySchema,
  numberFieldQuerySchema,
  dateFieldQuerySchema,
  selectFieldQuerySchema,
  boolFieldQuerySchema,
  dateRangeFieldQuerySchema,
  referenceFieldQuerySchema,
  treeFieldQuerySchema,
  parentFieldQuerySchema,
  ratingFieldQuerySchema,
  countFieldQuerySchema,
  lookupFieldQuerySchema,
  sumFieldQuerySchema,
  averageFieldQuerySchema,
  attachmentFieldQuerySchema,
  collaboratorFieldQuerySchema,
  createdByFieldQuerySchema,
  updatedByFieldQuerySchema,
]);
export type IQueryFieldSchema = z.infer<typeof queryFieldSchema>;
export const querySchemaSchema = z.array(queryFieldSchema);
export type IQuerySchemaSchema = z.infer<typeof querySchemaSchema>;

export const fieldTypes = z.union([
  idTypeSchema,
  createdAtTypeSchema,
  updatedAtTypeSchema,
  autoIncrementTypeSchema,
  stringTypeSchema,
  colorTypeSchema,
  emailTypeSchema,
  numberTypeSchema,
  dateTypeSchema,
  selectTypeSchema,
  boolTypeSchema,
  dateRangeTypeSchema,
  referenceTypeSchema,
  treeTypeSchema,
  parentTypeSchema,
  ratingTypeSchema,
  countTypeSchema,
  lookupTypeSchema,
  sumTypeSchema,
  averageTypeSchema,
  attachmentTypeSchema,
  collaboratorTypeSchema,
  createdByTypeSchema,
  updatedByTypeSchema,
]);
export type IFieldType = z.infer<typeof fieldTypes>;

export const createFieldValueSchema_internal = z.discriminatedUnion(
  FIELD_TYPE_KEY,
  [
    createIdFieldValue_internal,
    createCreatedAtFieldValue_internal,
    createUpdatedAtFieldValue_internal,
    createAutoIncrementFieldValue_internal,
    createStringFieldValue_internal,
    createEmailFieldValue_internal,
    createColorFieldValue_internal,
    createNumberFieldValue_internal,
    createDateFieldValue_internal,
    createSelectFieldValue_internal,
    createBoolFieldValue_internal,
    createDateRangeFieldValue_internal,
    createReferenceFieldValue_internal,
    createTreeFieldValue_internal,
    createParentFieldValue_internal,
    createRatingFieldValue_internal,
    createCountFieldValue_internal,
    createLookupFieldValue_internal,
    createSumFieldValue_internal,
    createAverageFieldValue_internal,
    createAttachmentFieldValue_internal,
    createCollaboratorFieldValue_internal,
    createCreatedByFieldValue_internal,
    createUpdatedByFieldValue_internal,
  ],
);
export type ICreateFieldValueSchema_internal = z.infer<
  typeof createFieldValueSchema_internal
>;

export const createFieldsSchema_internal = z.array(
  createFieldValueSchema_internal,
);
export type ICreateFieldsSchema_internal = z.infer<
  typeof createFieldsSchema_internal
>;

export interface IBaseField {
  id: FieldId;
  system?: boolean;
  display?: boolean;
  name: FieldName;
  description?: FieldDescription;
  valueConstrains: FieldValueConstraints;
}

export type BaseDateField = { format?: DateFormat };

export type IIdField = IBaseField;
export type ICreatedAtField = IBaseField & BaseDateField;
export type ICreatedByField = IBaseField;
export type IUpdatedAtField = IBaseField & BaseDateField;
export type IUpdatedByField = IBaseField;
export type IAutoIncrementField = IBaseField;
export type IStringField = IBaseField;
export type IEmailField = IBaseField;
export type IAttachmentField = IBaseField;
export type IColorField = IBaseField;

export type INumberField = IBaseField;
export type IRatingField = IBaseField & { max?: number };

export type IDateField = IBaseField & BaseDateField;
export type IDateRangeField = IBaseField & BaseDateField;
export type ISelectField = IBaseField & {
  options: Options;
};

export type IBoolField = IBaseField;

export type ICollaboratorField = IBaseField;

export type IReferenceField = IBaseField & {
  displayFields?: DisplayFields;
  foreignTableId?: TableId;
  isOwner?: boolean;
  symmetricReferenceFieldId?: FieldId;
};
export type ITreeField = IBaseField & {
  parentFieldId?: FieldId;
  displayFields?: DisplayFields;
};
export type IParentField = IBaseField & {
  treeFieldId: FieldId;
  displayFields?: DisplayFields;
};

export type ICountField = IBaseField & { referenceFieldId: FieldId };
export type ISumField = IBaseField & {
  referenceFieldId: FieldId;
  aggregateFieldId: FieldId;
};
export type IAverageField = IBaseField & {
  referenceFieldId: FieldId;
  aggregateFieldId: FieldId;
};
export type ILookupField = IBaseField & {
  referenceFieldId: FieldId;
  displayFields: DisplayFields;
};

export type SystemField =
  | IdField
  | CreatedAtField
  | UpdatedAtField
  | CreatedByField
  | UpdatedByField;

export type IReferenceFieldTypes = IReferenceField | ITreeField | IParentField;
export type ReferenceFieldTypes = ReferenceField | TreeField | ParentField;
export type ILookingFieldTypes = IReferenceFieldTypes | ILookupField;
export type LookingFieldTypes = ReferenceFieldTypes | LookupField;
export type AggregateFieldType = CountField | SumField;
export type INumberAggregateFieldType = ISumField | IAverageField;
export type IDateFieldTypes =
  | IDateField
  | IDateRangeField
  | ICreatedAtField
  | IUpdatedAtField;
export type DateFieldTypes =
  | DateField
  | DateRangeField
  | CreatedAtField
  | UpdatedAtField;
export type ILookupFieldTypes = ICountField | ILookupField;
export type LookupFieldTypes = CountField | LookupField;

export type NoneSystemField =
  | StringField
  | NumberField
  | EmailField
  | ColorField
  | DateField
  | SelectField
  | BoolField
  | DateRangeField
  | ReferenceField
  | TreeField
  | ParentField
  | RatingField
  | AutoIncrementField
  | CountField
  | LookupField
  | SumField
  | AverageField
  | AttachmentField
  | CollaboratorField;

export type PrimitiveField =
  | StringField
  | NumberField
  | EmailField
  | ColorField
  | DateField
  | SelectField
  | BoolField
  | DateRangeField
  | RatingField
  | CreatedAtFieldValue
  | UpdatedAtFieldValue
  | AutoIncrementFieldValue
  | CountField
  | SumField
  | AverageField;

export type Field = SystemField | NoneSystemField;

export type FieldValue =
  | IdFieldValue
  | CreatedAtFieldValue
  | UpdatedAtFieldValue
  | AutoIncrementFieldValue
  | StringFieldValue
  | EmailFieldValue
  | ColorFieldValue
  | NumberFieldValue
  | DateFieldValue
  | SelectFieldValue
  | BoolFieldValue
  | DateRangeFieldValue
  | ReferenceFieldValue
  | TreeFieldValue
  | ParentFieldValue
  | RatingFieldValue
  | CountFieldValue
  | LookupFieldValue
  | SumFieldValue
  | AverageFieldValue
  | AttachmentFieldValue
  | CollaboratorFieldValue
  | CreatedByFieldValue
  | UpdatedByFieldValue;

export type FieldValues = FieldValue[];

export type UnpackedFieldValue =
  | IIdFieldValue
  | ICreatedAtFieldValue
  | IUpdatedAtFieldValue
  | IAutoIncrementFieldValue
  | IStringFieldValue
  | IEmailFieldValue
  | IColorFieldValue
  | INumberFieldValue
  | IDateFieldValue
  | ISelectFieldValue
  | IBoolFieldValue
  | IDateRangeFieldValue
  | IReferenceFilterValue
  | ITreeFieldValue
  | IParentFieldValue
  | IRatingFieldValue
  | ICountFieldValue
  | ILookupFieldValue
  | ISumFieldValue
  | IAverageFieldValue
  | IAttachmentFieldValue
  | ICollaboratorFieldValue
  | ICreatedByFieldValue
  | IUpdatedByFieldValue;

export const fieldQueryValue = z.union([
  treeFieldQueryValue,
  autoIncrementQueryValue,
  boolFieldQueryValue,
  colorFieldQueryValue,
  createdAtFieldQueryValue,
  dateFieldQueryValue,
  dateRangeFieldQueryValue,
  emailFieldQueryValue,
  idFieldQueryValue,
  numberFieldQueryValue,
  parentFieldQueryValue,
  referenceFieldQueryValue,
  selectFieldQueryValue,
  stringFieldQueryValue,
  updatedAtFieldQueryValue,
  ratingFieldQueryValue,
  countFieldQueryValue,
  lookupFieldQueryValue,
  sumFieldQueryValue,
  averageFieldQueryValue,
  attachmentFieldQueryValue,
  collaboratorFieldQueryValue,
  createdByFieldQueryValue,
  updatedByFieldQueryValue,
]);

export type IFieldQueryValue = z.infer<typeof fieldQueryValue>;

export const INTERNAL_COLUMN_ID_NAME = 'id';
export const INTERNAL_INCREAMENT_ID_NAME = 'auto_increment';
export const INTERNAL_COLUMN_CREATED_AT_NAME = 'created_at';
export const INTERNAL_COLUMN_CREATED_BY_NAME = 'created_by';
export const INTERNAL_COLUMN_UPDATED_AT_NAME = 'updated_at';
export const INTERNAL_COLUMN_UPDATED_BY_NAME = 'updated_by';
export const INTERNAL_DISPLAY_VALUES_NAME = 'display_values';

export interface IAbstractReferenceField {
  get foreignTableId(): Option<string>;
}

export interface IAbstractLookingField extends IBaseField {
  get multiple(): boolean;
  get displayFieldIds(): FieldId[];
  set displayFieldIds(fieldIds: FieldId[]);
  getDisplayValues(
    values: IRecordDisplayValues,
  ): ((string | null)[] | undefined)[];
  updateDisplayFieldIds(
    displayFieldIds?: string[],
  ): Option<TableCompositeSpecificaiton>;
}

export interface IAbstractDateField {
  get formatString(): string;
  get format(): DateFormat | undefined;
  set format(format: DateFormat | undefined);
  updateFormat(format?: string): Option<TableCompositeSpecificaiton>;
}

export interface IAbstractLookupField {
  get referenceFieldId(): FieldId;
  set referenceFieldId(fieldId: FieldId);
  getReferenceField(schema: TableSchemaIdMap): ReferenceField | TreeField;
  getForeignTableId(schema: TableSchemaIdMap): Option<string>;
  updateReferenceId(referenceId?: string): Option<TableCompositeSpecificaiton>;
}

export interface IAbstractAggregateField {
  get aggregateFieldId(): FieldId;
  set aggregateFieldId(fieldId: FieldId);
  updateAggregateFieldId(
    aggregateFieldId?: string,
  ): Option<TableCompositeSpecificaiton>;
}
