import type {
  ICreateSelectFieldSchema,
  ICreateStringFieldInput,
} from '../field/index';
import { FieldFactory, SelectField, StringField } from '../field/index';
import {
  WithNewField,
  WithTableEmoji,
  WithTableId,
  WithTableName,
} from '../specifications/index';
import type { TableCompositeSpecificaiton } from '../specifications/interface';
import { TableFactory } from '../table.factory';
import type { ICreateViewInput_internal } from '../view/index';
import { View, Views } from '../view/index';
import { WithTableViews } from '../view/specifications/views.specification';

export const createTestTable = (...specs: TableCompositeSpecificaiton[]) => {
  let spec: TableCompositeSpecificaiton = WithTableId.fromExistingString(
    'tableId',
  )
    .unwrap()
    .and(WithTableName.fromString('name'))
    .and(new WithTableViews(new Views([])))
    .and(WithTableEmoji.fromString())
    .and(
      new WithNewField(
        FieldFactory.create({ type: 'string', name: 'field1' }) as StringField,
      ),
    );

  for (const s of specs) {
    spec = spec.and(s);
  }

  return TableFactory.create(spec).unwrap();
};

export const createTestView = (
  input: Partial<ICreateViewInput_internal> = {},
): View => {
  return View.create({
    id: 'viw1',
    name: 'view',
    ...input,
  });
};

export const createTestStringField = (
  input: Partial<Omit<ICreateStringFieldInput, 'type'>> = {},
): StringField => {
  return StringField.create({
    id: 'fld1',
    name: 'select',
    ...input,
  });
};

export const createTestSelectField = (
  input: Partial<Omit<ICreateSelectFieldSchema, 'type'>> = {},
): SelectField => {
  return SelectField.create({
    id: 'fld1',
    name: 'select',
    options: [
      { key: 'opt1', name: 'opt1' },
      { key: 'opt2', name: 'opt2' },
    ],
    ...input,
  });
};
