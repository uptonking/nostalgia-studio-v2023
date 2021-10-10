import { EditorView } from 'prosemirror-view';
import * as React from 'react';

import { SearchResult } from '../components/LinkEditor';
import baseDictionary from '../dictionary';
import Extension from '../lib/Extension';
import { light as theme } from '../theme';
import { EmbedDescriptor, ToastType } from './node-components';

export type Props = {
  /** A unique id for editor, used to persist settings in local storage.
   * If no `id` is passed, then the editor will default to using the location pathname. */
  id?: string;
  /** A markdown string that represents the value of the editor.
   * Use this prop to change the value of the editor once mounted, this will re-render the entire editor */
  value?: string;
  /** A markdown string that represents the initial value of the editor.
   * Use this to prop to restore previously saved content for the user to continue editing. */
  defaultValue?: string;
  /** Allows overriding of the placeholder text. */
  placeholder: string;
  /** Allows additional Prosemirror plugins to be passed to the underlying Prosemirror instance. */
  extensions: Extension[];
  /** used to set a list of included extension names to disable. Removes corresponding menu items and commands. */
  disableExtensions?: (
    | 'strong'
    | 'code_inline'
    | 'highlight'
    | 'em'
    | 'link'
    | 'placeholder'
    | 'strikethrough'
    | 'underline'
    | 'blockquote'
    | 'bullet_list'
    | 'checkbox_item'
    | 'checkbox_list'
    | 'code_block'
    | 'code_fence'
    | 'embed'
    | 'br'
    | 'heading'
    | 'hr'
    | 'image'
    | 'list_item'
    | 'container_notice'
    | 'ordered_list'
    | 'paragraph'
    | 'table'
    | 'td'
    | 'th'
    | 'tr'
  )[];
  /** When set true together with `readOnly` set to false, focus at the end of the document automatically. */
  autoFocus?: boolean;
  /** if false, the editor is optimized for composition. */
  readOnly?: boolean;
  /** checkboxes can still be checked or unchecked as a special case while readOnly is set to true */
  readOnlyWriteCheckboxes?: boolean;
  /** Allows overriding the inbuilt copy dictionary, for example to internationalize the editor.  */
  dictionary?: Partial<typeof baseDictionary>;
  /** if true, the editor will use a default dark theme that's included. */
  dark?: boolean;
  /** Allows overriding the inbuilt theme to brand the editor */
  theme?: typeof theme;
  /** Controls direction of the document. default to auto */
  dir?: 'auto' | 'ltr' | 'rtl';
  template?: boolean;
  /** A number that will offset the document headings by a number of levels. */
  headingsOffset?: number;
  /** When set enforces a maximum character length on the document, not including markdown syntax. */
  maxLength?: number;
  /** A string representing a heading anchor – the document will smooth scroll so that the heading is visible in the viewport. */
  scrollTo?: string;
  /** This object maps event names (focus, paste, touchstart, etc.) to callback functions. */
  handleDOMEvents?: {
    [name: string]: (view: EditorView, event: Event) => boolean;
  };
  /** accept a single File object and return a promise the resolves to a url  */
  uploadImage?: (file: File) => Promise<string>;
  /** triggered when the user loses focus on the editor contenteditable and all associated UI elements such as the block menu and floating toolbars.
   * If you want to listen for blur events on only the contenteditable area, then use `handleDOMEvents` props. */
  onBlur?: () => void;
  /** triggered when the user gains focus on the editor contenteditable or any associated UI elements such as the block menu or floating toolbars.
   * If you want to listen for focus events on only the contenteditable area, then use `handleDOMEvents` props. */
  onFocus?: () => void;
  /** triggered when the user explicitly requests to save using a keyboard shortcut, Ctrl+S or Ctrl+Enter */
  onSave?: ({ done: boolean }) => void;
  /** triggered when the Ctrl+Escape is hit within the editor. You may use it to cancel editing. */
  onCancel?: () => void;
  /** triggered when the contents of the editor changes, usually due to user input such as a keystroke or using formatting options.
   * It returns a function which when called returns the current text value of the document.
   * This optimization is made to avoid serializing the state of the document to text on every change event,
   * allowing the host app to choose when it needs the serialized value.
   */
  onChange: (value: () => string) => void;
  /** triggered before uploadImage and can be used to show some UI that indicates an upload is in progress. */
  onImageUploadStart?: () => void;
  /** Triggered once an image upload has succeeded or failed. */
  onImageUploadStop?: () => void;
  /** accept a link "title" as the only parameter and return a promise that resolves to a url for the created link */
  onCreateLink?: (title: string) => Promise<string>;
  /** accept a search term as the only parameter and return a promise that resolves to an array of objects. */
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  /** This callback allows overriding of link handling.
   * It's often the case that you want to have external links open a new window and have internal links use something like react-router to navigate.
   * If no callback is provided then default behavior of opening a new tab will apply to all links */
  onClickLink: (href: string, event: MouseEvent) => void;
  /** This callback allows detecting when the user hovers over a link in the document. */
  onHoverLink?: (event: MouseEvent) => boolean;
  /** handle clicking on hashtags in the document text. If no callback is provided then hashtags will render as regular text */
  onClickHashtag?: (tag: string, event: MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** define embeds which will be inserted in place of links when the matcher function returns a truthy value. */
  embeds: EmbedDescriptor[];
  /** Triggered when the editor wishes to show a message to the user. */
  onShowToast?: (message: string, code: ToastType) => void;
  /** A React component that will be wrapped around items that have an optional tooltip.
   * You can use this to inject your own tooltip library into the editor */
  tooltip: typeof React.Component | React.FC<any>;
  className?: string;
  style?: Record<string, string>;
};
