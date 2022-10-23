export const create = () => [
  {
    version: 'ROOT',
    value: 'UNSET',
  },
];

// const newId = () => (Date.now() * Math.random()).toString(36).slice(2);
const newId = () => (Date.now() * Math.random()).toString(36).slice(0, -4);

/** 创建并返回一个operation，和第2个例子的区别在于seq-num换成了version-str
 * - 只在客户端调用
 */
export const set = (state, newValue) => ({
  version: newId(),
  value: newValue,
  supercedes: state.map(({ version }) => version),
});

/** 返回去掉值为version的op.supercedes后的state*/
export const merge = (state, op) => {
  const result = state.filter(({ version }) =>
    op.supercedes ? !op.supercedes.includes(version) : true,
  );
  result.push({
    version: op.version,
    value: op.value,
  });

  return result;
};
