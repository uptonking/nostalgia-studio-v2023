/** @unused */

import type { CellOrUndefined } from 'tinybase';
import type { Id } from 'tinybase/src/common-d';

import {
  arrayForEach,
  arrayMap,
  arrayPush,
  collSize,
  jsonString,
  mapEnsure,
  mapForEach,
  mapKeys,
  mapNew,
  mapSet,
} from './common';

type Changes = string;
/** tuple-4, [tableId, rowId, cellId, cellValue] */
type Change = [tableId: Id, rowId: Id, cellId: Id, cell: CellOrUndefined];
/** tree */
type ChangeNode = Map<string, ChangeNode | Change>;

/** 对应 IdMap1-3 */
const TREE_DEPTH = 3;

/** used in encode2 */
const getLookupFunctions = (
  tokenTables: [Map<string, number>, Map<string, number>] = [
    mapNew(),
    mapNew(),
  ],
): [
  (value: string | number | boolean | undefined, safeB64?: 1) => number,
  () => string[],
] => {
  const getTokenTyped = (value, tokenTableId) =>
    mapEnsure(tokenTables[tokenTableId], value, () =>
      collSize(tokenTables[tokenTableId]),
    );
  return [
    (value: string | number | boolean | undefined, isB64?: 1) =>
      getTokenTyped(isB64 ? value : jsonString(value ?? null), isB64 ?? 0),
    (): string[] =>
      arrayMap(tokenTables, (tokenTable) => mapKeys(tokenTable).join(',')),
  ];
};

const encode2 = (
  node: ChangeNode | undefined,
  encoding: (string | number)[] = [],
  lookupFunctions = getLookupFunctions(),
  depth = TREE_DEPTH,
): Changes => {
  mapForEach(node, (key, child) => {
    arrayPush(encoding, String.fromCharCode(depth + 33));
    arrayPush(encoding, lookupFunctions[0](key, 1));
    depth
      ? encode2(child as ChangeNode, encoding, lookupFunctions, depth - 1)
      : arrayPush(
          encoding,
          ...arrayMap(
            child as Change,
            (changePart) => `,${lookupFunctions[0](changePart)}`,
          ),
        );
  });
  return [...lookupFunctions[1](), encoding.join('')].join('\n');
};

/** used in decode2 */
const DEPTH_REGEX = arrayMap<string, RegExp>(
  ['!', '"', '#', '\\$'],
  (sep, s) => new RegExp(`${sep}(\\d+)${s == 0 ? ',' : ''}([^${sep}]+)`, 'g'),
);

const decode2 = (changes: Changes): ChangeNode => {
  if (changes == '') {
    return mapNew();
  }
  const [lookupTableString, lookupTableB64String, tree] = changes.split('\n');
  const lookupTable = arrayMap(lookupTableString.split(','), (value) =>
    JSON.parse(value),
  );
  const lookupTableB64 = lookupTableB64String.split(',');
  const parseNode = (
    string: string,
    depth = TREE_DEPTH,
    node: ChangeNode = mapNew(),
  ): ChangeNode => {
    arrayForEach(
      [...string.matchAll(DEPTH_REGEX[depth])],
      ([, key, childString]) =>
        mapSet(
          node,
          lookupTableB64[key],
          depth
            ? parseNode(childString, depth - 1)
            : arrayMap(
                childString.split(','),
                (changePart) => lookupTable[changePart] ?? undefined,
              ),
        ),
    );
    return node;
  };
  return parseNode(tree);
};
