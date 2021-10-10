import mime from 'mime-types';
import { removeTrailingSlashIfExists } from '../../utils/repo-files-link-utils';
import {
  ENABLE_MSG,
  CREATE_FILE_SUCCESS,
  CREATE_FOLDER_SUCCESS,
  DELETE_EDITOR_ITEM,
  HIDE_LIST_ITEM_ACTIONS_MENU,
  MENU_PADDING,
  REFRESH_FILES_FOR_PATH,
  REFRESH_ID,
  REMOVE_ITEM_SUCCESS,
  SET_IS_REPO_DATA_LOADED,
  UPLOAD_FILE_SUCCESS,
  LOGOUT_REPO,
  SHOW_LIST_ITEM_ACTIONS_MENU,
  RENAME_COMPLETED,
  RENAME_ITEM_SUCCESS,
  RENAME_ITEM_START,
  DISABLE_MSG,
  SET_REPO_VIEW_TYPE,
  VIEW_MATERIAL_FILE,
  SAVE_EDITOR_ITEM,
} from './constants';

export function setIsRepoDataLoaded(isLoaded: boolean) {
  return {
    type: SET_IS_REPO_DATA_LOADED,
    payload: {
      isLoaded,
    },
  };
}

export function saveEditorItem({
  relativePath,
  fileContentCache,
  editorItems,
}) {
  const newEditorItems = {
    ...editorItems,
    [relativePath]: fileContentCache,
  };

  return {
    type: SAVE_EDITOR_ITEM,
    payload: {
      editorItems: newEditorItems,
    },
  };
}

export function deleteEditorItem({ relativePath, editorItems }) {
  const newEditorItems = {
    ...editorItems,
    [relativePath]: undefined,
  };

  return {
    type: DELETE_EDITOR_ITEM,
    payload: {
      editorItems: newEditorItems,
    },
  };
}

export function openAndViewMaterialFile({
  repoViewType,
  openingFileRepo,
  openingFileType,
  openingFilename,
  openingFileMetadata,
  openingFileContentCache,
}: {
  repoViewType: string;
  openingFileRepo?: string;
  openingFileType?: string;
  openingFilename?: string;
  openingFileMetadata?: any;
  openingFileContentCache?: any;
}) {
  return {
    type: VIEW_MATERIAL_FILE,
    payload: {
      repoViewType,
      openingFileRepo,
      openingFileType,
      openingFilename,
      openingFileMetadata,
      openingFileContentCache,
    },
  };
}

export function setRepoViewType({ repoViewType }: { repoViewType: string }) {
  return {
    type: SET_REPO_VIEW_TYPE,
    payload: {
      repoViewType,
    },
  };
}

/** 在界面上移除文件或文件夹，可能对应服务端的删除或回收操作 */
export function removeItemSuccess(options) {
  const { shortPath, repoData } = options;

  const newFiles = repoData.files.filter(
    (item) => item.shortPath !== shortPath,
  );

  newFiles.forEach((item, index) => {
    // item.id = repoData.files.length - 1 - index;
    item.id = newFiles.length - 1 - index;
    if (item.fileType === 'file') {
      item.linkTarget =
        item.linkTarget.slice(0, item.linkTarget.lastIndexOf('/') + 1) +
        item.id;
    }
  });

  return {
    type: REMOVE_ITEM_SUCCESS,
    payload: {
      data: {
        ...repoData,
        files: newFiles,
      },
    },
  };
}

export function renameItemStart({ menuRelativePath }) {
  return {
    type: RENAME_ITEM_START,
    payload: {
      renameState: true,
      renameRelativePath: menuRelativePath,
      menuState: false,
      menuType: '',
      menuShortName: '',
      menuRelativePath: '',
    },
  };
}

export function renameCompleted() {
  return {
    type: RENAME_COMPLETED,
    payload: {
      renameState: false,
      renameRelativePath: '',
    },
  };
}

