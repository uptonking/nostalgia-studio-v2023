ProseMirror's view module displays a given [editor
state](#state. EditorState) in the DOM, and handles user events.

Make sure you load `style/prosemirror.css` as a stylesheet when using
this module.

- forked prosemirror-view v1.28.0 20220909
  - 62ba4bfac9400d9902896533f8d2065272caa4fa
  - https://github.com/ProseMirror/prosemirror-view/tree/62ba4bfac9400d9902896533f8d2065272caa4fa

- prosemirror通过维护自己的文档数据树，并把所有对dom的操作都转换成对state的操作，抹平了不同浏览器带来的数据结构不一致的问题，
  - 并提升了prosemirror本身的视图层的可移植性，理论上可以通过自身实现视图层在任何平台上都实现编辑器。
  - 维护自身文档数据结构也可以说是一个比较主流解决方案，因为它让内容可控，状态可以变，并且为实现协同编辑提供了结构上的支撑。

- ProseMirror是根据视图描述来管理视图的DOM，视图描述可以看成是虚拟DOM。
  - ProseMirror会捕捉处于编辑区域的事件，然后更新相应的文档状态state，然后再更新相应的视图描述viewDesc，以此来匹配更新后的文档状态。


@EditorView

### Props

@EditorProps

@NodeViewConstructor

@MarkViewConstructor

@DirectEditorProps

@NodeView

@DOMEventMap

### Decorations

Decorations make it possible to influence the way the document is
drawn, without actually changing the document.

@Decoration

@DecorationAttrs

@DecorationSet

@DecorationSource
