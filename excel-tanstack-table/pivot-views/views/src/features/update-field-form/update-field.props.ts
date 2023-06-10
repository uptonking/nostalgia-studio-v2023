import { type Field } from '@datalking/pivot-core';

export type IUpdateFieldProps = {
  field: Field;
  onCancel?: () => void;
  onSuccess?: () => void;
};
