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
  SlateSelectorContext,
  getSelectorContext,
} from '../hooks/use-slate-selector';
import { EditorContext } from '../hooks/use-slate-static';
import { ReactEditor } from '../plugin/react-editor';
import { IS_REACT_VERSION_17_OR_ABOVE } from '../utils/environment';
import { EDITOR_TO_ON_CHANGE } from '../utils/weak-maps';

/**
 * - A wrapper around the SlateSelectorContext/SlateContext/EditorContext/FocusedContext provider to handle `onChange` events,
 * because the editor is a mutable singleton so it won't ever register as "changed" otherwise.
 * - The `value/onChange` convention is provided purely for form-related use cases that expect it.
 * - This is along with the change to how extra props are "controlled". By default they are uncontrolled, but you can pass in any of the other top-level editor properties to take control of them.
 * - the selection, marks, history, or any other props are not required to be controlled. They default to being uncontrolled.
 */
export const Slate = (props: {
  editor: ReactEditor;
  value: Descendant[];
  children: React.ReactNode;
  onChange?: (value: Descendant[]) => void;
}) => {
  const { editor, children, onChange, value, ...rest } = props;
  const unmountRef = useRef(false);

  const [context, setContext] = React.useState<[ReactEditor]>(() => {
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
    editor.children = value;
    Object.assign(editor, rest);
    return [editor];
  });

  const { selectorContext, onChange: handleSelectorChange } =
    getSelectorContext(editor);

  const onContextChange = useCallback(() => {
    if (onChange) {
      onChange(editor.children);
    }

    setContext([editor]);
    handleSelectorChange(editor);
  }, [onChange]);

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
