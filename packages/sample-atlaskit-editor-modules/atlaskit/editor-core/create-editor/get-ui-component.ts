import type {
  EditorAppearance,
  EditorAppearanceComponentProps,
} from '../types';
import FullPage from '../ui/Appearance/FullPage';

// import Chromeless from '../ui/Appearance/Chromeless';
// import Comment from '../ui/Appearance/Comment';
// import Mobile from '../ui/Appearance/Mobile';

/** 返回要使用的编辑器组件，默认提供了3种，full-page/comment/mobile */
export default function getUiComponent(
  appearance: EditorAppearance,
):
  | React.ComponentClass<EditorAppearanceComponentProps>
  | React.FunctionComponent<EditorAppearanceComponentProps> {
  // appearance = appearance || 'comment';
  const appearance_ = appearance || 'full-page';
  // console.log(';;appearance, ', appearance);

  switch (appearance_) {
    case 'full-page':
    case 'full-width':
      return FullPage;
    // case 'chromeless':
    //   return Chromeless;
    // case 'comment':
    //   return Comment;
    // case 'mobile':
    //   return Mobile;
    default:
      throw new Error(
        `Appearance '${appearance_}' is not supported by the editor.`,
      );
  }
}
