import { applyDevTools } from 'prosemirror-dev-toolkit';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { DOMParser, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import {
  EditorState,
  Plugin,
  type Transaction,
  type Command,
} from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';
import {
  Mapping,
  type Step,
  type StepMap,
  type Transform,
} from 'prosemirror-transform';

import styled from '@emotion/styled';

import { StyledContainer } from '../editor-examples.styles';

/** 一次commit的数据结构，可包含多个编辑器操作 */
class Commit {
  message: string;
  time: Date;
  steps: Step[];
  maps: StepMap[];
  hidden: boolean;

  constructor(
    message: string,
    time: Date,
    steps: Step[],
    maps: StepMap[],
    hidden = false,
  ) {
    this.message = message;
    this.time = time;
    this.steps = steps;
    this.maps = maps;
    this.hidden = hidden;
  }
}

/** a sequence of document ranges, along with the commit that inserted them
 * - 1个commit可以对应多个span
 * - 1个span只对应一个commit
 */
class Span {
  from: number;
  to: number;
  commit: number;

  constructor(from: number, to: number, commit: number) {
    this.from = from;
    this.to = to;
    this.commit = commit;
  }
}

/** 用在插件中 track the commit history
 * - 每次插件状态更新时都会执行 applyTransform + applyCommit
 */
class TrackState {
  /** 记录每个span对应的commitId，用来实现高亮commit范围
   * - The blame map is a data structure that lists a sequence of
   * document ranges, along with the commit that inserted them. This
   * can be used to, for example, highlight the part of the document
   * that was inserted by a commit.
   */
  blameMap: Span[];
  /** The commit history, as an array of objects. */
  commits: Commit[];
  /** Inverted steps and their maps corresponding to the changes that
   * have been made since the last commit.
   */
  uncommittedSteps: Step[];
  uncommittedMaps: StepMap[];

  constructor(
    blameMap: Span[],
    commits: Commit[],
    uncommittedSteps: Step[],
    uncommittedMaps: StepMap[],
  ) {
    this.blameMap = blameMap;
    this.commits = commits;
    this.uncommittedSteps = uncommittedSteps;
    this.uncommittedMaps = uncommittedMaps;
  }

  /** Apply a transform to this state。主要是更新操作范围。每次返回新状态对象
   * - 这里只更新文档内容变化对应的blames范围，commits不变因为未提交
   */
  applyTransform(transform: Transform) {
    // Invert steps in the transaction, to be able to save them in the next commit
    const inverted: Step[] = transform.steps.map((step, i) =>
      step.invert(transform.docs[i]),
    );
    const newBlame = updateBlameMap(
      this.blameMap,
      transform,
      this.commits.length,
    );

    // console.log(';; applyTransform-new-trackState');

    // Create a new state—since these are part of the editor state, a
    // persistent data structure, they must not be mutated.
    return new TrackState(
      newBlame,
      this.commits,
      this.uncommittedSteps.concat(inverted),
      this.uncommittedMaps.concat(transform.mapping.maps),
    );
  }

  /** When a transaction is marked as a commit, this is used to put any
   * uncommitted steps into a new commit.
   * - 创建新commit并追加到提交历史，只记录提交描述而文档内容此时不变
   */
  applyCommit(message: string, time: Date) {
    if (this.uncommittedSteps.length === 0) return this;
    const commit = new Commit(
      message,
      time,
      this.uncommittedSteps,
      this.uncommittedMaps,
    );

    return new TrackState(this.blameMap, this.commits.concat(commit), [], []);
  }
}

function updateBlameMap(blames: Span[], transform: Transform, id: number) {
  const result = [] as Span[];
  const mapping = transform.mapping;

  // 根据本次操作更新现有blames
  for (let i = 0; i < blames.length; i++) {
    const span = blames[i];
    const from = mapping.map(span.from, 1);
    const to = mapping.map(span.to, -1);
    if (from < to) {
      result.push(new Span(from, to, span.commit));
    }
  }

  // 将本次操作插入blames
  for (let i = 0; i < mapping.maps.length; i++) {
    const map = mapping.maps[i];
    const after = mapping.slice(i + 1);
    map.forEach((_s, _e, start, end) => {
      insertIntoBlameMap(result, after.map(start, 1), after.map(end, -1), id);
    });
  }

  return result;
}

/** 在blames中找到合适位置，插入from-to-commit对应的span */
function insertIntoBlameMap(
  blames: Span[],
  from: number,
  to: number,
  commit: number,
) {
  if (from >= to) return;
  let pos = 0;
  let next: Span;
  for (; pos < blames.length; pos++) {
    next = blames[pos];
    if (next.commit === commit) {
      if (next.to >= from) break;
    }
    if (next.to > from) {
      // Different commit, not before
      if (next.from < from) {
        // Sticks out to the left (loop below will handle right side)
        const left = new Span(next.from, from, next.commit);
        if (next.to > to) blames.splice(pos++, 0, left);
        else blames[pos++] = left;
      }
      break;
    }
  }

  while ((next = blames[pos])) {
    if (next.commit === commit) {
      if (next.from > to) break;
      from = Math.min(from, next.from);
      to = Math.max(to, next.to);
      blames.splice(pos, 1);
    } else {
      if (next.from >= to) break;
      if (next.to > to) {
        blames[pos] = new Span(to, next.to, next.commit);
        break;
      } else {
        blames.splice(pos, 1);
      }
    }
  }

  blames.splice(pos, 0, new Span(from, to, commit));
}

/** 保存commits历史 */
const trackPlugin = new Plugin({
  state: {
    init(_, instance) {
      return new TrackState(
        [new Span(0, instance.doc.content.size, null)],
        [],
        [],
        [],
      );
    },
    apply(tr, trackPluginState) {
      if (tr.docChanged) {
        // /只有选区变化时，不会执行这里
        trackPluginState = trackPluginState.applyTransform(tr);
      }
      const commitMessageMeta = tr.getMeta(trackPlugin);
      // console.log(';; plug ', tr.docChanged, commitMessageMeta);
      if (commitMessageMeta) {
        trackPluginState = trackPluginState.applyCommit(
          commitMessageMeta,
          new Date(tr.time),
        );
      }
      return trackPluginState;
    },
  },
});

/** 高亮编辑器中对应commit范围的decos的渲染与隐藏 */
const highlightPlugin = new Plugin({
  state: {
    init() {
      return { deco: DecorationSet.empty, commit: null };
    },
    apply(tr, prev, oldState, state) {
      const highlightMeta = tr.getMeta(highlightPlugin);
      if (
        highlightMeta &&
        highlightMeta.add != null &&
        prev.commit != highlightMeta.add
      ) {
        const trackState = trackPlugin.getState(oldState);
        const decos = trackState.blameMap
          .filter(
            (span) => trackState.commits[span.commit] == highlightMeta.add,
          )
          .map((span) =>
            Decoration.inline(span.from, span.to, { class: 'blame-marker' }),
          );
        return {
          deco: DecorationSet.create(state.doc, decos),
          commit: highlightMeta.add,
        };
      } else if (
        highlightMeta &&
        highlightMeta.clear != null &&
        prev.commit === highlightMeta.clear
      ) {
        return { deco: DecorationSet.empty, commit: null };
      } else if (tr.docChanged && prev.commit) {
        return { deco: prev.deco.map(tr.mapping, tr.doc), commit: prev.commit };
      } else {
        return prev;
      }
    },
  },
  props: {
    decorations(state) {
      return highlightPlugin.getState(state).deco;
    },
  },
});

// #region editor-init

/** 始终指向最新editorState，全局单例 */
let state: EditorState = null;
/** 全局单例 */
let view: EditorView = null;

/** 保存上次的提交数据，在(~~编辑了且未提交~~)内容不变只有选区变化的场景避免重渲染下方messages列表 */
let lastRenderedTrackState: TrackState = null;

/** 一直会更新editorState到全局变量state
 * - 在state更新时需要执行的逻辑都放在这里，然后通过dispatchTransaction方法伴随编辑执行
 */
function dispatchMy(tr: Transaction) {
  state = state?.apply(tr);
  view?.updateState(state);
  // console.log(';;edit-dispatch ', trackPlugin.getState(state));
  setCommitMessageFormDisabled(state);
  renderCommits(state, dispatchMy);
}

// #endregion editor-init

/** 创建一个tr，并setMeta提交信息 */
function doCommit(
  message: string,
  state: EditorState,
  dispatch: Parameters<Command>[1],
) {
  dispatch(state.tr.setMeta(trackPlugin, message));
}

/** 撤销一个commit的思路，创建一个tr，将该commit后的mapping调整下 */
function revertCommit(
  commit: Commit,
  state: EditorState,
  dispatch: Parameters<Command>[1],
) {
  const trackState = trackPlugin.getState(state);
  const index = trackState.commits.indexOf(commit);
  // If this commit is not in the history, we can't revert it
  if (index === -1) return;
  // Reverting is only possible if there are no uncommitted changes 类似git
  if (trackState.uncommittedSteps.length) {
    return alert('Commit your changes first!');
  }

  /** This is the mapping from the document as it was at the start of
   * the commit to the current document.
   */
  const remapping = new Mapping(
    trackState.commits
      .slice(index)
      .reduce((maps, c) => maps.concat(c.maps), [] as StepMap[]),
  );
  const tr = state.tr;
  // Build up a transaction that includes all (inverted) steps in this
  // commit, rebased to the current document. They have to be applied
  // in reverse order.
  for (let i = commit.steps.length - 1; i >= 0; i--) {
    // The mapping is sliced to not include maps for this step and the
    // ones before it.
    const remapped = commit.steps[i].map(remapping.slice(i + 1));
    if (!remapped) continue;
    const result = tr.maybeStep(remapped);
    // If the step can be applied, add its map to our mapping
    // pipeline, so that subsequent steps are mapped over it.
    if (result.doc) {
      remapping.appendMap(remapped.getMap(), i);
    }
  }
  // Add a commit message and dispatch.
  if (tr.docChanged) {
    dispatch(tr.setMeta(trackPlugin, `Revert '${commit.message}'`));
  }
}

function setCommitMessageFormDisabled(state: EditorState) {
  const input = document.querySelector('#message') as HTMLInputElement;
  const button = document.querySelector('#commitbutton') as HTMLButtonElement;
  input.disabled = button.disabled =
    trackPlugin.getState(state).uncommittedSteps.length === 0;
}

function createElementThenAddChildren(name, attrs, ...children) {
  const dom = document.createElement(name);
  if (attrs) {
    for (const attr in attrs) dom.setAttribute(attr, attrs[attr]);
  }
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    dom.appendChild(
      typeof child === 'string' ? document.createTextNode(child) : child,
    );
  }
  return dom;
}

