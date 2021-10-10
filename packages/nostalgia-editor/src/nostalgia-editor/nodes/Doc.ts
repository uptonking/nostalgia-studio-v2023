import Node from './Node';

/** 默认的topNodeType，block+ */
export default class Doc extends Node {
  get name() {
    return 'doc';
  }

  get schema() {
    return {
      content: 'block+',
    };
  }
}
