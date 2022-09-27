import { readFileSync, writeFile } from 'node:fs';
import { Mapping } from 'prosemirror-transform';
import { type Node } from 'prosemirror-model';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { Comment, Comments } from './comments';
import { populateDefaultInstances } from './defaultinstances';
import { schema } from './schema';

/** max steps/operations on server */
const MAX_STEP_HISTORY = 10000;

/** A collaborative editing document instance.
 * - ❓ 虽然能work，但控制台都是invalid version的异常信息
 */
class Instance {
  id: number;
  doc: Node;
  steps: any[];
  comments: any;
  version: number;
  lastActive: number;
  users: any;
  userCount: number;
  waiting: any[];
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
    // The version number of the document instance.
    this.version = 0;
    this.steps = [];
    this.lastActive = Date.now();
    this.users = Object.create(null);
    this.userCount = 0;
    this.waiting = [];

    this.collecting = null;
  }

  stop() {
    if (this.collecting != null) clearInterval(this.collecting);
  }

  addEvents(version, steps, comments, clientID) {
    this.checkVersion(version);
    if (this.version != version) return false;
    let doc = this.doc;
    const maps = [];
    for (let i = 0; i < steps.length; i++) {
      steps[i].clientID = clientID;
      const result = steps[i].apply(doc);
      doc = result.doc;
      maps.push(steps[i].getMap());
    }
    this.doc = doc;
    this.version += steps.length;
    this.steps = this.steps.concat(steps);
    if (this.steps.length > MAX_STEP_HISTORY)
      this.steps = this.steps.slice(this.steps.length - MAX_STEP_HISTORY);

    this.comments.mapThrough(new Mapping(maps));
    if (comments)
      for (let i = 0; i < comments.length; i++) {
        const event = comments[i];
        if (event.type == 'delete') this.comments.deleted(event.id);
        else this.comments.created(event);
      }

    this.sendUpdates();
    scheduleSave();
    return { version: this.version, commentVersion: this.comments.version };
  }

  sendUpdates() {
    while (this.waiting.length) this.waiting.pop().finish();
  }

  /** : (Number)
   * Check if a document version number relates to an existing
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

  /** : (Number, Number)
   * Get events between a given document version and
   * the current document version.
   */
  getEvents(version, commentVersion) {
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
    for (let i = 0; i < this.waiting.length; i++)
      this._registerUser(this.waiting[i].ip);
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
const saveEvery = 1e4;
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
  for (const id in instances)
    found.push({ id: id, users: instances[id].userCount });
  return found;
}
