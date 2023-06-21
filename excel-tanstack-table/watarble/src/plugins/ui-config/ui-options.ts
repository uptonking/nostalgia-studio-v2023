import { type Command } from '../../types';
import { UiPlugin } from '../plugin-ui';

export class UiOptionsPlugin extends UiPlugin {
  static pluginKey = 'WTBL_UI_OPTIONS';

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
