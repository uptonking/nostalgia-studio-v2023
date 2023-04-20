import { Descendant, Editor, Element, Node, NodeEntry, Text } from 'slate';
import { jsx } from 'slate-hyperscript';

import { isHtmlElement, isHtmlText } from '../utils';
import type { DeserializeHtml } from './types';
import { normalizeDescendantsToDocumentFragment } from './utils';

type DeserializeHtmlOptions = {
  element: HTMLElement | string;
  stripWhitespace?: boolean;
};

/**
 * Deserialize HTML element to a valid document fragment.
 */
export const deserializeHtml = (
  editor: Editor,
  { element, stripWhitespace = true }: DeserializeHtmlOptions,
): Descendant[] => {
  // for serializer
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element, stripWhitespace);
  }

  const fragment = deserializeHtmlNode(editor)(element) as Descendant[];

  return normalizeDescendantsToDocumentFragment(editor, {
    descendants: fragment,
  });
};

/**
 * Convert HTML string into HTML element.
 */
export const htmlStringToDOMNode = (
  rawHtml: string,
  stripWhitespace = true,
) => {
  const node = document.createElement('body');
  node.innerHTML = rawHtml;

  if (stripWhitespace) {
    node.innerHTML = node.innerHTML.replace(/(\r\n|\n|\r|\t)/gm, '');
  }

  return node;
};

/**
 * Deserialize HTML element or child node.
 */
export const deserializeHtmlNode =
  (editor: Editor) => (node: HTMLElement | ChildNode) => {
    const textNode = htmlTextNodeToString(node);
    if (textNode) return textNode;

    if (!isHtmlElement(node)) return null;

    // break line
    const breakLine = htmlBrToNewLine(node);
    if (breakLine) return breakLine;

    // body
    const fragment = htmlBodyToFragment(editor, node as HTMLElement);
    if (fragment) return fragment;

    // element
    const element = htmlElementToElement(editor, node as HTMLElement);
    if (element) return element;

    // leaf
    return htmlElementToLeaf(editor, node as HTMLElement);
  };

export const htmlTextNodeToString = (node: HTMLElement | ChildNode) => {
  if (isHtmlText(node)) {
    return node.nodeValue === '\n' ? null : node.textContent;
  }
};

export const htmlBrToNewLine = (node: HTMLElement | ChildNode) => {
  if (node.nodeName === 'BR') {
    return '\n';
  }
};

export const htmlBodyToFragment = (
  editor: Editor,
  element: HTMLElement,
): Descendant[] | undefined => {
  if (element.nodeName === 'BODY') {
    return jsx('fragment', {}, deserializeHtmlNodeChildren(editor, element));
  }
};

/**
 * Deserialize HTML to editor-Element.
 */
export const htmlElementToElement = (
  editor: Editor,
  element: HTMLElement,
): Element | undefined => {
  const deserialized = pipeDeserializeHtmlElement(editor, element);

  if (deserialized) {
    const { node, withoutChildren } = deserialized;

    let descendants =
      node.children ??
      (deserializeHtmlNodeChildren(editor, element) as Descendant[]);
    if (!descendants['length'] || withoutChildren) {
      descendants = [{ text: '' }];
    }

    return jsx('element', node, descendants) as Element;
  }
};

export const pipeDeserializeHtmlElement = (
  editor: Editor,
  element: HTMLElement,
) => {
  let result: (DeserializeHtml & { node: Record<string, unknown> }) | undefined;

  [...editor['plugins']].reverse().some((plugin) => {
    result = pluginDeserializeHtml(editor, plugin, { element });
    return Boolean(result);
  });

  return result;
};

/**
 * Get a deserializer by type, node names, class names and styles.
 */
export const pluginDeserializeHtml = (
  editor: Editor,
  plugin,
  {
    element: el,
    deserializeLeaf,
  }: { element: HTMLElement; deserializeLeaf?: boolean },
): (DeserializeHtml & { node: Record<string, unknown> }) | undefined => {
  const {
    deserializeHtml,
    isElement: isElementRoot,
    isLeaf: isLeafRoot,
    type,
  } = plugin;

  if (!deserializeHtml) return;

  const {
    attributeNames,
    query,
    isLeaf: isLeafRule,
    isElement: isElementRule,
    rules,
  } = deserializeHtml;
  let { getNode } = deserializeHtml;

  const isElement = isElementRule || isElementRoot;
  const isLeaf = isLeafRule || isLeafRoot;

  if (!deserializeLeaf && !isElement) {
    return;
  }

  if (deserializeLeaf && !isLeaf) {
    return;
  }

  if (rules) {
    const isValid = rules.some(
      ({ validNodeName = '*', validStyle, validClassName, validAttribute }) => {
        if (validNodeName) {
          const validNodeNames = Array.isArray(validNodeName)
            ? validNodeName
            : [validNodeName];

          // Ignore if el nodeName is not included in rule validNodeNames (except *).
          if (
            validNodeNames.length &&
            !validNodeNames.includes(el.nodeName) &&
            validNodeName !== '*'
          )
            return false;
        }

        // Ignore if the rule className is not in el class list.
        if (validClassName && !el.className.includes(validClassName))
          return false;

        if (validStyle) {
          for (const [key, value] of Object.entries(validStyle)) {
            const values = Array.isArray(value) ? value : [value];

            // Ignore if el style value is not included in rule style values (except *)
            if (!values.includes(el.style[key]) && value !== '*') return;

            // Ignore if el style value is falsy (for value *)
            if (value === '*' && !el.style[key]) return;

            const defaultNodeValue = plugin.inject.props?.defaultNodeValue;

            // Ignore if the style value = plugin.inject.props.defaultNodeValue
            if (defaultNodeValue && defaultNodeValue === el.style[key]) {
              return false;
            }
          }
        }

        if (validAttribute) {
          if (typeof validAttribute === 'string') {
            if (!el.getAttributeNames().includes(validAttribute)) return false;
          } else {
            for (const [attributeName, attributeValue] of Object.entries(
              validAttribute,
            )) {
              const attributeValues = Array.isArray(attributeValue)
                ? attributeValue
                : [attributeValue];
              const elAttribute = el.getAttribute(attributeName);

              if (!elAttribute || !attributeValues.includes(elAttribute))
                return false;
            }
          }
        }

        return true;
      },
    );

    if (!isValid) return;
  }

  if (query && !query(el)) {
    return;
  }

  if (!getNode) {
    if (isElement) {
      getNode = () => ({ type });
    } else if (isLeaf) {
      getNode = () => ({ [type]: true });
    } else {
      return;
    }
  }

  const node = getNode(el, {}) ?? {};
  if (!Object.keys(node).length) return;

  // const injectedPlugins = getInjectedPlugins(editor, plugin);
  // injectedPlugins.forEach((injectedPlugin) => {
  //   const res = injectedPlugin.deserializeHtml?.getNode?.(el, node);
  //   if (res) {
  //     node = {
  //       ...node,
  //       ...res,
  //     };
  //   }
  // });

  if (attributeNames) {
    const elementAttributes = {};

    const elementAttributeNames = el.getAttributeNames();

    for (const elementAttributeName of elementAttributeNames) {
      if (attributeNames.includes(elementAttributeName)) {
        elementAttributes[elementAttributeName] =
          el.getAttribute(elementAttributeName);
      }
    }

    if (Object.keys(elementAttributes).length) {
      node.attributes = elementAttributes;
    }
  }

  return { ...deserializeHtml, node };
};

