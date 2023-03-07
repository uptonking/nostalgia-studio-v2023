# logoot crdt
- a fork of https://github.com/mkdynamic/logoot
  - v201702

- Collaborative text editor using Logoot CRDT algorithm. 
  - Adds an informal versioning scheme based on state vectors to ensure casual ordering of operations is maintained.
# overview
- 从textarea得到编辑的op逻辑是类似的，得到的op也比较标准 insert/del

- 如何用op更新本地字符串要考虑字符串的数据结构设计
  - woot、logoot

- dev-to
  - 删除一个单词时，会生成长度数量的op，可合并
  - 中文输入法，一个client是候选词状态，其他client能看到英文字符
# usage

```shell
# client
npm run demo:logoot-list
# server
npm run demo:logoot-list-server
```

- open http://localhost:8999
