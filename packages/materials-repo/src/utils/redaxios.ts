// copied from https://github.com/developit/redaxios/blob/master/src/index.js
// v0.4.1__202102
// redaxios provides the axios API in 800 bytes, using native fetch()
// Licensed under the Apache License, Version 2.0 (the "License");

export type Method =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK';

export type ResponseType =
  | 'json'
  | 'text'
  | 'stream'
  | 'arraybuffer'
  | 'blob'
  | 'document';

export type Headers = { [key: string]: string };

export type Options = {
  /** the URL/api to request/ajax */
  url?: string;
  /** HTTP method, case-insensitive */
  method?: Method;
  /** Request headers */
  headers?: Headers;
  /** a body, optionally encoded, to send */
  body?: FormData | string | object;
  /** An encoding to use for the response */
  responseType?: ResponseType;
  data?: any;
  /** querystring parameters */
  params?: Record<string, any> | URLSearchParams;
  /** custom function to stringify querystring parameters */
  paramsSerializer?: (params: Options['params']) => string;
  /** Controls what browsers do with credentials (cookies, HTTP auth entries, and TLS client certificates).
   * Must be one of: same-origin | include | omit
   */
  withCredentials?: boolean;
  /** The mode you want to use for the request */
  mode?: 'cors' | 'no-cors' | 'same-origin';
  /** Authorization header value to send with the request */
  auth?: string;
  /** Pass an XSRF prevention cookie value as a header defined by `xsrfHeaderName` */
  xsrfCookieName?: string;
  /** The name of a header to use for passing XSRF cookies */
  xsrfHeaderName?: string;
  /** Override status code handling (default: 200-399 is a success) */
  validateStatus?: (status: number) => boolean;
  /** An array of transformations to apply to the outgoing request */
  transformRequest?: Array<(body: any, headers: Headers) => any>;
  /** a base URL from which to resolve all URLs */
  baseURL?: string;
  /** Custom window.fetch implementation */
  fetch?: typeof window.fetch;
};

export type Response<T = any> = {
  status: number;
  statusText: string;
  /** the request configuration */
  config: Options;
  /** the decoded response body */
  data: T;
  headers: Headers;
  redirect: boolean;
  url: string;
  type: ResponseType;
  body: ReadableStream<Uint8Array> | null;
  bodyUsed: boolean;
};

type BodylessMethod<T = any> = (
  url: string,
  config?: Options,
) => Promise<Response<T>>;
type BodyMethod<T = any> = (
  url: string,
  body?: any,
  config?: Options,
) => Promise<Response<T>>;

