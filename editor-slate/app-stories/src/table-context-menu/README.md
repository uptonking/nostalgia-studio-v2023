# slate-table with context-menu
- features
  - 支持合并单元格

- dev-to
  - 如何去掉event-emitter
  - 将选区变化的逻辑移出react


- model层结构
```JSON
{
"type": "table",
"children": [
    {
        "type": "tableRow",
        "children": [
            {
                "type": "tableCell",
                "children": [
                    {
                        "type": "paragraph",
                        "children": [
                            {
                                "text": "测试11 ",
                                "bold": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "type": "tableRow",
        "children": [
            {
                "type": "tableCell",
                "children": [
                    {
                        "type": "paragraph",
                        "children": [
                            {
                                "text": "测试21 "
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
