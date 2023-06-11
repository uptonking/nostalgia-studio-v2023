type AjaxOptions = {
  url: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
};

/** A simple wrapper for XHR. */
export function ajax(options: AjaxOptions): Promise<unknown> {
  const xhr = new XMLHttpRequest();
  let aborted = false;
  const result = new Promise((resolve, reject) => {
    // console.log(';; ajax-options ', options.method, options);

    xhr.open(options.method, options.url, true);
    xhr.addEventListener('load', () => {
      if (aborted) return;
      if (xhr.status < 400) {
        resolve(xhr.responseText);
      } else {
        // / 400、500
        let text = xhr.responseText;
        if (text && /html/.test(xhr.getResponseHeader('content-type')))
          text = makePlainDiv(text);
        const err = new Error(
          'Request failed: ' + xhr.statusText + (text ? '\n\n' + text : ''),
        );
        // @ts-expect-error custom-api
        err.status = xhr.status;
        reject(err);
      }
    });
    xhr.addEventListener('error', () => {
      if (!aborted) {
        // reject(new Error('Network error xhr'));
        // reject('Network error xhr');
        const err = new Error('Network error xhr');
        // @ts-expect-error custom-api
        err.status = 500;
        reject('Network error xhr');
      }
    });
    if (options.headers) {
      // eslint-disable-next-line guard-for-in
      for (const name in options.headers) {
        xhr.setRequestHeader(name, options.headers[name]);
      }
    }
    xhr.send(options.body || null);
  });
  // @ts-expect-error custom-api
  result.abort = () => {
    if (!aborted) {
      xhr.abort();
      aborted = true;
    }
  };
  return result;
}

function makePlainDiv(html: string) {
  const ele = document.createElement('div');
  ele.innerHTML = html;
  return ele.textContent.replace(/\n[^]*|\s+$/g, '');
}

const baseUrl = 'http://localhost:3001';

export function GET(url: string) {
  console.log('[GET]', baseUrl + url);
  return ajax({ url: baseUrl + url, method: 'GET' });
}

export function POST(url: string, body: string, type: string) {
  console.log('[POST]', baseUrl + url);
  return ajax({
    url: baseUrl + url,
    method: 'POST',
    body,
    headers: { 'Content-Type': type },
  });
}
