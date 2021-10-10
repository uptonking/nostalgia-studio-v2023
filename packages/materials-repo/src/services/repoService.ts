import { SERVER_BASE_URL } from './../common/constants';
import axios from '../utils/redaxios';
import { getRelativePathFromRepoPathname } from '../utils/repo-files-link-utils';

// 使用get请求
export function axiosGet(path) {
  return axios.get(path).then((res) => res.data);
}

// 使用post请求
export async function axiosPost(path, data) {
  const res = await axios.post(path, { ...data }, { withCredentials: true });
  return res.data;
}

/** 基于post，请求path文件夹下的所有直接子文件和子目录 */
export async function listItemsForPath({ repoName, requestPath }) {
  // console.log(';;ajax-refresh-args, ', repoName, reqPath);

  const res = await axios.post(
    `${SERVER_BASE_URL}/materials/repo/data`,
    { repoName, requestPath },
    { withCredentials: true },
  );

  return res.data;
}

// 文件提交
export async function submitFileContents({
  repoName,
  relativePath,
  newContent,
}: {
  repoName: string;
  relativePath: string;
  newContent: string;
}) {
  const res = await axios.post(
    `${SERVER_BASE_URL}/materials/file/submit`,
    {
      repoName,
      relativePath,
      newContent,
    },
    { withCredentials: true },
  );

  return res.data;
}

/** 文件删除数组 */
export async function deleteFiles({ repoName, files }) {
  const res = await axios.post(
    `${SERVER_BASE_URL}/materials/item/delete`,
    { repoName, files },
    { withCredentials: true },
  );
  return res.data;
}

/** 重命名文件或文件夹 */
export async function renameFile({ repoName, relativePath, oldName, newName }) {
  const res = await axios.post(
    `${SERVER_BASE_URL}/materials/item/rename`,
    { repoName, relativePath, oldName, newName },
    { withCredentials: true },
  );
  return res.data;
}

/** ajax创建新文件 */
export async function addFile({ repoName, relativePath, fileName }) {
  const res = await axios.post(
    `${SERVER_BASE_URL}/materials/file/add`,
    {
      repoName,
      relativePath,
      fileName,
    },
    { withCredentials: true },
  );
  return res.data;
}

// 文件移到回收站
export function moveFile(shortName, srcRelativePath) {
  return axios
    .post(
      `/materials/file/recover`,
      { shortName, srcRelativePath },
      { withCredentials: true },
    )
    .then((res) => res.data);
}

// 文件下载
export async function downloadFile({ repoName, relativePath, fileName }) {
  // const a = document.createElement('a');
  // a.href = `/src/${relativePath}`;
  // a.setAttribute('download', fileName);
  // a.style.display = 'none';
  // document.body.append(a);
  // a.click();
  // a.remove();

  const res = await axios.post(
    `${SERVER_BASE_URL}/materials/file/download`,
    {
      repoName,
      relativePath,
      fileName,
    },
    {
      withCredentials: true,
      responseType: 'blob',
    },
  );
  return res;

  // return axios({
  //   url: "/download",
  //   method: "post",
  //   data: { relativePath, fileName },
  //   responseType: "blob",
  // }).then((res) => {
  //   if (res.status === 200) {
  //     const url = window.URL.createObjectURL(new Blob([res.data]));
  //     const link = document.createElement("a");
  //     link.style.display = "none";
  //     link.href = url;
  //     link.setAttribute("download", fileName);
  //     document.body.append(link);
  //     link.click();
  //     URL.revokeObjectURL(link.href);
  //     link.remove();
  //   }
  // });
}

/** 基于post，上传文件 */
export async function uploadFile(progress: HTMLElement, formData: FormData) {
  const config: any = {
    // headers: { 'Content-Type': 'multipart/form-data' }, // 不能配置此项，会异常
    withCredentials: true,
    onUploadProgress: function (e) {
      // 属性lengthComputable主要表明总共需要完成的工作量和已经完成的工作是否可以被测量；
      // 如果lengthComputable为false，就获取不到e.total和e.loaded
      if (e.lengthComputable) {
        const rate = e.loaded / e.total; // 已上传的比例
        progress.style.backgroundImage = `linear-gradient(to right, rgba(9, 170, 255, .5) ${(
          rate * 100
        ).toFixed(2)}%, white 0, white 100%)`;
      }
    },
  };
  const res = await axios.post(
    `${SERVER_BASE_URL}/materials/file/upload`,
    formData,
    config,
  );
  return res.data;
}

// 文件复制
export function copyFile(fileName, srcRelativePath, targetRelativePath) {
  return axios
    .post(`${SERVER_BASE_URL}/materials/file/copy`, {
      fileName,
      srcRelativePath,
      targetRelativePath,
    })
    .then((res) => res.data);
}

/** 基于post，创建文件夹 */
export async function addDir({
  repoName,
  relativePath,
  folderName,
}: {
  repoName: string;
  relativePath: string;
  folderName: string;
}) {
  const res = await axios.post(
    `${SERVER_BASE_URL}/materials/folder/add`,
    {
      repoName,
      relativePath,
      folderName,
    },
    { withCredentials: true },
  );
  return res.data;
}

/** 等待time时间之后执行func，不可在time时间内再次触发执行 */
export function low(func, time) {
  let flag = true;
  return function (this: any, ...args) {
    if (flag) {
      flag = false;
      setTimeout(() => {
        flag = true;
      }, time);
      return func.call(this, ...args);
    } else {
      return Promise.reject();
    }
  };
}

/** 等待time时间之后执行func，可在time时间内再次触发执行 */
export function delay(func, time) {
  let id;
  return function (this: any, ...args) {
    clearTimeout(id);
    id = setTimeout(() => {
      func.call(this, ...args);
    }, time);
  };
}
