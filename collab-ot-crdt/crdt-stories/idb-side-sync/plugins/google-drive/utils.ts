import type { OpLogEntry } from '../../types/main';

export const LIB_NAME = 'IDBSideSync.plugins.googledrive';
export const logPrefix = '[' + LIB_NAME + ']';

export function noOp() { }
export const COUNTER_PART_STR_LENGTH = 4;

export let debug = process.env.NODE_ENV !== 'production';

export function setDebug(isEnabled: boolean) {
  debug = isEnabled === true;
}

export const log = {
  log: console.log.bind(console, logPrefix),
  debug: debug ? console.log.bind(console, logPrefix) : noOp,
  warn: console.warn.bind(console, logPrefix),
  error: console.error.bind(console, logPrefix),
};

/** 云端文件名的固定部分 */
export const FILENAME_PART = {
  clientPrefix: 'clientId:',
  clientInfoExt: '.clientinfo.json',
  messageExt: '.oplogmsg.json',
};

/** op记录在云端对应的文件名
 * - 示例 `2022-11-22T09:45:49.536Z 0000 clientId:8127f91c2048654b.oplogmsg.json`
 */
export function oplogEntryToFileName(params: {
  time: Date;
  counter: number;
  clientId: string;
  entry: OpLogEntry;
}): string {
  // Ensure filename tokens are separated by SPACES, otherwise partial-matching in `listGoogleDriveFiles()` breaks.
  // Example: `<hlc time> <counter> ${FILENAME_PART.clientPrefix}<nodeId>.${FILENAME_PART.messageExt}`
  const fileName =
    params.time.toISOString() +
    ' ' +
    ('0'.repeat(COUNTER_PART_STR_LENGTH) + params.counter).slice(
      -COUNTER_PART_STR_LENGTH,
    ) +
    ' ' +
    FILENAME_PART.clientPrefix +
    params.clientId +
    FILENAME_PART.messageExt;
  return fileName;
}

export class FileDownloadError extends Error {
  constructor(fileName: string, error: unknown) {
    super(
      `${LIB_NAME}: Error on attempt to download ${fileName}. ` +
      JSON.stringify(error),
    );
    Object.setPrototypeOf(this, FileDownloadError.prototype); // https://git.io/vHLlu
  }
}

export class FileListError extends Error {
  constructor(error: unknown) {
    super(
      `${LIB_NAME}: Error on attempt to list files: ` + JSON.stringify(error),
    );
    Object.setPrototypeOf(this, FileListError.prototype); // https://git.io/vHLlu
  }
}

export class FileUploadError extends Error {
  constructor(error: unknown) {
    super(
      `${LIB_NAME}: Error on attempt to upload file: ` + JSON.stringify(error),
    );
    Object.setPrototypeOf(this, FileUploadError.prototype); // https://git.io/vHLlu
  }
}
