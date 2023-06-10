import { type IOptionColor, type SelectField } from '@datalking/pivot-core';

export type ICreateOptionFormProps = {
  field: SelectField;
  color: IOptionColor;
  onSuccess?: () => void;
};
