# slate-table with context-menu
- features
  - 支持合并单元格
# dev-to
- 如何去掉event-emitter
  - 难点在需要在最外层容器触发内层的 keydown/mousedown

- 将选区变化的逻辑移出react
  - 选区逻辑本身就在slate，只是视图层需要显示单元格选区，似乎无法将单元格选区加入editor.selection
# dev-xp
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
