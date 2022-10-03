import { readFileSync, writeFile } from 'node:fs';
import { Mapping, Step } from 'prosemirror-transform';
import { type Node } from 'prosemirror-model';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { Comment, Comments } from './comments';
import { populateDefaultInstances } from './defaultinstances';
import { schema } from './schema';
import type { Waiting } from './server';

/** max steps/operations on server */
const MAX_STEP_HISTORY = 10000;

/** 处理协作op的中心服务，决定op顺序。A collaborative editing document instance.
 * - ❓ 虽然能work，但控制台都是invalid version的异常信息
 * - ❓️ 如何在接收一个op后，拒绝另一个op
 *    - 接收一个op后，检查version变化
 * - ❓️ 服务端为什么要保存最新文档实例 this.doc?
 *    - 用来让后连接的客户端立即获取最新文档作为初始文档
 */
export class Instance {
  id: number;
  /** 中心服务存放的当前最新文档实例 */
  doc: Node;
  /** 中心服务存放的当前文档版本。version number of the document instance. */
  version: number;
  /** op操作记录，本示例只放在内存而未持久化，有个默认最大的记录数量 */
  steps: (Step & { clientID: number })[];
  comments: any;
  lastActive: number;
  users: any;
  userCount: number;
  waitings: Waiting[];
  collecting: any;

  constructor(id, doc, comments) {
    this.id = id;
    this.doc =
      doc ||
      schema.node('doc', null, [
        schema.node('paragraph', null, [
          schema.text(
            'This is a collaborative test document. Start editing to make it more interesting!',
          ),
        ]),
      ]);
    this.comments = comments || new Comments();
    this.version = 0;
    this.steps = [];
    this.lastActive = Date.now();
    this.users = Object.create(null);
    this.userCount = 0;
    this.waitings = [];

    this.collecting = null;
  }

  stop() {
    if (this.collecting != null) {
      clearInterval(this.collecting);
    }
  }

  /** 接收编辑steps，然后apply到this.doc
   * - 对应文档示例中的 receiveSteps，客户端提交更改op后会执行这里
   */
  addEvents(
    version: number,
    steps: (Step & { clientID: number })[],
    comments,
    clientID: number,
  ) {
    this.checkVersion(version);
    if (this.version !== version) return false;
    let doc = this.doc;
    const maps = [];
    for (let i = 0; i < steps.length; i++) {
      steps[i].clientID = clientID;
      const result = steps[i].apply(doc);
      doc = result.doc;
      maps.push(steps[i].getMap());
    }
    this.doc = doc;
    this.steps = this.steps.concat(steps);
    this.version += steps.length;
    if (this.steps.length > MAX_STEP_HISTORY) {
      this.steps = this.steps.slice(this.steps.length - MAX_STEP_HISTORY);
    }

    this.comments.mapThrough(new Mapping(maps));
    if (comments) {
      for (let i = 0; i < comments.length; i++) {
        const event = comments[i];
        if (event.type == 'delete') this.comments.deleted(event.id);
        else this.comments.created(event);
      }
    }

    // 将steps发送到所有客户端
    this.sendUpdates();
    // 持久化最新文档内容到本地json文件
    scheduleSave();
    // 客户端拿到返回数据可根据version跳过自身修改
    return { version: this.version, commentVersion: this.comments.version };
  }

  /** 返回客户端的请求 */
  sendUpdates() {
    while (this.waitings.length) {
      this.waitings.pop().finish();
    }
  }

  /** : (Number) 检查版本号必须在 `[0, this.version]` 闭区间
   * - Check if a document version number relates to an existing
   * document version.
   */
  checkVersion(version: number) {
    if (version < 0 || version > this.version) {
      const err = new Error('Invalid version ' + version);
      // @ts-expect-error custom prop
      err.status = 400;
      throw err;
    }
  }

  /**
   * - Get events between a given document version and
   * the current document version.
   * - 对应文档中的stepsSince
   */
  getEvents(version: number, commentVersion: number) {
    this.checkVersion(version);
    const startIndex = this.steps.length - (this.version - version);
    if (startIndex < 0) return false;
    const commentStartIndex =
      this.comments.events.length - (this.comments.version - commentVersion);
    if (commentStartIndex < 0) return false;

    return {
      steps: this.steps.slice(startIndex),
      comment: this.comments.eventsAfter(commentStartIndex),
      users: this.userCount,
    };
  }

  collectUsers() {
    const oldUserCount = this.userCount;
    this.users = Object.create(null);
    this.userCount = 0;
    this.collecting = null;
    for (let i = 0; i < this.waitings.length; i++)
      this._registerUser(this.waitings[i].ip);
    if (this.userCount != oldUserCount) this.sendUpdates();
  }

  registerUser(ip) {
    if (!(ip in this.users)) {
      this._registerUser(ip);
      this.sendUpdates();
    }
  }

  _registerUser(ip) {
    if (!(ip in this.users)) {
      this.users[ip] = true;
      this.userCount++;
      if (this.collecting == null)
        this.collecting = setTimeout(() => this.collectUsers(), 5000);
    }
  }
}

/** 全局映射表， */
const instances = Object.create(null);
let instanceCount = 0;
const maxCount = 20;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const saveFilePath = __dirname + '/../demo-instances.json';
console.log(';; saveFilePath, ', saveFilePath);

// const saveFilePath = './src/prosemirror-collab-basic/demo-instances.json';
let json: { [x: string]: { comments: any[] } };

if (process.argv.indexOf('--fresh') === -1) {
  try {
    json = JSON.parse(readFileSync(saveFilePath, 'utf8'));
  } catch (e) {}
}

if (json) {
  // eslint-disable-next-line guard-for-in
  for (const prop in json)
    newInstance(
      prop,
      schema.nodeFromJSON(json[prop]['doc']),
      new Comments(json[prop].comments.map((c) => Comment.fromJSON(c))),
    );
} else {
  populateDefaultInstances(newInstance);
}

let saveTimeout = null;
/** 每个10s持久化一次文档实例 */
const saveEvery = 1e4;

/** 每个10s持久化一次文档实例到本地。json文件 */
function scheduleSave() {
  if (saveTimeout != null) return;
  saveTimeout = setTimeout(doSave, saveEvery);
}

function doSave() {
  saveTimeout = null;
  const out = {};
  // eslint-disable-next-line guard-for-in
  for (const prop in instances)
    out[prop] = {
      doc: instances[prop].doc.toJSON(),
      comments: instances[prop].comments.comments,
    };
  writeFile(saveFilePath, JSON.stringify(out), () => null);
}

export function getInstance(id, ip) {
  const inst = instances[id] || newInstance(id);
  if (ip) inst.registerUser(ip);
  inst.lastActive = Date.now();
  return inst;
}

function newInstance(id, doc = undefined, comments = undefined) {
  if (++instanceCount > maxCount) {
    let oldest = null;
    // eslint-disable-next-line guard-for-in
    for (const id in instances) {
      const inst = instances[id];
      if (!oldest || inst.lastActive < oldest.lastActive) oldest = inst;
    }
    instances[oldest.id].stop();
    delete instances[oldest.id];
    --instanceCount;
  }
  return (instances[id] = new Instance(id, doc, comments));
}

export function instanceInfo() {
  const found = [];
  for (const id in instances) {
    found.push({ id: id, users: instances[id].userCount });
  }
  return found;
}
