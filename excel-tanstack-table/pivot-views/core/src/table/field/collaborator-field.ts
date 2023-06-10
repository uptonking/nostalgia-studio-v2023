import { unzip } from 'lodash-es';
import { z } from 'zod';

import { type IRecordDisplayValues } from '../record/record.type';
import { CollaboratorFieldValue } from './collaborator-field-value';
import {
  type CollaboratorFieldType,
  type ICreateCollaboratorFieldInput,
  type ICreateCollaboratorFieldValue,
  type IUpdateCollaboratorFieldInput,
} from './collaborator-field.type';
import { BaseField } from './field.base';
import { type ICollaboratorField } from './field.type';
import { type IFieldVisitor } from './field.visitor';
import { type ICollaboratorFilter } from './filter/collaborator.filter';
import { type ICollaboratorFilterOperator } from './filter/operators';

export class CollaboratorField extends BaseField<ICollaboratorField> {
  type: CollaboratorFieldType = 'collaborator';

  get multiple() {
    return true;
  }

  /**
   * todo 支持 reference filter
   */
  override get filterable(): boolean {
    return false;
  }

  override get sortable(): boolean {
    return false;
  }

  static create(
    input: Omit<ICreateCollaboratorFieldInput, 'type'>,
  ): CollaboratorField {
    return new CollaboratorField({
      ...super.createBase(input),
    });
  }

  static unsafeCreate(input: ICreateCollaboratorFieldInput): CollaboratorField {
    return new CollaboratorField({
      ...super.unsafeCreateBase(input),
    });
  }

  public override update(input: IUpdateCollaboratorFieldInput) {
    return this.updateBase(input);
  }

  createValue(value: ICreateCollaboratorFieldValue): CollaboratorFieldValue {
    return new CollaboratorFieldValue(value);
  }

  createFilter(
    operator: ICollaboratorFilterOperator,
    value: null,
  ): ICollaboratorFilter {
    return { operator, value, path: this.id.value, type: 'collaborator' };
  }

  accept(visitor: IFieldVisitor): void {
    visitor.collaborator(this);
  }

  getDisplayValues(values?: IRecordDisplayValues): (string | null)[][] {
    return unzip([
      values?.[this.id.value]?.username ?? [],
      values?.[this.id.value]?.avatar ?? [],
    ]);
  }

  get valueSchema() {
    return this.required ? z.string().array() : z.string().array().nullable();
  }
}
