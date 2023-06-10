import { type ICollaboratorFieldValue } from './collaborator-field.type';
import { FieldValueBase } from './field-value.base';
import { type IFieldValueVisitor } from './field-value.visitor';

export class CollaboratorFieldValue extends FieldValueBase<ICollaboratorFieldValue> {
  constructor(value: ICollaboratorFieldValue) {
    super(value === null ? { value } : value);
  }

  unpack(): string[] | null {
    return Array.isArray(this.props) ? this.props : null;
  }

  accept(visitor: IFieldValueVisitor): void {
    visitor.collaborator(this);
  }
}
