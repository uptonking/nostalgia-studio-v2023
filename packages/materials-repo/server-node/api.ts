import fs from 'fs';
import path from 'path';
import express from 'express';

import { MyReadable as MyReadAbleStream } from './lib/readAbleStream';
import { getFolder, getFolderSize } from './lib/getFolder';
import { moveItem as moveItemByPath } from './lib/moveItem';
import { deleteItem as deleteItemByPath } from './lib/deleteItem';
import { renameItemByPath } from './lib/renameItem';
import { createFileByPath } from './lib/createFile';
import { copyFileByPath } from './lib/copyFile';
import { createFolderByPath } from './lib/createFolder';
import { getLengthByNumber, getLengthByPath } from './lib/tools';

// 存放websocket映射的对象
const wsToMap = {};

const getCurrentFolder = express();
const getRecoverFolder = express();
const getCurrentFileByPost = express();
const getCurrentFileByGet = express();
const getCurrentFileSize = express();
const submitFileContents = express();
const uploadFile = express();
const deleteItem = express();
const renameItem = express();
const recoverItem = express();
const createFile = express();
const copyFile = express();
const createFolder = express();
const downloadFile = express();

// 使用websocket获取根文件夹大小
async function sendRootFolderSize(ws, req) {
  const re = await getFolderSize(req.rootFolder);
  ws.send(re);
}

// 请求指定文件夹
getCurrentFolder.use(async (req: any, res, next) => {
  console.log(';;/repo/data, rootFolder, ', req.rootFolder);
  console.log(';;/repo/data, getCurrentFolder-body, ', req.body);

  const currentPath = path.join(
    req.rootFolder,
    req.body.repoName,
    req.body.requestPath,
  );
  console.log(';;currentPath, ', currentPath);

  try {
    const data = await getFolder(
      path.join(req.rootFolder, req.body.repoName),
      currentPath,
    );
    // console.log(';;currentPath-data, ', data);
    console.log(';;currentPath-data ');

    res.json({ code: 0, state: data });
  } catch (e) {
    console.log(e);
    res.json({
      code: -1,
      state: `getCurrentFolder failed: 文件夹 ${currentPath} 不存在`,
    });
  }
  try {
    await sendRootFolderSize(wsToMap[req.user.username], req);
  } catch (e) {}
});

// 请求回收站中文件
getRecoverFolder.use(async (req: any, res, next) => {
  try {
    const data = await getFolder(req.recoverFolder, req.recoverFolder);
    res.json({ code: 0, state: data });
  } catch (e) {
    console.log(e);
    res.json({ code: -1, state: 'fail' });
  }
});

// 请求单个文件的内容
getCurrentFileByPost.use(async (req: any, res, next) => {
  const currentPath = path.join(
    req.rootFolder,
    req.body.repoName,
    req.body.requestPath,
  );
  console.log('正在获取文件内容: ', currentPath);

  try {
    res.sendFile(currentPath);
  } catch (e) {
    console.log(e);
    res.json({ code: -1, state: `请求文件内容失败: ${currentPath}` });
  }
});

getCurrentFileByGet.use(async (req: any, res, next) => {
  const currentPath = path.join(req.rootFolder, req.path);
  console.log('获取文件: ', currentPath);

  try {
    res.sendFile(currentPath);
  } catch (e) {
    console.log(e);
    res.json({ code: -1, state: 'fail' });
  }
});

// 获取文件更新后的大小
getCurrentFileSize.use(async (req: any, res, next) => {
  const currentFile = path.resolve(req.rootFolder, req.body.relativePath);
  console.log('获取文件大小: ', currentFile);
  try {
    const length = await getLengthByPath(currentFile);
    res.json({
      code: 0,
      state: {
        length: length,
        readAbleLength: getLengthByNumber(length),
      },
    });
  } catch (e) {
    console.log(e);
    res.json({
      code: -1,
      state: 'fail',
    });
  }
});

