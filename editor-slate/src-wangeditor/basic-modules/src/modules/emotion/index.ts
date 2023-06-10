/**
 * @description emotion entry
 * @author wangfupeng
 */

import { type IModuleConf } from '@wangeditor/core';
import { emotionMenuConf } from './menu/index';

const emotion: Partial<IModuleConf> = {
  menus: [emotionMenuConf],
};

export default emotion;
