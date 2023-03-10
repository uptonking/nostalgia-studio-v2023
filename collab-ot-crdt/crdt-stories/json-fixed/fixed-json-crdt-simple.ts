/**
 * - forked from https://github.com/siliconjungle/simple-fixed-json-crdt
 * - https://twitter.com/JungleSilicon/status/1594303337369079809
 * - Using fixed-type json-crdts on the server is incredibly performant if you flatten the hierarchy.
 * - You don't actually need a JSON representation of the data, you just need to know which value is at each index.
 */

const shouldSet = ([seq, agentId], [seq2, agentId2]) =>
  seq2 > seq || (seq === seq2 && agentId > agentId2);

export class JsonStore {
  // const documents = {
  //   id: [5, 10, 'hello'],
  // }
  documents: { [k: string]: any } = {};
  // const versions = {
  //   id: [[0, '123abc'], [0, '123abc'], [0, '123abc']],
  // }
  versions = {};
  latestSeq = -1;

  applyOps(ops: any[]) {
    // ops: [
    //   {
    //     version: [seq, agentId],
    //     id: ‘test’,
    //     fields: [0, 1, 2],
    //     values: [5, 10, ‘hello’],
    //   },
    // ]

    const filteredOps: any[] = [];

    for (const op of ops) {
      const { version, id, fields, values } = op;
      this.versions[id] ??= [];
      this.documents[id] ??= [];

      for (let i = 0; i < fields.length; i++) {
        const currentVersion = this.versions[id][fields[i]];
        if (
          currentVersion === undefined ||
          shouldSet(currentVersion, version)
        ) {
          this.versions[id][fields[i]] = version;
          this.documents[id][fields[i]] = values[i];

          filteredOps.push(op);
        }
      }

      this.latestSeq = Math.max(this.latestSeq, version[0]);
    }

    return filteredOps;
  }

  getSnapshotOps() {
    const ops: any[] = [];

    // Per document, get all of the fields that belong to a version.
    // eslint-disable-next-line guard-for-in
    for (const id in this.documents) {
      const versions = {};

      for (let i = 0; i < this.versions[id].length; i++) {
        const version = this.versions[id][i];
        if (version !== undefined) {
          versions[version] ??= [];
          versions[version].push(i);
        }
      }

      // For each version, create an op.
      // eslint-disable-next-line guard-for-in
      for (const version in versions) {
        const fields = versions[version];
        const values = fields.map((field) => this.documents[id][field]);
        ops.push({ version, id, fields, values });
      }
    }

    return ops;
  }
}

function testOp() {
  const documents = {
    id: [5, 10, 'hello'],
  };
  const versions = {
    id: [
      [0, '123abc'],
      [0, '123abc'],
      [0, '123abc'],
    ],
  };
  const ops = [
    {
      version: [1, 'agentId11'],
      id: 'test',
      fields: [0, 1, 2],
      values: [5, 10, 'hello'],
    },
  ];

  const doc = new JsonStore();
  doc.applyOps(ops);
  console.log(';; doc ', doc.documents);
  console.log(doc.getSnapshotOps());
}
testOp();
