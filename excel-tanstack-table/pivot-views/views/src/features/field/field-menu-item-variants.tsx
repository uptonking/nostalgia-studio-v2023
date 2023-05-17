import React from 'react';

import type { Field } from '@datalking/pivot-core';

import { ReferenceFieldMenuItems } from './reference-field-menu-items';

interface IProps {
  field: Field;
}
export const FieldMenuItemVariant: React.FC<IProps> = ({ field }) => {
  switch (field.type) {
    case 'reference':
    case 'tree':
    case 'parent':
      return <ReferenceFieldMenuItems field={field} />;

    default:
      return null;
  }
};