/** axios factory method */
function create(defaults?: Options | {}) {
  defaults = defaults || {};

  /**
   * Issues a request.
   * redaxios provides the axios API in 800 bytes, using native fetch()
   * @param url url to fetch/ajax
   * @param config common config options for fetch
   * @param _method fetch method
   * @param _data data that put in fetch request body，若是对象，则会被序列化stringify
   * @returns promise
   */
  function redaxios<T>(
    url: string | Options,
    config?: Options,
    _method?: any,
    _data?: any,
  ): Promise<Response<T>> {
    if (typeof url !== 'string') {
      config = url;
      url = config.url;
    }

    // const response: Response<any> = { config };
    const response = { config } as Response<any>;

    const options = deepMerge(defaults, config) as Options;

    const customHeaders: Headers = {};

    let data = _data || options.data;

    (options.transformRequest || []).forEach((f) => {
      data = f(data, options.headers) || data;
    });

    if (data && typeof data === 'object' && typeof data.append !== 'function') {
      data = JSON.stringify(data);
      customHeaders['content-type'] = 'application/json';
    }

    const m =
      typeof document !== 'undefined' &&
      document.cookie.match(
        RegExp('(^|; )' + options.xsrfCookieName + '=([^;]*)'),
      );
    if (m) customHeaders[options.xsrfHeaderName] = m[2];

    if (options.auth) {
      customHeaders.authorization = options.auth;
    }

    if (options.baseURL) {
      url = url.replace(/^(?!.*\/\/)\/?(.*)$/, options.baseURL + '/$1');
    }

    if (options.params) {
      const divider = url.indexOf('?') !== -1 ? '&' : '?';
      const query = options.paramsSerializer
        ? options.paramsSerializer(options.params)
        : new URLSearchParams(options.params);
      url += divider + query;
    }

    /** 默认使用 window.fetch；没有显式指定window是为了支持polyfill */
    // const fetchFunc = options.fetch || window.fetch;
    const fetchFunc: typeof fetch = options.fetch || fetch;

    const fetchConfig: any = {
      method: _method || options.method || 'GET',
      body: data, // body data type must match "Content-Type" in headers
      mode: options.mode || 'cors',
      credentials: options.withCredentials ? 'include' : 'same-origin', // 默认same-origin
      headers: deepMerge(options.headers, customHeaders, true),
    };
    // console.log(';;fetchConfig, ', fetchConfig)

    // 都标注出了默认值
    return fetchFunc(url, fetchConfig).then((res) => {
      for (const i in res) {
        if (typeof res[i] !== 'function') response[i] = res[i];
      }

      const ok = options.validateStatus
        ? options.validateStatus(res.status)
        : res.ok;

      if (options.responseType === 'stream') {
        response.data = res.body;
        return response;
      }

      return res[options.responseType || 'text']()
        .then((data) => {
          response.data = data;
          // its okay if this fails: response.data will be the unparsed value:
          response.data = JSON.parse(data);
        })
        .catch(Object)
        .then(() => (ok ? response : Promise.reject(response)));
    });
  }

  redaxios.request = redaxios as
    | (<T = any>(config?: Options) => Promise<Response<T>>)
    | (<T = any>(url: string, config?: Options) => Promise<Response<T>>);

  redaxios.get = ((url, config) =>
    redaxios(url, config, 'get')) as BodylessMethod;
  redaxios.delete = ((url, config) =>
    redaxios(url, config, 'delete')) as BodylessMethod;
  redaxios.head = ((url, config) =>
    redaxios(url, config, 'head')) as BodylessMethod;
  redaxios.options = ((url, config) =>
    redaxios(url, config, 'options')) as BodylessMethod;

  redaxios.post = ((url, data, config) =>
    redaxios(url, config, 'post', data)) as BodyMethod;
  redaxios.put = ((url, data, config) =>
    redaxios(url, config, 'put', data)) as BodyMethod;
  redaxios.patch = ((url, data, config) =>
    redaxios(url, config, 'patch', data)) as BodyMethod;

  redaxios.all = Promise.all.bind(Promise);

  // redaxios.spread = function <Args, R>(
  //   fn: (...args: Args[]) => R,
  // ): (array: Args[]) => R {
  //   return function (results) {
  //     return fn.apply(this, results);
  //   };
  // };
  // 3b smaller:
  redaxios.spread = (fn) => fn.apply.bind(fn, fn);

  function deepMerge(
    opts: Record<string, any>,
    overrides: Record<string, any>,
    lowerCase?: boolean,
  ): Partial<typeof opts> {
    const out = {};
    let i;
    if (Array.isArray(opts)) {
      return opts.concat(overrides);
    }
    for (i in opts) {
      const key = lowerCase ? i.toLowerCase() : i;
      out[key] = opts[i];
    }
    for (i in overrides) {
      const key = lowerCase ? i.toLowerCase() : i;
      const value = /** @type {any} */ overrides[i];
      out[key] =
        key in out && typeof value === 'object'
          ? deepMerge(out[key], value, key === 'headers')
          : value;
    }
    return out;
  }

  redaxios.CancelToken =
    typeof AbortController === 'function' ? AbortController : Object;

  redaxios.defaults = defaults as Options;

  redaxios.create = create;

  return redaxios;
}

/** redaxios provides the axios API in 800 bytes, using native fetch() */
export const redaxios = create();

export default redaxios;
