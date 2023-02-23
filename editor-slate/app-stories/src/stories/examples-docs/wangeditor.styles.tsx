import styled from '@emotion/styled';

/** wangEditor官方示例用到的css集合*/
export const StyledContainer = styled('div')`
  :root,
  :host {
    --w-e-textarea-bg-color: #fff;
    --w-e-textarea-color: #333;
    --w-e-textarea-border-color: #ccc;
    --w-e-textarea-slight-border-color: #e8e8e8;
    --w-e-textarea-slight-color: #d4d4d4;
    --w-e-textarea-slight-bg-color: #f5f2f0;
    --w-e-textarea-selected-border-color: #b4d5ff;
    --w-e-textarea-handler-bg-color: #4290f7;
    --w-e-toolbar-color: #595959;
    --w-e-toolbar-bg-color: #fff;
    --w-e-toolbar-active-color: #333;
    --w-e-toolbar-active-bg-color: #f1f1f1;
    --w-e-toolbar-disabled-color: #999;
    --w-e-toolbar-border-color: #e8e8e8;
    --w-e-modal-button-bg-color: #fafafa;
    --w-e-modal-button-border-color: #d9d9d9;
  }

  .w-e-text-container *,
  .w-e-toolbar * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    outline: none;
  }
  .w-e-text-container p,
  .w-e-text-container li,
  .w-e-text-container td,
  .w-e-text-container th,
  .w-e-text-container blockquote {
    line-height: 1.5;
  }
  .w-e-toolbar * {
    line-height: 1.5;
  }
  .w-e-text-container {
    color: var(--w-e-textarea-color);
    background-color: var(--w-e-textarea-bg-color);
    position: relative;
    height: 100%;
  }
  .w-e-text-container .w-e-scroll {
    height: 100%;
    -webkit-overflow-scrolling: touch;
  }
  .w-e-text-container [data-slate-editor] {
    outline: 0;
    white-space: pre-wrap;
    /* 【重要】可以显示空格，在连续多空格的情况下 */
    word-wrap: break-word;
    padding: 0 10px;
    border-top: 1px solid transparent;
    min-height: 100%;
  }
  .w-e-text-container [data-slate-editor] p {
    margin: 15px 0;
  }
  .w-e-text-container [data-slate-editor] h1,
  .w-e-text-container [data-slate-editor] h2,
  .w-e-text-container [data-slate-editor] h3,
  .w-e-text-container [data-slate-editor] h4,
  .w-e-text-container [data-slate-editor] h5 {
    margin: 20px 0 20px 0;
  }
  .w-e-text-container [data-slate-editor] img {
    max-width: 100%;
    min-width: 20px;
    min-height: 20px;
    cursor: default;
    display: inline !important;
  }
  .w-e-text-container [data-slate-editor] span {
    text-indent: 0;
  }
  .w-e-text-container [data-slate-editor] [data-selected='true'] {
    box-shadow: 0 0 0 2px var(--w-e-textarea-selected-border-color);
  }
  .w-e-text-placeholder {
    color: var(--w-e-textarea-slight-color);
    position: absolute;
    font-style: italic;
    width: 90%;
    left: 10px;
    top: 17px;
    pointer-events: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }
  .w-e-max-length-info {
    position: absolute;
    color: var(--w-e-textarea-slight-color);
    bottom: 0.5em;
    right: 1em;
    pointer-events: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }
  .w-e-bar {
    background-color: var(--w-e-toolbar-bg-color);
    padding: 0 5px;
    font-size: 14px;
    color: var(--w-e-toolbar-color);
  }
  .w-e-bar svg {
    width: 14px;
    height: 14px;
    fill: var(--w-e-toolbar-color);
  }
  .w-e-bar-show {
    display: flex;
  }
  .w-e-bar-hidden {
    display: none;
  }
  .w-e-hover-bar {
    position: absolute;
    border: 1px solid var(--w-e-toolbar-border-color);
    border-radius: 3px;
    box-shadow: 0 2px 5px #0000001f;
  }
  .w-e-toolbar {
    flex-wrap: wrap;
    position: relative;
  }
  .w-e-bar-divider {
    display: inline-flex;
    width: 1px;
    height: 40px;
    background-color: var(--w-e-toolbar-border-color);
    margin: 0 5px;
  }
  .w-e-bar-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4px;
    height: 40px;
  }
  .w-e-bar-item button {
    border: none;
    background: transparent;
    height: calc(40px - 8px);
    padding: 0 8px;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: var(--w-e-toolbar-color);
    white-space: nowrap;
    /* 不换行 */
    overflow: hidden;
  }
  .w-e-bar-item button:hover {
    background-color: var(--w-e-toolbar-active-bg-color);
    color: var(--w-e-toolbar-active-color);
  }
  .w-e-bar-item button .title {
    margin-left: 5px;
  }
  .w-e-bar-item .active {
    background-color: var(--w-e-toolbar-active-bg-color);
    color: var(--w-e-toolbar-active-color);
  }
  .w-e-bar-item .disabled {
    color: var(--w-e-toolbar-disabled-color);
    cursor: not-allowed;
  }
  .w-e-bar-item .disabled svg {
    fill: var(--w-e-toolbar-disabled-color);
  }
  .w-e-bar-item .disabled:hover {
    background-color: var(--w-e-toolbar-bg-color);
    color: var(--w-e-toolbar-disabled-color);
  }
  .w-e-bar-item .disabled:hover svg {
    fill: var(--w-e-toolbar-disabled-color);
  }
  .w-e-menu-tooltip-v5:before {
    content: attr(data-tooltip);
    position: absolute;
    background-color: var(--w-e-toolbar-active-color);
    color: var(--w-e-toolbar-bg-color);
    text-align: center;
    padding: 5px 10px;
    border-radius: 5px;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.6s;
    font-size: 0.75em;
    visibility: hidden;
    top: 40px;
    white-space: pre;
  }
  .w-e-menu-tooltip-v5:after {
    content: '';
    position: absolute;
    border-width: 5px;
    border-style: solid;
    opacity: 0;
    transition: opacity 0.6s;
    border-color: transparent transparent var(--w-e-toolbar-active-color)
      transparent;
    visibility: hidden;
    top: 30px;
  }
  .w-e-menu-tooltip-v5:hover:before,
  .w-e-menu-tooltip-v5:hover:after {
    opacity: 1;
    visibility: visible;
  }
  .w-e-menu-tooltip-v5.tooltip-right:before {
    left: 100%;
    top: 10px;
  }
  .w-e-menu-tooltip-v5.tooltip-right:after {
    left: 100%;
    margin-left: -10px;
    top: 16px;
    border-color: transparent var(--w-e-toolbar-active-color) transparent
      transparent;
  }
  .w-e-bar-item-group .w-e-bar-item-menus-container {
    display: none;
    /* 默认隐藏 */
    z-index: 1;
    background-color: var(--w-e-toolbar-bg-color);
    position: absolute;
    top: 0;
    left: 0;
    margin-top: 40px;
    border: 1px solid var(--w-e-toolbar-border-color);
    border-radius: 3px;
    box-shadow: 0 2px 10px #0000001f;
  }
  .w-e-bar-item-group:hover {
    /* hover 时显示下级菜单 */
  }
  .w-e-bar-item-group:hover .w-e-bar-item-menus-container {
    display: block;
  }
  .w-e-select-list {
    z-index: 1;
    position: absolute;
    left: 0;
    top: 0;
    background-color: var(--w-e-toolbar-bg-color);
    margin-top: 40px;
    min-width: 100px;
    border: 1px solid var(--w-e-toolbar-border-color);
    border-radius: 3px;
    box-shadow: 0 2px 10px #0000001f;
    max-height: 350px;
    overflow-y: auto;
  }
  .w-e-select-list ul {
    list-style: none;
    line-height: 1;
  }
  .w-e-select-list ul .selected {
    background-color: var(--w-e-toolbar-active-bg-color);
  }
  .w-e-select-list ul li {
    cursor: pointer;
    padding: 7px 0 7px 25px;
    position: relative;
    text-align: left;
    white-space: nowrap;
    /* 不换行 */
  }
  .w-e-select-list ul li:hover {
    background-color: var(--w-e-toolbar-active-bg-color);
  }
  .w-e-select-list ul li svg {
    position: absolute;
    left: 0;
    margin-left: 5px;
    top: 50%;
    margin-top: -7px;
  }
  .w-e-bar-bottom .w-e-select-list {
    top: inherit;
    bottom: 0;
    margin-top: 0;
    margin-bottom: 40px;
  }
  .w-e-drop-panel {
    z-index: 1;
    background-color: var(--w-e-toolbar-bg-color);
    position: absolute;
    top: 0;
    border: 1px solid var(--w-e-toolbar-border-color);
    border-radius: 3px;
    box-shadow: 0 2px 10px #0000001f;
    margin-top: 40px;
    min-width: 200px;
    padding: 10px;
  }
  .w-e-bar-bottom .w-e-drop-panel {
    top: inherit;
    bottom: 0;
    margin-top: 0;
    margin-bottom: 40px;
  }
  .w-e-modal {
    z-index: 1;
    background-color: var(--w-e-toolbar-bg-color);
    position: absolute;
    padding: 20px 15px 0 15px;
    min-width: 100px;
    min-height: 40px;
    color: var(--w-e-toolbar-color);
    text-align: left;
    font-size: 14px;
    border: 1px solid var(--w-e-toolbar-border-color);
    border-radius: 3px;
    box-shadow: 0 2px 10px #0000001f;
  }
  .w-e-modal .btn-close {
    position: absolute;
    right: 8px;
    top: 7px;
    cursor: pointer;
    padding: 5px;
    line-height: 1;
  }
  .w-e-modal .btn-close svg {
    width: 10px;
    height: 10px;
    fill: var(--w-e-toolbar-color);
  }
  .w-e-modal .babel-container {
    display: block;
    margin-bottom: 15px;
  }
  .w-e-modal .babel-container span {
    display: block;
    margin-bottom: 10px;
  }
  .w-e-modal .button-container {
    margin-bottom: 15px;
  }
  .w-e-modal button {
    font-weight: 400;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    touch-action: manipulation;
    height: 32px;
    padding: 4.5px 15px;
    color: var(--w-e-toolbar-color);
    background-color: var(--w-e-modal-button-bg-color);
    text-align: center;
    border: 1px solid var(--w-e-modal-button-border-color);
    border-radius: 4px;
  }
  .w-e-modal textarea,
  .w-e-modal input[type='text'],
  .w-e-modal input[type='number'] {
    font-variant: tabular-nums;
    font-feature-settings: 'tnum';
    padding: 4.5px 11px;
    color: var(--w-e-toolbar-color);
    background-color: var(--w-e-toolbar-bg-color);
    border: 1px solid var(--w-e-modal-button-border-color);
    border-radius: 4px;
    transition: all 0.3s;
    width: 100%;
  }
  .w-e-modal textarea {
    min-height: 60px;
  }
  body .w-e-modal {
    box-sizing: border-box;
  }
  body .w-e-modal * {
    box-sizing: border-box;
  }
  .w-e-progress-bar {
    position: absolute;
    width: 0;
    height: 1px;
    background-color: var(--w-e-textarea-handler-bg-color);
    transition: width 0.3s;
  }
  .w-e-full-screen-container {
    position: fixed;
    margin: 0 !important;
    padding: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    height: 100% !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
  }
  .w-e-full-screen-container [data-w-e-textarea='true'] {
    flex: 1 !important;
  }

  .w-e-text-container [data-slate-editor] code {
    font-family: monospace;
    background-color: var(--w-e-textarea-slight-bg-color);
    padding: 3px;
    border-radius: 3px;
  }
  .w-e-panel-content-color {
    list-style: none;
    text-align: left;
    width: 230px;
  }
  .w-e-panel-content-color li {
    display: inline-block;
    padding: 2px;
    cursor: pointer;
    border-radius: 3px 3px;
    border: 1px solid var(--w-e-toolbar-bg-color);
  }
  .w-e-panel-content-color li:hover {
    border-color: var(--w-e-toolbar-color);
  }
  .w-e-panel-content-color li .color-block {
    width: 17px;
    height: 17px;
    border: 1px solid var(--w-e-toolbar-border-color);
    border-radius: 3px 3px;
  }
  .w-e-panel-content-color .active {
    border-color: var(--w-e-toolbar-color);
  }
  .w-e-panel-content-color .clear {
    width: 100%;
    line-height: 1.5;
    margin-bottom: 5px;
  }
  .w-e-panel-content-color .clear svg {
    width: 16px;
    height: 16px;
    margin-bottom: -4px;
  }
  .w-e-text-container [data-slate-editor] blockquote {
    display: block;
    border-left: 8px solid var(--w-e-textarea-selected-border-color);
    padding: 10px 10px;
    margin: 10px 0;
    line-height: 1.5;
    font-size: 100%;
    background-color: var(--w-e-textarea-slight-bg-color);
  }
  .w-e-panel-content-emotion {
    list-style: none;
    text-align: left;
    width: 300px;
    font-size: 20px;
  }
  .w-e-panel-content-emotion li {
    display: inline-block;
    padding: 0 5px;
    cursor: pointer;
    border-radius: 3px 3px;
  }
  .w-e-panel-content-emotion li:hover {
    background-color: var(--w-e-textarea-slight-bg-color);
  }
  .w-e-textarea-divider {
    padding: 20px 20px;
    margin: 20px auto;
    border-radius: 3px;
  }
  .w-e-textarea-divider hr {
    display: block;
    border: 0;
    height: 1px;
    background-color: var(--w-e-textarea-border-color);
  }
  .w-e-text-container [data-slate-editor] pre > code {
    display: block;
    border: 1px solid var(--w-e-textarea-slight-border-color);
    border-radius: 4px 4px;
    text-indent: 0;
    background-color: var(--w-e-textarea-slight-bg-color);
    padding: 10px;
    font-size: 14px;
  }
  .w-e-text-container [data-slate-editor] .w-e-image-container {
    display: inline-block;
    margin: 0 3px;
  }
  .w-e-text-container [data-slate-editor] .w-e-image-container:hover {
    box-shadow: 0 0 0 2px var(--w-e-textarea-selected-border-color);
  }
  .w-e-text-container [data-slate-editor] .w-e-selected-image-container {
    position: relative;
    overflow: hidden;
  }
  .w-e-text-container
    [data-slate-editor]
    .w-e-selected-image-container
    .w-e-image-dragger {
    width: 7px;
    height: 7px;
    background-color: var(--w-e-textarea-handler-bg-color);
    position: absolute;
  }
  .w-e-text-container
    [data-slate-editor]
    .w-e-selected-image-container
    .left-top {
    top: 0;
    left: 0;
    cursor: nwse-resize;
  }
  .w-e-text-container
    [data-slate-editor]
    .w-e-selected-image-container
    .right-top {
    top: 0;
    right: 0;
    cursor: nesw-resize;
  }
  .w-e-text-container
    [data-slate-editor]
    .w-e-selected-image-container
    .left-bottom {
    left: 0;
    bottom: 0;
    cursor: nesw-resize;
  }
  .w-e-text-container
    [data-slate-editor]
    .w-e-selected-image-container
    .right-bottom {
    right: 0;
    bottom: 0;
    cursor: nwse-resize;
  }
  .w-e-text-container [data-slate-editor] .w-e-selected-image-container:hover {
    box-shadow: none;
  }
  .w-e-text-container [contenteditable='false'] .w-e-image-container:hover {
    box-shadow: none;
  }

  .w-e-text-container [data-slate-editor] .table-container {
    width: 100%;
    overflow-x: auto;
    border: 1px dashed var(--w-e-textarea-border-color);
    padding: 10px;
    border-radius: 5px;
    margin-top: 10px;
  }
  .w-e-text-container [data-slate-editor] table {
    border-collapse: collapse;
  }
  .w-e-text-container [data-slate-editor] table td,
  .w-e-text-container [data-slate-editor] table th {
    border: 1px solid var(--w-e-textarea-border-color);
    padding: 3px 5px;
    min-width: 30px;
    text-align: left;
    line-height: 1.5;
  }
  .w-e-text-container [data-slate-editor] table th {
    background-color: var(--w-e-textarea-slight-bg-color);
    text-align: center;
    font-weight: bold;
  }
  .w-e-panel-content-table {
    background-color: var(--w-e-toolbar-bg-color);
  }
  .w-e-panel-content-table table {
    border-collapse: collapse;
  }
  .w-e-panel-content-table td {
    border: 1px solid var(--w-e-toolbar-border-color);
    padding: 3px 5px;
    width: 20px;
    height: 15px;
    cursor: pointer;
  }
  .w-e-panel-content-table td.active {
    background-color: var(--w-e-toolbar-active-bg-color);
  }

  .w-e-textarea-video-container {
    text-align: center;
    border: 1px dashed var(--w-e-textarea-border-color);
    padding: 10px 0;
    margin: 0 auto;
    margin-top: 10px;
    border-radius: 5px;
    background-position: 0px 0px, 10px 10px;
    background-size: 20px 20px;
    background-image: linear-gradient(
        45deg,
        #eee 25%,
        transparent 25%,
        transparent 75%,
        #eee 75%,
        #eee 100%
      ),
      linear-gradient(
        45deg,
        #eee 25%,
        white 25%,
        white 75%,
        #eee 75%,
        #eee 100%
      );
  }

  .w-e-text-container [data-slate-editor] pre > code {
    text-shadow: 0 1px white;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    hyphens: none;
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.comment,
  .w-e-text-container [data-slate-editor] pre > code .token.prolog,
  .w-e-text-container [data-slate-editor] pre > code .token.doctype,
  .w-e-text-container [data-slate-editor] pre > code .token.cdata {
    color: slategray;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.punctuation {
    color: #999;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.namespace {
    opacity: 0.7;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.property,
  .w-e-text-container [data-slate-editor] pre > code .token.tag,
  .w-e-text-container [data-slate-editor] pre > code .token.boolean,
  .w-e-text-container [data-slate-editor] pre > code .token.number,
  .w-e-text-container [data-slate-editor] pre > code .token.constant,
  .w-e-text-container [data-slate-editor] pre > code .token.symbol,
  .w-e-text-container [data-slate-editor] pre > code .token.deleted {
    color: #905;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.selector,
  .w-e-text-container [data-slate-editor] pre > code .token.attr-name,
  .w-e-text-container [data-slate-editor] pre > code .token.string,
  .w-e-text-container [data-slate-editor] pre > code .token.char,
  .w-e-text-container [data-slate-editor] pre > code .token.builtin,
  .w-e-text-container [data-slate-editor] pre > code .token.inserted {
    color: #690;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.operator,
  .w-e-text-container [data-slate-editor] pre > code .token.entity,
  .w-e-text-container [data-slate-editor] pre > code .token.url,
  .w-e-text-container
    [data-slate-editor]
    pre
    > code
    .language-css
    .token.string,
  .w-e-text-container [data-slate-editor] pre > code .style .token.string {
    color: #9a6e3a;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.atrule,
  .w-e-text-container [data-slate-editor] pre > code .token.attr-value,
  .w-e-text-container [data-slate-editor] pre > code .token.keyword {
    color: #07a;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.function,
  .w-e-text-container [data-slate-editor] pre > code .token.class-name {
    color: #dd4a68;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.regex,
  .w-e-text-container [data-slate-editor] pre > code .token.important,
  .w-e-text-container [data-slate-editor] pre > code .token.variable {
    color: #e90;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.important,
  .w-e-text-container [data-slate-editor] pre > code .token.bold {
    font-weight: bold;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.italic {
    font-style: italic;
  }
  .w-e-text-container [data-slate-editor] pre > code .token.entity {
    cursor: help;
  }
`;
