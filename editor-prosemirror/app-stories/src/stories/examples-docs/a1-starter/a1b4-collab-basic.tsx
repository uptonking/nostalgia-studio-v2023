import { applyDevTools } from 'prosemirror-dev-toolkit';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { DOMParser, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { EditorState, Plugin, type PluginView } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { StyledContainer } from '../editor-examples.styles';
import {
  EditorConnection,
  Reporter,
} from '../../../prosemirror-collab-basic/client/collab';

/**
 * ✨ 官方编辑器示例，基于prosemirror-collab实现协作编辑 。
 * - https://prosemirror.net/examples/collab/
 *
 * - 👉🏻 本示例要点
 */
export const ProseMirrorCollabBasic = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const usernamesContainer = useRef<HTMLSpanElement>();
  const docNameContainer = useRef<HTMLSpanElement>();
  // const view = useRef<EditorView>(null);
  const connection = useRef<EditorConnection>(null);

  useEffect(() => {
    function connectFromHash() {
      const isID = /^#edit-(.+)/.exec(location.hash);
      console.log(
        'connect from hash/hashIsID ',
        location.hash,
        Boolean(isID),
        isID?.[1],
      );
      if (isID) {
        if (connection.current) connection.current.close();
        docNameContainer.current.textContent = decodeURIComponent(isID[1]);
        connection.current = new EditorConnection(
          new Reporter(),
          '/collab-backend/docs/' + isID[1],
          editorContainer.current,
          usernamesContainer.current,
        );
        window['connection'] = connection.current;
        connection.current.request?.then(() => connection.current.view.focus());
        return true;
      }

      return false;
    }

    connectFromHash() || (location.hash = '#edit-Example');

    window.addEventListener('hashchange', connectFromHash);

    return () => window.removeEventListener('hashchange', connectFromHash);
  }, []);

  return (
    <StyledDemoContainer>
      <div ref={editorContainer} id='editor' />

      <div className='docinfo'>
        Connected to:
        <span id='connected'>
          <span id='docname' ref={docNameContainer}>
            None
          </span>
          <span id='users' ref={usernamesContainer} />
          {/* <button type='button' id='changedoc'>
            Change
          </button> */}
        </span>
      </div>
    </StyledDemoContainer>
  );
};

const StyledDemoContainer = styled(StyledContainer)`
  .subtle {
    color: #777;
  }

  .comment {
    background-color: #ff8;
  }
  .currentComment {
    background-color: #fe0;
  }

  .commentList,
  .commentText {
    display: block;
    padding: 0;
    margin: 0;
    font-style: normal;
  }

  .tooltip-wrapper {
    display: inline-block;
    position: relative;
    width: 0;
    overflow: visible;
    vertical-align: bottom;
  }

  .ProseMirror ul.commentList {
    font-family: 'Source Sans Pro';
    font-size: 16px;
    width: 15em;
    position: absolute;
    top: calc(100% + 8px);
    left: -2em;
    font-size: 1rem;
    color: black;
    background: white;
    font-weight: normal;
    border: 1px solid #888;
    border-radius: 5px;
    z-index: 10;
    padding: 0;
  }

  ul.commentList::before {
    border: 5px solid #888;
    border-top-width: 0px;
    border-left-color: transparent;
    border-right-color: transparent;
    position: absolute;
    top: -5px;
    left: calc(2em - 6px);
    content: ' ';
    height: 0;
    width: 0;
  }

  li.commentText {
    padding: 2px 20px 2px 5px;
    position: relative;
    pointer-events: auto;
    margin: 0;
  }

  li.commentText + li.commentText {
    border-top: 1px solid silver;
  }

  .commentDelete {
    position: absolute;
    right: 0;
    border: 0;
    font: inherit;
    display: inline;
    color: inherit;
    background: transparent;
    cursor: pointer;
  }

  .commentDelete:hover {
    color: #f88;
  }

  .doclist {
    z-index: 20;
    display: block;
    padding: 2px 2px;
    margin: 0;
    border: 1px solid silver;
    position: absolute;
    background: white;
    font-size: 90%;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    max-height: 15em;
    overflow-y: auto;
  }

  .doclist li {
    display: block;
    padding: 1px 3px;
    margin: 0;
    cursor: pointer;
  }

  .doclist li:hover {
    background: #5ae;
    color: white;
  }

  .docinfo {
    position: relative;
    margin-top: 1rem;
    color: #555;
  }

  .ProseMirror-report {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    border-width: 0;
    border-style: solid;
    border-bottom-width: 1px;
    padding: 3px 27px 5px;
    white-space: pre;
    z-index: 1000;
  }

  .ProseMirror-report-fail {
    background: rgb(255, 230, 230);
    border-color: rgb(200, 150, 150);
  }

  .ProseMirror-report-delay {
    background: rgb(255, 255, 200);
    border-color: rgb(200, 200, 120);
  }
`;
