import type { RoutesConfigType } from './../../../config/routes-test';
import routesAtlaskitConfig from '../../../config/routes-miniapp-atlaskit';
import type {
  PositionType,
  RepoDataType,
} from '../../common/types/materials-repo';
import * as actionsToHandle from './constants';
import type { ReactNode } from 'react';

export type RepoStateType = {
  // -------- 系统级不常变化的配置项属性 -------

  /** 新建文件夹的默认名称 */
  newFolderName?: string;
  newFilename?: string;
  newFilenameSuffix?: string;

  // -------- 每个仓库都可变的配置项属性 -------

  /** 当前展示的资料库名称 */
  repoName?: string;
  /** 是否显示文件模式
   * @deprecated 建议使用repoViewType
   */
  fileModel?: boolean;
  /** 会显示在文件管理器的位置的视图类型，默认就是文件管理器 */
  repoViewType?: 'file-manager' | 'file-viewer';
  /** 当前打开文件的类型 */
  // materialFileType?: '' | 'text' | 'markdown' | 'mdx' | 'jsx';
  openingFileType?: string;
  /** 当前打开的文件名 */
  openingFilename?: string;
  openingFileRepo?: string;
  openingFileMetadata?: any;
  openingFileContentCache?: any;
  /** 文件模式显示类型 */
  fileModelType?: 'table' | 'block';
  /** 过滤文件名 */
  filterName?: string;
  /** 是否显示echarts模式 */
  echartsModel?: boolean;
  /** echarts显示模式 */
  echartsModelType?: 'pie' | 'bar';
  /** 显示回收站模式 */
  recoverModel?: boolean;
  /** 总空间允许大小 */
  allowSize?: number;
  /** 已用空间大小 */
  totalSize?: number;
  /** 信息组件状态 */
  msgState?: boolean | 'padding';
  /** 信息类型 */
  msgType?: string;
  /** 信息组件内容 */
  msgContent?: string;
  /** 当前请求路径 */
  currentRequestPath?: string;
  /** 当前请求路径的数组 */
  currentRequestPathArr?: string[];
  /** 前一个请求路径 */
  preRequestPath?: string;
  /** 菜单组件状态 */
  menuState?: boolean;
  /** 菜单元素对应文件链接 */
  menuTarget?: string;
  /** 菜单组件位置 */
  menuPosition?: PositionType;
  /** 触发菜单组件的类型 */
  menuType?: string;
  /** 上下文菜单组件对应相对路径 */
  menuRelativePath?: string;
  /** 上下文菜单组件对应名称 */
  menuShortName?: string;
  menuMaterialItem?: object;
  /** 重命名状态 */
  renameState?: boolean;
  /** 重命名相对路径 */
  renameRelativePath?: string;
  /** 复制文件名状态 */
  copyFileState?: boolean;
  /** 复制文件名 */
  copyShortName?: string;
  /** 复制文件相对路径 */
  copyFileRelativePath?: string;
  /** 复制文件所在文件夹 */
  copyFileAtDirRelativePath?: string;
  /** 是否加载完成 */
  isLoaded?: boolean;
  /** 存放最近编辑文件的内容，作为缓存，会发送到服务端或直接丢弃 */
  editorItems?: Record<string, unknown>;
  /** 可编辑保存大小 */
  editableLength?: number;
  /** 当前path路径下所有直接子文件和子文件夹的信息 */
  data?: RepoDataType;
  /** 数据排序 */
  sortFlag?: boolean;
  /** 排序依据 */
  sortMethod?: 'byId' | 'byTime' | 'byName';
};

export function getRepoInitialState(): RepoStateType {
  return {
    newFolderName: '新建文件夹',
    newFilename: '新建文本文档',
    newFilenameSuffix: '.txt',

    openingFileRepo: '',
    openingFileType: '',
    openingFilename: '',
    openingFileMetadata: null,
    openingFileContentCache: null,

    repoName: 'ak',
    fileModel: true,
    repoViewType: 'file-manager',
    fileModelType: 'table',
    filterName: 'filterDefault',
    echartsModel: false,
    echartsModelType: 'pie',
    recoverModel: false,
    allowSize: 1000000000,
    totalSize: 0,
    msgState: false,
    msgType: '',

    msgContent: '',
    // 用来占位，初始不能为空字符串
    currentRequestPath: '/repo',
    // currentRequestPath: '',
    currentRequestPathArr: [],
    preRequestPath: '',
    menuState: false,
    menuTarget: '',
    menuPosition: { x: 0, y: 0 },
    menuType: '',
    menuRelativePath: '',
    menuShortName: '',
    renameState: false,
    renameRelativePath: '',
    copyFileState: false,
    copyShortName: '',
    copyFileRelativePath: '',
    copyFileAtDirRelativePath: '',
    isLoaded: false,
    editorItems: {},
    editableLength: 5000000,
    sortFlag: true,
    sortMethod: 'byId',
    data: null,
    // {
    // length: '394229',
    // resolvePath:
    //   '/home/yaoo/Documents/repo/endfront/dashboard/all-dashboard-foundation/file-manager/node/root/1fdorh721',
    // relativePath: '',
    // fileType: 'dir',
    // files: [
    // {
    //   id: 3,
    //   length: '8222',
    //   resolvePath:
    //     '/home/yaoo/Documents/repo/endfront/dashboard/all-dashboard-foundation/file-manager/node/root/1fdorh721/01files',
    //   readAbleLength: '8.22 kB',
    //   shortPath: '01files',
    //   relativePath: '01files',
    //   fileType: 'dir',
    //   modifyTime: '8/25/2021, 12:44:07 AM',
    //   fileTypeExtension: 'undefined',
    //   linkTarget: '/all/01files',
    // },
    // {
    //   id: 2,
    //   length: '9',
    //   resolvePath:
    //     '/home/yaoo/Documents/repo/endfront/dashboard/all-dashboard-foundation/file-manager/node/root/1fdorh721/test.md',
    //   readAbleLength: '9 B',
    //   shortPath: 'test.md',
    //   relativePath: 'test.md',
    //   fileType: 'file',
    //   modifyTime: '8/23/2021, 2:39:20 PM',
    //   fileTypeExtension: 'text/markdown',
    //   linkTarget: '/file/test.md/text/2',
    // },
    // ],
    // },
  };
}

export function repoReducer(
  state = getRepoInitialState(),
  action,
): RepoStateType {
  // let newState;

  for (const actionName in actionsToHandle) {
    if (actionsToHandle[actionName] === action.type) {
      console.log(';;action-ing-repo, ', action.type);
      return {
        ...state,
        ...action.payload,
      };
    }
  }

  // console.log(';;返回旧的 repoState ');

  return state;
}

export default repoReducer;
