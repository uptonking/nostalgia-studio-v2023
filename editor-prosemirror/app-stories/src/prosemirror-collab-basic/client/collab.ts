import crelt from 'crelt';
import {
  collab,
  getVersion,
  receiveTransaction,
  sendableSteps,
} from 'prosemirror-collab';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { history } from 'prosemirror-history';
import { MenuItem } from 'prosemirror-menu';
import { Schema, type Node } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { EditorState, type Transaction } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import {
  addAnnotation,
  annotationIcon,
  commentPlugin,
  commentUI,
} from './comment';
import { GET, POST } from './http';
import { Reporter } from './reporter';
export { Reporter } from './reporter';

const schema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});

// const reporter = new Reporter();

function badVersion(err) {
  return err.status === 400 && /invalid version/i.test(err);
}

class State {
  edit: EditorState;
  // comm: 'poll' | 'recover' | 'detached' | 'send';
  comm: string;
  constructor(edit: EditorState, comm: string) {
    this.edit = edit;
    this.comm = comm;
  }
}

/**  */
export class EditorConnection {
  report: Reporter;
  url: string;
  state: State;
  request: Promise<any>;
  backOff: number;
  view: EditorView;
  editorViewDOM: HTMLDivElement;
  usernamesDOM: HTMLDivElement;

  constructor(report: Reporter, url: string, editorViewDOM, usernamesDOM) {
    this.report = report;
    this.url = url;
    this.state = new State(null, 'start');
    this.request = null;
    this.backOff = 0;
    this.view = null;
    this.editorViewDOM = editorViewDOM;
    this.usernamesDOM = usernamesDOM;
    this.dispatch = this.dispatch.bind(this);

    this.start();
  }

  /** Load the document from the server and start up */
  start() {
    this.run(GET(this.url)).then(
      (data) => {
        data = JSON.parse(data);
        this.report.success();
        this.backOff = 0;
        this.dispatch({
          type: 'loaded',
          doc: schema.nodeFromJSON(data.doc),
          version: data.version,
          users: data.users,
          comments: { version: data.commentVersion, comments: data.comments },
        });
      },
      (err) => {
        this.report.failure(err);
      },
    );
  }

  /** All state changes go through this */
  dispatch(action: {
    type: string;
    transaction?: Transaction;
    doc?: Node;
    version?: number;
    users?: number;
    comments?: any;
    requestDone?: any;
    error?: any;
  }) {
    let newEditState: EditorState = null;
    console.log(';; dispatch', action.type, action);

    if (action.type === 'loaded') {
      this.usernamesDOM.textContent = userString(action.users);
      const editState = EditorState.create({
        doc: action.doc,
        plugins: exampleSetup({
          schema,
          history: false,
          menuContent: menu.fullMenu as MenuItem[][],
        }).concat([
          history(),
          collab({ version: action.version }),
          commentPlugin,
          commentUI((transaction) =>
            this.dispatch({ type: 'transaction', transaction }),
          ),
        ]),
        // @ts-expect-error ❓ 为什么传了个自定义参数
        comments: action.comments,
      });
      this.state = new State(editState, 'poll');
      this.poll();
    }

    if (action.type === 'restart') {
      this.state = new State(null, 'start');
      this.start();
    }
    if (action.type === 'poll') {
      this.state = new State(this.state.edit, 'poll');
      this.poll();
    }
    if (action.type === 'recover') {
      if (action.error.status && action.error.status < 500) {
        this.report.failure(action.error);
        this.state = new State(null, null);
      } else {
        this.state = new State(this.state.edit, 'recover');
        this.recover(action.error);
      }
    }
    if (action.type === 'transaction') {
      newEditState = this.state.edit.apply(action.transaction);
    }

    if (newEditState) {
      let sendable: {
        steps: {
          version: number;
          steps: readonly Step[];
          clientID: string | number;
          origins: readonly Transaction[];
        };
        comments: any;
      };
      if (newEditState.doc.content.size > 40000) {
        if (this.state.comm !== 'detached') {
          this.report.failure('Document too big. Detached.');
        }
        this.state = new State(newEditState, 'detached');
      } else if (
        (this.state.comm === 'poll' || action.requestDone) &&
        (sendable = this.sendable(newEditState))
      ) {
        this.closeRequest();
        this.state = new State(newEditState, 'send');
        this.send(newEditState, sendable);
      } else if (action.requestDone) {
        this.state = new State(newEditState, 'poll');
        this.poll();
      } else {
        this.state = new State(newEditState, this.state.comm);
      }
    }

    // Sync the editor with this.state.editState
    if (this.state.edit) {
      if (this.view) {
        this.view.updateState(this.state.edit);
      } else {
        this.setView(
          new EditorView(this.editorViewDOM, {
            state: this.state.edit,
            dispatchTransaction: (transaction) =>
              this.dispatch({ type: 'transaction', transaction }),
          }),
        );
      }
    } else {
      this.setView(null);
    }
  }

