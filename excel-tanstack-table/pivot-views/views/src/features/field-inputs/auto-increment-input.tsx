import { isNumber } from 'lodash-es';

import type { AutoIncrementField } from '@datalking/pivot-core';
import { getCurrentTableRecordsTotal } from '@datalking/pivot-store';
import type { NumberInputProps } from '@datalking/pivot-ui';
import { NumberInput } from '@datalking/pivot-ui';

import { useAppSelector } from '../../hooks';
import { FieldIcon } from './field-Icon';
import { FieldInputLabel } from './field-input-label';

interface IProps extends NumberInputProps {
  field: AutoIncrementField;
  defaultValue?: number;
}

export const AutoIncrementInput: React.FC<IProps> = ({
  field,
  defaultValue,
  ...props
}) => {
  let value = defaultValue;

  const total = useAppSelector(getCurrentTableRecordsTotal);

  if (!isNumber(value)) {
    value = total + 1;
  }
  return (
    <NumberInput
      {...props}
      label={<FieldInputLabel>{field.name.value}</FieldInputLabel>}
      readOnly
      disabled
      defaultValue={value}
      icon={<FieldIcon type={field.type} />}
    />
  );
};
