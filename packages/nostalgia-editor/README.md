# README.md: @pgd/components-react

- how to make an editor headless like tiptap

# ojs
~~~js ojsLive=true
md `# Minimal cell test`

start = 889999
~~~

~~~js ojsLive=true
md `# Minimal cell test`

start = 8899000
~~~

~~~js jsxLive=true

# Hello, world!

{31 + somethingInScope}

<Demo />
~~~

~~~js jsxLive=true

# Hello, world!

{2 + somethingInScope}

~~~

> the `react` implementation of the prospect garden design system

- **NOTE**:
  - This package **currently** focus on providing new components to `react-spectrum`.
  - eventually replace components in react-spectrum. 

~~~~js

```js
console.log('Hello, World!');
```

~~~~

# todo rich-markdown-editor
- rewrite
  - MarkdownSerializer/Parser to remark
  - class to hooks
  - nodeViews to ReactDOM.createPortal

- optimize
  - table
# overview
- features
  - customizable react components built on top of headless and unstyled
# usage
- **NOTE**:
  - This package **currently** re-exports all existing components in react-spectrum.
# todo

# changelog

- EditorView: provide nodeViews prop
