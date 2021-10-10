import memoize from 'lodash/memoize';
import { baseKeymap } from 'prosemirror-commands';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown';
import {
  MarkSpec,
  NodeSpec,
  Node as PMNode,
  Schema,
  Slice,
} from 'prosemirror-model';
import { EditorState, Plugin, Selection } from 'prosemirror-state';
import { selectColumn, selectRow, selectTable } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import styled, { ThemeProvider } from 'styled-components';

import StyledEditor from './StyledEditor';
import BlockMenu from './components/BlockMenu';
import Flex from './components/Flex';
import LinkToolbar from './components/LinkToolbar';
import SelectionToolbar from './components/SelectionToolbar';
import Tooltip from './components/Tooltip';
import baseDictionary from './dictionary';
import ComponentView from './lib/ComponentView';
import ExtensionManager from './lib/ExtensionManager';
import headingToSlug from './lib/headingToSlug';
// marks
import Bold from './marks/Bold';
import Code from './marks/Code';
import Highlight from './marks/Highlight';
import Italic from './marks/Italic';
import Link from './marks/Link';
import TemplatePlaceholder from './marks/Placeholder';
import Strikethrough from './marks/Strikethrough';
import Underline from './marks/Underline';
// nodes
import Blockquote from './nodes/Blockquote';
import BulletList from './nodes/BulletList';
import CheckboxItem from './nodes/CheckboxItem';
import CheckboxList from './nodes/CheckboxList';
import CodeBlock from './nodes/CodeBlock';
import CodeBlockOjs from './nodes/CodeBlockOjs';
import CodeFence from './nodes/CodeFence';
import Doc from './nodes/Doc';
import Embed from './nodes/Embed';
import HardBreak from './nodes/HardBreak';
import Heading from './nodes/Heading';
import HorizontalRule from './nodes/HorizontalRule';
import Image from './nodes/Image';
import ListItem from './nodes/ListItem';
import Notice from './nodes/Notice';
import OrderedList from './nodes/OrderedList';
import Paragraph from './nodes/Paragraph';
import ReactNode from './nodes/ReactNode';
import Table from './nodes/Table';
import TableCell from './nodes/TableCell';
import TableHeadCell from './nodes/TableHeadCell';
import TableRow from './nodes/TableRow';
import Text from './nodes/Text';
// plugins
import BlockMenuTrigger from './plugins/BlockMenuTrigger';
import History from './plugins/History';
import Keys from './plugins/Keys';
import MarkdownPaste from './plugins/MarkdownPaste';
import MaxLength from './plugins/MaxLength';
import Placeholder from './plugins/Placeholder';
import SmartText from './plugins/SmartText';
import TrailingNode from './plugins/TrailingNode';
import { dark as darkTheme, light as lightTheme } from './theme';
import { Props } from './types';

export { schema, parser, serializer, renderToHtml } from './server';

export { default as Extension } from './lib/Extension';

export const theme = lightTheme;

type State = {
  isEditorFocused: boolean;
  selectionMenuOpen: boolean;
  blockMenuOpen: boolean;
  linkMenuOpen: boolean;
  blockMenuSearch: string;
  isRTL: boolean;
};

type Step = {
  slice?: Slice;
};

/**
 * 基于prosemirror-view/state/model和react实现的markdown编辑器组件。
 * todo: remark
 * todo: class to hooks.
 */
export class RichMarkdownEditor extends React.PureComponent<Props, State> {
  static defaultProps: Props = {
    defaultValue: '',
    // defaultValue: '默认文本 defaultValue',
    placeholder: 'Write something nice…',
    onImageUploadStart: () => {
      // no default behavior
    },
    onImageUploadStop: () => {
      // no default behavior
    },
    onChange: () => {
      // no default behavior
    },
    onClickLink: (href) => {
      window.open(href, '_blank');
    },
    embeds: [],
    extensions: [],
    tooltip: Tooltip,
    dir: 'auto',
  };

  state = {
    isEditorFocused: false,
    selectionMenuOpen: false,
    blockMenuOpen: false,
    blockMenuSearch: '',
    linkMenuOpen: false,
    isRTL: false,
  };

