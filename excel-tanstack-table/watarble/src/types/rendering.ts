import { type VNode } from 'snabbdom';

/** render vdom, custom renderer should implements this */
export interface VdomRendererSpec {
  render: (
    vnode: VNode[],
    container: HTMLElement,
    fullReload?: boolean,
  ) => void;
  /** cleanup old vnode */
  reset: () => void;
}

export interface RenderingContext {
  ctx: any;
  // dpr: number;
  // thinLineWidth: number;
}
