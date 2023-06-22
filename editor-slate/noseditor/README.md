# noseditor

> A collaborative block-style editor built with slate

- ✨ features
  - customizable with your own plugins
  - block-style editor with draggable ux
  - collapsible headings and lists
  - offline editing by default
  - support markdown shortcuts
  - collaboration (wip)
# overview
- noseditor aims to match the excellent notion-style editing experience, and provide offline support.

- why built with slate
  - slate data model is easy to understand, and react is easy to start
  - slate editor is popular so it's easy to find reusable utilities and references.
  - noseditor's plugin system is heavily inspired by plate editor(another popular slate-based editor)
# usage

## live demo

```shell
// start editor demo
npm start
```

- open http://localhost:8999

## quickstart

```JS
// editor usage
```

# features
- elements
  - [x] heading
  - [x] ordered list
  - [x] unordered list
  - [x] checkbox/task list
  - [x] table with context-menu
  - [x] blockquote
  - [x] hr
  - [x] link
  - [ ] image
  - [ ] codeblock

- text-formats
  - [x] bold
  - [x] italic
  - [x] underline
  - [x] strike-through
  - [x] code
  - [ ] sub/sup
  - [ ] font-color
  - [ ] background-color
  - [ ] font-size
  - [ ] align

- collab
  - [ ] mention
  - [ ] comment
  - [ ] image: how to make image collab
  - [ ] version history
  - [x] slate-yjs with bugs
  - [x] redo
  - [x] undo

- edting
  - [ ] inline-toolbar
  - [ ] slash menu /
  - [ ] serializes
  - [ ] context-menu
  - [x] toolbar

- input
  - [ ] optimize copy/paste html
  - [x] Chinese input method ime
# roadmap
- large document is slow

- collaboration is buggy

- later
  - rewrite without react and use framework adapter
# thanks
- [slate](https://github.com/ianstormtaylor/slate)
  - data model and react view
- [plate](https://github.com/udecode/plate)
  - try to find the best pratice to build a editor with slate
- [yjs](https://github.com/yjs/yjs)
  - collaborative data types
- [dnd-kit](https://github.com/clauderic/dnd-kit)
  - a good example for building a draggable tree component
- [more dependencies](./package.json)
# license
- core modules are licensed under [MIT](https://spdx.org/licenses/MIT.html)
- some plugins/utils/packages are licensed under [AGPL-3.0](https://spdx.org/licenses/AGPL-3.0-or-later.html)
