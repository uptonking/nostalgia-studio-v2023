import type { REPLEval } from 'node:repl';

/** 定义指令的名称、参数、执行方法 */
type CRUDCmd = {
  name: string;
  params: string[];
  execute(
    params: {
      table: any;
    },
    obj: any,
  ): void;
};



/** 仅内存的数据库存储，底层是kv
 * - 示例 { user: { keys: [ 'uid', 'uname' ], data: [ [Object], [Object] ] } }
 * - data属性包含该表所有数据 [ { uid: 'id1', uname: 'name1' }, { uid: 'id2', uname: 'name2' } ]
 */
const database = {};

const commands: CRUDCmd[] = [
  {
    name: 'SELECT',
    params: ['table'],
    execute(params: { table: any }, obj: any) {
      const { table } = params;
      if (table !== undefined) {
        return console.log(database[table].data);
      }
      console.log(database);
    },
  },
  {
    name: 'INSERT',
    params: ['table'],
    execute(params: { table: any }, obj: any[]) {
      // /仅插入，不支持覆盖
      const { table } = params;

      if (database[table] === undefined) {
        return console.error(`ERROR: Table ${table} not found`);
      }

      const insertObj = {};

      for (let i = 0; i < database[table].keys.length; i++) {
        const key = database[table].keys[i];

        if (obj[i] === undefined) {
          return console.error(`ERROR: ${key} can not be empty`);
        }

        insertObj[key] = obj[i];
      }

      database[table].data.push(insertObj);
    },
  },
  {
    name: 'CREATE',
    params: ['table'],
    execute(params: { table: any }, keys: string | any[] | undefined) {
      const { table } = params;

      if (keys === undefined || keys.length === 0) {
        return console.error("ERROR: table columns can't be empty");
      }

      database[table] = {
        keys: keys,
        data: [],
      };
    },
  },
];

export const eval1: REPLEval = (cmd, context, filename, callback) => {
  // 👀 输入的第一行是换行符
  cmd = cmd.replace('\n', '');

  console.log(';; start-eval1', cmd === 'log', cmd);

  if (cmd === 'log') {
    console.log(';; full db \n ',);
    console.dir(database, { depth: null })
    return;
  }

  const eachStatement = cmd.split(' ');
  const commands: Array<CRUDCmd | string> = [];

  for (let i = 0; i < eachStatement.length; i++) {
    commands[i] = parseCommand(eachStatement[i]);
  }

  console.log(';; stmt-cmd ', eachStatement, commands)

  executeCommand(commands);
};

/** 返回cmd文本对应的指令对象 */
function parseCommand(cmd: string) {
  const currCommand = commands.find(
    (cm) => cm.name.toLowerCase() === cmd.toLowerCase(),
  );

  if (currCommand === undefined) {
    return cmd;
  }

  return currCommand;
}

function executeCommand(statements: Array<CRUDCmd | string>) {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    if (typeof statement !== 'string' && statement.name !== undefined) {
      const params = {};

      // /取出预定义参数
      for (let j = 0; j < statement.params.length; j++) {
        i++;
        params[statement.params[j]] = statements[i];
      }

      const obj: any[] = [];

      // /取出剩余参数
      while (i < statements.length) {
        i++;
        const s = statements[i];
        if (s !== undefined) {
          obj.push(s);
        }
      }
      // @ts-expect-error 执行指令对象
      statement.execute(params, obj);
    }
  }
}

// import repl from 'repl';
// repl.start({
//   prompt: 'db11 $ ',
//   eval: eval1
// })
