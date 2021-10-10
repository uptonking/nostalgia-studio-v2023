# materials-repo

> knowledge base powered by markdown/mdx files

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

- required
  - ./config/defaultSettings.ts: 配置资料库根目录 repoRootAbsolutePath (/path/to/repos)
  - 开发测试用的目录为/path/to/repos/admin/ak，会自动创建；在操作系统本地文件管理器上操作文件后ui也会更新

```sh
# start frontend dev server; port-11122
npm run start
# start backend api server; port-8999
npm run start2
```

# notes 注意事项

- 暂时文件名中不能含有空格/@，推荐使用-_.作为分隔词组
- 暂时只支持markdown，后续考虑支持mdx、jsx
- 暂时必须依赖服务端，纯前端构建部署无法正常使用

- 在同一目录下，文件名和文件夹名不能相同，类似ubuntu的设计

- 未实现
  - 登录时记住密码