/** 将提交信息渲染到dom，并注册操作提交messages列表的事件 */
function renderCommits(state: EditorState, dispatch: Parameters<Command>[1]) {
  const curState = trackPlugin.getState(state);
  const isTrackStatesUnchanged = lastRenderedTrackState === curState;
  // console.log(';; isTrackStatesUnchanged ', isTrackStatesUnchanged);
  if (isTrackStatesUnchanged) return;
  lastRenderedTrackState = curState;

  const commitsHistoryDOM = document.querySelector('#commits');
  commitsHistoryDOM.textContent = '';
  const commits = curState.commits;
  // console.log(';; rerender消息列表 ', commits);
  commits.forEach((commit) => {
    const node = createElementThenAddChildren(
      'div',
      { class: 'commit' },
      createElementThenAddChildren(
        'span',
        { class: 'commit-time' },
        commit.time.getHours() +
          ':' +
          (commit.time.getMinutes() < 10 ? '0' : '') +
          commit.time.getMinutes(),
      ),
      '\u00a0 ' + commit.message + '\u00a0 ',
      createElementThenAddChildren(
        'button',
        { class: 'commit-revert' },
        'revert',
      ),
    );
    node.lastChild.addEventListener('click', () =>
      revertCommit(commit, state, dispatch),
    );
    node.addEventListener('mouseover', (e) => {
      if (!node.contains(e.relatedTarget))
        dispatch(state.tr.setMeta(highlightPlugin, { add: commit }));
    });
    node.addEventListener('mouseout', (e) => {
      if (!node.contains(e.relatedTarget))
        dispatch(state.tr.setMeta(highlightPlugin, { clear: commit }));
    });
    commitsHistoryDOM.appendChild(node);
  });
}

