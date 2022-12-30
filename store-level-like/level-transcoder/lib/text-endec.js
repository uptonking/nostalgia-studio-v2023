/** @type {{ textEncoder: TextEncoder, textDecoder: TextDecoder }|null} */
let lazy = null;

/**
 * Get semi-global instances of TextEncoder and TextDecoder.
 * @returns {{ textEncoder: TextEncoder, textDecoder: TextDecoder }}
 */
export default function () {
  if (lazy === null) {
    lazy = {
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder(),
    };
  }

  return lazy;
}
