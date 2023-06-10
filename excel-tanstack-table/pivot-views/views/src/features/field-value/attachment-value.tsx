import React from 'react';

import { type IAttachmentItem } from '@datalking/pivot-core';
import { getExtension, isImage } from '@datalking/pivot-core';
import { type DefaultExtensionType } from '@datalking/pivot-ui';
import {
  Box,
  defaultStyles,
  FileIcon,
  Image,
  Tooltip,
} from '@datalking/pivot-ui';

interface IProps {
  attachment: IAttachmentItem;
}

export const AttachmentValue: React.FC<IProps> = ({ attachment }) => {
  const extension = getExtension(attachment.mimeType) as
    | DefaultExtensionType
    | false;
  if (!extension) return null;
  if (isImage(attachment)) {
    return (
      <Tooltip label={attachment.name} withinPortal color='blue'>
        <Image
          src={`/public/${attachment.token}_${attachment.name}`}
          alt={attachment.name}
        />
      </Tooltip>
    );
  }
  return (
    <Tooltip label={attachment.name} withinPortal color='blue'>
      <Box>
        <FileIcon
          extension={extension}
          {...(defaultStyles?.[extension] ?? {})}
        />
      </Box>
    </Tooltip>
  );
};
