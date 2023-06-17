import { h } from 'snabbdom';

/** default renderer, support Comp as plain value or reactElement
 * - https://github.com/tanstack/table/blob/main/packages/react-table/src/index.tsx
 */
export function customRender<TProps extends object>(Comp, props: TProps) {
  // console.log(';; cell ', isReactComponent<TProps>(Comp), Comp);

  if (!Comp) return null;

  if (isReactComponent<TProps>(Comp)) {
    // todo how to transiple react components to vnode
    // <Comp {...props} />
    Comp = Comp({ ...props });
  }

  if (['string', 'number'].includes(typeof Comp)) {
    return h('div', Comp + '');
  }

  return Comp;
}

function isReactComponent<TProps>(component: unknown) {
  return (
    isClassComponent(component) ||
    typeof component === 'function' ||
    isExoticComponent(component)
  );
}

function isClassComponent(component: any) {
  return (
    typeof component === 'function' &&
    (() => {
      const proto = Object.getPrototypeOf(component);
      return proto.prototype && proto.prototype.isReactComponent;
    })()
  );
}

function isExoticComponent(component: any) {
  return (
    typeof component === 'object' &&
    typeof component.$$typeof === 'symbol' &&
    ['react.memo', 'react.forward_ref'].includes(component.$$typeof.description)
  );
}
