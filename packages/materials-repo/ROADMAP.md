# roadmap for materials-repo

# goals

- offlineable gitbook
# milestone
- ing
  - tiles-preview
  - ak editor examples

- [x] mini-app docs site
- [x] repo nested folder
# todo-fix
- handleToggleSidePanel 改为 setVisible(true/false)，语义更明确

- 重命名时，文件名不能包含 /，可包含.-_

- 复制、粘贴文件
- 移动文件
- 回收站可作为一个新的网盘实现

- 网盘文件中支持 import .tsx, jsx, ts, js, mdx, md

- 文件就地查看，文件在单独页面打开查看
  - 类似 google drive 可以在单独 webapp 查看

- 持久化mini-app的目录信息和元数据

- [x] 新建文件为空文件，此时打开编辑器会异常

## todo-mini-app 资料小程序

- markdown-viewer
  - 解析front-matter

- miniAppName rename & auto-update logo

- 跳过以.md/.mdx结尾却真实格式不同的文件，比如手动修改任意文件的后缀为.md

- ？ 左侧边栏的最后一个菜单项不是左对齐，而是居中对齐

- [x] 首页如何设置
  - 默认使用第1个文件的内容作为首页内容

- 引入类似网盘顶部路径面包屑到左侧文件目录
# fix
- new file/folder 在某些情况下会出现 id > key 冲突，不能稳定复现
# refactor
- icon fonts to svg
# later
- 处理单个大文件的查看和编辑

- publish as a cli app
# discuss
- rich-markdown-editor 会改变容器宽度

- materials-repo 支持 云端版 + ~~本地版~~
- materials-mini-app 支持 云端版 + ~~本地版~~

- 云端版依赖服务器
  - mdx 中相对路径需要转换计算
- 本地版依赖解析
  - mdx 中相对路径与 root 目录相关

- ~~右键菜单替换为顶部工具条~~
  - 右键菜单改为悬浮的点击菜单
