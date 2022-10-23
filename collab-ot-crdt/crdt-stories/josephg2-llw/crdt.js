export const create = () => ({
  seq: 0,
  value: 0,
});

/** seq+1； value替换为newValue
 * - 此方法仅在客户端调用 */
export const set = (state, newValue) => ({
  seq: state.seq + 1,
  value: newValue,
});

/** 返回seq值大的；seq值相同时，返回value大的 */
export const merge = (a, b) => {
  if (a.seq > b.seq || (a.seq === b.seq && a.value > b.value)) return a;
  else return b;
};
