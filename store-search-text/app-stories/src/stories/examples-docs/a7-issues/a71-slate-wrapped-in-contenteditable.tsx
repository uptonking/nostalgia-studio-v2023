import React, { useState } from 'react';
import { createEditor } from 'slate';
import type { BaseEditor, Descendant } from 'slate';
import { DefaultEditable as Editable, Slate, withReact } from 'slate-react';
import type { ReactEditor } from 'slate-react';

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

/**
 * 🤔 测试slate编辑器外层容器div的contenteditable为true/false的行为。
 */
export const SlateWrappedInContenteditableApp = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const [editor2] = useState(() => withReact(createEditor()));

  const [containerEditable, setContainerEditable] = useState(true);

  return (
    <>
      <h3>可切换外层编辑容器状态的编辑器</h3>
      <button onClick={() => setContainerEditable((v) => !v)}>
        当前编辑器外层容器是否可编辑：{String(containerEditable)}，点击切换状态
      </button>
      <div contentEditable={containerEditable}>
        <Slate
          editor={editor}
          value={initialValue as any}
          onChange={(value) => {
            console.log(';; onChange1 ', value);
          }}
        >
          <Editable />
        </Slate>
      </div>

      <h3>普通编辑器</h3>
      <div>
        <Slate
          editor={editor2}
          value={initialValue2 as any}
          onChange={(value) => {
            console.log(';; onChange2 ', value);
          }}
        >
          <Editable />
        </Slate>
      </div>

      <h3>
        两层contentEditable=true时，只触发外层事件，内层事件只在第一次keydown中处理，其他onInput事件都不会执行
      </h3>
      <div>
        <div contentEditable={true} onInput={() => console.log(';; change3')}>
          <div
            // A negative value (usually tabindex="-1") means that the element is not reachable via sequential keyboard navigation,
            // but could be focused with JavaScript or visually by clicking with the mouse.
            // tabindex="0" means that the element should be focusable in sequential keyboard navigation, after any positive tabindex values
            // The maximum value for tabindex is 32767. If not specified, it takes the default value 0.
            // focus的顺序， 3 > 4 > 5 > ... > 0
            // 👉 注意tabIndex必须非0，否则内层事件都不会触发
            tabIndex={-1}
            // tabIndex={1}
            // contentEditable=true默认继承，
            contentEditable={true}
            onInput={() => console.log(';; onInput')}
            onBeforeInput={() => console.log(';; onBeforeInput')}
            // 💡 👀 只触发外层事件change3，不能稳定触发内层事件
            // 比较稳定的触发方式是，在 内容 先按tab，再按任意键
            onKeyDown={() => console.log(';; onKeyDown')}
          >
            <h5>内容</h5>
          </div>
        </div>
      </div>
    </>
  );
};
