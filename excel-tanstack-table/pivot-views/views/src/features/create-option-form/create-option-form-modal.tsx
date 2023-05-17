import React from 'react';

import type { ContextModalProps } from '@datalking/pivot-ui';

import { CreateOptionForm } from './create-option-form';
import type { ICreateOptionFormProps } from './create-option-form.props';

export const CreateOptionModal = ({
  innerProps,
}: ContextModalProps<ICreateOptionFormProps>) => (
  <>
    <CreateOptionForm {...innerProps} />
  </>
);

export default CreateOptionModal;
