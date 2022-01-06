import { Node as PMNode } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import React from 'react';

import { EditorContext } from '../context';
import { createListenProps } from './hooks/createListenProps';
import { PortalProvider } from './portals/PortalProvider';

export type ReactComponentProps = { [key: string]: unknown };
export interface Attrs {
  [key: string]: any;
}
export type ForwardRef = (node: HTMLElement | null) => void;

export interface NodeViewProps<P = ReactComponentProps, A extends Attrs = {}> {
  componentProps: P;
  attrs: A;
}

/** 使用react组件实现NodeView的例子 */
export class ReactNodeView<P = ReactComponentProps, A extends Attrs = {}>
  implements NodeView
{
  /**
   * The outer DOM node that represents the document node. When not
   * given, the default strategy is used to create a DOM node.
   * dom: ?⁠dom.Node
   * 非常简单，创建span或div，这里是createPortal的目标dom container
   */
  dom?: HTMLElement;
  /**
   * The DOM node that should hold the node's content. Only meaningful
   * if the node view also defines a `dom` property and if its node
   * type is not a leaf node type. When this is present, ProseMirror
   * will take care of rendering the node's children into it. When it
   * is not present, the node view itself is responsible for rendering
   * (or deciding not to render) its child nodes.
   * contentDOM: ?⁠dom.Node
   */
  contentDOM: Node | undefined;
  node: PMNode;
  view: EditorView;
  getPos: (() => number) | boolean;

  private reactComponent?: React.ComponentType<any>;
  private portalProvider: PortalProvider;
  private ctx: EditorContext;

  reactComponentProps: P;

  constructor(
    node: PMNode,
    view: EditorView,
    getPos: (() => number) | boolean,
    ctx: EditorContext,
    reactComponentProps?: P,
    reactComponent?: React.ComponentType<any>,
  ) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.ctx = ctx;
    this.portalProvider = ctx.portalProvider;
    this.reactComponentProps = reactComponentProps || ({} as P);
    this.reactComponent = reactComponent;
  }

  /**
   * 创建this.dom/this.contentDOM，并通过createPortal()将NodeView渲染到this.dom
   * This method exists to move initialization logic out of the constructor,
   * so object can be initialized properly before calling render first time.
   *
   * Example:
   * Instance properties get added to an object only after super call in
   * constructor, which leads to some methods being undefined during the
   * first render.
   */
  init() {
    // Here, we'll provide a container to render React into.
    // Coincidentally, this is where ProseMirror will put its
    // generated contentDOM. React will throw out that content
    // once rendered, and at the same time we'll append it into
    // the component tree, like a fancy shell game. This isn't
    // obvious to the user, but would it be more obvious on an
    // expensive render?
    //
    this.dom = this.createContainerDOM() as HTMLElement;

    // Instead of just mindlessly copying the attributes to the container node
    // I think letting the component render them is preferred.
    // You can't really apply styles outside the component to the parent either way
    // and the attributes are stored inside this.node and thus not needed to be actually shown.
    // this.setDomAttrs(this.node, this.dom)

    // @see ED-3790
    // something gets messed up during mutation processing inside of a
    // nodeView if DOM structure has nested plain "div"s, it doesn't see the
    // difference between them and it kills the nodeView
    this.dom.classList.add(`${this.node.type.name}__nodeview-dom`);

    // Finally, we provide an element to render content into.
    // We will be moving this node around as we need to.
    // 这里始终返回undefined，需要由Extension子类实现时
    this.contentDOM = this.createContentDOM();

    if (this.contentDOM) {
      // This contentDOM is thrown out by the reactComponent once it renders
      // but which is then re-added with the handleRef
      this.dom.appendChild(this.contentDOM);
    }

    // 获取到一个方法，将 <container, cb> 保存到 portalProvider
    const useListenProps = createListenProps<NodeViewProps<P, A>>(
      this.dom,
      this.portalProvider,
    );

    // 将PMNode中的属性等数据创建成react元素，
    // 这里通过callback ref将contentDOM的内容作为children添加到react组件
    const nodeViewReactElement = this.render(
      this.createProps(this.node),
      this.handleRef,
      useListenProps,
    );

    // 将react元素渲染到this.dom，所以最终contentDOM的内容添加到了this.dom上，但没有挂载到react tree
    this.renderReactComponent(nodeViewReactElement);

    return this;
  }

  /** 创建和更新ReactNodeView都会基于此方法 */
  createProps(node: PMNode): NodeViewProps<P, A> {
    return {
      componentProps: this.reactComponentProps,
      attrs: node.attrs as A,
    };
  }

  /** 触发执行ReactDOM.createPortal() */
  private renderReactComponent(component: React.ReactElement<any> | null) {
    if (!this.dom || !component) {
      return;
    }
    // 这里的component是react element类型，保存 {this.dom, reactElem} 到映射表
    this.portalProvider.render(component, this.dom!);
  }

  createContainerDOM(): HTMLElement {
    return this.node.isInline
      ? document.createElement('span')
      : document.createElement('div');
  }

  /**
   * If this.node is a leaf node, there shouldn't be a contentDOM.
   * Perhaps a check should be in place to validate this..
   */
  createContentDOM(): Node | undefined {
    return undefined;
  }

  /** 创建NodeView对应的react元素，通过callback ref将contentDOM的内容作为children添加到react组件 */
  render(
    initialProps: NodeViewProps<P, A>,
    cbRef: ForwardRef,
    useListenProps: (cb: (newProps: NodeViewProps<P, A>) => void) => void,
  ): React.ReactElement<any> | null {
    const NodeViewReactComp = this.reactComponent;

    return this.reactComponent ? (
      <NodeViewReactComp
        ref={cbRef}
        initialProps={initialProps}
        useListenProps={useListenProps}
      />
    ) : null;
  }

  /**
   * 使用callback ref的形式，将contentDOM的内容作为child添加到当前元素
   * After the component has been rendered, if this nodeView contains a contentDOM it is
   * appended to the element the component chooses to by forwarding a ref to it.
   * @param node the element the ref points to inside the component.
   */
  handleRef = (node: HTMLElement | null) => {
    if (node && this.contentDOM && !node.contains(this.contentDOM)) {
      node.appendChild(this.contentDOM);
    }
  };

  /** 只添加到待更新队列，并不实际执行更新 */
  update(node: PMNode, _decorations: Decoration[]) {
    if (!this.dom) return false;
    // Sometimes it might happen that the current transaction transforms/splits a node
    // into entirely different node (eg block nodes like blockquotes becoming paragraphs all of sudden).
    // I guess you could do some magic there to avoid redrawing but for now I have little idea how to
    // utilize it so this returns false and the update is processed by PM default behavior.
    // Might be relevant
    // https://discuss.prosemirror.net/t/how-to-modify-node-attribute-without-replacing-it-and-causing-it-to-re-render/2510/9
    if (node.type !== this.node.type) return false;
    this.node = node;

    // 每次更新都会创建react新的props
    // TODO pass down also type & marks & decorations if changed?
    this.portalProvider.update(this.dom, this.createProps(node));

    console.log(';;ReactNodeView updated');
    return true;
  }

  /**
   * Copies the attributes from a ProseMirror Node to a DOM node.
   * NOT used at the moment since it messes up classes if used for component HTMLElement directly.
   * Also I think it's better for component to decide how to set those attributes.
   * @param node The Prosemirror Node from which to source the attributes
   */
  setDomAttrs(node: PMNode, element: HTMLElement) {
    Object.keys(node.attrs || {}).forEach((attr) => {
      element.setAttribute(attr, node.attrs[attr]);
    });
  }

  /**
   * Used to prevent changes to DOM inside the contentDOM from confusing PM to attempt
   * "fixing" this nodeView by removing the added children etc
   * https://github.com/remirror/remirror/blob/a2fa2c2b935a6fce99e3f79aad8a207c920e236e/packages/%40remirror/extension-react-component/src/react-node-view.tsx
   * @param mutation
   */
  ignoreMutation(
    mutation:
      | MutationRecord
      | {
          type: 'selection';
          target: Element;
        },
  ): boolean {
    if (mutation.type === 'selection') {
      return false;
    } else if (!this.contentDOM) {
      return true;
    }
    return !this.contentDOM.contains(mutation.target);
  }

  destroy() {
    if (this.dom) {
      this.portalProvider.remove(this.dom);
    }
    this.dom = undefined;
    this.contentDOM = undefined;
  }

  static fromComponent(
    component: React.ComponentType<any>,
    ctx: EditorContext,
    props?: ReactComponentProps,
  ) {
    return (node: PMNode, view: EditorView, getPos: (() => number) | boolean) =>
      new ReactNodeView(node, view, getPos, ctx, props, component).init();
  }
}
