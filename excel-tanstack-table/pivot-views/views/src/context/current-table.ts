import React from 'react';

import type { Table } from '@datalking/pivot-core';

export const CurrentTableContext = React.createContext<Table | null>(null);
