import type { ContextModalProps } from '@datalking/pivot-ui';

import { CreateViewForm } from './create-view-form';

export const CreateViewModal = ({ innerProps }: ContextModalProps) => {
  return <CreateViewForm {...innerProps} />;
};

export default CreateViewModal;
