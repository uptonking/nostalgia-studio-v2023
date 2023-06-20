import {
  classModule,
  eventListenersModule,
  h,
  init,
  propsModule,
  styleModule,
  type VNode,
} from 'snabbdom';

import { type VdomRendererSpec } from '../types';

const patch = init(
  [classModule, propsModule, styleModule, eventListenersModule],
  undefined,
  {
    experimental: {
      fragments: true,
    },
  },
);

export class VdomRendererDefault implements VdomRendererSpec {
  private oldVnode: VNode = null;

  render(vnode: VNode[], container: HTMLElement, fullReload = false) {
    // should be consistent with MainView.updateView
    const containerVnode = h('div#' + container.id);
    containerVnode.children = vnode;

    if (fullReload) {
      this.oldVnode = null;
    }
    // console.log(';; patch  ', containerVnode, this.oldVnode);

    if (!this.oldVnode) {
      // / if it's the first render or force reload
      patch(container, containerVnode);
    } else {
      patch(this.oldVnode, containerVnode);
    }

    this.oldVnode = containerVnode;
  }

  reset() {
    this.oldVnode = null;
  }
}
