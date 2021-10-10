import { existsSync, mkdirSync } from 'fs';
import http from 'http';
import path from 'path';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import multer from 'multer';
import { open as sqliteOpen } from 'sqlite';
import sqlite3 from 'sqlite3';
import svgCaptcha from 'svg-captcha';
import WebSocket from 'ws';

import globalSettings from '../config/defaultSettings';
import {
  copyFile,
  createFile,
  createFolder,
  deleteItem,
  downloadFile,
  getCurrentFileByGet,
  getCurrentFileByPost,
  getCurrentFolder,
  getRecoverFolder,
  recoverItem,
  renameItem,
  sendRootFolderSize,
  submitFileContents,
  uploadFile,
  wsToMap,
} from './api';
import { createFolderByPath } from './lib/createFolder';

/** 后端服务端口，默认11122 */
const PORT = 11122;

/**
 * 存储所有用户的文件资料的位置；目录结构为 BASE_DIR/username/repoName/;
 * 这里将资料库根目录直接设置为项目根目录方便开发测试
 */
const BASE_DIR = globalSettings.repoRootAbsolutePath;
/** 缓存目录 */
const TEMP_FOLDER = globalSettings.repoRootAbsolutePath + '-caches';

if (!existsSync(path.resolve(BASE_DIR))) {
  mkdirSync(path.resolve(BASE_DIR));
}
if (!existsSync(path.resolve(TEMP_FOLDER))) {
  mkdirSync(path.resolve(TEMP_FOLDER));
}
// 创建admin用户对应的用户根目录，用于测试
if (!existsSync(path.resolve(BASE_DIR, 'admin'))) {
  mkdirSync(path.resolve(BASE_DIR, 'admin'));
}
if (!existsSync(path.resolve(BASE_DIR, 'adminBak'))) {
  mkdirSync(path.resolve(BASE_DIR, 'adminBak'));
}
// 创建admin用户的ak资料库，用于测试
if (!existsSync(path.resolve(BASE_DIR, 'admin/ak'))) {
  mkdirSync(path.resolve(BASE_DIR, 'admin/ak'));
}

// 上传文件缓存
const upload = multer({ dest: TEMP_FOLDER });

// 创建数据库连接
let db;

// 创建服务器
const app = express();

// 配置跨域
app.use(
  cors({
    origin: true,
    // origin: '*',
    credentials: true,
    maxAge: 86400,
  }),
);

app.use(express.static('../dist'));

// 绑定数据库文件
app.use(async (req, rex, next) => {
  if (!db) {
    db = await sqliteOpen({
      filename: './materials.db',
      driver: sqlite3.Database,
    });
  }
  next();
});
// todo 将本地admin目录的直接子文件夹作为资料库插入数据库

// 解码URL
app.use((req, res, next) => {
  req.url = decodeURIComponent(req.url);
  next();
});

// 配置json解析
app.use(express.json({ limit: '5mb' }));
// 解析表单
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('abcdefg12345'));
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 },
  }),
);
// 生成session
app.use((req: any, res, next) => {
  if (!req.session.views) {
    req.session.views = {};
  }
  next();
});

// 打印请求url信息
app.use((req, res, next) => {
  console.log('\n');
  console.log('----------------------------------------------------------');
  console.log(`请求基于 ${req.method} 方法: ${req.url}`);
  next();
});

// 从cookie中获取登录对象信息
app.use(async (req: any, res, next) => {
  // console.log(';;从cookie中获取已登录对象信息');
  // console.log(';;从req.cookies, ', req.cookies);
  console.log(';;从req.signedCookies, ', req.signedCookies);
  // 从签名cookie中找出该用户的信息并挂在req对象上以供后续的中间件访问
  if (req.signedCookies.id) {
    req.user = await db.get(
      'SELECT * FROM mtl_user WHERE id = ?',
      req.signedCookies.id,
    );
  }
  next();
});

