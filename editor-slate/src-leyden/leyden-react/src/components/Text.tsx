import { Text as LeydenText } from 'leyden';
import React, { type FC } from 'react';
import { type RenderLeafProps } from 'slate-react';

import { type TextRenderers } from '../utils/types';

export interface Text extends RenderLeafProps {
  textRenderers?: TextRenderers;
}

export const Text: FC<Text> = ({ children, text, textRenderers, ...props }) => {
  if (LeydenText.isText(text) && textRenderers) {
    const TextFC = textRenderers[text.type];
    return (
      <TextFC {...props} leaf={text} text={text}>
        {children}
      </TextFC>
    );
  }

  return <span {...props.attributes}>{children}</span>;
};