export const deserializeHtmlNodeChildren = (
  editor: Editor,
  node: HTMLElement | ChildNode,
) => {
  return Array.from(node.childNodes).map(deserializeHtmlNode(editor)).flat();
};

/**
 * Deserialize HTML to Descendant[] with marks on Text.
 * - Build the leaf from the leaf deserializer of each plugin.
 */
export const htmlElementToLeaf = (editor: Editor, element: HTMLElement) => {
  const node = pipeDeserializeHtmlLeaf(editor, element);

  return deserializeHtmlNodeChildren(editor, element).reduce(
    (arr: Descendant[], child) => {
      if (!child) return arr;

      if (Element.isElement(child)) {
        if (Object.keys(node).length) {
          // Recursively merge a source object to children nodes with a query.
          applyDeepToNodes({
            node: child,
            source: node,
            query: {
              filter: ([n]) => Text.isText(n),
            },
            apply: mergeDeep,
          });
        }
        arr.push(child);
      } else {
        const attributes = { ...node };

        // attributes should not override child attributes
        if (child.text) {
          Object.keys(attributes).forEach((key) => {
            if (attributes[key] && child[key]) {
              attributes[key] = child[key];
            }
          });
        }

        arr.push(jsx('text', attributes, child));
      }

      return arr;
    },
    [],
  );
};

export const pipeDeserializeHtmlLeaf = (
  editor: Editor,
  element: HTMLElement,
) => {
  let node: Record<string, unknown> = {};

  [...editor['plugins']].reverse().forEach((plugin) => {
    const deserialized = pluginDeserializeHtml(editor, plugin, {
      element,
      deserializeLeaf: true,
    });
    if (!deserialized) return;

    node = { ...node, ...deserialized.node };
  });

  return node;
};

export function isObject(item) {
  return (
    item && typeof item === 'object' && !Array.isArray(item) && item !== null
  );
}

/**
 * Deep merge two objects.
 */
export function mergeDeep(target, source) {
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return target;
}

type QueryNodeOptions = {
  /**  Query the node entry. */
  filter?: (entry: NodeEntry<Node>) => boolean;
  /**  List of types that are valid. If empty or undefined - allow all. */
  allow?: string[] | string;
  /** List of types that are invalid. */
  exclude?: string[] | string;
};
export interface ApplyDeepToNodesOptions {
  /** The destination node object. */
  node: Node;
  /** The source object. Can be a factory. */
  source: Record<string, any> | (() => Record<string, any>);
  /** Function to call on each node following the query. */
  apply: (
    node: Node,
    source: Record<string, any> | (() => Record<string, any>),
  ) => void;
  /** Query to filter the nodes. */
  query?: QueryNodeOptions;
}

/**
 * Recursively apply an operation to children nodes with a query.
 */
export const applyDeepToNodes = ({
  node,
  source,
  apply,
  query,
}: ApplyDeepToNodesOptions) => {
  const entry: NodeEntry<Node> = [node, []];

  if (queryNode(entry, query)) {
    if (source instanceof Function) {
      apply(node, source());
    } else {
      apply(node, source);
    }
  }

  // if (!isAncestor(node)) return;
  if (Text.isText(node)) return;

  node.children.forEach((child: Descendant) => {
    applyDeepToNodes({ node: child, source, apply, query });
  });
};

/**
 * Query the node entry.
 */
export const queryNode = <T extends Node = Node>(
  entry?: NodeEntry<T>,
  { filter, allow, exclude }: QueryNodeOptions = {},
) => {
  if (!entry) return false;

  if (filter && !filter(entry)) {
    return false;
  }

  if (allow) {
    const allows = Array.isArray(allow) ? allow : [allow];
    if (allows.length && !allows.includes(entry[0]['type'])) {
      return false;
    }
  }

  if (exclude) {
    const excludes = Array.isArray(exclude) ? exclude : [exclude];
    if (excludes.length && excludes.includes(entry[0]['type'])) {
      return false;
    }
  }

  return true;
};
