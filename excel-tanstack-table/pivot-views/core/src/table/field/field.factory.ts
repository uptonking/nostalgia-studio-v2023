import { AttachmentField } from './attachment-field';
import { AutoIncrementField } from './auto-increment-field';
import { AverageField } from './average-field';
import { BoolField } from './bool-field';
import { CollaboratorField } from './collaborator-field';
import { ColorField } from './color-field';
import { CountField } from './count-field';
import { CreatedAtField } from './created-at-field';
import { CreatedByField } from './created-by-field';
import { DateField } from './date-field';
import { DateRangeField } from './date-range-field';
import { EmailField } from './email-field';
import { type Field, type ICreateFieldSchema } from './field.type';
import { IdField } from './id-field';
import { LookupField } from './lookup-field';
import { NumberField } from './number-field';
import { ParentField } from './parent-field';
import { RatingField } from './rating-field';
import { ReferenceField } from './reference-field';
import { SelectField } from './select-field';
import { StringField } from './string-field';
import { SumField } from './sum-field';
import { TreeField } from './tree-field';
import { UpdatedAtField } from './updated-at-field';
import { UpdatedByField } from './updated-by-field';

export class FieldFactory {
  static create(input: ICreateFieldSchema): Field | Field[] {
    switch (input.type) {
      case 'id': {
        return IdField.create(input);
      }
      case 'created-at': {
        return CreatedAtField.create(input);
      }
      case 'updated-at': {
        return UpdatedAtField.create(input);
      }
      case 'auto-increment': {
        return AutoIncrementField.create(input);
      }
      case 'string': {
        return StringField.create(input);
      }
      case 'email': {
        return EmailField.create(input);
      }
      case 'color': {
        return ColorField.create(input);
      }
      case 'number': {
        return NumberField.create(input);
      }
      case 'rating': {
        return RatingField.create(input);
      }
      case 'date': {
        return DateField.create(input);
      }
      case 'date-range': {
        return DateRangeField.create(input);
      }
      case 'select': {
        return SelectField.create(input);
      }
      case 'bool': {
        return BoolField.create(input);
      }
      case 'reference': {
        return ReferenceField.create(input);
      }
      case 'tree': {
        const treeField = TreeField.create(input);
        return [treeField, treeField.createParentField(input.parentFieldName)];
      }
      case 'parent': {
        return ParentField.create(input);
      }
      case 'count': {
        return CountField.create(input);
      }
      case 'sum': {
        return SumField.create(input);
      }
      case 'average': {
        return AverageField.create(input);
      }
      case 'lookup': {
        return LookupField.create(input);
      }
      case 'attachment': {
        return AttachmentField.create(input);
      }
      case 'collaborator': {
        return CollaboratorField.create(input);
      }
      case 'created-by': {
        return CreatedByField.create(input);
      }
      case 'updated-by': {
        return UpdatedByField.create(input);
      }
    }
  }

  static unsafeCreate(input: ICreateFieldSchema): Field {
    switch (input.type) {
      case 'id': {
        return IdField.unsafeCreate(input);
      }
      case 'created-at': {
        return CreatedAtField.unsafeCreate(input);
      }
      case 'updated-at': {
        return UpdatedAtField.unsafeCreate(input);
      }
      case 'auto-increment': {
        return AutoIncrementField.unsafeCreate(input);
      }
      case 'string': {
        return StringField.unsafeCreate(input);
      }
      case 'email': {
        return EmailField.unsafeCreate(input);
      }
      case 'color': {
        return ColorField.unsafeCreate(input);
      }
      case 'number': {
        return NumberField.unsafeCreate(input);
      }
      case 'rating': {
        return RatingField.unsafeCreate(input);
      }
      case 'date': {
        return DateField.unsafeCreate(input);
      }
      case 'date-range': {
        return DateRangeField.unsafeCreate(input);
      }
      case 'select': {
        return SelectField.unsafeCreate(input);
      }
      case 'bool': {
        return BoolField.unsafeCreate(input);
      }
      case 'reference': {
        return ReferenceField.unsafeCreate(input);
      }
      case 'tree': {
        return TreeField.unsafeCreate(input);
      }
      case 'parent': {
        return ParentField.unsafeCreate(input);
      }
      case 'count': {
        return CountField.unsafeCreate(input);
      }
      case 'sum': {
        return SumField.unsafeCreate(input);
      }
      case 'average': {
        return AverageField.unsafeCreate(input);
      }
      case 'lookup': {
        return LookupField.unsafeCreate(input);
      }
      case 'attachment': {
        return AttachmentField.unsafeCreate(input);
      }
      case 'collaborator': {
        return CollaboratorField.unsafeCreate(input);
      }
      case 'created-by': {
        return CreatedByField.unsafeCreate(input);
      }
      case 'updated-by': {
        return UpdatedByField.unsafeCreate(input);
      }
    }
  }
}
