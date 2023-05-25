import React from 'react';

import type { Table } from '@datalking/pivot-core';

/**
 * todo refactor out of react
 */
export const CurrentTableContext = React.createContext<Table | null>(null);