function findInBlameMap(pos: number, state: EditorState) {
  const map = trackPlugin.getState(state).blameMap;
  for (let i = 0; i < map.length; i++) {
    if (map[i].to >= pos && map[i].commit != null) {
      return map[i].commit;
    }
  }
}

/**
 * ✨ 官方编辑器示例，实现revert指定的修改操作，未实现redo
 * - https://prosemirror.net/examples/track/
 * - 一次commit可视为手动提交的一个未确定的版本，可撤销，不要求实时，常用来实现suggestion
 * - https://ckeditor.com/blog/ckeditor-5-comparing-revision-history-with-track-changes/
 * - revision history一般依赖自动保存，会展示一段时间内自动保存的内容，可包含N>=0个commit
 *
 * - 👉🏻 本示例要点
 * - ❓ 编辑了且未提交时，lastRenderedTrackState为什么会不变
 * - ❓ 自定义dispatchMy方法可视为全局修改编辑器数据的一种方式，是否有缺点
 * - 未考虑多个commit交叉重叠的复杂情况，此时revert结果可能比较意外，最好提供单独ui给用户
 */
export const TrackChangesMinimal = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const initialContentContainer = useRef<HTMLDivElement>();
  // const view = useRef<EditorView>(null);

  useEffect(() => {
    state = EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(initialContentContainer.current),
      plugins: exampleSetup({
        schema,
      }).concat(trackPlugin, highlightPlugin),
    });
    view = new EditorView(editorContainer.current, {
      state,
      dispatchTransaction: dispatchMy,
    });
    // applyDevTools(view, { devToolsExpanded: false });

    dispatchMy(state.tr.insertText('Type something, then commit it. '));
    dispatchMy(state.tr.setMeta(trackPlugin, 'Initial commit'));

    // ❓ elements哪里添加的
    document.querySelector('#commit').addEventListener('submit', (e) => {
      const targetEle = e.target as any;
      e.preventDefault();
      doCommit(
        targetEle.elements.message.value || 'Unnamed',
        state,
        dispatchMy,
      );
      targetEle.elements.message.value = '';
      view.focus();
    });

    document.querySelector('#blame').addEventListener('mousedown', (e) => {
      e.preventDefault();
      const targetEle = e.target as HTMLDivElement;
      const pos = targetEle.getBoundingClientRect();
      const commitID = findInBlameMap(state.selection.head, state);
      const commit =
        commitID != null && trackPlugin.getState(state).commits[commitID];
      const node = createElementThenAddChildren(
        'div',
        { class: 'blame-info' },
        commitID != null
          ? createElementThenAddChildren(
              'span',
              null,
              'It was: ',
              createElementThenAddChildren(
                'strong',
                null,
                commit ? commit.message : 'Uncommitted',
              ),
            )
          : 'No commit found',
      );
      node.style.right = document.body.clientWidth - pos.right + 'px';
      node.style.top = pos.bottom + 2 + 'px';
      const blameContainer = document.querySelector('#trackDemoContainer');
      blameContainer.appendChild(node);
      setTimeout(() => blameContainer.removeChild(node), 4000);
      // document.body.appendChild(node);
      // setTimeout(() => document.body.removeChild(node), 2000);
    });

    return () => view.destroy();
  }, []);

  return (
    <StyledDemoContainer id='trackDemoContainer'>
      <div ref={editorContainer} id='editor' />
      <form id='commit'>
        Commit message:
        <input id='message' type='text' name='message' />
        <button id='commitbutton' type='submit'>
          commit
        </button>
        <div className='blame-wrap'>
          <button type='button' id='blame'>
            blame at cursor
          </button>
        </div>
      </form>

      <div id='commits' style={{ marginBottom: '23px' }} />

      {/* 👇🏻 剩下的全是默认隐藏的编辑器初始数据 */}
      <div
        ref={initialContentContainer}
        style={{ display: 'none' }}
        id='initContent'
      >
        <h3>Track Changes in ProseMirror</h3>
        <p />
      </div>
    </StyledDemoContainer>
  );
};

const StyledDemoContainer = styled(StyledContainer)`
  .commit {
    margin-bottom: 4px;
  }
  .commit:hover {
    background: #ff8;
  }
  .commit-revert {
    color: #a22;
  }
  .commit-time {
    background: #5ab;
    padding: 0 5px;
    color: white;
    font-size: 90%;
  }
  .commit-blame {
    background: #ff8;
  }
  .blame-info {
    position: fixed;
    border: 1px solid silver;
    background: white;
    padding: 3px 8px;
    z-index: 3;
  }
  .blame-wrap {
    position: absolute;
    right: 0;
    top: 0;
  }
  #commit {
    margin: 6px 0;
    position: relative;
  }
  .blame-marker {
    background: #ff8;
  }
  #editor {
    min-width: 480px;
  }
`;
