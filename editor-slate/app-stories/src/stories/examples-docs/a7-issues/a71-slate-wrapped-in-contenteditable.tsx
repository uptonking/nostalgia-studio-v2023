import React, { useCallback, useState } from 'react';

import type { BaseEditor, Descendant } from 'slate';
import { createEditor } from 'slate';
import type { ReactEditor } from 'slate-react';
import { DefaultEditable as Editable, Slate, withReact } from 'slate-react';

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: '👏 Hello, Slate editor with contenteditable=true container!' },
    ],
  },
];

const initialValue2 = [
  {
    type: 'paragraph',
    children: [{ text: '👏 Hello, Plain Slate editor!' }],
  },
];

const DefaultElement = (props) => (
  <p
    {...props.attributes}
    style={{ border: '1px solid beige', padding: 8 }}
    onKeyDown={() => console.log(';; keyDown-Paragraph')}
    onClick={() => console.log(';; click-Paragraph')}
  >
    {props.children}
  </p>
);

/**
 * 🤔 测试slate编辑器外层容器div的contenteditable为true/false的行为。
 */
export const SlateContenteditableEvents = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const [editor2] = useState(() => withReact(createEditor()));

  const [containerEditable, setContainerEditable] = useState(true);

  const renderElement: any = useCallback(
    (props) => <DefaultElement {...props} />,
    [],
  );

  return (
    <>
      <h3>可切换外层编辑容器状态的编辑器</h3>
      <button onClick={() => setContainerEditable((v) => !v)}>
        当前编辑器外层容器是否可编辑：{String(containerEditable)}，点击切换状态
      </button>
      <div contentEditable={containerEditable}>
        {/* 🚨 因为外层有contenteditable，所以内层的keydown事件不会触发 */}
        <Slate
          editor={editor}
          value={initialValue as any}
          onChange={(value) => {
            console.log(';; onChange1 ', value);
          }}
        >
          <Editable
            renderElement={renderElement}
            onKeyDown={() => console.log(';;down-Edit-container1')}
            onClick={() => console.log(';; click-Edit-container1')}
          />
        </Slate>
      </div>

      <h3>普通编辑器</h3>
      <div>
        {/* 🚨 内层的keydown事件正常触发 */}
        <Slate
          editor={editor2}
          value={initialValue2 as any}
          onChange={(value) => {
            console.log(';; onChange2 ', value);
          }}
        >
          <Editable
            renderElement={renderElement}
            onKeyDown={() => console.log(';;down-Edit-container2')}
            onClick={() => console.log(';; click-Edit-container2')}
          />
        </Slate>
      </div>

      <h3>
        两层contentEditable=true时，只触发外层事件，内层事件只在第一次keydown中处理，其他onInput事件都不会执行
      </h3>
      <div>
        <div
          id='ct3'
          contentEditable={true}
          onInput={() => console.log(';; change3')}
          onClick={() => console.log(';; click-Edit-container3')}
          // onMouseDown={() => console.log(';; msDown3')}
          onKeyDown={() => {
            console.log(';; onKeyDown3');
            console.log(' activeElem3 ', document.activeElement);
          }}
        >
          {/* 🚨 因为外层有contenteditable，所以内层的keydown事件不会触发，
          但内层mouseDown、click事件会触发
          */}
          <div
            id='ct31'
            // contentEditable=true默认继承，
            contentEditable={true}
            // A negative value (usually tabindex="-1") means that the element is not reachable via sequential keyboard navigation,
            // but could be focused with JavaScript or visually by clicking with the mouse.
            // tabindex="0" means that the element should be focusable in sequential keyboard navigation, after any positive tabindex values
            // The maximum value for tabindex is 32767. If not specified, it takes the default value 0.
            // focus的顺序， 3 > 4 > 5 > ... > 0
            // 👉 注意tabIndex必须非0，否则内层事件都不会触发
            tabIndex={-1}
            // tabIndex={1}
            onInput={() => console.log(';; onInput')}
            onBeforeInput={() => console.log(';; onBeforeInput')}
            onClick={() => console.log(';; click3-1')}
            // onMouseDown={() => console.log(';; msDown3-1')}
            // 💡 👀 只触发外层事件change3，不能稳定触发内层事件
            onKeyDown={() => {
              console.log(';; onKeyDown3-1');
              console.log(' activeElem3-1 ', document.activeElement);
            }}
          >
            <h4
              id='ct311'
              style={{ padding: 8, border: '1px solid beige' }}
              onClick={() => console.log(';; click3-1-1')}
              // onMouseDown={() => console.log(';; msDown3-1-1')}
              onKeyDown={() => {
                console.log(';; onKeyDown3-1-1');
                console.log(' activeElem3-1-1 ', document.activeElement);
              }}
            >
              这里是内容，内层keydown事件不会执行，但click事件会执行
            </h4>
          </div>
        </div>
      </div>
    </>
  );
};
