import { getDefaultConfig } from './config';
import { type WatarbleOptions } from './types/api';

/**
 * Controller for data model and views
 */
export class Watarble {
  config: any;

  constructor(options?: WatarbleOptions) {
    this.config = getDefaultConfig(options);

    this.state = createState({
      ...this.config,
      onStateChange: () => {
        this.view.update();
      },
    });

    this.view = new MainView(this.config);

    this.init();
  }

  init() {
    this.view.update();
    if (this.config.onChange) this.config.onChange();
  }
}
