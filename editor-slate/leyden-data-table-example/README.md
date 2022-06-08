# sample-leyden-data-table

# overview

# usage

```jsx

import { Table, Transforms, withLeyden } from 'leyden';
import { Editable, Leyden, withReact } from 'leyden-react';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';

<Leyden editor={editor} value={descendants} onChange={setDescendants}>
  <Editable
    cellRenderers={cellRenderers}
    headerRenderers={headerRenderers}
    elementRenderers={elementRenderers}
    textRenderers={textRenderers}
    tableOptions={{
      stickyColumnHeaders: true,
    }}
  />
</Leyden>

```
