import mime from 'mime-types';

/** 根据文件名的后缀，返回对应的资料类型 */
export function getMaterialFileTypeByFilename(filename: string): string {
  /** 本系统支持的后缀及对对应的资料类型 */
  const supportedMaterialTypes = {
    md: 'markdown',
    markdown: 'markdown',
    rmd: 'markdown',
    mdx: 'mdx',
    txt: 'text',
  };

  const filenameArr = filename.split('.');

  if (filenameArr.length > 1) {
    const materialType =
      supportedMaterialTypes[filenameArr[filenameArr.length - 1]];
    if (materialType) {
      return materialType;
    }
  }

  // 若文件名不包含.号，或文件类型不支持
  return 'unsupported';
}

/** 移除字符串末尾的/ */
export function removeTrailingSlashIfExists(str: string) {
  if (str.length < 1 || !str.endsWith('/')) {
    return str;
  }

  return str.slice(0, -1);
}

/** 根据路径返回当前请求的路径，如 /pages/admin/ak/app/a.md > a.md */
export function getRelativePathFromPagePathname(pathname: string) {
  const path = removeTrailingSlashIfExists(pathname);

  // 将类似 '/pages/admin/ak/app' 拆成5部分  ['', 'pages', 'admin', 'ak', 'app']
  const pathArr = path.split('/');

  // 默认为repo根目录
  let resultPath = '';

  if (pathArr.length > 5) {
    resultPath = pathArr.slice(5).join('/');
  }

  return resultPath;
}

/** 根据路径返回当前请求的路径，如 /admin/ak/repo/a > a */
export function getRelativePathFromRepoPathname(pathname: string) {
  const path = removeTrailingSlashIfExists(pathname);

  // 将类似 '/admin/ak/repo' 拆成4部分  ['', 'admin', 'ak', 'repo']
  const pathArr = path.split('/');

  // 默认为repo根目录
  let resultPath = '';

  if (pathArr.length > 4) {
    resultPath = pathArr.slice(4).join('/');
  }

  return resultPath;
}

/**
 * 新建重复名称的文件夹时，会自动加上数字后缀，如新建文件夹1、新建文件夹2... ;
 */
export function generateNewFolderName({
  data,
  newFolderName = '新建文件夹',
  newType = 'dir',
}: {
  data: any;
  newFolderName?: string;
  newType?: string;
}) {
  let numericSuffixInNames = [];

  if (data.files.length === 0) {
    numericSuffixInNames = [-1];
  }

  if (data.files.length) {
    numericSuffixInNames = data.files.map((item) => {
      const folderName: string = item.shortPath;

      // 不能存在同名文件或文件夹
      if (folderName === newFolderName) return 0;

      if (item.fileType === newType && folderName.startsWith(newFolderName)) {
        const numericSuffix = folderName.substr(newFolderName.length);

        if (/^\+?\d+$/.test(numericSuffix)) {
          return Number(numericSuffix);
        }
      }

      // 不包含默认名称的情况
      return -1;
    });
  }

  const maxIndex = Math.max(...numericSuffixInNames);

  // 对应没有名称为 新建文件夹 的情况
  if (maxIndex === -1) {
    return newFolderName;
  }

  return newFolderName + (maxIndex + 1);
}

/** 新建重复名称的文件时，会自动加上数字后缀，如新建文本文件1.txt、新建文本文件2.txt... ;
 * todo 暂时只处理了后缀为.txt的情况
 */
export function generateNewFileName({
  data,
  newFileName = '新建文本文件',
  newFileNameSuffix = '.txt',
  newType = 'file',
}: {
  data: any;
  newFileName?: string;
  /** 后缀不要包含空白字符 */
  newFileNameSuffix?: string;
  newType?: string;
}) {
  let numericSuffixInNames = [];

  if (data.files.length === 0) {
    numericSuffixInNames = [-1];
  }

  if (data.files.length) {
    numericSuffixInNames = data.files.map((item) => {
      const fileName: string = item.shortPath;
      // 不能存在同名文件或文件夹
      if (
        fileName === newFileName ||
        fileName === newFileName + newFileNameSuffix
      ) {
        return 0;
      }

      if (fileName.startsWith(newFileName)) {
        const numericSuffix = newFileNameSuffix
          ? fileName.slice(newFileName.length, -newFileNameSuffix.length)
          : fileName.substr(newFileName.length);

        if (item.fileType === newType && /^\+?\d+$/.test(numericSuffix)) {
          return Number(numericSuffix);
        }
      }

      // 不包含默认名称的情况
      return -1;
    });
  }
  const maxIndex = Math.max(...numericSuffixInNames);

  // 对应没有名称为 新建文本文件 的情况
  if (maxIndex === -1) {
    return newFileName + newFileNameSuffix;
  }

  return newFileName + (maxIndex + 1) + newFileNameSuffix;
}

/**
 * 通过immutable的方式修改参数中的文件数组，返回新数组
 */
export function addExtAndLinkToFiles(files: any[]) {
  return files.map((item) => {
    // 添加fileTypeExtension新属性到元数据
    const fileTypeExtension: string =
      mime.lookup(item.shortPath) || 'undefined';

    // 添加linkTarget新属性到元数据
    let linkTarget: string;

    if (item.fileType === 'file') {
      // /若是文件

      const extension = fileTypeExtension.slice(
        0,
        fileTypeExtension.lastIndexOf('/'),
      );

      if (fileTypeExtension === 'text/html') {
        item['preview'] = true;
        item['linkPreview'] = `/file/${item.relativePath}/html/${item.id}`;
      }

      // linkTarget = `file/${item.relativePath}/${extension}/${item.id}`;
      linkTarget = `${item.relativePath}`;
    } else {
      // /若是文件夹

      //  linkTarget = `/all/${it.relativePath}`;
      linkTarget = `${item.relativePath}`;
    }

    return {
      ...item,
      fileTypeExtension,
      linkTarget,
    };
  });
}
