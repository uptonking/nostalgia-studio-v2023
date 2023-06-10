import { type TableElement } from './customTypes';

export const tableData: TableElement = {
  type: 'table',
  children: [
    {
      type: 'tableRow',
      children: [
        {
          type: 'tableCell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: 'tableCell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: 'tableCell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
    {
      type: 'tableRow',
      children: [
        {
          type: 'tableCell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: 'tableCell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        },
        {
          type: 'tableCell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
  ],
};

export const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'text1 ',
      },
    ],
  },
  {
    type: 'table',
    children: [
      {
        type: 'tableRow',
        children: [
          {
            type: 'tableCell',
            header: 'visible',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '测试11 ', bold: true }],
              },
            ],
          },
          {
            type: 'tableCell',
            header: 'visible',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '测试12 represents tabular data — that is, information presented in a two-dimensional table comprised of rows and columns of cells containing data',
                  },
                ],
              },
            ],
          },
          {
            type: 'tableCell',
            header: 'visible',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '测试13 table 元素表示表格数据——即通过二维数据表表示的信息',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'tableRow',
        children: [
          {
            type: 'tableCell',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '测试21 ' }],
              },
            ],
          },
          {
            type: 'tableCell',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '测试22 represents tabular data — that is, information presented in a two-dimensional table comprised of rows and columns of cells containing data',
                  },
                ],
              },
            ],
          },
          {
            type: 'tableCell',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '测试23 table 元素表示表格数据——即通过二维数据表表示的信息',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  // {
  //   type: 'paragraph',
  //   children: [
  //     {
  //       text: 'text2 ',
  //     },
  //   ],
  // },
];

export const initialValue11 = [
  {
    type: 'table',
    children: [
      {
        type: 'tableRow',
        children: [
          {
            type: 'tableCell',
            rowSpan: 2,
            colSpan: 2,
            children: [
              {
                type: 'paragraph',
                children: [{ text: '测试1' }],
              },
            ],
          },
          {
            type: 'tableCell',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '测试2' }],
              },
            ],
          },
        ],
      },
      {
        type: 'tableRow',
        children: [
          {
            type: 'tableCell',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '测试3' }],
              },
            ],
          },
        ],
      },
      {
        type: 'tableRow',
        children: [
          {
            type: 'tableCell',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '测试4' }],
              },
            ],
          },
          {
            type: 'tableCell',
            colSpan: 2,
            children: [
              {
                type: 'paragraph',
                children: [{ text: '测试5' }],
              },
            ],
          },
        ],
      },
      {
        type: 'tableRow',
        children: [
          {
            type: 'tableCell',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '测试6' }],
              },
            ],
          },
          {
            type: 'tableCell',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '测试7' }],
              },
            ],
          },
          {
            type: 'tableCell',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '测试8' }],
              },
            ],
          },
        ],
      },
    ],
  },
];
