# linvodb

> open source js database designed for airtable-like pivot views

# overview
- this project is a fork of linvodb v20210507
  - for web & nodejs

- https://github.com/Ivshti/linvodb3 /MIT
  - LinvoDB is based on NeDB, the most significant core change is that it uses LevelUP as a back-end, meaning it doesn't have to keep the whole dataset in memory.
  - linvodb is forked from [nedb v20141221](https://github.com/Ivshti/linvodb3/commits/master?before=569a0ac0b773f4cfba09c4597aed8f05e53c6b0b+455&branch=master&qualified_name=refs%2Fheads%2Fmaster)
  - https://github.com/aerys/linvodb3
# usage

# bugs

- ❓ 代码中update操作然后remove，实际上update操作的cb比remove操作的cb后执行
# roadmap

## dev-to-list

- merge各个仓库的pr
# testing
- 迁移web版tests

## 待改进的测试

## tests-failed

# more
- deps backup

```
"levelup": "^5",
"encoding-down": "^5.0.4",
"leveldown": "^6",
"@types/encoding-down": "^5.0.0",
"@types/levelup": "^5.0.0",
"level-js": "^2.2.4",

```
