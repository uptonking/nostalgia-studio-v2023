import { css } from '@linaria/core';

export const editorDefaultCss = css`
  :global() {
    body.dragging {
      cursor: grabbing;
    }

    body.dragging .item {
      transform: translate3d(var(--translate-x, 0), var(--translate-y, 0), 0)
        scaleX(var(--scale-x, 1)) scaleY(var(--scale-y, 1));
    }

    body.dragging .handle,
    .nos-readonly .handle {
      display: none;
    }

    .nos-editable {
      flex: 1;
      word-break: break-word;
    }

    .nos-editable p {
      margin: 0;
      color: var(--nos-palette-black, #212529);
      line-height: 1.5;
    }

    .item[data-slate-node-type='p'] {
      padding-top: 8px;
      padding-bottom: 8px;
      /* line-height: 24px; */
    }

    .item {
      position: relative;
      transform-origin: 0 0;

      margin: 0;
      padding: 4px 0px;
      outline: none;

      touch-action: manipulation;

      /*border: 1px solid lightslategrey;*/
      /*background-color: white;*/
      /*z-index: 0;*/
      will-change: transform;
    }

    .item.item-list {
      padding-left: 0;
    }

    .item-container {
      position: relative;
      list-style: none;
      color: var(--nos-palette-black, #212529);
    }

    .item-container-list {
      /* extra spacing for every list */
      margin-left: calc(0px + var(--spacing));
    }

    .item-container-list.dragging {
      transition: 125ms margin-left;
    }

    .item.dragging {
      z-index: 1;
      background-color: rgba(255, 255, 255, 0.3);
      height: var(--drag-overlay-height, auto);
    }

    .item.dragging:not(.dragOverlay) {
      opacity: 0.3;
      /*border: 2px dotted #0177ff;*/
      background-color: #08baff;
    }

    .item.dragging:not(.dragOverlay) > * {
      visibility: hidden;
    }

    .item.dragOverlay {
      overflow: hidden;
      cursor: inherit;
      opacity: 0.9;
      background-color: white;
      /*box-shadow: 0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05),*/
      /*  -1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25);*/

      box-shadow: 0px 0px 13px 2px rgba(34, 60, 80, 0.2);
    }

    .handle {
      position: absolute;
      left: -24px;
      width: 20px;
      height: 100%;
      padding: 0;
      user-select: none;
      background: none;
      opacity: 0;
    }

    .handle .drag-trigger {
      margin-top: 2px;
      padding-left: 0;
      border: none;
      color: lightslategray;
      background: none;
      font-size: 23px;
      cursor: grab;
    }

    .handle .drag-trigger svg {
      height: 18px;
    }

    .handle.is-heading.is-foldable {
      left: -48px;
      margin-top: 10px;
    }

    .handle.is-foldable {
      left: -40px;
      margin-top: -2px;
    }

    li.item-container-list[data-slate-list-item-type='checkbox'] .handle {
      margin-top: -6px;
    }

    li.item-container-list[data-slate-list-item-type='numbered'] .handle {
      margin-top: -4px;
    }

    .item-container.dragging .handle,
    .item-container.dragOverlay .handle {
      cursor: inherit;
    }

    .item-container:hover .handle,
    .item-container.selected .handle {
      opacity: 0.9;
    }

    .folding:hover,
    .folding.folded,
    .item-container:hover .folding,
    .item-container.selected .folding {
      opacity: 0.9;
    }

    .folding {
      position: absolute;
      top: 0;
      left: 0;
      width: 40px;
      height: 100%;
      cursor: pointer;
      user-select: none;
      background: none;
      border: none;
      font-size: 18px;
      color: lightslategray;
      padding: 0;
      opacity: 0;
      overflow: hidden;

      /*background-color: green;*/
    }

    .folding.is-heading {
      left: -36px;
    }

    .folding-list {
      left: -22px;
      width: 24px;
      padding-top: 2px;
    }

    /* todo make div more specific */
    .folding div {
      transition: 200ms transform;
      transform: rotate(var(--rotate, 90deg));
    }

    /* toggle-arrow icon */
    .folding .i-icon-right-one > svg > path {
      fill: currentColor !important;
    }

    .hidden {
      display: none;
      height: 0;
      padding: 0;
      margin: 0;
      overflow: hidden;
    }

    .disableSelection * {
      user-select: none;
    }

    .disableInteraction {
      pointer-events: none;
    }

    .item.dragging.indicator {
      opacity: 0.9;
      position: relative;
      z-index: 1;
      /*margin-bottom: -1px;*/

      padding: 0;
      width: 100%;
      height: 3px;
      background-color: #0073f8;
    }

    .indicator > * {
      /* Items are hidden using height and opacity to retain focus */
      opacity: 0;
      height: 0;
    }

    .image-wrapper {
      position: relative;
    }

    .image::before {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      content: ' ';
    }

    .folding-pointer {
      cursor: pointer;
      /* float: left; */
      font-size: 12px;
      background: none;
      border: none;
      margin-top: 4px;
      margin-left: 2px;
      user-select: none;
    }

    .pointer {
      /* cursor: pointer; */
      pointer-events: none;
      min-width: 18px;
      transform: rotate(0deg);
      border: none;
      background: none;
      user-select: none;
      white-space: nowrap;
    }

    .toolbar-button {
      background: none;
      border: none;
      cursor: pointer;
    }

    .dragOverlayWrapper {
      padding: 3px 0;
      margin-left: var(--spacing, 0px);
    }

    .dragOverlay {
      background-color: white;
      padding: 3px 40px;
    }

    .dragOverlayList {
      padding-left: 0;
    }

    /* #region list-item */
    .list-item {
      position: relative;
      display: flex;
      align-items: start;
      list-style: none;

      &.folded .folding-pointer,
      & .folding-pointer:hover {
        transition: 300ms transform;
        transform: rotate(-90deg);
      }

      .pointer {
        color: var(--nos-palette-black, #212529);
      }

      .checkbox-pointer {
        float: left;
        margin-top: 3px;
        user-select: none;
        cursor: pointer;
        pointer-events: auto;
      }

      &:not(.folded) .folding-pointer:hover {
        transform: rotate(0deg);
      }
    }

    .list-item-numbered .pointer {
      // margin-right: 3px;
      padding-left: 1px;
    }

    .list-item-bulleted .pointer {
      margin-right: 3px;
      padding-left: 1px;
    }

    .list-item-todoList .pointer {
      margin-right: 3px;
    }

    .list-line {
      user-select: none;
      position: absolute;
      width: 20px;
      height: var(--height);
      top: 26px;
      z-index: 1000;
      cursor: pointer;
      visibility: hidden;
      /*left: calc(39px + var(--spacing));*/
    }

    .list-line::before {
      width: 2px;
      height: 100%;
      background-color: lightgrey;
      display: block;
      /* uncomment to show vertical indicator-line */
      /* content: ''; */
      margin-left: 10px;
      transition: 200ms box-shadow, 200ms background-color;
    }

    .list-line:hover::before {
      background-color: #0177ff;
      box-shadow: 0 0 1px #0177ff;
    }
    /* #endregion list-item */
  }
`;
