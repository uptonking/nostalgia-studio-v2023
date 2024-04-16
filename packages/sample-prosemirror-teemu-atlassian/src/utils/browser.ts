const result = {
  mac: false,
  ie: false,
  ie_version: 0,
  gecko: false,
  chrome: false,
  chrome_version: 0,
  android: false,
  ios: false,
  webkit: false,
};

if (typeof navigator !== 'undefined') {
  const ieEdge = /Edge\/(\d+)/.exec(navigator.userAgent);
  const ieUpTo10 = /MSIE \d/.test(navigator.userAgent);
  const ie11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(
    navigator.userAgent,
  );

  result.mac = /Mac/.test(navigator.platform);
  const ie = (result.ie = !!(ieUpTo10 || ie11up || ieEdge));
  result.ie_version = ieUpTo10
    ? (document as any).documentMode || 6
    : ie11up
      ? Number(ie11up[1])
      : ieEdge
        ? Number(ieEdge[1])
        : null;
  result.gecko = !ie && /gecko\/\d/i.test(navigator.userAgent);
  result.chrome = !ie && /Chrome\//.test(navigator.userAgent);
  result.chrome_version = parseInt(
    (navigator.userAgent.match(/Chrome\/(\d{2})/) || [])[1],
    10,
  );
  result.android = /Android \d/.test(navigator.userAgent);
  result.ios =
    !ie &&
    /AppleWebKit/.test(navigator.userAgent) &&
    /Mobile\/\w+/.test(navigator.userAgent);
  result.webkit =
    !ie &&
    !!document.documentElement &&
    'WebkitAppearance' in document.documentElement.style;
}

export const browser = result;

export function getUAPrefix() {
  if (browser.chrome) {
    return 'ua-chrome';
  } else if (browser.ie) {
    return 'ua-ie';
  } else if (browser.gecko) {
    return 'ua-firefox';
  }
  return '';
}
