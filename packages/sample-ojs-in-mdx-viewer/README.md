# README.md: @datalking/sample-ojs-in-mdx-viewer

~~~js ojsLive=true
md `# Minimal cell test`

start = 88990001
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

`

```js
``
`js
console.log('Hello, World!');
```

````

# overview
- features
  - customizable react components built on top of headless and unstyled
# usage
- 目前ojs-in-mdx文件的处理流程设计
  - 将ojs全部书写在codeblock中，.mdx文件先使用webpack @mdx-js/loader全部当作mdx处理
  - mdx渲染code block时，通过MDXProvider设置自定义的code block
  - 自定义codeblock会在运行时，将ojs字符串转换成react组件显示
  - todo: 将ojs的处理计算提前到编译期，尝试自定义实现 `@mdx-js/loader`在加载时就转换，提高首屏渲染速度

- **NOTE**:
  - This package **currently** re-exports all existing components in react-spectrum.
# todo
