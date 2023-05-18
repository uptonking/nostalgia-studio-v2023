import { isEqual } from 'lodash-es';
import type { Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';

import { CompositeSpecification } from '@datalking/pivot-entity';

import type { ITableSpecVisitor } from '../../specifications/index';
import type { Table } from '../../table';
import type { IAbstractLookingField } from '../field.type';
import type { ReferenceField } from '../reference-field';
import { FieldId } from '../value-objects/field-id.vo';

export class WithDisplayFields extends CompositeSpecification<
  Table,
  ITableSpecVisitor
> {
  constructor(
    public readonly field: IAbstractLookingField,
    public readonly displayFields: FieldId[],
  ) {
    super();
  }
  static fromIds(field: IAbstractLookingField, ids: string[]) {
    return new this(
      field,
      ids.map((id) => FieldId.fromString(id)),
    );
  }
  isSatisfiedBy(t: Table): boolean {
    return isEqual(this.field.displayFieldIds, this);
  }
  mutate(t: Table): Result<Table, string> {
    this.field.displayFieldIds = this.displayFields;
    return Ok(t);
  }
  accept(v: ITableSpecVisitor): Result<void, string> {
    v.displayFieldsEqual(this);
    return Ok(undefined);
  }
}

export class WithSymmetricReferenceField extends CompositeSpecification<
  Table,
  ITableSpecVisitor
> {
  constructor(
    public readonly field: ReferenceField,
    public readonly symmetricReferenceFieldId: FieldId,
  ) {
    super();
  }
  static fromString(field: ReferenceField, fieldId: string) {
    return new this(field, FieldId.fromString(fieldId));
  }
  isSatisfiedBy(t: Table): boolean {
    return this.symmetricReferenceFieldId.equals(
      this.field.symmetricReferenceFieldId,
    );
  }
  mutate(t: Table): Result<Table, string> {
    this.field.symmetricReferenceFieldId = this.symmetricReferenceFieldId;
    return Ok(t);
  }
  accept(v: ITableSpecVisitor): Result<void, string> {
    v.symmetricReferenceFieldEqual(this);
    return Ok(undefined);
  }
}