// 根据登录对象获取对应的rootFolder, recoverFolder的绝对路径,并添加到req对象上方便后续访问
app.use(async (req: any, res, next) => {
  console.log(';;查询user-root目录和recoverFolder并添加到req ');
  if (req.user) {
    const userFolder = await db.get(
      'SELECT * FROM mtl_user_folder WHERE user_id = ?',
      req.user.id,
    );
    req.rootFolder = path.resolve(BASE_DIR, userFolder['root_folder']);
    req.recoverFolder = path.resolve(BASE_DIR, userFolder['recover_folder']);
    console.log(';;查询并添加到req: user-rootFolder, ', req.rootFolder);
    // console.log(';; req.recoverFolder, ', req.recoverFolder);
  }
  next();
});

// 获取验证码
app.get('/security/captcha', (req: any, res) => {
  const captcha = svgCaptcha.create({
    noise: 3,
    background: '#ffffff',
  });
  // console.log(';;/captcha, ', JSON.stringify(captcha.text));
  req.session.captcha = captcha.text;
  res.type('svg');
  res.send(captcha.data);
});
// 响应验证码明文,用于调试
app.get('/security/captcha/str', (req: any, res) => {
  // console.log(';;/captcha/str, ', JSON.stringify(req.session.captcha));
  res.json({ code: 0, state: req.session.captcha });
});

// 判断是否能够自动登录
app.get('/account/login/auto', async (req: any, res, next) => {
  if (req.user) {
    res.json({ code: 0, state: req.user.username });
  } else {
    res.json({ code: -1, state: 'fail' });
  }
});

// 登录
// todo 暂时只支持用户名登录，支持邮箱登录待实现
app.post('/account/login', async (req: any, res, next) => {
  // console.log(
  //   ';;req.login.body, ',
  //   req.body,
  // );

  const user = await db.get(
    'SELECT * FROM mtl_user WHERE username = ? AND password = ?',
    req.body.username,
    req.body.password,
  );
  console.log(';;login-db-user, ', user);

  const userFolder = await db.get(
    'SELECT * FROM mtl_user_folder WHERE user_id = ?',
    user.id,
  );
  console.log(';;login-db-userFolder, ', userFolder);

  if (user) {
    // /若用户名通过验证，登录成功

    // todo 修改cookie内容
    res.cookie('id', user.id, {
      maxAge: 36000000,
      signed: true,
      httpOnly: false,
    });

    // console.log(';;login-cur-user, ', user);
    // console.log(';;cur-user, ', JSON.stringify(user));

    res.json({
      code: 0,
      state: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: ['admin'],
        token: `fake-jwt-token-${user.id}`,
      },
    });
  } else {
    res.json({
      code: -1,
      state: `用户名 ${req.body.username} 或密码 验证失败`,
    });
  }
});

// 登出
app.post('/account/logout', (req, res, next) => {
  res.clearCookie('id');
  res.json({ code: 0, state: '用户退出成功' });
});

// 检测用户名是否可用
app.get('/account/register/check', async (req, res, next) => {
  const username = req.query.username;

  if (username) {
    const data = await db.get(
      'SELECT * FROM users WHERE username = ?',
      username,
    );
    if (data) {
      res.json({ code: -1, state: `用户名 ${username} 重复` });
    } else {
      res.json({ code: 0, status: `用户名 ${username} 可用` });
    }
  }
});