/** 在界面上重命名 */
export function renameItemSuccess(options) {
  const { repoData, id, oldName, newName } = options;

  const [targetFile] = repoData.files.filter((item) => item.id === id);

  const relativePath =
    targetFile.relativePath.slice(0, -oldName.length) + newName;
  targetFile.relativePath = relativePath;
  targetFile.resolvePath =
    targetFile.resolvePath.slice(0, -oldName.length) + newName;

  targetFile.shortPath = newName;
  targetFile.modifyTime = new Date().toLocaleString();

  if (targetFile.fileType === 'dir') {
    targetFile.linkTarget = `/all/${relativePath}`;
  }

  if (targetFile.fileType === 'file') {
    const fileTypeExtention = mime.lookup(newName) || 'undefined';
    targetFile.fileTypeExtention = fileTypeExtention;
    if (fileTypeExtention === 'text/html') {
      targetFile.preview = true;
      targetFile.linkPreview = `/file/${relativePath}/html/${targetFile.id}`;
    } else {
      targetFile.preview = false;
      targetFile.linkPreview = '';
    }
    const extention = fileTypeExtention.slice(
      0,
      fileTypeExtention.lastIndexOf('/'),
    );
    // targetFile.linkTarget = `/file/${relativePath}/${extention}/${targetFile.id}`;
    targetFile.linkTarget = `${relativePath}/${extention}`;
  }

  return {
    type: RENAME_ITEM_SUCCESS,
    payload: {
      renameState: false,
      data: {
        ...repoData,
      },
    },
  };
}

/** 重置数据项Id */
export function refreshId(options) {
  const { repoData } = options;

  repoData.files.forEach((item, index) => {
    item.id = repoData.files.length - 1 - index;
    if (item.fileType === 'file') {
      item.linkTarget =
        item.linkTarget.slice(0, item.linkTarget.lastIndexOf('/') + 1) +
        item.id;
    }
  });

  return {
    type: REFRESH_ID,
    payload: {
      data: {
        ...repoData,
      },
    },
  };
}

export function menuPadding() {
  return {
    type: MENU_PADDING,
    payload: {
      menuState: 'padding',
    },
  };
}

export function hideListItemActionsMenu() {
  return {
    type: HIDE_LIST_ITEM_ACTIONS_MENU,
    payload: {
      menuState: false,
      menuType: '',
      menuShortName: '',
      menuRelativePath: '',
    },
  };
}

export function showListItemActionsMenu({
  menuType,
  menuTarget,
  menuShortName,
  menuRelativePath,
  menuMaterialItem,
  x,
  y,
}: {
  menuType: string;
  menuTarget?: string;
  menuShortName: string;
  menuRelativePath: string;
  menuMaterialItem?: any;
  x: number;
  y: number;
}) {
  return {
    type: SHOW_LIST_ITEM_ACTIONS_MENU,
    payload: {
      menuState: true,
      menuType,
      menuTarget,
      menuShortName,
      menuRelativePath,
      menuMaterialItem,
      menuPosition: {
        x,
        y,
      },
    },
  };
}

/** 显示新创建的文件夹名称，这里不包含发送服务端请求的逻辑 */
export function createFolderSuccess(options) {
  const { repoData, folderName } = options;

  const relativePath = repoData.relativePath.trim()
    ? repoData.relativePath + '/' + folderName
    : folderName;

  repoData.files.unshift({
    id: repoData.files.length,
    length: '0',
    readAbleLength: '',
    fileType: 'dir',
    modifyTime: new Date().toLocaleString(),
    shortPath: folderName,
    relativePath: relativePath,
    resolvePath: repoData.resolvePath + '/' + folderName,
    linkTarget: `${relativePath}`,
  });

  return {
    type: CREATE_FOLDER_SUCCESS,
    payload: {
      data: repoData,
      renameState: true,
      renameRelativePath: relativePath,
      menuState: false,
      menuType: '',
      menuShortName: '',
      menuRelativePath: '',
    },
  };
}

