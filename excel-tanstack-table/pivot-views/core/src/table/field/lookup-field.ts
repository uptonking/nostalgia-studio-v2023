import type { Option } from 'oxide.ts';
import { Mixin } from 'ts-mixer';
import { z } from 'zod';

import { andOptions } from '@datalking/pivot-entity';

import type { TableCompositeSpecificaiton } from '../specifications/index';
import {
  AbstractLookingField,
  AbstractLookupField,
  BaseField,
} from './field.base';
import type { ILookupField } from './field.type';
import type { IFieldVisitor } from './field.visitor';
import type { ILookupFilter } from './filter/lookup.filter';
import type { ILookupFilterOperator } from './filter/operators';
import { LookupFieldValue } from './lookup-field-value';
import type {
  ICreateLookupFieldInput,
  ICreateLookupFieldValue,
  IUpdateLookupFieldInput,
  LookupType,
} from './lookup-field.type';
import { DisplayFields } from './value-objects/display-fields.vo';
import { FieldId } from './value-objects/field-id.vo';

export class LookupField extends Mixin(
  AbstractLookingField<ILookupField>,
  AbstractLookupField<ILookupField>,
) {
  type: LookupType = 'lookup';

  get multiple() {
    return true;
  }

  override get primitive() {
    return false;
  }

  override get filterable() {
    return false;
  }

  static create(input: Omit<ICreateLookupFieldInput, 'type'>): LookupField {
    return new LookupField({
      ...BaseField.createBase(input),
      referenceFieldId: FieldId.fromString(input.referenceFieldId),
      displayFields: new DisplayFields(
        input.displayFieldIds.map((id) => FieldId.fromString(id)),
      ),
    });
  }

  static unsafeCreate(input: ICreateLookupFieldInput): LookupField {
    return new LookupField({
      ...BaseField.unsafeCreateBase(input),
      referenceFieldId: FieldId.fromString(input.referenceFieldId),
      displayFields: new DisplayFields(
        input.displayFieldIds.map((id) => FieldId.fromString(id)),
      ),
    });
  }

  public override update(
    input: IUpdateLookupFieldInput,
  ): Option<TableCompositeSpecificaiton> {
    return andOptions(
      super.updateBase(input),
      this.updateDisplayFieldIds(input.displayFieldIds),
      this.updateReferenceId(input.referenceFieldId),
    );
  }

  createValue(value: ICreateLookupFieldValue): LookupFieldValue {
    return new LookupFieldValue(value);
  }

  createFilter(
    operator: ILookupFilterOperator,
    value: string[] | null,
  ): ILookupFilter {
    return { operator, value, path: this.id.value, type: 'lookup' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.lookup(this);
  }

  get valueSchema() {
    return z.string().array().nullable();
  }
}
