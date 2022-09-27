/** A simple wrapper for XHR. */
export function req(conf: {
  url: string;
  method: string;
  body?: any;
  headers?: any;
}) {
  const req = new XMLHttpRequest();
  let aborted = false;
  const result = new Promise((success, failure) => {
    req.open(conf.method, conf.url, true);
    req.addEventListener('load', () => {
      if (aborted) return;
      if (req.status < 400) {
        success(req.responseText);
      } else {
        let text = req.responseText;
        if (text && /html/.test(req.getResponseHeader('content-type')))
          text = makePlain(text);
        const err = new Error(
          'Request failed: ' + req.statusText + (text ? '\n\n' + text : ''),
        );
        // @ts-expect-error custom-api
        err.status = req.status;
        failure(err);
      }
    });
    req.addEventListener('error', () => {
      if (!aborted) failure(new Error('Network error'));
    });
    if (conf.headers) {
      for (const header in conf.headers) {
        req.setRequestHeader(header, conf.headers[header]);
      }
    }
    req.send(conf.body || null);
  });
  // @ts-expect-error custom-api
  result.abort = () => {
    if (!aborted) {
      req.abort();
      aborted = true;
    }
  };
  return result;
}

function makePlain(html: string) {
  const elt = document.createElement('div');
  elt.innerHTML = html;
  return elt.textContent.replace(/\n[^]*|\s+$/g, '');
}

export function GET(url: string, baseUrl = 'http://localhost:3000') {
  console.log('[GET]', baseUrl + url);
  return req({ url: baseUrl + url, method: 'GET' });
}

export function POST(url: string, body: string, type: string) {
  return req({ url, method: 'POST', body, headers: { 'Content-Type': type } });
}
