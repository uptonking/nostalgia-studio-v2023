import {
  classModule,
  eventListenersModule,
  h,
  init,
  propsModule,
  styleModule,
  type VNode,
} from 'snabbdom';

const patch = init(
  [
    classModule, // makes it easy to toggle classes
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
    eventListenersModule, // attaches event listeners
  ],
  undefined,
  {
    experimental: {
      fragments: true,
    },
  },
);

let oldVnode = null;

export function renderVdom(
  vnode: VNode[],
  container: HTMLElement,
  fullReload = false,
) {
  const containerVnode = h('div#' + container.id);
  containerVnode.children = vnode;

  if (!oldVnode) {
    // / if it's the first render or force reload
    // console.log(';; patch  ', containerVnode)
    patch(container, containerVnode);
  } else {
    patch(oldVnode, containerVnode);
  }

  oldVnode = containerVnode;
}
