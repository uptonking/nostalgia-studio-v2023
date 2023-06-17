import { css } from '@linaria/core';

/** base table css */
export const tableBaseCss = css`
  * {
    box-sizing: border-box;
  }

  table,
  .idTable {
    border: 1px solid black;
    /** applies only when border-collapse is separate */
    border-spacing: 0;
  }

  tr:last-child td {
    border-bottom-width: 0px;
  }

  th,
  td,
  .thTd {
    padding: 0.5rem;
    margin: 0;
    border-right: 1px solid black;
    border-bottom: 1px solid black;

    :last-child {
      border-right: 0;
    }
  }

  tfoot {
    tr:first-of-type {
      td,
      th {
        border-top: 1px solid black;
        border-bottom-width: 0px;
      }
    }
  }
`;

export const sortedHeaderCss = css`
  cursor: pointer;
  user-select: none;
`;
