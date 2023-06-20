import { modelNodeToVnode } from './view/render-element';
import { type Watarble } from './watarble';

/**
 * main view for watarble
 */
export class WatarView {
  watarble: Watarble;
  innerRoot: HTMLDivElement;

  constructor(options) {
    this.watarble = options.watarble;
  }

  updateView() {
    // console.trace(';; updateView ');

    const container = this.watarble.config.rendering.container;
    if (!this.innerRoot) {
      this.innerRoot = document.createElement('div');
      this.innerRoot.id = this.watarble.id;
      container.appendChild(this.innerRoot);
    }

    const newVnode = this.watarble.state.getters
      .getTableRowModel()
      .map((item) => {
        const vnode = modelNodeToVnode(item, this.watarble);
        return vnode;
      });

    this.watarble.config.rendering.renderer.render(newVnode, this.innerRoot);
  }

  destroyView() {
    this.watarble.config.rendering.renderer.reset();
    if (this.innerRoot) {
      this.innerRoot.remove();
    }
  }
}
