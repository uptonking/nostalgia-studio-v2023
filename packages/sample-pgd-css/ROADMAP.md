# Roadmap

# fix

- ## components

- pagination
  - 首尾两个页码矩形与其他页码图形不在一条线上

# new

# refactor

- use css container query to replace media query

- components中导入design-tokens的样式时，由于sass的import路径不支持路径，而tokens包含多个主题，不方便使用变量动态设置要导入的样式文件
  - 变通方案：不通过npm包，直接导入design-tokens文件夹的相对路径，这样也方便测试

- list项目左边的黑点的大小，由数值变为calc字符串

# later

# engineering

# hard

- 当文字特别多时，中文的行间空白视觉上比英文的行间空白小很多，如何只针对中文设置更大的line-height
