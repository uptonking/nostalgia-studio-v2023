/**
 * - forked from https://github.com/siliconjungle/fixed-json-crdt
 * - https://twitter.com/JungleSilicon/status/1587070718688514048
 */

/** versionNumber + siteId, like a lamport clock */
type VersionSeq = [number, string];
/** update operation for json */
type OpType = {
  key: string;
  value: any;
  version: VersionSeq;
  pathIndex: number;
  parentVersion?: VersionSeq;
  parentPathIndex?: number;
};

/**
 * test object
 */
const mockJsonData = {
  '123abc': {
    position: {
      x: 10,
      y: 10,
    },
    size: {
      width: 100,
      height: 100,
    },
  },
};

/**
 * json properties at all levels
 */
const paths = [
  [],
  ['position'],
  ['size'],
  ['position', 'x'],
  ['position', 'y'],
  ['size', 'width'],
  ['size', 'height'],
];

/** { path: pathIndex }
 * - 第一层的
 */
const indices: Record<string, number> = {
  '/': 0,
  '/position': 1,
  '/size': 2,
  '/position.x': 3,
  '/position.y': 4,
  '/size.width': 5,
  '/size.height': 6,
};

/** for every pathIndex, its children's pathIndex */
const childIndices = [[1, 2, 3, 4, 5, 6], [3, 4], [5, 6], [], [], [], []];

/** for every pathIndex, its parent's pathIndex */
const parentIndices = [[], [0], [0], [1, 0], [1, 0], [2, 0], [2, 0]];

/** like 3-tuple, key, pathIndex, version */
const crdts: Record<string, Record<number, VersionSeq>> = {};
/** 👇🏻 syncable json store */
const documents: Record<string, any> = {};
globalThis['crdts'] = crdts;
globalThis['docs'] = documents;

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const shouldReplace = ([seq, agentId], [seq2, agentId2]) =>
  seq2 > seq || (seq2 === seq && agentId2 > agentId);

const getParentPathIndex = (
  crdt: Record<number, VersionSeq>,
  pathIndex: number,
) => {
  const currentIndices = parentIndices[pathIndex];
  for (let i = 0; i < currentIndices.length; i++) {
    const parentPathIndex = currentIndices[i];
    const version = crdt[currentIndices[i]];
    if (version !== undefined) {
      return parentPathIndex;
    }
  }

  return -1;
};

const getIndicesBetween = (parentPathIndex: number, pathIndex: number) => {
  const indices: any[] = [];
  const currentIndices = parentIndices[pathIndex];

  for (let i = 0; i < currentIndices.length; i++) {
    if (currentIndices[i] === parentPathIndex) {
      return indices;
    }
    indices.push(i);
  }
  return indices;
};

const parentVersionMatches = (crdt, parentPathIndex, parentVersion) => {
  const field = crdt[parentPathIndex];

  return (
    field !== undefined &&
    field[0] === parentVersion[0] &&
    field[1] === parentVersion[1]
  );
};

const setValueAtPath = (obj, path, value) => {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
};

const removeChildVersions = (crdt, pathIndex) => {
  const indices = childIndices[pathIndex];
  for (let i = 0; i < childIndices.length; i++) {
    const childIndex = indices[i];
    delete crdt[childIndex];
  }
};

/**
 * all update to syncable store must use this applyOp
 * @param op
 * @returns
 */
const applyOp = (op: OpType) => {
  const { key, parentVersion, parentPathIndex, version, pathIndex, value } = op;

  const crdt = crdts[key];

  if (!crdt) {
    // /for new key
    if (pathIndex !== 0) {
      return false;
    }

    if (parentVersion !== undefined || parentPathIndex !== undefined) {
      return false;
    }

    crdts[key] = {
      [pathIndex]: deepCopy(version),
    };
    documents[key] = deepCopy(value);

    return true;
  } else {
    // /for existing key
    const document = documents[key];

    if (
      crdt[pathIndex] === undefined ||
      shouldReplace(crdt[pathIndex], version)
    ) {
      if (pathIndex === 0) {
        // /for root key
        crdts[key] = {
          [pathIndex]: deepCopy(version),
        };
        documents[key] = deepCopy(value);
        return true;
      }

      // need to check all parent indices between parentPathIndex and pathIndex
      if (!parentVersionMatches(crdt, parentPathIndex, parentVersion)) {
        return false;
      }

      const indicesBetween = getIndicesBetween(parentPathIndex!, pathIndex);
      for (let i = 0; i < indicesBetween.length; i++) {
        const index = indicesBetween[i];
        if (crdt[index] !== undefined) {
          return false;
        }
      }

      crdts[key][pathIndex] = deepCopy(version);
      removeChildVersions(crdt, pathIndex);
      // update path-key value
      setValueAtPath(document, paths[pathIndex], deepCopy(value));
      return true;
    }

    return false;
  }
};

