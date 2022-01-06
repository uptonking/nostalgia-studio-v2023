import type { Atom } from '../core';
import { marks } from './mark';
import { nodes } from './node';

export * from './node';
export * from './mark';
export * from './supported-keys';

type Cls = new (...args: unknown[]) => unknown;
type ConstructorOf<T> = T extends InstanceType<infer U> ? U : T;

/** 扩展js的数组 */
class NodeList<T extends Atom = Atom> extends Array<T> {
  /** 覆盖数组Array种的元素 */
  configure<U extends ConstructorOf<T>>(
    Target: U,
    config: ConstructorParameters<U>[0],
  ): this {
    const index = this.findIndex((x) => x.constructor === Target);
    if (index < 0) return this;

    this.splice(index, 1, new (Target as Cls & U)(config));

    return this;
  }

  static create<T extends Atom = Atom>(from: T[]): NodeList {
    return new NodeList(...from);
  }
}

/** schema.nodes/marks中每种节点相关配置的集合，注意每个对象都是Atom的子类 */
export const commonmark = NodeList.create([...nodes, ...marks]);
