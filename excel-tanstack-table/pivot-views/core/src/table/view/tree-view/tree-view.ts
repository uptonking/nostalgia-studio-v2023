import { type Option } from 'oxide.ts';
import { None, Some } from 'oxide.ts';

import { ValueObject } from '@datalking/pivot-entity';

import { type Field } from '../../field/index';
import { FieldId } from '../../field/index';
import { type ITreeViewSchema } from './tree-view.schema';
import { type ITreeView } from './tree-view.type';

export class TreeView extends ValueObject<ITreeView> {
  static from(input: ITreeViewSchema) {
    return new this({
      fieldId: input.fieldId ? FieldId.fromString(input.fieldId) : undefined,
    });
  }

  public get fieldId() {
    return this.props.fieldId;
  }

  public set fieldId(fieldId: FieldId | undefined) {
    this.props.fieldId = fieldId;
  }

  public removeField(field: Field): Option<TreeView> {
    if (this.fieldId?.equals(field.id)) {
      const treeView = new TreeView({ ...this, fieldId: undefined });
      return Some(treeView);
    }

    return None;
  }

  public toJSON() {
    return {
      fieldId: this.fieldId?.value,
    };
  }
}