// 更新文件内容
submitFileContents.use(async (req: any, res, next) => {
  console.log(';;submitFileContents, ', req.body);

  const currentFile = path.resolve(
    req.rootFolder,
    req.body.repoName,
    req.body.relativePath,
  );
  console.log('正在提交文件更改: ', currentFile);

  const content = req.body.newContent;

  let index = 0;

  const mStream = new MyReadAbleStream({
    highWaterMark: 512,
    read() {
      if (index < content.length) {
        this.push(
          content.slice(
            index,
            index + 100 < content.length ? index + 100 : content.length,
          ),
        );
        index += 100;
      } else {
        this.push(null);
      }
    },
  });

  mStream.pipe(fs.createWriteStream(currentFile));
  mStream.on('end', () => {
    console.log('修改文件成功: ', currentFile);
    res.json({
      code: 0,
      state: `修改文件成功: ${currentFile}`,
    });
  });
  mStream.on('error', (err) => {
    console.log('修改文件失败: ', currentFile, err);
    res.json({
      code: -1,
      state: `修改文件失败: ${currentFile}`,
    });
  });
  try {
    await sendRootFolderSize(wsToMap[req.user.username], req);
  } catch (e) {}
});

// 上传文件，~~总空间最大支持？gb，单文件最大支持？mb~~
uploadFile.use(async (req: any, res, next) => {
  // 获取上传的文件,将其移动到指定文件夹
  const targetFolder = path.resolve(
    req.rootFolder,
    req.body.repoName,
    req.body.uploadFolder,
  );
  console.log(';;uploadFile-req.rootFolder, ', req.rootFolder);
  // console.log(';;uploadFile-req.body, ', req.body);
  console.log(';;uploadFile-targetFolder, ', targetFolder);

  let rootFolderSize;
  try {
    // 获取根文件夹大小，测试时总空间最大为100M
    rootFolderSize = await getFolderSize(req.rootFolder);
    if (Number(rootFolderSize) + req.file.size > 100000000) {
      res.json({
        code: -1,
        state: `资料库 ${req.body.repoName} 总空间超出限制`,
      });
      throw new Error(`资料库 ${req.body.repoName} 总空间超出限制`);
    }

    // 移动文件
    await moveItemByPath(req.file.filename, req.file.destination, targetFolder);

    // 重命名
    await renameItemByPath(
      targetFolder,
      req.file.filename,
      req.file.originalname,
    );

    res.json({ code: 0, state: '上传文件 success' });
  } catch (e) {
    console.log(e);
    // 尝试删除上传的文件
    try {
      await deleteItemByPath(req.recoverDir, {
        type: 'file',
        path: req.file.path,
      });
    } catch (e) {}
    try {
      await deleteItemByPath(targetFolder, {
        type: 'file',
        path: path.resolve(targetFolder, req.file.filename),
      });
    } catch (e) {}
    res.json({ code: -1, state: '上传文件 failed' });
  }
  try {
    wsToMap[req.user.username].send(Number(rootFolderSize) + req.file.size);
  } catch (e) {}
});

// 删除文件/文件夹
deleteItem.use(async (req: any, res, next) => {
  const currentFiles = req.body.files;
  const baseDir = path.resolve(req.rootFolder, req.body.repoName);
  console.log('删除文件或文件夹: ', baseDir, currentFiles);

  try {
    await Promise.all(currentFiles.map((it) => deleteItemByPath(baseDir, it)));
    res.json({ code: 0, state: 'success' });
  } catch (e) {
    console.log(e);
    res.json({ code: -1, state: 'fail' });
  }
  try {
    await sendRootFolderSize(wsToMap[req.user.username], req);
  } catch (e) {}
});

// 重命名文件/文件夹
renameItem.use(async (req: any, res, next) => {
  const srcResolvePath = path.resolve(
    req.rootFolder,
    req.body.repoName,
    req.body.relativePath,
  );
  const oldName = req.body.oldName;
  const newName = req.body.newName;
  console.log(
    '在',
    srcResolvePath,
    '文件夹中重命名文件: ',
    oldName,
    ' -> ',
    newName,
  );

  try {
    await renameItemByPath(srcResolvePath, oldName, newName);
    res.json({ code: 0, state: 'rename success' });
  } catch (e) {
    console.log(e);
    res.json({ code: -1, state: 'rename fail' });
  }
});