/**
 * create an operation for json
 * @param key the property key to update
 * @param path
 * @param version
 * @param value
 * @returns
 */
const createOp = (
  key: string,
  path: string,
  version: [number, string],
  value: any,
): OpType => {
  const pathIndex = indices[path];

  if (path === '/') {
    return {
      key,
      value,
      version,
      pathIndex,
    };
  }

  const parentPathIndex = getParentPathIndex(crdts[key], pathIndex);

  if (parentPathIndex === -1) {
    throw new Error('Invalid operation');
  }

  const parentVersion = crdts[key][parentPathIndex];

  return {
    key,
    value,
    version,
    pathIndex,
    parentVersion,
    parentPathIndex,
  };
};

const op = createOp('123abc', '/', [0, 'james'], {
  position: { x: 0, y: 0 },
  size: { width: 100, height: 100 },
});

applyOp(op);

console.log('_OP_', op);
console.log('_CRDTS_', crdts);
console.log('_DOCUMENTS_', documents);

const op2 = createOp('123abc', '/position', [1, 'james'], { x: 10, y: 10 });

applyOp(op2);

console.log('_OP2_', op2);
console.log('_CRDTS_', crdts);
console.log('_DOCUMENTS_', documents);

const op3 = createOp('123abc', '/position.x', [2, 'james'], 50);
applyOp(op3);

// console.log('_OP3_', op3);
// console.log('_CRDTS_', crdts);
// console.log('_DOCUMENTS_', documents);

const op4 = createOp('123abc', '/size', [3, 'james'], {
  width: 200,
  height: 50,
});
applyOp(op4);

// console.log('_OP4_', op4);
// console.log('_CRDTS_', crdts);
// console.log('_DOCUMENTS_', documents);

// here's an example showing that the version information can shrink when you update elements closer to the root.
const op5 = createOp('123abc', '/', [4, 'james'], {
  position: { x: 75, y: 12 },
  size: { width: 326, height: 263 },
});
applyOp(op5);

// console.log('_OP5_', op5);
// console.log('_CRDTS_', crdts);
// console.log('_DOCUMENTS_', documents);

export const getPrimitiveType = (value) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';

  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'object';
    default:
      throw new Error(`Unsupported type: ${typeof value}`);
  }
};

export const getPaths = (type, paths: any[] = [], path: any[] = []) => {
  const currentPrimitive = getPrimitiveType(type);

  if (currentPrimitive === 'string') {
    paths.push(deepCopy(path));
    return paths;
  }

  if (currentPrimitive === 'object') {
    paths.push(deepCopy(path));

    // eslint-disable-next-line guard-for-in
    for (const key in type) {
      const newPath = deepCopy(path);
      newPath.push(key);
      getPaths(type[key], paths, newPath);
    }

    return paths;
  }

  throw new Error(`Unsupported type def: ${currentPrimitive}`);
};

export const getIndices = (paths) => {
  const indices = {};

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const pathString = `/${path.join('.')}`;
    indices[pathString] = i;
  }

  return indices;
};

export const getParentIndices = (indices, paths) => {
  const parentIndices: any[] = [];

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const parentPathIndices: any[] = [];
    for (let j = path.length - 1; j > -1; j--) {
      const parentPath = path.slice(0, j);
      const parentPathString = `/${parentPath.join('.')}`;
      const parentPathIndex = indices[parentPathString];
      parentPathIndices.push(parentPathIndex);
    }
    parentIndices.push(parentPathIndices);
  }

  return parentIndices;
};

export const getNestedChildIndices = (paths, parentIndices) => {
  const childIndices: any[] = [];

  for (let i = 0; i < paths.length; i++) {
    childIndices.push([]);
  }

  for (let i = 0; i < parentIndices.length; i++) {
    const parentIndex = parentIndices[i];
    for (let j = 0; j < parentIndex.length; j++) {
      const parent = parentIndex[j];
      childIndices[parent].push(i);
    }
  }

  return childIndices;
};

export const createTypeMetadata = (type) => {
  const paths = getPaths(type);
  const indices = getIndices(paths);
  const parentIndices = getParentIndices(indices, paths);
  const childIndices = getNestedChildIndices(paths, parentIndices);

  return {
    paths,
    indices,
    parentIndices,
    childIndices,
  };
};

const shape = {
  position: {
    x: 'number',
    y: 'number',
  },
  size: {
    width: 'number',
    height: 'number',
  },
};

const player = {
  position: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
  rotation: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
};

// console.log('_SHAPE_META_', createTypeMetadata(shape));
// console.log('_PLAYER_META_', createTypeMetadata(player));
