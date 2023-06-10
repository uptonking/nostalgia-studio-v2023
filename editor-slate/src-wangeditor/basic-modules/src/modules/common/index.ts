/**
 * @description common module
 * @author wangfupeng
 */
import { type IModuleConf } from '@wangeditor/core';
import { enterMenuConf } from './menu/index';

const commonModule: Partial<IModuleConf> = {
  menus: [enterMenuConf],
};

export default commonModule;