// 回收文件/文件夹
recoverItem.use(async (req: any, res, next) => {
  const shortName = req.body.shortName;
  const srcResolveDir = path.resolve(req.rootFolder, req.body.srcRelativePath);
  const targetResolveDir = path.resolve(req.rootFolder, req.recoverFolder);
  console.log(
    '在文件夹',
    req.body.srcRelativePath,
    '中,将: ',
    shortName,
    '移动到回收站中',
  );
  try {
    await moveItemByPath(shortName, srcResolveDir, targetResolveDir);
    res.json({ code: 0, state: 'success' });
  } catch (e) {
    console.log(e);
    res.json({ code: -1, state: 'fail' });
  }
  try {
    await sendRootFolderSize(wsToMap[req.user.username], req);
  } catch (e) {}
});

// 新建文件
createFile.use(async (req: any, res, next) => {
  const currentPath = path.resolve(
    req.rootFolder,
    req.body.repoName,
    req.body.relativePath || '',
    req.body.fileName,
  );
  console.log('将要创建文件: ', currentPath);

  try {
    await createFileByPath(currentPath);
    res.json({ code: 0, state: 'createFile success' });
  } catch (e) {
    console.log(e);
    res.json({ code: -1, state: 'createFile failed' });
  }
  try {
    await sendRootFolderSize(wsToMap[req.user.username], req);
  } catch (e) {}
});

// 复制文件
copyFile.use(async (req: any, res, next) => {
  const fileName = req.body.fileName;
  const srcResolvePath = path.resolve(req.rootFolder, req.body.srcRelativePath);
  const targetResolvePath = path.resolve(
    req.rootFolder,
    req.body.targetRelativePath,
  );
  console.log(
    fileName,
    '将要复制,从 ',
    srcResolvePath,
    '到',
    targetResolvePath,
  );
  let re;
  try {
    await copyFileByPath(fileName, srcResolvePath, targetResolvePath);
    // 获取根文件夹大小
    re = await getFolderSize(req.rootFolder);
    if (re > 1000000000) {
      throw new Error('超出空间限制');
    }
    res.json({ code: 0, state: 'success' });
  } catch (e) {
    console.log(e);
    // 尝试删除复制的文件
    try {
      await deleteItemByPath(targetResolvePath, {
        type: 'file',
        path: fileName,
      });
    } catch (e) {}
    res.json({ code: -1, state: 'fail' });
  }
  try {
    wsToMap[req.user.username].send(re);
  } catch (e) {}
});

// 创建文件夹
createFolder.use(async (req: any, res, next) => {
  const currentPath = path.resolve(
    req.rootFolder,
    req.body.repoName,
    req.body.relativePath || '',
    req.body.folderName,
  );
  console.log('将要创建文件夹: ', currentPath);

  try {
    await createFolderByPath(currentPath);
    res.json({ code: 0, state: '创建文件夹成功' });
  } catch (e) {
    console.log(e);
    res.json({ code: -1, state: '创建文件夹失败' });
  }
  try {
    await sendRootFolderSize(wsToMap[req.user.username], req);
  } catch (e) {}
});

// 下载文件
downloadFile.use(async (req: any, res, next) => {
  const currentFile = path.resolve(
    req.rootFolder,
    req.body.repoName,
    req.body.relativePath,
  );
  console.log('将要下载文件: ', currentFile, '文件名: ', req.body.fileName);
  try {
    // res.setHeader(
    //   "Content-disposition",
    //   "attachment; fileName=" + encodeURIComponent(req.body.fileName)
    // );
    // res.setHeader("Content-type", mime.lookup(req.body.fileName));
    // res.contentType("application/octet-stream");
    // res.sendFile(currentFile);

    res.download(currentFile);
  } catch (e) {
    console.log(e);
    res.json({
      code: -1,
      state: `download file failed: ${currentFile}`,
    });
  }
});

export {
  getCurrentFolder,
  getRecoverFolder,
  getCurrentFileByPost,
  getCurrentFileByGet,
  getCurrentFileSize,
  submitFileContents,
  uploadFile,
  deleteItem,
  renameItem,
  recoverItem,
  createFile,
  copyFile,
  createFolder,
  downloadFile,
  wsToMap,
  getFolderSize,
  sendRootFolderSize,
};
