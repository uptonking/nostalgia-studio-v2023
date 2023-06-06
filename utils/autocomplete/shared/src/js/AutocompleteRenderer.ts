export type Pragma = (
  type: any,
  props: Record<string, any> | null,
  ...children: ComponentChildren[]
) => JSX.Element;
export type PragmaFrag = any;

type ComponentChild = VNode<any> | string | number | boolean | null | undefined;

type ComponentChildren = ComponentChild[] | ComponentChild;

export type VNode<TProps = {}> = {
  type: any;
  key: string | number | any;
  props: TProps & { children: ComponentChildren };
};

export type Render = (
  vnode: ComponentChild,
  parent: Element | Document | ShadowRoot | DocumentFragment,
  replaceNode?: Element | Text | undefined,
) => void;

export type AutocompleteRenderer = {
  /**
   * The function to create virtual nodes.
   *
   * @default preact.createElement
   */
  createElement: Pragma;
  /**
   * The component to use to create fragments.
   *
   * @default preact.Fragment
   */
  Fragment: PragmaFrag;
  /**
   * The function to render children to an element.
   * - The function to render a tree of VNodes into a DOM container.
   * - It uses Preact's `render` by default, but you can provide your own implementation.
   */
  render?: Render;
};

export type HTMLTemplate = (
  strings: TemplateStringsArray,
  ...values: any[]
) => VNode | VNode[];
