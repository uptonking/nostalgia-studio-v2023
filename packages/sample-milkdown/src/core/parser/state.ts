import type { MarkType, NodeType, Schema } from 'prosemirror-model';
import type { RemarkOptions } from 'remark';
import type { Processor } from 'unified';
import type { Node as MarkdownNode } from 'unist';

import type { Stack } from './stack';
import type { Attrs, InnerParserSpecMap, ParserSpecWithType } from '.';

/** parser state is used to generate the prosemirror node,
it provides several useful methods to make the transformation pretty simple.  */
export class State {
  private readonly stack: Stack;
  public readonly schema: Schema;
  private readonly specMap: InnerParserSpecMap;

  constructor(stack: Stack, schema: Schema, specMap: InnerParserSpecMap) {
    this.stack = stack;
    this.schema = schema;
    this.specMap = specMap;
  }

  /** 查找node对应的各种声明和配置信息，其中包含转换方法 */
  #matchTarget(node: MarkdownNode): ParserSpecWithType & { key: string } {
    const result = Object.entries(this.specMap)
      .map(([key, spec]) => ({
        key,
        ...spec,
      }))
      .find((x) => x.match(node));

    if (!result) throw new Error();

    return result;
  }

  /** 先区分nodes和marks类型，再执行插件中定义的runner方法，runner方法示例如下
   * runner: (state, node) => { state.openNode('blockquote').next(node.content).closeNode(); },
   */
  #runNode(node: MarkdownNode) {
    const { key, runner, is } = this.#matchTarget(node);

    const proseType: NodeType | MarkType =
      this.schema[is === 'node' ? 'nodes' : 'marks'][key];

    runner(this, node, proseType as NodeType & MarkType);
  }

  /** 实际执行remark.parse()方法，采用递归方式 */
  run = (remark: Processor<RemarkOptions>, markdown: string) => {
    const tree = remark.parse(markdown);

    this.next(tree);

    return this;
  };

  injectRoot = (node: MarkdownNode, nodeType: NodeType, attrs?: Attrs) => {
    this.stack.openNode(nodeType, attrs);
    this.next(node.children as MarkdownNode[]);

    return this;
  };

  addText = (text = '') => {
    this.stack.addText((marks) => this.schema.text(text, marks));
    return this;
  };

  addNode = (...args: Parameters<Stack['addNode']>) => {
    this.stack.addNode(...args);
    return this;
  };

  openNode = (...args: Parameters<Stack['openNode']>) => {
    this.stack.openNode(...args);
    return this;
  };

  closeNode = (...args: Parameters<Stack['closeNode']>) => {
    this.stack.closeNode(...args);
    return this;
  };

  openMark = (...args: Parameters<Stack['openMark']>) => {
    this.stack.openMark(...args);
    return this;
  };

  closeMark = (...args: Parameters<Stack['closeMark']>) => {
    this.stack.closeMark(...args);
    return this;
  };

  toDoc = () => this.stack.build();

  /** 将参数中所有项，依次执行this.#runNode(node); */
  next = (nodes: MarkdownNode | MarkdownNode[] = []) => {
    if (Array.isArray(nodes)) {
      nodes.forEach((node) => this.#runNode(node));
    } else {
      this.#runNode(nodes);
    }
    return this;
  };
}
