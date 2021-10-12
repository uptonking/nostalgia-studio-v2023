# materials-repo

> knowledge base powered by markdown/mdx files.   
> 上传markdown文件后，能以网盘的形式管理，支持打开一个文件夹为资料小程序，打开后会显示一个文档网站

# overview
- materials-repo is designed to manage markdown files as knowledge base

- features
  - no vendor lock-in
    - all files under your control in plain text format
    - all contents exportable
  - familiar and intuitive interface like cloud drive or file manager
  - open any folder as a documentation site/mini-app like github pages
  - [WIP] convenient reading and navigation experience
    - [ ] mobile friendly
    - [x] auto-generated table of contents
    - [ ] configurable reading themes/fonts
  - [WIP] powerful rich text editor powered by prosemirror
    - [x] collapsible headings
    - [ ] wikilink/backlink/bidirectional links
    - [ ] customizable/configurable markdown syntax rules
  - more features coming...
    - collaborative editing
    - offlineable
    - page templates
    - integrations with popular services/apps
    - flexible search xp
    - version management
# usage
- requirements
  - 配置资料库根目录：./config/defaultSettings.ts文件的 `repoRootAbsolutePath` (/path/to/repos)
    - 开发测试用的目录为`/path/to/repos/admin/ak`，会自动创建
  - 因为需要服务端代码的支持，可能需要多次调试；
  - 这里没有提供在线demo，但本地应该能运行
  - 服务端代码依赖linux shell，不支持windows

```sh
# start frontend dev server; port-11122
npm run start
# start backend api server; port-8999
npm run start2
```

- 使用说明
  - 核心三大功能，网盘操作、打开文件夹资料小程序、文档网站，只初步实现了功能，存在很多bug，其他功能正在开发
  - 暂时只支持打开查看markdown和普通文本文件，其他文件无法打开
  - markdown文件的内容没有保存到数据库，就保存在配置的资料库根目录，在操作系统本地文件管理器上操作根目录下文件后ui也会更新
  - 不依赖服务器的本地版后期会设计
# screenshots
- 类似网盘的文件管理器

<img src='https://github.com/datalking/nostalgia-studio-lab/blob/main/packages/materials-repo/doc/img/mtl-file-manager.png' width = '800'>

- 类似github pages的方式打开一个文件夹为资料小程序，打开后就是文档网站

<img src='https://github.com/datalking/nostalgia-studio-lab/blob/main/packages/materials-repo/doc/img/mtl-open-materials-mini-app.png' width = '800'>

- 类似docusaurus的文档网站，支持标题toc高亮当前小标题

<img src='https://github.com/datalking/nostalgia-studio-lab/blob/main/packages/materials-repo/doc/img/mtl-docs-viewer.png' width = '800'>

# notes 注意事项
- 暂时文件名中不能含有空格/@?&=，推荐使用-_. 作为分隔词组
- 暂时只支持markdown，后续考虑支持mdx、jsx
- 暂时必须依赖服务端，纯前端构建部署无法正常使用

- 在同一目录下，文件名和文件夹名不能相同，类似ubuntu的设计

- 未实现
  - 登录时记住密码
