import * as React from 'react';
import { Badge } from 'reactstrap';

type ItemTagsProps = {
  tags?: string[];
};

export function ItemTags(props: ItemTagsProps) {
  const { tags } = props;

  if (!tags || !tags.length) {
    return null;
  }

  return (
    <React.Fragment>
      {tags.map((tag, tKey) => (
        <Badge color='secondary' className='item-tag ml-2' key={tKey}>
          {tag}
        </Badge>
      ))}
    </React.Fragment>
  );
}

export default ItemTags;
