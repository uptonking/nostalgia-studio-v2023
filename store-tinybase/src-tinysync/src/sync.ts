import type { Id } from 'tinybase/src/common-d';
import type { CellOrUndefined, Store } from 'tinybase/src/store-d';

import {
  arrayForEach,
  arrayPush,
  arrayReduce,
  collClear,
  collIsEmpty,
  IdMap2,
  IdMap3,
  ifNotUndefined,
  isObject,
  isUndefined,
  jsonString,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
  setOrDelCell,
} from './common';
import { getHlcFunctions, Hlc } from './hlc';

// /** [stringTable: string[], json: string]; */
export type Changes = string;
/** tuple-4, [tableId, rowId, cellId, cellValue] */
type Change = [tableId: Id, rowId: Id, cellId: Id, cell: CellOrUndefined];
/** tree */
type ChangeNode = Map<string, ChangeNode | Change>;

/** 对应 IdMap1-3 */
const TREE_DEPTH = 3;

/** update change tree，将16位的hlc拆分为 3-4-4-5 四部分
 * - 拆分时间是为了支持细粒度的快速比较时间
 * - `{ time1: { time2: {counter: {clientId:changeObj} } } }`
 */
const addLeaf = (node: ChangeNode, hlc: Hlc, change: Change) =>
  arrayReduce(
    [
      hlc.substring(0, 3),
      hlc.substring(3, 7),
      hlc.substring(7, 11),
      hlc.substring(11),
    ],
    (node, fragment, index) => {
      // console.log(';; hlc-part-len ', fragment.length, fragment)
      return mapEnsure(
        node,
        fragment,
        index < TREE_DEPTH ? mapNew : () => change,
      ) as ChangeNode;
    },
    node,
  );

/**
 * recursive diff largerNode and smallerNode
 * @param largerNode iterated from, changes from here
 * @param smallerNode for comparison
 * @param depth 控制递归终止条件
 * @param diffNode 待返回的diff树
 * @returns
 */
const getDiff = (
  largerNode: ChangeNode,
  smallerNode: ChangeNode,
  depth = TREE_DEPTH,
  diffNode: ChangeNode = mapNew(),
): ChangeNode | undefined => {
  mapForEach(largerNode, (key, largerChild) => {
    ifNotUndefined(
      mapGet(smallerNode, key) as ChangeNode,
      (smallerChild) =>
        depth
          ? mapSet(
            diffNode,
            key,
            getDiff(largerChild as ChangeNode, smallerChild, depth - 1),
          )
          : 0,
      () => mapSet(diffNode, key, largerChild),
    );
  });

  return collIsEmpty(diffNode) ? undefined : diffNode;
};

const getLeaves = (
  node: ChangeNode | undefined,
  leaves: [Hlc, Change][] = [],
  depth = TREE_DEPTH,
  path = '',
): [Hlc, Change][] => {
  mapForEach(node, (key, child) => {
    depth
      ? getLeaves(child as ChangeNode, leaves, depth - 1, path + key)
      : arrayPush(leaves, [path + key, child as Change]);
  });
  return leaves;
};

/** custom JSON.stringify: Map to string */
const encode = (changeNode: ChangeNode | undefined): Changes => {
  if (isUndefined(changeNode)) {
    return '';
  }

  console.log('\nCompressing...\n');
  console.dir(changeNode, { depth: null });
  console.log('\ninto...\n');
  // console.log(encode2(changeNode));
  // console.log(';; \n');
  console.log(jsonString(changeNode));
  console.log(';; \n');

  return jsonString(changeNode);
};

const decode = (changes: Changes): ChangeNode =>
  JSON.parse(changes === '' ? '{}' : changes, (key, value) => {
    if (isObject(value)) {
      const map = mapNew();
      Object.entries(value).forEach(([k, v]) => mapSet(map, k, v));
      return map;
    }
    return value;
  });

/** ✨ create a syncUtil to store */
export const createSync = (store: Store, uniqueStoreId: Id, offset = 0) => {
  let listening = 1;

  const [getHlc, seenHlc] = getHlcFunctions(uniqueStoreId, offset);

  /** changes data as flat map, { hlc-string: [table,row,cell,value] }
   * - only used to update `rootChangeNode` change tree
   */
  const undigestedChanges: Map<Hlc, Change> = mapNew();
  /** ⭐️ change tree of the sync-store, a 3-level tree */
  const rootChangeNode: ChangeNode = mapNew();
  /** extract hlc of all cells, { table: {row: {cell: hlc} } }
   * ? 作用不大，可删除 ？
   */
  const latestHlcDataByCell: IdMap3<Hlc> = mapNew();

  /** will be called for every cell change to close over `undigestedChanges`
   * and try to update latestHlcDataByCell
   */
  const handleChange = (
    hlc: Hlc,
    tableId: Id,
    rowId: Id,
    cellId: Id,
    cell: CellOrUndefined,
  ): 0 | 1 => {
    mapSet(undigestedChanges, hlc, [tableId, rowId, cellId, cell]);

    // 当前change的cellId是否存在hlc
    const latestHlcByCell = mapGet(
      mapGet(mapGet(latestHlcDataByCell, tableId), rowId),
      cellId,
    );

    if (isUndefined(latestHlcByCell) || hlc > latestHlcByCell) {
      // /若当前change的hlc不存在或时间最新，则更新 latestHlcDataByCell
      mapSet(
        mapEnsure(
          mapEnsure<Id, IdMap2<Hlc>>(latestHlcDataByCell, tableId, mapNew),
          rowId,
          mapNew,
        ),
        cellId,
        hlc,
      );
      return 1;
    }

    // latestHlcDataByCell not changed
    return 0;
  };

  /** 将未处理过的changes添加到 rootChangeNode */
  const digestChanges = () => {
    mapForEach(undigestedChanges, (hlc, change) =>
      addLeaf(rootChangeNode, hlc, change),
    );
    // console.log(';; change-tree ', uniqueStoreId);
    // console.dir(rootChangeNode, { depth: null });
    collClear(undigestedChanges);
  };

  /** 先更新store-rootChangeNode-tree，then get mini diff tree，then stringify */
  const getChanges = (except: Changes = ''): Changes => {
    digestChanges();
    const diffTree = getDiff(rootChangeNode, decode(except));
    return encode(diffTree);
  };

  /** diff minimal changes, then save to database */
  const setChanges = (changes: Changes) => {
    digestChanges();
    listening = 0;
    const diffTree = getDiff(decode(changes), rootChangeNode);

    store.transaction(() =>
      arrayForEach(
        getLeaves(diffTree),
        ([hlc, [tableId, rowId, cellId, cell]]) => {
          seenHlc(hlc);
          if (handleChange(hlc, tableId, rowId, cellId, cell)) {
            setOrDelCell(store, tableId, rowId, cellId, cell);
          }
        },
      ),
    );
    listening = 1;
  };

  const getUniqueStoreId = () => uniqueStoreId;
  const getStore = () => store;

  const sync = {
    getChanges,
    setChanges,
    getUniqueStoreId,
    getStore,
  };

  // add listener to every cell change
  store.addCellListener(
    null,
    null,
    null,
    (_store, tableId: Id, rowId: Id, cellId: Id, cell: CellOrUndefined) =>
      listening ? handleChange(getHlc(), tableId, rowId, cellId, cell) : 0,
  );

  return Object.freeze(sync);
};