// 注册的主要流程，检查重复用户名，查询maxId，插入用户数据，创建用户对应的根目录并保存到db
app.post('/account/register', async (req, res, next) => {
  const username = req.body.username;
  try {
    // 检查重复用户名
    if (username) {
      const data = await db.get(
        'SELECT * FROM mtl_user WHERE username = ?',
        username,
      );
      // console.log(';;register-user-check, ', data);
      if (data) {
        res.json({ code: -1, state: `用户名 ${username} 重复` });
        return;
      }
    }

    const maxUserId = await db.get(`select MAX(id) as maxId from mtl_user`);
    // console.log(';;maxUserId, ', JSON.stringify(maxUserId));
    const curUserId = maxUserId?.maxId ? maxUserId.maxId + 1 : 100;
    // todo 时间日期格式化支持timezone，默认都是 UTC 0
    const dateNow = new Date();

    // 插入用户数据到表
    await db.run(
      'INSERT INTO mtl_user(id,username,password,email,created_on) VALUES(?,?,?,?,?)',
      curUserId,
      req.body.username,
      req.body.password,
      req.body.email || '',
      dateNow.toISOString(),
    );

    // 生成用户名对应的rootFolder名称
    const rootFolder = dateNow.getTime().toString(32);
    const recoverFolder = dateNow.getTime().toString(16);
    const resolvedRootFolder = path.resolve(BASE_DIR, rootFolder);
    const resolvedRecoverFolder = path.resolve(BASE_DIR, recoverFolder);
    // 创建文件夹
    await createFolderByPath(resolvedRootFolder);
    await createFolderByPath(resolvedRecoverFolder);

    const maxFolderId = await db.get(
      `select MAX(id) as maxId from mtl_user_folder`,
    );
    // console.log(';;maxFolderId, ', maxFolderId);

    // 将用户目录写入数据库
    // todo 设置默认权限为user，而不是admin
    await db.run(
      'INSERT INTO mtl_user_folder(id,user_id,root_folder,recover_folder,created_on) VALUES(?,?,?,?,?)',
      maxFolderId?.maxId ? maxFolderId.maxId + 1 : 100,
      curUserId,
      rootFolder,
      recoverFolder,
      dateNow.toISOString(),
    );

    res.cookie('id', curUserId, {
      maxAge: 36000000,
      signed: true,
      httpOnly: false,
    });

    // register成功的返回值和login成功的返回值相同，方便注册后直接登录用户
    res.json({
      code: 0,
      state: {
        id: curUserId,
        username,
        email: req.body.email,
        roles: ['admin'],
        token: `fake-jwt-token-${curUserId}`,
      },
    });
  } catch (e) {
    console.log('注册服务执行失败', e);
    res.json({ code: -1, state: '注册失败' });
  }
});

// 拦截未登录请求
app.use((req: any, res, next) => {
  if (req.user && req.rootFolder && req.recoverFolder) {
    next();
  } else {
    console.log(';;拦截未登录请求-req');
    // console.log(';;req.user, ', req.user);
    // console.log(';;req.rootFolder, ', req.rootFolder);
    res.json({ code: -1, state: { errMsg: '拦截未登录请求' } });
  }
});

// console.log(';;repo/all');

app.post(`/materials/repo/data`, getCurrentFolder);
app.post(`/materials/file/contents`, getCurrentFileByPost);
app.post(`/materials/file/add`, createFile);
app.post(`/materials/file/upload`, upload.single('file'), uploadFile);
app.post(`/materials/file/submit`, submitFileContents);
app.post(`/materials/file/copy`, copyFile);
app.post(`/materials/file/download`, downloadFile);
app.post(`/materials/file/recover`, recoverItem);
app.post(`/materials/folder/add`, createFolder);
app.post(`/materials/folder/recover`, getRecoverFolder);
app.post(`/materials/item/delete`, deleteItem);
app.post(`/materials/item/rename`, renameItem);

app.use('/src', getCurrentFileByGet);

// 捕获错误请求
app.use((req, res, next) => {
  console.log('无效请求', req.url);
  res.json({
    code: -1,
    state: `无效请求: ${req.url}`,
  });
});

const httpServer = http.createServer(app);
const wsServer = new WebSocket.Server({ server: httpServer });

// 使用全局变量建立一个用户名与ws对象的映射,当前用户名执行了
wsServer.on('connection', (ws, req) => {
  const username = req.url.split('/').slice(-1)[0];
  console.log('WebSocket连接成功, 用户: ', username);
  wsToMap[username] = ws;
  ws.on('close', () => {
    console.log(username, '的webSocket断开连接');
    delete wsToMap[username];
  });
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    async () => await sendRootFolderSize(ws, req);
  } catch (e) {
    console.log(';;wss error: ', e);
  }
});

httpServer.listen(PORT, () => {
  console.log(`server is listening on port: ${PORT}`);
  // console.log(`dev frontend is : http:localhost:8999`);
});
