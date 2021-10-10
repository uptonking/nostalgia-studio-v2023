import { InfoIcon, StarredIcon, WarningIcon } from 'outline-icons';
import { wrappingInputRule } from 'prosemirror-inputrules';
import * as React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';

import toggleWrap from '../commands/toggleWrap';
import Node from './Node';

/** Notice的schema.toDOM基于ReactDOM.render()实现，没有提供react组件作为NodeView */
export default class Notice extends Node {
  get styleOptions() {
    return Object.entries({
      info: this.options.dictionary.info,
      warning: this.options.dictionary.warning,
      tip: this.options.dictionary.tip,
    });
  }

  get name() {
    return 'container_notice';
  }

  get schema() {
    return {
      attrs: {
        style: {
          default: 'info',
        },
      },
      content: 'block+',
      group: 'block',
      defining: true,
      draggable: true,
      parseDOM: [
        {
          tag: 'div.notice-block',
          preserveWhitespace: 'full',
          contentElement: 'div:last-child',
          getAttrs: (dom: HTMLDivElement) => ({
            style: dom.className.includes('tip')
              ? 'tip'
              : dom.className.includes('warning')
              ? 'warning'
              : undefined,
          }),
        },
      ],
      toDOM: (node) => {
        const select = document.createElement('select');
        select.addEventListener('change', this.handleStyleChange);

        this.styleOptions.forEach(([key, label]) => {
          const option = document.createElement('option');
          option.value = key;
          option.innerText = label;
          option.selected = node.attrs.style === key;
          select.appendChild(option);
        });

        let component;

        if (node.attrs.style === 'tip') {
          component = <StarredIcon color='currentColor' />;
        } else if (node.attrs.style === 'warning') {
          component = <WarningIcon color='currentColor' />;
        } else {
          component = <InfoIcon color='currentColor' />;
        }

        const icon = document.createElement('div');
        icon.className = 'icon';
        ReactDOM.render(component, icon);

        return [
          'div',
          { class: `notice-block ${node.attrs.style}` },
          icon,
          ['div', { contentEditable: false }, select],
          ['div', { class: 'content' }, 0],
        ];
      },
    };
  }

  /** 作为使用react组件作为NodeView的一种参考实现，问题是ref处理和暴露不方便 */
  component1 = (props) => {
    const node = props.node;
    // const select = document.createElement('select');
    // select.addEventListener('change', this.handleStyleChange);

    // this.styleOptions.forEach(([key, label]) => {
    //   const option = document.createElement('option');
    //   option.value = key;
    //   option.innerText = label;
    //   option.selected = node.attrs.style === key;
    //   select.appendChild(option);
    // });

    let Component = <InfoIcon color='currentColor' />;
    if (node.attrs.style === 'tip') {
      Component = <StarredIcon color='currentColor' />;
    }
    if (node.attrs.style === 'warning') {
      Component = <WarningIcon color='currentColor' />;
    }

    const noticeMsg = node.content.content[0].content.content[0].text;

    return (
      <div
        contentEditable={false}
        className={`notice-block ${node.attrs.style}`}
      >
        <div className='icon'>{Component}</div>
        {/* <div contentEditable={false}>select option</div> */}
        <div className='content'>{noticeMsg}</div>
      </div>
    );
  };

  commands({ type }) {
    return (attrs) => toggleWrap(type, attrs);
  }

  handleStyleChange = (event) => {
    const { view } = this.editor;
    const { tr } = view.state;
    const element = event.target;
    const { top, left } = element.getBoundingClientRect();
    const result = view.posAtCoords({ top, left });

    if (result) {
      const transaction = tr.setNodeMarkup(result.inside, undefined, {
        style: element.value,
      });
      view.dispatch(transaction);
    }
  };

  inputRules({ type }) {
    return [wrappingInputRule(/^:::$/, type)];
  }

  toMarkdown(state, node) {
    state.write('\n:::' + (node.attrs.style || 'info') + '\n');
    state.renderContent(node);
    state.ensureNewLine();
    state.write(':::');
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: 'container_notice',
      getAttrs: (tok) => ({ style: tok.info }),
    };
  }
}
