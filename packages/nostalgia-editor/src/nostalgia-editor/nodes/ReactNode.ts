import Node from './Node';

/** component方法会返回一个react元素，此类只用来作为类型，没有实现子类，**最终会被擦除** */
export default abstract class ReactNode extends Node {
  abstract component({
    node,
    isSelected,
    isEditable,
    innerRef,
  }): React.ReactElement;
}
