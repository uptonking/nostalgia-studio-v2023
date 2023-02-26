# slate-table with toolbar
- features
  - 支持合并单元格
  - 支持调整行高度

- issues
  - 选区更新有问题

- model层结构

```JSON
{
"type": "table",
"children": [
    {
        "type": "table-row",
        "key": "row_3",
        "children": [
            {
                "type": "table-cell",
                "key": "cell_9",
                "width": 150,
                "children": [
                    {
                        "type": "table-content",
                        "children": [
                            {
                                "type": "paragraph",
                                "children": [
                                    {
                                        "text": "a9"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "type": "table-cell",
                "key": "cell_11",
                "width": 150,
                "children": [
                    {
                        "type": "table-content",
                        "children": [
                            {
                                "type": "paragraph",
                                "children": [
                                    {
                                        "text": "a11"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
]
}

```
