import {
  type CompositeSpecification,
  type ISpecVisitor,
} from '@datalking/pivot-entity';
import { type ISpecification } from '@datalking/pivot-entity';

import { type Record } from '../record';
import {
  type HasExtension,
  type HasFileType,
  type IsAttachmentEmpty,
} from './attachment.specification';
import { type BoolIsFalse, type BoolIsTrue } from './bool.specification';
import { type DateRangeEqual } from './date-range.specification';
import {
  type DateEqual,
  type DateGreaterThan,
  type DateGreaterThanOrEqual,
  type DateIsToday,
  type DateLessThan,
  type DateLessThanOrEqual,
} from './date.specification';
import {
  type NumberEqual,
  type NumberGreaterThan,
  type NumberGreaterThanOrEqual,
  type NumberLessThan,
  type NumberLessThanOrEqual,
} from './number.specification';
import { type ParentAvailableSpec } from './parent.specification';
import { type WithRecordAutoIncrement } from './record-auto-increment.specification';
import { type WithRecordCreatedAt } from './record-created-at.specification';
import { type WithRecordCreatedBy } from './record-created-by.specification';
import {
  type WithRecordId,
  type WithRecordIds,
} from './record-id.specification';
import { type WithRecordTableId } from './record-table-id.specification';
import { type WithRecordUpdatedAt } from './record-updated-at.specification';
import { type WithRecordUpdatedBy } from './record-updated-by.specification';
import { type WithRecordValues } from './record-values.specification';
import { type ReferenceEqual } from './reference.specification';
import { type SelectEqual, type SelectIn } from './select.specification';
import {
  type StringContain,
  type StringEndsWith,
  type StringEqual,
  type StringRegex,
  type StringStartsWith,
} from './string.specification';
import { type IsTreeRoot, type TreeAvailableSpec } from './tree.specification';

interface IRecordSpecVisitor {
  idEqual(s: WithRecordId): void;
  idsIn(s: WithRecordIds): void;
  tableIdEqual(s: WithRecordTableId): void;

  createdAt(s: WithRecordCreatedAt): void;
  createdBy(s: WithRecordCreatedBy): void;
  updatedAt(s: WithRecordUpdatedAt): void;
  updatedBy(s: WithRecordUpdatedBy): void;

  autoIncrement(s: WithRecordAutoIncrement): void;

  values(s: WithRecordValues): void;
}

interface IRecordValueVisitor {
  stringEqual(s: StringEqual): void;
  stringContain(s: StringContain): void;
  stringStartsWith(s: StringStartsWith): void;
  stringEndsWith(s: StringEndsWith): void;
  stringRegex(s: StringRegex): void;

  numberEqual(s: NumberEqual): void;
  numberGreaterThan(s: NumberGreaterThan): void;
  numberLessThan(s: NumberLessThan): void;
  numberGreaterThanOrEqual(s: NumberGreaterThanOrEqual): void;
  numberLessThanOrEqual(s: NumberLessThanOrEqual): void;

  dateEqual(s: DateEqual): void;
  dateGreaterThan(s: DateGreaterThan): void;
  dateLessThan(s: DateLessThan): void;
  dateGreaterThanOrEqual(s: DateGreaterThanOrEqual): void;
  dateLessThanOrEqual(s: DateLessThanOrEqual): void;
  dateIsToday(s: DateIsToday): void;

  dateRangeEqual(s: DateRangeEqual): void;

  selectEqual(s: SelectEqual): void;
  selectIn(s: SelectIn): void;

  boolIsTrue(s: BoolIsTrue): void;
  boolIsFalse(s: BoolIsFalse): void;

  referenceEqual(s: ReferenceEqual): void;

  treeAvailable(s: TreeAvailableSpec): void;
  isTreeRoot(s: IsTreeRoot): void;

  parentAvailable(s: ParentAvailableSpec): void;

  hasFileType(s: HasFileType): void;
  hasExtension(s: HasExtension): void;
  isAttachmentEmpty(s: IsAttachmentEmpty): void;
}

export type RecordCompositeSpecification = CompositeSpecification<
  Record,
  IRecordVisitor
>;

export type IRecordSpec = ISpecification<Record, IRecordVisitor>;

export type IRecordVisitor = IRecordSpecVisitor &
  IRecordValueVisitor &
  ISpecVisitor;
