import { type Command } from '../../types';
import { makeRandomColor } from '../../utils/helpers';
import { CorePlugin } from '../plugin-core';

export class BorderPlugin extends CorePlugin {
  static pluginKey = 'WTBL_BORDER';

  static getters = ['getOutlineBorderColor'] as const;

  private outlineBorderColor: string = '#000';

  handle(cmd: Command) {
    switch (cmd.type) {
      case 'SET_OUTLINE_BORDER_COLOR':
        this.setOutlineBorderColor(cmd.color);
        break;
    }
  }

  getOutlineBorderColor() {
    return this.outlineBorderColor;
  }

  private setOutlineBorderColor(value?: string) {
    this.history.update('outlineBorderColor', value || makeRandomColor());
    // console.log(';; setBorder2 ', this.outlineBorderColor);
  }
}