  isBlurred: boolean;
  extensions: ExtensionManager;
  /** 指向editor直接父元素div的dom ref，使用callback ref的形式 */
  element?: HTMLElement | null;
  setEditorCBRef = (domEl) => {
    this.element = domEl;
  };
  /** prosemirror-view的EditorView对象，会自己管理编辑器状态 */
  view: EditorView;
  /** 渲染PMNode到dom元素时，使用自定义NodeView类，而不是schema中的toDOM */
  nodeViews: {
    [name: string]: (node, view, getPos, decorations) => ComponentView;
  };
  schema: Schema;
  nodes: { [name: string]: NodeSpec };
  marks: { [name: string]: MarkSpec };
  serializer: MarkdownSerializer;
  parser: MarkdownParser;
  /** 直接传递给prosemirror-EditorState的plugins属性 */
  plugins: Plugin[];
  inputRules: InputRule[];
  commands: Record<string, any>;
  keymaps: Plugin[];

  /** 将PMDoc序列化成md文本字符串 */
  value = (): string => {
    return this.serializer.serialize(this.view.state.doc);
  };

  init() {
    this.extensions = this.createExtensions();

    // 下面这些成员属性都是从this.extensions中直接计算得到
    this.nodes = this.createNodes();
    this.marks = this.createMarks();
    this.schema = this.createSchema();
    this.plugins = this.createPlugins();
    this.keymaps = this.createKeymaps();
    this.serializer = this.createSerializer();
    this.parser = this.createParser();
    this.inputRules = this.createInputRules();

    // 这里创建的nodeViews会作为配置参数直接传递给EditorView
    this.nodeViews = this.createNodeViews();
    // console.log(';;init-nodeViews, ', this.nodeViews);

    // 创建pm中的EditorState和EditorView对象
    this.view = this.createView();

    // ? 为什么不在创建editorView前创建，这里在后面创建是如何通知view的
    this.commands = this.createCommands();
  }

