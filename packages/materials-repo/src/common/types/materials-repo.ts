export type MaterialItem = {
  id?: number;
  length?: string;
  readAbleLength?: string;
  /** 文件名 */
  shortPath?: string;
  /** 先对仓库根目录的路径 */
  relativePath?: string;
  /** 完整的绝对路径 */
  resolvePath?: string;
  fileType?: string;
  modifyTime?: string;
  fileTypeExtension?: string;
  linkTarget?: string;
};

export type RepoDataType = {
  fileType?: string;
  length?: string;
  resolvePath?: string;
  relativePath?: string;
  files?: MaterialItem[];
};

export type PositionType = {
  x: number;
  y: number;
};