  /** Send a request for events that have happened since the version
   * of the document that the client knows about. This request waits
   * for a new version of the document to be created if the client
   * is already up-to-date.
   */
  poll() {
    const query =
      'version=' +
      getVersion(this.state.edit) +
      '&commentVersion=' +
      commentPlugin.getState(this.state.edit).version;

    this.run(GET(this.url + '/events?' + query)).then(
      (data) => {
        this.report.success();
        data = JSON.parse(data);
        this.backOff = 0;
        if (data.steps && (data.steps.length || data.comment.length)) {
          const tr = receiveTransaction(
            this.state.edit,
            data.steps.map((j) => Step.fromJSON(schema, j)),
            data.clientIDs,
          );
          tr.setMeta(commentPlugin, {
            type: 'receive',
            version: data.commentVersion,
            events: data.comment,
            sent: 0,
          });
          this.dispatch({
            type: 'transaction',
            transaction: tr,
            requestDone: true,
          });
        } else {
          this.poll();
        }
        this.usernamesDOM.textContent = userString(data.users);
      },
      (err) => {
        if (err.status === 410 || badVersion(err)) {
          // Too far behind. Revert to server state
          this.report.failure(err);
          this.dispatch({ type: 'restart' });
        } else if (err) {
          this.dispatch({ type: 'recover', error: err });
        }
      },
    );
  }

  sendable(editState: EditorState) {
    const steps = sendableSteps(editState);
    const comments = commentPlugin.getState(editState).unsentEvents();
    if (steps || comments.length) return { steps, comments };
  }

  /** 基于POST请求 Send the given steps to the server */
  send(editState: EditorState, { steps, comments }: any) {
    const json = JSON.stringify({
      version: getVersion(editState),
      steps: steps ? steps.steps.map((s) => s.toJSON()) : [],
      clientID: steps ? steps.clientID : 0,
      comment: comments || [],
    });
    console.log(';;postSteps ', json);

    this.run(POST(this.url + '/events', json, 'application/json')).then(
      (data) => {
        console.log(';;postSteps-ok ', data);

        this.report.success();
        this.backOff = 0;
        const tr = steps
          ? receiveTransaction(
              this.state.edit,
              steps.steps,
              repeat(steps.clientID, steps.steps.length),
            )
          : this.state.edit.tr;
        tr.setMeta(commentPlugin, {
          type: 'receive',
          version: JSON.parse(data).commentVersion,
          events: [],
          sent: comments.length,
        });
        this.dispatch({
          type: 'transaction',
          transaction: tr,
          requestDone: true,
        });
      },
      (err) => {
        console.log(';;postSteps-err, ', err);

        if (err.status === 409) {
          // The client's document conflicts with the server's version.
          // Poll for changes and then try again.
          this.backOff = 0;
          this.dispatch({ type: 'poll' });
        } else if (badVersion(err)) {
          this.report.failure(err);
          this.dispatch({ type: 'restart' });
        } else {
          this.dispatch({ type: 'recover', error: err });
        }
      },
    );
  }

