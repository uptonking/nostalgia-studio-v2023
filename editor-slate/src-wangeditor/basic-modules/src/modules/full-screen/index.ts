/**
 * @description 全屏
 * @author wangfupeng
 */

import { type IModuleConf } from '@wangeditor/core';
import { fullScreenConf } from './menu/index';

const fullScreen: Partial<IModuleConf> = {
  menus: [fullScreenConf],
};

export default fullScreen;
