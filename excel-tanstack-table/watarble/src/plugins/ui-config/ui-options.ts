import { type Command } from '../../types';
import { UIPlugin } from '../plugin-ui';

export class UIOptionsPlugin extends UIPlugin {
  static getters = ['shouldShowToolbar'] as const;
  private showToolbar: boolean = true;

  handle(cmd: Command) {
    switch (cmd.type) {
      case 'SET_TOOLBAR_VISIBILITY':
        this.showToolbar = cmd.show;
        break;
    }
  }

  shouldShowToolbar(): boolean {
    return this.showToolbar;
  }
}