  /** Try to recover from an error */
  recover(err) {
    const newBackOff = this.backOff ? Math.min(this.backOff * 2, 6e4) : 200;
    if (newBackOff > 1000 && this.backOff < 1000) this.report.delay(err);
    this.backOff = newBackOff;
    setTimeout(() => {
      if (this.state.comm == 'recover') this.dispatch({ type: 'poll' });
    }, this.backOff);
  }

  closeRequest() {
    if (this.request) {
      // @ts-expect-error 自定义方法
      this.request.abort();
      this.request = null;
    }
  }

  /** 只是简单记录request对象，this.request = request */
  run(request: Promise<any>) {
    return (this.request = request);
  }

  close() {
    this.closeRequest();
    this.setView(null);
  }

  setView(view: EditorView) {
    if (this.view) this.view.destroy();
    this.view = view;
    window['view'] = view;
  }
}

function repeat(val, n) {
  const result = [];
  for (let i = 0; i < n; i++) result.push(val);
  return result;
}

const annotationMenuItem = new MenuItem({
  title: 'Add an annotation',
  run: addAnnotation,
  select: (state) => addAnnotation(state),
  icon: annotationIcon,
});
const menu = buildMenuItems(schema);
menu.fullMenu[0].push(annotationMenuItem);

function userString(n) {
  return '(' + n + ' user' + (n === 1 ? '' : 's') + ')';
}

let docList;

function showDocList(node, list) {
  if (docList) docList.parentNode.removeChild(docList);

  const ul = (docList = document.body.appendChild(
    crelt('ul', { class: 'doclist' }),
  ));
  list.forEach((doc) => {
    ul.appendChild(
      crelt(
        'li',
        { 'data-name': doc.id },
        doc.id + ' ' + userString(doc.users),
      ),
    );
  });
  ul.appendChild(
    crelt(
      'li',
      {
        'data-new': 'true',
        style: 'border-top: 1px solid silver; margin-top: 2px',
      },
      'Create a new document',
    ),
  );

  const rect = node.getBoundingClientRect();
  ul.style.top = rect.bottom + 10 + pageYOffset - ul.offsetHeight + 'px';
  ul.style.left = rect.left - 5 + pageXOffset + 'px';

  ul.addEventListener('click', (e) => {
    const targetEl = e.target as HTMLElement;
    if (targetEl.nodeName == 'LI') {
      ul.parentNode.removeChild(ul);
      docList = null;
      if (targetEl.hasAttribute('data-name')) {
        location.hash =
          '#edit-' + encodeURIComponent(targetEl.getAttribute('data-name'));
      } else {
        newDocument();
      }
    }
  });
}

document.addEventListener('click', () => {
  if (docList) {
    docList.parentNode.removeChild(docList);
    docList = null;
  }
});

function newDocument() {
  const name = prompt('Name the new document', '');
  if (name) location.hash = '#edit-' + encodeURIComponent(name);
}

const infoEle = {
  name: document.querySelector('#docname'),
  users: document.querySelector('#users'),
  editor: document.querySelector('#editor'),
};

let connection: EditorConnection = null;

function connectFromHash() {
  // const isID = /^#edit-(.+)/.exec(location.hash);
  // console.log('connect from hash/hashIsID ', location.hash, Boolean(isID));
  // if (isID) {
  //   if (connection) connection.close();
  //   infoEle.name.textContent = decodeURIComponent(isID[1]);
  //   connection = new EditorConnection(
  //     reporter,
  //     '/collab-backend/docs/' + isID[1],
  //     infoEle.editor,
  //     infoEle.users,
  //   );
  //   window['connection'] = connection;
  //   connection.request.then(() => connection.view.focus());
  //   return true;
  // }
}

// addEventListener('hashchange', connectFromHash);

export function run() {
  // connectFromHash() || (location.hash = '#edit-Example');
}
// window.start = run;

// 未使用下面的功能，原示例用来切换文档示例或创建新文档
// document.querySelector('#changedoc')?.addEventListener('click', (e) => {
//   GET('/collab-backend/docs/').then(
//     (data: string) => showDocList(e.target, JSON.parse(data)),
//     (err) => reporter.failure(err),
//   );
// });