/** 显示新创建的文件名称，这里不包含发送服务端请求的逻辑 */
export function createFileSuccess(options) {
  const { repoData, fileName } = options;

  const relativePath = repoData.relativePath.trim()
    ? repoData.relativePath + '/' + fileName
    : fileName;

  repoData.files.unshift({
    id: repoData.files.length,
    length: '0',
    readAbleLength: '0 B',
    fileType: 'file',
    fileTypeExtention: 'text/html',
    // modifyTime: new Date().toISOString(),
    modifyTime: new Date().toLocaleString(),
    shortPath: fileName,
    relativePath: relativePath,
    resolvePath: repoData.resolvePath + '/' + fileName,
    linkTarget: `/file/${relativePath}/text/${repoData.files.length}`,
  });

  return {
    type: CREATE_FILE_SUCCESS,
    payload: {
      data: repoData,
      renameState: true,
      renameRelativePath: relativePath,
      menuState: false,
      menuType: '',
      menuShortName: '',
      menuRelativePath: '',
    },
  };
}

export function setMsgOption(options) {
  return {
    type: SET_IS_REPO_DATA_LOADED,
    payload: {
      msgType: options.msgType,
      msgContent: options.msgContent,
      preRequestPath: options.currentRequestPath,
    },
  };
}
export function enableMsg() {
  return {
    type: ENABLE_MSG,
    payload: {
      msgState: true,
    },
  };
}

export function disableMsg() {
  return {
    type: DISABLE_MSG,
    payload: {
      msgState: false,
    },
  };
}

export function logoutRepo() {
  return {
    type: LOGOUT_REPO,
    payload: {
      currentRequestPath: '',
      currentRequestPathArr: [],
    },
  };
}

/** 上传文件成功后刷新显示的data */
export function uploadFileSuccess(options) {
  const { relativePath, files, repoData } = options;
  // console.log(
  //   ';;refresh-currentRequestPathArr, ',
  //   pathParse(options.currentRequestPath),
  // );

  const [targetFile] = files.filter(
    (item) => item.relativePath === relativePath,
  );
  console.log(';;targetFile, ', targetFile);

  targetFile.id = files.length;
  const linkTarget = targetFile.linkTarget;
  targetFile.linkTarget =
    linkTarget.slice(0, linkTarget.lastIndexOf('/') + 1) + targetFile.id;
  repoData.files.unshift(targetFile);

  return {
    type: UPLOAD_FILE_SUCCESS,
    payload: {
      isLoaded: true,
      data: {
        ...repoData,
      },
    },
  };
}

/** 更新当前路径下的所有文件信息 */
export function refreshFilesForPath(options) {
  const { repoData, currentRequestPath, sortMethod, sortFlag, menuState } =
    options;

  const currentRequestPath_ = removeTrailingSlashIfExists(currentRequestPath);

  const currentRequestPathArr = currentRequestPath_
    ? currentRequestPath_.split('/')
    : [];

  // console.log(';;ac-refresh-reqPathArr, ', currentRequestPathArr);

  if (repoData.files.length > 1) {
    // 多于1个文件才需要排序

    dataSort(repoData, sortFunc[sortMethod].bind(null, sortFlag));
  }

  return {
    type: REFRESH_FILES_FOR_PATH,
    payload: {
      isLoaded: true,
      menuState,
      currentRequestPath: currentRequestPath_,
      currentRequestPathArr,
      data: {
        ...repoData,
      },
    },
  };
}

/** 解析请求路径转换成为数组
 */
// function pathParse(path) {
//   return path.split(/(?=\/[^/]?)/);
// }

/** 对data中files数组就地排序 */
function dataSort(data, judge) {
  (data.files as any[]).sort(judge);
}

const sortFunc = {
  // 按id从大到小排序
  byId(flag, a, b) {
    if (flag) {
      return b.id - a.id;
    } else {
      return a.id - b.id;
    }
  },

  // 按修改时间排序
  byTime(flag, a, b) {
    if (flag) {
      return (
        new Date(b.modifyTime).getTime() - new Date(a.modifyTime).getTime()
      );
    } else {
      return (
        new Date(a.modifyTime).getTime() - new Date(b.modifyTime).getTime()
      );
    }
  },

  // 按文件大小排序
  bySize(flag, a, b) {
    if (flag) {
      return b.length - a.length;
    } else {
      return a.length - b.length;
    }
  },
};