  componentDidMount() {
    this.init();

    if (this.props.scrollTo) {
      this.scrollToAnchor(this.props.scrollTo);
    }

    this.calculateDir();

    if (this.props.readOnly) return;

    if (this.props.autoFocus) {
      this.focusAtEnd();
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Allow changes to the 'value' prop to update the editor from outside
    if (this.props.value && prevProps.value !== this.props.value) {
      const newState = this.createState(this.props.value);
      this.view.updateState(newState);
    }

    // pass readOnly changes through to underlying editor instance
    if (prevProps.readOnly !== this.props.readOnly) {
      this.view.update({
        ...this.view.props,
        editable: () => !this.props.readOnly,
      });
    }
    if (this.props.scrollTo && this.props.scrollTo !== prevProps.scrollTo) {
      this.scrollToAnchor(this.props.scrollTo);
    }

    // Focus at the end of the document if switching from readOnly and autoFocus
    // is set to true
    if (prevProps.readOnly && !this.props.readOnly && this.props.autoFocus) {
      this.focusAtEnd();
    }

    if (prevProps.dir !== this.props.dir) {
      this.calculateDir();
    }

    if (
      !this.isBlurred &&
      !this.state.isEditorFocused &&
      !this.state.blockMenuOpen &&
      !this.state.linkMenuOpen &&
      !this.state.selectionMenuOpen
    ) {
      this.isBlurred = true;
      if (this.props.onBlur) {
        this.props.onBlur();
      }
    }

    if (
      this.isBlurred &&
      (this.state.isEditorFocused ||
        this.state.blockMenuOpen ||
        this.state.linkMenuOpen ||
        this.state.selectionMenuOpen)
    ) {
      this.isBlurred = false;
      if (this.props.onFocus) {
        this.props.onFocus();
      }
    }
  }

  /** 创建并返回ExtensionManager，中间创建了很多自定义节点对象， */
  createExtensions() {
    const dictionary = this.dictionary(this.props.dictionary);

    // adding nodes here? Update schema.ts for serialization on the server
    const defaultExtensions = [
      new Doc(),
      new Text(),
      new HardBreak(),
      new Paragraph(),
      new Blockquote(),
      new CodeBlock({
        dictionary,
        onShowToast: this.props.onShowToast,
      }),
      new CodeBlockOjs({
        dictionary,
        onShowToast: this.props.onShowToast,
      }),
      new CodeFence({
        dictionary,
        onShowToast: this.props.onShowToast,
      }),
      new CheckboxList(),
      new CheckboxItem(),
      new BulletList(),
      new Embed(),
      new ListItem(),
      new Notice({
        dictionary,
      }),
      new Heading({
        dictionary,
        onShowToast: this.props.onShowToast,
        offset: this.props.headingsOffset,
      }),
      new HorizontalRule(),
      new Image({
        dictionary,
        uploadImage: this.props.uploadImage,
        onImageUploadStart: this.props.onImageUploadStart,
        onImageUploadStop: this.props.onImageUploadStop,
        onShowToast: this.props.onShowToast,
      }),
      new Table(),
      new TableCell({
        onSelectTable: this.handleSelectTable,
        onSelectRow: this.handleSelectRow,
      }),
      new TableHeadCell({
        onSelectColumn: this.handleSelectColumn,
      }),
      new TableRow(),
      new Bold(),
      new Code(),
      new Highlight(),
      new Italic(),
      new TemplatePlaceholder(),
      new Underline(),
      new Link({
        onKeyboardShortcut: this.handleOpenLinkMenu,
        onClickLink: this.props.onClickLink,
        onClickHashtag: this.props.onClickHashtag,
        onHoverLink: this.props.onHoverLink,
      }),
      new Strikethrough(),
      new OrderedList(),
      new History(),
      new SmartText(),
      new TrailingNode(),
      new MarkdownPaste(),
      new Keys({
        onBlur: this.handleEditorBlur,
        onFocus: this.handleEditorFocus,
        onSave: this.handleSave,
        onSaveAndExit: this.handleSaveAndExit,
        onCancel: this.props.onCancel,
      }),
      new BlockMenuTrigger({
        dictionary,
        onOpen: this.handleOpenBlockMenu,
        onClose: this.handleCloseBlockMenu,
      }),
      new Placeholder({
        placeholder: this.props.placeholder,
      }),
      new MaxLength({
        maxLength: this.props.maxLength,
      }),
    ];

    const enabledExtensions = [
      ...defaultExtensions.filter((extension) => {
        // Optionally disable extensions
        if (this.props.disableExtensions) {
          return !(this.props.disableExtensions as string[]).includes(
            extension.name,
          );
        }
        return true;
      }),
      ...this.props.extensions,
    ];

    return new ExtensionManager(enabledExtensions, this);
  }

  createDocument(content: string): PMNode {
    return this.parser.parse(content);
  }

  /** 创建并返回EditorState对象，传入了doc,plugins,schema */
  createState(value?: string) {
    const doc = this.createDocument(value || this.props.defaultValue);

    return EditorState.create({
      schema: this.schema,
      doc,
      plugins: [
        ...this.plugins,
        ...this.keymaps,
        dropCursor({ color: this.theme().cursor }),
        gapCursor(),
        inputRules({
          rules: this.inputRules,
        }),
        keymap(baseKeymap),
      ],
    });
  }

  /** 先创建EditorState，然后再创建并返回prosemirror的EditorView对象 */
  createView() {
    if (!this.element) {
      throw new Error('createView called before ref available');
    }
    const isEditingCheckbox = (tr) => {
      return tr.steps.some(
        (step: Step) =>
          step.slice?.content?.firstChild?.type.name ===
          this.schema.nodes.checkbox_item.name,
      );
    };
    const editorState = this.createState();
    // console.log(';;initialEditorState, ', editorState);

    const view = new EditorView(this.element, {
      state: editorState,
      nodeViews: this.nodeViews,
      editable: () => !this.props.readOnly,
      handleDOMEvents: this.props.handleDOMEvents,

      dispatchTransaction: (transaction) => {
        const { state, transactions } =
          this.view.state.applyTransaction(transaction);

        console.log(';;newState, ', state);
        this.view.updateState(state);

        // If any of the transactions being dispatched resulted in the doc changing,
        // then call our own change handler to let the outside world know
        if (
          transactions.some((tr) => tr.docChanged) &&
          (!this.props.readOnly ||
            (this.props.readOnlyWriteCheckboxes &&
              transactions.some(isEditingCheckbox)))
        ) {
          this.handleChange();
        }

        this.calculateDir();

        // Because Prosemirror and React are not linked we must tell React that
        // a render is needed whenever the Prosemirror state changes.
        // 会强制触发执行当前react组件的render()方法，子组件会正常rerender
        this.forceUpdate();
      },
    });

    // Tell third-party libraries and screen-readers that this is an input
    view.dom.setAttribute('role', 'textbox');

    return view;
  }

  /** 遍历包含react组件的extensions，创建NodeView.
   * NodeView应该同时支持vanillajs和react。
   * https://github.com/outline/rich-markdown-editor/pull/409#issuecomment-802603158
   */
  createNodeViews() {
    return this.extensions.extensions
      .filter((extension: ReactNode) => extension.component)
      .reduce((nodeViews, extension: ReactNode) => {
        const nodeView = (node, view, getPos, decorations) => {
          return new ComponentView(extension.component, {
            editor: this,
            extension,
            node,
            view,
            getPos,
            decorations,
          });
        };

        return {
          ...nodeViews,
          [extension.name]: nodeView,
        };
      }, {});
  }

  createPlugins() {
    return this.extensions.plugins;
  }

  createKeymaps() {
    return this.extensions.keymaps({
      schema: this.schema,
    });
  }

  createInputRules() {
    return this.extensions.inputRules({
      schema: this.schema,
    });
  }

  createCommands() {
    return this.extensions.commands({
      schema: this.schema,
      view: this.view,
    });
  }

  createNodes() {
    return this.extensions.nodes;
  }

  createMarks() {
    return this.extensions.marks;
  }

  /** 创建符合prosemirror-model的schema对象，传入了markdown相关节点配置 */
  createSchema() {
    return new Schema({
      nodes: this.nodes,
      marks: this.marks,
    });
  }

  createSerializer() {
    return this.extensions.serializer();
  }

  createParser() {
    return this.extensions.parser({
      schema: this.schema,
    });
  }

  scrollToAnchor(hash: string) {
    if (!hash) return;

    try {
      const element = document.querySelector(hash);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      // querySelector will throw an error if the hash begins with a number
      // or contains a period. This is protected against now by safeSlugify
      // however previous links may be in the wild.
      console.warn(`Attempted to scroll to invalid hash: ${hash}`, err);
    }
  }

  calculateDir = () => {
    if (!this.element) return;

    const isRTL =
      this.props.dir === 'rtl' ||
      getComputedStyle(this.element).direction === 'rtl';

    if (this.state.isRTL !== isRTL) {
      this.setState({ isRTL });
    }
  };

  /** 编辑器doc变化后，会在执行view.updateState()后执行此回调函数 */
  handleChange = () => {
    if (!this.props.onChange) return;

    this.props.onChange(() => {
      return this.value();
    });
  };

  handleSave = () => {
    const { onSave } = this.props;
    if (onSave) {
      onSave({ done: false });
    }
  };

  handleSaveAndExit = () => {
    const { onSave } = this.props;
    if (onSave) {
      onSave({ done: true });
    }
  };

  handleEditorBlur = () => {
    this.setState({ isEditorFocused: false });
  };

  handleEditorFocus = () => {
    this.setState({ isEditorFocused: true });
  };

  handleOpenSelectionMenu = () => {
    // console.log(';;handleOpenSelectionMenu');
    this.setState({ blockMenuOpen: false, selectionMenuOpen: true });
  };

  handleCloseSelectionMenu = () => {
    // console.log(';;handleCloseSelectionMenu');

    this.setState({ selectionMenuOpen: false });
  };

  handleOpenLinkMenu = () => {
    this.setState({ blockMenuOpen: false, linkMenuOpen: true });
  };

  handleCloseLinkMenu = () => {
    this.setState({ linkMenuOpen: false });
  };

  handleOpenBlockMenu = (search: string) => {
    // console.log(';;handleOpenBlockMenu-search, ', search);
    this.setState({ blockMenuOpen: true, blockMenuSearch: search });
  };

  handleCloseBlockMenu = () => {
    // console.log(';;handleCloseBlockMenu');

    if (!this.state.blockMenuOpen) return;
    this.setState({ blockMenuOpen: false });
  };

  handleSelectRow = (index: number, state: EditorState) => {
    this.view.dispatch(selectRow(index)(state.tr));
  };

  handleSelectColumn = (index: number, state: EditorState) => {
    this.view.dispatch(selectColumn(index)(state.tr));
  };

  handleSelectTable = (state: EditorState) => {
    this.view.dispatch(selectTable(state.tr));
  };

  // 'public' methods
  /** Place the cursor at the start of the document and focus it. */
  focusAtStart = () => {
    const selection = Selection.atStart(this.view.state.doc);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  /** Place the cursor at the end of the document and focus it. */
  focusAtEnd = () => {
    const selection = Selection.atEnd(this.view.state.doc);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  /** Returns an array of objects with the text content of all the headings in the document,
   * useful to construct your own table of contents
   */
  getHeadings = () => {
    const headings: { title: string; level: number; id: string }[] = [];
    const previouslySeen = {};

    this.view.state.doc.forEach((node) => {
      if (node.type.name === 'heading') {
        // calculate the optimal slug
        const slug = headingToSlug(node);
        let id = slug;

        // check if we've already used it, and if so how many times?
        // Make the new id based on that number ensuring that we have
        // unique ID's even when headings are identical
        if (previouslySeen[slug] > 0) {
          id = headingToSlug(node, previouslySeen[slug]);
        }

        // record that we've seen this slug for the next loop
        previouslySeen[slug] =
          previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;

        headings.push({
          title: node.textContent,
          level: node.attrs.level,
          id,
        });
      }
    });
    return headings;
  };

  theme = () => {
    return this.props.theme || (this.props.dark ? darkTheme : lightTheme);
  };

  dictionary = memoize(
    (providedDictionary?: Partial<typeof baseDictionary>) => {
      return { ...baseDictionary, ...providedDictionary };
    },
  );

  // render = () => {
  render() {
    // console.log(';;/pps4 RMEditor, ', this.props);

    // console.log(';;editor-blockMenuOpen, ', this.state.blockMenuOpen);

    const {
      readOnly,
      readOnlyWriteCheckboxes,
      style,
      tooltip,
      dir,
      className,
      onKeyDown,
    } = this.props;
    const { isRTL } = this.state;
    const dictionary = this.dictionary(this.props.dictionary);

    return (
      <Flex
        onKeyDown={onKeyDown}
        style={style}
        className={className}
        align='flex-start'
        justify='center'
        dir={dir}
        column
      >
        <ThemeProvider theme={this.theme()}>
          <React.Fragment>
            <StyledEditor
              dir={dir}
              rtl={isRTL}
              readOnly={readOnly}
              readOnlyWriteCheckboxes={readOnlyWriteCheckboxes}
              ref={this.setEditorCBRef}
            />
            {!readOnly && this.view && (
              <React.Fragment>
                <SelectionToolbar
                  view={this.view}
                  dictionary={dictionary}
                  commands={this.commands}
                  rtl={isRTL}
                  isTemplate={this.props.template === true}
                  onOpen={this.handleOpenSelectionMenu}
                  onClose={this.handleCloseSelectionMenu}
                  onSearchLink={this.props.onSearchLink}
                  onClickLink={this.props.onClickLink}
                  onCreateLink={this.props.onCreateLink}
                  tooltip={tooltip}
                />
                <LinkToolbar
                  view={this.view}
                  dictionary={dictionary}
                  isActive={this.state.linkMenuOpen}
                  onCreateLink={this.props.onCreateLink}
                  onSearchLink={this.props.onSearchLink}
                  onClickLink={this.props.onClickLink}
                  onShowToast={this.props.onShowToast}
                  onClose={this.handleCloseLinkMenu}
                  tooltip={tooltip}
                />
                <BlockMenu
                  view={this.view}
                  commands={this.commands}
                  dictionary={dictionary}
                  rtl={isRTL}
                  isActive={this.state.blockMenuOpen}
                  search={this.state.blockMenuSearch}
                  onClose={this.handleCloseBlockMenu}
                  uploadImage={this.props.uploadImage}
                  onLinkToolbarOpen={this.handleOpenLinkMenu}
                  onImageUploadStart={this.props.onImageUploadStart}
                  onImageUploadStop={this.props.onImageUploadStop}
                  onShowToast={this.props.onShowToast}
                  embeds={this.props.embeds}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        </ThemeProvider>
      </Flex>
    );
  }
}

export default RichMarkdownEditor;
