# react-spectrum-realworld-example-app-csr

> blog-style realworld example web app built with react-spectrum, react-hooks & faker.js.

- **NOTE**: no backend database/server needed. all apis are mocked in the frontend.

# overview

# usage

# todo

- 书写文章时，支持多个tag

- 分页的(文章)列表跳转使用router，实现前进后退

# notes

- app-components-layout
  - home page
    - responsive container for layout
    - badge for Tags
    - tabs for TabList
    - pagination for ArticleList: 只有1页时不显示分页组件

- spectrum limitations
  - width dimension values: no percent

- 要设计好首页无需登录或验证就可以查看的内容
  - 当日热点、标签文章、文章作者主页

# discuss

- 竖向滚动条先隐藏再显示会触发reflow/layout，如在请求响应慢时
  - 典型的场景是，从一个标签切换到另一个标签时状态为loading，内容暂时为空，竖向滚动条会隐藏，请求完成填充较多内容后会再次出现滚动条
