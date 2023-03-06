import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Descendant, Editor, Element, Node } from 'slate';

import { FocusedContext } from '../hooks/use-focused';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { SlateContext } from '../hooks/use-slate';
import {
  getSelectorContext,
  SlateSelectorContext,
} from '../hooks/use-slate-selector';
import { EditorContext } from '../hooks/use-slate-static';
import { ReactEditor } from '../plugin/react-editor';
import { IS_REACT_VERSION_17_OR_ABOVE } from '../utils/environment';
import { EDITOR_TO_ON_CHANGE } from '../utils/weak-maps';

export type SlateProps = {
  editor: ReactEditor;
  /** Slate Provider's `value` prop is only used as initial state for `editor.children`.
   * - If your code relies on replacing `editor.children`, you should do so by replacing it directly instead of relying on the "value" prop to do this for you.
   * - https://github.com/ianstormtaylor/slate/pull/4540
   */
  value: Descendant[];
  children: React.ReactNode;
  /** 当编辑器内容不变且选区变化时(如改变点击光标的位置)，也会触发此方法，editor.children会作为参数传入此方法 */
  onChange?: (value: Descendant[]) => void;
};

/**
 * - A wrapper around the SlateSelectorContext/SlateContext/EditorContext/FocusedContext provider to handle `onChange` events,
 * because the editor is a mutable singleton so it won't ever register as "changed" otherwise.
 * - This provider component keeps track of your Slate editor, its plugins, its value, its selection, and any changes that occur.
 * - 事件顺序：keydown > beforeinput > onchange > keyup
 * - The `value/onChange` convention is provided purely for form-related use cases that expect it.
 * - This is along with the change to how extra props are "controlled". By default they are uncontrolled, but you can pass in any of the other top-level editor properties to take control of them.
 * - The selection, marks, history, or any other props are not required to be controlled. They default to being uncontrolled.
 */
export const Slate = (props: SlateProps) => {
  const { editor, children, onChange, value, ...rest } = props;
  const unmountRef = useRef(false);

  const [context, setContext] = useState<[ReactEditor]>(() => {
    if (!Node.isNodeList(value)) {
      throw new Error(
        `[Slate] value is invalid! Expected a list of elements` +
          `but got: ${JSON.stringify(value)}`,
      );
    }
    if (!Editor.isEditor(editor)) {
      throw new Error(
        `[Slate] editor is invalid! you passed:` + `${JSON.stringify(editor)}`,
      );
    }
    editor.children = value; // 👈🏻 直接赋值
    Object.assign(editor, rest);
    return [editor];
  });

  const { selectorContext, onChange: handleSelectorChange } =
    getSelectorContext(editor);

  /**
   * 💡 依次执行 props.onChange(editor.children), `emitter`.onChange(editor)
   * - 还会触发children元素rerender
   */
  const onContextChange = useCallback(() => {
    if (onChange) {
      // console.log(';; s-e onChange ', editor);

      onChange(editor.children); // onChange在withReact中被增强
    }

    setContext([editor]); // 👈🏻 每次都是新数组对象，会触发children重渲染
    handleSelectorChange(editor);
  }, [onChange]);

  /** 将onContextChange暴露到全局 */
  EDITOR_TO_ON_CHANGE.set(editor, onContextChange);

  useEffect(() => {
    return () => {
      EDITOR_TO_ON_CHANGE.set(editor, () => {});
      unmountRef.current = true;
    };
  }, []);

  const [isFocused, setIsFocused] = useState(ReactEditor.isFocused(editor));

  useEffect(() => {
    setIsFocused(ReactEditor.isFocused(editor));
  });

  useIsomorphicLayoutEffect(() => {
    const fn = () => setIsFocused(ReactEditor.isFocused(editor));
    if (IS_REACT_VERSION_17_OR_ABOVE) {
      // In React >= 17 onFocus and onBlur listen to the focusin and focusout events during the bubbling phase.
      // Therefore in order for <Editable />'s handlers to run first, which is necessary for ReactEditor.isFocused(editor)
      // to return the correct value, we have to listen to the focusin and focusout events without useCapture here.
      document.addEventListener('focusin', fn);
      document.addEventListener('focusout', fn);
      return () => {
        document.removeEventListener('focusin', fn);
        document.removeEventListener('focusout', fn);
      };
    } else {
      document.addEventListener('focus', fn, true);
      document.addEventListener('blur', fn, true);
      return () => {
        document.removeEventListener('focus', fn, true);
        document.removeEventListener('blur', fn, true);
      };
    }
  }, []);

  return (
    <SlateSelectorContext.Provider value={selectorContext}>
      <SlateContext.Provider value={context}>
        <EditorContext.Provider value={editor}>
          <FocusedContext.Provider value={isFocused}>
            {children}
          </FocusedContext.Provider>
        </EditorContext.Provider>
      </SlateContext.Provider>
    </SlateSelectorContext.Provider>
  );
};
