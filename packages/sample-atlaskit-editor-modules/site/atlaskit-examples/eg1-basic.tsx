import * as React from 'react';

import Editor from './../../atlaskit/editor-core/editor';

export function AKEg1Basic() {
  return (
    <div>
      <p>
        The most basic editor possible. Editor you get by rendering
        {'<Editor/>'} component with no props.
      </p>
      <Editor />
    </div>
  );
}

export default AKEg1Basic;
