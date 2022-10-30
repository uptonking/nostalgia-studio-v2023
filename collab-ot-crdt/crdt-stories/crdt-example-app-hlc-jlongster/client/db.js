/** 对应数据库的messages表模型
 * @typedef {Object} MessageItem
 * @property {string} group_id
 * @property {string} dataset
 * @property {string} row
 * @property {string} column
 * @property {string} value
 * @property {string} timestamp  a hybrid logical clock timestamp
 */

/** 放在内存的历史op数据，每个客户端都保存了所有客户端的op记录，👀可能会内存溢出
 * - 完全复刻数据库messages表的数据，用来对业务模型数据_data进行crud
 * - 模拟分布式数据库，通过轮询同步
 * - 客户端op操作基本数据： some-client did something/op at sometime
 * @type {MessageItem[]}
 */
const _messages = [];

/**
 * @typedef {Object} TodoTypeMappingItem
 * @property {string} id
 * @property {string} targetId
 */
/**
 * @typedef {Object} TodoTypesItem
 * @property {string} id
 * @property {string} name
 * @property {string} color
 */
/**
 * @typedef {Object} TodoItem
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {number} order
 * @property {number} tombstone
 */

/** 放在内存的本地业务模型数据，本地主要数据源
 * - ui触发的crud并不直接修改这里的业务模型数据对象，而是通过op记录apply到本对象
 * - Each data store prop is comparable to a database table
 * - one might use something like IndexedDB or SQLite as the underlying storage mechanism
 * @type { {todos: TodoItem[], todoTypes: TodoTypesItem[], todoTypeMapping: TodoTypeMappingItem[]}}
 */
const _data = {
  todos: [],
  todoTypes: [],
  todoTypeMapping: [], // targetId 默认指向 id自身，用来删除待办类型时指向其他类型
};

/** ui上所有插入操作会触发执行这里，会根据操作数据生成op-msg，插入会创建并返回一个uuid，类似db插入
 * - ui上插入得到的直接数据是对象row，但这里将对象row转换成了多条消息，消息会按时间戳替换而不是合并
 * @param table 名称
 */
function insert(table, row) {
  // This is roughly comparable to assigning a primary key value to the row if
  // it were in a RDBMS.
  const id = uuidv4();
  // Because we're going to generate a "change" message for every field in the
  // object that is being "inserted" (i.e., there)
  const fields = Object.keys(row);

  sendMessages(
    fields.map((k) => {
      return {
        dataset: table,
        row: row.id || id,
        column: k,
        value: row[k],
        // Note that every message we create/send gets its own, globally-unique
        // timestamp. In effect, there is a 1-1 relationship between the time-
        // stamp and this specific message.
        timestamp: Timestamp.send(getClock()).toString(),
      };
    }),
  );

  return id;
}

/** 处理数据项的更新，删除使用墓碑标记
 * - 每个op对应的message都会带有hybrid logic clock时间戳
 * @param {string} table
 * @param {Object} params
 */
function update(table, params) {
  const fields = Object.keys(params).filter((k) => k !== 'id');

  sendMessages(
    fields.map((k) => {
      return {
        dataset: table,
        row: params.id,
        column: k,
        value: params[k],
        // Note that every message we create/send gets its own, globally-unique
        // timestamp. In effect, there is a 1-1 relationship between the time-
        // stamp and this specific message.
        timestamp: Timestamp.send(getClock()).toString(),
      };
    }),
  );
}

/** 处理数据项的删除，直接添加墓碑标记 */
function delete_(table, id) {
  sendMessages([
    {
      dataset: table,
      row: id,
      column: 'tombstone',
      value: 1,
      // Note that every message we create/send gets its own, globally-unique
      // timestamp. In effect, there is a 1-1 relationship between the time-
      // stamp and this specific message.
      timestamp: Timestamp.send(getClock()).toString(),
    },
  ]);
}

/** 给输入的todos数据添加type并排序 */
function _resolveTodos(todos) {
  todos = todos.map((todo) => ({
    ...todo,
    type: todo.type ? getTodoType(todo.type) : null,
  }));

  todos.sort((t1, t2) => {
    if (t1.order < t2.order) {
      return 1;
    } else if (t1.order > t2.order) {
      return -1;
    }
    return 0;
  });

  return todos;
}

/** 计算不带有墓碑标记的数据项，类似数据库表的scan */
function getTodos() {
  return _resolveTodos(_data.todos.filter((todo) => todo.tombstone !== 1));
}

/** 计算带有墓碑标记的数据项 */
function getDeletedTodos() {
  return _resolveTodos(_data.todos.filter((todo) => todo.tombstone === 1));
}

/** 计算排序后的所有数据项 */
function getAllTodos() {
  return _resolveTodos(_data.todos);
}

/**　注意todoType可能会改变指向，所以要计算出targetId */
function getTodoType(id) {
  // Go through the mapping table, which is a layer of indirection.
  // In SQL you could think of doing a LEFT JOIN onto this table and
  // using the id from the mapping table instead of the raw id
  const mapping = _data.todoTypeMapping.find((m) => m.id === id);
  const type =
    mapping && _data.todoTypes.find((type) => type.id === mapping.targetId);
  return type && type.tombstone !== 1 ? type : null;
}

/** _data.todos.length 数量 */
function getNumTodos() {
  return _data.todos.length;
}

function getTodoTypes() {
  return _data.todoTypes.filter((todoType) => todoType.tombstone !== 1);
}

function insertTodoType({ name, color }) {
  const id = insert('todoTypes', { name, color });
  // Create an entry in the mapping table that points it to itself
  insert('todoTypeMapping', { id, targetId: id });
}

/** 删除待办类型时，todoTypes表中数据未删除，而是添加墓碑标记 */
function deleteTodoType(id, targetId) {
  if (targetId) {
    // We need to update all the pointers the point to the type that
    // we are deleting and point it to the new type. This already
    // includes the type we are deleting (when created, it creates a
    // mapping to itself)
    for (const mapping of _data.todoTypeMapping) {
      if (mapping.targetId === id) {
        update('todoTypeMapping', { id: mapping.id, targetId });
      }
    }
  }

  delete_('todoTypes', id);
}

window['_data'] = _data;
window['_messages'] = _messages;
window['insert'] = insert;
window['update'] = update;
window['delete_'] = delete_;
window['getTodos'] = getTodos;
window['getDeletedTodos'] = getDeletedTodos;
window['getAllTodos'] = getAllTodos;
window['getTodoType'] = getTodoType;
window['getTodoTypes'] = getTodoTypes;
window['getNumTodos'] = getNumTodos;
window['insertTodoType'] = insertTodoType;
window['deleteTodoType'] = deleteTodoType;
