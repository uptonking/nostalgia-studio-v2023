import { nanoid } from 'nanoid';
import { Descendant, Element, Node } from 'slate';

import { ListTypes } from '../../src/plugins/list/types';

const listValue: Descendant[] = [
  {
    type: 'h1',
    children: [{ text: 'Today' }],
  },
  {
    id: '1',
    type: 'list_item',
    listType: ListTypes.Bulleted,
    depth: 0,
    children: [{ text: 'Morning' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.Bulleted,
    depth: 1,
    children: [{ text: 'Feed cat' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Rinse bowl' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Open cat food' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Mix dry and wet food in bowl' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Deliver on a silver platter to Pixel' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.Bulleted,
    depth: 0,
    children: [{ text: 'Afternoon' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.Bulleted,
    depth: 1,
    folded: true,
    foldedCount: 3,
    children: [{ text: 'Wash car' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Vacuum interior' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Wash exterior' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Wax exterior' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.Bulleted,
    depth: 1,
    children: [{ text: 'Grocery shopping' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Plan meals' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Clean out fridge' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Make list' }],
  },
  {
    type: 'list_item',
    listType: ListTypes.TodoList,
    depth: 2,
    checked: false,
    children: [{ text: 'Go to store' }],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
];

export function addIdToEditorData(validData: Descendant[]) {
  const makeId = () => nanoid(16);

  const assignIdRecursively = (node: Node) => {
    if (Element.isElement(node)) {
      node.id = node.id ?? makeId();

      node.children.forEach(assignIdRecursively);
    }
  };

  validData.forEach(assignIdRecursively);
}

const data: Descendant[] = [...listValue];
addIdToEditorData(data);

const simpleTableData: Descendant[] = [
  {
    type: 'p',
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
                type: 'p',
                children: [{ text: '测试11 ', bold: true }],
              },
            ],
          },
          {
            type: 'tableCell',
            header: 'visible',
            children: [
              {
                type: 'p',
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
                type: 'p',
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
                type: 'p',
                children: [{ text: '测试21 ' }],
              },
            ],
          },
          {
            type: 'tableCell',
            children: [
              {
                type: 'p',
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
                type: 'p',
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
  {
    type: 'p',
    children: [
      {
        text: 'text2 ',
      },
    ],
  },
];

addIdToEditorData(simpleTableData);

export { data as initialData, simpleTableData };
