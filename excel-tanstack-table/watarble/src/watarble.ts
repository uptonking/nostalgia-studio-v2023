import { initConfig } from './config';
import { registerInstance } from './instances';
import { WatarState } from './state';
import { type WatarbleConfig, type WatarbleOptions } from './types';
import { WatarView } from './watar-view';

/**
 * Controller for data model and views
 */
export class Watarble {
  /** unique id for instance, prefixed with `WTBL_` */
  id: string;
  config: WatarbleConfig;
  state: WatarState;
  view: WatarView;

  constructor(options?: WatarbleOptions) {
    this.id = registerInstance(this, options?.id);
    this.config = initConfig({ ...options, id: this.id });
    const {
      rendering,
      renderer,
      container,
      classNames,
      components,
      ...stateOptions
    } = this.config;

    this.state = new WatarState({
      ...stateOptions,
      id: this.id,
    });

    this.view = new WatarView({
      watarble: this,
    });

    this.init();
  }

  init() {
    // trigger first render
    this.view.updateView();
    if (this.config.onChange) this.config.onChange();

    this.state.on('STATE_UPDATE', () => {
      // console.log(';; beforeViewUp ', this.state.table.getState());
      this.view.updateView();
    });
  }

  destroy() {
    this.view.destroyView();
  }
}
