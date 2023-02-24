import { TableElement } from './customTypes';

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
